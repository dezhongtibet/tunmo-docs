# Skills 与知识复用

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

## 内容依据

- `skills/skill-creator/scripts/create-skill.mjs`
- `skills/skill-creator/scripts/validate-skill.mjs`
- `src/launcher.ts`
- `docs/skill-creator-design.md`
- `sdk/README.md`
