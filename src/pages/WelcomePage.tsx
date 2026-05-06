import { ArrowRight, BarChart3, BookOpen, ClipboardList, FileText, GitBranch, Layers, Orbit, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Zap,
    title: 'AI 驱动分析',
    desc: '多模型协同、自动检索信源，并为关键结论提供交叉验证。',
  },
  {
    icon: Layers,
    title: '多维数据覆盖',
    desc: '覆盖新闻、财报、研报与市场数据，把调研输入纳入同一工作流。',
  },
  {
    icon: BarChart3,
    title: '结构化报告输出',
    desc: '支持深度追问、引用溯源与 PDF / Markdown 导出。',
  },
  {
    icon: BookOpen,
    title: '知识沉淀',
    desc: '收藏、历史记录、提醒策略，让研究资产持续积累。',
  },
];

const quickLinks = [
  { icon: ClipboardList, label: '发起调研', sub: '输入对象，立即进入标准化任务流程', path: '/launch' },
  { icon: GitBranch, label: '查看流程', sub: '实时跟踪节点状态与事件流', path: '/process' },
  { icon: FileText, label: '调研报告', sub: '查看引用、导出内容并继续追问', path: '/report' },
];

const controlMetrics = [
  { value: '24h', label: '持续监测窗口' },
  { value: 'Multi', label: '模型协同分析' },
  { value: 'Traceable', label: '引用溯源输出' },
];

const workflowPanels = [
  {
    icon: Orbit,
    title: '统一调研指挥台',
    desc: '把输入、流程、结果和资产管理放到同一界面语言里，减少页面切换的心智断裂。',
  },
  {
    icon: ShieldCheck,
    title: '结论可追溯',
    desc: '从信源检索到结构化报告，保留验证链路，便于团队复核与继续追问。',
  },
  {
    icon: BarChart3,
    title: '可持续复用',
    desc: '收藏、历史与提醒不再是附属功能，而是研究资产沉淀的一部分。',
  },
];

export function WelcomePage() {
  return (
    <div className="app-shell">
      <div className="pointer-events-none absolute left-[8%] top-[12%] z-0 h-[280px] w-[280px] rounded-full bg-[#63cab7]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[8%] right-[4%] z-0 h-[360px] w-[360px] rounded-full bg-sky-500/10 blur-[140px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1320px] flex-col px-5 py-5 sm:px-8 lg:px-10 lg:py-8">
        <header className="shell-header surface-grid">
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <Link to="/welcome" className="flex items-center gap-3">
              <div className="brand-mark h-11 w-11 rounded-[18px]">
                <span className="text-[11px] font-extrabold tracking-[0.22em] text-[#63cab7]">8F</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">8Feet</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">Commercial Intelligence Research</p>
              </div>
            </Link>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-2">
                <span className="signal-pill">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#63cab7] shadow-[0_0_8px_#63cab7]" />
                  AI Research Console
                </span>
                <span className="signal-pill border-[rgba(148,163,184,0.16)] text-slate-300">Dark Glass Workspace</span>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-slate-400 transition hover:text-slate-200">登录</Link>
                <Link to="/launch" className="button-ghost-accent gap-2">
                  进入工作台
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col py-8 lg:py-10">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)] lg:items-stretch">
            <div className="shell-header surface-grid flex flex-col justify-between">
              <div className="relative z-10">
                <p className="shell-kicker">Editorial Control Room</p>
                <div className="mt-4 max-w-4xl">
                  <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-slate-100 sm:text-5xl lg:text-[4.4rem]">
                    把商业研究
                    <span className="block text-[#63cab7]">组织成一条连续工作流</span>
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                    8Feet 不是把“搜索、流程、报告”拼接在一起，而是把它们整理成一套统一的研究操作界面。
                    从任务发起到结论沉淀，信息始终留在同一条视线和节奏里。
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-8 flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link to="/launch" className="button-primary gap-2 px-8 py-3.5">
                    立即开始调研
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/report" className="button-secondary gap-2 px-8 py-3.5">
                    查看示例报告
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {controlMetrics.map((metric) => (
                    <div key={metric.label} className="metric-chip">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
                      <p className="mt-2 text-lg font-semibold text-slate-100">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="glass-card surface-grid p-5 sm:p-6">
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="page-kicker">System Snapshot</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-100">同一套视觉语言覆盖入口与工作台</h2>
                  </div>
                  <span className="signal-pill hidden sm:inline-flex">Preview</span>
                </div>

                <div className="panel-solid mt-5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Research Surface</p>
                      <p className="mt-2 text-lg font-semibold text-slate-100">欢迎页、导航壳层与任务入口已统一</p>
                    </div>
                    <div className="brand-mark h-12 w-12 rounded-[18px] text-[#63cab7]">
                      <Layers size={18} strokeWidth={1.9} />
                    </div>
                  </div>
                  <div className="shell-divider mt-5" />
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="metric-chip">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Tone</p>
                      <p className="mt-2 text-sm font-semibold text-slate-100">精密指挥台</p>
                    </div>
                    <div className="metric-chip">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Focus</p>
                      <p className="mt-2 text-sm font-semibold text-slate-100">层次、密度、可读性</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {features.map((feat) => (
                    <div key={feat.title} className="panel-subtle p-4">
                      <div className="flex items-start gap-3">
                        <div className="brand-mark mt-0.5 h-10 w-10 rounded-2xl text-[#63cab7]">
                          <feat.icon size={16} strokeWidth={1.9} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{feat.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-400">{feat.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="glass-card p-5 sm:p-6">
              <p className="page-kicker">Quick Routes</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-100">从常用入口直接切进任务流</h2>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
                    保持现有主要路径不变，但让入口卡片拥有更明确的层次、留白和落点。
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {quickLinks.map((link) => (
                  <Link key={link.path} to={link.path} className="quick-link-card group">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="brand-mark h-11 w-11 shrink-0 rounded-[18px] text-[#63cab7]">
                          <link.icon size={17} strokeWidth={1.9} />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-slate-100">{link.label}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-400">{link.sub}</p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-[#63cab7]">
                        进入
                        <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 sm:p-6">
              <p className="page-kicker">Workflow Principles</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-100">不是展示 AI 能力，而是组织研究动作</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                这次重构的重点不是加更多装饰，而是让欢迎页和工作台共享同样的秩序感、信号感和内容密度。
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {workflowPanels.map((panel) => (
                  <div key={panel.title} className="panel-subtle p-4">
                    <div className="brand-mark h-10 w-10 rounded-2xl text-[#63cab7]">
                      <panel.icon size={16} strokeWidth={1.9} />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-100">{panel.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{panel.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
