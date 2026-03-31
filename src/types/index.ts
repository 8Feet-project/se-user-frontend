export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface ResearchTask {
  id: string;
  title: string;
  objectType: 'company' | 'stock' | 'product';
  status: 'pending' | 'running' | 'completed';
  requestedAt: string;
}

export interface ReportSummary {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
}
