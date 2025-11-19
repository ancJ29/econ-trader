import { authApi } from '@/lib/api/auth';
import { createBrowserLogger } from '@an-oct/vani-kit';

const logger = createBrowserLogger('AUTH-SERVICE', {
  level: 'silent',
});

const clientServiceId = import.meta.env.VITE_CLIENT_SERVICE_ID;

export const authService = {
  async reconnect(): Promise<{ success: boolean }> {
    logger.debug('Reconnecting...');
    try {
      logger.debug('Verifying saved token...');
      const savedToken = sessionStorage.getItem('token');
      if (savedToken) {
        logger.debug('Saved token found, verifying...');
        await authApi.verifyToken({ token: savedToken });
        logger.debug('Saved token verified successfully');
        return { success: true };
      }
      logger.debug('No saved token found, continuing...');
    } catch (error) {
      logger.error('Failed to verify saved token', error);
      // Token verification failed, try refresh token
    }

    // Remove the saved token
    sessionStorage.removeItem('token');

    logger.debug('Trying to renew access token...');
    try {
      logger.debug('Getting saved refresh token...');
      const savedRefreshToken = localStorage.getItem('refreshToken');
      if (savedRefreshToken) {
        logger.debug('Saved refresh token found, renewing...');
        const { token } = await authApi.renewAccessToken({ refreshToken: savedRefreshToken });
        logger.debug('Renewed access token successfully');
        sessionStorage.setItem('token', token);
        return {
          success: true,
        };
      }
    } catch (error) {
      // Remove the saved refresh token
      logger.error('Failed to renew access token', error);
      localStorage.removeItem('refreshToken');
    }

    return {
      success: false,
    };
  },

  // Register a new user
  async register(email: string, password: string): Promise<{ success: boolean }> {
    this.logout();
    try {
      logger.debug('Registering new user...', { email, clientServiceId });
      const { success } = await authApi.register({ email, password, clientServiceId });
      if (success) {
        logger.debug('Registered new user successfully');
        return { success: true };
      }
      logger.error('Failed to register new user');
      return { success: false };
    } catch (error) {
      logger.error('Failed to register new user', error);
      return { success: false };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean }> {
    this.logout();

    try {
      logger.debug('Logging in...', {
        email,
        clientServiceId,
      });
      const { token, refreshToken } = await authApi.login({ email, password, clientServiceId });
      sessionStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      logger.debug('Logged in successfully');
      return {
        success: true,
      };
    } catch (error) {
      logger.error('Failed to login', error);
      return {
        success: false,
      };
    }
  },

  async logout(): Promise<{ success: boolean }> {
    logger.debug('Logging out...');
    sessionStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    logger.debug('Logged out successfully');
    return {
      success: true,
    };
  },
};
