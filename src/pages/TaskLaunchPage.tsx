import { useState } from 'react';
import { createResearchTask } from '../api/client';
import { PageShell } from '../components/common/PageShell';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';

const objectTypes = ['', 'company', 'stock', 'commodity'] as const;

export function TaskLaunchPage() {
  const [objectName, setObjectName] = useState('');
  const [objectType, setObjectType] = useState<(typeof objectTypes)[number]>('');
  const [timeRange, setTimeRange] = useState('30d');
  const [sourceAuthority, setSourceAuthority] = useState('high');
  const [sourceTypesText, setSourceTypesText] = useState('news,report');
  const [modelId, setModelId] = useState('');
  const [enableCrossValidation, setEnableCrossValidation] = useState(false);
  const [multiModelText, setMultiModelText] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTask = async () => {
    if (!objectName.trim()) {
      setMessage('请先填写调研对象名称。');
      return;
    }

    try {
      setSubmitting(true);
      const response = await createResearchTask({
        object_name: objectName.trim(),
        object_type: objectType || undefined,
        time_range: timeRange,
        source_authority: sourceAuthority,
        source_types: sourceTypesText
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        model_id: modelId || undefined,
        multi_model_ids: multiModelText
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        enable_cross_validation: enableCrossValidation,
      });
      setMessage(`任务已创建：${response.task_id}，状态 ${response.status}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '创建失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="任务发起"
      subtitle="对齐 /api/v1/research/tasks 接口参数创建调研任务。"
      action={<Button variant="secondary" onClick={handleCreateTask}>提交任务</Button>}
    >
      <div className="grid gap-8">
        <Card className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-950">创建调研任务</h2>
            <p className="text-sm leading-6 text-slate-600">
              表单字段与接口文档保持一致：object_name、object_type、time_range、source_authority 等。
            </p>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <Label htmlFor="task-object-name">object_name</Label>
              <Input
                id="task-object-name"
                value={objectName}
                onChange={(event) => setObjectName(event.target.value)}
                placeholder="例如：腾讯控股"
              />
            </div>
            <div>
              <Label htmlFor="task-object-type">object_type（可选）</Label>
              <Select
                id="task-object-type"
                value={objectType}
                onChange={(event) => setObjectType(event.target.value as (typeof objectTypes)[number])}
              >
                <option value="">自动识别</option>
                <option value="company">company</option>
                <option value="stock">stock</option>
                <option value="commodity">commodity</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-time-range">time_range</Label>
              <Select id="task-time-range" value={timeRange} onChange={(event) => setTimeRange(event.target.value)}>
                <option value="7d">7d</option>
                <option value="30d">30d</option>
                <option value="90d">90d</option>
                <option value="1y">1y</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-source-authority">source_authority</Label>
              <Select
                id="task-source-authority"
                value={sourceAuthority}
                onChange={(event) => setSourceAuthority(event.target.value)}
              >
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-source-types">source_types（逗号分隔）</Label>
              <Input
                id="task-source-types"
                value={sourceTypesText}
                onChange={(event) => setSourceTypesText(event.target.value)}
                placeholder="news,report,filing"
              />
            </div>
            <div>
              <Label htmlFor="task-model-id">model_id（可选）</Label>
              <Input
                id="task-model-id"
                value={modelId}
                onChange={(event) => setModelId(event.target.value)}
                placeholder="例如：model-deepseek-v3"
              />
            </div>
            <div>
              <Label htmlFor="task-multi-model-ids">multi_model_ids（逗号分隔）</Label>
              <Input
                id="task-multi-model-ids"
                value={multiModelText}
                onChange={(event) => setMultiModelText(event.target.value)}
                placeholder="model-a,model-b"
              />
            </div>
            <div className="flex items-center gap-3 pt-8">
              <input
                id="task-enable-cross-validation"
                type="checkbox"
                checked={enableCrossValidation}
                onChange={(event) => setEnableCrossValidation(event.target.checked)}
              />
              <Label htmlFor="task-enable-cross-validation">enable_cross_validation</Label>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleCreateTask} disabled={submitting}>
              {submitting ? '提交中...' : '提交到 /api/v1/research/tasks'}
            </Button>
            {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
