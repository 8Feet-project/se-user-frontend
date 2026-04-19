import { Link } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  Layers,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'AI 驱动分析',
    desc: '多模型协同，自动检索信源，交叉验证结论',
  },
  {
    icon: Layers,
    title: '多维数据覆盖',
    desc: '覆盖新闻、财报、行研报告、市场数据',
  },
  {
    icon: BarChart3,
    title: '结构化情报输出',
    desc: '深度追问、引用溯源、一键导出 PDF / Markdown',
  },
  {
    icon: BookOpen,
    title: '知识沉淀',
    desc: '收藏夹归档、历史记录、自定义提醒推送',
  },
];

const quickLinks = [
  { icon: ClipboardList, label: '发起调研', sub: '输入对象，立即启动', path: '/' },
  { icon: FileText,      label: '查看报告', sub: '历史报告与深度追问', path: '/report' },
];

export function WelcomePage() {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#060e1b 0%,#0a1628 45%,#071422 100%)' }}
    >
      {/* ── Ambient grid ──────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,202,183,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,202,183,1) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Glow blobs ────────────────────────────────────── */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-[#63cab7]/6 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#3b8bff]/4 blur-[100px]" />

      {/* ── Nav bar ───────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.3)] bg-[rgba(99,202,183,0.09)]">
            <span className="text-[11px] font-extrabold tracking-widest text-[#63cab7]">8F</span>
          </div>
          <span className="text-sm font-semibold tracking-wide text-slate-200">8Feet</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm text-slate-400 transition hover:text-slate-200"
          >
            登录
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-full border border-[rgba(99,202,183,0.3)] bg-[rgba(99,202,183,0.08)] px-5 py-2 text-sm font-medium text-[#63cab7] transition hover:bg-[rgba(99,202,183,0.14)]"
          >
            进入工作台 <ChevronRight size={14} />
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(99,202,183,0.2)] bg-[rgba(99,202,183,0.07)] px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#63cab7] shadow-[0_0_6px_#63cab7]" />
          <span className="text-xs font-medium tracking-wide text-[#63cab7]">AI 情报研究平台</span>
        </div>

        <h1 className="max-w-2xl text-5xl font-semibold leading-[1.15] tracking-tight text-slate-100 md:text-6xl">
          让 AI 成为你的
          <br />
          <span className="text-[#63cab7]">专属情报分析师</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">
          输入一个公司、股票或商品名称，8Feet 将自动检索、交叉验证并生成深度调研报告。
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-2xl bg-[#63cab7] px-8 py-3.5 text-sm font-semibold text-[#07111f] transition hover:bg-[#7dd8c9] shadow-[0_0_32px_rgba(99,202,183,0.25)]"
          >
            立即开始调研 <ChevronRight size={16} />
          </Link>
          <Link
            to="/report"
            className="flex items-center gap-2 rounded-2xl border border-[rgba(99,202,183,0.2)] px-8 py-3.5 text-sm font-medium text-slate-300 transition hover:border-[rgba(99,202,183,0.4)] hover:text-slate-100"
          >
            查看示例报告
          </Link>
        </div>

        {/* ── Quick links ───────────────────────────────────── */}
        <div className="mt-16 grid w-full max-w-lg gap-3 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="group flex items-center gap-4 rounded-2xl border border-[rgba(99,202,183,0.12)] bg-[rgba(15,31,53,0.8)] p-4 text-left transition hover:border-[rgba(99,202,183,0.28)] hover:bg-[rgba(15,31,53,1)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.2)] bg-[rgba(99,202,183,0.07)]">
                <link.icon size={17} className="text-[#63cab7]" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-slate-100">{link.label}</p>
                <p className="text-xs text-slate-500">{link.sub}</p>
              </div>
              <ChevronRight size={14} className="ml-auto text-slate-600 group-hover:text-[#63cab7] transition" />
            </Link>
          ))}
        </div>
      </main>

      {/* ── Feature row ───────────────────────────────────── */}
      <section className="relative z-10 border-t border-[rgba(99,202,183,0.08)] px-10 py-14">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat) => (
            <div key={feat.title} className="space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(99,202,183,0.2)] bg-[rgba(99,202,183,0.07)]">
                <feat.icon size={16} className="text-[#63cab7]" strokeWidth={1.8} />
              </div>
              <p className="text-sm font-semibold text-slate-200">{feat.title}</p>
              <p className="text-sm leading-6 text-slate-500">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
