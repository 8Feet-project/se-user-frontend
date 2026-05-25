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
  operation_log_total: 0,
  active_users_trend: [],
};

const emptyDistribution: AdminObjectDistributionResponse = {
  company_ratio: 0,
  stock_ratio: 0,
  commodity_ratio: 0,
  total: 0,
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
  const today = getTodayDate();
  const [overview, setOverview] = useState<AdminDashboardOverviewResponse>(emptyOverview);
  const [distribution, setDistribution] = useState<AdminObjectDistributionResponse>(emptyDistribution);
  const [modelUsage, setModelUsage] = useState<AdminModelUsageResponse>(emptyUsage);
  const [userActivity, setUserActivity] = useState<AdminUserActivityResponse>(emptyActivity);
  const [loading, setLoading] = useState(true);
  const [timeMode, setTimeMode] = useState<TimeMode>('point');
  const [pointDate, setPointDate] = useState(today);
  const [rangeStartDate, setRangeStartDate] = useState(today);
  const [rangeEndDate, setRangeEndDate] = useState(today);

  const timeRange = useMemo(() => {
    if (timeMode === 'point') {
      const date = pointDate || today;
      return { start_time: startOfDayIso(date), end_time: endOfDayIso(date) };
    }
    const startDate = rangeStartDate || today;
    const endDate = rangeEndDate || startDate;
    return { start_time: startOfDayIso(startDate), end_time: endOfDayIso(endDate) };
  }, [pointDate, rangeEndDate, rangeStartDate, timeMode, today]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewResult, distributionResult, usageResult, activityResult] = await Promise.all([
        getAdminDashboardOverview(timeRange),
        getAdminObjectDistribution(timeRange),
        getAdminModelUsage(timeRange),
        getAdminUserActivity(timeRange),
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
  }, [timeRange.start_time, timeRange.end_time]);

  const distributionItems = useMemo(() => {
    const rawItems = [
      { label: '公司', value: distribution.company_ratio, color: 'bg-sky-500', chartColor: '#0ea5e9' },
      { label: '股票', value: distribution.stock_ratio, color: 'bg-violet-500', chartColor: '#8b5cf6' },
      { label: '商品', value: distribution.commodity_ratio, color: 'bg-amber-500', chartColor: '#f59e0b' },
    ];
    return rawItems.map((item) => {
      const percent = Math.max(0, Math.min(100, item.value * 100));
      return { ...item, chartValue: percent, displayValue: formatPercentage(percent) };
    });
  }, [distribution.company_ratio, distribution.commodity_ratio, distribution.stock_ratio]);

  const distributionChartBackground = useMemo(() => {
    let offset = 0;
    const segments = distributionItems
      .filter((item) => item.chartValue > 0)
      .map((item) => {
        const start = offset;
        offset += item.chartValue;
        return `${item.chartColor} ${start}% ${offset}%`;
      });
    return segments.length > 0 ? `conic-gradient(${segments.join(', ')})` : 'rgba(148, 163, 184, 0.18)';
  }, [distributionItems]);

  const maxActiveUsers = useMemo(() => {
    return Math.max(1, ...overview.active_users_trend.map((item) => item.value));
  }, [overview.active_users_trend]);

  const modelCallTotal = useMemo(
    () => modelUsage.model_usage_ranking.reduce((acc, item) => acc + item.call_count, 0),
    [modelUsage.model_usage_ranking]
  );

  const leadingDistribution = distributionItems.reduce((winner, item) => (item.chartValue > winner.chartValue ? item : winner), distributionItems[0]);
  const objectSummary =
    (distribution.total ?? 0) <= 0
      ? '当前时间范围内暂无调研对象数据。'
      : `${leadingDistribution.label}类调研占比最高，为 ${leadingDistribution.displayValue}；本统计仅反映所选时间范围内已创建的主调研任务。`;

  const handlePresetRange = (preset: 'today' | '7d' | '30d') => {
    const end = new Date();
    const endStr = formatDateInput(end);
    if (preset === 'today') {
      setTimeMode('point');
      setPointDate(endStr);
      setRangeStartDate(endStr);
      setRangeEndDate(endStr);
      return;
    }
    const days = preset === '7d' ? 6 : 29;
    const start = new Date();
    start.setDate(end.getDate() - days);
    setTimeMode('range');
    setRangeStartDate(formatDateInput(start));
    setRangeEndDate(endStr);
  };

  return (
    <div className="flex h-full flex-col gap-6 text-slate-100">
      <header className="flex flex-col gap-4 rounded-[28px] border border-[rgba(99,202,183,0.12)] bg-white/[0.04] p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">运营概览</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">查看调研请求、活跃用户、模型调用和对象分布。</p>
        </div>
        <Button variant="secondary" onClick={() => void loadData()} className="rounded-2xl border-[rgba(99,202,183,0.2)] bg-white/[0.06] text-slate-100 hover:bg-white/[0.1]">
          <RefreshCw className="mr-2 h-4 w-4" />
          {loading ? '刷新中...' : '刷新数据'}
        </Button>
      </header>

      <Card className="rounded-[28px] border border-[rgba(99,202,183,0.12)] bg-white/[0.04] p-6">
        <div className="grid items-start gap-4 lg:grid-cols-5">
          <div className="flex flex-col gap-2">
            <LabelText text="时间模式" />
            <Select value={timeMode} onChange={(event) => setTimeMode(event.target.value as TimeMode)}>
              <option value="point">按时间点</option>
              <option value="range">按时间段</option>
            </Select>
          </div>

          {timeMode === 'point' ? (
            <div className="flex flex-col gap-2">
              <LabelText text="时间点" />
              <input type="date" value={pointDate} onChange={(event) => setPointDate(event.target.value)} className="h-12 w-full rounded-2xl border border-[rgba(99,202,183,0.18)] bg-[#07111f] px-4 text-slate-100" />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <LabelText text="开始日期" />
                <input type="date" value={rangeStartDate} onChange={(event) => setRangeStartDate(event.target.value)} className="h-12 w-full rounded-2xl border border-[rgba(99,202,183,0.18)] bg-[#07111f] px-4 text-slate-100" />
              </div>
              <div className="flex flex-col gap-2">
                <LabelText text="结束日期" />
                <input type="date" value={rangeEndDate} onChange={(event) => setRangeEndDate(event.target.value)} className="h-12 w-full rounded-2xl border border-[rgba(99,202,183,0.18)] bg-[#07111f] px-4 text-slate-100" />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 lg:col-span-2">
            <LabelText text="快捷筛选" />
            <div className="flex min-h-12 flex-wrap items-stretch gap-2">
              <RangeButton onClick={() => handlePresetRange('today')} text="今日" />
              <RangeButton onClick={() => handlePresetRange('7d')} text="近 7 日" />
              <RangeButton onClick={() => handlePresetRange('30d')} text="近 30 日" />
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="总调研请求量" value={overview.total_research_requests} icon={<Database className="h-5 w-5" />} hint="所选时间范围内创建的主调研任务数" />
        <MetricCard title="DAU" value={overview.dau} icon={<Users className="h-5 w-5" />} hint="最近一天有操作记录的用户数" />
        <MetricCard title="MAU" value={overview.mau} icon={<Activity className="h-5 w-5" />} hint="所选时间范围内去重后的活跃用户数" />
        <MetricCard title="模型调用次数" value={modelCallTotal} icon={<Sparkles className="h-5 w-5" />} hint="所选时间范围内记录到的模型调用流水" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-[28px] border border-[rgba(99,202,183,0.12)] bg-white/[0.04] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">活跃用户趋势</h2>
              <p className="mt-1 text-sm text-slate-400">按天展示所选范围内的活跃用户变化。</p>
            </div>
            <Badge variant="secondary" className="border-[rgba(99,202,183,0.16)] bg-white/[0.05] text-slate-200">FR-SJGL-0003</Badge>
          </div>

          {overview.active_users_trend.length === 0 ? (
            <EmptyState text="所选时间范围内暂无运行数据" />
          ) : (
            <div className="mt-6 flex h-72 items-end gap-3 rounded-3xl border border-[rgba(99,202,183,0.1)] bg-[#07111f]/72 p-4">
              {overview.active_users_trend.map((item) => (
                <div key={item.date} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-52 w-full items-end rounded-2xl bg-white/[0.04] p-1">
                    <div className="w-full rounded-2xl bg-gradient-to-t from-[#63cab7] via-sky-400 to-cyan-300" style={{ height: `${Math.max(10, (item.value / maxActiveUsers) * 100)}%` }} />
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
            <Badge variant="secondary" className="border-[rgba(99,202,183,0.16)] bg-white/[0.05] text-slate-200">对象分布</Badge>
          </div>

          {distributionItems.every((item) => item.chartValue <= 0) ? (
            <EmptyState text="所选时间范围内暂无调研对象数据" />
          ) : (
            <>
              <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr] lg:items-center">
                <div className="flex justify-center">
                  <div role="img" aria-label={distributionItems.map((item) => `${item.label}${item.displayValue}`).join('，')} className="relative h-48 w-48 rounded-full shadow-[0_20px_60px_rgba(14,165,233,0.16)]" style={{ background: distributionChartBackground }}>
                    <div className="absolute inset-[22%] rounded-full border border-[rgba(99,202,183,0.12)] bg-[#07111f] shadow-[inset_0_1px_24px_rgba(15,23,42,0.55)]" />
                  </div>
                </div>

                <div className="space-y-4">
                  {distributionItems.map((item) => (
                    <div key={item.label} className="rounded-3xl border border-[rgba(99,202,183,0.1)] bg-[#07111f]/72 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full shadow-[0_0_16px_rgba(255,255,255,0.12)]" style={{ backgroundColor: item.chartColor }} />
                          <div>
                            <p className="text-sm font-medium text-slate-200">{item.label}</p>
                            <p className="text-xs text-slate-500">图形占比 {item.displayValue}</p>
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-white">{item.displayValue}</span>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-white/[0.06]">
                        <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.chartValue}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-[rgba(99,202,183,0.1)] bg-[#07111f]/72 p-4 text-sm leading-6 text-slate-400">{objectSummary}</div>
            </>
          )}
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[28px] border border-[rgba(99,202,183,0.12)] bg-white/[0.04] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">模型调用排行</h2>
              <p className="mt-1 text-sm text-slate-400">基于所选范围内的模型调用流水统计。</p>
            </div>
            <Badge variant="secondary" className="border-[rgba(99,202,183,0.16)] bg-white/[0.05] text-slate-200">Model Usage</Badge>
          </div>

          {modelUsage.model_usage_ranking.length === 0 ? (
            <EmptyState text="所选时间范围内暂无模型调用数据" />
          ) : (
            <div className="mt-6 space-y-4">
              {modelUsage.model_usage_ranking.map((item, index) => (
                <div key={`${item.model_id || item.model_name}-${index}`} className="rounded-3xl border border-[rgba(99,202,183,0.1)] bg-[#07111f]/72 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">TOP {index + 1}</p>
                      <h3 className="mt-2 text-base font-semibold text-white">
                        {item.model_name}
                        {item.is_deleted ? <span className="ml-2 text-xs font-normal text-amber-300">已删除</span> : null}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">{item.provider || '未知供应商'}</p>
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
              <p className="mt-1 text-sm text-slate-400">基于操作日志统计用户活跃情况。</p>
            </div>
            <Badge variant="secondary" className="border-[rgba(99,202,183,0.16)] bg-white/[0.05] text-slate-200">User Activity</Badge>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {userActivity.retention_summary.map((item) => (
              <div key={item.label} className="rounded-3xl border border-[rgba(99,202,183,0.1)] bg-[#07111f]/72 p-4">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-[#63cab7]">{item.value}</p>
              </div>
            ))}
          </div>

          {userActivity.activity_series.length === 0 ? (
            <EmptyState text="所选时间范围内暂无用户活跃数据" />
          ) : (
            <div className="mt-6 rounded-3xl border border-[rgba(99,202,183,0.1)] bg-[#07111f]/72 p-4">
              <div className="space-y-3">
                {userActivity.activity_series.map((item) => (
                  <div key={item.date} className="flex items-center gap-3 text-sm">
                    <span className="w-24 text-slate-400">{item.date}</span>
                    <div className="h-2 flex-1 rounded-full bg-white/[0.06]">
                      <div className="h-2 rounded-full bg-[#63cab7]" style={{ width: `${Math.min(100, item.active_users * 20)}%` }} />
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

function RangeButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <Button size="sm" variant="secondary" className="h-12 rounded-2xl border-[rgba(99,202,183,0.16)] bg-white/[0.05] px-4 text-slate-200" onClick={onClick}>
      {text}
    </Button>
  );
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

function startOfDayIso(date: string) {
  return `${date}T00:00:00.000`;
}

function endOfDayIso(date: string) {
  return `${date}T23:59:59.999`;
}

function formatPercentage(value: number) {
  return `${Number(value.toFixed(2)).toString()}%`;
}

function EmptyState({ text }: { text: string }) {
  return <div className="mt-6 rounded-3xl border border-dashed border-[rgba(99,202,183,0.16)] bg-[#07111f]/60 p-10 text-center text-sm text-slate-500">{text}</div>;
}

function MetricCard({ title, value, icon, hint }: { title: string; value: number; icon: React.ReactNode; hint: string }) {
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
