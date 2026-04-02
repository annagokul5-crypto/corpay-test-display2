interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changePositive?: boolean;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, change, changePositive = true, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col p-4">
      <p className="mb-3" style={{ fontWeight: 700, color: '#3D1628', fontSize: 'clamp(10px, 1.4vh, 18px)' }}>{title}</p>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <p style={{ color: '#981239', fontWeight: 700, fontSize: 'clamp(16px, 2.5vh, 36px)', lineHeight: '1', marginBottom: '8px' }}>{value}</p>
        {change && (
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: changePositive ? '#0085C2' : '#BE1549' }}>
              <span style={{ color: '#FFFFFF', fontSize: '10px' }}>{changePositive ? '↑' : '↓'}</span>
            </div>
            <span style={{ color: '#3D1628', fontSize: 'clamp(8px, 1vh, 12px)', fontWeight: 600 }}>
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}