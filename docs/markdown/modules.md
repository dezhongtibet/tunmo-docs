# 可选模块管理

先查看计划并确认，再安装完整运行环境；安装与日常工具调用分开进行。

## 查看当前模块

<pre><code class="language-bash">node bin/tunmo-module.mjs list
node bin/tunmo-module.mjs status qgis
node bin/tunmo-module.mjs status geopandas</code></pre><p>list 与 status 读取本地状态，不联网刷新 Catalog。当前默认模块清单登记 <code>qgis</code> 和 <code>geopandas</code>，分别使用独立的可信 Catalog 和 Runtime。模块已登记不代表已经安装或启用。</p><p>从源码运行前须初始化有读取权限的私有插件子模块；模块 CLI 加载默认清单时会读取两份扩展清单，只有空子模块目录时无法完成该流程。</p>

## 首次启用 QGIS

<pre><code class="language-bash">node bin/tunmo-module.mjs plan qgis
# 展示计划并取得用户确认，将 PLAN_ID 替换为返回的 planId
node bin/tunmo-module.mjs enable qgis --confirm PLAN_ID --events
node bin/tunmo-module.mjs check qgis</code></pre><p>plan 校验可信 Catalog 并匹配实际 Node 的系统、架构和版本要求，只获取元数据，不下载 Runtime。客户端展示版本、下载量与峰值空间，并把确认的 planId 原样传回。</p><p>计划有效一小时。已保存计划、扩展源码或实际平台变化，以及计划过期后，必须重新 plan 并确认；远端 Catalog 发布新版不会自动替换已确认计划中的目标。安装成功后创建新 Agent 进程加载工具。</p><p>启用 GeoPandas 时，将上述命令中的 <code>qgis</code> 换为 <code>geopandas</code>；其平台支持和安装计划单独匹配。</p>

## 日常生命周期

<p>以下为独立管理操作，按当前需求选择一个执行：</p><dl><dt><code>node bin/tunmo-module.mjs disable qgis</code></dt><dd>停用模块并请求结束其 Worker，保留 Runtime。</dd><dt><code>node bin/tunmo-module.mjs enable qgis</code></dt><dd>重新启用已安装、内容未变的模块，复核后复用本地 Runtime。</dd><dt><code>node bin/tunmo-module.mjs check qgis</code></dt><dd>检查已安装 Runtime 的内容和健康状态。</dd><dt><code>node bin/tunmo-module.mjs cancel qgis</code></dt><dd>请求取消正在进行的管理操作，再等待原命令退出并查询状态。</dd><dt><code>node bin/tunmo-module.mjs rollback qgis</code></dt><dd>切换到上一成功绑定；必须存在可用的 previous 版本。</dd><dt><code>node bin/tunmo-module.mjs uninstall qgis</code></dt><dd>卸载模块并尝试回收相关制品。工作区、会话、持久产物和下载缓存保留，共享或被租约占用的 Runtime 不会立即回收。</dd></dl><p>更新前先单独获取计划：</p><pre><code class="language-bash">node bin/tunmo-module.mjs plan qgis</code></pre><p>展示计划并取得确认后，将 PLAN_ID 替换为刚确认的 planId，再执行：</p><pre><code class="language-bash">node bin/tunmo-module.mjs update qgis --confirm PLAN_ID --events</code></pre><p>修复时也须先生成并确认计划，然后以 <code>repair</code> 替换上述 <code>update</code>。更新和修复保留原启停状态；失败后查询实际状态，不只凭客户端超时判断是否提交。安装、更新、回滚或重新启用后，创建新 Agent 会话加载相应版本。</p>

## 进度与状态

<p>管理 CLI 业务操作成功时 stdout 返回一个 JSON 对象；<code>help</code> 返回帮助文本。加 <code>--events</code> 后 stderr 发送 <code>module-progress</code> JSONL；失败返回非零退出码及 <code>module-error</code>。</p><p>当前进度阶段包括 planning、downloading、verifying、extracting、installing、checking，最终为 completed、failed 或 cancelled。更新和修复沿用这些阶段；通过 status 返回的 operation.action 区分管理动作。缓存复用可能跳过下载。以最终结果和后续 status 为准，不将客户端超时等同于安装失败。</p><dl><dt>enabled 与 available</dt><dd>前者表示启用策略，后者表示资源可用性；二者独立。</dd><dt>health</dt><dd>最近一次检查结果，不代表每次 status 都完整扫描文件。</dd><dt>updateAvailable</dt><dd>比较最近保存的 plan，不代表后台自动联网检查。</dd><dt>restartSession</dt><dd>为 true 时创建新 Agent 会话；reload 不重建受管快照。</dd></dl>

## 停用与取消

<p>停用会撤销旧快照的执行权限并停止模块 Worker，但停止请求不等于进程已经退出。若返回 <code>workersStopped: false</code> 或 <code>state: stopping</code>，继续查询状态。重新启用后需新建会话，旧快照不会恢复执行权限。</p>

## 内容依据

- `bin/tunmo-module.mjs`
- `resources/optional-modules.json`
- `src/extension-host/modules/metadata.ts`
- `src/extension-host/modules/service.ts`
- `src/extension-host/modules/plans.ts`
- `src/extension-host/modules/status.ts`
- `docs/optional-module-management.md`
