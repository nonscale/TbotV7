// src/components/trading/TradeHistoryComponent.tsx
import React, { useState, useEffect } from 'react';

// API 응답 데이터 타입 정의
interface TradeData {
  timestamp: string; // ISO 8601 format
  ticker: string;
  trade_type: '매수' | '매도';
  price: number;
  quantity: number;
  amount: number;
  related_strategy: string;
}

interface TradeHistoryData {
    trades: TradeData[];
}

const TradeHistoryComponent: React.FC = () => {
  const [history, setHistory] = useState<TradeHistoryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/trading/history');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: TradeHistoryData = await response.json();
        setHistory(data);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred');
        }
      }
    };
    fetchHistory();
  }, []);

  const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const formatDateTime = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
      });
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">매매 기록</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-3">체결 시각</th>
              <th className="p-3">종목명</th>
              <th className="p-3">매매 종류</th>
              <th className="p-3 text-right">체결 가격</th>
              <th className="p-3 text-right">체결 수량</th>
              <th className="p-3 text-right">매매 금액</th>
              <th className="p-3">관련 전략명</th>
            </tr>
          </thead>
          <tbody>
            {error && <tr><td colSpan={7} className="p-4 text-center text-red-500">{error}</td></tr>}
            {!error && (!history || history.trades.length === 0) && <tr><td colSpan={7} className="p-4 text-center text-gray-400">매매 기록이 없습니다.</td></tr>}
            {history?.trades.map((trade, index) => (
              <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-3 text-sm text-gray-400">{formatDateTime(trade.timestamp)}</td>
                <td className="p-3 font-semibold">{trade.ticker}</td>
                <td className={`p-3 font-bold ${trade.trade_type === '매수' ? 'text-green-500' : 'text-red-500'}`}>{trade.trade_type}</td>
                <td className="p-3 text-right">{formatNumber(trade.price)}</td>
                <td className="p-3 text-right">{formatNumber(trade.quantity)}</td>
                <td className="p-3 text-right">{formatNumber(trade.amount)}</td>
                <td className="p-3 text-gray-400">{trade.related_strategy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistoryComponent;
