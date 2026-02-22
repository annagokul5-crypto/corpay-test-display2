import httpx
from typing import Optional, Dict, Any
from datetime import datetime
from app.config import settings
from app.utils.cache import get, set
import logging
from bs4 import BeautifulSoup
import re
from typing import Optional, Tuple
import os

logger = logging.getLogger(__name__)


class SharePriceService:
    """Service for fetching share price from Corpay investor website via web scraping"""

    @staticmethod
    def _fetch_from_nasdaq() -> Tuple[Optional[float], Optional[float]]:
        """
        Try a fast JSON source (Nasdaq) before scraping the investor site.
        """
        url = "https://api.nasdaq.com/api/quote/CPAY/info?assetclass=stocks"
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json, text/plain, */*",
            "Origin": "https://www.nasdaq.com",
            "Referer": "https://www.nasdaq.com/",
        }
        with httpx.Client(timeout=6.0, headers=headers, follow_redirects=True) as client:
            resp = client.get(url)
            resp.raise_for_status()
            data = resp.json()
            primary = data.get("data", {}).get("primaryData", {}) if isinstance(data, dict) else {}
            price_raw = primary.get("lastSalePrice") or primary.get("lastTrade")
            change_raw = primary.get("netChange")
            price = None
            change_pct = None
            if price_raw:
                try:
                    price = float(str(price_raw).replace("$", "").replace(",", ""))
                except ValueError:
                    price = None
            if change_raw:
                try:
                    change = float(str(change_raw).replace(",", ""))
                    if price and price != 0:
                        change_pct = round((change / price) * 100, 4)
                except ValueError:
                    change_pct = None
            return price, change_pct
    
    @staticmethod
    def _extract_price_and_pct_from_text(page_text: str) -> Tuple[Optional[float], Optional[float]]:
        price_pattern = re.compile(r"\$([\d,]+\.?\d*)")
        pct_pattern = re.compile(r"([+-]?\d+\.?\d*)\s*%")

        def _find_price_after(token: str) -> Optional[float]:
            idx = page_text.lower().find(token.lower())
            if idx == -1:
                return None
            m = price_pattern.search(page_text, idx)
            if m:
                try:
                    return float(m.group(1).replace(",", ""))
                except ValueError:
                    return None
            return None

        # Target the “NYSE: CPAY” block first
        for token in ["nyse: cpay", "nyse:cpay", "cpay"]:
            price = _find_price_after(token)
            if price:
                # Find first percent after the same token
                idx = page_text.lower().find(token.lower())
                pct_match = pct_pattern.search(page_text, idx if idx != -1 else 0)
                pct = None
                if pct_match:
                    try:
                        pct = float(pct_match.group(1))
                    except ValueError:
                        pct = None
                return price, pct

        # Fallback: first reasonable price in text (50-1000)
        for m in price_pattern.finditer(page_text):
            try:
                cand = float(m.group(1).replace(",", ""))
                if 50 <= cand <= 1000:
                    pct_match = pct_pattern.search(page_text, m.end())
                    pct = None
                    if pct_match:
                        try:
                            pct = float(pct_match.group(1))
                        except ValueError:
                            pct = None
                    return cand, pct
            except ValueError:
                continue

        return None, None

    @staticmethod
    async def get_share_price(use_cache: bool = True) -> Dict[str, Any]:
        """
        Fetch share price from https://investor.corpay.com/stock-information via web scraping
        Returns: {price: float, change_percentage: float, api_source: str}
        """
        cache_key = "share_price"
        
        # Check cache first (cache for 2 minutes to allow for frequent updates)
        if use_cache:
            cached = get(cache_key)
            if cached:
                return cached
        
        # 1) Fast JSON source (Nasdaq)
        try:
            price, pct = SharePriceService._fetch_from_nasdaq()
            if price is not None:
                result = {
                    "price": price,
                    "change_percentage": pct if pct is not None else 0.0,
                    "api_source": "nasdaq",
                }
                if use_cache:
                    set(cache_key, result, ttl_seconds=60)
                logger.info(f"Share price via Nasdaq: ${price}, change%={pct}")
                return result
        except Exception as e:
            logger.warning(f"Nasdaq share price fetch failed: {e}")

        # 2) Web scrape from Corpay investor website
        try:
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                }
                
                response = await client.get(
                    "https://investor.corpay.com/stock-information",
                    headers=headers
                )
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                page_text = soup.get_text(" ", strip=True)

                price = None
                change_percentage = None

                # Targeted extraction around “NYSE: CPAY”
                price, change_percentage = SharePriceService._extract_price_and_pct_from_text(page_text)

                # If still missing price, try DOM-based heuristics (existing methods)
                if price is None:
                    price_pattern = re.compile(r'\$?([\d,]+\.?\d*)')
                    percentage_pattern = re.compile(r'([+-]?\d+\.?\d*)\s*%')

                    price_elements = soup.find_all(string=re.compile(r'\$\d+\.?\d*'))
                    for elem in price_elements:
                        parent = elem.parent if elem.parent else None
                        if parent:
                            text = parent.get_text()
                            match = re.search(r'\$([\d,]+\.?\d*)', text)
                            if match:
                                price_str = match.group(1).replace(',', '')
                                try:
                                    price = float(price_str)
                                    pct_match = re.search(r'([+-]?\d+\.?\d*)\s*%', text)
                                    if pct_match:
                                        change_percentage = float(pct_match.group(1))
                                    break
                                except ValueError:
                                    continue

                if price is None:
                    stock_containers = soup.find_all(['div', 'span', 'p'], class_=re.compile(r'price|stock|share|quote', re.I))
                    for container in stock_containers:
                        text = container.get_text()
                        price_match = re.search(r'\$([\d,]+\.?\d*)', text)
                        if price_match:
                            try:
                                price = float(price_match.group(1).replace(',', ''))
                                pct_match = re.search(r'([+-]?\d+\.?\d*)\s*%', text)
                                if pct_match:
                                    change_percentage = float(pct_match.group(1))
                                if price > 100:
                                    break
                            except ValueError:
                                continue

                if price is None:
                    price_matches = re.findall(r'\$([\d,]+\.?\d*)', page_text)
                    for price_str in price_matches:
                        try:
                            candidate_price = float(price_str.replace(',', ''))
                            if 50 <= candidate_price <= 1000:
                                price = candidate_price
                                price_index = page_text.find(f'${price_str}')
                                if price_index >= 0:
                                    nearby_text = page_text[max(0, price_index-100):price_index+200]
                                    pct_match = re.search(r'([+-]?\d+\.?\d*)\s*%', nearby_text)
                                    if pct_match:
                                        change_percentage = float(pct_match.group(1))
                                break
                        except ValueError:
                            continue

                # If we found a price, return it
                if price is not None:
                    if change_percentage is None:
                        change_percentage = 0.0
                    
                    result = {
                        "price": price,
                        "change_percentage": change_percentage,
                        "api_source": "web_scrape"
                    }
                    
                    if use_cache:
                        set(cache_key, result, ttl_seconds=60)
                    
                    logger.info(f"Successfully scraped share price: ${price}, change: {change_percentage}%")
                    return result
                else:
                    logger.warning("Could not find price in scraped HTML, using cached value if available")
                    cached = get(cache_key)
                    if cached:
                        return cached
                    raise httpx.RequestError("share price unavailable after scrape")
                    
        except httpx.TimeoutException:
            logger.warning("Share price web scrape timeout, using cached value if available")
            cached = get(cache_key)
            if cached:
                return cached
            raise
        except Exception as e:
            logger.warning(f"Failed to scrape share price from website: {e}, using cached value if available")
            cached = get(cache_key)
            if cached:
                return cached
            raise
        
        # If we reach here, both sources failed and no cache existed
        raise httpx.RequestError("share price unavailable: no sources succeeded and no cache present")

