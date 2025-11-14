// src/components/IndicatorModal.tsx
import React, { useState, useEffect } from 'react';
import type { IndicatorMetadata } from '../services/api';

interface IndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicator: IndicatorMetadata | null;
  onSave: (name: string, expression: string, params: Record<string, any>) => void;
}

const IndicatorModal: React.FC<IndicatorModalProps> = ({ isOpen, onClose, indicator, onSave }) => {
  const [params, setParams] = useState<Record<string, any>>({});
  const [variableName, setVariableName] = useState('');
  const [source, setSource] = useState('close'); // 기본 소스 'close'

  useEffect(() => {
    // 모달이 열리거나 대상 지표가 변경될 때 파라미터와 변수 이름 초기화
    if (indicator) {
      const initialParams: Record<string, any> = {};
      Object.entries(indicator.params).forEach(([key, value]) => {
        initialParams[key] = value; // 기본값으로 설정
      });
      setParams(initialParams);
      // 추천 변수 이름 생성 (예: trix(12) -> trix_12)
      const paramValues = Object.values(initialParams).join('_');
      setVariableName(`${indicator.name.toLowerCase()}_${paramValues}`);
    } else {
      setParams({});
      setVariableName('');
    }
  }, [indicator]);

  if (!isOpen || !indicator) {
    return null;
  }

  const handleParamChange = (key: string, value: string) => {
    const isNumeric = !isNaN(parseFloat(value));
    setParams(prev => ({ ...prev, [key]: isNumeric ? parseFloat(value) : value }));
  };

  const handleSave = () => {
    if (!variableName.trim()) {
      alert('Variable name is required.');
      return;
    }
    // 예시 표현식: trix(source='close', period=12)
    const paramString = Object.entries(params).map(([k, v]) => `${k}=${v}`).join(', ');
    const expression = `${indicator.name.toLowerCase()}(source='${source}', ${paramString})`;

    const finalParams = { source, ...params };
    onSave(variableName.trim(), expression, finalParams);
  };

  const defaultSources = ['close', 'open', 'high', 'low', 'volume', 'amount'];

  return (
    // 배경 오버레이
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      {/* 모달 컨텐츠 */}
      <div className="bg-gray-800 text-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">지표 설정: {indicator.name}</h2>

        {/* 소스 선택 */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-bold mb-2">소스 (Source)</label>
          <select value={source} onChange={(e) => setSource(e.target.value)} className="bg-gray-700 p-2 rounded-md w-full">
            {defaultSources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* 동적 파라미터 */}
        {Object.keys(indicator.params).map(key => (
          <div key={key} className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2">{key}</label>
            <input
              type="number"
              value={params[key] || ''}
              onChange={(e) => handleParamChange(key, e.target.value)}
              className="bg-gray-700 p-2 rounded-md w-full"
            />
          </div>
        ))}

        {/* 변수 이름 입력 */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm font-bold mb-2">변수 이름 (Variable Name)</label>
          <input
            type="text"
            value={variableName}
            onChange={(e) => setVariableName(e.target.value)}
            className="bg-gray-700 p-2 rounded-md w-full"
            placeholder="예: my_trix_var"
          />
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">
            취소
          </button>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Save as Variable
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndicatorModal;
