import React from 'react';
import { ChevronRight } from 'lucide-react';

interface CompanyAnnouncementProps {
  title: string;
  description: string;
  date: string;
  backgroundColor: string;
  /** When provided, the whole card is clickable and opens this URL in a new tab. */
  link?: string;
  /** Optional Corpay accent: left border */
  accentBorder?: boolean;
  /** Left border color when accentBorder (default #981239) */
  accentColor?: string;
}

export function CompanyAnnouncement({ title, description, date, backgroundColor, link, accentBorder, accentColor = '#981239' }: CompanyAnnouncementProps) {
  const displayDate = (date || '').trim();
  const content = (
    <>
      <p style={{ fontWeight: 500, color: '#981239', fontSize: 'clamp(8px, 1vh, 12px)', marginBottom: '6px', opacity: 0.95 }}>
        {displayDate || '—'}
      </p>
      <div className="flex items-start justify-between gap-3 mb-2">
        <p style={{ fontWeight: 600, color: '#3D1628', fontSize: 'clamp(9px, 1.2vh, 14px)' }} className="flex-1 min-w-0">{title}</p>
        <ChevronRight
          className="w-5 h-5 shrink-0 mt-0.5 opacity-80"
          style={{ color: '#981239' }}
          aria-hidden
        />
      </div>
      {description ? (
        <p style={{ fontWeight: 400, color: '#3D1628', fontSize: 'clamp(8px, 1.1vh, 13px)', lineHeight: 1.4 }} className="line-clamp-2">{description}</p>
      ) : null}
    </>
  );

  const cardStyle: React.CSSProperties = {
    backgroundColor,
    boxShadow: '0 2px 8px rgba(152, 18, 57, 0.06)',
    ...(accentBorder ? { borderLeft: `3px solid ${accentColor}` } : {}),
  };

  const cardClassName = 'px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 flex flex-col hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#981239]';

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClassName}
        style={cardStyle}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={cardClassName} style={cardStyle}>
      {content}
    </div>
  );
}