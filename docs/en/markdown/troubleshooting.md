# Troubleshooting

Identify where the failure occurs, then check configuration, resources, and session state.

## Startup fails or no ready notification arrives

<ol><li>Check the Node.js and pnpm versions and verify that --session-id / --cwd are valid.</li><li>Read stderr. Keep diagnostics separate from stdout JSONL parsing.</li><li>Check dependencies, release resources, and read access to private submodules. A complete source checkout requires initializing the pinned optional-extensions revision before running pnpm check:deps.</li><li>If configuration was repaired, inspect the .bak backup and restore valid fields.</li></ol><p>If a built-in file's digest does not match, restore the matching release content. Use the project's seal-release workflow only when actively developing and intentionally resealing built-in content. Do not treat resealing as a general fix that bypasses verification.</p>

## The process is ready but the model does not respond

<p>Use get_state to confirm the current state, then check the model, provider credentials, and network. The default configuration does not automatically grant access to a model. Inspect native error events; ready does not indicate successful authentication.</p>

## GIS tools are missing

<ol><li>Run tunmo-module list and confirm that the current release registers the module.</li><li>Query status and check enabled, available, and health separately.</li><li>Complete plan → confirmation → enable.</li><li>Create a new Agent process. Re-enabling and updating a module require more than reload.</li></ol><p>The current default manifest registers both QGIS and GeoPandas. If list does not include a module, check the Agent release configuration and submodule version actually in use. The two modules are installed independently; installing QGIS does not enable GeoPandas.</p><p>Updating only the submodule pointer in the main repository does not change the installed plugin version. If <code>gis_execute_python</code> or <code>geopandas_execute_python</code> is missing, check the installed version, confirm and complete the update, then create a new session.</p>

## Platform, plan, or content errors

<dl><dt>RuntimeIncompatible</dt><dd>Check the actual architecture and OS version of the Node.js runtimes used for management and for the Agent, along with the Catalog's compatibility range. Installation requires a compatible package.</dd><dt>ConfirmationRequired</dt><dd>Obtain a plan first, then confirm its planId.</dd><dt>InstallationPlanExpired</dt><dd>The plan has expired or its content has changed. Run plan again and confirm the new plan.</dd><dt>pending-dependencies</dt><dd>The extension has been discovered, but its runtime dependencies are not fully ready. Add the missing verified artifacts first.</dd><dt>SourceCrsInvalid</dt><dd>Confirm and repair the source CRS using the data's provenance before running QGIS spatial operations. Do not guess the input coordinate system from the target CRS.</dd><dt>ExecutorUnavailable</dt><dd>Check the supervisor and release resources required by the current platform. Windows development builds need the corresponding helper.</dd></dl>

## Result files or disk space issues

<p>Locate files using workspacePath / Artifact references in successful tool results. Output from cancelled tasks may be incomplete. Uninstalling does not delete user data or the download cache, and environments still referenced by sessions are retained. End sessions normally before reclaiming resources through the management entry point.</p><p>If update status has not refreshed, run plan first; status itself does not access the network. Run check if you suspect damaged resources. Historical health values do not establish that all bytes are currently intact.</p>

## Sources

- `README.md`
- `src/launcher.ts`
- `src/extension-host/host.ts`
- `docs/optional-module-management.md`
- `sdk/README.md`
