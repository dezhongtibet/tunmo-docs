# 目标模式 Goal

> 文档版本：v0.1.0

为持续任务设定目标、查询进度，并在暂停后继续推进。

## 创建目标

<p>Goal Mode 内置固定版本的 pi-goal，使用 Pi 原生命令、工具、事件和 Session Entry 保存状态。</p><pre><code class="language-text">/goal --tokens 100k 整理当前项目的发布说明，并核对每一项验收结果</code></pre><p>通过普通 RPC prompt 的 message 字段发送上述命令。Token 预算按目标累计用量约束后续执行，最后一次模型调用可能越过预算；它不是费用或完成承诺。结果取决于模型、工具与外部条件。</p>

## 管理目标

<pre><code class="language-text">/goal status
/goal stop
/goal resume
/goal edit 调整后的完整目标
/goal clear</code></pre><dl><dt>status</dt><dd>查看当前目标；RPC 下通过原生扩展通知反馈。</dd><dt>stop / resume</dt><dd>停止会保存 paused 状态并终止正在进行的 Agent turn；resume 继续该目标。</dd><dt>edit</dt><dd>提供调整后的完整目标文本。</dd><dt>clear</dt><dd>删除当前目标。临时暂停应使用 stop。</dd></dl>

## 完成、等待与恢复

<p>Agent 使用 <code>goal_complete</code> 标记完成、<code>goal_blocked</code> 表示无法继续、<code>goal_wait</code> 在活动目标契约允许、已有外部唤醒或安全截止条件时等待。Goal 不维护额外数据库，状态属于当前 Pi Session。</p><p>重启后需要按 Pi 会话恢复机制重新打开原 Session；不要把另建新任务视为恢复目标。客户端仍保持一个任务对应一个进程。</p>

## 内容依据

- `package.json`
- `extensions/goal/implementation.ts`
- `docs/pi-goal-audit.md`
