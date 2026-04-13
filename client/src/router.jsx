import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CasesListPage from './pages/CasesListPage.jsx';
import CaseDetailPage from './pages/CaseDetailPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx';
import StatuteConcordancePage from './pages/StatuteConcordancePage.jsx';
import AuditLogPage from './pages/AuditLogPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'cases', element: <CasesListPage /> },
      { path: 'cases/:id', element: <CaseDetailPage /> },
      { path: 'cases/:id/chat', element: <ChatPage /> },
      { path: 'cases/:id/analysis', element: <AnalysisPage /> },
      { path: 'statutes', element: <StatuteConcordancePage /> },
      { path: 'audit', element: <AuditLogPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
