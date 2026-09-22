# QGIS spatial processing

Use managed PyQGIS workers to inspect data, run spatial analysis, and produce traceable result files.

## Before you begin

<p>QGIS is neither installed nor enabled by default. Follow the <a href="modules.md">module management workflow</a> to confirm and enable the runtime, then create a new Agent session. Environments are distributed separately for each platform, with no fallback to system QGIS, Conda, or Python for another architecture.</p><p>The current QGIS extension, version 0.4.1, provides 11 <code>gis_*</code> tools and 5 compatibility aliases. Each call starts a supervised worker that exits on completion. The bundled qgis-runtime Skill can help you choose the right tool.</p>

## Discover data and algorithms

<dl><dt>gis_runtime_status</dt><dd>Inspect the currently bound Python, PyQGIS, and providers. This does not replace the management status command for an uninstalled module.</dd><dt>gis_inspect_dataset</dt><dd>Use input to inspect the type, CRS, fields, feature count, or raster dimensions.</dd><dt>gis_list_algorithms</dt><dd>Query registered algorithms by provider and see whether controlled execution is allowed.</dd><dt>gis_describe_algorithm</dt><dd>Use algorithm_id to retrieve parameter and output definitions.</dd></dl>

## Spatial analysis tools

<dl><dt>gis_buffer</dt><dd>input and distance; optional segments, dissolve, and output. Distance uses the input CRS units.</dd><dt>gis_clip</dt><dd>Clip a layer using input and overlay, with optional output.</dd><dt>gis_reproject</dt><dd>Transform the coordinate system using input and target_crs, with optional output.</dd><dt>gis_merge_layers</dt><dd>An inputs array, with target_crs and output as needed.</dd><dt>gis_calculate_area</dt><dd>A polygon input, with field_name and output as needed. Calculates WGS84 ellipsoidal area in square meters; the default field is area_m2.</dd><dt>gis_run_algorithm</dt><dd>algorithm_id, controlled inputs, and an optional outputs.OUTPUT filename.</dd></dl><aside class="note"><strong>Usage note</strong><p><code>gis_run_algorithm</code> currently allows only native:buffer, native:clip, native:reprojectlayer, and native:mergevectorlayers. Listing an algorithm does not mean this controlled tool is allowed to run it. Task Python can call other algorithms actually present in the runtime, but you must verify their parameters and results yourself.</p></aside><p>Starting with 0.4.1, buffering, clipping, reprojection, merging, area calculation, and their corresponding controlled entry points validate each input layer's source CRS before creating artifacts. An invalid CRS returns <code>SourceCrsInvalid</code>. Dataset inspection can still read layers without a CRS, and a valid custom CRS does not need an EPSG code. Task scripts must validate the CRS and operation results themselves.</p>

## Example: create a buffer

<p>Place the input file inside the current project's workspace and inspect its CRS. For distances in meters, first reproject it into a suitable local projected coordinate system with meter units. Then ask the Agent:</p><blockquote>Check the coordinate system of roads.gpkg. After confirming that its distance units are meters, create a 100-meter buffer, save it as roads-buffer.gpkg, and report the result path.</blockquote><p>Example tool parameters:</p><pre><code class="language-json">{&quot;input&quot;:&quot;roads.gpkg&quot;,&quot;distance&quot;:100,&quot;output&quot;:&quot;roads-buffer.gpkg&quot;}</code></pre><p>This example assumes the input already uses an appropriate projected CRS in meters. A value of 100 in a geographic coordinate system does not mean 100 meters.</p>

## File and result boundaries

<p>Inputs to dataset inspection, fixed spatial tools, and <code>gis_run_algorithm</code> must be inside the current workspace. GeoJSON, GeoPackage, Shapefile, and GeoTIFF can be inspected; individual algorithms also require the appropriate layer type. These controlled entry points reject external paths, URLs, database URIs, VRT, SQL, scripts, and arbitrary expressions. The next section describes execution boundaries for task Python.</p><p>Outputs accept plain GeoJSON or GeoPackage filenames and are written to <code>.tunmo-gis/&lt;executionId&gt;/</code> without overwriting existing user files. Results of ≤16 MiB also provide an Artifact reference; larger files retain a workspace-relative path. Only a successful terminal state counts as a completed result. Forced termination may leave partial files.</p><p>The five legacy names qgis_process_status/list/help/run and qgis_native_buffer remain as compatibility aliases, but use the new worker parameters and result boundaries.</p>

## Run task scripts in the current session

<p><code>gis_execute_python</code> accepts a <code>script</code> path to a UTF-8 <code>.py</code> file in the workspace and an optional JSON object, <code>params</code>. The script defines <code>run(context, params)</code> and uses PyQGIS, GDAL, or Processing already available in the currently bound runtime. Each call reads a fresh script snapshot, so you can edit and rerun it in the current session.</p><p><code>context</code> provides the workspace, input path validation, a separate output directory, progress reporting, and cancellation. The script returns a JSON object and declares GeoJSON or GeoPackage artifacts from the current execution directory in <code>outputs</code>. Scripts are limited to 256 KiB, parameters to 64 KiB, and execution to 15 minutes.</p><p>Ordinary Python runs with the current user's permissions. The path checks provided by context do not sandbox the entire interpreter's file or network access. Run only authorized tasks and keep the shared runtime read-only. Older plugins must first be updated through module management and load the new tools once; subsequent task script changes require neither reinstalling the extension nor restarting the session.</p>

## Sources

- `docs/optional-module-management.md`
- `optional-extensions/qgis/extension.json`
- `optional-extensions/qgis/tools.mjs`
- `optional-extensions/qgis/README.md`
- `optional-extensions/qgis/skills/qgis-runtime/references/extend-runtime.md`
