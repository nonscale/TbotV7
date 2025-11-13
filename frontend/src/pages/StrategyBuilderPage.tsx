import React, { useState, useMemo, useEffect } from 'react';
import Palette from '../components/Palette';
import Canvas from '../components/Canvas';
import ScanResultsTable, { ScanResult } from '../components/ScanResultsTable';
import IndicatorModal from '../components/IndicatorModal';
import { createStrategy, runScan } from '../services/api';
import type { IndicatorMetadata } from '../services/api';

export interface Token { id: string; type: 'indicator' | 'operator' | 'value' | 'variable'; label: string; expression?: string; }
export interface Variable { name: string; expression: string; params: Record<string, any>; }
type ScanPhase = 'first_pass' | 'second_pass';

const StrategyBuilderPage: React.FC = () => {
  const [strategyName, setStrategyName] = useState('');
  const [variables, setVariables] = useState<Record<string, Variable>>({});
  const [scanPhase, setScanPhase] = useState<ScanPhase>('first_pass');
  const [rules, setRules] = useState<{ first_pass: Token[], second_pass: Token[] }>({
    first_pass: [],
    second_pass: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorMetadata | null>(null);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [createdStrategyId, setCreatedStrategyId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [scanStatus, setScanStatus] = useState('');

  const clientId = useMemo(() => `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);
  const websocketUrl = `ws://localhost:8000/ws/v1/updates/${clientId}`;

  useEffect(() => {
    const ws = new WebSocket(websocketUrl);
    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.event === 'scan_result_found') {
        setScanResults(prev => [...prev, message.payload]);
      }
    };
    ws.onerror = (e) => console.error("WebSocket Error:", e);
    ws.onclose = () => console.log("WebSocket disconnected");
    return () => ws.close();
  }, [websocketUrl]);

  const handleItemClick = (item: { type: Token['type']; label: string }) => {
    setRules(prev => ({ ...prev, [scanPhase]: [...prev[scanPhase], { ...item, id: `${item.label}-${Date.now()}` }] }));
  };
  const handleIndicatorSelect = (indicator: IndicatorMetadata) => {
    if (scanPhase === 'first_pass') { 
      alert("Indicators can only be used in the 2nd pass scan."); 
      return; 
    }
    setSelectedIndicator(indicator);
    setIsModalOpen(true);
  };
  const handleSaveVariable = (name: string, expression: string, params: Record<string, any>) => {
    setVariables(prev => ({ ...prev, [name]: { name, expression, params } }));
  };
  const handleRemoveToken = (id: string) => {
    setRules(prev => ({ ...prev, [scanPhase]: prev[scanPhase].filter(t => t.id !== id) }));
  };
  const handleTokenOrderChange = (newTokens: Token[]) => {
    setRules(prev => ({ ...prev, [scanPhase]: newTokens }));
  };

  const handleSaveStrategy = async () => {
    if (!strategyName) { setSaveStatus('Please enter a strategy name.'); return; }
    
    setSaveStatus('Saving...');
    setScanStatus('');
    setCreatedStrategyId(null);

    const strategyContent = {
      variables,
      first_pass: rules.first_pass,
      second_pass: rules.second_pass,
    };

    try {
      const payload = {
        name: strategyName,
        broker: 'dummy',
        market: 'crypto',
        content: JSON.stringify(strategyContent),
      };
      const result = await createStrategy(payload);
      setCreatedStrategyId(result.id);
      setSaveStatus(`Strategy saved successfully (ID: ${result.id})`);
    } catch (error) {
      setSaveStatus('Failed to save strategy.');
    }
  };

  const handleRunScan = async () => {
    if (!createdStrategyId) { setScanStatus('Please save the strategy first.'); return; }
    setScanStatus('Requesting scan...');
    setScanResults([]);
    try {
      const result = await runScan(createdStrategyId, clientId);
      setScanStatus(result.message);
    } catch (error) {
      setScanStatus('Failed to start scan.');
    }
  };

  return (
    <div>
      <h1>Strategy Builder</h1>
      
      <div style={{ margin: '20px 0', border: '1px solid #eee', padding: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input type="text" value={strategyName} onChange={e => setStrategyName(e.target.value)} placeholder="Enter Strategy Name" />
        <button onClick={handleSaveStrategy}>Save Strategy</button>
        <button onClick={handleRunScan} disabled={!createdStrategyId}>Run Scan</button>
        {saveStatus && <span>{saveStatus}</span>}
        {scanStatus && <span>{scanStatus}</span>}
      </div>

      <Palette onItemClick={handleItemClick} onIndicatorSelect={handleIndicatorSelect} variables={Object.keys(variables)} isFirstPass={scanPhase === 'first_pass'} />

      <div style={{ margin: '20px 0' }}>
        <button onClick={() => setScanPhase('first_pass')} disabled={scanPhase === 'first_pass'}>Edit 1st Pass Rules</button>
        <button onClick={() => setScanPhase('second_pass')} disabled={scanPhase === 'second_pass'}>Edit 2nd Pass Rules</button>
      </div>
      
      <h2 style={{ textTransform: 'capitalize' }}>{scanPhase.replace('_', ' ')} Canvas</h2>
      <Canvas tokens={rules[scanPhase]} onRemoveToken={handleRemoveToken} onTokenOrderChange={handleTokenOrderChange} />
      
      <ScanResultsTable results={scanResults} />
      <IndicatorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} indicator={selectedIndicator} onSave={handleSaveVariable} />
    </div>
  );
};

export default StrategyBuilderPage;