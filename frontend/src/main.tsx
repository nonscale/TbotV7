import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import StrategyBuilderPage from './pages/StrategyBuilderPage';
import StrategyManagementPage from './pages/StrategyManagementPage';
import DashboardPage from './pages/DashboardPage';
import AnalysisPage from './pages/AnalysisPage';
import TradingManagementPage from './pages/TradingManagementPage'; // 추가
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <StrategyBuilderPage />,
      },
      {
        path: "strategies",
        element: <StrategyManagementPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "analysis/:ticker",
        element: <AnalysisPage />,
      },
      {
        path: "trading", // 추가
        element: <TradingManagementPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
