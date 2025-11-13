import React from 'react';

export interface ScanResult {
  ticker: string;
  name: string;
  price: number;
  amount: number;
}

interface ScanResultsTableProps {
  results: ScanResult[];
}

// React.memo를 사용하여 불필요한 리렌더링을 방지하는 최적화 추가
const ScanResultsTable: React.FC<ScanResultsTableProps> = React.memo(({ results }) => {
  if (!results || results.length === 0) {
    return <p style={{ marginTop: '20px' }}>스캔 결과가 여기에 표시됩니다.</p>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>스캔 결과</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' }}>종목명</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' }}>코드명</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' }}>현재가</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' }}>거래대금(억)</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            // key 값으로 index 대신 고유한 ticker를 사용하여 성능 최적화
            <tr key={result.ticker}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.ticker}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.price.toLocaleString()}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{result.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ScanResultsTable;