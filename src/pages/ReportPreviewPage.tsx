import { PageShell } from '../components/common/PageShell';
import { Card } from '../components/ui/card';

const highlights = [
  { title: '结构化结论', detail: '公司业务定位清晰，市场竞争力稳健。' },
  { title: '核心风险', detail: '宏观政策与行业波动是主要关注点。' },
  { title: '建议策略', detail: '优化产品组合，聚焦差异化竞争。' },
];

export function ReportPreviewPage() {
  return (
    <PageShell title="报告预览" subtitle="预览自动生成的研究摘要与核心结论，保持内容简洁而有力。">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-7">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-950">自动生成报告</h2>
            <p className="text-sm leading-7 text-slate-600">查看报告主题、结论及建议，便于快速输出给业务和决策团队。</p>
          </section>

          <div className="space-y-6">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-[28px] border border-slate-200/80 bg-slate-50 px-6 py-5">
                <p className="text-base font-semibold text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5 bg-slate-950 text-white">
          <h3 className="text-xl font-semibold">报告结构</h3>
          <ol className="space-y-4 text-sm leading-7 text-slate-300">
            <li>1. 核心概览与对象定位</li>
            <li>2. 行业与竞争分析</li>
            <li>3. 财务与风险解读</li>
            <li>4. 结论与行动建议</li>
          </ol>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-300">此页面展示报告摘要，完整内容可导出为结构化文档。</p>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
