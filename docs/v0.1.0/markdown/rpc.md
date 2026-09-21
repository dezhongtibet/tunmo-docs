# 会话与 RPC 接入

> 文档版本：v0.1.0

客户端通过 Pi 原生 JSONL 协议与 Agent 通信，管理操作使用独立 CLI。

## 进程与通道

<p>一个客户端任务绑定一个 Agent 进程 / Pi Session。使用 spawn 或 execFile 的参数数组传递路径，不拼接 shell 命令。</p><pre><code class="language-javascript">import { spawn } from &#x27;node:child_process&#x27;;

const child = spawn(process.execPath, [
  &#x27;/absolute/tunmo-agent/bin/tunmo-agent.mjs&#x27;,
  &#x27;--session-id&#x27;, &#x27;client-task-001&#x27;,
  &#x27;--cwd&#x27;, &#x27;/absolute/project&#x27;,
], { stdio: [&#x27;pipe&#x27;, &#x27;pipe&#x27;, &#x27;pipe&#x27;] });

// 等收到 ready 通知后，再向 stdin 写入命令。
// stdout 按换行分帧；stderr 单独处理诊断。</code></pre><p>生产发行先通过 src/bootstrap.mjs 定位和验证随包 Node。上例用于满足项目版本要求的 Node 环境，不假设 Electron 的 process.execPath 就是独立 Node。</p>

## 常用消息

<pre><code class="language-json">{&quot;id&quot;:&quot;state-1&quot;,&quot;type&quot;:&quot;get_state&quot;}
{&quot;id&quot;:&quot;commands-1&quot;,&quot;type&quot;:&quot;get_commands&quot;}
{&quot;id&quot;:&quot;prompt-1&quot;,&quot;type&quot;:&quot;prompt&quot;,&quot;message&quot;:&quot;检查当前项目的数据文件。&quot;}
{&quot;id&quot;:&quot;abort-1&quot;,&quot;type&quot;:&quot;abort&quot;}</code></pre><p>以上为独立消息示例。通过 id 关联响应，并处理原生消息、工具执行和扩展 UI 事件。完整协议以项目锁定的 Pi 0.84.1 为准。</p><p>就绪标记使用 <code>extension_ui_request / notify</code>，工具进度使用 <code>tool_execution_update</code>，Worker 进度在 <code>details.execution</code> 中呈现。</p>

## 不要混用管理协议

<p>Agent 不提供 tunmo.* 私有 RPC，也不拦截或改写 Pi 原生命令。扩展管理运行 bin/tunmo-extension.mjs，可选模块运行 bin/tunmo-module.mjs；这些命令不能写入 Agent stdin。</p><p>get_commands 用来观察命令与 Skill，不能把它当作完整工具 schema 查询接口。Pi 的 new_session、switch_session、fork、clone 仍保持原生语义；客户端并行任务应各自创建进程，不用会话切换代替多任务隔离。</p>

## 退出和错误

<p>stdin EOF 正常退出；SIGTERM / SIGHUP 沿用 Pi 的 143 / 129 语义。启动参数错误为 2，配置初始化失败为 20，内置资源校验失败为 21，Host 必选扩展未就绪为 22，启动器内部错误为 70。其他阶段应结合 stderr 和实际退出码判断。</p><p>abort 请求与子进程真正结束之间存在清理过程。客户端应等待终态，保留部分输出和失败结果的区别，不把取消确认当成产物成功。</p>

## 内容依据

- `src/launcher.ts`
- `src/bootstrap.mjs`
- `src/extension-host/host.ts`
- `docs/architecture.md`
- `docs/electron-runtime-verification.md`
