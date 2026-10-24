import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  subtitle,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', icon: 'w-4 h-4', text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-base', sub: 'text-xs' },
    lg: { box: 'w-12 h-12', icon: 'w-7 h-7', text: 'text-xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', icon: 'w-9 h-9', text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* GrowUp Ascending Brand Symbol */}
      <div
        className={`${currentSize.box} rounded-xl bg-gradient-to-br from-[#0c2438] via-[#091b2c] to-[#04111d] border border-[#38bdf8]/40 flex items-center justify-center shadow-lg shadow-[#38bdf8]/15 relative group`}
      >
        {/* Subtle inner highlight */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />

        <svg
          className={`${currentSize.icon} text-[#38bdf8]`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="growUpGrad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="0.5" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#8ed5ff" />
            </linearGradient>
            <linearGradient id="barGrad" x1="0" y1="20" x2="0" y2="4" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1e293b" />
              <stop offset="1" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Stepped ascending pillars */}
          <rect x="3" y="14" width="3" height="7" rx="1" fill="#38bdf8" opacity="0.4" />
          <rect x="8.5" y="10" width="3" height="11" rx="1" fill="#38bdf8" opacity="0.7" />
          <rect x="14" y="6" width="3" height="15" rx="1" fill="#38bdf8" opacity="0.9" />

          {/* Dynamic upward surge arrow forming 'G' path */}
          <path
            d="M3 13L9 8L14.5 12L21 4"
            stroke="url(#growUpGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrow tip */}
          <path
            d="M17 4H21V8"
            stroke="url(#growUpGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Status glow dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10b981] ring-2 ring-[#051424]" />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col justify-center">
          <div className={`${currentSize.text} font-bold tracking-tight font-display flex items-center leading-none text-white`}>
            <span>Grow</span>
            <span className="text-[#38bdf8] font-black">Up</span>
          </div>
          <span className={`${currentSize.sub} text-[#94a3b8] font-medium leading-none block mt-1 tracking-tight font-display`}>
            {subtitle || 'Dashboard'}
          </span>
        </div>
      )}
    </div>
  );
};
