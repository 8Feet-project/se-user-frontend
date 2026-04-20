import { useEffect, useMemo, useState } from 'react';
import { Activity, Database, RefreshCw, Sparkles, Users } from 'lucide-react';
import {
  getAdminDashboardOverview,
  getAdminModelUsage,
  getAdminObjectDistribution,
  getAdminUserActivity,
} from '../api/client';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import type {
  AdminDashboardOverviewResponse,
  AdminModelUsageResponse,
  AdminObjectDistributionResponse,
  AdminUserActivityResponse,
} from '../types';

const emptyOverview: AdminDashboardOverviewResponse = {
  total_research_requests: 0,
  dau: 0,
  mau: 0,
  active_users_trend: [],
};

const emptyDistribution: AdminObjectDistributionResponse = {
  company_ratio: 0,
  stock_ratio: 0,
  commodity_ratio: 0,
};

const emptyUsage: AdminModelUsageResponse = {
  model_usage_ranking: [],
  trend_series: [],
};

const emptyActivity: AdminUserActivityResponse = {
  activity_series: [],
  retention_summary: [],
};

export function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminDashboardOverviewResponse>(emptyOverview);
  const [distribution, setDistribution] = useState<AdminObjectDistributionResponse>(emptyDistribution);
  const [modelUsage, setModelUsage] = useState<AdminModelUsageResponse>(emptyUsage);
  const [userActivity, setUserActivity] = useState<AdminUserActivityResponse>(emptyActivity);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewResult, distributionResult, usageResult, activityResult] = await Promise.all([
        getAdminDashboardOverview(),
        getAdminObjectDistribution(),
        getAdminModelUsage(),
        getAdminUserActivity(),
      ]);
      setOverview(overviewResult);
      setDistribution(distributionResult);
      setModelUsage(usageResult);
      setUserActivity(activityResult);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const maxActiveUsers = useMemo(() => {
    return Math.max(1, ...overview.active_users_trend.map((item) => item.value));
  }, [overview.active_users_trend]);

  const distributionItems = [
    { label: '公司', value: distribution.company_ratio, color: 'bg-sky-500' },
    { label: '股票', value: distribution.stock_ratio, color: 'bg-violet-500' },
    { label: '商品', value: distribution.commodity_ratio, color: 'bg-amber-500' },
  ];

  return (
    <div className="flex h-full flex-col gap-6 text-slate-100">
      <header className="flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-900/60 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">多维度用户数据展示</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            对齐需求中的管理端统计分析场景，覆盖总调研量、DAU/MAU、活跃用户趋势、对象分布与模型调用排行。
          </p>
        </div>
        <Button variant="secondary" onClick={() => void loadData()} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200">
          <RefreshCw className="mr-2 h-4 w-4" />
          {loading ? '刷新中...' : '刷新数据'}
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="总调研请求量"
          value={overview.total_research_requests}
          icon={<Database className="h-5 w-5" />}
          hint="累计成功接收的调研请求总数"
        />
        <MetricCard
          title="DAU"
          value={overview.dau}
          icon={<Users className="h-5 w-5" />}
          hint="当日活跃用户数"
        />
        <MetricCard
          title="MAU"
          value={overview.mau}
          icon={<Activity className="h-5 w-5" />}
          hint="近 30 日活跃用户数"
        />
        <MetricCard
          title="近期待检日志"
          value={modelUsage.model_usage_ranking.reduce((acc, item) => acc + item.call_count, 0)}
          icon={<Sparkles className="h-5 w-5" />}
          hint="以模型调用量作为排障观察代理指标"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">活跃用户趋势</h2>
              <p className="mt-1 text-sm text-slate-400">按天展示近一周活跃用户变化。</p>
            </div>
            <Badge variant="secondary" className="bg-slate-800 text-slate-200">
              FR-SJGL-000
            </Badge>
          </div>
          <div className="mt-6 flex h-72 items-end gap-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
            {overview.active_users_trend.map((item) => (
              <div key={item.date} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-52 w-full items-end rounded-2xl bg-slate-900/80 p-1">
                  <div
                    className="w-full rounded-2xl bg-gradient-to-t from-sky-500 to-cyan-300"
                    style={{ height: `${Math.max(10, (item.value / maxActiveUsers) * 100)}%` }}
                  />
                </div>
                <div className="text-center text-xs text-slate-400">
                  <div>{item.date}</div>
                  <div className="mt-1 font-medium text-slate-200">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">调研对象分布</h2>
              <p className="mt-1 text-sm text-slate-400">按公司 / 股票 / 商品分类统计。</p>
            </div>
            <Badge variant="secondary" className="bg-slate-800 text-slate-200">
              Object Mix
            </Badge>
          </div>
          <div className="mt-6 space-y-5">
            {distributionItems.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="font-medium text-white">{item.value}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800">
                  <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-400">
            当前调研对象以公司与股票为主，商品调研占比较低，可作为模型路由与提示词优化的依据。
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">模型调用排行</h2>
              <p className="mt-1 text-sm text-slate-400">辅助识别高频使用模型与容量热点。</p>
            </div>
            <Badge variant="secondary" className="bg-slate-800 text-slate-200">
              Model Usage
            </Badge>
          </div>
          <div className="mt-6 space-y-4">
            {modelUsage.model_usage_ranking.map((item, index) => (
              <div key={item.model_id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">TOP {index + 1}</p>
                    <h3 className="mt-2 text-base font-semibold text-white">{item.model_name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{item.provider}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">调用次数</p>
                    <p className="mt-2 text-2xl font-semibold text-sky-300">{item.call_count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">用户活跃与留存</h2>
              <p className="mt-1 text-sm text-slate-400">支撑管理端用户行为观察。</p>
            </div>
            <Badge variant="secondary" className="bg-slate-800 text-slate-200">
              User Activity
            </Badge>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {userActivity.retention_summary.map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-emerald-300">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="space-y-3">
              {userActivity.activity_series.map((item) => (
                <div key={item.date} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-slate-400">{item.date}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${Math.min(100, item.active_users / 2)}%` }} />
                  </div>
                  <span className="w-12 text-right font-medium text-white">{item.active_users}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  hint,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  hint: string;
}) {
  return (
    <Card className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-3 text-xs leading-5 text-slate-500">{hint}</p>
        </div>
        <div className="rounded-2xl bg-slate-800 p-3 text-sky-300">{icon}</div>
      </div>
    </Card>
  );
}
