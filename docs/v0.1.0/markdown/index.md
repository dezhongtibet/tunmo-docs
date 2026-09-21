# 欢迎使用 Tunmo Agent

> 文档版本：v0.1.0

连接模型、工具与地理空间工作流。了解图墨 Agent 的能力，从第一次会话开始。

## 认识 Tunmo Agent

<p>Tunmo Agent 是基于 Pi 的 Node.js / TypeScript Agent 进程，为客户端提供原生 JSONL RPC、工具扩展和受管运行环境。客户端负责交互与任务调度，Agent 负责会话、工具执行和资源生命周期。</p><p>你可以让 Agent 检索资料、读取网页、围绕目标持续推进任务，也可以按需安装 GIS 模块，处理项目中的地理空间数据。</p>

## 从这里开始

<div class="cards"><a href="quickstart.md"><span>01 / GET STARTED</span><h3>启动第一个会话 ↗</h3><p>准备环境、启动进程，发送第一条消息。</p></a><a href="web-access.md"><span>02 / CAPABILITIES</span><h3>探索内置能力 ↗</h3><p>联网检索、目标模式与可复用 Skills。</p></a><a href="modules.md"><span>03 / GEOSPATIAL</span><h3>启用 GIS 模块 ↗</h3><p>了解确认安装、工具能力与数据输出。</p></a><a href="rpc.md"><span>04 / DEVELOPERS</span><h3>接入你的客户端 ↗</h3><p>使用原生 RPC 和独立管理接口。</p></a></div>

## 能力与可用范围

<ul><li><strong>基础会话：</strong>一个任务对应一个 Agent 进程，使用 Pi 原生消息和工具事件。</li><li><strong>内置能力：</strong>Web Search、Web Read、Goal Mode，以及 tunmo-agent / skill-creator Skills。</li><li><strong>可选能力：</strong>QGIS 工具和 GeoPandas 工具具有独立源码与 Runtime；是否可安装还取决于当前发行配置和平台。</li><li><strong>扩展开发：</strong>清单驱动注册、共享 Runtime、产物保存和执行控制。</li></ul><aside class="note"><strong>使用提示</strong><p>默认模块清单已登记 QGIS 和 GeoPandas；两者默认关闭，按模块分别确认安装并启用。详细边界见「GeoPandas」和「版本与范围」。云端执行目前只有显式启用的本机模拟后端。</p></aside><p>从源码使用可选模块需要取得私有 <code>tunmo-plugins</code> 仓库的读取权限，或由维护者提供与 Agent 版本匹配的完整发行包。公开文档与主仓库源码不等于全部可选资源已经公开；准备步骤见<a href="quickstart.md">快速开始</a>。</p>

## 按你的角色阅读

<p><strong>使用者：</strong>先读快速开始，再了解联网、Goal 与 GIS 的输入输出。本文介绍 Agent 能力，不假设客户端已经提供对应按钮。</p><p><strong>客户端开发者：</strong>重点阅读会话与 RPC、配置、模块管理和故障排查。模块安装确认和新会话创建由客户端承接。</p><p><strong>扩展开发者：</strong>从扩展与 SDK、共享 Runtime 开始，使用仓库中的完整示例。</p>

## 内容依据

- `README.md`
- `package.json`
- `resources/optional-modules.json`
- `docs/architecture.md`
