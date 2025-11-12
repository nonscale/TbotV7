import axios from 'axios';

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

/**
 * 백엔드 API에서 사용 가능한 모든 보조지표의 메타데이터를 가져옵니다.
 */
export const getIndicators = async (): Promise<IndicatorsResponse> => {
  try {
    const response = await apiClient.get<IndicatorsResponse>('/indicators/');
    return response.data;
  } catch (error) {
    console.error("Error fetching indicators:", error);
    // 실제 애플리케이션에서는 더 정교한 에러 처리가 필요합니다.
    throw error;
  }
};
