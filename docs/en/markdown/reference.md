# Versions, scope, and maintenance

Use the current source checkout as the authority, distinguishing implemented capabilities, release configuration, and historical verification records.

## Documentation baseline

<p>Source review date: 2026-09-20. The documentation was first organized on 2026-09-17. This revision updates the main entry points and limitations against the current launcher, configuration, CLI, SDK, extension manifests, and usage contracts. package.json identifies the package as <code>@tunmo/agent 0.0.0</code>, a development package that cannot be published directly to npm. It pins Pi 0.84.1 and pi-goal 0.54.4. The QGIS extension is version 0.4.1, and GeoPandas is version 0.2.0.</p><p>This review does not mean that all functional tests, network verification, runtime downloads, or cross-platform GIS acceptance tests were repeated. Dated release and acceptance records establish only the scope documented at that time. A development version number is not a commitment to a stable release.</p>

## Known scope

<ul><li>QGIS and GeoPandas are both registered in the default module manifest and disabled by default. Their runtimes are installed, enabled, and managed separately.</li><li>Optional extensions come from the private tunmo-plugins Git submodule. Building from source requires read access, or a matching complete release package supplied by a maintainer.</li><li>Runtime availability depends on the actual signed Catalog and plan. The documentation does not promise support for every macOS, Windows, or Linux system.</li><li>An implemented Agent interface does not mean a particular desktop client already provides the corresponding UI / IPC.</li><li>Cloud execution currently offers only an explicitly enabled local mock backend.</li><li>Extensions and task Python code run with the current user's permissions. Module confirmation, path validation, and process supervision do not provide an operating system sandbox.</li></ul>

## Source code and historical records

<p>The end of each page lists its source references, relative to the Agent repository root. Read them in a complete source checkout. References starting with <code>optional-extensions/</code> also require read access to the corresponding private submodule. This site's tool and installation instructions are self-contained; readers do not need access to a developer's local directories or handover records.</p><p>The repository publishes the eight core technical documents at the root of <code>docs/</code>, along with this site's content. Design proposals, source audits, runtime package records, historical handovers, and raw verification evidence remain in categorized directories on maintainers' machines. They are excluded by <code>.gitignore</code> and are not included in this documentation release. Historical conclusions do not replace the current manifests and source code.</p>

## Update the documentation

<p>All site files are in docs/public. Open index.html directly or browse through any static HTTP server. The site has no external fonts, CDN resources, or runtime dependencies.</p><p>content.json and content.en.json maintain the Chinese and English content respectively. Page IDs, section IDs, order, and source references must match between the two files. After editing them, run:</p><pre><code class="language-bash">node docs/public/build.mjs</code></pre><p>This generates 14 standalone HTML pages per language, with separate full-text search indexes and Markdown copies. Chinese pages are at the site root and English pages are under en/. The language control in the header switches the current page while preserving its section anchor. Styles and interactions are maintained in assets/styles.css and assets/app.js. See README.md in the same directory for maintenance instructions. When tools, configuration, or platform support change, review the corresponding source code instead of relying solely on old handover records.</p>

## Sources

- `package.json`
- `resources/optional-modules.json`
- `.gitmodules`
- `.github/actions/checkout-plugins/action.yml`
- `optional-extensions/qgis/extension.json`
- `optional-extensions/geopandas/extension.json`
