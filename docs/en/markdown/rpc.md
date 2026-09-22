# Sessions and RPC integration

Clients communicate with the Agent through Pi native JSONL. Management operations use separate CLIs.

## Processes and channels

<p>Each client task is bound to one Agent process / Pi Session. Pass paths using argument arrays with spawn or execFile instead of concatenating shell commands.</p><pre><code class="language-javascript">import { spawn } from &#x27;node:child_process&#x27;;

const child = spawn(process.execPath, [
  &#x27;/absolute/tunmo-agent/bin/tunmo-agent.mjs&#x27;,
  &#x27;--session-id&#x27;, &#x27;client-task-001&#x27;,
  &#x27;--cwd&#x27;, &#x27;/absolute/project&#x27;,
], { stdio: [&#x27;pipe&#x27;, &#x27;pipe&#x27;, &#x27;pipe&#x27;] });

// Wait for the ready notification before writing commands to stdin.
// Frame stdout by newlines; handle diagnostics on stderr separately.</code></pre><p>Production distributions first locate and validate the bundled Node through src/bootstrap.mjs. The example above assumes a Node environment that meets the project's version requirements. It does not assume that Electron's process.execPath points to a standalone Node executable.</p>

## Common messages

<pre><code class="language-json">{&quot;id&quot;:&quot;state-1&quot;,&quot;type&quot;:&quot;get_state&quot;}
{&quot;id&quot;:&quot;commands-1&quot;,&quot;type&quot;:&quot;get_commands&quot;}
{&quot;id&quot;:&quot;prompt-1&quot;,&quot;type&quot;:&quot;prompt&quot;,&quot;message&quot;:&quot;Inspect the data files in the current project.&quot;}
{&quot;id&quot;:&quot;abort-1&quot;,&quot;type&quot;:&quot;abort&quot;}</code></pre><p>These are separate message examples. Correlate responses by id and handle native messages, tool execution, and extension UI events. Refer to the project's pinned Pi 0.84.1 for the complete protocol.</p><p>The readiness marker uses <code>extension_ui_request / notify</code>. Tool progress uses <code>tool_execution_update</code>, with worker progress presented in <code>details.execution</code>.</p>

## Keep management protocols separate

<p>The Agent does not provide private tunmo.* RPC or intercept or rewrite Pi native commands. Run bin/tunmo-extension.mjs for extension management and bin/tunmo-module.mjs for optional modules. These commands must not be written to Agent stdin.</p><p>get_commands exposes commands and Skills; it is not an interface for retrieving complete tool schemas. Pi's new_session, switch_session, fork, and clone retain their native semantics. Parallel client tasks should each create their own process instead of using session switching as a substitute for task isolation.</p>

## Exit behavior and errors

<p>stdin EOF causes a normal exit. SIGTERM and SIGHUP retain Pi's exit-code semantics of 143 and 129. Invalid startup arguments return 2; configuration initialization failure returns 20; built-in resource verification failure returns 21; a required Host extension that is not ready returns 22; and an internal launcher error returns 70. For other stages, assess stderr together with the actual exit code.</p><p>Cleanup occurs between an abort request and the child process actually ending. Clients should wait for a terminal state and distinguish partial output from successful or failed results. A cancellation acknowledgement does not mean artifacts were produced successfully.</p>

## Sources

- `src/launcher.ts`
- `src/bootstrap.mjs`
- `src/extension-host/host.ts`
- `docs/architecture.md`
- `docs/electron-runtime-verification.md`
