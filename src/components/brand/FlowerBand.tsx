import React from 'react';

interface FlowerBandProps {
  className?: string;
  height?: number;
}

export const FlowerBand: React.FC<FlowerBandProps> = ({ className = '', height = 6 }) => {
  return (
    <div
      style={{ height: `${height}px` }}
      className={`w-full relative overflow-hidden bg-gradient-to-r from-[#005993] via-[#7ED3F7] to-[#D71249] ${className}`}
      role="presentation"
    >
      {/* Decorative floral bloom overlay ribbon */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      <div className="absolute top-0 right-1/4 w-32 h-full bg-white/20 skew-x-12 blur-xs" />
    </div>
  );
};

export default FlowerBand;
