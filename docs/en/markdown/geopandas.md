# GeoPandas vector analysis

An independent vector processing extension for spatial joins, file conversion, controlled scripts, and task Python in the current session.

## Current availability

<aside class="note"><strong>Usage note</strong><p>The default module registry includes <code>geopandas</code> and its trusted Catalog. GeoPandas is disabled by default. Follow the <a href="modules.md">module management workflow</a> to generate a plan, confirm installation, and enable it, then create a new Agent session to load the tools.</p></aside><p>The current extension version is 0.2.0. Installation eligibility is determined by the current signed Catalog, the Agent's Node architecture, the operating system version, and <code>plan</code>. Historical platform validation belongs to the corresponding release records. This source review did not download runtimes again or repeat cross-platform GIS validation.</p>

## Nine tools

<dl><dt>geopandas_runtime_status</dt><dd>Inspect the versions of bundled CPython, GeoPandas, GDAL, GEOS, PROJ, and other components.</dd><dt>geopandas_inspect_dataset</dt><dd>source and optional layer; inspect vector data, CRS, fields, and bounds.</dd><dt>geopandas_read_file</dt><dd>source and optional layer / max_rows (0–100); return a bounded preview.</dd><dt>geopandas_buffer</dt><dd>input and distance, with optional layer / dissolve / output. Requires a projected CRS and rejects distances in longitude/latitude coordinates.</dd><dt>geopandas_reproject</dt><dd>input and target_crs, with optional layer / output.</dd><dt>geopandas_spatial_join</dt><dd>input and overlay with matching CRS; how is left/right/inner, with optional op and output.</dd><dt>geopandas_write_file</dt><dd>input and output, with optional layer; write GeoJSON or GeoPackage.</dd><dt>geopandas_run_script</dt><dd>code, with optional input / output; combine controlled data operations.</dd><dt>geopandas_execute_python</dt><dd>script and optional params; run task Python from the current workspace in the bound runtime.</dd></dl>

## Controlled scripts

<p>Supported features include assignment, JSON literals, lists and dictionaries, and read, write, summarize, len, buffer, reproject, spatial_join, and head. DataFrames expose only to_crs, head, and copy.</p><pre><code class="language-python">gdf = read(&quot;projected-points.gpkg&quot;)
gdf = buffer(gdf, 100)
write(gdf, &quot;buffer.gpkg&quot;)
result = summarize(gdf)</code></pre><p>The example input must have an appropriate projected CRS. Pass this code as the code parameter of geopandas_run_script; do not run it in system Python.</p><aside class="note"><strong>Usage note</strong><p>This is an explicitly defined subset of Python syntax, not a complete Python sandbox. It does not support import, loops, arbitrary attributes, network APIs, pip, or general Python functions. The entire AST is validated before interpreted execution; eval/exec are not used.</p></aside>

## Execution and results

<p>GeoPandas uses its own independent runtime. It does not depend on QGIS or install dependencies during tool calls. Each call starts a worker supervised by the Host, without inheriting the model API key.</p><p>Fixed tools and <code>geopandas_run_script</code> validate that inputs are inside the trusted workspace. Task Python uses context for validated data reads and writes. Results are written to <code>.tunmo-geopandas/&lt;executionId&gt;/</code>. Plain filenames produce GeoJSON or GeoPackage files, and files of ≤16 MiB also provide persistent artifact references. Module enablement, disabling, cancellation, and session recreation follow the shared module management workflow.</p>

## Run task scripts in the current session

<p>When fixed tools and controlled scripts cannot express your task, create a UTF-8 <code>.py</code> file in the workspace, define <code>run(context, params)</code>, and pass its <code>script</code> path and optional <code>params</code> to <code>geopandas_execute_python</code>. Use libraries already present in the runtime, such as GeoPandas, Shapely, and pandas, for dissolve, overlay, and field calculations.</p><p><code>context.read</code>, <code>context.write</code>, <code>context.summarize</code>, and <code>context.progress</code> provide input validation, GeoJSON or GeoPackage artifact registration, summaries, and progress reporting. Return a plain JSON object. Each call reads a fresh code snapshot. Scripts are limited to 256 KiB, parameters to 64 KiB, and execution to 15 minutes.</p><p>Ordinary Python runs with the current user's permissions; context validation does not sandbox the entire interpreter. Run only authorized tasks and do not modify the shared runtime. Existing 0.1.x installations must be updated and load 0.2.0 once. After that, editing scripts does not require restarting the session. The existing <code>geopandas_run_script</code> allowlist remains unchanged.</p>

## Sources

- `docs/optional-module-management.md`
- `resources/optional-modules.json`
- `optional-extensions/geopandas/extension.json`
- `optional-extensions/geopandas/tools.mjs`
- `optional-extensions/geopandas/README.md`
- `optional-extensions/geopandas/skills/geopandas-runtime/references/extend-runtime.md`
