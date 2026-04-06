import { useEffect, useState } from 'react';
import {
  createAlert,
  deleteAlert,
  getAlerts,
  getMessages,
  markAllMessagesRead,
  markMessageRead,
  updateAlert,
} from '../api/client';
import { PageShell } from '../components/common/PageShell';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import type { AlertItem, AlertStatus, MessageItem, ObjectType } from '../types';

export function AlertsMessagesPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [objectName, setObjectName] = useState('');
  const [objectType, setObjectType] = useState<ObjectType>('company');
  const [pushInApp, setPushInApp] = useState(true);
  const [pushEmail, setPushEmail] = useState(false);
  const [scheduleRule, setScheduleRule] = useState('daily');
  const [statusToSet, setStatusToSet] = useState<AlertStatus>('enabled');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAlerts = async () => {
    const response = await getAlerts({ page: 1, page_size: 20 });
    setAlerts(response.list);
  };

  const loadMessages = async () => {
    const response = await getMessages({ page: 1, page_size: 20 });
    setMessages(response.list);
  };

  const loadAll = async () => {
    try {
      await Promise.all([loadAlerts(), loadMessages()]);
      setMessage('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '加载提醒与消息失败';
      setMessage(reason);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const handleCreateAlert = async () => {
    if (!objectName.trim()) {
      setMessage('请先填写 object_name。');
      return;
    }
    try {
      setSubmitting(true);
      const response = await createAlert({
        object_name: objectName.trim(),
        object_type: objectType,
        push_in_app: pushInApp,
        push_email: pushEmail,
        schedule_rule: scheduleRule,
      });
      setMessage(`提醒创建成功：${response.alert_id}`);
      setObjectName('');
      await loadAlerts();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '创建提醒失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAlertStatus = async (alertId: string, nextStatus: AlertStatus) => {
    try {
      setSubmitting(true);
      const response = await updateAlert(alertId, { status: nextStatus });
      setMessage(`提醒更新字段：${response.updated_fields.join(', ') || '无变化'}`);
      await loadAlerts();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '更新提醒失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      setSubmitting(true);
      const response = await deleteAlert(alertId);
      setMessage(`删除提醒结果：${response.result}`);
      await loadAlerts();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '删除提醒失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkMessageRead = async (messageId: string) => {
    try {
      setSubmitting(true);
      const response = await markMessageRead(messageId);
      setMessage(`消息已读：${response.message_id}`);
      await loadMessages();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '消息标记已读失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAllMessagesRead = async () => {
    try {
      setSubmitting(true);
      const response = await markAllMessagesRead();
      setMessage(`全部已读完成，数量：${response.affected_count}`);
      await loadMessages();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '全部标记已读失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="动态提醒与消息" subtitle="对齐 /api/v1/alerts 与 /api/v1/messages 接口。">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">提醒管理</h2>
            <p className="mt-2 text-sm text-slate-600">支持提醒创建、状态更新与删除。</p>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="alert-object-name">object_name</Label>
              <Input
                id="alert-object-name"
                value={objectName}
                onChange={(event) => setObjectName(event.target.value)}
                placeholder="例如：腾讯控股"
              />
            </div>
            <div>
              <Label htmlFor="alert-object-type">object_type</Label>
              <Select
                id="alert-object-type"
                value={objectType}
                onChange={(event) => setObjectType(event.target.value as ObjectType)}
              >
                <option value="company">company</option>
                <option value="stock">stock</option>
                <option value="commodity">commodity</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="alert-schedule-rule">schedule_rule</Label>
              <Select
                id="alert-schedule-rule"
                value={scheduleRule}
                onChange={(event) => setScheduleRule(event.target.value)}
              >
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="realtime">realtime</option>
              </Select>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={pushInApp}
                  onChange={(event) => setPushInApp(event.target.checked)}
                />
                push_in_app
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={pushEmail}
                  onChange={(event) => setPushEmail(event.target.checked)}
                />
                push_email
              </label>
            </div>
            <Button onClick={handleCreateAlert} disabled={submitting}>
              创建提醒
            </Button>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.alert_id} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-950">
                  {alert.object_name} ({alert.object_type})
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  status: {alert.status} / rule: {alert.schedule_rule}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Select
                    value={statusToSet}
                    onChange={(event) => setStatusToSet(event.target.value as AlertStatus)}
                    className="max-w-[140px]"
                  >
                    <option value="enabled">enabled</option>
                    <option value="disabled">disabled</option>
                  </Select>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleToggleAlertStatus(alert.alert_id, statusToSet)}
                    disabled={submitting}
                  >
                    更新状态
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDeleteAlert(alert.alert_id)}
                    disabled={submitting}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-6 bg-slate-950 text-white">
          <div>
            <h3 className="text-xl font-semibold">站内消息</h3>
            <p className="mt-2 text-sm text-slate-300">支持消息列表查询、单条已读与全部已读。</p>
          </div>

          <Button variant="secondary" onClick={handleMarkAllMessagesRead} disabled={submitting}>
            全部标记已读
          </Button>

          <div className="space-y-3">
            {messages.map((item) => (
              <div key={item.message_id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-300">{item.content}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.read_status ? '已读' : '未读'} / {item.created_at}
                </p>
                {!item.read_status ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3"
                    onClick={() => handleMarkMessageRead(item.message_id)}
                    disabled={submitting}
                  >
                    标记已读
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </div>
      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </PageShell>
  );
}
