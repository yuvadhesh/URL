import React from 'react';

const GlassCard = ({ children, className = '', glow = false, style = {} }) => {
  return (
    <div 
      className={`glass-panel ${glow ? 'glass-panel-glow pulse-border' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default GlassCard;
