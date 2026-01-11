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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (e) {
        // If response is not JSON, create error from status
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      throw new Error(error.error?.message || error.message || 'API request failed');
    }

    return await response.json();
  } catch (err) {
    // Re-throw with more context for network errors
    if (err.message.includes('fetch') || err.name === 'TypeError') {
      throw new Error('Failed to fetch: Unable to connect to backend server');
    }
    throw err;
  }
};

// DataSourceCard Component for Customer Dashboard
const DataSourceCard = ({ source, isConnected, onConnect, onUpload, onModalOpen }) => {
  const fileInputRef = useRef(null);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
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
      ) : source.type === 'modal' ? (
        <button
          onClick={onModalOpen}
          className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            isConnected
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isConnected ? (
            <>
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Added</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
              <span>Add Credentials</span>
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

// Lender Mock Data
const lenderApplications = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    openScore: 782,
    riskLevel: 'Low',
    monthlyIncome: 8500,
    monthlySpend: 4200,
    cashFlow: 4300,
    status: 'In Review',
    requestedAmount: 25000,
    loanPurpose: 'Home Improvement',
    confidenceScore: 94,
    flags: ['Consistent Income', 'Low Debt-to-Income'],
    positiveFactors: [
      'Steady income for 24+ months',
      'Rent paid on time for 18 months',
      'Healthy savings buffer (3.2x monthly expenses)',
      'Diverse income sources',
    ],
    riskFactors: [
      'Slight increase in discretionary spending',
    ],
    accountBalance: 13500,
    incomeHistory: [
      { month: 'Jan', income: 8200, spending: 4100 },
      { month: 'Feb', income: 8300, spending: 4000 },
      { month: 'Mar', income: 8500, spending: 4300 },
      { month: 'Apr', income: 8400, spending: 4200 },
      { month: 'May', income: 8600, spending: 4400 },
      { month: 'Jun', income: 8500, spending: 4200 },
    ],
    spendingByCategory: [
      { category: 'Housing', amount: 1800 },
      { category: 'Food', amount: 650 },
      { category: 'Transport', amount: 400 },
      { category: 'Utilities', amount: 250 },
      { category: 'Entertainment', amount: 300 },
      { category: 'Other', amount: 800 },
    ],
    balanceHistory: [
      { month: 'Jan', balance: 11200 },
      { month: 'Feb', balance: 11500 },
      { month: 'Mar', balance: 12100 },
      { month: 'Apr', balance: 12800 },
      { month: 'May', balance: 13200 },
      { month: 'Jun', balance: 13500 },
    ],
    notes: [
      {
        author: 'Mike Johnson',
        timestamp: '2026-01-11 09:30 AM',
        content: 'Initial review completed. Strong financial profile with consistent income and responsible spending habits.',
      },
      {
        author: 'Lisa Wong',
        timestamp: '2026-01-10 02:15 PM',
        content: 'Verified bank statements. All documentation checks out.',
      },
    ],
  },
  {
    id: '2',
    name: 'Marcus Williams',
    email: 'marcus.w@email.com',
    openScore: 623,
    riskLevel: 'Medium',
    monthlyIncome: 5200,
    monthlySpend: 4800,
    cashFlow: 400,
    status: 'Submitted',
    requestedAmount: 15000,
    loanPurpose: 'Debt Consolidation',
    confidenceScore: 78,
    flags: ['Income Volatility', 'Low Savings'],
    positiveFactors: [
      'Regular employment history',
      'No recent overdrafts',
    ],
    riskFactors: [
      'High debt-to-income ratio (92%)',
      'Limited savings buffer',
      'Variable monthly income',
      'Recent increase in spending',
    ],
    accountBalance: 850,
    incomeHistory: [
      { month: 'Jan', income: 4800, spending: 4500 },
      { month: 'Feb', income: 5100, spending: 4700 },
      { month: 'Mar', income: 5400, spending: 4900 },
      { month: 'Apr', income: 4900, spending: 4600 },
      { month: 'May', income: 5300, spending: 4850 },
      { month: 'Jun', income: 5200, spending: 4800 },
    ],
    spendingByCategory: [
      { category: 'Housing', amount: 1600 },
      { category: 'Food', amount: 800 },
      { category: 'Transport', amount: 550 },
      { category: 'Utilities', amount: 300 },
      { category: 'Entertainment', amount: 450 },
      { category: 'Other', amount: 1100 },
    ],
    balanceHistory: [
      { month: 'Jan', balance: 550 },
      { month: 'Feb', balance: 650 },
      { month: 'Mar', balance: 1100 },
      { month: 'Apr', balance: 800 },
      { month: 'May', balance: 950 },
      { month: 'Jun', balance: 850 },
    ],
    notes: [
      {
        author: 'Sarah Martinez',
        timestamp: '2026-01-11 08:00 AM',
        content: 'Application received. Flagged for detailed cash flow analysis.',
      },
    ],
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    openScore: 845,
    riskLevel: 'Low',
    monthlyIncome: 12000,
    monthlySpend: 5100,
    cashFlow: 6900,
    status: 'Approved',
    requestedAmount: 50000,
    loanPurpose: 'Business Expansion',
    confidenceScore: 97,
    flags: ['Excellent Cash Flow'],
    positiveFactors: [
      'Very high income stability',
      'Excellent savings (6x monthly expenses)',
      'Strong payment history',
      'Multiple verified income sources',
      'Professional account management',
    ],
    riskFactors: [],
    accountBalance: 32000,
    incomeHistory: [
      { month: 'Jan', income: 11800, spending: 5000 },
      { month: 'Feb', income: 12100, spending: 5200 },
      { month: 'Mar', income: 11900, spending: 5100 },
      { month: 'Apr', income: 12200, spending: 5000 },
      { month: 'May', income: 12000, spending: 5150 },
      { month: 'Jun', income: 12000, spending: 5100 },
    ],
    spendingByCategory: [
      { category: 'Housing', amount: 2200 },
      { category: 'Food', amount: 700 },
      { category: 'Transport', amount: 450 },
      { category: 'Utilities', amount: 350 },
      { category: 'Entertainment', amount: 600 },
      { category: 'Other', amount: 800 },
    ],
    balanceHistory: [
      { month: 'Jan', balance: 28000 },
      { month: 'Feb', balance: 29000 },
      { month: 'Mar', balance: 29800 },
      { month: 'Apr', balance: 30500 },
      { month: 'May', balance: 31200 },
      { month: 'Jun', balance: 32000 },
    ],
    notes: [
      {
        author: 'David Park',
        timestamp: '2026-01-10 04:45 PM',
        content: 'Application approved. Exceptional financial profile with strong business case.',
      },
      {
        author: 'Mike Johnson',
        timestamp: '2026-01-10 11:20 AM',
        content: 'Reviewed business plan and financial projections. Very solid proposal.',
      },
    ],
  },
  {
    id: '4',
    name: 'James Thompson',
    email: 'j.thompson@email.com',
    openScore: 456,
    riskLevel: 'High',
    monthlyIncome: 3800,
    monthlySpend: 4100,
    cashFlow: -300,
    status: 'Rejected',
    requestedAmount: 10000,
    loanPurpose: 'Personal Loan',
    confidenceScore: 62,
    flags: ['Overdrafts', 'Negative Cash Flow'],
    positiveFactors: [
      'Recent employment (3 months)',
    ],
    riskFactors: [
      'Negative cash flow',
      'Multiple overdrafts in past 3 months',
      'High spending-to-income ratio (108%)',
      'Minimal savings',
      'Short employment history',
    ],
    accountBalance: 120,
    incomeHistory: [
      { month: 'Jan', income: 3500, spending: 4000 },
      { month: 'Feb', income: 3700, spending: 4200 },
      { month: 'Mar', income: 3900, spending: 4100 },
      { month: 'Apr', income: 3800, spending: 4150 },
      { month: 'May', income: 3750, spending: 4050 },
      { month: 'Jun', income: 3800, spending: 4100 },
    ],
    spendingByCategory: [
      { category: 'Housing', amount: 1400 },
      { category: 'Food', amount: 950 },
      { category: 'Transport', amount: 600 },
      { category: 'Utilities', amount: 280 },
      { category: 'Entertainment', amount: 520 },
      { category: 'Other', amount: 350 },
    ],
    balanceHistory: [
      { month: 'Jan', balance: -150 },
      { month: 'Feb', balance: 50 },
      { month: 'Mar', balance: 200 },
      { month: 'Apr', balance: 80 },
      { month: 'May', balance: 150 },
      { month: 'Jun', balance: 120 },
    ],
    notes: [
      {
        author: 'Lisa Wong',
        timestamp: '2026-01-09 03:30 PM',
        content: 'Application rejected due to negative cash flow and insufficient savings buffer.',
      },
    ],
  },
  {
    id: '5',
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    openScore: 714,
    riskLevel: 'Low',
    monthlyIncome: 7200,
    monthlySpend: 4900,
    cashFlow: 2300,
    status: 'In Review',
    requestedAmount: 30000,
    loanPurpose: 'Education',
    confidenceScore: 89,
    flags: ['Stable Income'],
    positiveFactors: [
      'Consistent income growth',
      'Good savings habit (2.8x monthly expenses)',
      'All bills paid on time',
      'Low credit utilization',
    ],
    riskFactors: [
      'Student loan payments starting soon',
    ],
    accountBalance: 13700,
    incomeHistory: [
      { month: 'Jan', income: 6800, spending: 4700 },
      { month: 'Feb', income: 7000, spending: 4800 },
      { month: 'Mar', income: 7100, spending: 4850 },
      { month: 'Apr', income: 7200, spending: 4900 },
      { month: 'May', income: 7150, spending: 4950 },
      { month: 'Jun', income: 7200, spending: 4900 },
    ],
    spendingByCategory: [
      { category: 'Housing', amount: 1900 },
      { category: 'Food', amount: 720 },
      { category: 'Transport', amount: 380 },
      { category: 'Utilities', amount: 300 },
      { category: 'Entertainment', amount: 400 },
      { category: 'Other', amount: 1200 },
    ],
    balanceHistory: [
      { month: 'Jan', balance: 11500 },
      { month: 'Feb', balance: 12000 },
      { month: 'Mar', balance: 12600 },
      { month: 'Apr', balance: 13000 },
      { month: 'May', balance: 13400 },
      { month: 'Jun', balance: 13700 },
    ],
    notes: [
      {
        author: 'Sarah Martinez',
        timestamp: '2026-01-11 10:15 AM',
        content: 'Strong candidate. Awaiting verification of educational institution enrollment.',
      },
    ],
  },
  {
    id: '6',
    name: 'Robert Lee',
    email: 'robert.lee@email.com',
    openScore: 598,
    riskLevel: 'Medium',
    monthlyIncome: 6100,
    monthlySpend: 5400,
    cashFlow: 700,
    status: 'Submitted',
    requestedAmount: 20000,
    loanPurpose: 'Auto Loan',
    confidenceScore: 73,
    flags: ['Income Volatility'],
    positiveFactors: [
      'Long employment history (5+ years)',
      'Rent paid consistently',
    ],
    riskFactors: [
      'Income varies month-to-month',
      'Spending close to income (89%)',
      'Limited emergency fund',
    ],
    accountBalance: 2400,
    incomeHistory: [
      { month: 'Jan', income: 5800, spending: 5200 },
      { month: 'Feb', income: 6200, spending: 5500 },
      { month: 'Mar', income: 5900, spending: 5300 },
      { month: 'Apr', income: 6300, spending: 5600 },
      { month: 'May', income: 6000, spending: 5350 },
      { month: 'Jun', income: 6100, spending: 5400 },
    ],
    spendingByCategory: [
      { category: 'Housing', amount: 2000 },
      { category: 'Food', amount: 850 },
      { category: 'Transport', amount: 700 },
      { category: 'Utilities', amount: 320 },
      { category: 'Entertainment', amount: 530 },
      { category: 'Other', amount: 1000 },
    ],
    balanceHistory: [
      { month: 'Jan', balance: 2000 },
      { month: 'Feb', balance: 2200 },
      { month: 'Mar', balance: 2100 },
      { month: 'Apr', balance: 2350 },
      { month: 'May', balance: 2300 },
      { month: 'Jun', balance: 2400 },
    ],
    notes: [],
  },
];

// Lender KPI Card Component
const LenderKPICard = ({ icon, title, value, trend }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          {trend.direction === 'up' ? (
            <svg className="w-4 h-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
              <polyline points="17 18 23 18 23 12"></polyline>
            </svg>
          )}
          <span className={`text-sm font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value}
          </span>
          <span className="text-sm text-gray-500">vs last week</span>
        </div>
      )}
    </div>
  );
};

// Lender Sidebar Component
const LenderSidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Dashboard', active: true },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <svg className="w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                item.active
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon}></path>
              </svg>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Dino Bank branding */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🦕</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Dino Bank</p>
              <p className="text-xs text-gray-500">Powered by OpenScore</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// Lender Top Navigation Component
const LenderTopNav = ({ onMenuClick, onLogout }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OS</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-gray-900">OpenScore</h1>
              <p className="text-xs text-gray-500">Lender Dashboard</p>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search applicants..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right - User menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">Dino Bank Admin</p>
              <p className="text-xs text-gray-500">admin@dinobank.com</p>
            </div>
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

// Lender Application Detail Component
const LenderApplicationDetail = ({ applicationId, onBack }) => {
  const application = lenderApplications.find(a => a.id === applicationId);
  const chartRefs = useRef({});

  useEffect(() => {
    if (!application) return;

    // Income vs Spending Chart
    const incomeCtx = document.getElementById('lenderIncomeChart');
    if (incomeCtx && application.incomeHistory) {
      if (chartRefs.current.income) {
        chartRefs.current.income.destroy();
      }
      chartRefs.current.income = new Chart(incomeCtx, {
        type: 'line',
        data: {
          labels: application.incomeHistory.map(h => h.month),
          datasets: [
            {
              label: 'Income',
              data: application.incomeHistory.map(h => h.income),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.3,
              fill: false,
            },
            {
              label: 'Spending',
              data: application.incomeHistory.map(h => h.spending),
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              tension: 0.3,
              fill: false,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // Spending by Category Chart
    const spendingCtx = document.getElementById('lenderSpendingChart');
    if (spendingCtx && application.spendingByCategory) {
      if (chartRefs.current.spending) {
        chartRefs.current.spending.destroy();
      }
      chartRefs.current.spending = new Chart(spendingCtx, {
        type: 'bar',
        data: {
          labels: application.spendingByCategory.map(c => c.category),
          datasets: [{
            label: 'Spending',
            data: application.spendingByCategory.map(c => c.amount),
            backgroundColor: '#6366f1',
            borderRadius: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    // Balance History Chart
    const balanceCtx = document.getElementById('lenderBalanceChart');
    if (balanceCtx && application.balanceHistory) {
      if (chartRefs.current.balance) {
        chartRefs.current.balance.destroy();
      }
      chartRefs.current.balance = new Chart(balanceCtx, {
        type: 'line',
        data: {
          labels: application.balanceHistory.map(h => h.month),
          datasets: [{
            label: 'Balance',
            data: application.balanceHistory.map(h => h.balance),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            tension: 0.3,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    return () => {
      Object.values(chartRefs.current).forEach(chart => {
        if (chart) chart.destroy();
      });
      chartRefs.current = {};
    };
  }, [application]);

  if (!application) {
    return <div>Application not found</div>;
  }

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-50 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      {/* Top Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">{application.name}</h1>
                <p className="text-gray-600">{application.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center lg:text-left">
              <p className="text-sm text-gray-500 mb-1">OpenScore</p>
              <p className="text-3xl font-bold text-indigo-600">{application.openScore}</p>
            </div>
            <div className="text-center lg:text-left">
              <p className="text-sm text-gray-500 mb-1">Risk Level</p>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium border ${getRiskBadgeColor(application.riskLevel)}`}>
                {application.riskLevel}
              </span>
            </div>
            <div className="text-center lg:text-left">
              <p className="text-sm text-gray-500 mb-1">Confidence</p>
              <p className="text-2xl font-semibold text-gray-900">{application.confidenceScore}%</p>
            </div>
            <div className="text-center lg:text-left">
              <p className="text-sm text-gray-500 mb-1">Key Flags</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {application.flags.map((flag, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <p className="text-sm font-medium text-green-900">Monthly Income</p>
                </div>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(application.monthlyIncome)}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-orange-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <p className="text-sm font-medium text-orange-900">Monthly Spending</p>
                </div>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(application.monthlySpend)}</p>
              </div>
              <div className={`bg-gradient-to-br rounded-lg p-4 border ${
                application.cashFlow >= 0 
                  ? 'from-blue-50 to-blue-100 border-blue-200' 
                  : 'from-red-50 to-red-100 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className={`w-5 h-5 ${application.cashFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="M12 8v8"></path>
                    <path d="M8 12h8"></path>
                  </svg>
                  <p className={`text-sm font-medium ${application.cashFlow >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                    Net Cash Flow
                  </p>
                </div>
                <p className={`text-2xl font-bold ${application.cashFlow >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                  {formatCurrency(application.cashFlow)}
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Income vs Spending Trend</h2>
            <div className="h-64">
              <canvas id="lenderIncomeChart"></canvas>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
              <div className="h-56">
                <canvas id="lenderSpendingChart"></canvas>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Balance History</h2>
              <div className="h-56">
                <canvas id="lenderBalanceChart"></canvas>
              </div>
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <h3 className="font-medium text-gray-900">Positive Factors</h3>
                </div>
                <ul className="space-y-2">
                  {application.positiveFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <h3 className="font-medium text-gray-900">Risk Factors</h3>
                </div>
                {application.riskFactors.length > 0 ? (
                  <ul className="space-y-2">
                    {application.riskFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No significant risk factors identified</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes Timeline</h2>
            {application.notes.length > 0 ? (
              <div className="space-y-4">
                {application.notes.map((note, idx) => (
                  <div key={idx} className="border-l-2 border-indigo-200 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{note.author}</p>
                      <span className="text-xs text-gray-500">•</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {note.timestamp}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No notes yet</p>
            )}
          </div>
        </div>

        {/* Right Sidebar - Decision Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Request</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Requested Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(application.requestedAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Purpose</p>
                <p className="text-gray-900">{application.loanPurpose}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${
                  application.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                  application.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                  application.status === 'In Review' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {application.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Approve Application
              </button>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors">
                Reject Application
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-medium transition-colors">
                Request More Info
              </button>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Decision Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Add notes about your decision..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Lender Queue Dashboard Component
const LenderQueueDashboard = ({ onViewApplication }) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const sortedApplications = [...lenderApplications].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    if (typeof aVal === 'number') {
      return (aVal - bVal) * modifier;
    }
    return String(aVal).localeCompare(String(bVal)) * modifier;
  });
  
  const applications = sortedApplications;
  
  const totalApplications = applications.length;
  const pendingReviews = applications.filter(a => a.status === 'In Review' || a.status === 'Submitted').length;
  const approvedToday = applications.filter(a => a.status === 'Approved').length;
  const averageScore = Math.round(applications.reduce((sum, a) => sum + a.openScore, 0) / applications.length);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'High': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-50 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Review': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LenderKPICard
          icon={<svg className="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
          title="Total Applications"
          value={totalApplications.toString()}
          trend={{ direction: 'up', value: '+12%' }}
        />
        <LenderKPICard
          icon={<svg className="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
          title="Pending Reviews"
          value={pendingReviews.toString()}
          trend={{ direction: 'down', value: '-8%' }}
        />
        <LenderKPICard
          icon={<svg className="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
          title="Approved Today"
          value={approvedToday.toString()}
          trend={{ direction: 'up', value: '+23%' }}
        />
        <LenderKPICard
          icon={<svg className="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>}
          title="Average OpenScore"
          value={averageScore.toString()}
          trend={{ direction: 'up', value: '+5%' }}
        />
      </div>

      {/* Application Queue Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Application Queue</h2>
          <p className="text-sm text-gray-500 mt-1">Review and process borrower applications</p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-medium text-gray-600 px-6 py-3 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-6 py-3 uppercase tracking-wider">
                  <button onClick={() => handleSort('openScore')} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                    OpenScore
                    <svg className={`w-4 h-4 ${sortField === 'openScore' ? 'text-indigo-600' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {sortField === 'openScore' && sortDirection === 'asc' ? (
                        <path d="M18 15l-6-6-6 6"/>
                      ) : sortField === 'openScore' && sortDirection === 'desc' ? (
                        <path d="M6 9l6 6 6-6"/>
                      ) : (
                        <><path d="M8 9l4-4 4 4"/><path d="M16 15l-4 4-4-4"/></>
                      )}
                    </svg>
                  </button>
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-6 py-3 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-6 py-3 uppercase tracking-wider">
                  <button onClick={() => handleSort('monthlyIncome')} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                    Monthly Income
                    <svg className={`w-4 h-4 ${sortField === 'monthlyIncome' ? 'text-indigo-600' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {sortField === 'monthlyIncome' && sortDirection === 'asc' ? (
                        <path d="M18 15l-6-6-6 6"/>
                      ) : sortField === 'monthlyIncome' && sortDirection === 'desc' ? (
                        <path d="M6 9l6 6 6-6"/>
                      ) : (
                        <><path d="M8 9l4-4 4 4"/><path d="M16 15l-4 4-4-4"/></>
                      )}
                    </svg>
                  </button>
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-6 py-3 uppercase tracking-wider">
                  <button onClick={() => handleSort('monthlySpend')} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                    Monthly Spend
                    <svg className={`w-4 h-4 ${sortField === 'monthlySpend' ? 'text-indigo-600' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {sortField === 'monthlySpend' && sortDirection === 'asc' ? (
                        <path d="M18 15l-6-6-6 6"/>
                      ) : sortField === 'monthlySpend' && sortDirection === 'desc' ? (
                        <path d="M6 9l6 6 6-6"/>
                      ) : (
                        <><path d="M8 9l4-4 4 4"/><path d="M16 15l-4 4-4-4"/></>
                      )}
                    </svg>
                  </button>
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-6 py-3 uppercase tracking-wider">
                  <button onClick={() => handleSort('cashFlow')} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                    Cash Flow
                    <svg className={`w-4 h-4 ${sortField === 'cashFlow' ? 'text-indigo-600' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {sortField === 'cashFlow' && sortDirection === 'asc' ? (
                        <path d="M18 15l-6-6-6 6"/>
                      ) : sortField === 'cashFlow' && sortDirection === 'desc' ? (
                        <path d="M6 9l6 6 6-6"/>
                      ) : (
                        <><path d="M8 9l4-4 4 4"/><path d="M16 15l-4 4-4-4"/></>
                      )}
                    </svg>
                  </button>
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-6 py-3 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-6 py-3 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{app.name}</p>
                      <p className="text-sm text-gray-500">{app.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getRiskColor(app.riskLevel)}`} />
                      <span className="text-lg font-semibold text-gray-900">{app.openScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getRiskBadgeColor(app.riskLevel)}`}>
                      {app.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {formatCurrency(app.monthlyIncome)}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {formatCurrency(app.monthlySpend)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={app.cashFlow >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {formatCurrency(app.cashFlow)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadgeColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewApplication(app.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-100">
          {applications.map((app) => (
            <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">{app.name}</p>
                  <p className="text-sm text-gray-500">{app.email}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadgeColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">OpenScore</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getRiskColor(app.riskLevel)}`} />
                    <span className="text-lg font-semibold text-gray-900">{app.openScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getRiskBadgeColor(app.riskLevel)}`}>
                    {app.riskLevel}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Monthly Income</p>
                  <p className="font-medium text-gray-900">{formatCurrency(app.monthlyIncome)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cash Flow</p>
                  <p className={app.cashFlow >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {formatCurrency(app.cashFlow)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onViewApplication(app.id)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Banker Dashboard Component (New Lender Dashboard)
const BankerDashboard = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleViewApplication = (id) => {
    setSelectedApplicationId(id);
    setCurrentView('detail');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedApplicationId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LenderTopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} />
      <LenderSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64 pt-16">
        <main className="p-4 md:p-6 lg:p-8">
          {currentView === 'dashboard' ? (
            <LenderQueueDashboard onViewApplication={handleViewApplication} />
          ) : (
            <LenderApplicationDetail 
              applicationId={selectedApplicationId} 
              onBack={handleBackToDashboard}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// Financial Graphs Component
const FinancialGraphs = ({ user, onLogout, onBackToDashboard }) => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRefs = useRef({});

  // Get access token from URL hash or sessionStorage
  const getAccessToken = () => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        sessionStorage.setItem('access_token', token);
        return token;
      }
    }
    return sessionStorage.getItem('access_token');
  };

  // Fetch all data
  const fetchAllData = async (token) => {
    try {
      const accountsData = await apiCall('/api/data/accounts', 'GET', token);
      setAccounts(accountsData);

      const transactionsData = await apiCall('/api/data/transactions?limit=500', 'GET', token);
      setTransactions(transactionsData);

      const summaryData = await apiCall('/api/data/summary', 'GET', token);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (token && user) {
      fetchAllData(token);
    }
  }, [user]);

  // Create charts when data is available
  useEffect(() => {
    if (loading || !accounts.length || !transactions.length) return;

    // Account Balances Pie Chart
    const accountsCtx = document.getElementById('accountsChart');
    if (accountsCtx) {
      if (chartRefs.current.accounts) {
        chartRefs.current.accounts.destroy();
      }
      const accountLabels = accounts.map(acc => acc.name || 'Unknown');
      const accountBalances = accounts.map(acc => Math.abs(acc.balances?.current || 0));

      chartRefs.current.accounts = new Chart(accountsCtx, {
        type: 'doughnut',
        data: {
          labels: accountLabels,
          datasets: [{
            data: accountBalances,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(20, 184, 166, 0.8)',
              'rgba(251, 146, 60, 0.8)',
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Account Balances Distribution',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // Spending by Category Bar Chart
    const categoriesCtx = document.getElementById('categoriesChart');
    if (categoriesCtx && summary?.topCategories) {
      if (chartRefs.current.categories) {
        chartRefs.current.categories.destroy();
      }
      const categoryData = summary.topCategories.slice(0, 10);
      const categoryLabels = categoryData.map(cat => cat.category || 'Unknown');
      const categorySpend = categoryData.map(cat => Math.abs(cat.spend || 0));

      chartRefs.current.categories = new Chart(categoriesCtx, {
        type: 'bar',
        data: {
          labels: categoryLabels,
          datasets: [{
            label: 'Spending ($)',
            data: categorySpend,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Top Spending Categories',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    }

    // Transaction Trends Over Time (Line Chart)
    const trendsCtx = document.getElementById('trendsChart');
    if (trendsCtx && transactions.length > 0) {
      if (chartRefs.current.trends) {
        chartRefs.current.trends.destroy();
      }

      // Group transactions by date
      const transactionsByDate = {};
      transactions.forEach(txn => {
        const date = txn.date || txn.authorized_date;
        if (date) {
          if (!transactionsByDate[date]) {
            transactionsByDate[date] = { income: 0, expenses: 0 };
          }
          const amount = Math.abs(txn.amount || 0);
          if (txn.amount > 0) {
            transactionsByDate[date].income += amount;
          } else {
            transactionsByDate[date].expenses += amount;
          }
        }
      });

      const sortedDates = Object.keys(transactionsByDate).sort();
      const expenseData = sortedDates.map(date => Math.abs(transactionsByDate[date].expenses));

      chartRefs.current.trends = new Chart(trendsCtx, {
        type: 'line',
        data: {
          labels: sortedDates,
          datasets: [{
            label: 'Daily Expenses',
            data: expenseData,
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Expense Trends Over Time',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              display: true
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    }

    // Spending by Account (Bar Chart)
    const accountSpendingCtx = document.getElementById('accountSpendingChart');
    if (accountSpendingCtx && transactions.length > 0) {
      if (chartRefs.current.accountSpending) {
        chartRefs.current.accountSpending.destroy();
      }

      // Calculate spending by account
      const spendingByAccount = {};
      transactions.forEach(txn => {
        const accountId = txn.account_id;
        if (accountId && txn.amount < 0) {
          if (!spendingByAccount[accountId]) {
            spendingByAccount[accountId] = 0;
          }
          spendingByAccount[accountId] += Math.abs(txn.amount);
        }
      });

      // Match account IDs to account names
      const accountMap = {};
      accounts.forEach(acc => {
        accountMap[acc.account_id] = acc.name || 'Unknown Account';
      });

      const accountSpendingLabels = Object.keys(spendingByAccount).map(id => accountMap[id] || id);
      const accountSpendingData = Object.values(spendingByAccount);

      chartRefs.current.accountSpending = new Chart(accountSpendingCtx, {
        type: 'bar',
        data: {
          labels: accountSpendingLabels,
          datasets: [{
            label: 'Total Spending ($)',
            data: accountSpendingData,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Spending by Account',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    }

    // Cleanup function
    return () => {
      Object.values(chartRefs.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [accounts, transactions, summary, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-indigo-600 text-xl">Loading financial data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-md">
          <div className="text-red-600 mb-4">Error loading data: {error}</div>
          <button
            onClick={onBackToDashboard}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
              <button
                onClick={onBackToDashboard}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Back to Dashboard
              </button>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Financial Analytics</h1>
            <p className="text-xl text-gray-600">
              Visual insights into your financial data
            </p>
          </div>

          {/* Financial Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {summary.totals?.current_balance !== undefined && (
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-sm border border-gray-200 p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Total Balance</p>
                  <p className="text-3xl font-bold">
                    ${summary.totals.current_balance.toLocaleString()}
                  </p>
                </div>
              )}
              {accounts.length > 0 && (
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-sm border border-gray-200 p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Total Accounts</p>
                  <p className="text-3xl font-bold">{accounts.length}</p>
                </div>
              )}
              {transactions.length > 0 && (
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-sm border border-gray-200 p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Total Transactions</p>
                  <p className="text-3xl font-bold">{transactions.length}</p>
                </div>
              )}
            </div>
          )}

          {/* Accounts Overview */}
          {accounts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Your Accounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <div key={account.account_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{account.type} • {account.subtype}</p>
                    {account.balances?.current !== undefined && (
                      <p className="text-lg font-bold text-blue-600">
                        ${account.balances.current.toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Categories Summary */}
          {summary?.topCategories && summary.topCategories.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Top Spending Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {summary.topCategories.map((cat, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">{cat.category || 'Unknown'}</p>
                    <p className="text-xl font-bold text-red-600">${cat.spend?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Account Balances Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="h-80">
                <canvas id="accountsChart"></canvas>
              </div>
            </div>

            {/* Spending by Category Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="h-80">
                <canvas id="categoriesChart"></canvas>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Transaction Trends Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="h-80">
                <canvas id="trendsChart"></canvas>
              </div>
            </div>

            {/* Spending by Account Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="h-80">
                <canvas id="accountSpendingChart"></canvas>
              </div>
            </div>
          </div>

          {/* Monthly Spend Chart */}
          {summary?.monthlySpend && summary.monthlySpend.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Monthly Spending</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {summary.monthlySpend.slice(-12).map((month, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">{month.month}</p>
                    <p className="text-xl font-bold text-orange-600">${month.spend?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions Table */}
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
                    {transactions.slice(0, 20).map((txn) => (
                      <tr key={txn.transaction_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{txn.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{txn.name}</td>
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
        </div>
      </main>
    </div>
  );
};

// Credit Score Component
const CreditScore = ({ user, onLogout, onBackToDashboard, onNavigateToSimulator }) => {
  const [creditScore, setCreditScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showGraphs, setShowGraphs] = useState(false);
  const [graphAccounts, setGraphAccounts] = useState([]);
  const [graphTransactions, setGraphTransactions] = useState([]);
  const [graphSummary, setGraphSummary] = useState(null);
  const [graphsLoading, setGraphsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chartRefs = useRef({});

  // Get access token from URL hash or sessionStorage
  const getAccessToken = () => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        sessionStorage.setItem('access_token', token);
        return token;
      }
    }
    return sessionStorage.getItem('access_token');
  };

  // Fetch credit score
  useEffect(() => {
    const fetchCreditScore = async () => {
      const token = getAccessToken();
      if (!token) {
        setError('No access token available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Get education score from localStorage
        const educationScore = localStorage.getItem('educationScore') || 75;
        console.log('Fetching credit score from /api/score/calculate with educationScore:', educationScore);
        const scoreData = await apiCall(`/api/score/calculate?education_score=${educationScore}`, 'GET', token);
        console.log('Credit score data received:', scoreData);
        setCreditScore(scoreData);
      } catch (err) {
        console.error('Error fetching credit score:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        // Provide more helpful error message
        let errorMessage = err.message;
        if (err.message === 'Failed to fetch' || err.message.includes('fetch')) {
          errorMessage = 'Unable to connect to backend server. Please ensure the backend is running on http://localhost:5000';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCreditScore();
    }
  }, [user]);

  // Handle Gemini Analysis
  const handleGeminiAnalysis = async () => {
    const token = getAccessToken();
    if (!token) {
      setAnalysisError('No access token available');
      return;
    }

    try {
      setAnalysisLoading(true);
      setAnalysisError(null);
      setShowAnalysis(true);
      const analysisData = await apiCall('/api/score/analyze', 'GET', token);
      setAnalysis(analysisData.analysis);
    } catch (err) {
      console.error('Error fetching Gemini analysis:', err);
      setAnalysisError(err.message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Handle Chat Message
  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const token = getAccessToken();
    if (!token) {
      return;
    }

    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message to chat
    const newUserMessage = { role: 'user', content: userMessage };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatLoading(true);

    try {
      const response = await apiCall('/api/score/chat', 'POST', token, { message: userMessage });
      const assistantMessage = { role: 'assistant', content: response.response };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending chat message:', err);
      const errorMessage = { role: 'assistant', content: `Error: ${err.message}`, error: true };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle View Financial Graphs
  const handleViewGraphs = async () => {
    if (showGraphs) {
      // If already showing, just toggle off
      setShowGraphs(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      return;
    }

    try {
      setGraphsLoading(true);
      setShowGraphs(true);
      
      const accountsData = await apiCall('/api/data/accounts', 'GET', token);
      setGraphAccounts(accountsData);

      const transactionsData = await apiCall('/api/data/transactions?limit=500', 'GET', token);
      setGraphTransactions(transactionsData);

      const summaryData = await apiCall('/api/data/summary', 'GET', token);
      setGraphSummary(summaryData);
    } catch (err) {
      console.error('Error fetching graph data:', err);
    } finally {
      setGraphsLoading(false);
    }
  };

  // Create charts when graph data is available
  useEffect(() => {
    if (!showGraphs || graphsLoading || !graphAccounts.length || !graphTransactions.length) return;

    // Account Balances Chart
    const accountsCtx = document.getElementById('creditScoreAccountsChart');
    if (accountsCtx) {
      if (chartRefs.current.accounts) {
        chartRefs.current.accounts.destroy();
      }
      const accountLabels = graphAccounts.map(acc => acc.name || 'Unknown');
      const accountBalances = graphAccounts.map(acc => Math.abs(acc.balances?.current || 0));

      chartRefs.current.accounts = new Chart(accountsCtx, {
        type: 'doughnut',
        data: {
          labels: accountLabels,
          datasets: [{
            data: accountBalances,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Account Balances Distribution',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // Spending by Category Chart
    const categoriesCtx = document.getElementById('creditScoreCategoriesChart');
    if (categoriesCtx && graphSummary?.topCategories) {
      if (chartRefs.current.categories) {
        chartRefs.current.categories.destroy();
      }
      const categoryData = graphSummary.topCategories.slice(0, 10);
      const categoryLabels = categoryData.map(cat => cat.category || 'Unknown');
      const categorySpend = categoryData.map(cat => Math.abs(cat.spend || 0));

      chartRefs.current.categories = new Chart(categoriesCtx, {
        type: 'bar',
        data: {
          labels: categoryLabels,
          datasets: [{
            label: 'Spending ($)',
            data: categorySpend,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Top Spending Categories',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          }
        }
      });
    }

    // Cleanup function
    return () => {
      Object.values(chartRefs.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [showGraphs, graphsLoading, graphAccounts, graphTransactions, graphSummary]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-indigo-600 text-xl">Loading credit score...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-md">
          <div className="text-red-600 mb-4">Error loading credit score: {error}</div>
          <button
            onClick={onBackToDashboard}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
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
              <button
                onClick={onBackToDashboard}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Back to Dashboard
              </button>
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
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center py-8 mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Credit Score</h1>
            <p className="text-xl text-gray-600">
              AI-powered credit assessment based on your financial data
            </p>
          </div>

          {creditScore && (
            <>
              {/* Main Score Display */}
              <div className={`bg-gradient-to-br ${getScoreColor(creditScore.credit_score)} rounded-2xl shadow-lg border border-gray-200 p-8 mb-6 text-white`}>
                <div className="text-center">
                  <p className="text-lg opacity-90 mb-4">Your Credit Score</p>
                  <div className="text-8xl font-bold mb-2">{creditScore.credit_score}</div>
                  <p className="text-2xl font-semibold opacity-90">{getScoreLabel(creditScore.credit_score)}</p>
                </div>
              </div>

              {/* Score Breakdown */}
              {creditScore.breakdown && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6">Score Breakdown</h2>
                  <div className="space-y-4">
                    {Object.entries(creditScore.breakdown).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 capitalize">
                              {key.replace(/_/g, ' ')}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Weight: {value.weight}% | Score: {value.score.toFixed(1)}/100
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">
                              +{value.weighted_contribution.toFixed(1)}
                            </p>
                            <p className="text-xs text-gray-500">points</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${value.score}%` }}
                          />
                        </div>
                        {value.amount !== undefined && (
                          <p className="text-sm text-gray-600 mt-1">
                            Income Amount: ${value.amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={handleViewGraphs}
                        className="py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="20" x2="18" y2="10"></line>
                          <line x1="12" y1="20" x2="12" y2="4"></line>
                          <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                        {showGraphs ? 'Hide Financial Data' : 'Show Financial Data'}
                      </button>
                      <button
                        onClick={handleGeminiAnalysis}
                        disabled={analysisLoading}
                        className={`py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-sm ${analysisLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
                          <path d="M12 12V2a10 10 0 0 1 10 10H12Z"></path>
                        </svg>
                        {analysisLoading ? 'Analyzing...' : 'Gemini Analysis'}
                      </button>
                      <button
                        onClick={onNavigateToSimulator}
                        className="py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Score Simulator
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Data Display */}
              {showGraphs && (
                <div className="space-y-6 mb-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold mb-6">Financial Data</h2>
                    {graphsLoading && (
                      <div className="text-center py-8">
                        <div className="text-indigo-600 text-lg">Loading financial data...</div>
                      </div>
                    )}
                    {!graphsLoading && (
                      <>
                        {/* Financial Summary Cards */}
                        {graphSummary && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {graphSummary.totals?.current_balance !== undefined && (
                              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-sm border border-gray-200 p-6 text-white">
                                <p className="text-sm opacity-90 mb-2">Total Balance</p>
                                <p className="text-3xl font-bold">
                                  ${graphSummary.totals.current_balance.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {graphAccounts.length > 0 && (
                              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-sm border border-gray-200 p-6 text-white">
                                <p className="text-sm opacity-90 mb-2">Total Accounts</p>
                                <p className="text-3xl font-bold">{graphAccounts.length}</p>
                              </div>
                            )}
                            {graphTransactions.length > 0 && (
                              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-sm border border-gray-200 p-6 text-white">
                                <p className="text-sm opacity-90 mb-2">Total Transactions</p>
                                <p className="text-3xl font-bold">{graphTransactions.length}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Accounts Overview */}
                        {graphAccounts.length > 0 && (
                          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-xl font-bold mb-4">Your Accounts</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {graphAccounts.map((account) => (
                                <div key={account.account_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <h4 className="font-semibold text-gray-900">{account.name}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{account.type} • {account.subtype}</p>
                                  {account.balances?.current !== undefined && (
                                    <p className="text-lg font-bold text-blue-600">
                                      ${account.balances.current.toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Top Categories Summary */}
                        {graphSummary?.topCategories && graphSummary.topCategories.length > 0 && (
                          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-xl font-bold mb-4">Top Spending Categories</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                              {graphSummary.topCategories.map((cat, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-4 text-center">
                                  <p className="text-sm text-gray-600 mb-2">{cat.category || 'Unknown'}</p>
                                  <p className="text-xl font-bold text-red-600">${cat.spend?.toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Charts */}
                        {graphAccounts.length > 0 && graphTransactions.length > 0 && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Account Balances Chart */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                              <div className="h-80">
                                <canvas id="creditScoreAccountsChart"></canvas>
                              </div>
                            </div>

                            {/* Spending by Category Chart */}
                            {graphSummary?.topCategories && (
                              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <div className="h-80">
                                  <canvas id="creditScoreCategoriesChart"></canvas>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Monthly Spending */}
                        {graphSummary?.monthlySpend && graphSummary.monthlySpend.length > 0 && (
                          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                            <h3 className="text-xl font-bold mb-4">Monthly Spending</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {graphSummary.monthlySpend.slice(-12).map((month, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                  <p className="text-sm text-gray-600 mb-2">{month.month}</p>
                                  <p className="text-xl font-bold text-orange-600">${month.spend?.toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Transactions Table */}
                        {graphTransactions.length > 0 && (
                          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
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
                                  {graphTransactions.slice(0, 20).map((txn) => (
                                    <tr key={txn.transaction_id} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">{txn.date}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">{txn.name}</td>
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
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Gemini Analysis Modal/Display */}
              {showAnalysis && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <svg className="w-6 h-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
                        <path d="M12 12V2a10 10 0 0 1 10 10H12Z"></path>
                      </svg>
                      Gemini AI Analysis
                    </h2>
                    <button
                      onClick={() => setShowAnalysis(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  {analysisLoading && (
                    <div className="text-center py-8">
                      <div className="text-amber-600 text-lg">Generating AI analysis...</div>
                    </div>
                  )}
                  {analysisError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                      Error: {analysisError}
                    </div>
                  )}
                  {analysis && !analysisLoading && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Initial Analysis</h3>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {analysis}
                      </p>
                    </div>
                  )}
                  
                  {/* Chat Interface */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat with Your Credit Advisor</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                      {chatMessages.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                          <p>Ask me anything about your credit score or financial situation!</p>
                          <p className="text-sm mt-2">Example: "How will my credit score change if I pay $500 more rent this month?"</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {chatMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  msg.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : msg.error
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-white text-gray-800 border border-gray-200'
                                }`}
                              >
                                <p className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                          {chatLoading && (
                            <div className="flex justify-start">
                              <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleChatSend} className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about your credit score or financial situation..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        disabled={chatLoading}
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || chatLoading}
                        className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// Customer Dashboard Component
// Credit Score Simulator Component
const CreditScoreSimulator = ({ user, onLogout, onBackToCreditScore, initialBreakdown }) => {
  // Initialize sliders with actual values if available, otherwise use defaults
  const [financialAccounts, setFinancialAccounts] = useState(
    initialBreakdown?.financial_accounts?.score || 50
  );
  const [alternativeIncome, setAlternativeIncome] = useState(
    initialBreakdown?.alternative_income?.score || 50
  );
  const [educationLicenses, setEducationLicenses] = useState(
    initialBreakdown?.education_licenses?.score || 50
  );
  const [cashFlowVolatility, setCashFlowVolatility] = useState(
    initialBreakdown?.cash_flow_volatility?.score || 50
  );

  // Calculate simulated score based on slider values
  const calculateSimulatedScore = () => {
    return Math.round(
      financialAccounts * 0.40 +
      alternativeIncome * 0.30 +
      educationLicenses * 0.10 +
      cashFlowVolatility * 0.20
    );
  };

  const simulatedScore = calculateSimulatedScore();

  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 75) return 'from-green-500 to-emerald-500';
    if (score >= 50) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-orange-500';
  };

  // Get score label
  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 35) return 'Poor';
    return 'Very Poor';
  };

  const sliders = [
    {
      id: 'financial_accounts',
      label: 'Financial Accounts',
      description: 'Investments, recurring payments, account diversity',
      weight: 40,
      value: financialAccounts,
      setValue: setFinancialAccounts,
      color: 'indigo',
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      )
    },
    {
      id: 'alternative_income',
      label: 'Alternative Income',
      description: 'Gig economy, freelance, side hustle income',
      weight: 30,
      value: alternativeIncome,
      setValue: setAlternativeIncome,
      color: 'purple',
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      id: 'education_licenses',
      label: 'Education & Licenses',
      description: 'Degrees, certifications, professional licenses',
      weight: 10,
      value: educationLicenses,
      setValue: setEducationLicenses,
      color: 'amber',
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
        </svg>
      )
    },
    {
      id: 'cash_flow_volatility',
      label: 'Cash Flow Stability',
      description: 'Consistency of income and expenses',
      weight: 20,
      value: cashFlowVolatility,
      setValue: setCashFlowVolatility,
      color: 'teal',
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      )
    }
  ];

  const colorClasses = {
    indigo: {
      bg: 'bg-indigo-500',
      light: 'bg-indigo-100',
      text: 'text-indigo-600',
      border: 'border-indigo-200'
    },
    purple: {
      bg: 'bg-purple-500',
      light: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
    amber: {
      bg: 'bg-amber-500',
      light: 'bg-amber-100',
      text: 'text-amber-600',
      border: 'border-amber-200'
    },
    teal: {
      bg: 'bg-teal-500',
      light: 'bg-teal-100',
      text: 'text-teal-600',
      border: 'border-teal-200'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
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
              <button
                onClick={onBackToCreditScore}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Score
              </button>
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                {user.picture && (
                  <img src={user.picture} alt="User" className="w-8 h-8 rounded-full border-2 border-emerald-500" />
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
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Score Simulator</h1>
            <p className="text-gray-600">
              Adjust the sliders to see how different factors affect your credit score
            </p>
          </div>

          {/* Three Column Layout: Left Sliders | Score | Right Sliders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Sliders - Financial Accounts & Alternative Income */}
            <div className="space-y-4">
              {sliders.slice(0, 2).map((slider) => {
                const colors = colorClasses[slider.color];
                
                return (
                  <div
                    key={slider.id}
                    className={`bg-white rounded-xl shadow-sm border ${colors.border} p-5 transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 ${colors.light} ${colors.text} rounded-lg`}>
                        {slider.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{slider.label}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{Math.round(slider.value)}</div>
                      </div>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={slider.value}
                      onChange={(e) => slider.setValue(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${
                          slider.color === 'indigo' ? '#6366f1' :
                          slider.color === 'purple' ? '#a855f7' :
                          slider.color === 'amber' ? '#f59e0b' : '#14b8a6'
                        } ${slider.value}%, #e5e7eb ${slider.value}%)`
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Center - Simulated Score Display */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Simulated Score
                </div>
                <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br ${getScoreColor(simulatedScore)} shadow-lg mb-3`}>
                  <span className="text-4xl font-bold text-white">{simulatedScore}</span>
                </div>
                <div className="text-lg font-semibold text-gray-700">{getScoreLabel(simulatedScore)}</div>
                <div className="text-xs text-gray-500 mt-1">out of 100</div>
              </div>

              {/* Score Breakdown Bar */}
              <div className="mt-6">
                <div className="flex h-3 rounded-full overflow-hidden shadow-inner bg-gray-200">
                  <div
                    className="bg-indigo-500 transition-all duration-300"
                    style={{ width: `${financialAccounts * 0.40}%` }}
                    title={`Financial Accounts: ${(financialAccounts * 0.40).toFixed(1)} pts`}
                  />
                  <div
                    className="bg-purple-500 transition-all duration-300"
                    style={{ width: `${alternativeIncome * 0.30}%` }}
                    title={`Alternative Income: ${(alternativeIncome * 0.30).toFixed(1)} pts`}
                  />
                  <div
                    className="bg-amber-500 transition-all duration-300"
                    style={{ width: `${educationLicenses * 0.10}%` }}
                    title={`Education: ${(educationLicenses * 0.10).toFixed(1)} pts`}
                  />
                  <div
                    className="bg-teal-500 transition-all duration-300"
                    style={{ width: `${cashFlowVolatility * 0.20}%` }}
                    title={`Cash Flow: ${(cashFlowVolatility * 0.20).toFixed(1)} pts`}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Mini Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {sliders.map((slider) => {
                  const colors = colorClasses[slider.color];
                  return (
                    <div key={slider.id} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded ${colors.bg}`}></div>
                      <span className="text-xs text-gray-500">{slider.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Sliders - Education & Cash Flow */}
            <div className="space-y-4">
              {sliders.slice(2, 4).map((slider) => {
                const colors = colorClasses[slider.color];
                
                return (
                  <div
                    key={slider.id}
                    className={`bg-white rounded-xl shadow-sm border ${colors.border} p-5 transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 ${colors.light} ${colors.text} rounded-lg`}>
                        {slider.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{slider.label}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{Math.round(slider.value)}</div>
                      </div>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={slider.value}
                      onChange={(e) => slider.setValue(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${
                          slider.color === 'indigo' ? '#6366f1' :
                          slider.color === 'purple' ? '#a855f7' :
                          slider.color === 'amber' ? '#f59e0b' : '#14b8a6'
                        } ${slider.value}%, #e5e7eb ${slider.value}%)`
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Score Factors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sliders.map((slider) => {
                const colors = colorClasses[slider.color];
                return (
                  <div key={slider.id} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${colors.bg}`}></div>
                    <div className="text-sm font-medium text-gray-700">{slider.label}</div>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Adjust the sliders above to see how different factors affect your overall credit score.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

const CustomerDashboard = ({ user, onLogout, onNavigateToCreditScore }) => {
  const [connectedSources, setConnectedSources] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  
  // Education credentials state
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [educationData, setEducationData] = useState(() => {
    const saved = localStorage.getItem('educationCredentials');
    return saved ? JSON.parse(saved) : {
      highSchool: false,
      associates: false,
      bachelors: false,
      masters: false,
      doctorate: false,
      certifications: 0
    };
  });

  // Get access token from URL hash or sessionStorage
  const getAccessToken = () => {

    const hash = window.location.hash;

    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');

      if (token) {
        sessionStorage.setItem('access_token', token);
        return token;
      }
    }
    // Try to get from sessionStorage if available
    const storedToken = sessionStorage.getItem('access_token');
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

  // Load data and profiles on component mount
  useEffect(() => {
    const token = getAccessToken();
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
      id: 'education',
      name: 'Education Credentials',
      iconPath: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>',
      type: 'modal',
      provider: 'Add Credentials',
      description: 'Degrees (high school to doctorate) and professional certifications',
      emoji: '🎓'
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

  // Calculate education score: 30 per degree, 20 per certification, cap at 100
  const calculateEducationScore = (data) => {
    let score = 0;
    if (data.highSchool) score += 30;
    if (data.associates) score += 30;
    if (data.bachelors) score += 30;
    if (data.masters) score += 30;
    if (data.doctorate) score += 30;
    score += (data.certifications || 0) * 20;
    return Math.min(score, 100);
  };

  const saveEducationData = (data) => {
    setEducationData(data);
    localStorage.setItem('educationCredentials', JSON.stringify(data));
    localStorage.setItem('educationScore', calculateEducationScore(data));
    if (!connectedSources.includes('education')) {
      setConnectedSources([...connectedSources, 'education']);
    }
    setShowEducationModal(false);
  };

  const getEducationScore = () => {
    const saved = localStorage.getItem('educationScore');
    return saved ? parseInt(saved) : calculateEducationScore(educationData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OS</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-gray-900">OpenScore</h1>
              <p className="text-xs text-gray-500">Customer Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              {user.picture ? (
                <img src={user.picture} alt="User" className="w-9 h-9 rounded-full" />
              ) : (
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              )}
            </div>
            <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Connect Your Financial Data</h2>
              <p className="text-sm text-gray-500 mt-1">Link your accounts or upload documents to get your comprehensive credit score</p>
            </div>
            <div className="p-6 flex items-center gap-4">
              {user.picture ? (
                <img src={user.picture} alt="User" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Data Sources</h2>
              <p className="text-sm text-gray-500 mt-1">Connect your financial accounts and upload documents</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataSources.map(source => (
                  <DataSourceCard
                    key={source.id}
                    source={source}
                    isConnected={connectedSources.includes(source.id)}
                    onConnect={() => connectSource(source.id)}
                    onUpload={(files) => handleFileUpload(source.id, files)}
                    onModalOpen={source.id === 'education' ? () => setShowEducationModal(true) : undefined}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Education Credentials Modal */}
          {showEducationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Education Credentials</h2>
                  <button
                    onClick={() => setShowEducationModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Degrees Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Highest Education Level</h3>
                    <p className="text-xs text-gray-500 mb-3">Select all degrees you have earned</p>
                    <div className="space-y-2">
                      {[
                        { key: 'highSchool', label: 'High School Diploma / GED' },
                        { key: 'associates', label: "Associate's Degree" },
                        { key: 'bachelors', label: "Bachelor's Degree" },
                        { key: 'masters', label: "Master's Degree" },
                        { key: 'doctorate', label: 'Doctorate / PhD' }
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={educationData[key]}
                            onChange={(e) => setEducationData({ ...educationData, [key]: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Certifications Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Professional Certifications</h3>
                    <p className="text-xs text-gray-500 mb-3">How many professional certifications do you have?</p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setEducationData({ ...educationData, certifications: Math.max(0, educationData.certifications - 1) })}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      <span className="text-2xl font-bold text-gray-900 w-12 text-center">{educationData.certifications}</span>
                      <button
                        onClick={() => setEducationData({ ...educationData, certifications: educationData.certifications + 1 })}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => saveEducationData(educationData)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Save Credentials
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Load Sandbox Data Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-2">Load Test Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Load sandbox test data to simulate your financial profile
            </p>
            <button
              onClick={loadSandboxData}
              disabled={dataLoading}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                dataLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm'
              }`}
            >
              {dataLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"></circle>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" x2="12" y1="15" y2="3"></line>
                  </svg>
                  Load Sandbox Data
                </>
              )}
            </button>
            {dataError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {dataError}
              </div>
            )}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

          {/* View Credit Score Button */}
          <div className="mt-6">
            {accounts.length === 0 && transactions.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg className="w-6 h-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <h3 className="text-lg font-semibold text-amber-900">Load a Demo Profile First</h3>
                </div>
                <p className="text-amber-700 mb-4">
                  Select and load a demo profile above to view your credit score.
                </p>
                <button
                  disabled
                  className="w-full py-3 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  View Your Credit Score
                </button>
              </div>
            ) : (
              <button
                onClick={onNavigateToCreditScore}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                View Your Credit Score
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Landing Page Component
function LandingPage({ onGetStarted, onLogIn }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white py-2.5 px-4 text-center text-sm flex items-center justify-center gap-2 shadow-sm relative">
        <span className="animate-pulse">🚀</span>
        <span className="font-medium">Session 2026 • Early-bird registration now open</span>
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>

      {/* Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/30 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                <span className="text-white font-bold text-xl">os</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 tracking-tight">OpenScore</span>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {["Features", "Accounts", "Company", "Insight"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full hover:bg-gray-50 transition-all duration-200"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onLogIn}
              className="text-sm text-gray-600 hover:text-gray-900 rounded-full px-5 py-2 hover:bg-gray-50 transition-colors"
            >
              Login
            </button>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full px-6 py-2 text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-1"
            >
              Sign Up
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-20 flex-1 flex items-center overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <div className="space-y-6">
            <div
              className={`inline-flex items-center gap-2 bg-blue-50/80 backdrop-blur-sm border border-blue-100 text-blue-600 font-medium text-xs tracking-wide uppercase px-4 py-2 rounded-full shadow-sm transition-all duration-700 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20" />
                <path d="M12 6a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6z" />
              </svg>
              Try it now
            </div>

            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight transition-all duration-700 delay-100 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Take control of your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent italic pr-2">
                credit score
              </span>
            </h1>

            <p
              className={`text-gray-600 text-base md:text-lg max-w-md leading-relaxed transition-all duration-700 delay-200 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              From tracking your credit health to building a stronger financial future, OpenScore helps you understand,
              monitor, and improve your credit score.
            </p>

            <div
              className={`flex flex-wrap items-center gap-6 pt-4 transition-all duration-700 delay-300 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full px-8 py-6 text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300"
              >
                Get Started Now
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 border-2 border-white" />
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 border-2 border-white" />
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 border-2 border-white" />
                </div>
                <span>10k+ users</span>
              </div>
            </div>
          </div>

          {/* Right Side - Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Credit Score Card */}
            <div
              className={`relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-6 flex flex-col justify-center row-span-1 shadow-xl shadow-blue-500/20 transition-all duration-700 delay-200 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/30 ${
                isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="relative">
                <div className="text-white/70 text-xs mb-2 flex items-center gap-2">
                  <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" x2="12" y1="20" y2="10"></line>
                    <line x1="18" x2="18" y1="20" y2="4"></line>
                    <line x1="6" x2="6" y1="20" y2="16"></line>
                  </svg>
                  Your Score
                </div>
                <div className="text-5xl font-bold text-white tracking-tight">750</div>
                <div className="text-emerald-300 text-xs mt-3 flex items-center gap-1.5 font-medium">
                  <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                  +23 this month
                </div>
              </div>
            </div>

            {/* Score Factors Card */}
            <div
              className={`bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-3xl p-6 flex flex-col items-center justify-center border border-gray-100/80 shadow-lg shadow-gray-200/50 transition-all duration-700 delay-300 hover:scale-[1.02] hover:shadow-xl ${
                isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <span className="text-4xl font-bold text-gray-900 tracking-tight">12+</span>
              <span className="text-gray-600 text-sm mt-1">Score Factors</span>
              <div className="mt-3 p-2.5 bg-blue-100/50 rounded-2xl">
                <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
              </div>
            </div>

            {/* Users Improving Card */}
            <div
              className={`relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-3xl p-6 text-white shadow-xl shadow-gray-900/30 transition-all duration-700 delay-400 hover:scale-[1.02] hover:shadow-2xl ${
                isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -ml-8 -mb-8" />
              <div className="relative">
                <div className="flex gap-1.5 mb-3">
                  <div className="w-2.5 h-2.5 bg-blue-400/50 rotate-45 rounded-sm" />
                  <div className="w-2.5 h-2.5 bg-blue-400/50 rotate-45 rounded-sm" />
                </div>
                <p className="text-gray-400 mb-3 text-sm">Users Improving</p>
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 border-2 border-gray-900 ring-2 ring-gray-800" />
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 border-2 border-gray-900 ring-2 ring-gray-800" />
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 border-2 border-gray-900 ring-2 ring-gray-800" />
                  </div>
                  <div className="ml-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Growth Card */}
            <div
              className={`bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-100/80 shadow-lg shadow-gray-200/50 transition-all duration-700 delay-500 hover:scale-[1.02] hover:shadow-xl ${
                isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-gray-900 tracking-tight">+84.3%</span>
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <svg className="h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
              </div>
              <svg viewBox="0 0 100 40" className="w-full h-16 mt-2">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 35 Q20 30 30 25 T50 20 T70 15 T90 10 L100 8 L100 40 L0 40 Z"
                  fill="url(#chartGradient)"
                  className={`transition-opacity duration-1000 delay-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
                />
                <path
                  d="M0 35 Q20 30 30 25 T50 20 T70 15 T90 10 L100 8"
                  fill="none"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 150,
                    strokeDashoffset: isLoaded ? 0 : 150,
                    transition: "stroke-dashoffset 1.5s ease-out 0.7s",
                  }}
                />
                {isLoaded && (
                  <>
                    <circle cx="0" cy="35" r="3" fill="rgb(59, 130, 246)" className="animate-pulse" style={{ animationDelay: "0.8s" }} />
                    <circle cx="30" cy="25" r="3" fill="rgb(59, 130, 246)" className="animate-pulse" style={{ animationDelay: "1s" }} />
                    <circle cx="50" cy="20" r="3" fill="rgb(59, 130, 246)" className="animate-pulse" style={{ animationDelay: "1.2s" }} />
                    <circle cx="70" cy="15" r="3" fill="rgb(59, 130, 246)" className="animate-pulse" style={{ animationDelay: "1.4s" }} />
                    <circle cx="100" cy="8" r="3" fill="rgb(59, 130, 246)" className="animate-pulse" style={{ animationDelay: "1.6s" }} />
                  </>
                )}
              </svg>
              <p className="text-gray-600 text-sm mt-2">Avg. Score Growth</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Login Page Component with Animations
function LoginPage({ userType, setUserType, loginWithGoogle, loginAsBanker, bankerId, setBankerId, bankerPassword, setBankerPassword, bankerLoginError }) {
  const [displayedName, setDisplayedName] = useState("");
  const [nameIndex, setNameIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const names = ["Sarah", "Michael", "Emma", "James", "Olivia", "David"];

  // Typing animation effect
  useEffect(() => {
    const currentName = names[nameIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 500 : 2000;

    if (!isDeleting && charIndex === currentName.length) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setNameIndex((prev) => (prev + 1) % names.length);
      return;
    }

    const timeout = setTimeout(() => {
      setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
      setDisplayedName(currentName.substring(0, charIndex + (isDeleting ? -1 : 1)));
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, nameIndex]);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">os</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">OpenScore</span>
          </div>

          {/* Welcome Text with Typing Animation */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back,
              <br />
              <span className="inline-flex items-baseline text-blue-600">
                {displayedName}
                <span className="inline-block w-0.5 h-7 bg-blue-600 ml-1 animate-pulse" />
              </span>
              !
            </h1>
            <p className="text-sm text-gray-500">
              We are glad to see you again!
              <br />
              Please, select your role and sign in
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select your role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUserType('customer')}
                className={`h-16 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 transition-all ${
                  userType === 'customer'
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="text-sm font-medium">Customer</span>
              </button>
              <button
                onClick={() => setUserType('banker')}
                className={`h-16 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 transition-all ${
                  userType === 'banker'
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
                <span className="text-sm font-medium">Banker</span>
              </button>
            </div>
          </div>

          {/* Google Login for Customers */}
          {userType === 'customer' && (
            <button
              onClick={loginWithGoogle}
              className="w-full h-11 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Log in with Google</span>
            </button>
          )}

          {/* Banker Login Form */}
          {userType === 'banker' && (
            <form onSubmit={loginAsBanker} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Lender ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankerId}
                  onChange={(e) => setBankerId(e.target.value)}
                  placeholder="Enter your lender ID"
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={bankerPassword}
                  onChange={(e) => setBankerPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
              {bankerLoginError && (
                <p className="text-red-500 text-sm">{bankerLoginError}</p>
              )}
              <button
                type="submit"
                className="w-full h-10 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all"
              >
                Login
              </button>
            </form>
          )}

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <button className="text-gray-900 hover:underline font-medium">Sign up</button>
          </p>
        </div>
      </div>

      {/* Right Panel - Static Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 p-8 items-center justify-center relative overflow-hidden">
        <div className="w-full max-w-lg space-y-6">
          {/* Profile Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <p className="text-white font-semibold">Anonymous User</p>
                <p className="text-white/80 text-sm">OpenScore Member</p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" x2="12" y1="20" y2="10"></line>
                  <line x1="18" x2="18" y1="20" y2="4"></line>
                  <line x1="6" x2="6" y1="20" y2="14"></line>
                </svg>
                <span className="text-sm text-gray-500">Credit Score Trend</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl font-bold text-gray-900">+84.32%</span>
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
            </div>
            {/* Credit Score Line Chart */}
            <div className="relative h-32">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="80" x2="300" y2="80" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="0" y1="40" x2="300" y2="40" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="0" y1="20" x2="300" y2="20" stroke="#e5e7eb" strokeWidth="0.5" />
                {/* Credit score line - increasing trend */}
                <polyline
                  points="20,70 60,65 100,55 140,45 180,35 220,30 260,25 280,20"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Gradient fill under the line */}
                <defs>
                  <linearGradient id="creditGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <polygon
                  points="20,70 60,65 100,55 140,45 180,35 220,30 260,25 280,20 280,100 20,100"
                  fill="url(#creditGradient)"
                />
                {/* Data points */}
                {[
                  { x: 20, y: 70 },
                  { x: 60, y: 65 },
                  { x: 100, y: 55 },
                  { x: 140, y: 45 },
                  { x: 180, y: 35 },
                  { x: 220, y: 30 },
                  { x: 260, y: 25 },
                  { x: 280, y: 20 }
                ].map((point, i) => (
                  <circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill="#3b82f6"
                    className="hover:r-4 transition-all"
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Floating decorations */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-24 h-24 bg-cyan-300/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState('customer');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'graphs', 'creditScore', or 'simulator'
  const [showLandingPage, setShowLandingPage] = useState(true); // Show landing page by default
  
  // Banker login state
  const [bankerId, setBankerId] = useState('');
  const [bankerPassword, setBankerPassword] = useState('');
  const [bankerLoginError, setBankerLoginError] = useState('');

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
        sessionStorage.setItem('access_token', accessToken);
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

  const loginAsBanker = (e) => {
    e.preventDefault();
    setBankerLoginError('');
    // Simple hardcoded auth for hackathon
    if (bankerId === 'dinobank' && bankerPassword === 'dinobank123') {
      setUser({ name: 'Dino Bank', email: 'admin@dinobank.com', picture: null });
      setUserType('banker');
      sessionStorage.setItem('banker_auth', 'true');
    } else {
      setBankerLoginError('Invalid ID or password');
    }
  };

  const logout = () => {
    setUser(null);
    setUserType('customer');
    setBankerId('');
    setBankerPassword('');
    setShowLandingPage(true); // Reset to landing page on logout
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('banker_auth');

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
    // Show landing page first, then login page when user clicks Get Started or Log In
    if (showLandingPage) {
      return (
        <LandingPage 
          onGetStarted={() => setShowLandingPage(false)}
          onLogIn={() => setShowLandingPage(false)}
        />
      );
    }
    
    return <LoginPage 
      userType={userType} 
      setUserType={setUserType}
      loginWithGoogle={loginWithGoogle}
      loginAsBanker={loginAsBanker}
      bankerId={bankerId}
      setBankerId={setBankerId}
      bankerPassword={bankerPassword}
      setBankerPassword={setBankerPassword}
      bankerLoginError={bankerLoginError}
    />;
  }

  if (userType === 'banker') {
    return <BankerDashboard user={user} onLogout={logout} />;
  }

  // Customer view with routing
  if (currentPage === 'graphs') {
    return (
      <FinancialGraphs
        user={user}
        onLogout={logout}
        onBackToDashboard={() => setCurrentPage('dashboard')}
      />
    );
  }

  if (currentPage === 'creditScore') {
    return (
      <CreditScore
        user={user}
        onLogout={logout}
        onBackToDashboard={() => setCurrentPage('dashboard')}
        onNavigateToSimulator={() => setCurrentPage('simulator')}
      />
    );
  }

  if (currentPage === 'simulator') {
    return (
      <CreditScoreSimulator
        user={user}
        onLogout={logout}
        onBackToCreditScore={() => setCurrentPage('creditScore')}
      />
    );
  }

  return (
    <CustomerDashboard
      user={user}
      onLogout={logout}
      onNavigateToCreditScore={() => setCurrentPage('creditScore')}
    />
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);