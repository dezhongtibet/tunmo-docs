# Optional module management

Review and confirm a plan before installing a complete runtime environment. Keep installation separate from everyday tool calls.

## Inspect current modules

<pre><code class="language-bash">node bin/tunmo-module.mjs list
node bin/tunmo-module.mjs status qgis
node bin/tunmo-module.mjs status geopandas</code></pre><p>list and status read local state without refreshing the Catalog over the network. The default module registry currently includes <code>qgis</code> and <code>geopandas</code>, each with its own trusted Catalog and runtime. A registered module is not necessarily installed or enabled.</p><p>Before running from source, initialize the private plugin submodules for which you have read access. When loading the default registry, the module CLI reads both extension manifests; this cannot succeed if the submodule directories are empty.</p>

## Enable QGIS for the first time

<pre><code class="language-bash">node bin/tunmo-module.mjs plan qgis
# Present the plan and obtain user confirmation; replace PLAN_ID with the returned planId.
node bin/tunmo-module.mjs enable qgis --confirm PLAN_ID --events
node bin/tunmo-module.mjs check qgis</code></pre><p>plan validates the trusted Catalog and matches the system, architecture, and version requirements of the actual Node process. It fetches metadata only and does not download the runtime. The client displays the version, download size, and peak disk usage, then returns the confirmed planId unchanged.</p><p>A plan is valid for one hour. If the saved plan, extension source, or actual platform changes, or if the plan expires, run plan again and obtain confirmation. A newer release in the remote Catalog does not automatically replace the target in an already confirmed plan. After installation succeeds, start a new Agent process to load the tools.</p><p>To enable GeoPandas, replace <code>qgis</code> with <code>geopandas</code> in the commands above. Its supported platforms and installation plan are matched independently.</p>

## Everyday lifecycle operations

<p>The following are independent management operations. Choose the one that matches your current need:</p><dl><dt><code>node bin/tunmo-module.mjs disable qgis</code></dt><dd>Disable the module and request that its workers stop, while keeping the runtime.</dd><dt><code>node bin/tunmo-module.mjs enable qgis</code></dt><dd>Re-enable an installed module whose content has not changed, reusing the local runtime after verification.</dd><dt><code>node bin/tunmo-module.mjs check qgis</code></dt><dd>Check the installed runtime's content and health.</dd><dt><code>node bin/tunmo-module.mjs cancel qgis</code></dt><dd>Request cancellation of an ongoing management operation, then wait for the original command to exit and query its status.</dd><dt><code>node bin/tunmo-module.mjs rollback qgis</code></dt><dd>Switch to the previous successful binding. A usable previous version must exist.</dd><dt><code>node bin/tunmo-module.mjs uninstall qgis</code></dt><dd>Uninstall the module and attempt to reclaim its artifacts. Workspaces, sessions, persistent artifacts, and the download cache are retained. Shared runtimes and runtimes held by leases are not reclaimed immediately.</dd></dl><p>Before updating, fetch a plan separately:</p><pre><code class="language-bash">node bin/tunmo-module.mjs plan qgis</code></pre><p>Present the plan and obtain confirmation. Replace PLAN_ID with the planId just confirmed, then run:</p><pre><code class="language-bash">node bin/tunmo-module.mjs update qgis --confirm PLAN_ID --events</code></pre><p>Repair also requires a newly generated and confirmed plan; replace <code>update</code> above with <code>repair</code>. Updates and repairs preserve the original enabled or disabled state. After a failure, query the actual state instead of inferring whether changes were committed from a client timeout alone. After installation, update, rollback, or re-enabling, create a new Agent session to load the corresponding version.</p>

## Progress and status

<p>Successful management operations return one JSON object on stdout; <code>help</code> returns help text. With <code>--events</code>, stderr emits <code>module-progress</code> JSONL. Failures return a nonzero exit code and <code>module-error</code>.</p><p>Current progress stages include planning, downloading, verifying, extracting, installing, and checking, followed by completed, failed, or cancelled. Updates and repairs use the same stages; distinguish the management action using operation.action returned by status. Cache reuse may skip downloading. Rely on the final result and a subsequent status query; a client timeout does not necessarily mean installation failed.</p><dl><dt>enabled and available</dt><dd>The former represents the enablement policy; the latter represents resource availability. They are independent.</dd><dt>health</dt><dd>The result of the latest check. A status query does not necessarily scan all files again.</dd><dt>updateAvailable</dt><dd>A comparison against the most recently saved plan, not an automatic background check over the network.</dd><dt>restartSession</dt><dd>When true, create a new Agent session. reload does not rebuild managed snapshots.</dd></dl>

## Disabling and cancellation

<p>Disabling revokes execution permissions for old snapshots and stops module workers, but a stop request does not mean the processes have already exited. If the result contains <code>workersStopped: false</code> or <code>state: stopping</code>, continue querying status. After re-enabling, create a new session; old snapshots do not regain execution permissions.</p>

## Sources

- `bin/tunmo-module.mjs`
- `resources/optional-modules.json`
- `src/extension-host/modules/metadata.ts`
- `src/extension-host/modules/service.ts`
- `src/extension-host/modules/plans.ts`
- `src/extension-host/modules/status.ts`
- `docs/optional-module-management.md`
