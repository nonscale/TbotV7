// src/pages/TradingManagementPage.tsx
import React from 'react';
import AccountSummaryComponent from '../components/trading/AccountSummaryComponent';
import OpenPositionsComponent from '../components/trading/OpenPositionsComponent';
import TradeHistoryComponent from '../components/trading/TradeHistoryComponent';

const TradingManagementPage: React.FC = () => {
  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">매매 관리</h1>

      {/* 1. 계좌 총괄 현황 컴포넌트 */}
      <div className="mb-8">
        <AccountSummaryComponent />
      </div>

      {/* 2. 보유 종목 현황 컴포넌트 */}
      <div className="mb-8">
        <OpenPositionsComponent />
      </div>

      {/* 3. 매매 기록 컴포넌트 */}
      <div>
        <TradeHistoryComponent />
      </div>
    </div>
  );
};

export default TradingManagementPage;
