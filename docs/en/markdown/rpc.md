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
// Frame stdout by newlines; handle diagnostics on stderr separately.</code></pre><p>Production distributions first locate and validate the bundled Node through src/bootstrap.mjs. The example above assumes a Node environment that meets the project's version requirements. It does not assume that Electron's process.execPath points to a standalone Node executable.</p><p>For source development, follow <a href="quickstart.md">Quickstart</a> to prepare Node.js ≥24 and the locked dependencies. Assign a unique <code>--session-id</code> to each process. The Agent data directory is fixed to the current user’s <code>~/.tunmo/agent</code>. Model calls also require a valid provider and model configuration; process readiness does not confirm model connectivity.</p>

## Common messages

<pre><code class="language-json">{&quot;id&quot;:&quot;state-1&quot;,&quot;type&quot;:&quot;get_state&quot;}
{&quot;id&quot;:&quot;commands-1&quot;,&quot;type&quot;:&quot;get_commands&quot;}
{&quot;id&quot;:&quot;prompt-1&quot;,&quot;type&quot;:&quot;prompt&quot;,&quot;message&quot;:&quot;Inspect the data files in the current project.&quot;}
{&quot;id&quot;:&quot;abort-1&quot;,&quot;type&quot;:&quot;abort&quot;}</code></pre><p>These are separate message examples. End each command with LF (<code>\n</code>). Decode stdout incrementally as UTF-8 and split only on LF, accepting CRLF as well. A data chunk can contain a partial record or several records: do not JSON.parse each <code>data</code> chunk or use a generic line reader that also splits Unicode line separators. Continuously consume stdout and handle stdin backpressure.</p><p>Register event listeners first, then wait for the following readiness notification. Check <code>type</code>, <code>method</code>, and the <code>tunmo-agent ready</code> prefix in <code>message</code> together; other notify events do not indicate readiness.</p><pre><code class="language-json">{&quot;type&quot;:&quot;extension_ui_request&quot;,&quot;method&quot;:&quot;notify&quot;,&quot;message&quot;:&quot;tunmo-agent ready；sessionId=client-task-001&quot;,&quot;notifyType&quot;:&quot;info&quot;,&quot;id&quot;:&quot;...&quot;}</code></pre><ul><li><code>response</code>: correlate by a unique request <code>id</code> and inspect <code>success</code> and <code>error</code>; do not rely on response order.</li><li>A successful <code>prompt</code> response only confirms acceptance, queuing, or command handling. Continue reading message and tool events; provider failures or cancellation can appear later.</li><li><code>tool_execution_update</code>: read tool progress; structured managed Worker progress appears in <code>partialResult.details.execution</code>.</li><li><code>tool_execution_end</code>: inspect <code>isError</code> and <code>result</code>. Managed failure details appear in <code>result.details.errorType</code> / <code>result.details.execution</code>.</li><li><code>agent_end</code>: one low-level run ended, but retries, compaction recovery, or queued work can follow. <code>agent_settled</code> means no automatic work remains for the session-level run; it does not imply every tool succeeded.</li></ul><p>The complete protocol is defined by the pinned Pi 0.87.1. After installing dependencies, consult <code>node_modules/@earendil-works/pi-coding-agent/docs/rpc.md</code>, <code>rpc-commands.md</code>, and <code>json.md</code>.</p>

## Keep management protocols separate

<p>The Agent does not provide private tunmo.* RPC or intercept or rewrite Pi native commands. Run bin/tunmo-extension.mjs for extension management and bin/tunmo-module.mjs for optional modules. These commands must not be written to Agent stdin.</p><p>get_commands exposes commands and Skills; it is not an interface for retrieving complete tool schemas. Pi's new_session, switch_session, fork, and clone retain their native semantics. Parallel client tasks should each create their own process instead of using session switching as a substitute for task isolation.</p>

## Exit behavior and errors

<p>stdin EOF causes a normal exit. SIGTERM and SIGHUP retain Pi's exit-code semantics of 143 and 129. Invalid startup arguments return 2; configuration initialization failure returns 20; built-in resource verification failure returns 21; a required Host extension that is not ready returns 22; and an internal launcher error returns 70. For other stages, assess stderr together with the actual exit code.</p><p>Cleanup occurs between an abort request and the child process actually ending. Clients should wait for a terminal state and distinguish partial output from successful or failed results. A cancellation acknowledgement does not mean artifacts were produced successfully.</p>

## Client integration checks

<ol><li>Confirm startup and the ready notification. Set a startup deadline and handle process <code>error</code> / <code>close</code> events so the client cannot wait indefinitely.</li><li>Send <code>get_state</code> and <code>get_commands</code> and check response IDs. This step requires no model call.</li><li>Send <code>/tunmo-extensions</code> or <code>/tunmo-runtimes</code> through a native <code>prompt</code> to inspect diagnostics, consuming extension UI notifications. Readiness only guarantees required extensions are ready; optional extensions can still fail to load.</li><li>After configuring a model, invoke the <a href="extensions.md">Hello example</a> and inspect the tool name, input, result, and <code>agent_settled</code>. Also verify abort, stdin EOF, and unexpected exits end client waits and release processes.</li></ol><p>Distinguish an installation marked ready in the management store from a tool activated in the current process. Verify additions, upgrades, and newly resolved dependencies in a new Agent process.</p>

## Sources

- `src/launcher.ts`
- `src/bootstrap.mjs`
- `src/extension-host/host.ts`
- `docs/architecture.md`
- `docs/electron-runtime-verification.md`
- `package.json`
- `src/extension-host/host-status.ts`
- `test/rpc/managed-native.integration.test.mjs`
