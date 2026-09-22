# Goal mode

Set an objective for ongoing work, check progress, and continue after a pause.

## Create a goal

<p>Goal mode bundles a pinned version of pi-goal and uses native Pi commands, tools, events, and Session Entries to store state.</p><pre><code class="language-text">/goal --tokens 100k Prepare release notes for the current project and verify every acceptance result</code></pre><p>Send this command in the message field of a normal RPC prompt. The token budget constrains further execution based on cumulative usage for the goal; the final model call may exceed it. It is neither a cost limit nor a promise of completion. Results depend on the model, tools, and external conditions.</p>

## Manage a goal

<pre><code class="language-text">/goal status
/goal stop
/goal resume
/goal edit The complete revised goal
/goal clear</code></pre><dl><dt>status</dt><dd>View the current goal. In RPC mode, the result is delivered through a native extension notification.</dd><dt>stop / resume</dt><dd>Stopping saves the paused state and ends the active Agent turn; resume continues work on the goal.</dd><dt>edit</dt><dd>Supply the complete revised goal text.</dd><dt>clear</dt><dd>Delete the current goal. Use stop for a temporary pause.</dd></dl>

## Completion, waiting, and recovery

<p>The Agent uses <code>goal_complete</code> to mark completion, <code>goal_blocked</code> to indicate that it cannot proceed, and <code>goal_wait</code> to wait when the active goal contract permits it and an external wake-up or a safe deadline condition is in place. Goal mode does not maintain a separate database; its state belongs to the current Pi Session.</p><p>After a restart, reopen the original Session through Pi's session recovery mechanism. Creating a new task does not restore the goal. The client still maintains one process per task.</p>

## Sources

- `package.json`
- `extensions/goal/implementation.ts`
- `docs/pi-goal-audit.md`
