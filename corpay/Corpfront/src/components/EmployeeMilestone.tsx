import { ImageWithFallback } from './figma/ImageWithFallback';

interface EmployeeMilestoneProps {
  name: string;
  description: string;
  avatar: string;
  borderColor: string;
  backgroundColor: string;
  emoji?: string;
}

export function EmployeeMilestone({ name, description, avatar, borderColor, backgroundColor, emoji = '🎉' }: EmployeeMilestoneProps) {
  return (
    <div 
      className="flex items-center gap-4 py-3 pr-3 pl-4 rounded-xl relative overflow-hidden"
      style={{ 
        borderLeft: `5px solid ${borderColor}`,
        backgroundColor: backgroundColor,
        boxShadow: '0px 3px 12px rgba(0,0,0,0.06)'
      }}
    >
      
      <div className="relative">
        <ImageWithFallback 
          src={avatar} 
          alt={name}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md"
        />
        {/* Badge indicator */}
        <div 
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white"
          style={{ backgroundColor: borderColor }}
        />
      </div>
      
      <div className="flex-1">
        <p style={{ fontWeight: 700, color: '#3D1628', fontSize: 'clamp(10px, 1.3vh, 15px)', marginBottom: '2px' }}>{name}</p>
        <p style={{ fontWeight: 500, color: '#4a4a4a', fontSize: 'clamp(9px, 1.1vh, 13px)' }}>{description}</p>
      </div>
      
      {/* Category emoji */}
      <div className="opacity-90">
        <span style={{ color: borderColor, fontSize: 'clamp(14px, 1.8vh, 22px)' }}>{emoji}</span>
      </div>
    </div>
  );
}