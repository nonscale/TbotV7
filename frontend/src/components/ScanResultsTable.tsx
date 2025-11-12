import React from 'react';

// 스캔 결과 데이터의 타입을 정의합니다.
// (추후 웹소켓에서 받는 데이터 구조에 맞춰 수정될 수 있습니다)
export interface ScanResult {
  ticker: string; // 종목 코드 (예: KRW-BTC)
  name: string;   // 종목명 (예: 비트코인)
  price: number;  // 현재가
  amount: number; // 거래대금 (억 단위)
}

interface ScanResultsTableProps {
  results: ScanResult[];
}

const ScanResultsTable: React.FC<ScanResultsTableProps> = ({ results }) => {
  const tableStyle: React.CSSProperties = {
    width: '100%',
    marginTop: '20px',
    borderCollapse: 'collapse',
  };

  const thStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '8px',
    backgroundColor: '#f2f2f2',
    textAlign: 'left',
  };

  const tdStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '8px',
  };

  if (results.length === 0) {
    return <p>스캔 결과가 여기에 표시됩니다.</p>;
  }

  return (
    <div>
      <h3>스캔 결과</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>종목명</th>
            <th style={thStyle}>코드명</th>
            <th style={thStyle}>현재가</th>
            <th style={thStyle}>거래대금(억)</th>
            <th style={thStyle}>OHLC 미니바</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index}>
              <td style={tdStyle}>{result.name}</td>
              <td style={tdStyle}>{result.ticker}</td>
              <td style={tdStyle}>{result.price.toLocaleString()}</td>
              <td style={tdStyle}>{result.amount.toFixed(2)}</td>
              <td style-={tdStyle}>[미니바 표시될 곳]</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScanResultsTable;
