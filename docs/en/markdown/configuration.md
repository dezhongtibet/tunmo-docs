# Configuration and data directories

Understand where model configuration, user resources, and runtime data are stored.

## Configuration files

<p>The Agent always uses <code>~/.tunmo/agent</code> under the current user's home directory. On Windows, it uses the corresponding user home directory.</p><dl><dt>settings.json</dt><dd>Pi settings, resource discovery configuration, and <code>tunmo.webAccess</code> search configuration.</dd><dt>auth.json</dt><dd>Model provider credentials, using the structure supported by the current Pi version.</dd><dt>models.json</dt><dd>Custom model definitions, using the structure supported by the current Pi version.</dd></dl><p>The first startup creates minimal valid configuration files. Configuration initialization does not supply model credentials. Configure a model through your client's model setup flow or the configuration mechanism for the matching Pi version before sending requests.</p>

## How damaged configuration is handled

<p>Before startup, the Agent acquires a lock and validates JSON and schemas. A damaged file is renamed to <code>&lt;name&gt;.bak.&lt;timestamp&gt;.&lt;pid&gt;</code>, then replaced with minimal valid configuration. The original contents are preserved so that you can inspect them and recover valid fields manually.</p><p>Configuration preflight sets directory permissions to 0700 and file permissions to 0600. Actual access control on Windows also depends on filesystem ACLs. After Pi is ready, the client receives configuration repair notices through native notifications.</p>

## User resources and runtime data

<pre><code class="language-text">~/.tunmo/agent/
├── settings.json / auth.json / models.json
├── sessions/                 # Sessions
├── skills/                   # User Skills
├── packages/extensions/      # Installed extensions
├── runtime-store/            # Shared runtimes
├── runtime-downloads/        # Download and resume cache
├── optional-modules/         # Installation plans, operations, and health status
├── execution-policy.json     # Optional execution policy
├── verification-cache/       # Content verification cache
├── extension-state/          # Indexes, transactions, and leases
└── execution-artifacts/      # Persistent artifacts</code></pre><p>Project workspaces, read-only installation directories, and user data are managed separately. Do not edit shared indexes or delete leases directly. Use the management CLI to enable, disable, uninstall, and reclaim resources.</p>

## Client integration requirements

<aside class="note"><strong>Usage note</strong><p>The management CLI supports <code>--agent-dir</code>, but the current Agent session launcher has no corresponding configurable directory argument. Pointing only the management CLI at Electron userData does not change the Agent's data location. The management CLI and the Agent must use the same user's data directory, matching release resources, and the same installation state.</p></aside><p>Valid extensions, skills, prompts, themes, and packages configuration continues to be handled by Pi's automatic discovery. Model switching retains Pi's persistence semantics: if multiple processes change the default model concurrently, the last write wins.</p>

## Sources

- `src/config-preflight.ts`
- `src/config-validation.ts`
- `src/launcher.ts`
- `src/extension-host/management/store.ts`
- `src/extension-host/execution/policy.ts`
