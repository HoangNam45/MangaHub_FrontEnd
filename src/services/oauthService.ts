class OAuthService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  // Redirect to Google OAuth
  initiateGoogleAuth() {
    const authURL = `${this.baseURL}/api/v1/auth/google`;
    window.location.href = authURL;
  }

  // Redirect to Facebook OAuth
  initiateFacebookAuth() {
    const authURL = `${this.baseURL}/api/v1/auth/facebook`;
    window.location.href = authURL;
  }

  // Handle OAuth callback (parse tokens from URL)
  handleOAuthCallback(): { token?: string; error?: string } {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    // Clear URL parameters after reading them
    if (typeof window !== 'undefined') {
      const cleanURL = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanURL);
    }

    if (error) {
      return { error: decodeURIComponent(error) };
    }

    if (token) {
      return { token };
    }

    return {};
  }

  // Get user info after OAuth success
  async getUserInfo(token: string) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get user info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  // Check if current page is OAuth callback
  isOAuthCallback(): boolean {
    if (typeof window === 'undefined') return false;

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('token') || urlParams.has('error');
  }
}

export default new OAuthService();
