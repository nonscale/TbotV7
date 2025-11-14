// src/components/trading/OpenPositionsComponent.tsx
import React, { useState, useEffect } from 'react';

// API 응답 데이터 타입 정의
interface PositionData {
  ticker: string;
  quantity: number;
  average_price: number;
  current_price: number;
  evaluated_amount: number;
  unrealized_profit_loss: number;
  return_on_investment: number;
}

const OpenPositionsComponent: React.FC = () => {
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/trading/positions');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: PositionData[] = await response.json();
        setPositions(data);
      } catch (e) {
         if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred');
        }
      }
    };
    fetchPositions();
  }, []);

  const handleClosePosition = (ticker: string) => {
    alert(`${ticker} 포지션을 종료합니다. (API 연동 필요)`);
    // 여기에 실제 포지션 종료 API 호출 로직을 추가해야 합니다.
  };

  const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const formatProfitLoss = (num: number) => {
      const sign = num > 0 ? '+' : '';
      return `${sign}${formatNumber(num)}`;
  }
  const getProfitLossColor = (num: number) => num >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">보유 종목 현황</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-3">종목명</th>
              <th className="p-3 text-right">보유 수량</th>
              <th className="p-3 text-right">평균 매입가</th>
              <th className="p-3 text-right">현재가</th>
              <th className="p-3 text-right">평가 금액</th>
              <th className="p-3 text-right">미실현 손익</th>
              <th className="p-3 text-right">수익률(ROI)</th>
              <th className="p-3 text-center">액션</th>
            </tr>
          </thead>
          <tbody>
            {error && <tr><td colSpan={8} className="p-4 text-center text-red-500">{error}</td></tr>}
            {!error && positions.length === 0 && <tr><td colSpan={8} className="p-4 text-center text-gray-400">보유 중인 종목이 없습니다.</td></tr>}
            {positions.map((pos) => (
              <tr key={pos.ticker} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-3 font-semibold">{pos.ticker}</td>
                <td className="p-3 text-right">{formatNumber(pos.quantity)}</td>
                <td className="p-3 text-right">{formatNumber(pos.average_price)}</td>
                <td className="p-3 text-right">{formatNumber(pos.current_price)}</td>
                <td className="p-3 text-right">{formatNumber(pos.evaluated_amount)}</td>
                <td className={`p-3 text-right ${getProfitLossColor(pos.unrealized_profit_loss)}`}>{formatProfitLoss(pos.unrealized_profit_loss)}</td>
                <td className={`p-3 text-right ${getProfitLossColor(pos.return_on_investment)}`}>{formatProfitLoss(pos.return_on_investment)}%</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleClosePosition(pos.ticker)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    포지션 종료
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpenPositionsComponent;
