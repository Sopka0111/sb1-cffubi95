import React from 'react';
import { Bus } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2">
        <Bus 
          size={18} 
          className="text-amber-400" 
          strokeWidth={2.5}
        />
        <span 
          className="font-semibold text-sm bg-gradient-to-r from-[#8A2BE2] via-[#007BFF] to-[#008080] bg-clip-text text-transparent"
          style={{
            backgroundSize: '200% auto',
            animation: 'gradient 3s linear infinite'
          }}
        >
          TransAuditor
        </span>
      </div>
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% center }
            100% { background-position: 200% center }
          }
        `}
      </style>
    </div>
  );
}