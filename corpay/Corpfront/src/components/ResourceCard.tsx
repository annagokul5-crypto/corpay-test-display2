import { FileText, BookOpen } from 'lucide-react';

interface ResourceCardProps {
  title: string;
  description: string;
  type: 'case-study' | 'whitepaper';
  /** External URL to the official resource page; when set, card links here (opens in new tab). */
  url?: string;
  /** When url is not set, card navigates to /resources/${resourceId} (internal route). */
  resourceId?: number | string | null;
}

export function ResourceCard({ title, description, type, resourceId, url }: ResourceCardProps) {
  const Icon = type === 'case-study' ? FileText : BookOpen;
  const bgColor = type === 'case-study' ? '#3D1628' : '#981239';

  const content = (
    <>
      <div className="p-2 rounded shrink-0" style={{ backgroundColor: bgColor + '20' }}>
        <Icon className="w-4 h-4" style={{ color: bgColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium mb-1 line-clamp-2 leading-snug" style={{ color: '#3D1628', fontSize: 'clamp(9px, 1.2vh, 14px)' }}>{title}</p>
        {description ? (
          <p className="line-clamp-2 leading-relaxed" style={{ color: '#6b7280', fontSize: 'clamp(8px, 1vh, 12px)' }}>{description}</p>
        ) : null}
      </div>
    </>
  );

  const className = "flex items-start gap-3 p-2 bg-gray-50/60 rounded-lg cursor-pointer hover:bg-gray-100/80 transition-colors duration-150";

  // Prefer official external URL when available so the resource opens on its real page
  const externalUrl = (url && String(url).trim()) || undefined;
  if (externalUrl) {
    return (
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={{ cursor: 'pointer', textDecoration: 'none' }}
      >
        {content}
      </a>
    );
  }

  if (resourceId != null && resourceId !== '') {
    return (
      <a
        href={`/resources/${resourceId}`}
        className={className}
        style={{ cursor: 'pointer', textDecoration: 'none' }}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={className} style={{ cursor: 'pointer' }}>
      {content}
    </div>
  );
}