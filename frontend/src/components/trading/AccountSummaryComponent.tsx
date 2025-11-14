// src/components/trading/AccountSummaryComponent.tsx
import React, { useState, useEffect } from 'react';

// API 응답 데이터 타입 정의
interface AccountSummaryData {
  total_investment: number;
  total_assets: number;
  total_profit_loss: number;
  unrealized_profit_loss: number;
  realized_profit_loss: number;
}

const AccountSummaryComponent: React.FC = () => {
  const [summary, setSummary] = useState<AccountSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // 백엔드 API 주소 확인 필요 (VITE_API_URL 환경 변수 사용 권장)
        const response = await fetch('http://localhost:8000/api/v1/trading/summary');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: AccountSummaryData = await response.json();
        setSummary(data);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred');
        }
      }
    };

    fetchSummary();
  }, []);

  if (error) {
    return <div className="p-4 bg-red-900 rounded-lg text-white">Error: {error}</div>;
  }

  if (!summary) {
    return <div className="p-4 bg-gray-800 rounded-lg text-white">Loading summary...</div>;
  }

  // 숫자를 보기 좋게 포맷하는 함수 (예: 10000000 -> 10,000,000)
  const formatNumber = (num: number) => Math.round(num).toLocaleString();
  const formatProfitLoss = (num: number) => {
      const sign = num > 0 ? '+' : '';
      return `${sign}${formatNumber(num)}`;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">계좌 총괄 현황</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-700 rounded-md">
          <p className="text-sm text-gray-400">총 투자 원금</p>
          <p className="text-2xl font-semibold">{formatNumber(summary.total_investment)}원</p>
        </div>
        <div className="p-4 bg-gray-700 rounded-md">
          <p className="text-sm text-gray-400">총 평가 자산</p>
          <p className="text-2xl font-semibold">{formatNumber(summary.total_assets)}원</p>
        </div>
        <div className={`p-4 rounded-md ${summary.total_profit_loss >= 0 ? 'bg-green-800' : 'bg-red-800'}`}>
          <p className="text-sm opacity-80">총 손익 (P&L)</p>
          <p className="text-2xl font-semibold">{formatProfitLoss(summary.total_profit_loss)}원</p>
          <p className="text-xs mt-1 opacity-70">
            (미실현: {formatProfitLoss(summary.unrealized_profit_loss)} / 실현: {formatProfitLoss(summary.realized_profit_loss)})
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountSummaryComponent;
