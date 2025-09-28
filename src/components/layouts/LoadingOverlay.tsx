import { Box, Loader, Stack, Text, Transition } from '@mantine/core';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  return (
    <Transition mounted={visible} transition="fade" duration={300} timingFunction="ease">
      {(styles) => (
        <Box
          style={{
            ...styles,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Stack align="center" gap="md">
            <Loader size="xl" />
            {message && (
              <Text c="white" size="lg" fw={500}>
                {message}
              </Text>
            )}
          </Stack>
        </Box>
      )}
    </Transition>
  );
}
