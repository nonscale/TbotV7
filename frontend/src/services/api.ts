// src/services/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Indicator API ---
export interface IndicatorParam {
  [key: string]: string | number;
}

export interface IndicatorMetadata {
  name: string;
  function: string;
  params: IndicatorParam;
  outputs: string[];
}

export const getIndicators = async (): Promise<IndicatorMetadata[]> => {
  const response = await apiClient.get('/indicators/');
  return response.data;
};

// --- Strategy API ---
export interface StrategyPayload {
  name: string;
  broker: string;
  market: string;
  content: string; // JSON string
}

export const createStrategy = async (payload: StrategyPayload): Promise<{ id: number }> => {
  const response = await apiClient.post('/strategies/', payload);
  return response.data;
};

// --- Scan API ---
export const runScan = async (strategyId: number, clientId: string): Promise<{ message: string }> => {
  const response = await apiClient.post(`/scans/run-dynamic/${strategyId}`, { client_id: clientId });
  return response.data;
};
