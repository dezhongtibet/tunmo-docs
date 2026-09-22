# Extensions and SDK

Declare tools and dependencies in a manifest, then use the lightweight SDK to integrate with managed execution and resource lifecycles.

## Create a development package

<pre><code class="language-bash">node bin/tunmo-extension.mjs create org.example.hello /absolute/new/hello
node bin/tunmo-extension.mjs validate extension /absolute/new/hello</code></pre><p>The create command refuses to overwrite an existing directory. A development package includes the SDK and example tools and can be copied independently. For complete examples, see examples/hello, examples/shared-node-a, and examples/shared-node-b.</p>

## Declare tools

<p>extension.json declares the package identity, compatibility range, tool contributions, and runtimeRequirements. The entry point submits its definition through defineExtension:</p><pre><code class="language-javascript">import { defineExtension } from &#x27;./sdk.mjs&#x27;;
import { hello } from &#x27;./tools.mjs&#x27;;

export default defineExtension(import.meta.url, () =&gt; ({
  tools: { hello },
}));</code></pre><p>Keys in tools correspond to definitionExport in the manifest, and tool names correspond to the manifest name. Descriptions, parameter schemas, promptSnippet, and execution functions are maintained in the tool definition.</p><p>An optional setup(pi) registers related commands and events. It must not bypass the manifest by calling registerTool again. The Host commits staged registrations only after full validation; a failed setup does not commit partial contributions.</p>

## Distribute and install

<pre><code class="language-bash">node bin/tunmo-extension.mjs pack extension /absolute/new/hello /absolute/hello.tunmo
node bin/tunmo-extension.mjs install /absolute/hello.tunmo
node bin/tunmo-extension.mjs status</code></pre><p>Extension management provides enable, disable, rollback, forget-rollback, uninstall, gc, and recover. Packages with the same ID and version but different content are rejected. A missing runtime puts an extension in pending-dependencies.</p><p>User extensions cannot declare themselves mandatory or claim reserved tool names. After changing a development directory, create a new session: reload preserves the contributions already locked by the current session.</p>

## Execution and artifacts

<p>In-process tools use getExecutionContext() to access the current signal, artifact service, and authorized credentials. Subprocess tools return a process plan, and the Host locates the declared runtime. They cannot specify an arbitrary executable or fall back to PATH.</p><p>The Host calls toResult after the process tree has stopped and before deleting temporary directories, allowing the tool to inspect regular files and save persistent artifacts. Do not deliver temporary paths as long-term results. The default size limit is 16 MiB per artifact.</p><p>The SDK and digest verification do not provide a sandbox. In-process extensions run with the current user's permissions, and cancellation is cooperative. Load only trusted extensions.</p><p>For one-off data tasks in an existing GIS module, prefer its corresponding <code>execute_python</code> tool. Create a new extension only when you need ongoing distribution, fixed tool parameters, or independent version management.</p>

## Sources

- `sdk/README.md`
- `sdk/index.d.mts`
- `bin/tunmo-extension.mjs`
- `examples/hello/README.md`
- `src/extension-host/execution/session.ts`
- `src/extension-host/execution/services.ts`
