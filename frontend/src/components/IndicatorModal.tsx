import React, { useState, useEffect } from 'react';
import type { IndicatorMetadata, IndicatorParam } from '../services/api';

interface IndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicator: IndicatorMetadata | null;
  onSave: (variableName: string, expression: string, params: Record<string, any>) => void;
}

const IndicatorModal: React.FC<IndicatorModalProps> = ({ isOpen, onClose, indicator, onSave }) => {
  const [variableName, setVariableName] = useState('');
  const [params, setParams] = useState<Record<string, any>>({});

  useEffect(() => {
    // 모달이 열리고 새로운 지표가 선택되면, 파라미터 상태를 기본값으로 초기화합니다.
    if (indicator) {
      const defaultParams = Object.entries(indicator.params).reduce((acc, [key, paramInfo]) => {
        acc[key] = paramInfo.default;
        return acc;
      }, {} as Record<string, any>);
      setParams(defaultParams);
      // 변수 이름도 기본 형식으로 제안합니다 (예: sma_20)
      const paramValues = Object.values(defaultParams).join('_');
      setVariableName(`${indicator.name.toLowerCase()}_${paramValues}`);
    }
  }, [indicator]);

  if (!isOpen || !indicator) {
    return null;
  }

  const handleParamChange = (paramName: string, value: string) => {
    // TODO: 입력값 타입 검증 (예: 숫자인지)
    setParams(prev => ({ ...prev, [paramName]: value }));
  };

  const handleSaveClick = () => {
    // 예: "SMA(close, 20)" 같은 표현식 생성
    const paramString = Object.values(params).join(', ');
    const expression = `${indicator.name}(${paramString})`; // 단순화된 표현식
    onSave(variableName, expression, params);
    onClose();
  };

  const modalStyle: React.CSSProperties = {
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    backgroundColor: 'white', padding: '20px', zIndex: 1000,
    border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  };
  const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <h2>{indicator.name} 설정</h2>
        <p>{indicator.description}</p>

        <div>
          <label>변수 이름:</label>
          <input
            type="text"
            value={variableName}
            onChange={(e) => setVariableName(e.target.value)}
          />
        </div>

        {Object.entries(indicator.params).map(([paramName, paramInfo]) => (
          <div key={paramName}>
            <label>{paramName} ({paramInfo.description}):</label>
            <input
              type="text" // TODO: paramInfo.type에 따라 number 등으로 변경
              value={params[paramName] || ''}
              onChange={(e) => handleParamChange(paramName, e.target.value)}
            />
          </div>
        ))}

        <button onClick={handleSaveClick}>변수로 저장</button>
        <button onClick={onClose}>취소</button>
      </div>
    </>
  );
};

export default IndicatorModal;
