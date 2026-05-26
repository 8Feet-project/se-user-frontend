import { Bot, CheckCircle2, FileText, RefreshCw, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  getModelsAvailable,
  sendUserPersonaMessage,
  skipUserPersonaPrompt,
  startUserPersonaConversation,
} from '@/api/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  ModelAvailableItem,
  UserPersona,
  UserPersonaConversationMessage,
  UserPersonaConversationResponse,
} from '@/types';

interface PersonaSetupDialogProps {
  open: boolean;
  onboarding?: boolean;
  persona: UserPersona | null;
  onOpenChange: (open: boolean) => void;
  onPersonaChange: (persona: UserPersona) => void;
  onNotice?: (message: string) => void;
}

const quickReplies = [
  '我是投资研究/二级市场用户，关注财务质量、估值变化和风险信号。',
  '我是企业经营/战略用户，关注行业格局、竞争对手和可落地建议。',
  '我希望报告先给结论，再展开证据链和不确定性。',
  '信息已经足够，请生成我的人设分析报告。',
];

function messageKey(message: UserPersonaConversationMessage, index: number) {
  return `${message.role}-${index}-${message.content.slice(0, 16)}`;
}

function modelLabel(model: ModelAvailableItem) {
  return `${model.model_name}${model.provider ? ` / ${model.provider}` : ''}`;
}

function AssistantMessageMarkdown({ content }: { content: string }) {
  return (
    <div className="persona-chat-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function PersonaSetupDialog({
  open,
  onboarding = false,
  persona,
  onOpenChange,
  onPersonaChange,
  onNotice,
}: PersonaSetupDialogProps) {
  const [models, setModels] = useState<ModelAvailableItem[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [conversation, setConversation] = useState<UserPersonaConversationResponse | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const hasExistingPersona = Boolean(persona?.has_persona);
  const messages = useMemo(() => conversation?.messages ?? [], [conversation]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setError('');
    setConversation(null);
    setInput('');
    void loadModels();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, busy]);

  const loadModels = async () => {
    try {
      const response = await getModelsAvailable();
      setModels(response.models);
      setSelectedModelId((current) => current || response.recommended_model_id || response.models[0]?.model_id || '');
    } catch (loadError) {
      const reason = loadError instanceof Error ? loadError.message : '模型列表加载失败';
      setError(reason);
    }
  };

  const handleStart = async () => {
    if (!selectedModelId) {
      setError('请先选择用于设定人设的模型。');
      return;
    }
    try {
      setBusy(true);
      setError('');
      const response = await startUserPersonaConversation({ model_id: selectedModelId });
      setConversation(response);
      onPersonaChange(response.persona);
    } catch (startError) {
      const reason = startError instanceof Error ? startError.message : '启动人设设定失败';
      setError(reason);
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async (message?: string) => {
    const content = (message ?? input).trim();
    if (!content || !conversation || busy) {
      return;
    }
    const optimisticConversation: UserPersonaConversationResponse = {
      ...conversation,
      latest_user_message: content,
      messages: [...conversation.messages, { role: 'user', content }],
      updated_at: new Date().toISOString(),
    };
    setConversation(optimisticConversation);
    setInput('');
    try {
      setBusy(true);
      setError('');
      const response = await sendUserPersonaMessage(conversation.thread_id, { message: content });
      setConversation(response);
      onPersonaChange(response.persona);
      if (response.status === 'completed' && response.persona.has_persona) {
        onNotice?.('人设已更新，后续调研会参考这份背景。');
      }
    } catch (sendError) {
      const reason = sendError instanceof Error ? sendError.message : '发送消息失败';
      setError(reason);
    } finally {
      setBusy(false);
    }
  };

  const handleSkip = async () => {
    try {
      setBusy(true);
      setError('');
      const response = await skipUserPersonaPrompt();
      onPersonaChange(response);
      onOpenChange(false);
      onNotice?.('已跳过人设引导，可随时在个人中心重新设定。');
    } catch (skipError) {
      const reason = skipError instanceof Error ? skipError.message : '跳过失败';
      setError(reason);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={busy ? undefined : onOpenChange}>
      <DialogContent className="persona-dialog flex max-h-[calc(100vh-2rem)] h-[calc(100vh-2rem)] flex-col overflow-hidden sm:h-[min(760px,calc(100vh-2rem))] sm:max-w-3xl">
        <DialogHeader className="pr-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(99,202,183,0.22)] bg-[rgba(99,202,183,0.09)] text-[#63cab7]">
              <Sparkles size={18} />
            </div>
            <div>
              <DialogTitle className="text-xl text-slate-100">设定调研人设</DialogTitle>
              <DialogDescription className="mt-1">
                {hasExistingPersona ? '这次会开启新的对话，并用新的报告覆盖当前人设。' : '让 AI 通过短对话了解你的调研偏好。'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-5 overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
            <div className="panel-subtle p-4">
              <Label htmlFor="persona-model">模型</Label>
              <Select
                id="persona-model"
                className="mt-2"
                value={selectedModelId}
                onChange={(event) => setSelectedModelId(event.target.value)}
                disabled={busy || Boolean(conversation)}
              >
                {models.map((model) => (
                  <option key={model.model_id} value={model.model_id}>
                    {modelLabel(model)}
                  </option>
                ))}
              </Select>
              {models.find((model) => model.model_id === selectedModelId)?.description ? (
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {models.find((model) => model.model_id === selectedModelId)?.description}
                </p>
              ) : null}
              <Button className="mt-3 w-full" onClick={handleStart} disabled={busy || Boolean(conversation) || !models.length}>
                {busy && !conversation ? <RefreshCw className="animate-spin" /> : <Bot />}
                开始设定
              </Button>
            </div>

            {hasExistingPersona ? (
              <div className="panel-solid p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <FileText size={15} className="text-[#63cab7]" />
                  当前人设
                </div>
                <p className="mt-2 line-clamp-5 text-sm leading-6 text-slate-400">
                  {persona?.summary || '已保存一份人设报告。'}
                </p>
              </div>
            ) : null}

            {onboarding ? (
              <Button variant="secondary" className="w-full" onClick={handleSkip} disabled={busy}>
                暂时跳过
              </Button>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#07111f]/60">
            <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {!conversation ? (
                <div className="flex h-full min-h-[320px] items-center justify-center px-6 text-center">
                  <div>
                    <p className="text-base font-semibold text-slate-100">选择模型后开始新的设定对话</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      AI 会逐步确认背景、诉求、调研风格、深度和报告偏好，并在最后保存为人设报告。
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={messageKey(message, index)}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          message.role === 'user'
                            ? 'bg-[#63cab7] text-[#07111f]'
                            : 'border border-white/10 bg-white/[0.05] text-slate-200'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <AssistantMessageMarkdown content={message.content} />
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  ))}
                  {busy ? (
                    <div className="flex justify-start">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-300">
                        正在思考...
                      </div>
                    </div>
                  ) : null}
                  {conversation.status === 'completed' && conversation.persona.has_persona ? (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                        <CheckCircle2 size={16} />
                        人设已保存
                      </div>
                      <div className="persona-markdown mt-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {conversation.persona.content_markdown}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <div className="border-t border-white/10 p-4">
              {conversation && conversation.status !== 'completed' ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      className="rounded-full border border-[rgba(99,202,183,0.2)] bg-white/[0.04] px-3 py-1.5 text-left text-xs leading-5 text-slate-300 transition hover:border-[rgba(99,202,183,0.4)] hover:bg-white/[0.07]"
                      onClick={() => void handleSend(reply)}
                      disabled={busy}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={conversation ? '输入你的补充，或直接选择上方选项' : '请先开始设定'}
                  disabled={busy || !conversation || conversation.status === 'completed'}
                  className="min-h-20 resize-none"
                />
                <Button
                  className="h-full min-h-20"
                  onClick={() => void handleSend()}
                  disabled={busy || !conversation || !input.trim() || conversation.status === 'completed'}
                >
                  <Send />
                  发送
                </Button>
              </div>
              {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
            </div>
          </div>
        </div>

        <DialogFooter className="persona-dialog-footer">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
