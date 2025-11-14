// src/components/ScanResultsTable.tsx
import React from 'react';

// StrategyBuilderPage에서 import 할 수 있도록 타입을 export 합니다.
export interface ScanResult {
  strategy_name: string;
  ticker: string;
  timestamp: string;
  details: {
    price: number;
    volume: number;
  };
}

interface ScanResultsTableProps {
  results: ScanResult[];
}

const ScanResultsTable: React.FC<ScanResultsTableProps> = ({ results }) => {

  const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const formatDateTime = (isoString: string) => new Date(isoString).toLocaleString('ko-KR');

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="p-3">검출 시각</th>
            <th className="p-3">종목명</th>
            <th className="p-3">관련 전략</th>
            <th className="p-3 text-right">가격</th>
            <th className="p-3 text-right">거래량</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                실시간 스캔 결과가 여기에 표시됩니다.
              </td>
            </tr>
          ) : (
            results.map((result) => (
              <tr key={`${result.ticker}-${result.timestamp}`} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-3 text-sm text-gray-400">{formatDateTime(result.timestamp)}</td>
                <td className="p-3 font-semibold">{result.ticker}</td>
                <td className="p-3 text-gray-400">{result.strategy_name}</td>
                <td className="p-3 text-right">{formatNumber(result.details.price)}</td>
                <td className="p-3 text-right">{formatNumber(result.details.volume)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScanResultsTable;
