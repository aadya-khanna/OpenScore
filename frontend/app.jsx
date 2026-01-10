const { useState, useRef, useEffect } = React;

// Auth0 SPA client singleton
let auth0Client = null;

// Initialize Auth0 SPA client
const initAuth0Client = async () => {
  if (auth0Client) return auth0Client;
  
  if (window.auth0 && AUTH0_CONFIG) {
    auth0Client = await window.auth0.createAuth0Client({
      domain: AUTH0_CONFIG.domain,
      clientId: AUTH0_CONFIG.clientId,
      authorizationParams: {
        redirect_uri: FRONTEND_ORIGIN,
        audience: AUTH0_AUDIENCE
      }
    });
  }
  return auth0Client;
};

// Get access token for API
const getAccessToken = async () => {
  // First, try to get from hash (if just logged in)
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    const hashToken = params.get('access_token');
    if (hashToken) {
      return hashToken;
    }
  }
  
  // Try Auth0 SPA SDK
  try {
    const client = await initAuth0Client();
    if (client) {
      try {
        const token = await client.getTokenSilently({
          authorizationParams: {
            audience: AUTH0_AUDIENCE
          }
        });

        console.log("TOKEN starts:", token.slice(0, 20));
        console.log("segments:", token.split(".").length);
        
        if (token) return token;
      } catch (e) {
        // If silent auth fails, try to get from cache or redirect
        console.warn('Silent token fetch failed:', e);
      }
    }
  } catch (error) {
    console.error('Error getting access token from Auth0 SDK:', error);
  }
  
  return null;
};

// API fetch helper
const apiFetch = async (path, options = {}) => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }
  
  const fetchOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  };
  
  if (options.body && typeof options.body === 'object') {
    fetchOptions.body = JSON.stringify(options.body);
  }
  
  const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);
  
  console.log(`API Call: ${API_BASE_URL}${path}`);
  if (token) {
    console.log(`API Auth: Bearer ${token.substring(0, 10)}...`);
  } else {
    console.warn('API Call made without token.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || `Request failed: ${response.statusText}`);
  }
  
  return response.json();
};

// DataSourceCard Component for Customer Dashboard
const DataSourceCard = ({ source, isConnected, onConnect, onUpload, user }) => {
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
              disabled={isConnected || (source.id === 'plaid' && !user)}
              className={`card-button ${isConnected ? 'connected' : 'connect'}`}
              title={source.id === 'plaid' && !user ? 'Log in to connect your account' : ''}
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

// Banker Dashboard Component
const BankerDashboard = ({ user, onLogout }) => {
  const [customers] = useState([
    { id: 1, name: 'John Smith', email: 'john@example.com', score: 720, status: 'Approved', applications: 3 },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', score: 680, status: 'Pending', applications: 1 },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', score: 750, status: 'Approved', applications: 5 },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', score: 650, status: 'Review', applications: 2 },
    { id: 5, name: 'David Wilson', email: 'david@example.com', score: 695, status: 'Pending', applications: 1 },
    { id: 6, name: 'Lisa Anderson', email: 'lisa@example.com', score: 730, status: 'Approved', applications: 4 },
  ]);

  const [stats] = useState({
    totalCustomers: 156,
    pendingReviews: 12,
    approvedToday: 8,
    avgScore: 695
  });

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
            <span className="user-badge">BANKER</span>
          </div>
          <div className="header-right">
            <div className="header-user">
              {user.picture && (
                <img src={user.picture} alt="User" className="header-user-avatar" />
              )}
              <span className="header-user-name">{user.name}</span>
            </div>
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="hero">
            <h1 className="hero-title">Banker Dashboard</h1>
            <p className="hero-description">
              Review customer applications and credit scores
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Total Customers</span>
                <svg className="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-value">{stats.totalCustomers}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Pending Reviews</span>
                <svg className="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="stat-value">{stats.pendingReviews}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Approved Today</span>
                <svg className="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="stat-value">{stats.approvedToday}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Average Score</span>
                <svg className="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
                  <path d="M12 12V2a10 10 0 0 1 10 10H12Z"></path>
                </svg>
              </div>
              <div className="stat-value">{stats.avgScore}</div>
            </div>
          </div>

          <div className="table-card">
            <h2 className="table-title">Recent Customer Applications</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Credit Score</th>
                    <th>Status</th>
                    <th>Applications</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-name">{customer.name}</div>
                      </td>
                      <td>
                        <div className="customer-email">{customer.email}</div>
                      </td>
                      <td>
                        <div className="score-container">
                          <span className="score-value">{customer.score}</span>
                          <div className={`score-indicator ${
                            customer.score >= 700 ? 'high' :
                            customer.score >= 650 ? 'medium' : 'low'
                          }`}></div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          customer.status.toLowerCase() === 'approved' ? 'approved' :
                          customer.status.toLowerCase() === 'pending' ? 'pending' :
                          'review'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td>{customer.applications}</td>
                      <td>
                        <button className="action-btn">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Customer Dashboard Component
const CustomerDashboard = ({ user, onLogout }) => {
  const [connectedSources, setConnectedSources] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(null);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Refresh data from backend
  const refreshData = async () => {
    if (!user) {
      setError('Log in to connect your account');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Sync data first
      try {
        await apiFetch('/api/plaid/transactions/sync', { method: 'POST' });
      } catch (e) {
        if (!e.message.includes('not connected')) throw e;
      }
      
      try {
        await apiFetch('/api/plaid/balances/sync', { method: 'POST' });
      } catch (e) {
        if (!e.message.includes('not connected')) throw e;
      }
      
      try {
        await apiFetch('/api/plaid/income/sync', { method: 'POST' });
      } catch (e) {
        // Income may not be available, ignore
      }
      
      // Fetch stored data
      const [balancesData, transactionsData, incomeData] = await Promise.all([
        apiFetch('/api/balances').catch(() => []),
        apiFetch('/api/transactions').catch(() => []),
        apiFetch('/api/income').catch(() => null)
      ]);
      
      setBalances(balancesData || []);
      setTransactions((transactionsData || []).slice(0, 10));
      setIncome(incomeData);
      
      // Calculate score
      try {
        const scoreData = await apiFetch('/api/score/calculate', { method: 'POST' });
        setScore(scoreData);
      } catch (e) {
        console.warn('Score calculation failed:', e);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Connect Plaid account
  const connectPlaid = async () => {
    if (!user) {
      setError('Log in to connect your account');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get link token
      const { link_token } = await apiFetch('/api/plaid/link-token', { method: 'POST' });
      
      // Initialize Plaid Link
      if (!window.Plaid) {
        throw new Error('Plaid Link script not loaded');
      }
      
      const handler = window.Plaid.create({
        token: link_token,
        onSuccess: async (public_token) => {
          try {
            // Exchange public token
            await apiFetch('/api/plaid/exchange', {
              method: 'POST',
              body: JSON.stringify({ public_token })
            });
            
            // Sync data
            await apiFetch('/api/plaid/transactions/sync', { method: 'POST' });
            await apiFetch('/api/plaid/balances/sync', { method: 'POST' });
            
            try {
              await apiFetch('/api/plaid/income/sync', { method: 'POST' });
            } catch (e) {
              // Income may not be available
            }
            
            // Calculate score
            try {
              const scoreData = await apiFetch('/api/score/calculate', { method: 'POST' });
              setScore(scoreData);
            } catch (e) {
              console.warn('Score calculation failed:', e);
            }
            
            // Refresh and display data
            setConnectedSources([...connectedSources, 'plaid']);
            await refreshData();
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },
        onExit: (err) => {
          if (err) {
            setError(err.error_message || 'Plaid Link exited');
          }
          setLoading(false);
        }
      });
      
      handler.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const connectSource = (sourceId) => {
    if (sourceId === 'plaid') {
      connectPlaid();
    } else if (!connectedSources.includes(sourceId)) {
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
            <button onClick={onLogout} className="logout-btn">
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
                user={user}
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

          {connectedSources.includes('plaid') && (
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={refreshData}
                disabled={loading || !user}
                className="card-button connect"
                style={{ margin: 0 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>
            </div>
          )}

          {error && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {(balances.length > 0 || transactions.length > 0 || income || score) && (
            <div style={{ marginTop: '32px' }}>
              {score && (
                <div className="progress-card" style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>OpenScore</h3>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb', marginBottom: '8px' }}>
                    {score.score || score.value || 'N/A'}
                  </div>
                  {score.breakdown && (
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                      {JSON.stringify(score.breakdown, null, 2)}
                    </div>
                  )}
                </div>
              )}

              {balances.length > 0 && (
                <div className="progress-card" style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Balances</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {balances.map((account, idx) => (
                      <div key={idx} style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {account.name || account.account_id}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          {account.type || account.subtype || ''} • 
                          Balance: ${account.balances?.current || account.balance || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {transactions.length > 0 && (
                <div className="progress-card" style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Recent Transactions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {transactions.map((txn, idx) => (
                      <div key={idx} style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600' }}>{txn.name || txn.merchant_name || 'Transaction'}</span>
                          <span style={{ fontWeight: '600', color: txn.amount < 0 ? '#dc2626' : '#16a34a' }}>
                            ${Math.abs(txn.amount || 0).toFixed(2)}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {txn.date || txn.authorized_date || ''} • {txn.category?.join(', ') || ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {income && (
                <div className="progress-card" style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Income</h3>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {income.available !== false ? 'Income data available' : 'Income data not available'}
                  </div>
                </div>
              )}
            </div>
          )}

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
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState('customer'); // 'customer' or 'banker'
  const [loading, setLoading] = useState(true);

  const AUTH0_DOMAIN = AUTH0_CONFIG.domain;
  const AUTH0_CLIENT_ID = AUTH0_CONFIG.clientId;
  const REDIRECT_URI = window.location.origin;

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const idToken = params.get('id_token');
      const storedUserType = sessionStorage.getItem('userType');

      if (accessToken && idToken) {
        fetchUserInfo(accessToken, storedUserType || 'customer');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async (accessToken, type) => {
    try {
      const response = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const userData = await response.json();
      setUser(userData);
      setUserType(type);
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    sessionStorage.setItem('userType', userType);

    const authUrl = `https://${AUTH0_DOMAIN}/authorize?` +
      `response_type=token id_token&` +
      `client_id=${AUTH0_CLIENT_ID}&` +
      `connection=google-oauth2&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=openid profile email&` +
      `audience=${AUTH0_AUDIENCE}&` +
      `nonce=${Math.random().toString(36).substring(7)}`;

    window.location.href = authUrl;
  };

  const logout = () => {
    setUser(null);
    setUserType('customer');
    sessionStorage.removeItem('userType');

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
          <p className="login-subtitle">Sign in to access your dashboard</p>

          <div className="user-type-selector">
            <button
              className={`user-type-btn ${userType === 'customer' ? 'active' : ''}`}
              onClick={() => setUserType('customer')}
            >
              <div className="user-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span className="user-type-label">Customer</span>
            </button>

            <button
              className={`user-type-btn ${userType === 'banker' ? 'active' : ''}`}
              onClick={() => setUserType('banker')}
            >
              <div className="user-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
              </div>
              <span className="user-type-label">Banker</span>
            </button>
          </div>

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

  return userType === 'banker' ? (
    <BankerDashboard user={user} onLogout={logout} />
  ) : (
    <CustomerDashboard user={user} onLogout={logout} />
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);