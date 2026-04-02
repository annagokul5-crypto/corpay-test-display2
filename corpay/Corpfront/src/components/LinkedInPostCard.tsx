import { Linkedin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const CORPAY_LINKEDIN_POSTS_URL = 'https://www.linkedin.com/company/corpay/posts/';

interface LinkedInPostCardProps {
  author: string;
  timeAgo: string;
  content: string;
  image?: string;
  likes?: number;
  comments?: number;
  isCorpayBrand?: boolean;
  /** When set, clicking the card opens this LinkedIn post URL; otherwise opens Corpay company posts page */
  postUrl?: string | null;
}

export function LinkedInPostCard({ author, timeAgo, content, image, likes = 0, comments = 0, isCorpayBrand = false, postUrl }: LinkedInPostCardProps) {
  const href = (postUrl && (postUrl.startsWith('http://') || postUrl.startsWith('https://'))) ? postUrl : CORPAY_LINKEDIN_POSTS_URL;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow-sm border border-gray-100 mb-4 flex-shrink-0 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#981239] focus-visible:ring-offset-2"
    >
      {/* Header */}
      <div className="p-3 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ 
            background: isCorpayBrand 
              ? 'linear-gradient(135deg, #981239 0%, #BE1549 100%)' 
              : 'linear-gradient(135deg, #0085C2 0%, #006ba1 100%)'
          }}>
            <Linkedin className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ color: '#3D1628', fontWeight: 600, fontSize: 'clamp(9px, 1.2vh, 14px)' }}>{author}</p>
            <p style={{ color: '#999', fontSize: 'clamp(8px, 1vh, 12px)' }}>{timeAgo}</p>
          </div>
        </div>
        
        <p className="leading-relaxed whitespace-pre-line line-clamp-2" style={{ color: '#3D1628', fontSize: 'clamp(9px, 1.1vh, 14px)' }}>
          {content}
        </p>
      </div>
      
      {/* Image */}
      {image && (
        <div className="relative overflow-hidden">
          <ImageWithFallback 
            src={image} 
            alt="LinkedIn post image"
            className="w-full h-32 object-cover"
          />
        </div>
      )}
    </a>
  );
}