import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Layout } from '@/components/layouts/Layout';
import { LoadingOverlay } from '@/components/layouts/LoadingOverlay';
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Lazy load pages for code splitting
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const EconomicCalendar = lazy(() => import('@/pages/EconomicCalendar'));
const EconomicIndexDetail = lazy(() => import('@/pages/EconomicIndexDetail'));
const Accounts = lazy(() => import('@/pages/Accounts'));
const AccountDetail = lazy(() => import('@/pages/AccountDetail'));
const Reservations = lazy(() => import('@/pages/Reservations'));

// Loading fallback element
const loadingFallback = <LoadingOverlay visible={true} />;

// Helper function to wrap pages with Suspense
const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={loadingFallback}>
    <Component />
  </Suspense>
);

// Router configuration with lazy loading
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: withSuspense(Home),
      },
      {
        path: '/login',
        element: withSuspense(Login),
      },
      {
        path: '/register',
        element: withSuspense(Register),
      },
      {
        path: '/economic-calendar',
        element: withSuspense(EconomicCalendar),
      },
      {
        path: '/economic-calendar/:eventCode',
        element: withSuspense(EconomicIndexDetail),
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/accounts',
        element: withSuspense(Accounts),
      },
      {
        path: '/accounts/:accountId',
        element: withSuspense(AccountDetail),
      },
      {
        path: '/reservations',
        element: withSuspense(Reservations),
      },
    ],
  },
]);
