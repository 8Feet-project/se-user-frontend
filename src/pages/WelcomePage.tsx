import { ArrowRight, ClipboardList, FileText, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ThemeToggle } from '@/components/common/ThemeToggle';

const quickLinks = [
  { icon: ClipboardList, label: '发起调研', sub: '输入对象，立即进入标准化任务流程', path: '/launch' },
  { icon: GitBranch, label: '查看流程', sub: '实时跟踪节点状态与事件流', path: '/process' },
  { icon: FileText, label: '调研报告', sub: '查看引用、导出内容并继续追问', path: '/report' },
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
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/login" className="text-sm text-slate-400 transition hover:text-slate-200">登录</Link>
              <Link to="/launch" className="button-ghost-accent gap-2">
                进入工作台
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col py-8 lg:py-10">
          <section className="shell-header surface-grid flex flex-col justify-between">
            <div className="relative z-10">
              <span className="signal-pill">
                <span className="h-1.5 w-1.5 rounded-full bg-[#63cab7] shadow-[0_0_8px_#63cab7]" />
                AI 商业研究工作台
              </span>
              <div className="mt-5 max-w-4xl">
                <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-slate-100 sm:text-5xl lg:text-[4.4rem]">
                  把调研任务、流程和报告
                  <span className="block text-[#63cab7]">放进同一条工作流</span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                  适合需要连续做商业研究的场景：发起任务、跟踪节点、查看结果、继续追问，都在同一个界面里完成。
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
            </div>
          </section>

          <section className="mt-6 glass-card p-5 sm:p-6">
            <p className="page-kicker">Quick Routes</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-100">从这里直接进入常用动作</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              如果你已经知道自己要做什么，可以直接进入任务发起、流程监控或报告查看。
            </p>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {quickLinks.map((link) => (
                <Link key={link.path} to={link.path} className="quick-link-card group">
                  <div className="flex flex-col gap-4">
                    <div className="brand-mark h-11 w-11 w-fit rounded-[18px] text-[#63cab7]">
                      <link.icon size={17} strokeWidth={1.9} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-100">{link.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{link.sub}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-[#63cab7]">
                      进入
                      <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
