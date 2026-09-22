# Installation and quickstart

Run the Agent from source and establish a session through standard input and output.

## Set up your environment

<p>Node.js ≥ 22.19.0 and pnpm ≥ 12.0.0 are required. The full compatibility suite uses the network permission capabilities in Node 26. Run the following commands from the root of your local tunmo-agent repository.</p><p><code>optional-extensions/</code> is pinned to a specific commit in the private <code>dezhongtibet/tunmo-plugins</code> repository. Source installation, the optional-module CLI, and a complete build require this content. Obtain read access to the plugin repository and configure your own Git authentication first, then run:</p><pre><code class="language-bash">git submodule update --init --recursive
pnpm install --frozen-lockfile
pnpm check:deps</code></pre><p>Check out the commit pinned by the main repository; do not use <code>--remote</code> to unintentionally upgrade the plugins. GitHub source ZIP downloads do not include submodule files. If you do not have access, ask the maintainers for complete release resources for the matching version. The public main repository alone is not a complete, ready-to-use installation package. Project CI uses a separate read-only <code>TUNMO_PLUGINS_READ_TOKEN</code>; the default token in a regular fork cannot read this private repository.</p><p>For a Windows source installation, also run <code>node scripts/build-windows-helper.mjs</code> to generate the process supervisor. Prebuilt releases should include the supervisor for the corresponding platform. Do not mix Agent Node and runtime resources built for different architectures.</p>

## Start the process

<pre><code class="language-bash">pnpm start -- --session-id docs-demo-001 --cwd /absolute/path/to/project</code></pre><p>Replace the example path with your actual project directory. A session ID may contain only letters, digits, periods, underscores, and hyphens, and must start and end with a letter or digit. Assign a unique ID to each client task.</p><aside class="note"><strong>Usage note</strong><p>This entry point runs an RPC process, not a terminal chat interface. The launcher trusts the project directory you supply. Project extensions run with the current user's permissions, so use a trusted workspace.</p></aside>

## Wait for readiness and send a message

<p>stdout contains one JSON object per line; diagnostics go to stderr. After receiving an <code>extension_ui_request</code> with <code>method: notify</code> and a message containing <code>tunmo-agent ready</code>, write the following lines to stdin:</p><pre><code class="language-json">{&quot;id&quot;:&quot;state-1&quot;,&quot;type&quot;:&quot;get_state&quot;}
{&quot;id&quot;:&quot;commands-1&quot;,&quot;type&quot;:&quot;get_commands&quot;}
{&quot;id&quot;:&quot;prompt-1&quot;,&quot;type&quot;:&quot;prompt&quot;,&quot;message&quot;:&quot;Introduce the current project and describe the capabilities available to you.&quot;}</code></pre><p>Model requests require valid model and credential configuration. Process readiness means initialization is complete; it does not mean provider credentials are available. The client should process responses and streaming events line by line, rather than treating each received data chunk as a complete JSON object.</p>

## Next steps

<p>Use <code>get_commands</code> to check for <code>/goal</code>, <code>/tunmo-web-tools</code>, and <code>skill:*</code> commands. Read the <a href="configuration.md">configuration guide</a> to understand data directories, the <a href="rpc.md">RPC guide</a> to handle messages and cancellation, and <a href="modules.md">module management</a> to enable GIS.</p><p>Closing stdin lets Pi exit normally. <code>--offline</code> enables <code>PI_OFFLINE=1</code>, preventing missing npm/git resources from being fetched at startup. Built-in Web Access also rejects network requests. This is not an operating-system network sandbox, and it does not turn a cloud model into a local model. Offline work still requires resources to be installed and a suitable model to be available.</p>

## Sources

- `README.md`
- `package.json`
- `.gitmodules`
- `.github/actions/checkout-plugins/action.yml`
- `src/launcher.ts`
- `scripts/build-windows-helper.mjs`
- `extensions/web-access/fetcher.ts`
