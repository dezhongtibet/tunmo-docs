# Runtimes and execution lifecycle

Share complete environments by content identity and bind every session to a traceable runtime version.

## What is a runtime?

<p>A runtime is a verified collection of interpreters, libraries, and entry points. Multiple extensions can reuse the same content. Environments with different digests or incompatible versions are kept separately; sharing does not merge site-packages directories.</p><p>binding: host validates the actual Node.js runtime used by the Agent, while binding: artifact selects an artifact on disk. Matching considers the version, operating system, architecture, ABI, minimum OS version, build identity, and digest.</p><p><code>host</code> validates the Node actually running the Agent; importing another Node artifact does not replace it. <code>artifact</code> requires a verified runtime in release resources or the management store. System Node, Homebrew, and PATH are not fallback sources. A manifest alias such as <code>node</code> is package-local; identity is determined by <code>runtimeId</code>, version, and digests.</p>

## Session snapshots and leases

<p>A session locks its dependencies and acquires leases when it starts. After an upgrade, existing sessions retain their previous bindings, while new sessions select the new version. Garbage collection rechecks installations, rollback references, and active leases; only unreferenced resources can be deleted.</p><p>Revoking permissions when an optional module is disabled is independent of retaining its files. Keeping an old runtime does not mean an existing session can still execute a disabled module.</p>

## Offline import

<p>Use a prepared, digest-sealed runtime for the target platform. An ordinary Node installation directory is not valid import-runtime input. For a complete runtime directory, validate it, then package and import it:</p><pre><code class="language-bash">node bin/tunmo-extension.mjs validate runtime /absolute/prepared/runtime
node bin/tunmo-extension.mjs pack runtime /absolute/prepared/runtime /absolute/node.runtime.tunmo
node bin/tunmo-extension.mjs import-runtime /absolute/node.runtime.tunmo
node bin/tunmo-extension.mjs status</code></pre><p>You may also run <code>import-runtime /absolute/prepared/runtime</code> directly. If a trusted source supplies a matching <code>.tunmo</code> package, import it directly; validate accepts a directory, not an archive. Import performs content verification and any health check declared in the manifest.</p><p>To build a Node artifact from the Agent repository, obtain the official archive selected for your current platform in <code>resources/runtime-builds.json</code>, then run the build command below. Its SHA-256 must match the locked configuration, and the output directory must not already exist:</p><pre><code class="language-bash">node scripts/build-node-runtime.mjs /absolute/downloads/node-archive /absolute/new/node-runtime-build
node bin/tunmo-extension.mjs import-runtime /absolute/new/node-runtime-build/node.runtime.tunmo</code></pre><p>Replace node-archive with the actual archive named in the configuration. The build configuration currently pins Node 26.0.0 and provides <code>darwin-arm64</code> and <code>win32-arm64</code> targets. The script selects the current process platform; it is not a cross-compiler and does not establish support for other platforms. Outputs include <code>runtime/</code>, <code>node.runtime.tunmo</code>, and <code>report.json</code>. Runtime versions are independent of documentation-site versions.</p><p>Both shared-node examples require <code>org.nodejs.node@^26.0.0</code>. Importing a matching artifact into the same management store retries pending dependencies. Run status again to confirm ready, then start a new Agent process. Importing a newer runtime alone does not change the exact bindings of an already-ready installation.</p><p>Management does not run npm/pip installation scripts. Large directory imports are limited to 16 GiB and 200,000 files. The v1 <code>.tunmo</code> format retains limits of 512 MiB unpacked and 256 MiB compressed and cannot directly package large GIS environments.</p>

## Startup and cleanup

<p>A runtime can declare fixed arguments, bundled scripts, and environment settings through launch. An executable path from entrypoints alone does not replace the complete startup plan that includes launch.</p><p>Each subprocess invocation has its own task directory, supervisor, and execution lease. Unix uses process groups; Windows uses Job Objects. Stop the process tree before cleaning up directories and releasing resources. A timeout does not mean cleanup has finished.</p><p>The JSONL Worker protocol is separate from the external Pi RPC protocol. Worker messages must carry the same request ID, may report status and progress, and must return exactly one terminal state. Diagnostics from third-party libraries go to stderr.</p><p>For structured Workers, set <code>protocol: "jsonl-v1"</code> and <code>requestId: context.executionId</code> in the process plan. Each message carries <code>protocolVersion: 1</code>, the same <code>id</code>, and a type. A successful terminal message has <code>{"type":"result","ok":true,"result":{}}</code> plus the protocol version and id; failures use <code>ok:false</code> and <code>error:{type,message}</code>. Emit nothing after the terminal message. Successful content reaches <code>toResult</code> as <code>result.workerResult</code>. The shared-node examples use plain stdout JSON and do not need this protocol.</p><p>Before running subprocess tools from source on Windows, run <code>node scripts/build-windows-helper.mjs</code> in that Windows environment. Production builds include the supervisor. A missing supervisor can produce <code>ExecutorUnavailable</code>. Verify on the actual target platform; a successful macOS run does not verify Windows.</p>

## Cloud execution boundaries

<p><code>examples/cloud-text</code> uses local-in-process by default. To test the local mock backend, add this configuration to <code>~/.tunmo/agent/execution-policy.json</code> and start a new Agent process. If the file exists, merge the tool entry while preserving other policies:</p><pre><code class="language-json">{
  &quot;schemaVersion&quot;: 1,
  &quot;tools&quot;: {
    &quot;org.example.cloud-text/hello&quot;: {
      &quot;executor&quot;: &quot;cloud&quot;,
      &quot;backend&quot;: &quot;mock&quot;,
      &quot;allowDataTransfer&quot;: true
    }
  }
}</code></pre><p>The policy key is <code>extension ID/tool ID</code>, here <code>org.example.cloud-text/hello</code>. The RPC tool name is <code>org_example_cloud_text_hello</code>; do not interchange them. The tool manifest must also declare the cloud executor. Invoke with <code>{"name":"World"}</code> and check <code>HELLO, WORLD</code>, <code>details.ok</code>, and <code>details.artifact</code>. The mock path labels artifact references remote, but execution still occurs locally; no real cloud service is involved.</p><p>Removing this tool policy restores local execution in new processes. Disallowed data transfer fails; a local failure never automatically uploads data or switches execution to the cloud. When a remote result is unknown, retain recovery information instead of blindly resubmitting a task with side effects. These adapters and mock tests do not establish production cloud availability.</p>

## Sources

- `sdk/README.md`
- `src/extension-host/runtime/resolver.ts`
- `src/extension-host/management/archive.ts`
- `src/extension-host/execution/contracts.ts`
- `src/extension-host/execution/policy.ts`
- `docs/runtime-declarative-launch.md`
- `docs/runtime-channel.md`
- `bin/tunmo-extension.mjs`
- `resources/runtime-builds.json`
- `scripts/build-node-runtime.mjs`
- `scripts/build-windows-helper.mjs`
- `src/extension-host/management/package-installations.ts`
- `examples/cloud-text/README.md`
- `examples/shared-node-a/extension.json`
