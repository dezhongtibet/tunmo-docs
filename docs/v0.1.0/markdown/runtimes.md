# Runtime 与执行生命周期

> 文档版本：v0.1.0

以内容身份共享完整环境，让每个会话绑定可追踪的运行版本。

## Runtime 是什么

<p>Runtime 是经过校验的解释器、库环境和入口集合。多个扩展可复用同一内容；不同环境摘要或不兼容版本分别保留，不通过合并 site-packages 实现共享。</p><p>binding: host 校验实际 Agent Node，binding: artifact 选择磁盘制品。匹配包含版本、系统、架构、ABI、最低系统版本、构建身份与摘要。</p>

## 会话快照与租约

<p>会话启动时锁定依赖并建立租约。升级后旧会话继续持有旧绑定；新会话选择新版本。垃圾回收复核安装、回滚与活跃租约，只有没有引用的资源才可删除。</p><p>停用可选模块的权限撤销独立于文件保留。保留旧 Runtime 不表示旧会话仍可执行已停用的模块。</p>

## 离线导入

<pre><code class="language-bash">node bin/tunmo-extension.mjs validate runtime /absolute/prepared/runtime
node bin/tunmo-extension.mjs import-runtime /absolute/prepared/runtime</code></pre><p>输入必须是已准备并封装摘要的 Runtime。管理入口不执行 npm/pip 安装脚本。大型目录导入限制为 16 GiB / 200,000 文件；v1 .tunmo 格式保持 512 MiB 解包、256 MiB 压缩上限，不能直接用于大型 GIS 环境。</p>

## 启动与清理

<p>Runtime 可通过 launch 声明固定参数、包内脚本和环境。仅拿到 entrypoints 的程序路径，不能替代包含 launch 的完整启动计划。</p><p>子进程调用有独立任务目录、监督器和执行租约。Unix 使用进程组，Windows 使用 Job Object。先结束进程树，再清理目录与释放占用；超时不等于清理已经结束。</p><p>JSONL Worker 协议与外部 Pi RPC 隔离。Worker 必须返回同一请求 ID 的状态、进度和恰好一个终态，第三方库诊断写 stderr。</p>

## 云端执行边界

<p>当前仅提供显式策略启用的 mock 后端，执行仍发生在本机。在 <code>execution-policy.json</code> 中按工具显式指定 <code>executor: cloud</code>、<code>backend: mock</code> 与 <code>allowDataTransfer</code>；本地失败不会自动上传或转移云端。</p><p>远端结果未知时保留恢复信息，不盲目重提交有副作用任务。这些适配接口和模拟测试不代表生产云服务已经上线。</p>

## 内容依据

- `sdk/README.md`
- `src/extension-host/runtime/resolver.ts`
- `src/extension-host/management/archive.ts`
- `src/extension-host/execution/contracts.ts`
- `src/extension-host/execution/policy.ts`
- `docs/runtime-declarative-launch.md`
- `docs/runtime-channel.md`
