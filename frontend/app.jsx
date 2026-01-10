const { useState, useEffect } = React;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth0 Configuration - Replace these with your Auth0 credentials
  const AUTH0_DOMAIN = 'dev-447vgia3jfz0nwlf.us.auth0.com';
  const AUTH0_CLIENT_ID = 'O9qxQz7Efm7i71zPJT61En0AdiAVnUK6';
  const REDIRECT_URI = window.location.origin;

  useEffect(() => {
    // Check if returning from Auth0 callback
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const idToken = params.get('id_token');

      if (accessToken && idToken) {
        // Fetch user info
        fetchUserInfo(accessToken);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async (accessToken) => {
    try {
      const response = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    const authUrl = `https://${AUTH0_DOMAIN}/authorize?` +
      `response_type=token id_token&` +
      `client_id=${AUTH0_CLIENT_ID}&` +
      `connection=google-oauth2&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=openid profile email&` +
      `nonce=${Math.random().toString(36).substring(7)}`;

    window.location.href = authUrl;
  };

  const logout = () => {
    setUser(null);
    const logoutUrl = `https://${AUTH0_DOMAIN}/v2/logout?` +
      `client_id=${AUTH0_CLIENT_ID}&` +
      `returnTo=${encodeURIComponent(REDIRECT_URI)}`;

    window.location.href = logoutUrl;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-main">
      <div className="card">
        {!user ? (
          <div>
            <div className="login-header">
              <div className="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </div>
              <h1 className="title">Welcome Back</h1>
              <p className="subtitle">Sign in to continue to your account</p>
            </div>

            <div className="setup-notice">
              <p className="setup-notice-title">⚠️ Setup Required:</p>
              <ol>
                <li>Create an Auth0 account at auth0.com</li>
                <li>Create a new application (Single Page App)</li>
                <li>Enable Google OAuth in Connections</li>
                <li>Add this URL to Allowed Callbacks</li>
                <li>Replace AUTH0_DOMAIN and CLIENT_ID in App.jsx</li>
              </ol>
            </div>

            <button onClick={loginWithGoogle} className="google-button">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        ) : (
          <div>
            <div className="profile-header">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt="Profile"
                  className="profile-image"
                />
              ) : (
                <div className="profile-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              )}
              <h1 className="title">Welcome!</h1>
              <p className="profile-name">{user.name}</p>
              <p className="profile-email">{user.email}</p>
            </div>

            <div className="success-notice">
              <p>✓ Successfully authenticated</p>
            </div>

            <button onClick={logout} className="logout-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);