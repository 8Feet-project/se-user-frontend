import { ArrowRight, BarChart3, BookOpen, ClipboardList, FileText, GitBranch, Layers, Zap } from 'lucide-react';
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
  { icon: ClipboardList, label: '发起调研', sub: '输入对象，立即进入标准化任务流程', path: '/' },
  { icon: GitBranch, label: '查看流程', sub: '实时跟踪节点状态与事件流', path: '/process' },
  { icon: FileText, label: '调研报告', sub: '查看引用、导出内容并继续追问', path: '/report' },
];

export function WelcomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_14%_0%,rgba(99,202,183,0.11),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(56,189,248,0.08),transparent_30%),linear-gradient(160deg,#07111f_0%,#0a1628_48%,#081426_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(99,202,183,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,202,183,0.03)_1px,transparent_1px)] bg-[size:52px_52px] opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-[#63cab7]/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1280px] flex-col px-6 py-6 sm:px-10 lg:px-12 lg:py-8">
        <header className="flex items-center justify-between gap-4">
          <Link to="/welcome" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.3)] bg-[rgba(99,202,183,0.08)]">
              <span className="text-[11px] font-extrabold tracking-[0.22em] text-[#63cab7]">8F</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">8Feet</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Commercial Intelligence Research</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-400 transition hover:text-slate-200">登录</Link>
            <Link to="/" className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(99,202,183,0.24)] bg-[rgba(99,202,183,0.08)] px-4 py-2.5 text-sm font-medium text-[#63cab7] transition hover:bg-[rgba(99,202,183,0.14)]">
              进入工作台
              <ArrowRight size={15} />
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center py-10 lg:py-16">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-center">
            <section>
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(99,202,183,0.2)] bg-[rgba(99,202,183,0.08)] px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#63cab7] shadow-[0_0_6px_#63cab7]" />
                <span className="text-xs font-medium tracking-wide text-[#63cab7]">AI 商业情报研究平台</span>
              </div>

              <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.08] tracking-tight text-slate-100 md:text-6xl">
                让 AI 成为你的
                <br />
                <span className="text-[#63cab7]">专属情报分析助手</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                从任务发起、流程监控到报告追问，8Feet 用统一的深色工作台把商业研究变成连续、可追踪、可复用的团队流程。
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#63cab7] px-8 py-3.5 text-sm font-semibold text-[#07111f] shadow-[0_0_32px_rgba(99,202,183,0.24)] transition hover:bg-[#7dd8c9]">
                  立即开始调研
                  <ArrowRight size={16} />
                </Link>
                <Link to="/report" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(99,202,183,0.2)] px-8 py-3.5 text-sm font-medium text-slate-300 transition hover:border-[rgba(99,202,183,0.35)] hover:text-slate-100">
                  查看示例报告
                </Link>
              </div>

              <div className="mt-12 grid gap-3 sm:grid-cols-3">
                {quickLinks.map((link) => (
                  <Link key={link.path} to={link.path} className="group rounded-2xl border border-[rgba(99,202,183,0.12)] bg-[rgba(15,31,53,0.74)] p-4 transition hover:border-[rgba(99,202,183,0.24)] hover:bg-[rgba(15,31,53,0.95)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.18)] bg-[rgba(99,202,183,0.08)] text-[#63cab7]">
                      <link.icon size={16} strokeWidth={1.9} />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-100">{link.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{link.sub}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-[rgba(99,202,183,0.14)] bg-[#0f1f35]/82 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8">
              <div className="rounded-2xl border border-[rgba(99,202,183,0.12)] bg-[#07111f]/85 p-5">
                <p className="page-kicker">Workstation Preview</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">一个更连续的研究工作台</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  侧边栏现在支持伸展，主内容只为收起态预留最小空间；这让工作区更聚焦，也更接近设计系统原型里的悬浮式导航体验。
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {features.map((feat) => (
                  <div key={feat.title} className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.18)] bg-[rgba(99,202,183,0.08)] text-[#63cab7]">
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
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
