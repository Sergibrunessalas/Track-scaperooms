interface StatsBarProps {
  total: number;
}

export default function StatsBar({ total }: StatsBarProps) {
  return (
    <div className="flex-shrink-0 bg-white border-b border-gray-200 px-5 py-2 flex items-center gap-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-3xl font-black font-montserrat text-gray-900 leading-none">{total}</span>
        <div>
          <p className="text-xs font-semibold text-gray-700 leading-tight">Total</p>
          <p className="text-xs text-gray-500 leading-tight">Escape Rooms</p>
        </div>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 border-2 border-white shadow-sm"
            style={{
              background: '#e8490a',
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
            }}
          />
          <span>Valorat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 border-2 border-white shadow-sm"
            style={{
              background: '#dc2626',
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
            }}
          />
          <span>Pendent</span>
        </div>
      </div>
    </div>
  );
}
