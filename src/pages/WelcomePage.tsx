import { ArrowRight, ClipboardList, FileText, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ThemeToggle } from '@/components/common/ThemeToggle';
import { hasAccessToken, takeAuthNotice } from '@/lib/auth';

const quickLinks = [
  { icon: ClipboardList, label: '发起调研', sub: '输入对象，立即进入标准化任务流程', path: '/launch' },
  { icon: GitBranch, label: '查看流程', sub: '实时跟踪节点状态与事件流', path: '/process' },
  { icon: FileText, label: '调研报告', sub: '查看引用、导出内容并继续追问', path: '/report' },
];

export function WelcomePage() {
  const isSignedIn = hasAccessToken();
  const authNotice = takeAuthNotice();

  return (
    <div className="app-shell">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1320px] flex-col px-5 py-5 sm:px-8 lg:px-10 lg:py-8">
        <header className="shell-header surface-grid">
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <Link to="/welcome" className="flex items-center gap-3">
              <div className="brand-mark h-11 w-11 rounded-[18px]">
                <span className="text-[11px] font-extrabold tracking-[0.22em] text-[#63cab7]">8F</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">8Feet</p>
                <p className="mt-1 text-xs text-slate-500">智能调研平台</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/login" className="text-sm text-slate-400 transition hover:text-slate-200">登录</Link>
              <Link to={isSignedIn ? '/launch' : '/register'} className="button-ghost-accent gap-2">
                {isSignedIn ? '进入工作台' : '注册账号'}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col py-8 lg:py-10">
          <section className="shell-header surface-grid flex flex-col justify-between">
            <div className="relative z-10">
              {authNotice ? <div className="message-strip mb-5 max-w-2xl">{authNotice}</div> : null}
              <div className="mt-5 max-w-4xl">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-100 sm:text-5xl lg:text-[4rem]">
                  8Feet 智能调研平台
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                  面向商业研究任务的前端入口。登录后可以创建调研任务、查看执行流程、阅读报告并管理历史记录。
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to={isSignedIn ? '/launch' : '/login'} className="button-primary gap-2 px-8 py-3.5">
                  {isSignedIn ? '进入任务发起页' : '登录'}
                  <ArrowRight size={16} />
                </Link>
                <Link to={isSignedIn ? '/history' : '/register'} className="button-secondary gap-2 px-8 py-3.5">
                  {isSignedIn ? '查看历史记录' : '注册账号'}
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-6 glass-card p-5 sm:p-6">
            <p className="page-kicker">常用入口</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-100">工作台页面</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              登录后可直接进入以下页面。未登录访问这些页面时会回到首页。
            </p>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {quickLinks.map((link) => (
                <Link key={link.path} to={isSignedIn ? link.path : '/login'} className="quick-link-card group">
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
