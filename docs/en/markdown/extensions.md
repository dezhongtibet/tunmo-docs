# Extensions and SDK

Start with Hello: load a development package, package and install it, verify a real tool call, then choose the runtime and executor you need.

## Create a development package

<p>Run these commands from the Agent repository root after preparing Node.js ≥24, pnpm ≥12, and dependencies as described in <a href="quickstart.md">Quickstart</a>. Replace placeholder paths with local absolute paths. The output parent directory must exist; creation refuses to overwrite an existing directory.</p><pre><code class="language-bash">node bin/tunmo-extension.mjs create org.example.hello /absolute/new/hello
node bin/tunmo-extension.mjs validate extension /absolute/new/hello
node bin/tunmo-agent.mjs --session-id hello-dev-001 --cwd /absolute/project --extension /absolute/new/hello/index.mjs</code></pre><p>The complete package contains <code>extension.json</code>, <code>index.mjs</code>, <code>tools.mjs</code>, and a local <code>sdk.mjs</code>. It can be copied independently without globally installing an SDK. The last command starts an RPC process. Wait for ready as described in <a href="rpc.md">RPC integration</a>, then send this message through the client, terminated by a newline:</p><pre><code class="language-json">{&quot;id&quot;:&quot;hello-1&quot;,&quot;type&quot;:&quot;prompt&quot;,&quot;message&quot;:&quot;Call org_example_hello_hello with name set to World.&quot;}</code></pre><p>A configured, working model is required. Check <code>tool_execution_start</code> for <code>toolName: org_example_hello_hello</code> and <code>args: {"name":"World"}</code>. Match its <code>toolCallId</code> to <code>tool_execution_end</code> and confirm <code>isError: false</code>, result text <code>Hello, World</code>, and <code>details.ok: true</code>. A natural-language reply alone does not prove execution. After editing the development directory, stop the old process and start with a new session-id. Test development loading and managed installation separately for the same example.</p>

## Declare tools

<p>extension.json declares the package identity, compatibility range, tool contributions, and runtimeRequirements. The entry point submits its definition through defineExtension:</p><pre><code class="language-javascript">import { defineExtension } from &#x27;./sdk.mjs&#x27;;
import { hello } from &#x27;./tools.mjs&#x27;;

export default defineExtension(import.meta.url, () =&gt; ({
  tools: { hello },
}));</code></pre><p>Keys in tools correspond to definitionExport in the manifest, and tool names correspond to the manifest name. Descriptions, parameter schemas, promptSnippet, and execution functions are maintained in the tool definition.</p><p>An optional setup(pi) registers related commands and events. It must not bypass the manifest by calling registerTool again. The Host commits staged registrations only after full validation; a failed setup does not commit partial contributions.</p><p><code>runtimeRequirements</code> declares dependencies by alias, and a tool’s <code>runtimeRefs</code> may only reference those aliases. A <code>local-in-process</code> tool implements <code>execute</code>; a <code>local-process</code> tool implements <code>process</code> and can transform its result with <code>toResult</code>. Use <code>sdk/index.d.mts</code> as the interface contract instead of importing private Host internals.</p><p>Hello’s host Node requirement of <code>&gt;=22.19.0</code> describes the extension’s compatibility range. It does not lower the Agent’s current startup requirement of <code>&gt;=24.0.0</code>.</p>

## Distribute and install

<pre><code class="language-bash">node bin/tunmo-extension.mjs pack extension /absolute/new/hello /absolute/hello.tunmo
node bin/tunmo-extension.mjs install /absolute/hello.tunmo
node bin/tunmo-extension.mjs status
node bin/tunmo-agent.mjs --session-id hello-installed-001 --cwd /absolute/project</code></pre><p>Inspect <code>current.status</code> in the install result and the extension’s <code>enabled</code>, <code>current.status</code>, and <code>current.error</code> in status. It should be enabled and ready. Repeat the Hello call in a new process without <code>--extension</code> to verify loading from the installation.</p><p>The default installation scope is the user’s <code>~/.tunmo/agent</code>. For a project-only installation, add <code>--project /absolute/project</code> to management commands and use that project as the Agent’s <code>--cwd</code>. <code>--agent-dir</code> selects the management command’s data directory only; it does not change the launcher’s fixed Agent directory. Do not mistake an isolated test store for the normal launcher’s installation store. Production management commands should also set <code>--release-root /absolute/agent</code>.</p><p>Management provides enable, disable, rollback, forget-rollback, uninstall, gc, and recover. Bump the version before packaging and installing changes to an installed package. The same ID and version with different content is rejected, even after uninstalling. Missing runtimes cause <code>pending-dependencies</code>. If an upgrade candidate lacks dependencies, the previous successful version remains; inspect <code>candidateVersion</code>.</p><p>User extensions cannot declare themselves mandatory or claim reserved tool names. Start a new Agent process after changing development files; reload retains the current session’s locked contributions.</p>

## Execution and artifacts

<p>In-process tools use getExecutionContext() to access the current signal, artifact service, and authorized credentials. Subprocess tools return a process plan, and the Host locates the declared runtime. They cannot specify an arbitrary executable or fall back to PATH.</p><p>The Host calls toResult after the process tree has stopped and before deleting temporary directories, allowing the tool to inspect regular files and save persistent artifacts. Do not deliver temporary paths as long-term results. The default size limit is 16 MiB per artifact.</p><p>The SDK and digest verification do not provide a sandbox. In-process extensions run with the current user's permissions, and cancellation is cooperative. Load only trusted extensions.</p><p>For one-off data tasks in an existing GIS module, prefer its corresponding <code>execute_python</code> tool. Create a new extension only when you need ongoing distribution, fixed tool parameters, or independent version management.</p><p>In <code>process(input, context)</code>, <code>packageRoot</code> is the extension directory, <code>projectWorkspace</code> is the actual project selected at startup, and <code>executionId</code> is assigned by the Host. The workspace in <code>toResult(result, { workspace })</code> is the temporary task directory. Keep these paths distinct and do not replace trusted context with model input. See <a href="runtimes.md">Runtimes and execution lifecycle</a> for runtime preparation and process protocols.</p>

## Choose an example

<p>These directories are under <code>examples/</code> in the Agent repository. All accept <code>{"name":"World"}</code>. Apply the pack / install flow above, replacing the package directory and archive filename for each example.</p><ul><li><code>hello</code>: a minimal in-process tool. Call <code>org_example_hello_hello</code> for <code>Hello, World</code>. It uses the actual Agent Node and needs no separately imported Node artifact.</li><li><code>cloud-text</code>: text and artifact services. Call <code>org_example_cloud_text_hello</code> for <code>HELLO, WORLD</code> and an artifact reference. It runs locally by default; explicitly enable the mock backend through the <a href="runtimes.md">execution policy</a>.</li><li><code>shared-node-a</code>: subprocess tool <code>org_example_shared_node_a_hello</code>, returning <code>Hello a, World</code>, the Node version, PID, and task directory.</li><li><code>shared-node-b</code>: subprocess tool <code>org_example_shared_node_b_hello</code>, returning <code>Hello b, World</code>. It shares a compatible interpreter artifact with a; each invocation has its own process and task directory.</li></ul><p>Both shared-node examples require an <code>artifact</code> binding to <code>org.nodejs.node@^26.0.0</code> and do not bundle Node. Having Node on the system PATH can still produce <code>RuntimeNotFound</code>. Prepare a matching artifact through <a href="runtimes.md">offline import</a>, then start a new process.</p>

## Bundle Skills with an extension

<p>Host 0.1.4 and later support these fields in <code>extension.json</code> (fragment). Create the referenced SKILL.md and retain the Pi compatibility field and the rest of the manifest:</p><pre><code class="language-json">{
  &quot;compatibility&quot;: { &quot;extensionHost&quot;: &quot;^0.1.4&quot;, &quot;pi&quot;: &quot;0.87.1&quot; },
  &quot;skills&quot;: [&quot;skills/my-skill/SKILL.md&quot;]
}</code></pre><p>Paths must refer to readable files inside the package; duplicate, missing, or escaping paths are rejected. Package the Skill and its referenced resources with the extension so content digests, installation versions, and leases cover them.</p><p>Automatic loading applies to enabled, dependency-ready extensions in managed installations and release snapshots. For development loading through <code>--extension</code> alone, also pass <code>--skill /absolute/new/hello/skills/my-skill/SKILL.md</code>. In a new process, use <code>get_commands</code> to check the corresponding <code>skill:*</code> entry. Disabling does not remove text already loaded in an old session; new sessions refresh the list. See <a href="skills.md">Skills and knowledge reuse</a> for the format.</p>

## Verification and common issues

<ol><li><strong>Manifest validation:</strong> validate checks the manifest; it does not prove exports, registration, or business execution work.</li><li><strong>Packaging and installation:</strong> pack confirms packaging only. A ready result from install / status means installation dependencies resolve; also check enabled.</li><li><strong>New-process activation:</strong> after ready, inspect tool names and failures using <code>/tunmo-extensions</code>. For missing tools, check module, definitionExport, tool name, compatibility, and installation scope.</li><li><strong>Real invocation:</strong> inspect <code>tool_execution_end.isError</code>, text, and details. For artifact tools, also verify the reference can be read. A model repeating the expected text is not an execution check.</li></ol><p><code>RuntimeNotFound</code> / <code>pending-dependencies</code>: supply a <a href="runtimes.md">matching runtime</a>. Same-version content conflict: bump the extension version. Old behavior after editing: start a new process and check the loaded source. Windows subprocess <code>ExecutorUnavailable</code>: check <a href="runtimes.md">supervisor preparation</a>. The repository’s <code>test/rpc/managed-native.integration.test.mjs</code> uses a deterministic local driver to verify real installation and tool calls offline, without a model service.</p>

## Sources

- `sdk/README.md`
- `sdk/index.d.mts`
- `bin/tunmo-extension.mjs`
- `examples/hello/README.md`
- `src/extension-host/execution/session.ts`
- `src/extension-host/execution/services.ts`
- `scripts/create-extension.mjs`
- `examples/hello/extension.json`
- `examples/cloud-text/README.md`
- `examples/shared-node-a/extension.json`
- `examples/shared-node-b/extension.json`
- `src/extension-host/management/package-installations.ts`
- `test/rpc/managed-native.integration.test.mjs`
