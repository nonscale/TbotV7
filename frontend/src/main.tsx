import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import StrategyBuilderPage from './pages/StrategyBuilderPage';
import AnalysisPage from './pages/AnalysisPage';
import StrategyManagementPage from './pages/StrategyManagementPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'builder', element: <StrategyBuilderPage /> },
      { path: 'analysis', element: <AnalysisPage /> },
      { path: 'strategy-management', element: <StrategyManagementPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);