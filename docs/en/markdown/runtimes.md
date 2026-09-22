# Runtimes and execution lifecycle

Share complete environments by content identity and bind every session to a traceable runtime version.

## What is a runtime?

<p>A runtime is a verified collection of interpreters, libraries, and entry points. Multiple extensions can reuse the same content. Environments with different digests or incompatible versions are kept separately; sharing does not merge site-packages directories.</p><p>binding: host validates the actual Node.js runtime used by the Agent, while binding: artifact selects an artifact on disk. Matching considers the version, operating system, architecture, ABI, minimum OS version, build identity, and digest.</p>

## Session snapshots and leases

<p>A session locks its dependencies and acquires leases when it starts. After an upgrade, existing sessions retain their previous bindings, while new sessions select the new version. Garbage collection rechecks installations, rollback references, and active leases; only unreferenced resources can be deleted.</p><p>Revoking permissions when an optional module is disabled is independent of retaining its files. Keeping an old runtime does not mean an existing session can still execute a disabled module.</p>

## Offline import

<pre><code class="language-bash">node bin/tunmo-extension.mjs validate runtime /absolute/prepared/runtime
node bin/tunmo-extension.mjs import-runtime /absolute/prepared/runtime</code></pre><p>The input must be a prepared runtime sealed with content digests. The management entry point does not run npm/pip installation scripts. Large directory imports are limited to 16 GiB and 200,000 files. The v1 .tunmo format retains limits of 512 MiB unpacked and 256 MiB compressed and cannot directly package large GIS environments.</p>

## Startup and cleanup

<p>A runtime can declare fixed arguments, bundled scripts, and environment settings through launch. An executable path from entrypoints alone does not replace the complete startup plan that includes launch.</p><p>Each subprocess invocation has its own task directory, supervisor, and execution lease. Unix uses process groups; Windows uses Job Objects. Stop the process tree before cleaning up directories and releasing resources. A timeout does not mean cleanup has finished.</p><p>The JSONL Worker protocol is separate from the external Pi RPC protocol. A Worker must return status, progress, and exactly one terminal state with the same request ID. Diagnostics from third-party libraries go to stderr.</p>

## Cloud execution boundaries

<p>Currently, only a mock backend enabled by an explicit policy is available, and execution still takes place locally. In <code>execution-policy.json</code>, explicitly set <code>executor: cloud</code>, <code>backend: mock</code>, and <code>allowDataTransfer</code> for each tool. A local failure does not automatically upload data or transfer execution to the cloud.</p><p>When a remote outcome is unknown, retain recovery information instead of blindly resubmitting a task with side effects. These adapter interfaces and mock tests do not mean a production cloud service is available.</p>

## Sources

- `sdk/README.md`
- `src/extension-host/runtime/resolver.ts`
- `src/extension-host/management/archive.ts`
- `src/extension-host/execution/contracts.ts`
- `src/extension-host/execution/policy.ts`
- `docs/runtime-declarative-launch.md`
- `docs/runtime-channel.md`
