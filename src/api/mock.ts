import type { ResearchTask, ReportSummary } from '../types';

export const mockUser = {
  id: 'user-001',
  name: '演示用户',
  email: 'demo@8feet.com',
};

export const mockTasks: ResearchTask[] = [
  {
    id: 'task-001',
    title: '腾讯控股公司深度调研',
    objectType: 'company',
    status: 'completed',
    requestedAt: '2026-03-28',
  },
  {
    id: 'task-002',
    title: '新能源行业龙头股票分析',
    objectType: 'stock',
    status: 'running',
    requestedAt: '2026-03-29',
  },
];

export const mockReports: ReportSummary[] = [
  {
    id: 'report-001',
    title: '公司对象调研报告示例',
    summary: '基于DeepSearch的信息整合，生成专业结构化分析。',
    createdAt: '2026-03-29',
  },
];
