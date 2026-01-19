
import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean; // If true, optimizes colors for dark backgrounds
}

const Logo: React.FC<LogoProps> = ({ className = "w-24 h-24", light = false }) => {
  // Theme colors based on the provided branding
  const inkColor = light ? "#FFFFFF" : "#000000";
  const goldColor = "#A89F81"; // The beige/gold from the logo image

  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Top Cornice Bar (Wide) */}
      <rect x="40" y="45" width="120" height="10" fill={inkColor} />
      
      {/* Secondary Bar (Slightly narrower) */}
      <rect x="40" y="60" width="120" height="8" fill={inkColor} />
      
      {/* The Three Pillars forming the Shield Shape */}
      {/* Left Pillar */}
      <path 
        d="M52 75H72V125L52 110V75Z" 
        fill={inkColor} 
      />
      
      {/* Center Pillar (The Point) */}
      <path 
        d="M90 75H110V145L100 155L90 145V75Z" 
        fill={inkColor} 
      />
      
      {/* Right Pillar */}
      <path 
        d="M128 75H148V110L128 125V75Z" 
        fill={inkColor} 
      />

      {/* Curved Text Path Definition */}
      <defs>
        <path id="textCurve" d="M 30,130 Q 100,200 170,130" />
      </defs>

      {/* Brand Text */}
      <text width="200" fill={goldColor}>
        <textPath 
          xlinkHref="#textCurve" 
          startOffset="50%" 
          textAnchor="middle" 
          className="font-bold tracking-[0.2em] uppercase"
          style={{ fontSize: '24px', fontFamily: '"Playfair Display", serif', fontWeight: 900 }}
        >
          Mi Manifesto
        </textPath>
      </text>
    </svg>
  );
};

export default Logo;
