# Welcome to Tunmo Agent

Connect models, tools, and geospatial workflows. Explore what Tunmo Agent can do and start your first session.

## Meet Tunmo Agent

<p>Tunmo Agent is a Node.js / TypeScript Agent process built on Pi. It provides native JSONL RPC, tool extensions, and managed runtimes for clients. The client handles interaction and task scheduling; the Agent handles sessions, tool execution, and resource lifecycles.</p><p>You can ask the Agent to research information, read web pages, and keep working toward a goal. You can also install GIS modules as needed to process geospatial data in your project.</p>

## Start here

<div class="cards"><a href="quickstart.md"><span>01 / GET STARTED</span><h3>Start your first session ↗</h3><p>Set up your environment, start the process, and send your first message.</p></a><a href="web-access.md"><span>02 / CAPABILITIES</span><h3>Explore built-in capabilities ↗</h3><p>Web search, Goal mode, and reusable Skills.</p></a><a href="modules.md"><span>03 / GEOSPATIAL</span><h3>Enable GIS modules ↗</h3><p>Learn about installation confirmation, available tools, and data output.</p></a><a href="rpc.md"><span>04 / DEVELOPERS</span><h3>Connect your client ↗</h3><p>Use native RPC and the separate management interface.</p></a></div>

## Capabilities and availability

<ul><li><strong>Core sessions:</strong> Each task has its own Agent process, using native Pi messages and tool events.</li><li><strong>Built-in capabilities:</strong> Web Search, Web Read, Goal mode, and the tunmo-agent / skill-creator Skills.</li><li><strong>Optional capabilities:</strong> QGIS and GeoPandas tools have separate source code and runtimes. Whether they can be installed also depends on the current release configuration and platform.</li><li><strong>Extension development:</strong> Manifest-driven registration, shared runtimes, artifact storage, and execution control.</li></ul><aside class="note"><strong>Usage note</strong><p>The default module catalog includes QGIS and GeoPandas. Both are disabled by default; installation must be confirmed and the module enabled separately for each one. See “GeoPandas” and “Version and scope” for the detailed boundaries. Cloud execution currently has only a local simulation backend that must be explicitly enabled.</p></aside><p>Using optional modules from source requires read access to the private <code>tunmo-plugins</code> repository, or a complete release package from the maintainers that matches your Agent version. Public documentation and the main repository's source code do not mean that all optional resources are public. See <a href="quickstart.md">Quickstart</a> for setup instructions.</p>

## Choose your reading path

<p><strong>Users:</strong> Start with Quickstart, then learn about the inputs and outputs of web access, Goal mode, and GIS. This documentation describes Agent capabilities; it does not assume that your client already has buttons for them.</p><p><strong>Client developers:</strong> Focus on sessions and RPC, configuration, module management, and troubleshooting. The client is responsible for confirming module installations and creating new sessions.</p><p><strong>Extension developers:</strong> Start with extensions and the SDK, then shared runtimes. Use the complete examples in the repository.</p>

## Sources

- `README.md`
- `package.json`
- `resources/optional-modules.json`
- `docs/architecture.md`
