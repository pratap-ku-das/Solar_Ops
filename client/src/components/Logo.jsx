export default function Logo({ size = "medium", showText = true }) {
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-10 w-10",
    large: "h-16 w-16"
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-2xl"
  };

  return (
    <div className="flex items-center gap-2">
      <svg
        className={`${sizeClasses[size]} fill-current text-amber-600`}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sun circle */}
        <circle cx="50" cy="30" r="15" fill="#f59e0b" />
        
        {/* Sun rays */}
        <line x1="50" y1="5" x2="50" y2="10" stroke="#f59e0b" strokeWidth="2" />
        <line x1="50" y1="50" x2="50" y2="55" stroke="#f59e0b" strokeWidth="2" />
        <line x1="25" y1="30" x2="20" y2="30" stroke="#f59e0b" strokeWidth="2" />
        <line x1="75" y1="30" x2="80" y2="30" stroke="#f59e0b" strokeWidth="2" />
        <line x1="32" y1="17" x2="28" y2="13" stroke="#f59e0b" strokeWidth="2" />
        <line x1="72" y1="47" x2="76" y2="51" stroke="#f59e0b" strokeWidth="2" />
        <line x1="68" y1="17" x2="72" y2="13" stroke="#f59e0b" strokeWidth="2" />
        <line x1="28" y1="47" x2="24" y2="51" stroke="#f59e0b" strokeWidth="2" />

        {/* Solar panels */}
        <rect x="15" y="50" width="25" height="35" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2" />
        <rect x="60" y="50" width="25" height="35" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2" />
        
        {/* Panel grid lines */}
        <line x1="15" y1="62" x2="40" y2="62" stroke="#f59e0b" strokeWidth="1" />
        <line x1="15" y1="74" x2="40" y2="74" stroke="#f59e0b" strokeWidth="1" />
        <line x1="27" y1="50" x2="27" y2="85" stroke="#f59e0b" strokeWidth="1" />

        <line x1="60" y1="62" x2="85" y2="62" stroke="#f59e0b" strokeWidth="1" />
        <line x1="60" y1="74" x2="85" y2="74" stroke="#f59e0b" strokeWidth="1" />
        <line x1="72" y1="50" x2="72" y2="85" stroke="#f59e0b" strokeWidth="1" />
      </svg>

      {showText && (
        <div>
          <p className={`${textSizeClasses[size]} font-bold text-slate-900`}>
            Solar
          </p>
          <p className="text-xs font-medium text-slate-600">
            Energy
          </p>
        </div>
      )}
    </div>
  );
}
