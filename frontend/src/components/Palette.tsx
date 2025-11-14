// src/components/Palette.tsx
import React, { useState } from 'react';
import type { IndicatorMetadata } from '../services/api';
import type { Token } from '../pages/StrategyBuilderPage';

interface PaletteProps {
  onAddItemToCanvas: (item: { type: Token['type']; label: string }, targetCanvas: 'first_pass' | 'second_pass') => void;
  onOpenIndicatorModal: (indicator: IndicatorMetadata) => void;
  variables: string[];
  indicators: IndicatorMetadata[];
}

const PaletteButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string, title?: string }> = ({ onClick, children, className = '', title }) => (
  <button onClick={onClick} title={title} className={`bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-3 rounded-md text-sm transition-colors ${className}`}>
    {children}
  </button>
);

const PaletteSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-4">
    <h3 className="text-lg font-bold text-gray-300 mb-2">{title}</h3>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);


const Palette: React.FC<PaletteProps> = ({ onAddItemToCanvas, onOpenIndicatorModal, variables, indicators }) => {
  const [targetCanvas, setTargetCanvas] = useState<'first_pass' | 'second_pass'>('first_pass');

  const handleAddItem = (type: Token['type'], label: string) => {
    onAddItemToCanvas({ type, label }, targetCanvas);
  };

  return (
    <div className="w-full">
      {/* --- 캔버스 선택 토글 --- */}
      <div className="flex items-center justify-center bg-gray-700 rounded-lg p-1 mb-4">
        <button
          onClick={() => setTargetCanvas('first_pass')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${targetCanvas === 'first_pass' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
        >
          1차 캔버스에 추가
        </button>
        <button
          onClick={() => setTargetCanvas('second_pass')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${targetCanvas === 'second_pass' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
        >
          2차 캔버스에 추가
        </button>
      </div>

      {/* --- 팔레트 섹션 --- */}
      <PaletteSection title="지표 (Indicators)">
        <p className="text-xs text-gray-400 w-full mb-2">지표를 클릭하여 새 변수를 생성하세요. 변수는 'Variables' 목록에 추가됩니다.</p>
        {indicators.map((meta) => (
          <PaletteButton key={meta.name} onClick={() => onOpenIndicatorModal(meta)} title={`Params: ${Object.keys(meta.params).join(', ')}`}>
            {meta.name}
          </PaletteButton>
        ))}
      </PaletteSection>

      <PaletteSection title="변수 (Variables)">
        {variables.map(varName => (
          <PaletteButton key={varName} onClick={() => handleAddItem('variable', varName)}>
            {varName}
          </PaletteButton>
        ))}
        {variables.length === 0 && <span className="text-sm text-gray-500">생성된 변수가 없습니다.</span>}
      </PaletteSection>

      <PaletteSection title="기본 데이터 (Basic Data)">
        {['open', 'high', 'low', 'close', 'volume', 'amount'].map(item => (
          <PaletteButton key={item} onClick={() => handleAddItem('value', item)}>{item}</PaletteButton>
        ))}
      </PaletteSection>

      <PaletteSection title="연산자 (Operators)">
        {['+', '-', '*', '/', '>', '>=', '<', '<=', '==', '!=', 'AND', 'OR', '(', ')'].map(item => (
          <PaletteButton key={item} onClick={() => handleAddItem('operator', item)}>{item}</PaletteButton>
        ))}
      </PaletteSection>
    </div>
  );
};

export default Palette;
