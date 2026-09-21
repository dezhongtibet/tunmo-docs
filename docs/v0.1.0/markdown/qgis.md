# QGIS 空间处理

> 文档版本：v0.1.0

使用受管 PyQGIS Worker 检查数据、执行空间分析并输出可追踪的结果文件。

## 开始前

<p>QGIS 默认不安装、不启用。按<a href="modules.md">模块管理流程</a>确认并启用 Runtime 后，创建新 Agent 会话。环境按平台独立分发，不回退系统 QGIS、Conda 或其他架构的 Python。</p><p>当前 QGIS 扩展 0.4.1 提供 11 个 <code>gis_*</code> 工具和 5 个兼容别名，每次调用启动一个受监督的 Worker，完成后退出。可使用 qgis-runtime 配套 Skill 辅助工具选择。</p>

## 数据与算法发现

<dl><dt>gis_runtime_status</dt><dd>查询当前绑定 Python、PyQGIS 和 Providers；无法替代未安装模块的管理 status。</dd><dt>gis_inspect_dataset</dt><dd>使用 input 检查类型、CRS、字段、要素数或栅格尺寸。</dd><dt>gis_list_algorithms</dt><dd>可按 provider 查询注册算法，并区分能否受控执行。</dd><dt>gis_describe_algorithm</dt><dd>使用 algorithm_id 获取参数和输出定义。</dd></dl>

## 空间分析工具

<dl><dt>gis_buffer</dt><dd>input、distance；可选 segments、dissolve、output。距离使用输入 CRS 单位。</dd><dt>gis_clip</dt><dd>input 与 overlay 裁剪图层，可选 output。</dd><dt>gis_reproject</dt><dd>input 与 target_crs 转换坐标系，可选 output。</dd><dt>gis_merge_layers</dt><dd>inputs 数组，按需指定 target_crs 和 output。</dd><dt>gis_calculate_area</dt><dd>面 input，按需指定 field_name 与 output。WGS84 椭球面积，平方米，默认字段 area_m2。</dd><dt>gis_run_algorithm</dt><dd>algorithm_id、受控 inputs，以及可选 outputs.OUTPUT 文件名。</dd></dl><aside class="note"><strong>使用提示</strong><p><code>gis_run_algorithm</code> 当前仅允许 native:buffer、native:clip、native:reprojectlayer、native:mergevectorlayers。列出算法不代表该受控工具允许执行；任务 Python 可调用 Runtime 中实际存在的其他算法，需自行核对参数与结果。</p></aside><p>从 0.4.1 起，缓冲、裁剪、重投影、合并、面积计算及对应受控入口在创建产物前校验每个输入图层的源 CRS，无效时返回 <code>SourceCrsInvalid</code>。数据检查仍可读取无 CRS 图层；有效的自定义 CRS 不要求必须有 EPSG 编号。任务脚本需自行验证 CRS 与运算结果。</p>

## 示例：创建缓冲区

<p>先将输入文件放在当前项目 workspace 内，检查 CRS。若需要按米计算，应先转换到适合该地区的米制投影坐标系。随后可让 Agent：</p><blockquote>检查 roads.gpkg 的坐标系，在确认距离单位为米后生成 100 米缓冲区，保存为 roads-buffer.gpkg，并报告结果路径。</blockquote><p>工具参数示例：</p><pre><code class="language-json">{&quot;input&quot;:&quot;roads.gpkg&quot;,&quot;distance&quot;:100,&quot;output&quot;:&quot;roads-buffer.gpkg&quot;}</code></pre><p>该示例假设输入已经使用适当米制投影。对地理坐标系直接使用 100 不等于 100 米。</p>

## 文件与结果边界

<p>数据检查、固定空间工具与 <code>gis_run_algorithm</code> 的输入必须位于当前 workspace，可检查 GeoJSON、GeoPackage、Shapefile、GeoTIFF；具体算法还要求对应的图层类型。这些受控入口拒绝外部路径、URL、数据库 URI、VRT、SQL、脚本和任意表达式。任务 Python 的执行边界见下一节。</p><p>输出支持普通 GeoJSON / GeoPackage 文件名，写入 <code>.tunmo-gis/&lt;executionId&gt;/</code>，不覆盖已有用户文件。≤16 MiB 结果另提供 Artifact 引用，更大文件保留 workspace 相对路径。只有成功终态才能作为完成结果，强制停止可能留下部分文件。</p><p>五个旧名称 qgis_process_status/list/help/run 和 qgis_native_buffer 保留为兼容别名，但使用新的 Worker 参数和结果边界。</p>

## 在当前会话执行任务脚本

<p><code>gis_execute_python</code> 接受 workspace 内 UTF-8 <code>.py</code> 的 <code>script</code> 路径和可选 JSON 对象 <code>params</code>。脚本定义 <code>run(context, params)</code>，使用当前绑定 Runtime 中已有的 PyQGIS、GDAL 或 Processing；每次调用读取新的脚本快照，修改后可在当前会话再次执行。</p><p><code>context</code> 提供 workspace、输入路径检查、独立输出目录、进度与取消；脚本返回 JSON 对象，并在 <code>outputs</code> 中声明本次目录里的 GeoJSON / GeoPackage 产物。脚本上限 256 KiB，参数上限 64 KiB，最长执行 15 分钟。</p><p>普通 Python 以当前用户权限运行；context 的路径校验不构成整个解释器的文件或网络沙箱。仅执行获授权的任务，保持共享 Runtime 只读。旧版插件需先通过模块管理更新并加载新版工具一次，之后修改任务脚本无需重新安装扩展或重开会话。</p>

## 内容依据

- `docs/optional-module-management.md`
- `optional-extensions/qgis/extension.json`
- `optional-extensions/qgis/tools.mjs`
- `optional-extensions/qgis/README.md`
- `optional-extensions/qgis/skills/qgis-runtime/references/extend-runtime.md`
