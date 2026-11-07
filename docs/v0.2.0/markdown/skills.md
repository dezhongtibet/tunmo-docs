# Skills 与知识复用

> 文档版本：v0.2.0

把可重复的工作流程组织成可发现、可维护的 Skill Directory。

## Skill 的用途

<p>Skill 提供任务说明、步骤和配套资源；工具负责实际执行。内置 <code>tunmo-agent</code> 指导 Agent 使用项目能力，<code>skill-creator</code> 帮助生成标准 Skill 目录。</p><p>使用原生 <code>get_commands</code> 查看 <code>skill:*</code> 条目。用户资源沿用 Pi 的项目与用户目录发现机制。</p>

## 创建一个 Skill

<p>在仓库的 <code>skills/skill-creator</code> 目录执行：</p><pre><code class="language-bash">node scripts/create-skill.mjs \
  --name release-notes \
  --description &quot;Creates release notes from verified changes. Use for release note requests.&quot; \
  --when &quot;A verified change list is available.&quot; \
  --step &quot;Group changes by user impact and write release notes.&quot; \
  --constraint &quot;Do not invent changes or compatibility claims.&quot; \
  --output ./generated-skills

node scripts/validate-skill.mjs ./generated-skills/release-notes</code></pre><p>生成器使用 Node 内置模块，不需要联网。名称规范为小写 kebab-case；只有提供真实文件时才创建 references、scripts 或 assets 目录。</p><p>校验器检查目录结构、引用路径和部分敏感内容模式；它不执行脚本，也不是任意代码的安全沙箱或完整 YAML 语法验证器。运行配套脚本前仍需理解其实际行为。</p>

## 安装与验证

<p>将校验通过的完整目录放入 <code>~/.tunmo/agent/skills/</code>，重启 Agent 后检查 <code>skill:release-notes</code>。不要只复制 SKILL.md 而漏掉它引用的文件。</p>

## 扩展配套 Skills

<p>Host 0.1.4 起，扩展可在清单声明包内 Skills。已安装、启用且依赖就绪的扩展会在新会话自动加载对应版本的 Skill。</p><p><code>qgis-runtime</code> 与 <code>geopandas-runtime</code> 指导现有工具及任务脚本的使用。Skill 本身不注册工具；<code>gis_execute_python</code> / <code>geopandas_execute_python</code> 来自对应扩展版本，QGIS 的受控算法允许清单不会因加载 Skill 扩大。</p><p>停用模块可撤销工具执行，但旧会话已经加载的 Skill 内容仍在上下文中；新会话刷新列表。已有旧插件要先通过模块管理更新并加载新版工具一次，之后编写或修改任务脚本可以在当前会话完成。不要把模块配套 Skill 复制到全局目录，以免绕过它的加载生命周期。</p>

## Skill 加载诊断

<p>在 ready 后通过原生 <code>prompt</code> 调用 <code>/tunmo-skills-diagnostics [requestId]</code>，读取当前会话同一 Pi 加载器的结果。查询不调用模型，不写入会话历史。</p><pre><code class="language-json">{&quot;id&quot;:&quot;rpc-diag-1&quot;,&quot;type&quot;:&quot;prompt&quot;,&quot;message&quot;:&quot;/tunmo-skills-diagnostics diag-1&quot;}</code></pre><p>RPC <code>response</code> 只确认命令处理；诊断结果在 <code>extension_ui_request</code>、<code>method: notify</code> 的 <code>message</code> JSON 字符串中。解析后按 <code>kind: tunmo.skill-diagnostics</code> 与 <code>requestId</code> 关联结果，并核对 sessionId / cwd。requestId 可省略，返回 null；提供时须为 1–128 个 ASCII 字符，首字符为字母或数字，其余允许字母、数字、点、下划线、冒号和连字符。下面是解析后的通知示例：</p><pre><code class="language-json">{
  &quot;schemaVersion&quot;: 1,
  &quot;kind&quot;: &quot;tunmo.skill-diagnostics&quot;,
  &quot;requestId&quot;: &quot;diag-1&quot;,
  &quot;sessionId&quot;: &quot;client-task-001&quot;,
  &quot;cwd&quot;: &quot;/absolute/project&quot;,
  &quot;success&quot;: true,
  &quot;data&quot;: {
    &quot;revision&quot;: 1,
    &quot;status&quot;: &quot;ready&quot;,
    &quot;skills&quot;: [],
    &quot;diagnostics&quot;: [],
    &quot;resolutionDiagnostics&quot;: []
  }
}</code></pre><ul><li><code>skills</code> 是当前实际加载的 Pi Skill 列表，保留文件路径与 sourceInfo。</li><li><code>diagnostics</code> 包含 Pi 校验和冲突，冲突保留 winnerPath / loserPath。warning 也可能对应加载失败，须结合 skills 判断，不能把所有 warning 都当作失败。</li><li><code>resolutionDiagnostics</code> 补充 settings 与包 manifest 的明确 Skill 路径缺失或根目录访问失败、本地包缺失、离线包不可用及包解析失败。每项有 code、type、message、resourceType，及可选 path、source、scope。package 级问题不能推断 Skill 名称。来源 URL 输出前移除凭据、查询与片段。</li><li><code>revision</code> 每次 reload 递增并清空旧诊断；status 为 ready / loading / failed。success 只表示成功读取快照，不能当作资源加载成功。</li></ul><p>显式禁用的资源、负向 selector 和未匹配 glob 不误报缺失。Pi 深层目录或符号链接扫描、包 manifest 解析回退的静默跳过仍不保证有诊断，空列表不能证明所有配置正常。</p><p>缺少依赖补丁时返回 <code>success: false</code>、<code>error.code: SkillDiagnosticsUnavailable</code>；非法标识为 SkillDiagnosticsRequestInvalid，读取异常为 SkillDiagnosticsReadFailed。客户端须显示查询错误，不能替换成空诊断数组。初始包解析失败继续使启动失败，可能没有 ready；持续读取 stderr，<code>tunmo-agent: skill-resolution </code> 后为一项 JSON。完整字段见仓库 <code>docs/architecture.md</code>。</p>

## 内容依据

- `skills/skill-creator/scripts/create-skill.mjs`
- `skills/skill-creator/scripts/validate-skill.mjs`
- `src/launcher.ts`
- `docs/skill-creator-design.md`
- `sdk/README.md`
- `src/skill-diagnostics.ts`
- `test/rpc/skill-diagnostics.integration.test.mjs`
