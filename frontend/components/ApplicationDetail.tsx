import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Wallet, CheckCircle, AlertTriangle, User, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { applications } from '../data/mockData';

interface ApplicationDetailProps {
  applicationId: string;
  onBack: () => void;
}

export function ApplicationDetail({ applicationId, onBack }: ApplicationDetailProps) {
  const application = applications.find(a => a.id === applicationId);

  if (!application) {
    return <div>Application not found</div>;
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-50 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
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
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      {/* Top Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-600" />
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
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-900">Monthly Income</p>
                </div>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(application.monthlyIncome)}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
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
                  <Wallet className={`w-5 h-5 ${application.cashFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={application.incomeHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="spending" stroke="#f59e0b" strokeWidth={2} name="Spending" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={application.spendingByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" stroke="#6b7280" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Balance History</h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={application.balanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#8b5cf6" fill="#c4b5fd" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
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
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
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
                        <Calendar className="w-3 h-3" />
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
                <CheckCircle className="w-4 h-4" />
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
}
