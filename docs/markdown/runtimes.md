# Runtime 与执行生命周期

以内容身份共享完整环境，让每个会话绑定可追踪的运行版本。

## Runtime 是什么

<p>Runtime 是经过校验的解释器、库环境和入口集合。多个扩展可复用同一内容；不同环境摘要或不兼容版本分别保留，不通过合并 site-packages 实现共享。</p><p>binding: host 校验实际 Agent Node，binding: artifact 选择磁盘制品。匹配包含版本、系统、架构、ABI、最低系统版本、构建身份与摘要。</p><p><code>host</code> 校验的是启动 Agent 的那个 Node，导入另一份 Node 制品不会更换宿主。<code>artifact</code> 则要求发行资源或管理库中存在经过验证的 Runtime；系统 Node、Homebrew 或 PATH 不参与兜底解析。清单别名如 <code>node</code> 只在包内使用，实际身份由 <code>runtimeId</code>、版本和摘要共同确定。</p>

## 会话快照与租约

<p>会话启动时锁定依赖并建立租约。升级后旧会话继续持有旧绑定；新会话选择新版本。垃圾回收复核安装、回滚与活跃租约，只有没有引用的资源才可删除。</p><p>停用可选模块的权限撤销独立于文件保留。保留旧 Runtime 不表示旧会话仍可执行已停用的模块。</p>

## 离线导入

<p>输入必须是已准备、封装摘要且匹配目标平台的 Runtime，不能把普通 Node 安装目录直接传给 import-runtime。已有完整制品目录时，可先校验，再打包并导入：</p><pre><code class="language-bash">node bin/tunmo-extension.mjs validate runtime /absolute/prepared/runtime
node bin/tunmo-extension.mjs pack runtime /absolute/prepared/runtime /absolute/node.runtime.tunmo
node bin/tunmo-extension.mjs import-runtime /absolute/node.runtime.tunmo
node bin/tunmo-extension.mjs status</code></pre><p>也可直接 <code>import-runtime /absolute/prepared/runtime</code>；如果取得的是可信来源提供的匹配 <code>.tunmo</code> 包，直接执行 import-runtime，无需对归档运行只接收目录的 validate。导入会执行内容校验及清单声明的健康检查。</p><p>需要在 Agent 源码仓库构建 Node 制品时，先取得 <code>resources/runtime-builds.json</code> 中与当前平台对应的官方归档，再运行以下构建命令；输入归档的 SHA-256 必须与锁定配置一致，输出目录必须尚不存在：</p><pre><code class="language-bash">node scripts/build-node-runtime.mjs /absolute/downloads/node-archive /absolute/new/node-runtime-build
node bin/tunmo-extension.mjs import-runtime /absolute/new/node-runtime-build/node.runtime.tunmo</code></pre><p>将 node-archive 替换为配置中的实际归档文件。当前构建配置固定 Node 26.0.0，提供 <code>darwin-arm64</code> 和 <code>win32-arm64</code> 两个目标；脚本按当前进程平台选择，不是交叉编译器，不代表其他平台已经验证。输出含 <code>runtime/</code>、<code>node.runtime.tunmo</code> 和 <code>report.json</code>。Runtime 版本与文档站点版本互相独立。</p><p>两个 shared-node 示例要求 <code>org.nodejs.node@^26.0.0</code>。向同一个管理库导入匹配制品后，系统会重新尝试解析 pending-dependencies；再次 status 确认 ready，并启动新的 Agent 进程。只导入更高版本 Runtime 不会改写已就绪安装的精确绑定。</p><p>管理入口不执行 npm/pip 安装脚本。大型目录导入限制为 16 GiB / 200,000 文件；v1 <code>.tunmo</code> 格式仍限制 512 MiB 解包、256 MiB 压缩，不能直接用于大型 GIS 环境。</p>

## 启动与清理

<p>Runtime 可通过 launch 声明固定参数、包内脚本和环境。仅拿到 entrypoints 的程序路径，不能替代包含 launch 的完整启动计划。</p><p>子进程调用有独立任务目录、监督器和执行租约。Unix 使用进程组，Windows 使用 Job Object。先结束进程树，再清理目录与释放占用；超时不等于清理已经结束。</p><p>JSONL Worker 协议与外部 Pi RPC 隔离。Worker 消息须携带同一请求 ID，可报告状态和进度，并且恰好返回一个终态；第三方库诊断写 stderr。</p><p>使用结构化 Worker 时，process plan 声明 <code>protocol: "jsonl-v1"</code> 和 <code>requestId: context.executionId</code>。每条消息含 <code>protocolVersion: 1</code>、相同 <code>id</code> 及 type；成功终态形如 <code>{"type":"result","ok":true,"result":{}}</code>（还需协议版本和 id），失败终态使用 <code>ok:false</code> 与 <code>error:{type,message}</code>。终态后不得再输出，成功内容在 <code>toResult</code> 的 <code>result.workerResult</code> 中取得。shared-node 示例只使用普通 stdout JSON，不需要声明此协议。</p><p>Windows 源码开发运行子进程工具前，先在对应 Windows 环境执行 <code>node scripts/build-windows-helper.mjs</code>；正式发行构建会提供监督器。缺失时可能返回 <code>ExecutorUnavailable</code>。验证应覆盖实际目标平台，不能用 macOS 成功代替 Windows 验收。</p>

## 云端执行边界

<p><code>examples/cloud-text</code> 默认使用 local-in-process。要验证本机 mock 后端，在 Agent 数据目录 <code>~/.tunmo/agent/execution-policy.json</code> 中加入以下配置，并启动新的 Agent 进程；已有文件时合并对应工具条目，保留其他策略：</p><pre><code class="language-json">{
  &quot;schemaVersion&quot;: 1,
  &quot;tools&quot;: {
    &quot;org.example.cloud-text/hello&quot;: {
      &quot;executor&quot;: &quot;cloud&quot;,
      &quot;backend&quot;: &quot;mock&quot;,
      &quot;allowDataTransfer&quot;: true
    }
  }
}</code></pre><p>策略键是 <code>扩展 ID/工具 ID</code>，此处为 <code>org.example.cloud-text/hello</code>；RPC 工具名则是 <code>org_example_cloud_text_hello</code>，两者不能混用。工具清单本身也必须声明 cloud 执行器。调用输入 <code>{"name":"World"}</code> 后检查 <code>HELLO, WORLD</code>、<code>details.ok</code> 和 <code>details.artifact</code>；mock 路径的引用标记为 remote，但执行仍在本机，没有真实云服务。</p><p>移除该工具策略后，新进程恢复本地默认执行。未允许数据传输会失败；本地失败不会自动上传或转移云端。远端结果未知时保留恢复信息，不盲目重提交有副作用任务。这些适配接口和模拟测试不代表生产云服务已经上线。</p>

## 内容依据

- `sdk/README.md`
- `src/extension-host/runtime/resolver.ts`
- `src/extension-host/management/archive.ts`
- `src/extension-host/execution/contracts.ts`
- `src/extension-host/execution/policy.ts`
- `docs/runtime-declarative-launch.md`
- `docs/runtime-channel.md`
- `bin/tunmo-extension.mjs`
- `resources/runtime-builds.json`
- `scripts/build-node-runtime.mjs`
- `scripts/build-windows-helper.mjs`
- `src/extension-host/management/package-installations.ts`
- `examples/cloud-text/README.md`
- `examples/shared-node-a/extension.json`
