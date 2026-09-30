# 扩展与 SDK

从 Hello 示例开始，完成开发加载、打包安装、实际调用，再选择所需的 Runtime 和执行方式。

## 创建开发包

<p>以下命令在 Agent 仓库根目录运行，需先完成<a href="quickstart.md">快速开始</a>中的 Node.js ≥24、pnpm ≥12 和依赖准备。将占位路径替换为本机绝对路径；输出目录的父目录须已存在，创建命令拒绝覆盖已有目录。</p><pre><code class="language-bash">node bin/tunmo-extension.mjs create org.example.hello /absolute/new/hello
node bin/tunmo-extension.mjs validate extension /absolute/new/hello
node bin/tunmo-agent.mjs --session-id hello-dev-001 --cwd /absolute/project --extension /absolute/new/hello/index.mjs</code></pre><p>完整开发包包含 <code>extension.json</code>、<code>index.mjs</code>、<code>tools.mjs</code> 与本地 <code>sdk.mjs</code>，可以独立复制，不需要全局安装 SDK。最后一条命令启动的是 RPC 进程；按<a href="rpc.md">RPC 接入</a>等待 ready 后，再通过客户端发送以下消息，每行以换行结束：</p><pre><code class="language-json">{&quot;id&quot;:&quot;hello-1&quot;,&quot;type&quot;:&quot;prompt&quot;,&quot;message&quot;:&quot;请调用 org_example_hello_hello，参数 name 为 World。&quot;}</code></pre><p>模型需要已配置且可用。先检查 <code>tool_execution_start</code> 中 <code>toolName</code> 为 <code>org_example_hello_hello</code>、<code>args</code> 为 <code>{"name":"World"}</code>；再按 <code>toolCallId</code> 匹配 <code>tool_execution_end</code>，确认 <code>isError: false</code>，结果文本为 <code>Hello, World</code>，<code>details.ok: true</code>。自然语言回复本身不能证明工具已执行。修改开发目录后，结束旧进程并使用新的 session-id 启动；不要将同一示例的开发加载与受管安装混在一次验证中。</p>

## 声明工具

<p>extension.json 声明包身份、兼容范围、工具贡献和 runtimeRequirements。入口通过 defineExtension 提交定义：</p><pre><code class="language-javascript">import { defineExtension } from &#x27;./sdk.mjs&#x27;;
import { hello } from &#x27;./tools.mjs&#x27;;

export default defineExtension(import.meta.url, () =&gt; ({
  tools: { hello },
}));</code></pre><p>tools 的键对应清单 definitionExport，工具名对应清单 name。描述、参数 schema、promptSnippet 与执行函数在工具定义中维护。</p><p>可选 setup(pi) 注册相关命令与事件，不能绕过清单再次 registerTool。Host 完整校验后才提交暂存注册，失败 setup 不会提交部分贡献。</p><p>清单中的 <code>runtimeRequirements</code> 按别名声明需求，工具的 <code>runtimeRefs</code> 只能引用这些别名。<code>local-in-process</code> 工具实现 <code>execute</code>；<code>local-process</code> 工具实现 <code>process</code>，并可用 <code>toResult</code> 转换结果。以 <code>sdk/index.d.mts</code> 为接口依据，不从 Host 内部模块导入私有实现。</p><p>示例 Hello 的宿主 Node 需求 <code>&gt;=22.19.0</code> 是扩展自身的兼容范围，不会降低 Agent 当前 <code>&gt;=24.0.0</code> 的启动要求。</p>

## 分发与安装

<pre><code class="language-bash">node bin/tunmo-extension.mjs pack extension /absolute/new/hello /absolute/hello.tunmo
node bin/tunmo-extension.mjs install /absolute/hello.tunmo
node bin/tunmo-extension.mjs status
node bin/tunmo-agent.mjs --session-id hello-installed-001 --cwd /absolute/project</code></pre><p>检查安装结果的 <code>current.status</code>，以及 status 中对应扩展的 <code>enabled</code>、<code>current.status</code> 和 <code>current.error</code>。应为启用且 ready；随后在不传 <code>--extension</code> 的新进程中重复 Hello 调用，确认实际加载安装内容。</p><p>默认安装到 <code>~/.tunmo/agent</code> 的用户作用域。需要仅在某项目使用时，管理命令加 <code>--project /absolute/project</code>，Agent 的 <code>--cwd</code> 指向同一项目。<code>--agent-dir</code> 只选择管理命令的数据目录，不会改变 Agent 启动器固定的数据目录；不要把隔离测试库误当成正常启动时的安装库。生产管理命令还应显式传入 <code>--release-root /absolute/agent</code>。</p><p>扩展管理提供 enable、disable、rollback、forget-rollback、uninstall、gc、recover。修改已安装包后应递增版本，重新打包并 install；同 ID 同版本不同内容会被拒绝，卸载再装也不会绕过身份记录。缺少 Runtime 时进入 <code>pending-dependencies</code>；升级候选缺依赖时，已有成功版本继续保留，留意 <code>candidateVersion</code>。</p><p>用户扩展不能自声明必选身份或取得保留工具名。开发目录修改需新建 Agent 进程，reload 保留当前会话已锁定的贡献。</p>

## 执行与产物

<p>进程内工具通过 getExecutionContext() 获取本次 signal、产物服务和授权凭据。子进程工具返回 process plan，由 Host 定位声明的 Runtime，不能指定任意 executable 或回退 PATH。</p><p>Host 在进程树停止后、临时目录删除前调用 toResult，允许检查普通文件并保存持久产物。不要把临时路径作为长期交付结果；单产物默认上限 16 MiB。</p><p>SDK 和摘要校验不是沙箱。进程内扩展以当前用户权限运行，取消属于合作式；仅加载受信任扩展。</p><p>已有 GIS 模块的一次性数据任务可优先使用对应 <code>execute_python</code> 工具；只有需要长期分发、固定工具参数或独立版本管理时，才制作新的扩展。</p><p><code>process(input, context)</code> 的 <code>packageRoot</code> 是扩展包目录，<code>projectWorkspace</code> 是启动时选定的真实项目目录，<code>executionId</code> 是 Host 分配的执行标识；<code>toResult(result, { workspace })</code> 的 workspace 则是本次任务临时目录。不要混淆这些路径或用模型输入覆盖可信上下文。完整的 Runtime 准备与进程协议见<a href="runtimes.md">Runtime 与执行生命周期</a>。</p>

## 四个示例如何选择

<p>以下目录均位于 Agent 仓库的 <code>examples/</code>，输入均为 <code>{"name":"World"}</code>。可按上面的 pack / install 流程分别打包，替换包目录和归档文件名。</p><ul><li><code>hello</code>：最小进程内工具；调用 <code>org_example_hello_hello</code>，返回 <code>Hello, World</code>，使用实际 Agent Node，无需另行导入 Node 制品。</li><li><code>cloud-text</code>：文本与产物服务；调用 <code>org_example_cloud_text_hello</code>，返回 <code>HELLO, WORLD</code> 和产物引用。默认本地执行，模拟云端必须按<a href="runtimes.md">执行策略</a>显式启用。</li><li><code>shared-node-a</code>：子进程工具 <code>org_example_shared_node_a_hello</code>，返回 <code>Hello a, World</code> 及 Node 版本、PID 和任务目录。</li><li><code>shared-node-b</code>：子进程工具 <code>org_example_shared_node_b_hello</code>，返回 <code>Hello b, World</code>；与 a 共享符合要求的解释器制品，每次调用使用独立进程和任务目录。</li></ul><p>两个 shared-node 示例都需要 <code>org.nodejs.node@^26.0.0</code> 的 <code>artifact</code> 绑定，不携带 Node。系统 PATH 上有 Node 仍可能得到 <code>RuntimeNotFound</code>；先按<a href="runtimes.md">离线导入</a>准备匹配制品，再启动新进程。</p>

## 随扩展分发 Skills

<p>Host 0.1.4 起，可在 <code>extension.json</code> 添加以下字段（片段）。创建对应的 SKILL.md，并保持 Pi 兼容字段及其他清单内容：</p><pre><code class="language-json">{
  &quot;compatibility&quot;: { &quot;extensionHost&quot;: &quot;^0.1.4&quot;, &quot;pi&quot;: &quot;0.87.1&quot; },
  &quot;skills&quot;: [&quot;skills/my-skill/SKILL.md&quot;]
}</code></pre><p>路径必须指向包内可读文件，不允许重复、缺失或越界。Skill 和引用资源随完整扩展打包，由内容摘要、安装版本和租约共同管理。</p><p>自动加载适用于受管安装与发行快照中已启用、依赖就绪的扩展。仅用 <code>--extension</code> 加载开发包时，另加 <code>--skill /absolute/new/hello/skills/my-skill/SKILL.md</code> 调试。新进程中用 <code>get_commands</code> 检查对应 <code>skill:*</code> 条目。停用后旧会话已加载的文本不会动态移除，新的会话才刷新；具体格式见<a href="skills.md">Skills 与知识复用</a>。</p>

## 验收与常见问题

<ol><li><strong>清单校验：</strong>validate 检查清单，不能证明导出、注册或业务执行成功。</li><li><strong>打包与安装：</strong>pack 成功只证明可打包；install / status 为 ready 说明当前安装依赖可解析，还要检查 enabled。</li><li><strong>新进程激活：</strong>等待 ready 后查看 <code>/tunmo-extensions</code> 的工具名与失败信息。工具缺失时检查 module、definitionExport、工具 name、兼容范围和安装作用域。</li><li><strong>实际调用：</strong>检查 <code>tool_execution_end.isError</code>、文本和 details，产物工具还要验证引用可读；不能以模型复述预期文本作为验收。</li></ol><p><code>RuntimeNotFound</code> / <code>pending-dependencies</code>：补齐<a href="runtimes.md">匹配 Runtime</a>。同版本内容冲突：递增扩展版本。修改后仍是旧行为：启动新进程并检查加载来源。Windows 子进程报 <code>ExecutorUnavailable</code>：核对<a href="runtimes.md">监督器准备</a>。源码仓库的离线集成用例见 <code>test/rpc/managed-native.integration.test.mjs</code>，其中用确定性本地驱动验证真实安装和工具调用，不需要模型服务。</p>

## 内容依据

- `sdk/README.md`
- `sdk/index.d.mts`
- `bin/tunmo-extension.mjs`
- `examples/hello/README.md`
- `src/extension-host/execution/session.ts`
- `src/extension-host/execution/services.ts`
- `scripts/create-extension.mjs`
- `examples/hello/extension.json`
- `examples/cloud-text/README.md`
- `examples/shared-node-a/extension.json`
- `examples/shared-node-b/extension.json`
- `src/extension-host/management/package-installations.ts`
- `test/rpc/managed-native.integration.test.mjs`
