import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';
import { LoadingOverlay } from './components/layouts/LoadingOverlay';
import { router } from './routers';
import { useAuthStore } from './store/authStore';

function App() {
  const { t } = useTranslation();
  const reconnect = useAuthStore((state) => state.reconnect);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    // Check for existing tokens on app mount
    reconnect();
  }, [reconnect]);

  if (isInitializing) {
    return <LoadingOverlay visible={true} message={t('auth.checkingStatus')} />;
  }

  return <RouterProvider router={router} />;
}

export default App;
