# 安装与快速开始

从源码运行 Agent，并通过标准输入与输出建立一次会话。

## 准备环境

<p>要求 Node.js ≥ 22.19.0、pnpm ≥ 12.0.0。完整兼容性测试使用 Node 26 的网络权限能力。以下命令在已取得的 tunmo-agent 仓库根目录执行。</p><p><code>optional-extensions/</code> 固定到私有 <code>dezhongtibet/tunmo-plugins</code> 仓库中的指定提交；源码安装、可选模块 CLI 与完整构建需要该内容。先取得插件仓库读取权限并配置自己的 Git 认证，再运行：</p><pre><code class="language-bash">git submodule update --init --recursive
pnpm install --frozen-lockfile
pnpm check:deps</code></pre><p>按主仓库锁定提交检出，不用 <code>--remote</code> 无意升级插件。GitHub 源码 ZIP 不包含子模块文件；没有访问权限时，向维护者取得匹配版本的完整发行资源，不将公开主仓库视为开箱即用的完整安装包。项目 CI 使用单独的只读 <code>TUNMO_PLUGINS_READ_TOKEN</code>，普通 fork 的默认 token 无法读取该私有仓库。</p><p>Windows 源码环境还需运行 <code>node scripts/build-windows-helper.mjs</code> 生成进程监督器。预构建发行包应包含对应平台的监督器；不要混用不同架构的 Agent Node 与 Runtime。</p>

## 启动进程

<pre><code class="language-bash">pnpm start -- --session-id docs-demo-001 --cwd /absolute/path/to/project</code></pre><p>将示例路径替换为真实项目目录。会话 ID 只能包含字母、数字、点、下划线和连字符，首尾必须为字母或数字。每个客户端任务分配唯一 ID。</p><aside class="note"><strong>使用提示</strong><p>该入口运行 RPC 进程，不是终端聊天界面。启动器信任传入的项目目录；项目扩展会以当前用户权限执行，请使用可信工作区。</p></aside>

## 确认就绪并发送消息

<p>stdout 每行一个 JSON 对象，stderr 输出诊断。收到 <code>extension_ui_request</code>、<code>method: notify</code> 且消息包含 <code>tunmo-agent ready</code> 后，向 stdin 逐行写入：</p><pre><code class="language-json">{&quot;id&quot;:&quot;state-1&quot;,&quot;type&quot;:&quot;get_state&quot;}
{&quot;id&quot;:&quot;commands-1&quot;,&quot;type&quot;:&quot;get_commands&quot;}
{&quot;id&quot;:&quot;prompt-1&quot;,&quot;type&quot;:&quot;prompt&quot;,&quot;message&quot;:&quot;请介绍当前项目，并说明你可以使用的能力。&quot;}</code></pre><p>模型请求需要有效的模型与凭据配置。进程就绪只代表初始化完成，不代表提供商凭据已经可用。客户端应逐行处理返回和流式事件，不能把一次数据块当成完整 JSON。</p>

## 接下来做什么

<p>通过 <code>get_commands</code> 检查 <code>/goal</code>、<code>/tunmo-web-tools</code> 和 <code>skill:*</code> 命令。用 <a href="configuration.md">配置指南</a>了解数据目录，用 <a href="rpc.md">RPC 指南</a>处理消息与取消，用 <a href="modules.md">模块管理</a>启用 GIS。</p><p>关闭 stdin 会让 Pi 正常退出。<code>--offline</code> 会启用 <code>PI_OFFLINE=1</code>，阻止启动时获取缺失的 npm/git 资源；内置 Web Access 也会拒绝网络请求。这不是操作系统网络沙箱，也不会把云模型变成本地模型；离线工作仍需已经安装的资源及适用的模型。</p>

## 内容依据

- `README.md`
- `package.json`
- `.gitmodules`
- `.github/actions/checkout-plugins/action.yml`
- `src/launcher.ts`
- `scripts/build-windows-helper.mjs`
- `extensions/web-access/fetcher.ts`
