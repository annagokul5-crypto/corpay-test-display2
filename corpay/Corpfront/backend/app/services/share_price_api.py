import httpx
from typing import Optional, Dict, Any
from datetime import datetime
from app.config import settings
from app.utils.cache import get, set
import logging
from bs4 import BeautifulSoup
import re

logger = logging.getLogger(__name__)


class SharePriceService:
    """Service for fetching share price from Corpay investor website via web scraping"""
    
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
        
        # Web scrape from Corpay investor website
        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
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
                
                # Parse HTML with BeautifulSoup
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find the stock price - look for the highlighted price value
                # Based on the website structure, the price is typically in a prominent display
                price = None
                change_percentage = None
                
                # Try multiple selectors to find the price
                # Look for common patterns: $347.89 or similar price formats
                price_pattern = re.compile(r'\$?([\d,]+\.?\d*)')
                percentage_pattern = re.compile(r'([+-]?\d+\.?\d*)\s*%')
                
                # Method 1: Look for text containing dollar sign followed by numbers
                price_elements = soup.find_all(string=re.compile(r'\$\d+\.?\d*'))
                for elem in price_elements:
                    # Get the parent element to see context
                    parent = elem.parent if elem.parent else None
                    if parent:
                        text = parent.get_text()
                        # Look for price in format $XXX.XX
                        match = re.search(r'\$([\d,]+\.?\d*)', text)
                        if match:
                            price_str = match.group(1).replace(',', '')
                            try:
                                price = float(price_str)
                                # Look for percentage change nearby
                                pct_match = re.search(r'([+-]?\d+\.?\d*)\s*%', text)
                                if pct_match:
                                    change_percentage = float(pct_match.group(1))
                                break
                            except ValueError:
                                continue
                
                # Method 2: Look for specific classes or IDs that might contain stock data
                if price is None:
                    # Try finding elements with common stock-related classes
                    stock_containers = soup.find_all(['div', 'span', 'p'], class_=re.compile(r'price|stock|share|quote', re.I))
                    for container in stock_containers:
                        text = container.get_text()
                        # Look for price pattern
                        price_match = re.search(r'\$([\d,]+\.?\d*)', text)
                        if price_match:
                            try:
                                price = float(price_match.group(1).replace(',', ''))
                                # Look for percentage in same container
                                pct_match = re.search(r'([+-]?\d+\.?\d*)\s*%', text)
                                if pct_match:
                                    change_percentage = float(pct_match.group(1))
                                if price > 100:  # Reasonable stock price range
                                    break
                            except ValueError:
                                continue
                
                # Method 3: Search entire page text for price patterns
                if price is None:
                    page_text = soup.get_text()
                    # Find all price-like patterns
                    price_matches = re.findall(r'\$([\d,]+\.?\d*)', page_text)
                    for price_str in price_matches:
                        try:
                            candidate_price = float(price_str.replace(',', ''))
                            # Filter for reasonable stock prices (between $50 and $1000)
                            if 50 <= candidate_price <= 1000:
                                price = candidate_price
                                # Find percentage near this price
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
                    # If pct not found nearby, search whole page for first percentage token
                    if change_percentage is None:
                        pct_all = re.search(percentage_pattern, soup.get_text())
                        if pct_all:
                            try:
                                change_percentage = float(pct_all.group(1))
                            except ValueError:
                                change_percentage = None

                    if change_percentage is None:
                        change_percentage = 0.0
                    
                    result = {
                        "price": price,
                        "change_percentage": change_percentage,
                        "api_source": "web_scrape"
                    }
                    
                    # Cache for 2 minutes (120 seconds) to allow frequent updates
                    if use_cache:
                        set(cache_key, result, ttl_seconds=120)
                    
                    logger.info(f"Successfully scraped share price: ${price}, change: {change_percentage}%")
                    return result
                else:
                    logger.warning("Could not find price in scraped HTML, using cached or mock data")
                    cached = get(cache_key)
                    if cached:
                        return cached
                    
        except httpx.TimeoutException:
            logger.warning("Share price web scrape timeout, using cached or mock data")
            cached = get(cache_key)
            if cached:
                return cached
        except Exception as e:
            logger.warning(f"Failed to scrape share price from website: {e}, using cached or mock data")
            cached = get(cache_key)
            if cached:
                return cached
        
        # Return mock data as fallback
        result = {
            "price": 347.89,
            "change_percentage": 1.57,
            "api_source": "mock"
        }
        
        # Cache mock data for 1 minute
        if use_cache:
            set(cache_key, result, ttl_seconds=60)
        
        return result

