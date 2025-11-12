import axios from 'axios';
import type { Token } from '../pages/StrategyBuilderPage';

// 백엔드 API 서버의 기본 URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

// 기본 URL이 설정된 axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// API 응답 형식에 맞춘 타입 정의
export interface IndicatorParam {
  type: string;
  default: any;
  description: string;
}

export interface IndicatorMetadata {
  name: string;
  params: Record<string, IndicatorParam>;
  output_columns: string[];
  description: string;
}

export interface IndicatorsResponse {
  [key: string]: IndicatorMetadata;
}

// 전략 생성을 위한 요청 데이터 타입
export interface StrategyCreatePayload {
  name: string;
  broker: string;
  market: string;
  content: string; // JSON string of tokens
}

// 전략 정보 API 응답 타입
export interface StrategyResponse {
  id: number;
  name: string;
  broker: string;
  market: string;
  content: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// 스캔 실행 API 응답 타입
export interface ScanRunResponse {
  message: string;
  strategy_id: number;
}


/**
 * 백엔드 API에서 사용 가능한 모든 보조지표의 메타데이터를 가져옵니다.
 */
export const getIndicators = async (): Promise<IndicatorsResponse> => {
  try {
    const response = await apiClient.get<IndicatorsResponse>('/indicators/');
    return response.data;
  } catch (error) {
    console.error("Error fetching indicators:", error);
    throw error;
  }
};

/**
 * 새로운 트레이딩 전략을 생성합니다.
 */
export const createStrategy = async (payload: StrategyCreatePayload): Promise<StrategyResponse> => {
  try {
    const response = await apiClient.post<StrategyResponse>('/strategies/', payload);
    return response.data;
  } catch (error) {
    console.error("Error creating strategy:", error);
    throw error;
  }
};

/**
 * 특정 전략에 대한 스캔을 시작합니다.
 */
export const runScan = async (strategyId: number, clientId: string): Promise<ScanRunResponse> => {
  try {
    // client_id를 쿼리 파라미터로 추가합니다.
    const response = await apiClient.post<ScanRunResponse>(`/scans/run/${strategyId}`, null, {
      params: { client_id: clientId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error running scan for strategy ${strategyId}:`, error);
    throw error;
  }
};
