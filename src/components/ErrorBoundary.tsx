import { Component, ReactNode, ErrorInfo } from 'react';
import { Alert, Button, Stack, Title, Text, Paper } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Log error to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional reset handler
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <IconAlertTriangle size={48} color="var(--mantine-color-red-6)" />
            <Title order={3}>Something went wrong</Title>
            <Text c="dimmed" ta="center" maw={500}>
              An unexpected error occurred. The error has been logged and we'll look into it.
            </Text>

            {import.meta.env.DEV && this.state.error && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                title="Error Details (Development Only)"
                color="red"
                variant="light"
                w="100%"
                maw={600}
              >
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    {this.state.error?.message || 'Unknown error'}
                  </Text>
                  {this.state.errorInfo && (
                    <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                      {this.state.errorInfo.componentStack?.slice(0, 500)}
                      {this.state.errorInfo.componentStack &&
                        this.state.errorInfo.componentStack.length > 500 &&
                        '...'}
                    </Text>
                  )}
                </Stack>
              </Alert>
            )}

            <Button
              leftSection={<IconRefresh size={18} />}
              onClick={this.handleReset}
              variant="light"
            >
              Try Again
            </Button>
          </Stack>
        </Paper>
      );
    }

    return this.props.children;
  }
}
