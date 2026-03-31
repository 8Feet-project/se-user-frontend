import { useState } from 'react';
import { PageShell } from '../components/common/PageShell';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const objectTypes = ['company', 'stock', 'product'] as const;

export function TaskLaunchPage() {
  const [title, setTitle] = useState('');
  const [objectType, setObjectType] = useState<typeof objectTypes[number]>('company');
  const [description, setDescription] = useState('');

  return (
    <PageShell title="任务发起" subtitle="创建商业对象深度调研任务，选择对象类型并设置关键需求。" action={<Button variant="secondary">创建新任务</Button>}>
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.95fr]">
        <Card className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-slate-950">立即发起调研</h2>
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-600">
                精简模式
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              选择分析对象、设定任务名称，并描述最关键的分析方向。
            </p>
          </section>

          <div className="grid gap-6">
            <div>
              <Label htmlFor="task-title">任务名称</Label>
              <Input
                id="task-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例如：腾讯控股公司深度调研"
              />
            </div>
            <div>
              <Label htmlFor="task-object">对象类型</Label>
              <select
                id="task-object"
                className="field-input"
                value={objectType}
                onChange={(event) => setObjectType(event.target.value as typeof objectTypes[number])}
              >
                {objectTypes.map((type) => (
                  <option key={type} value={type} className="bg-white text-slate-950">
                    {type === 'company' ? '公司' : type === 'stock' ? '股票' : '产品'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="task-description">调研目标</Label>
              <textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="描述此任务最重要的关注点，例如行业定位、竞争分析、财务结构等。"
                className="field-input min-h-[160px] resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 text-sm text-slate-600">
              <p>任务创建后可在流程与历史中查看整个调研进度。</p>
              <p>报告会自动生成结构化分析摘要与建议。</p>
            </div>
            <Button>提交任务</Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="section-title">任务概览</h3>
            <p className="section-desc">本次调研会覆盖对象基本信息、市场位置、竞争策略与数据驱动结论。</p>
            <div className="grid gap-4">
              {['行业洞察', '关联数据', '趋势判断', '风险建议'].map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-4">
                  <p className="font-medium text-slate-950">{item}</p>
                  <p className="mt-2 text-sm text-slate-600">自动生成要点，便于快速审阅与决策。</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 bg-slate-950 text-white">
            <h3 className="text-lg font-semibold">操作提示</h3>
            <ol className="space-y-3 text-sm leading-7 text-slate-300">
              <li>1. 填写任务名称与核心目标。</li>
              <li>2. 选择对象类型和调研重点。</li>
              <li>3. 提交后在“流程”页查看状态。</li>
            </ol>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
