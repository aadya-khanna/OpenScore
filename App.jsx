const { useState, useRef, useEffect } = React;

const DataSourceCard = ({ source, isConnected, onConnect, onUpload }) => {
  const fileInputRef = useRef(null);

  return (
    <div className="data-source-card">
      <div className="card-header">
        <div className="card-info">
          <div className={`card-icon ${isConnected ? 'connected' : 'not-connected'}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: source.iconPath }}
            />
          </div>
          <div className="card-title-wrapper">
            <h3>
              {source.name}
              <span className="card-emoji">{source.emoji}</span>
            </h3>
            <p className="card-provider">{source.provider}</p>
          </div>
        </div>
        {isConnected && (
          <svg
            className="card-check"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )}
      </div>
      <p className="card-description">{source.description}</p>

      {source.type === 'link' ? (
        <button
          onClick={onConnect}
          disabled={isConnected}
          className={`card-button ${isConnected ? 'connected' : 'connect'}`}
        >
          {isConnected ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Connected</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Connect Account</span>
            </>
          )}
        </button>
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => onUpload(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`card-button ${isConnected ? 'connected' : 'upload'}`}
          >
            {isConnected ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Uploaded</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" x2="12" y1="3" y2="15"></line>
                </svg>
                <span>Upload Documents</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectedSources, setConnectedSources] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Auth0 Configuration - Replace these with your Auth0 credentials
  const AUTH0_DOMAIN = AUTH0_CONFIG.domain;
  const AUTH0_CLIENT_ID = AUTH0_CONFIG.clientId;
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
    setConnectedSources([]);
    setUploadedFiles([]);
    const logoutUrl = `https://${AUTH0_DOMAIN}/v2/logout?` +
      `client_id=${AUTH0_CLIENT_ID}&` +
      `returnTo=${encodeURIComponent(REDIRECT_URI)}`;

    window.location.href = logoutUrl;
  };

  const dataSources = [
    {
      id: 'plaid',
      name: 'Financial Accounts',
      iconPath: '<circle cx="12" cy="12" r="3"></circle><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="m4.93 4.93 2.83 2.83"></path><path d="m16.24 16.24 2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="m4.93 19.07 2.83-2.83"></path><path d="m16.24 7.76 2.83-2.83"></path>',
      type: 'link',
      provider: 'Connect with Plaid',
      description: 'Bank accounts, credit cards, recurring payments (rent, utilities, subscriptions), transaction history, and income verification',
      emoji: '🏦'
    },
    {
      id: 'alternative',
      name: 'Alternative Income',
      iconPath: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
      type: 'upload',
      provider: 'Upload Earnings',
      description: 'Gig economy (Uber, DoorDash, Lyft), freelance work, side hustles - upload earnings statements',
      emoji: '💼'
    },
    {
      id: 'public',
      name: 'Public Records (Optional)',
      iconPath: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline>',
      type: 'upload',
      provider: 'Upload Documents',
      description: 'Education credentials, property ownership, professional licenses',
      emoji: '📋'
    }
  ];

  const connectSource = (sourceId) => {
    if (!connectedSources.includes(sourceId)) {
      setConnectedSources([...connectedSources, sourceId]);
    }
  };

  const handleFileUpload = (sourceId, files) => {
    const newFiles = Array.from(files).map(file => ({
      sourceId,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
    if (!connectedSources.includes(sourceId)) {
      setConnectedSources([...connectedSources, sourceId]);
    }
  };

  const getProgressMessage = () => {
    if (connectedSources.length === 0) return "Connect at least 1 data source to get started";
    if (connectedSources.length === 1) return "Great start! Add more sources for better accuracy";
    return "Excellent! You have enough data for comprehensive analysis";
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  // Login page if not authenticated
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
          </div>
          <h1 className="login-title">Welcome to OpenScore</h1>
          <p className="login-subtitle">Sign in to access your credit analysis dashboard</p>
          <button onClick={loginWithGoogle} className="google-login-button">
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div>
      <header className="header">
        <div className="header-container">
          <div className="header-logo">
            <div className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
                <path d="M12 12V2a10 10 0 0 1 10 10H12Z"></path>
              </svg>
            </div>
            <span className="logo-text">OpenScore</span>
          </div>
          <div className="header-right">
            <div className="header-security">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Secure & FCRA Compliant</span>
            </div>
            <div className="header-user">
              {user.picture && (
                <img src={user.picture} alt="User" className="header-user-avatar" />
              )}
              <span className="header-user-name">{user.name}</span>
            </div>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="hero">
            <div className="hero-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
                <path d="M12 12V2a10 10 0 0 1 10 10H12Z"></path>
              </svg>
              <span>AI-Powered Credit Analysis</span>
            </div>
            <h1 className="hero-title">Connect Your Financial Data</h1>
            <p className="hero-description">
              Link your accounts or upload documents to get your comprehensive credit score
            </p>
          </div>

          <div className="user-info-card">
            {user.picture && (
              <img src={user.picture} alt="User" className="user-avatar" />
            )}
            <div className="user-details">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="cards-grid">
            {dataSources.map(source => (
              <DataSourceCard
                key={source.id}
                source={source}
                isConnected={connectedSources.includes(source.id)}
                onConnect={() => connectSource(source.id)}
                onUpload={(files) => handleFileUpload(source.id, files)}
              />
            ))}
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <span className="progress-label">Data Sources Connected</span>
              <span className="progress-count">{connectedSources.length}/3</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${(connectedSources.length / 3) * 100}%` }}
              />
            </div>
            <div className="progress-message">
              {getProgressMessage()}
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="files-card">
              <h3 className="files-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>Uploaded Documents</span>
              </h3>
              <div className="files-list">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <div className="file-info">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" x2="12" y1="3" y2="15"></line>
                      </svg>
                      <div>
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <svg className="file-check" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => alert('Analysis feature would be implemented in full version')}
            disabled={connectedSources.length < 1}
            className="analyze-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
              <path d="M12 12V2a10 10 0 0 1 10 10H12Z"></path>
            </svg>
            <span>Analyze with AI</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" x2="19" y1="12" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);