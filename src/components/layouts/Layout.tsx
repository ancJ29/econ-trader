import { Outlet } from 'react-router-dom';
import { Container, Box } from '@mantine/core';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = () => {
  return (
    <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container size="xl" style={{ flex: 1 }}>
        <Box component="main">
          <Outlet />
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};
