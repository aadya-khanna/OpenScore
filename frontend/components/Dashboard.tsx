import { FileText, Clock, CheckCircle, TrendingUp, Eye } from 'lucide-react';
import { KPICard } from './KPICard';
import { applications } from '../data/mockData';

interface DashboardProps {
  onViewApplication: (id: string) => void;
}

export function Dashboard({ onViewApplication }: DashboardProps) {
  const totalApplications = applications.length;
  const pendingReviews = applications.filter(a => a.status === 'In Review' || a.status === 'Submitted').length;
  const approvedToday = applications.filter(a => a.status === 'Approved').length;
  const averageScore = Math.round(applications.reduce((sum, a) => sum + a.openScore, 0) / applications.length);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'High': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-50 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Review': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={FileText}
          title="Total Applications"
          value={totalApplications.toString()}
          trend={{ direction: 'up', value: '+12%' }}
        />
        <KPICard
          icon={Clock}
          title="Pending Reviews"
          value={pendingReviews.toString()}
          trend={{ direction: 'down', value: '-8%' }}
        />
        <KPICard
          icon={CheckCircle}
          title="Approved Today"
          value={approvedToday.toString()}
          trend={{ direction: 'up', value: '+23%' }}
        />
        <KPICard
          icon={TrendingUp}
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
                  OpenScore
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-6 py-3 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-6 py-3 uppercase tracking-wider">
                  Monthly Income
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-6 py-3 uppercase tracking-wider">
                  Monthly Spend
                </th>
                <th className="text-left text-xs font-medium text-gray-600 px-6 py-3 uppercase tracking-wider">
                  Cash Flow
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
                      <Eye className="w-4 h-4" />
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
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
