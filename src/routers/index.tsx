import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { LoadingOverlay } from '@/components/layouts/LoadingOverlay';
import { Layout } from '@/components/layouts/Layout';

// Lazy load pages for code splitting
const Home = lazy(() => import('@/pages/Home'));
const EconomicCalendar = lazy(() => import('@/pages/EconomicCalendar'));
const EconomicIndexDetail = lazy(() => import('@/pages/EconomicIndexDetail'));
const DemoHome = lazy(() => import('@/pages/demo/DemoHome'));
const DatesDemo = lazy(() => import('@/pages/demo/DatesDemo'));
const FormDemo = lazy(() => import('@/pages/demo/FormDemo'));
const HooksDemo = lazy(() => import('@/pages/demo/HooksDemo'));
const ModalsDemo = lazy(() => import('@/pages/demo/ModalsDemo'));
const NotificationsDemo = lazy(() => import('@/pages/demo/NotificationsDemo'));

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
        path: '/economic-calendar',
        element: withSuspense(EconomicCalendar),
      },
      {
        path: '/economic-calendar/:eventCode',
        element: withSuspense(EconomicIndexDetail),
      },
      {
        path: '/demos',
        element: withSuspense(DemoHome),
      },
      {
        path: '/demos/dates',
        element: withSuspense(DatesDemo),
      },
      {
        path: '/demos/form',
        element: withSuspense(FormDemo),
      },
      {
        path: '/demos/hooks',
        element: withSuspense(HooksDemo),
      },
      {
        path: '/demos/modals',
        element: withSuspense(ModalsDemo),
      },
      {
        path: '/demos/notifications',
        element: withSuspense(NotificationsDemo),
      },
    ],
  },
]);
