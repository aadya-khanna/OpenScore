// ============================================================================
// CUSTOMER DASHBOARD COMPONENTS
// Components for the customer/borrower dashboard
// ============================================================================

// #region agent log
try {
  fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomerComponents.jsx:1',message:'CustomerComponents.jsx script loading started',data:{hasReact:typeof React !== 'undefined',hasReactDOM:typeof ReactDOM !== 'undefined'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
} catch(e) {
  console.error('Debug log error:', e);
}
// #endregion

const { useState, useRef, useEffect } = React;

// DataSourceCard Component for Customer Dashboard
const DataSourceCard = ({ source, isConnected, onConnect, onUpload, onModalOpen }) => {
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
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomerComponents.jsx:1713',message:'CustomerDashboard component initialized',data:{user:user?.name,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C,E'})}).catch(()=>{});
  // #endregion
  
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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomerComponents.jsx:1805',message:'CustomerDashboard useEffect triggered',data:{hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    const token = getAccessToken();
    if (token && user) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomerComponents.jsx:1807',message:'Fetching data with token',data:{hasToken:!!token},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
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

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomerComponents.jsx:1899',message:'CustomerDashboard rendering',data:{accountsCount:accounts.length,transactionsCount:transactions.length,connectedSourcesCount:connectedSources.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C,D'})}).catch(()=>{});
  // #endregion

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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.picture && (
                <img src={user.picture} alt="User" className="w-14 h-14 rounded-full border-3 border-blue-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
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
                onModalOpen={source.id === 'education' ? () => setShowEducationModal(true) : undefined}
              />
            ))}
          </div>

          {/* Education Credentials Modal */}
          {showEducationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
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
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Save Credentials
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Load Sandbox Data Button */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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

          {/* View Credit Score Button */}
          <div className="mt-6">
            {accounts.length === 0 && transactions.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
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
                  className="w-full py-4 bg-gray-300 text-gray-500 rounded-xl font-semibold text-lg cursor-not-allowed flex items-center justify-center gap-2"
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
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm"
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

// #region agent log
try {
  fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomerComponents.jsx:2175',message:'CustomerComponents.jsx script fully loaded',data:{hasCustomerDashboard:typeof CustomerDashboard !== 'undefined'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
} catch(e) {
  console.error('Debug log error:', e);
}
// #endregion

// Main App Component
