# Tunmo Agent 文档

Tunmo Agent 的公开文档站点，介绍快速开始、配置、原生 Pi RPC、扩展与 Runtime、QGIS / GeoPandas 可选模块，以及 Web Access、Goal 和 Skill 的使用方式。

[在线文档](https://dezhongtibet.github.io/tunmo-docs/) · [快速开始](https://dezhongtibet.github.io/tunmo-docs/quickstart.html) · [Markdown 阅读版](docs/markdown/index.md)

本仓库保存已生成的静态页面，通过 GitHub Pages 发布。文档内容源和生成器在 `tunmo-agent` 仓库维护，更新后由工作流同步到本仓库的 `docs/` 目录。

## 阅读入口

- [快速开始](https://dezhongtibet.github.io/tunmo-docs/quickstart.html)：环境准备、安装与启动。
- [配置说明](https://dezhongtibet.github.io/tunmo-docs/configuration.html)与 [RPC 接入](https://dezhongtibet.github.io/tunmo-docs/rpc.html)：运行配置、会话和客户端接入。
- [可选模块](https://dezhongtibet.github.io/tunmo-docs/modules.html)与 [Runtime](https://dezhongtibet.github.io/tunmo-docs/runtimes.html)：安装确认、运行环境和生命周期管理。
- [QGIS](https://dezhongtibet.github.io/tunmo-docs/qgis.html)与 [GeoPandas](https://dezhongtibet.github.io/tunmo-docs/geopandas.html)：地理空间工具与任务脚本。
- [扩展](https://dezhongtibet.github.io/tunmo-docs/extensions.html)、[Web Access](https://dezhongtibet.github.io/tunmo-docs/web-access.html)、[Goal](https://dezhongtibet.github.io/tunmo-docs/goals.html) 和 [Skill](https://dezhongtibet.github.io/tunmo-docs/skills.html)：能力使用与边界。
- [故障排查](https://dezhongtibet.github.io/tunmo-docs/troubleshooting.html)与 [版本和范围](https://dezhongtibet.github.io/tunmo-docs/reference.html)：常见问题、适用范围及文档维护说明。

页面支持本地全文搜索、深浅色切换和代码复制，也提供 Markdown 阅读副本。

## 本地浏览

克隆后可以直接打开 `docs/index.html`，也可以使用 Python 3 启动本地静态服务：

```bash
git clone https://github.com/dezhongtibet/tunmo-docs.git
cd tunmo-docs
python3 -m http.server 4173 --directory docs --bind 127.0.0.1
```

在浏览器访问 <http://127.0.0.1:4173/>。浏览本站无需安装 Node.js、pnpm、Agent 或 GIS Runtime。

## 仓库结构

```text
tunmo-docs/
├── README.md          # 仓库说明，独立维护
└── docs/              # GitHub Pages 发布目录，由源仓库自动同步
    ├── .nojekyll      # 按静态文件发布
    ├── index.html     # 文档首页
    ├── *.html         # 功能文档页面
    ├── assets/        # 样式、交互脚本、搜索索引与品牌图片
    └── markdown/      # 各页面的 Markdown 阅读副本
```

## 更新与发布

文档的唯一内容源位于 [tunmo-agent](https://github.com/dezhongtibet/tunmo-agent) 仓库。该仓库目前为私有，维护者需要相应访问权限。

1. 在 `tunmo-agent` 修改 `docs/public/content.json`；样式与交互修改位于 `docs/public/assets/`，生成逻辑位于 `docs/public/build.mjs`。
2. 在 Agent 仓库根目录运行 `node docs/public/build.mjs`，生成页面、Markdown 副本和搜索索引，完成本地检查。
3. 将变更提交到 `dev-pr`，通过 PR 合并到 `main`。
4. `Publish documentation` 工作流在发布相关路径变化后运行，将生成文件同步到本仓库的 `main` 分支 `docs/` 目录。
5. GitHub Pages 从 `main /docs` 构建并发布网站。

发布工作流位于 Agent 仓库的 `.github/workflows/publish-docs.yml`，也支持从 Actions 页面选择 `main` 手动运行。工作流只同步站点文件，保留本仓库根目录的 README。

`docs/` 是生成目录，直接在这里修改的内容会被下一次同步覆盖。维护页面时应修改源仓库；新增静态资源时，也要同步调整发布工作流中的资源复制清单。

## 发布状态与排查

- **页面未更新**：先检查 Agent 仓库的 `Publish documentation` 是否成功，再检查本仓库的 [Pages 部署记录](https://github.com/dezhongtibet/tunmo-docs/actions)。同步和站点部署是两个独立步骤。
- **同步失败**：在源仓库核查 `DOCS_PUBLISH_TOKEN` 的有效期、目标仓库写入权限、组织审批及 Actions 预算。失败的同步不会把新内容发布到本仓库。
- **网站返回 404**：确认 Pages 发布源为 `main` 分支的 `/docs`，且存在 `docs/index.html`，并检查最近一次部署结果。
- **图片或样式缺失**：检查资源是否已被发布工作流复制到 `docs/assets/`，页面引用是否使用正确的相对路径。

文档反映其标注版本和源码核对范围。平台支持、模块可用性和实际行为以对应发行版本为准，历史验证记录不代表所有环境都已验证。
