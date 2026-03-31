import { useState } from 'react';
import { PageShell } from '../components/common/PageShell';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

const objectTypes = ['company', 'stock', 'product'] as const;

export function TaskLaunchPage() {
  const [title, setTitle] = useState('');
  const [objectType, setObjectType] = useState<typeof objectTypes[number]>('company');
  const [description, setDescription] = useState('');

  return (
    <PageShell title="任务发起" subtitle="创建商业对象深度调研任务，选择对象类型并设置关键需求。" action={<Button variant="secondary">创建新任务</Button>}>
      <div className="grid gap-8">
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

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="task-title">搜索任务</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="请输入公司、股票或产品名称，例如：腾讯控股"
                  className="h-12 rounded-full border-slate-300 px-5 text-base sm:flex-1"
                />
                <Button
                  type="button"
                  className="h-12 rounded-full border border-black bg-black px-4 text-white hover:bg-white hover:text-black"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <span className="sr-only">搜索确认</span>
                </Button>
              </div>
            </div>
            <div className="grid gap-6">
              <div>
              <Label htmlFor="task-object">对象类型</Label>
              <Select
                id="task-object"
                value={objectType}
                onChange={(event) => setObjectType(event.target.value as typeof objectTypes[number])}
              >
                {objectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'company' ? '公司' : type === 'stock' ? '股票' : '产品'}
                  </option>
                ))}
              </Select>
              </div>
              <div>
                <Label htmlFor="task-description">调研目标</Label>
                <Textarea
                  id="task-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="描述此任务最重要的关注点，例如行业定位、竞争分析、财务结构等。"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <p>任务创建后可在流程与历史中查看整个调研进度。</p>
            <p>报告会自动生成结构化分析摘要与建议。</p>
          </div>
        </Card>

      </div>
    </PageShell>
  );
}
