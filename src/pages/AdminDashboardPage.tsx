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
import { Select } from '../components/ui/select';
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

type TimeMode = 'point' | 'range';

export function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminDashboardOverviewResponse>(emptyOverview);
  const [distribution, setDistribution] = useState<AdminObjectDistributionResponse>(emptyDistribution);
  const [modelUsage, setModelUsage] = useState<AdminModelUsageResponse>(emptyUsage);
  const [userActivity, setUserActivity] = useState<AdminUserActivityResponse>(emptyActivity);
  const [loading, setLoading] = useState(true);

  const today = getTodayDate();
  const [timeMode, setTimeMode] = useState<TimeMode>('point');
  const [pointDate, setPointDate] = useState(today);
  const [rangeStartDate, setRangeStartDate] = useState(today);
  const [rangeEndDate, setRangeEndDate] = useState(today);

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

  const resolveTimeRange = useMemo(() => {
    if (timeMode === 'point') {
      const date = pointDate || today;
      return {
        start: startOfDay(date).getTime(),
        end: endOfDay(date).getTime(),
      };
    }

    const startDate = rangeStartDate || today;
    const endDate = rangeEndDate || startDate;
    return {
      start: startOfDay(startDate).getTime(),
      end: endOfDay(endDate).getTime(),
    };
  }, [pointDate, rangeEndDate, rangeStartDate, timeMode, today]);

  const filteredOverviewTrend = useMemo(() => {
    return overview.active_users_trend.filter((item) => {
      const ts = parseShortMonthDay(item.date).getTime();
      return ts >= resolveTimeRange.start && ts <= resolveTimeRange.end;
    });
  }, [overview.active_users_trend, resolveTimeRange.end, resolveTimeRange.start]);

  const filteredActivitySeries = useMemo(() => {
    return userActivity.activity_series.filter((item) => {
      const ts = parseShortMonthDay(item.date).getTime();
      return ts >= resolveTimeRange.start && ts <= resolveTimeRange.end;
    });
  }, [resolveTimeRange.end, resolveTimeRange.start, userActivity.activity_series]);

  const filteredModelTrend = useMemo(() => {
    return modelUsage.trend_series.filter((item) => {
      const ts = parseShortMonthDay(item.date).getTime();
      return ts >= resolveTimeRange.start && ts <= resolveTimeRange.end;
    });
  }, [modelUsage.trend_series, resolveTimeRange.end, resolveTimeRange.start]);

  const filteredModelRanking = useMemo(() => {
    if (filteredModelTrend.length === 0) {
      return [] as Array<{ model_id: string; model_name: string; provider: string; call_count: number }>;
    }

    const meta = new Map(modelUsage.model_usage_ranking.map((item) => [item.model_id, item]));
    const summary = new Map<string, number>();

    filteredModelTrend.forEach((item) => {
      item.values.forEach((value) => {
        summary.set(value.model_id, (summary.get(value.model_id) || 0) + value.value);
      });
    });

    return Array.from(summary.entries())
      .map(([modelId, count]) => {
        const m = meta.get(modelId);
        return {
          model_id: modelId,
          model_name: m?.model_name || modelId,
          provider: m?.provider || 'Unknown',
          call_count: count,
        };
      })
      .sort((a, b) => b.call_count - a.call_count);
  }, [filteredModelTrend, modelUsage.model_usage_ranking]);

  const distributionItems = [
    { label: '公司', value: distribution.company_ratio, color: 'bg-sky-500' },
    { label: '股票', value: distribution.stock_ratio, color: 'bg-violet-500' },
    { label: '商品', value: distribution.commodity_ratio, color: 'bg-amber-500' },
  ];

  const maxActiveUsers = useMemo(() => {
    return Math.max(1, ...filteredOverviewTrend.map((item) => item.value));
  }, [filteredOverviewTrend]);

  const derivedDau = filteredActivitySeries[filteredActivitySeries.length - 1]?.active_users ?? overview.dau;
  const derivedMau =
    filteredActivitySeries.length > 0
      ? Math.round(filteredActivitySeries.reduce((acc, item) => acc + item.active_users, 0) / filteredActivitySeries.length)
      : overview.mau;
  const derivedRequestTotal =
    filteredModelRanking.length > 0
      ? filteredModelRanking.reduce((acc, item) => acc + item.call_count, 0)
      : overview.total_research_requests;

  const handlePresetRange = (preset: 'today' | '7d' | '30d') => {
    const now = new Date();
    const end = formatDateInput(now);
    if (preset === 'today') {
      setTimeMode('point');
      setPointDate(end);
      setRangeStartDate(end);
      setRangeEndDate(end);
      return;
    }

    const days = preset === '7d' ? 6 : 29;
    const start = new Date();
    start.setDate(now.getDate() - days);
    setTimeMode('range');
    setRangeStartDate(formatDateInput(start));
    setRangeEndDate(end);
  };

  return (
    <div className="flex h-full flex-col gap-6 text-slate-100">
      <header className="flex flex-col gap-4 rounded-[28px] border border-[rgba(99,202,183,0.12)] bg-white/[0.04] p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">多维度用户数据展示</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            支持全局时间筛选器：默认今日，可按时间点或时间段查询，并可快捷选择近 7 日 / 近 30 日联动刷新统计视图。
          </p>
        </div>
        <Button variant="secondary" onClick={() => void loadData()} className="rounded-2xl border-[rgba(99,202,183,0.2)] bg-white/[0.06] text-slate-100 hover:bg-white/[0.1]">
          <RefreshCw className="mr-2 h-4 w-4" />
          {loading ? '刷新中...' : '刷新数据'}
        </Button>
      </header>

      <Card className="rounded-[28px] border border-[rgba(99,202,183,0.12)] bg-white/[0.04] p-6">
        <div className="grid gap-4 lg:grid-cols-5">
          <div>
            <LabelText text="时间模式" />
            <Select value={timeMode} onChange={(event) => setTimeMode(event.target.value as TimeMode)}>
              <option value="point">按时间点</option>
              <option value="range">按时间段</option>
            </Select>
          </div>

          {timeMode === 'point' ? (
            <div>
              <LabelText text="时间点" />
              <input
                type="date"
                value={pointDate}
                onChange={(event) => setPointDate(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-[rgba(99,202,183,0.18)] bg-[#07111f] px-4 text-slate-100"
              />
            </div>
          ) : (
            <>
              <div>
                <LabelText text="开始日期" />
                <input
                  type="date"
                  value={rangeStartDate}
                  onChange={(event) => setRangeStartDate(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-[rgba(99,202,183,0.18)] bg-[#07111f] px-4 text-slate-100"
                />
              </div>
              <div>
                <LabelText text="结束日期" />
                <input
                  type="date"
                  value={rangeEndDate}
                  onChange={(event) => setRangeEndDate(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-[rgba(99,202,183,0.18)] bg-[#07111f] px-4 text-slate-100"
                />
              </div>
            </>
          )}

          <div className="lg:col-span-2">
            <LabelText text="快捷筛选" />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" className="rounded-xl border-[rgba(99,202,183,0.16)] bg-white/[0.05] text-slate-200" onClick={() => handlePresetRange('today')}>
                今日
              </Button>
              <Button size="sm" variant="secondary" className="rounded-xl border-[rgba(99,202,183,0.16)] bg-white/[0.05] text-slate-200" onClick={() => handlePresetRange('7d')}>
                近 7 日
              </Button>
              <Button size="sm" variant="secondary" className="rounded-xl border-[rgba(99,202,183,0.16)] bg-white/[0.05] text-slate-200" onClick={() => handlePresetRange('30d')}>
                近 30 日
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="总调研请求量"
          value={derivedRequestTotal}
          icon={<Database className="h-5 w-5" />}
          hint="按当前时间范围汇总模型调用量作为调研热度代理"
        />
        <MetricCard title="DAU" value={derivedDau} icon={<Users className="h-5 w-5" />} hint="当前时间范围最后一天活跃用户数" />
        <MetricCard title="MAU" value={derivedMau} icon={<Activity className="h-5 w-5" />} hint="当前时间范围活跃用户均值" />
        <MetricCard
          title="近期待检日志"
          value={filteredModelRanking.reduce((acc, item) => acc + item.call_count, 0)}
          icon={<Sparkles className="h-5 w-5" />}
          hint="以模型调用量作为排障观察代理指标"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-[28px] border border-[rgba(99,202,183,0.12)] bg-white/[0.04] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">活跃用户趋势</h2>
              <p className="mt-1 text-sm text-slate-400">按天展示当前时间范围内活跃用户变化。</p>
            </div>
            <Badge variant="secondary" className="border-[rgba(99,202,183,0.16)] bg-white/[0.05] text-slate-200">
              FR-SJGL-0003
            </Badge>
          </div>

          {filteredOverviewTrend.length === 0 ? (
            <EmptyState text="所选时间范围内暂无运行数据" />
          ) : (
            <div className="mt-6 flex h-72 items-end gap-3 rounded-3xl border border-[rgba(99,202,183,0.1)] bg-[#07111f]/72 p-4">
              {filteredOverviewTrend.map((item) => (
                <div key={item.date} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-52 w-full items-end rounded-2xl bg-white/[0.04] p-1">
                    <div
                      className="w-full rounded-2xl bg-gradient-to-t from-[#63cab7] via-sky-400 to-cyan-300"
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
          )}
        </Card>

        <Card className="rounded-[28px] border border-[rgba(99,202,183,0.12)] bg-white/[0.04] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">调研对象分布</h2>
              <p className="mt-1 text-sm text-slate-400">按公司 / 股票 / 商品分类统计。</p>
            </div>
            <Badge variant="secondary" className="border-[rgba(99,202,183,0.16)] bg-white/[0.05] text-slate-200">
              Object Mix
            </Badge>
          </div>

          {distributionItems.every((item) => item.value <= 0) ? (
            <EmptyState text="所选时间范围内暂无运行数据" />
          ) : (
            <>
              <div className="mt-6 space-y-5">
                {distributionItems.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="font-medium text-white">{item.value}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/[0.06]">
                      <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-3xl border border-[rgba(99,202,183,0.1)] bg-[#07111f]/72 p-4 text-sm leading-6 text-slate-400">
                当前调研对象以公司与股票为主，商品调研占比较低，可作为模型路由与提示词优化的依据。
              </div>
            </>
          )}
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[28px] border border-[rgba(99,202,183,0.12)] bg-white/[0.04] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">模型调用排行</h2>
              <p className="mt-1 text-sm text-slate-400">辅助识别高频使用模型与容量热点。</p>
            </div>
            <Badge variant="secondary" className="border-[rgba(99,202,183,0.16)] bg-white/[0.05] text-slate-200">
              Model Usage
            </Badge>
          </div>

          {filteredModelRanking.length === 0 ? (
            <EmptyState text="所选时间范围内暂无运行数据" />
          ) : (
            <div className="mt-6 space-y-4">
              {filteredModelRanking.map((item, index) => (
                <div key={item.model_id} className="rounded-3xl border border-[rgba(99,202,183,0.1)] bg-[#07111f]/72 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">TOP {index + 1}</p>
                      <h3 className="mt-2 text-base font-semibold text-white">{item.model_name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{item.provider}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">调用次数</p>
                      <p className="mt-2 text-2xl font-semibold text-[#63cab7]">{item.call_count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-[28px] border border-[rgba(99,202,183,0.12)] bg-white/[0.04] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">用户活跃与留存</h2>
              <p className="mt-1 text-sm text-slate-400">支撑管理端用户行为观察。</p>
            </div>
            <Badge variant="secondary" className="border-[rgba(99,202,183,0.16)] bg-white/[0.05] text-slate-200">
              User Activity
            </Badge>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {userActivity.retention_summary.map((item) => (
              <div key={item.label} className="rounded-3xl border border-[rgba(99,202,183,0.1)] bg-[#07111f]/72 p-4">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-[#63cab7]">{item.value}</p>
              </div>
            ))}
          </div>

          {filteredActivitySeries.length === 0 ? (
            <EmptyState text="所选时间范围内暂无运行数据" />
          ) : (
            <div className="mt-6 rounded-3xl border border-[rgba(99,202,183,0.1)] bg-[#07111f]/72 p-4">
              <div className="space-y-3">
                {filteredActivitySeries.map((item) => (
                  <div key={item.date} className="flex items-center gap-3 text-sm">
                    <span className="w-12 text-slate-400">{item.date}</span>
                    <div className="h-2 flex-1 rounded-full bg-white/[0.06]">
                      <div className="h-2 rounded-full bg-[#63cab7]" style={{ width: `${Math.min(100, item.active_users / 2)}%` }} />
                    </div>
                    <span className="w-12 text-right font-medium text-white">{item.active_users}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

function LabelText({ text }: { text: string }) {
  return <p className="text-sm text-slate-300">{text}</p>;
}

function getTodayDate() {
  return formatDateInput(new Date());
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseShortMonthDay(value: string) {
  const [monthPart, dayPart] = value.split('-');
  const now = new Date();
  const year = now.getFullYear();
  const month = Number(monthPart);
  const day = Number(dayPart);
  if (!Number.isFinite(month) || !Number.isFinite(day)) {
    return new Date(year, 0, 1);
  }
  return new Date(year, month - 1, day);
}

function startOfDay(date: string) {
  const d = new Date(`${date}T00:00:00`);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: string) {
  const d = new Date(`${date}T00:00:00`);
  d.setHours(23, 59, 59, 999);
  return d;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-[rgba(99,202,183,0.16)] bg-[#07111f]/60 p-10 text-center text-sm text-slate-500">
      {text}
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
    <Card className="rounded-[28px] border border-[rgba(99,202,183,0.12)] bg-white/[0.04] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-3 text-xs leading-5 text-slate-500">{hint}</p>
        </div>
        <div className="rounded-2xl bg-[rgba(99,202,183,0.12)] p-3 text-[#63cab7]">{icon}</div>
      </div>
    </Card>
  );
}
