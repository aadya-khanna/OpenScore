const { useState, useRef, useEffect } = React;

// API helper function
const apiCall = async (endpoint, method = 'GET', token, body = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }
  
  return await response.json();
};

// DataSourceCard Component for Customer Dashboard
const DataSourceCard = ({ source, isConnected, onConnect, onUpload }) => {
  const fileInputRef = useRef(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
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
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
              {source.name}
              <span className="text-xl">{source.emoji}</span>
            </h3>
            <p className="text-sm text-gray-500">{source.provider}</p>
          </div>
        </div>
        {isConnected && (
          <svg
            className="w-6 h-6 text-green-500 flex-shrink-0"
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
      <p className="text-sm text-gray-600 mb-4">{source.description}</p>

      {source.type === 'link' ? (
        <button
          onClick={onConnect}
          disabled={isConnected}
          className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            isConnected
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isConnected ? (
            <>
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Connected</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              isConnected
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isConnected ? (
              <>
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Uploaded</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
                  <path d="M12 12V2a10 10 0 0 1 10 10H12Z"></path>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">OpenScore</span>
              <span className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-semibold uppercase">BANKER</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                {user.picture && (
                  <img src={user.picture} alt="User" className="w-8 h-8 rounded-full border-2 border-blue-500" />
                )}
                <span className="text-sm font-semibold text-gray-900">{user.name}</span>
              </div>
              <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-8 mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Banker Dashboard</h1>
            <p className="text-xl text-gray-600">
              Review customer applications and credit scores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Customers</span>
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Pending Reviews</span>
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Approved Today</span>
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.approvedToday}</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Average Score</span>
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
                  <path d="M12 12V2a10 10 0 0 1 10 10H12Z"></path>
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.avgScore}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Customer Applications</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Credit Score</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Applications</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{customer.name}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600">{customer.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{customer.score}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            customer.score >= 700 ? 'bg-green-500' :
                            customer.score >= 650 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.status.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' :
                          customer.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">{customer.applications}</td>
                      <td className="py-4 px-4">
                        <button className="text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors">View Details</button>
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
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  
  // Get access token from URL hash or sessionStorage
  const getAccessToken = () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.jsx:326',message:'getAccessToken called',data:{hasHash:!!window.location.hash,hashLength:window.location.hash.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    const hash = window.location.hash;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.jsx:331',message:'Hash check',data:{hashExists:!!hash,hashSubstring:hash?hash.substring(0,50):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.jsx:336',message:'Token from hash',data:{tokenFound:!!token,tokenLength:token?token.length:0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (token) {
        sessionStorage.setItem('access_token', token);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.jsx:340',message:'Token stored in sessionStorage',data:{stored:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return token;
      }
    }
    // Try to get from sessionStorage if available
    const storedToken = sessionStorage.getItem('access_token');
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.jsx:346',message:'Token from sessionStorage',data:{tokenFound:!!storedToken,tokenLength:storedToken?storedToken.length:0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return storedToken;
  };
  
  // Load sandbox data
  const loadSandboxData = async () => {
    const token = getAccessToken();
    if (!token) {
      setDataError('No access token available');
      return;
    }
    
    setDataLoading(true);
    setDataError(null);
    
    try {
      const result = await apiCall('/api/sandbox/load', 'POST', token);
      console.log('Sandbox data loaded:', result);
      
      // After loading, fetch the actual data
      await fetchAllData(token);
      
      if (!connectedSources.includes('plaid')) {
        setConnectedSources([...connectedSources, 'plaid']);
      }
    } catch (err) {
      console.error('Error loading sandbox data:', err);
      setDataError(err.message);
    } finally {
      setDataLoading(false);
    }
  };
  
  // Fetch all data from MongoDB
  const fetchAllData = async (token) => {
    try {
      // Fetch accounts
      const accountsData = await apiCall('/api/data/accounts', 'GET', token);
      setAccounts(accountsData);
      
      // Fetch transactions
      const transactionsData = await apiCall('/api/data/transactions?limit=50', 'GET', token);
      setTransactions(transactionsData);
      
      // Fetch summary
      const summaryData = await apiCall('/api/data/summary', 'GET', token);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setDataError(err.message);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.jsx:392',message:'useEffect triggered',data:{hasUser:!!user,userEmail:user?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const token = getAccessToken();
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.jsx:396',message:'Token check in useEffect',data:{hasToken:!!token,tokenLength:token?token.length:0,hasUser:!!user,willFetch:!!(token&&user)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (token && user) {
      fetchAllData(token);
    }
  }, [user]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
                  <path d="M12 12V2a10 10 0 0 1 10 10H12Z"></path>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">OpenScore</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Secure & FCRA Compliant</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                {user.picture && (
                  <img src={user.picture} alt="User" className="w-8 h-8 rounded-full border-2 border-blue-500" />
                )}
                <span className="text-sm font-semibold text-gray-900">{user.name}</span>
              </div>
              <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-4 py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium">
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
                <path d="M12 12V2a10 10 0 0 1 10 10H12Z"></path>
              </svg>
              <span>AI-Powered Credit Analysis</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Connect Your Financial Data</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Link your accounts or upload documents to get your comprehensive credit score
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
            {user.picture && (
              <img src={user.picture} alt="User" className="w-14 h-14 rounded-full border-3 border-blue-500" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Load Sandbox Data Button */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-2">Load Test Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Load sandbox test data from MongoDB (for development/testing)
            </p>
            <button
              onClick={loadSandboxData}
              disabled={dataLoading}
              className={`w-full py-2 rounded-lg font-medium ${
                dataLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {dataLoading ? 'Loading...' : 'Load Sandbox Data'}
            </button>
            {dataError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {dataError}
              </div>
            )}
          </div>

          {/* Display Accounts */}
          {accounts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold mb-4">Your Accounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <div key={account.account_id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold">{account.name}</h3>
                    <p className="text-sm text-gray-600">{account.type} • {account.subtype}</p>
                    {account.balances?.current !== undefined && (
                      <p className="text-lg font-bold mt-2">
                        ${account.balances.current.toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display Summary */}
          {summary && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold mb-4">Financial Summary</h2>
              {summary.totals?.current_balance !== undefined && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Total Balance</p>
                  <p className="text-3xl font-bold">
                    ${summary.totals.current_balance.toLocaleString()}
                  </p>
                </div>
              )}
              {summary.topCategories && summary.topCategories.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Top Spending Categories</h3>
                  <div className="space-y-2">
                    {summary.topCategories.map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span>{cat.category || 'Unknown'}</span>
                        <span className="font-semibold">${cat.spend?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Display Recent Transactions */}
          {transactions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.slice(0, 10).map((txn) => (
                      <tr key={txn.transaction_id}>
                        <td className="px-4 py-3 text-sm">{txn.date}</td>
                        <td className="px-4 py-3 text-sm">{txn.name}</td>
                        <td className={`px-4 py-3 text-sm font-medium ${
                          txn.amount < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ${Math.abs(txn.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {Array.isArray(txn.category) ? txn.category.join(', ') : txn.category || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Data Sources Connected</span>
              <span className="text-2xl font-bold text-blue-600">{connectedSources.length}/3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(connectedSources.length / 3) * 100}%` }}
              />
            </div>
            <div className="text-sm text-gray-600">
              {getProgressMessage()}
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>Uploaded Documents</span>
              </h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" x2="12" y1="3" y2="15"></line>
                      </svg>
                      <div>
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
              <path d="M12 12V2a10 10 0 0 1 10 10H12Z"></path>
            </svg>
            <span>Analyze with AI</span>
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  const [userType, setUserType] = useState('customer');
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
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.jsx:721',message:'Storing access token on login',data:{tokenLength:accessToken.length,hasToken:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        sessionStorage.setItem('access_token', accessToken);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.jsx:725',message:'Access token stored in sessionStorage',data:{stored:true,verifyStored:!!sessionStorage.getItem('access_token')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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
      `audience=${encodeURIComponent(AUTH0_AUDIENCE)}&` +
      `nonce=${Math.random().toString(36).substring(7)}`;

    window.location.href = authUrl;
  };

  const logout = () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.jsx:862',message:'Logout called, clearing token',data:{hasTokenBefore:!!sessionStorage.getItem('access_token')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    setUser(null);
    setUserType('customer');
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('access_token');
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.jsx:867',message:'Token removed from sessionStorage',data:{hasTokenAfter:!!sessionStorage.getItem('access_token')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    const logoutUrl = `https://${AUTH0_DOMAIN}/v2/logout?` +
      `client_id=${AUTH0_CLIENT_ID}&` +
      `returnTo=${encodeURIComponent(REDIRECT_URI)}`;

    window.location.href = logoutUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-indigo-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to OpenScore</h1>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              className={`flex-1 p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2 ${
                userType === 'customer'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => setUserType('customer')}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                userType === 'customer' ? 'bg-white bg-opacity-20' : 'bg-gray-100'
              }`}>
                <svg className={`w-6 h-6 ${userType === 'customer' ? 'text-white' : 'text-gray-600'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span className="font-semibold text-sm">Customer</span>
            </button>

            <button
              className={`flex-1 p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2 ${
                userType === 'banker'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => setUserType('banker')}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                userType === 'banker' ? 'bg-white bg-opacity-20' : 'bg-gray-100'
              }`}>
                <svg className={`w-6 h-6 ${userType === 'banker' ? 'text-white' : 'text-gray-600'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
              </div>
              <span className="font-semibold text-sm">Banker</span>
            </button>
          </div>

          <button onClick={loginWithGoogle} className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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