export interface Application {
  id: string;
  applicantName: string;
  email: string;
  openScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  monthlyIncome: number;
  monthlySpend: number;
  cashFlow: number;
  status: 'Submitted' | 'In Review' | 'Approved' | 'Rejected';
  requestedAmount: number;
  loanPurpose: string;
  confidence: number;
  flags: string[];
  positiveFactors: string[];
  riskFactors: string[];
}

export interface Note {
  id: string;
  lenderName: string;
  timestamp: string;
  content: string;
}

export interface ChartDataPoint {
  month: string;
  income: number;
  spending: number;
}

export interface SpendingCategory {
  category: string;
  amount: number;
}

export interface BalanceDataPoint {
  month: string;
  balance: number;
}
