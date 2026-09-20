# GeoPandas 矢量分析

独立的矢量数据处理扩展，提供空间连接、文件转换、受控脚本与当前会话任务 Python。

## 当前可用范围

<aside class="note"><strong>使用提示</strong><p>默认模块清单已登记 <code>geopandas</code> 及其可信 Catalog。GeoPandas 默认关闭，按<a href="modules.md">模块管理流程</a>生成计划、确认安装并启用后，创建新 Agent 会话加载工具。</p></aside><p>当前扩展为 0.2.0。平台可安装性由当前签名 Catalog、Agent Node 架构、系统版本与 <code>plan</code> 确认。历史平台验收属于相应发行记录，本次源码核对没有重新下载 Runtime 或执行跨平台 GIS 验收。</p>

## 九个工具

<dl><dt>geopandas_runtime_status</dt><dd>查询包内 CPython、GeoPandas、GDAL、GEOS、PROJ 等版本。</dd><dt>geopandas_inspect_dataset</dt><dd>source、可选 layer，检查矢量数据、CRS、字段与范围。</dd><dt>geopandas_read_file</dt><dd>source、可选 layer / max_rows（0–100），返回有界预览。</dd><dt>geopandas_buffer</dt><dd>input、distance，可选 layer / dissolve / output；要求投影 CRS，拒绝经纬度距离。</dd><dt>geopandas_reproject</dt><dd>input、target_crs，可选 layer / output。</dd><dt>geopandas_spatial_join</dt><dd>input、overlay，同 CRS；how 为 left/right/inner，可指定 op 与 output。</dd><dt>geopandas_write_file</dt><dd>input、output，可选 layer，输出 GeoJSON 或 GeoPackage。</dd><dt>geopandas_run_script</dt><dd>code，可选 input / output，组合受控数据操作。</dd><dt>geopandas_execute_python</dt><dd>script 与可选 params，在已绑定 Runtime 中执行当前 workspace 的任务 Python。</dd></dl>

## 受控脚本

<p>支持赋值、JSON 常量与列表/字典，以及 read、write、summarize、len、buffer、reproject、spatial_join、head。数据框仅开放 to_crs、head、copy。</p><pre><code class="language-python">gdf = read(&quot;projected-points.gpkg&quot;)
gdf = buffer(gdf, 100)
write(gdf, &quot;buffer.gpkg&quot;)
result = summarize(gdf)</code></pre><p>示例输入需具有适当的投影 CRS。代码传给 geopandas_run_script 的 code 参数，不在系统 Python 中运行。</p><aside class="note"><strong>使用提示</strong><p>这是明确的 Python 语法子集，不是完整 Python 沙箱。不支持 import、循环、任意属性、网络 API、pip 或通用 Python 函数。先校验整个 AST，再解释执行，不调用 eval/exec。</p></aside>

## 运行与结果

<p>GeoPandas 使用自己的独立 Runtime，不依赖 QGIS，不在工具调用时安装依赖。每次调用启动受 Host 监督的 Worker，不继承模型 API Key。</p><p>固定工具及 <code>geopandas_run_script</code> 校验输入位于可信 workspace；任务 Python 使用 context 进行受校验的数据读写。结果写入 <code>.tunmo-geopandas/&lt;executionId&gt;/</code>。普通文件名输出 GeoJSON / GeoPackage，≤16 MiB 文件另提供持久产物引用。模块启停、取消与会话重建遵循统一模块管理流程。</p>

## 在当前会话执行任务脚本

<p>固定工具和受控脚本无法表达需求时，在 workspace 创建 UTF-8 <code>.py</code>，定义 <code>run(context, params)</code>，通过 <code>geopandas_execute_python</code> 传入 <code>script</code> 路径和可选 <code>params</code>。可使用 Runtime 已有的 GeoPandas、Shapely、pandas 等库完成融合、叠加和字段计算。</p><p><code>context.read</code>、<code>context.write</code>、<code>context.summarize</code> 和 <code>context.progress</code> 提供输入检查、GeoJSON / GeoPackage 产物登记、摘要及进度。返回普通 JSON 对象，每次调用读取新的代码快照；脚本上限 256 KiB、参数上限 64 KiB，最长执行 15 分钟。</p><p>普通 Python 具有当前用户权限，context 校验不是整个解释器的安全沙箱。仅执行获授权的任务，不修改共享 Runtime。已有 0.1.x 安装需更新并加载 0.2.0 一次；之后修改脚本无需重开会话，原 <code>geopandas_run_script</code> 白名单保持不变。</p>

## 内容依据

- `docs/optional-module-management.md`
- `resources/optional-modules.json`
- `optional-extensions/geopandas/extension.json`
- `optional-extensions/geopandas/tools.mjs`
- `optional-extensions/geopandas/README.md`
- `optional-extensions/geopandas/skills/geopandas-runtime/references/extend-runtime.md`
