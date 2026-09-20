# 扩展与 SDK

用清单声明工具和依赖，通过薄 SDK 接入受管执行与资源生命周期。

## 创建开发包

<pre><code class="language-bash">node bin/tunmo-extension.mjs create org.example.hello /absolute/new/hello
node bin/tunmo-extension.mjs validate extension /absolute/new/hello</code></pre><p>创建命令拒绝覆盖已有目录。开发包携带 SDK 与工具示例，可独立复制；完整示例见 examples/hello、examples/shared-node-a 和 examples/shared-node-b。</p>

## 声明工具

<p>extension.json 声明包身份、兼容范围、工具贡献和 runtimeRequirements。入口通过 defineExtension 提交定义：</p><pre><code class="language-javascript">import { defineExtension } from &#x27;./sdk.mjs&#x27;;
import { hello } from &#x27;./tools.mjs&#x27;;

export default defineExtension(import.meta.url, () =&gt; ({
  tools: { hello },
}));</code></pre><p>tools 的键对应清单 definitionExport，工具名对应清单 name。描述、参数 schema、promptSnippet 与执行函数在工具定义中维护。</p><p>可选 setup(pi) 注册相关命令与事件，不能绕过清单再次 registerTool。Host 完整校验后才提交暂存注册，失败 setup 不会提交部分贡献。</p>

## 分发与安装

<pre><code class="language-bash">node bin/tunmo-extension.mjs pack extension /absolute/new/hello /absolute/hello.tunmo
node bin/tunmo-extension.mjs install /absolute/hello.tunmo
node bin/tunmo-extension.mjs status</code></pre><p>扩展管理提供 enable、disable、rollback、forget-rollback、uninstall、gc、recover。同 ID 同版本不同内容会被拒绝；缺少 Runtime 时进入 pending-dependencies。</p><p>用户扩展不能自声明必选身份或取得保留工具名。开发目录修改需创建新会话，reload 保留当前会话已锁定的贡献。</p>

## 执行与产物

<p>进程内工具通过 getExecutionContext() 获取本次 signal、产物服务和授权凭据。子进程工具返回 process plan，由 Host 定位声明的 Runtime，不能指定任意 executable 或回退 PATH。</p><p>Host 在进程树停止后、临时目录删除前调用 toResult，允许检查普通文件并保存持久产物。不要把临时路径作为长期交付结果；单产物默认上限 16 MiB。</p><p>SDK 和摘要校验不是沙箱。进程内扩展以当前用户权限运行，取消属于合作式；仅加载受信任扩展。</p><p>已有 GIS 模块的一次性数据任务可优先使用对应 <code>execute_python</code> 工具；只有需要长期分发、固定工具参数或独立版本管理时，才制作新的扩展。</p>

## 内容依据

- `sdk/README.md`
- `sdk/index.d.mts`
- `bin/tunmo-extension.mjs`
- `examples/hello/README.md`
- `src/extension-host/execution/session.ts`
- `src/extension-host/execution/services.ts`
