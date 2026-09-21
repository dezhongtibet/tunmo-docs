# 配置与数据目录

> 文档版本：v0.1.0

理解模型配置、用户资源和运行数据分别保存在哪里。

## 配置文件

<p>Agent 固定使用当前用户主目录下的 <code>~/.tunmo/agent</code>，Windows 使用对应的用户主目录。</p><dl><dt>settings.json</dt><dd>Pi 设置、资源发现配置，以及 <code>tunmo.webAccess</code> 搜索配置。</dd><dt>auth.json</dt><dd>模型提供商凭据，遵循当前 Pi 版本支持的结构。</dd><dt>models.json</dt><dd>自定义模型定义，遵循当前 Pi 版本支持的结构。</dd></dl><p>首次启动会创建最小合法配置。配置初始化不会自动提供模型凭据；通过客户端的模型配置流程或匹配版本的 Pi 配置设置模型后再发送请求。</p>

## 配置损坏时的行为

<p>启动前先加锁检查 JSON 和 schema。损坏文件会重命名为 <code>&lt;name&gt;.bak.&lt;timestamp&gt;.&lt;pid&gt;</code>，随后写入最小合法配置。原内容保留，可人工检查并恢复有效字段。</p><p>配置预检按目录 0700、文件 0600 设置权限；Windows 的实际访问控制还取决于文件系统 ACL。配置修复通知在 Pi 就绪后通过原生通知送达客户端。</p>

## 用户资源与运行数据

<pre><code class="language-text">~/.tunmo/agent/
├── settings.json / auth.json / models.json
├── sessions/                 # 会话
├── skills/                   # 用户 Skills
├── packages/extensions/      # 已安装扩展
├── runtime-store/            # 共享 Runtime
├── runtime-downloads/        # 下载与续传缓存
├── optional-modules/         # 安装计划、操作与健康状态
├── execution-policy.json     # 可选的执行策略
├── verification-cache/       # 内容校验缓存
├── extension-state/          # 索引、事务、租约
└── execution-artifacts/      # 持久产物</code></pre><p>项目工作区、只读安装目录和用户数据分开管理。不要直接修改共享索引或删除租约；使用管理 CLI 完成启停、卸载和回收。</p>

## 客户端集成约定

<aside class="note"><strong>使用提示</strong><p>管理 CLI 支持 <code>--agent-dir</code>，但当前 Agent 会话启动器没有对应的可配置目录参数。仅把管理 CLI 指向 Electron userData 不会改变 Agent 的数据位置。管理 CLI 与 Agent 必须指向同一用户的数据目录、相符发行资源和同一组安装状态。</p></aside><p>有效的 extensions、skills、prompts、themes 和 packages 配置继续交给 Pi 自动发现。切换模型的落盘语义沿用 Pi；多进程同时修改默认模型时，最后一次写入生效。</p>

## 内容依据

- `src/config-preflight.ts`
- `src/config-validation.ts`
- `src/launcher.ts`
- `src/extension-host/management/store.ts`
- `src/extension-host/execution/policy.ts`
