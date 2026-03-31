import { PageShell } from '../components/common/PageShell';
import { Card } from '../components/ui/card';

const steps = [
  { label: '任务接收', status: '已完成' },
  { label: '数据抓取', status: '进行中' },
  { label: '结构化分析', status: '待处理' },
  { label: '生成报告', status: '待处理' },
];

export function TaskProcessPage() {
  return (
    <PageShell title="调研流程" subtitle="查看当前任务节点与整体进度，保持流程透明可控。">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-7">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-950">当前任务进度</h2>
            <p className="text-sm leading-7 text-slate-600">调研流程分为四个关键阶段，当前阶段与下一阶段一目了然。</p>
          </section>

          <div className="space-y-5">
            {steps.map((step, index) => (
              <div key={step.label} className="flex items-center gap-5 rounded-[28px] border border-slate-200/80 bg-slate-50 px-5 py-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-900">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-950">{step.label}</p>
                  <p className="text-sm text-slate-600">{step.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5 bg-slate-950 text-white">
          <h3 className="text-xl font-semibold">任务摘要</h3>
          <div className="space-y-4 text-sm leading-7 text-slate-300">
            <p>当前任务正在进行数据抓取与核心信息提取，预计完成时间为 24 小时内。</p>
            <p>下一步将进入结构化分析和要点整合，生成简明报告摘要。</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm font-medium text-white">建议预留审阅时间，确保报告结论覆盖行业动向与风险要点。</p>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
