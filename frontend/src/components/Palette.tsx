import React, { useState, useEffect } from 'react';
import { getIndicators } from '../services/api';
import type { IndicatorMetadata } from '../services/api';
import type { Token } from '../pages/StrategyBuilderPage';

interface PaletteProps {
  onItemClick: (item: { type: Token['type']; label: string }) => void;
}

const Palette: React.FC<PaletteProps> = ({ onItemClick }) => {
  const [indicators, setIndicators] = useState<Record<string, IndicatorMetadata>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const data = await getIndicators();
        setIndicators(data);
      } catch (err) {
        setError('Failed to load indicators from the server.');
        console.error(err);
      }
    };

    fetchIndicators();
  }, []);

  const handleIndicatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndicator = e.target.value;
    if (selectedIndicator) {
      onItemClick({ type: 'indicator', label: selectedIndicator });
      e.target.value = ''; // Reset select
    }
  };

  const sectionStyle: React.CSSProperties = { border: '1px solid #ccc', padding: '10px', margin: '5px' };
  const buttonStyle: React.CSSProperties = { margin: '2px' };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '2px solid black', paddingBottom: '10px' }}>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div style={sectionStyle}>
        <strong>Indicators</strong>
        <select onChange={handleIndicatorChange}>
          <option value="">-- Select Indicator --</option>
          {Object.entries(indicators).map(([key, meta]) => (
            <option key={key} value={key}>{meta.name}</option>
          ))}
        </select>
      </div>

      <div style={sectionStyle}>
        <strong>Basic Data</strong>
        {['open', 'high', 'low', 'close', 'volume', 'amount'].map(item => (
          <button key={item} style={buttonStyle} onClick={() => onItemClick({ type: 'value', label: item })}>
            {item}
          </button>
        ))}
      </div>

      <div style={sectionStyle}>
        <strong>Operators</strong>
        {['+', '-', '*', '/', '>', '>=', '<', '<=', '==', '!=', 'AND', 'OR', '(', ')'].map(item => (
          <button key={item} style={buttonStyle} onClick={() => onItemClick({ type: 'operator', label: item })}>
            {item}
          </button>
        ))}
      </div>
       {/* Numbers, Variables, Functions sections will be added later */}
    </div>
  );
};

export default Palette;
