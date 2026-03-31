import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">创建账号</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">开始使用 8Feet 调研平台</h1>
          <p className="max-w-2xl mx-auto text-base leading-7 text-slate-600">
            注册后即可体验任务发起、流程管理、报告生成与历史数据回溯。
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">账号注册</h2>
              <p className="mt-2 text-sm text-slate-600">填写基本信息，快速开始业务对象深度调研。</p>
            </div>

            <div className="grid gap-5">
              <div>
                <Label htmlFor="register-name">姓名</Label>
                <Input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <Label htmlFor="register-email">邮箱</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="请输入企业邮箱"
                />
              </div>
              <div>
                <Label htmlFor="register-password">密码</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="设置安全密码"
                />
              </div>
            </div>

            <Button className="w-full">注册并继续</Button>
            <p className="text-center text-sm text-slate-600">
              已有账号？{' '}
              <Link to="/login" className="font-medium text-slate-950 hover:text-slate-700">
                立即登录
              </Link>
            </p>
          </Card>

          <Card className="space-y-5 bg-slate-950 text-white">
            <div>
              <h3 className="text-xl font-semibold">核心价值</h3>
              <p className="mt-3 text-sm text-slate-300">
                统一调研流程、任务高效复用、报告可视化输出，让每次分析更具决策价值。
              </p>
            </div>
            <div className="space-y-3 text-sm leading-6 text-slate-300">
              <p className="border-t border-slate-800 pt-3">- 简洁界面，快速上手</p>
              <p className="border-t border-slate-800 pt-3">- 结构化调研任务管理</p>
              <p className="border-t border-slate-800 pt-3">- 可复用的调研与报告输出</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
