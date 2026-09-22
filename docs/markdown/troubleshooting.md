# 故障排查

先确认失败发生在哪个入口，再检查配置、资源与会话状态。

## 启动失败或没有就绪通知

<ol><li>确认 Node 和 pnpm 版本，以及 --session-id / --cwd 是否有效。</li><li>读取 stderr；不要将诊断混入 stdout JSONL 解析。</li><li>检查依赖、发行资源以及私有子模块读取权限；完整源码 checkout 需初始化锁定的 optional-extensions，再执行 pnpm check:deps。</li><li>若配置被修复，检查 .bak 备份并恢复有效字段。</li></ol><p>内置文件摘要不匹配时恢复相符发行内容。只有正在开发并明确需要重封装内置内容时，才使用项目的 seal-release 流程；不要把重新签认作为跳过校验的通用修复。</p>

## 进程就绪但模型没有响应

<p>先用 get_state 确认状态，再检查模型、提供商凭据和网络。默认配置不会自动提供模型访问权限。查看原生错误事件，不将 ready 当成认证成功。</p>

## GIS 工具未出现

<ol><li>运行 tunmo-module list，确认当前发行登记了该模块。</li><li>查询 status，分别检查 enabled、available、health。</li><li>完成 plan → 确认 → enable。</li><li>创建新 Agent 进程；重新启用和更新不能只依赖 reload。</li></ol><p>当前默认清单同时登记 QGIS 和 GeoPandas。若 list 缺少某个模块，核对实际使用的 Agent 发行配置与子模块版本；两者独立安装，安装 QGIS 不会启用 GeoPandas。</p><p>只更新主仓库子模块指针不会改写已经安装的插件版本。缺少 <code>gis_execute_python</code> 或 <code>geopandas_execute_python</code> 时，检查当前安装版本，完成确认更新，再创建新会话。</p>

## 平台、计划或内容错误

<dl><dt>RuntimeIncompatible</dt><dd>检查管理 Node 与 Agent Node 的实际架构、系统版本和 Catalog 匹配范围。没有兼容包就不能安装。</dd><dt>ConfirmationRequired</dt><dd>先获取计划并确认其 planId。</dd><dt>InstallationPlanExpired</dt><dd>计划过期或内容变化，重新 plan 并确认。</dd><dt>pending-dependencies</dt><dd>扩展已发现但运行依赖未完整就绪，先补齐已验证制品。</dd><dt>SourceCrsInvalid</dt><dd>先通过数据来源确认并修复源 CRS，再执行 QGIS 空间运算；不要用目标 CRS 猜测输入坐标系。</dd><dt>ExecutorUnavailable</dt><dd>检查当前平台所需监督器与发行资源；Windows 开发构建需要相应 helper。</dd></dl>

## 结果文件或磁盘空间问题

<p>从成功工具结果中的 workspacePath / Artifact 引用定位文件。被取消任务的输出可能不完整。卸载不会删除用户数据或下载缓存，仍被会话引用的环境会保留；先正常结束会话，再通过管理入口回收。</p><p>更新状态未刷新时先 plan；status 本身不联网。资源怀疑损坏时运行 check，不根据历史 health 推断当前所有字节完好。</p>

## 内容依据

- `README.md`
- `src/launcher.ts`
- `src/extension-host/host.ts`
- `docs/optional-module-management.md`
- `sdk/README.md`
