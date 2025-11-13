import React, { useState, useEffect } from 'react';
import { getIndicators } from '../services/api';
import type { IndicatorMetadata } from '../services/api';
import type { Token } from '../pages/StrategyBuilderPage';

interface PaletteProps {
  onItemClick: (item: { type: Token['type']; label: string }) => void;
  onIndicatorSelect: (indicator: IndicatorMetadata) => void;
  variables: string[];
  isFirstPass: boolean; // 1차 스캔 모드 여부
}

const Palette: React.FC<PaletteProps> = ({ onItemClick, onIndicatorSelect, variables, isFirstPass }) => {
  const [indicators, setIndicators] = useState<Record<string, IndicatorMetadata>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const data = await getIndicators();
        setIndicators(data);
      } catch (err) {
        setError('Failed to load indicators.');
      }
    };
    fetchIndicators();
  }, []);

  const handleIndicatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;
    if (selectedKey && indicators[selectedKey]) {
      onIndicatorSelect(indicators[selectedKey]);
      e.target.value = '';
    }
  };

  const sectionStyle: React.CSSProperties = { border: '1px solid #ccc', padding: '10px', margin: '5px' };
  const buttonStyle: React.CSSProperties = { margin: '2px' };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '2px solid black', paddingBottom: '10px' }}>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div style={sectionStyle}>
        <strong>Indicators</strong>
        <select onChange={handleIndicatorChange} disabled={isFirstPass} title={isFirstPass ? "Indicators are only available in the 2nd pass scan" : ""}>
          <option value="">-- Select Indicator --</option>
          {Object.entries(indicators).map(([key, meta]) => (
            <option key={key} value={key}>{meta.name}</option>
          ))}
        </select>
        {isFirstPass && <p style={{fontSize: '12px', color: '#888', margin: 0}}>2차 스캔에서 사용 가능</p>}
      </div>

      <div style={sectionStyle}>
        <strong>Variables</strong>
        {variables.map(varName => (
          <button key={varName} style={buttonStyle} onClick={() => onItemClick({ type: 'variable', label: varName })} >
            {varName}
          </button>
        ))}
        {variables.length === 0 && <span style={{color: '#888'}}>No variables defined.</span>}
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
    </div>
  );
};

export default Palette;
