import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import App from './App';
import { theme } from './theme';
import './theme/globals.scss';

// import './i18n';
import i18n from '@/lib/i18n';

// Initialize i18n
void i18n;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Notifications />
        <App />
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>
);
