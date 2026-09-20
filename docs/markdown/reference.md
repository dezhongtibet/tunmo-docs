# 版本、范围与文档维护

以当前检出源码为准，区分已实现能力、发行配置和历史验证记录。

## 文档基线

<p>源码核对日期：2026-09-20。文档最初整理于 2026-09-17，本轮按当前 launcher、配置、CLI、SDK、扩展清单及使用契约更新主要入口和限制。package.json 标识为 <code>@tunmo/agent 0.0.0</code>（不可直接 npm 发布的开发包），锁定 Pi 0.84.1 和 pi-goal 0.54.4；QGIS 扩展为 0.4.1，GeoPandas 为 0.2.0。</p><p>这次核对不等于重新完成所有业务测试、联网验证、Runtime 下载或跨平台 GIS 验收。带日期的发行和验收记录只证明各自当时注明的范围；开发版本号不构成稳定发行承诺。</p>

## 已知范围

<ul><li>QGIS 和 GeoPandas 均已在默认模块清单登记，默认关闭，Runtime 分别安装、启用和管理。</li><li>可选扩展来自私有 tunmo-plugins Git 子模块；源码构建需要读取权限，或由维护者提供匹配的完整发行包。</li><li>Runtime 是否可安装以实际签名 Catalog 与 plan 为准；文档不承诺覆盖所有 macOS、Windows、Linux 系统。</li><li>Agent 接口已实现不等于具体桌面客户端已经提供相应 UI / IPC。</li><li>云端执行目前只有显式启用的本机 mock 后端。</li><li>扩展和任务 Python 以当前用户权限执行；模块确认、路径校验与进程监督不是操作系统沙箱。</li></ul>

## 源码与历史记录

<p>各页末尾列出相对于 Agent 仓库根目录的内容依据。使用完整源码 checkout 阅读；以 <code>optional-extensions/</code> 开头的来源还需要对应私有子模块的读取权限。本站的工具与安装说明已经独立整理，不要求读者获得开发者本机目录或交接记录。</p><p>仓库发布 <code>docs/</code> 根目录的 8 篇核心技术文档和本站内容。设计方案、来源审计、运行包记录、历史交接与原始验证证据保留在维护者本地分类目录，由 <code>.gitignore</code> 排除，不随本次文档发布提供。历史结论不能代替当前清单和源码。</p>

## 更新文档

<p>所有站点文件都位于 docs/public，可直接打开 index.html 或通过任意静态 HTTP 服务浏览，无外部字体、CDN 或运行时依赖。</p><p>content.json 是文档内容源。修改后运行：</p><pre><code class="language-bash">node docs/public/build.mjs</code></pre><p>生成独立 HTML 页面、全文搜索索引和 Markdown 副本。assets/styles.css 与 assets/app.js 维护样式和交互。维护说明见同目录 README.md。涉及工具、配置或平台变化时同步核对对应源码，避免只沿用旧交接记录。</p>

## 内容依据

- `package.json`
- `resources/optional-modules.json`
- `.gitmodules`
- `.github/actions/checkout-plugins/action.yml`
- `optional-extensions/qgis/extension.json`
- `optional-extensions/geopandas/extension.json`
