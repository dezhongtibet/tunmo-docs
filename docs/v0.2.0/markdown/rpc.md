# 会话与 RPC 接入

> 文档版本：v0.2.0

客户端通过 Pi 原生 JSONL 协议与 Agent 通信，管理操作使用独立 CLI。

## 进程与通道

<p>一个客户端任务绑定一个 Agent 进程 / Pi Session。使用 spawn 或 execFile 的参数数组传递路径，不拼接 shell 命令。</p><pre><code class="language-javascript">import { spawn } from &#x27;node:child_process&#x27;;

const child = spawn(process.execPath, [
  &#x27;/absolute/tunmo-agent/bin/tunmo-agent.mjs&#x27;,
  &#x27;--session-id&#x27;, &#x27;client-task-001&#x27;,
  &#x27;--cwd&#x27;, &#x27;/absolute/project&#x27;,
], { stdio: [&#x27;pipe&#x27;, &#x27;pipe&#x27;, &#x27;pipe&#x27;] });

// 等收到 ready 通知后，再向 stdin 写入命令。
// stdout 按换行分帧；stderr 单独处理诊断。</code></pre><p>生产发行先通过 src/bootstrap.mjs 定位和验证随包 Node。上例用于满足项目版本要求的 Node 环境，不假设 Electron 的 process.execPath 就是独立 Node。</p><p>源码开发先按<a href="quickstart.md">快速开始</a>准备 Node.js ≥24 和已锁定依赖；每次启动分配唯一 <code>--session-id</code>。Agent 数据目录固定为当前用户的 <code>~/.tunmo/agent</code>。模型调用还需要有效的 Provider / 模型配置，进程就绪不代表模型服务已连通。</p>

## 常用消息

<pre><code class="language-json">{&quot;id&quot;:&quot;state-1&quot;,&quot;type&quot;:&quot;get_state&quot;}
{&quot;id&quot;:&quot;commands-1&quot;,&quot;type&quot;:&quot;get_commands&quot;}
{&quot;id&quot;:&quot;prompt-1&quot;,&quot;type&quot;:&quot;prompt&quot;,&quot;message&quot;:&quot;检查当前项目的数据文件。&quot;}
{&quot;id&quot;:&quot;abort-1&quot;,&quot;type&quot;:&quot;abort&quot;}</code></pre><p>以上为独立消息示例。每条命令以 LF（<code>\n</code>）结束；stdout 使用 UTF-8 增量解码，并且只按 LF 分帧，兼容 CRLF。一段数据可能包含半条或多条消息，不能直接对每个 <code>data</code> 块执行 JSON.parse，也不能用会将 Unicode 行分隔符拆开的通用行读取器。持续消费 stdout，并处理 stdin 写入背压。</p><p>先注册事件监听，再等待以下就绪通知。必须同时检查 <code>type</code>、<code>method</code> 及 <code>message</code> 的 <code>tunmo-agent ready</code> 前缀，其他 notify 不是就绪信号。</p><pre><code class="language-json">{&quot;type&quot;:&quot;extension_ui_request&quot;,&quot;method&quot;:&quot;notify&quot;,&quot;message&quot;:&quot;tunmo-agent ready；sessionId=client-task-001&quot;,&quot;notifyType&quot;:&quot;info&quot;,&quot;id&quot;:&quot;...&quot;}</code></pre><ul><li><code>response</code>：用唯一请求 <code>id</code> 关联响应，检查 <code>success</code> 和 <code>error</code>，不要依赖返回顺序。</li><li><code>prompt</code> 的成功响应仅表示受理、排队或命令已处理。持续读取消息与工具事件；Provider 失败或取消可能在后续事件中出现。</li><li><code>tool_execution_update</code>：读取工具进度；受管 Worker 的结构化进度位于 <code>partialResult.details.execution</code>。</li><li><code>tool_execution_end</code>：检查 <code>isError</code> 与 <code>result</code>；受管失败的原因位于 <code>result.details.errorType</code> / <code>result.details.execution</code>。</li><li><code>agent_end</code>：一次底层运行结束，后面可能继续重试、压缩恢复或队列任务。<code>agent_settled</code> 才表示这轮会话没有待自动继续的工作；它本身也不代表所有工具成功。</li></ul><p>完整协议以项目锁定的 Pi 1.1.0 为准；安装依赖后可查阅 <code>node_modules/@earendil-works/pi-coding-agent/docs/rpc.md</code>、<code>rpc-commands.md</code> 与 <code>json.md</code>。</p>

## 不要混用管理协议

<p>Agent 不提供 tunmo.* 私有 RPC，也不拦截或改写 Pi 原生命令。扩展管理运行 bin/tunmo-extension.mjs，可选模块运行 bin/tunmo-module.mjs；这些命令不能写入 Agent stdin。</p><p>get_commands 用来观察命令与 Skill，不能把它当作完整工具 schema 查询接口。Pi 的 new_session、switch_session、fork、clone 仍保持原生语义；客户端并行任务应各自创建进程，不用会话切换代替多任务隔离。</p>

## 退出和错误

<p>stdin EOF 正常退出；SIGTERM / SIGHUP 沿用 Pi 的 143 / 129 语义。启动参数错误为 2，配置初始化失败为 20，内置资源校验失败为 21，Host 必选扩展未就绪为 22，启动器内部错误为 70。其他阶段应结合 stderr 和实际退出码判断。</p><p>abort 请求与子进程真正结束之间存在清理过程。客户端应等待终态，保留部分输出和失败结果的区别，不把取消确认当成产物成功。</p>

## 客户端接入验收

<ol><li>确认进程能启动并收到 ready；设置启动超时，监听进程 <code>error</code> / <code>close</code>，避免一直等待。</li><li>发送 <code>get_state</code>、<code>get_commands</code>，确认请求 ID 与响应匹配。这一步不需要调用模型。</li><li>通过原生 <code>prompt</code> 发送 <code>/tunmo-extensions</code> 或 <code>/tunmo-runtimes</code> 查看扩展与 Runtime 诊断，并消费扩展 UI 通知。ready 只保证必选扩展就绪，可选扩展仍可能加载失败。</li><li>配置模型后，实际调用<a href="extensions.md">Hello 示例</a>，检查工具名称、输入、结果和 <code>agent_settled</code>；再验证 abort、stdin EOF 和异常退出时客户端能结束等待、释放进程。</li></ol><p>区分“管理库安装为 ready”和“当前进程已激活工具”。新增、升级或补齐依赖后，用新的 Agent 进程验证。</p>

## Skill 加载诊断

<p>在 ready 后通过原生 <code>prompt</code> 调用 <code>/tunmo-skills-diagnostics [requestId]</code>，读取当前会话同一 Pi 加载器的结果。查询不调用模型，不写入会话历史。</p><pre><code class="language-json">{&quot;id&quot;:&quot;rpc-diag-1&quot;,&quot;type&quot;:&quot;prompt&quot;,&quot;message&quot;:&quot;/tunmo-skills-diagnostics diag-1&quot;}</code></pre><p>RPC <code>response</code> 只确认命令处理；诊断结果在 <code>extension_ui_request</code>、<code>method: notify</code> 的 <code>message</code> JSON 字符串中。解析后按 <code>kind: tunmo.skill-diagnostics</code> 与 <code>requestId</code> 关联结果，并核对 sessionId / cwd。requestId 可省略，返回 null；提供时须为 1–128 个 ASCII 字符，首字符为字母或数字，其余允许字母、数字、点、下划线、冒号和连字符。下面是解析后的通知示例：</p><pre><code class="language-json">{
  &quot;schemaVersion&quot;: 1,
  &quot;kind&quot;: &quot;tunmo.skill-diagnostics&quot;,
  &quot;requestId&quot;: &quot;diag-1&quot;,
  &quot;sessionId&quot;: &quot;client-task-001&quot;,
  &quot;cwd&quot;: &quot;/absolute/project&quot;,
  &quot;success&quot;: true,
  &quot;data&quot;: {
    &quot;revision&quot;: 1,
    &quot;status&quot;: &quot;ready&quot;,
    &quot;skills&quot;: [],
    &quot;diagnostics&quot;: [],
    &quot;resolutionDiagnostics&quot;: []
  }
}</code></pre><ul><li><code>skills</code> 是当前实际加载的 Pi Skill 列表，保留文件路径与 sourceInfo。</li><li><code>diagnostics</code> 包含 Pi 校验和冲突，冲突保留 winnerPath / loserPath。warning 也可能对应加载失败，须结合 skills 判断，不能把所有 warning 都当作失败。</li><li><code>resolutionDiagnostics</code> 补充 settings 与包 manifest 的明确 Skill 路径缺失或根目录访问失败、本地包缺失、离线包不可用及包解析失败。每项有 code、type、message、resourceType，及可选 path、source、scope。package 级问题不能推断 Skill 名称。来源 URL 输出前移除凭据、查询与片段。</li><li><code>revision</code> 每次 reload 递增并清空旧诊断；status 为 ready / loading / failed。success 只表示成功读取快照，不能当作资源加载成功。</li></ul><p>显式禁用的资源、负向 selector 和未匹配 glob 不误报缺失。Pi 深层目录或符号链接扫描、包 manifest 解析回退的静默跳过仍不保证有诊断，空列表不能证明所有配置正常。</p><p>缺少依赖补丁时返回 <code>success: false</code>、<code>error.code: SkillDiagnosticsUnavailable</code>；非法标识为 SkillDiagnosticsRequestInvalid，读取异常为 SkillDiagnosticsReadFailed。客户端须显示查询错误，不能替换成空诊断数组。初始包解析失败继续使启动失败，可能没有 ready；持续读取 stderr，<code>tunmo-agent: skill-resolution </code> 后为一项 JSON。完整字段见仓库 <code>docs/architecture.md</code>。</p>

## 内容依据

- `src/launcher.ts`
- `src/bootstrap.mjs`
- `src/extension-host/host.ts`
- `docs/architecture.md`
- `docs/electron-runtime-verification.md`
- `package.json`
- `src/extension-host/host-status.ts`
- `test/rpc/managed-native.integration.test.mjs`
- `src/skill-diagnostics.ts`
- `test/rpc/skill-diagnostics.integration.test.mjs`
