import React, { useState, useMemo, useEffect } from 'react';
import Palette from '../components/Palette';
import Canvas from '../components/Canvas';
import ScanResultsTable, { ScanResult } from '../components/ScanResultsTable';
import IndicatorModal from '../components/IndicatorModal';
import { createStrategy, runScan, getIndicators } from '../services/api';
import type { IndicatorMetadata } from '../services/api';

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
type ScanPhase = 'first_pass' | 'second_pass';

const StrategyBuilderPage: React.FC = () => {
  const [strategyName, setStrategyName] = useState('');
  const [variables, setVariables] = useState<Record<string, Variable>>({});
  const [scanPhase, setScanPhase] = useState<ScanPhase>('first_pass');
  const [rules, setRules] = useState<{ first_pass: Token[]; second_pass: Token[] }>({
    first_pass: [],
    second_pass: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorMetadata | null>(null);
  const [availableIndicators, setAvailableIndicators] = useState<IndicatorMetadata[]>([]);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [createdStrategyId, setCreatedStrategyId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [scanStatus, setScanStatus] = useState('');

  const clientId = useMemo(() => `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);
  const websocketUrl = `ws://localhost:8000/ws/v1/updates/${clientId}`;

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const indicators = await getIndicators();
        setAvailableIndicators(indicators);
      } catch (error) {
        console.error("Failed to fetch indicators:", error);
      }
    };
    fetchIndicators();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(websocketUrl);
    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received WebSocket message:", message);
      if (message.event === 'scan_result_found') {
        setScanResults(prev => [...prev, message.payload]);
      } else if (message.event === 'scan_status_update') {
        setScanStatus(`[${message.payload.status}] ${message.payload.message}`);
      }
    };
    ws.onerror = (e) => console.error("WebSocket Error:", e);
    ws.onclose = () => console.log("WebSocket disconnected");
    return () => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    };
  }, [websocketUrl]);

  const handleItemClick = (item: { type: Token['type']; label: string }) => {
    setRules(prev => ({
      ...prev,
      [scanPhase]: [...prev[scanPhase], { ...item, id: `${item.label}-${Date.now()}` }],
    }));
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

  const handleRemoveToken = (id: string, phase: ScanPhase) => {
    setRules(prev => ({
      ...prev,
      [phase]: prev[phase].filter(t => t.id !== id),
    }));
  };

  const handleTokenOrderChange = (newTokens: Token[], phase: ScanPhase) => {
    setRules(prev => ({
      ...prev,
      [phase]: newTokens,
    }));
  };

  const handleSaveStrategy = async () => {
    if (!strategyName) {
      setSaveStatus('Please enter a strategy name.');
      return;
    }

    setSaveStatus('Saving...');
    setScanStatus('');

    const formatTokensForBackend = (tokens: Token[]) => {
        return tokens.map(t => ({ type: t.type, value: t.label })).reduce((acc, t) => acc + t.value + " ", "").trim();
    }

    const strategyContent = {
      variables: Object.values(variables).map(v => ({ name: v.name, expression: v.expression, params: v.params })),
      first_pass_rules: formatTokensForBackend(rules.first_pass),
      second_pass_rules: formatTokensForBackend(rules.second_pass),
    };

    try {
      const payload = {
        name: strategyName,
        broker: 'upbit', // This should be dynamic later
        market: 'KRW',   // This should be dynamic later
        content: JSON.stringify(strategyContent),
      };
      const result = await createStrategy(payload);
      setCreatedStrategyId(result.id);
      setSaveStatus(`Strategy saved successfully (ID: ${result.id})`);
    } catch (error) {
      console.error("Failed to save strategy:", error);
      setSaveStatus('Failed to save strategy.');
    }
  };

  const handleRunScan = async () => {
    if (!createdStrategyId) {
      setScanStatus('Please save the strategy first.');
      return;
    }
    setScanStatus('Requesting scan...');
    setScanResults([]);
    try {
      const result = await runScan(createdStrategyId, clientId);
      setScanStatus(result.message);
    } catch (error) {
      console.error("Failed to start scan:", error);
      setScanStatus('Failed to start scan.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Strategy Builder</h1>

      <div style={{ margin: '20px 0', border: '1px solid #eee', padding: '10px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="text" value={strategyName} onChange={e => setStrategyName(e.target.value)} placeholder="Enter Strategy Name" style={{ padding: '8px' }} />
        <button onClick={handleSaveStrategy}>Save Strategy</button>
        <button onClick={handleRunScan} disabled={!createdStrategyId}>Run Scan</button>
        {saveStatus && <span style={{ color: saveStatus.startsWith('Failed') ? 'red' : 'green' }}>{saveStatus}</span>}
      </div>

      <Palette
        onItemClick={handleItemClick}
        onIndicatorSelect={handleIndicatorSelect}
        variables={Object.keys(variables)}
        isFirstPass={scanPhase === 'first_pass'}
        indicators={availableIndicators}
      />

      <div style={{ margin: '20px 0' }}>
        <button onClick={() => setScanPhase('first_pass')} disabled={scanPhase === 'first_pass'}>Edit 1st Pass Rules</button>
        <button onClick={() => setScanPhase('second_pass')} disabled={scanPhase === 'second_pass'}>Edit 2nd Pass Rules</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2 style={{ textTransform: 'capitalize' }}>{scanPhase.replace('_', ' ')} Canvas</h2>
        <Canvas
          tokens={rules[scanPhase]}
          onRemoveToken={(id) => handleRemoveToken(id, scanPhase)}
          onTokenOrderChange={(tokens) => handleTokenOrderChange(tokens, scanPhase)}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Scan Status & Results</h2>
        {scanStatus && <p>{scanStatus}</p>}
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
