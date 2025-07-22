import React from 'react';

interface MicFFTProps {
  fft: number[];
  className?: string;
}

export default function MicFFT({ fft, className }: MicFFTProps) {
  return (
    <div className={`flex items-center justify-center h-full ${className || ''}`}>
      <div className="flex items-end gap-1 h-6">
        {fft?.slice(0, 20).map((value, index) => (
          <div
            key={index}
            className="bg-current opacity-70"
            style={{
              width: '2px',
              height: `${Math.max(2, value * 24)}px`,
              transition: 'height 0.1s ease',
            }}
          />
        )) || (
          // Fallback when no FFT data
          Array.from({ length: 20 }).map((_, index) => (
            <div
              key={index}
              className="bg-current opacity-30"
              style={{
                width: '2px',
                height: '2px',
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
