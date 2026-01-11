// ============================================================================
// LENDER DASHBOARD COMPONENTS
// Components for the Dino Bank lender dashboard
// ============================================================================

const { useState, useRef, useEffect } = React;

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
          <span
              className={`text-sm font-medium ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
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
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-200 \${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`} />
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors \${
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
