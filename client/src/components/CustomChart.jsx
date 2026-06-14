import React from 'react';

// Subcomponent: Daily Click Trend (Line/Area SVG Chart)
export const TrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
        No click activity recorded in this period.
      </div>
    );
  }

  // Ensure we have at least 2 points to draw a line. If only 1, duplicate it or add a baseline
  const chartData = [...data];
  if (chartData.length === 1) {
    chartData.unshift({ date: 'Start', clicks: 0 });
  }

  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = Math.max(...chartData.map((d) => d.clicks), 5); // default min height is 5 clicks scale
  const pointsCount = chartData.length;

  const getX = (index) => {
    return paddingX + (index * (width - paddingX * 2)) / (pointsCount - 1);
  };

  const getY = (value) => {
    return height - paddingY - (value * (height - paddingY * 2)) / maxVal;
  };

  // Generate path points
  const points = chartData.map((d, i) => `${getX(i)},${getY(d.clicks)}`).join(' ');
  
  // Path for the line
  const linePath = `M ${points}`;
  
  // Path for the filled gradient area under the line
  const areaPath = `${linePath} L ${getX(pointsCount - 1)},${height - paddingY} L ${getX(0)},${height - paddingY} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '400px', display: 'block' }}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4facfe" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines (horizontal) */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const yVal = height - paddingY - ratio * (height - paddingY * 2);
          const gridLabel = Math.round(ratio * maxVal);
          return (
            <g key={index}>
              <line 
                x1={paddingX} 
                y1={yVal} 
                x2={width - paddingX} 
                y2={yVal} 
                stroke="rgba(255,255,255,0.06)" 
                strokeDasharray="4 4"
              />
              <text 
                x={paddingX - 10} 
                y={yVal + 4} 
                fill="var(--color-text-secondary)" 
                fontSize="10" 
                textAnchor="end"
              >
                {gridLabel}
              </text>
            </g>
          );
        })}

        {/* Gradient Area */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Spark Line */}
        <path 
          d={linePath} 
          fill="none" 
          stroke="url(#chartGradientLine)" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          style={{ stroke: 'var(--color-secondary)' }}
        />

        {/* Data Circles / Points */}
        {chartData.map((d, i) => (
          <g key={i}>
            <circle 
              cx={getX(i)} 
              cy={getY(d.clicks)} 
              r="4" 
              fill="#070a13" 
              stroke="var(--color-secondary)" 
              strokeWidth="2" 
            />
            {/* Tooltip value */}
            <text 
              x={getX(i)} 
              y={getY(d.clicks) - 8} 
              fill="white" 
              fontSize="10" 
              fontWeight="bold" 
              textAnchor="middle"
            >
              {d.clicks}
            </text>
          </g>
        ))}

        {/* X Axis Date Labels */}
        {chartData.map((d, i) => {
          // Format Date to short string e.g. "Jun 13"
          let label = d.date;
          if (d.date && d.date !== 'Start') {
            const dateObj = new Date(d.date);
            if (!isNaN(dateObj.getTime())) {
              label = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }
          }
          return (
            <text 
              key={i} 
              x={getX(i)} 
              y={height - 10} 
              fill="var(--color-text-secondary)" 
              fontSize="9" 
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// Subcomponent: Distribution List (Device / Browser Breakdown)
export const DistributionList = ({ title, data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{ textAlign: 'left', width: '100%' }}>
      <h3 style={{ fontSize: '1rem', color: 'white', marginBottom: '1.2rem', fontWeight: 600 }}>{title}</h3>
      {(!data || data.length === 0 || total === 0) ? (
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1rem 0' }}>
          No analytics data.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {data.map((item, index) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            // Palette of beautiful gradient accents
            const accentColors = [
              'var(--color-secondary)',
              'var(--color-violet)',
              'var(--color-primary)',
              'var(--color-success)',
              'var(--color-warning)'
            ];
            const color = accentColors[index % accentColors.length];

            return (
              <div key={index} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'white' }}>{item.label}</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {item.value} click{item.value !== 1 ? 's' : ''} ({pct}%)
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  width: '100%'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    borderRadius: '10px',
                    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
