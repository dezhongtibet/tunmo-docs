# 网页交互自动化

打开网页、获取交互快照、点击、填写与截图，并了解首次浏览器准备和已有 CDP 浏览器接入。

## 浏览器工具与网页读取

<p>浏览器工具由项目本地 <code>pi-agent-browser-native</code> 与 <code>agent-browser</code> 提供。Agent 启动时从当前依赖目录加载 Pi 原生扩展及命令，无需全局安装。<code>agent_browser</code> 可打开页面、获取交互快照、点击、填写表单和截图；<code>agent_browser_code</code> 处理循环或分支，<code>agent_browser_tools</code> 列出并启用专门工具。</p><pre><code class="language-json">{"args":["open","https://example.com"]}
{"args":["snapshot","-i"]}</code></pre><p>这些是工具参数示例；通过普通 prompt 交给模型使用，不直接写入 RPC stdin。<a href="web-access.md">web_read</a> 只提取网页文本，不运行 JavaScript 或进行页面交互。</p>

## 首次使用本机浏览器

<p>首次调用需要本机浏览器的工具时，Agent 先检查 Chrome。若未找到且会话允许联网，会自动下载 Chrome for Testing，完成后重新检查；已有 Chrome 时直接继续。多个会话会等待同一次安装。客户端可从 Pi 原生 <code>extension_ui_request</code> 的 <code>setStatus</code> / <code>notify</code> 事件展示检查、下载、等待、完成及失败状态；下载期间显示已等待时间，上游命令没有可靠的字节进度百分比。</p><p><code>--offline</code> 会阻止自动下载，缺少 Chrome 时工具返回说明性错误；它不是浏览器页面访问的系统级网络隔离。Linux ARM64 没有对应 Chrome for Testing 安装包，需预先安装系统 Chromium。下载失败时检查网络和磁盘空间，再重新调用工具。</p>

## 连接已有浏览器

<p>若客户端已经创建可通过 Chrome DevTools Protocol（CDP）访问的浏览器，可为 Agent 进程设置 <code>AGENT_BROWSER_CDP</code>，或调用 <code>agent_browser</code> 的 <code>connect &lt;port&gt;</code> / <code>--cdp &lt;port&gt;</code>。连接后沿用该浏览器会话，跳过本机 Chrome 安装检查。客户端负责开启 CDP、限制端点访问并管理自己创建的浏览器；CDP 提供完整浏览器控制权，只应暴露给可信进程。</p><p>没有已有连接时，<code>agent-browser</code> 默认启动独立的无界面（headless）受管浏览器，不会操作用户已打开的普通浏览器窗口。要观察新窗口，可在首次启动前设置 <code>AGENT_BROWSER_HEADED=1</code>，或在首次工具调用中使用 <code>--headed</code> 和 <code>sessionMode: fresh</code>；已有无界面会话不会自动变成可见窗口。Agent 提供工具能力，不表示具体客户端已提供浏览器画面或按钮。</p>

## 前端如何接入

<p>前端使用已有的 Pi JSONL RPC，无需添加 <code>tunmo.*</code> 浏览器命令。每个任务启动独立 Agent 进程，等待 <code>extension_ui_request / notify</code> 中的 <code>tunmo-agent ready</code>，再发送普通 <code>prompt</code>：</p><pre><code class="language-json">{"id":"browser-task-1","type":"prompt","message":"使用浏览器打开 https://example.com，获取交互快照"}</code></pre><p>前端按行读取 <code>tool_execution_start</code>、<code>tool_execution_update</code>、<code>tool_execution_end</code> 和 <code>agent_end</code>，通过 <code>toolName</code> 识别浏览器工具，并从结果读取文本、图片或产物。<code>extension_ui_request</code> 中的 <code>setStatus</code>（<code>statusKey: tunmo.browser.setup</code>）用于显示或清除准备进度，<code>notify</code> 用于显示完成和错误通知；stderr 只作诊断。</p><p>若前端创建专用浏览器窗口，先启用它的 CDP 端点，再在启动 Agent 时设置 <code>AGENT_BROWSER_CDP</code>。窗口的显示和生命周期由前端负责。当前 RPC 只支持 Agent 在处理 prompt 时调用工具，前端不能直接发送 <code>type: agent_browser</code> 命令。需要确定性的地址栏、按钮或实时画面时，前端应直接控制自己的窗口并提供 UI。</p>

## 搜索凭据与验证范围

<p>打开、快照、点击、填写及截图不要求 Exa 或 Brave Search API Key。扩展附带的 <code>agent_browser_web_search</code> 是单独的可选工具，仅在配置对应凭据后启用；Tunmo 的 <code>web_search</code> 仍按 <a href="web-access.md">Web Access</a> 配置运行。</p><p><code>pnpm test:offline</code> 覆盖本地扩展注册、命令调用和安装准备流程，使用受控夹具，不证明真实网站、真实 Chrome 下载或特定客户端 CDP 接入。2026-09-28 完整离线回归已在 macOS ARM64 与 Windows ARM64 的 Node 24.0.0、24.21.0、25.9.0、26.10.0 上通过；未测试的未来 Node 版本仍需逐版验证。</p>

## 内容依据

- `package.json`
- `src/browser-extension.mjs`
- `src/browser-integration.ts`
- `src/browser-setup.ts`
- `src/launcher.ts`
- `test/rpc/browser-native.integration.test.mjs`
- `test/rpc/browser-setup.test.ts`
- `docs/browser-automation.md`
