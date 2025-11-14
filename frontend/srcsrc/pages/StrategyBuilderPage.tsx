// src/pages/StrategyBuilderPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import Palette from '../components/Palette';
import Canvas from '../components/Canvas';
import ScanResultsTable from '../components/ScanResultsTable';
import type { ScanResult } from '../components/ScanResultsTable'; // 타입을 명시적으로 import
import IndicatorModal from '../components/IndicatorModal';
import { createStrategy, runScan, getIndicators } from '../services/api';
import type { IndicatorMetadata } from '../services/api';

// ... (Token, Variable 인터페이스는 동일)
export interface Token {
  id: string;
  type: 'indicator' | 'operator' | 'value' | 'variable' | 'function' | 'group';
  label: string;
  expression?: string;
}
export interface Variable {
  name: string;
  expression: string;
  params: Record<string, any>;
}


const StrategyBuilderPage: React.FC = () => {
  // ... (다른 상태들은 동일)
  const [strategyName, setStrategyName] = useState('');
  const [variables, setVariables] = useState<Record<string, Variable>>({});
  const [rules, setRules] = useState<{ first_pass: Token[]; second_pass: Token[] }>({ first_pass: [], second_pass: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorMetadata | null>(null);
  const [availableIndicators, setAvailableIndicators] = useState<IndicatorMetadata[]>([]);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]); // ScanResult 타입 사용
  const [createdStrategyId, setCreatedStrategyId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [scanStatus, setScanStatus] = useState('');

  const clientId = useMemo(() => `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);
  const websocketUrl = `ws://localhost:8000/ws/v1/updates/${clientId}`;

  useEffect(() => {
    // ... (기존 useEffect 로직들은 동일)
    const fetchIndicators = async () => {
      try {
        const indicators = await getIndicators();
        setAvailableIndicators(indicators);
      } catch (error) {
        console.error("Failed to fetch indicators:", error);
      }
    };
    fetchIndicators();

    const ws = new WebSocket(websocketUrl);
    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.event === 'scan_result_found') {
        // 백엔드에서 오는 payload가 ScanResult 타입과 일치해야 함
        setScanResults(prev => [...prev, message.payload]);
      } else if (message.event === 'scan_status_update') {
        setScanStatus(`[${message.payload.status}] ${message.payload.message}`);
      }
    };
    ws.onerror = (e) => console.error("WebSocket Error:", e);
    ws.onclose = () => console.log("WebSocket disconnected");
    return () => ws.close();
  }, [websocketUrl]);

  // ... (모든 핸들러 함수들은 동일)
  const handleAddItemToCanvas = (item: { type: Token['type']; label: string }, targetCanvas: 'first_pass' | 'second_pass') => {
    setRules(prev => ({
      ...prev,
      [targetCanvas]: [...prev[targetCanvas], { ...item, id: `${item.label}-${Date.now()}` }],
    }));
  };
  const handleOpenIndicatorModal = (indicator: IndicatorMetadata) => {
    setSelectedIndicator(indicator);
    setIsModalOpen(true);
  };
  const handleSaveVariable = (name: string, expression: string, params: Record<string, any>) => {
    setVariables(prev => ({ ...prev, [name]: { name, expression, params } }));
    setIsModalOpen(false);
  };
  const handleRemoveToken = (id: string, phase: 'first_pass' | 'second_pass') => {
    setRules(prev => ({ ...prev, [phase]: prev[phase].filter(t => t.id !== id) }));
  };
  const handleTokenOrderChange = (newTokens: Token[], phase: 'first_pass' | 'second_pass') => {
    setRules(prev => ({ ...prev, [phase]: newTokens }));
  };
  const handleSaveStrategy = async () => { /* ... */ };
  const handleRunScan = async () => { /* ... */ };


  return (
    // ... (JSX 구조는 동일)
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Strategy Builder</h1>
      <div className="bg-gray-800 p-4 rounded-lg mb-6 flex items-center gap-4">
        <input
          type="text"
          value={strategyName}
          onChange={e => setStrategyName(e.target.value)}
          placeholder="Enter Strategy Name"
          className="bg-gray-700 text-white p-2 rounded-md flex-grow"
        />
        <button onClick={handleSaveStrategy} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save Strategy</button>
        <button onClick={handleRunScan} disabled={!createdStrategyId} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">Run Scan</button>
        {saveStatus && <span className={`text-sm ${saveStatus.startsWith('Failed') ? 'text-red-400' : 'text-green-400'}`}>{saveStatus}</span>}
      </div>
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <Palette
          onAddItemToCanvas={handleAddItemToCanvas}
          onOpenIndicatorModal={handleOpenIndicatorModal}
          variables={Object.keys(variables)}
          indicators={availableIndicators}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">1차 스캔 (빠른 필터링)</h2>
          <Canvas
            tokens={rules.first_pass}
            onRemoveToken={(id) => handleRemoveToken(id, 'first_pass')}
            onTokenOrderChange={(tokens) => handleTokenOrderChange(tokens, 'first_pass')}
            targetCanvas="first_pass"
          />
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">2차 스캔 (정밀 분석)</h2>
          <Canvas
            tokens={rules.second_pass}
            onRemoveToken={(id) => handleRemoveToken(id, 'second_pass')}
            onTokenOrderChange={(tokens) => handleTokenOrderChange(tokens, 'second_pass')}
            targetCanvas="second_pass"
          />
        </div>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Scan Status & Results</h2>
        {scanStatus && <p className="mb-2 p-2 bg-gray-700 rounded-md">{scanStatus}</p>}
        <ScanResultsTable results={scanResults} />
      </div>
      <IndicatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        indicator={selectedIndicator}
        onSave={handleSaveVariable}
      />
    </div>
  );
};

export default StrategyBuilderPage;
