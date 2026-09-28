# Browser interaction

Open pages, inspect interactive snapshots, click, fill forms, and capture screenshots with local or attached browsers.

## Browser tools and page reading

<p>The browser tools come from project-local <code>pi-agent-browser-native</code> and <code>agent-browser</code> dependencies. At startup, the Agent loads the native Pi extension and command from the current installation; no global installation is needed. <code>agent_browser</code> opens pages, captures interactive snapshots, clicks, fills forms, and takes screenshots. <code>agent_browser_code</code> handles loops and branches, while <code>agent_browser_tools</code> lists and enables specialized tools.</p><pre><code class="language-json">{"args":["open","https://example.com"]}
{"args":["snapshot","-i"]}</code></pre><p>These are tool argument examples for model-driven prompts, not RPC commands to write directly to stdin. <a href="web-access.md">web_read</a> extracts page text without running JavaScript or interacting with the page.</p>

## First local browser use

<p>When a tool first needs a local browser, the Agent checks for Chrome. If Chrome is absent and the session allows network access, it downloads Chrome for Testing automatically and checks again. An existing Chrome installation is used directly. Concurrent sessions wait for the same installation. The client can display checking, download, wait, completion, and failure states from native Pi <code>extension_ui_request</code> <code>setStatus</code> / <code>notify</code> events. During download it receives elapsed wait time; the upstream installer does not provide a reliable byte percentage.</p><p><code>--offline</code> prevents the automatic download and returns a clear error if Chrome is missing; it is not an operating-system network sandbox for browser page traffic. Linux ARM64 has no corresponding Chrome for Testing package, so install system Chromium in advance. If download fails, check network access and disk space, then retry the tool call.</p>

## Attach to an existing browser

<p>If the client has created a browser with a Chrome DevTools Protocol (CDP) endpoint, set <code>AGENT_BROWSER_CDP</code> in the Agent process environment or use <code>agent_browser</code> with <code>connect &lt;port&gt;</code> / <code>--cdp &lt;port&gt;</code>. Subsequent calls reuse the attached session and skip the local Chrome installation check. The client enables CDP, limits endpoint access, and owns the browser it created. A CDP endpoint grants full browser control; expose it only to trusted processes.</p><p>Without an existing attachment, <code>agent-browser</code> starts a separate headless managed browser by default; it does not control the user’s open browser window. To observe a new window, set <code>AGENT_BROWSER_HEADED=1</code> before the first launch, or use <code>--headed</code> with <code>sessionMode: fresh</code> in the first tool call. An existing headless session does not become visible automatically. Agent tool support does not imply that a particular client already provides a browser view or controls.</p>

## How clients integrate

<p>Clients use the existing Pi JSONL RPC; no extra <code>tunmo.*</code> browser command is needed. Start one Agent process per task, wait for <code>tunmo-agent ready</code> in an <code>extension_ui_request / notify</code> event, then send an ordinary <code>prompt</code>:</p><pre><code class="language-json">{"id":"browser-task-1","type":"prompt","message":"Open https://example.com in the browser and capture an interactive snapshot."}</code></pre><p>Read <code>tool_execution_start</code>, <code>tool_execution_update</code>, <code>tool_execution_end</code>, and <code>agent_end</code> as JSONL events. Use <code>toolName</code> to identify browser tools and read text, images, or artifacts from the result. In <code>extension_ui_request</code>, <code>setStatus</code> with <code>statusKey: tunmo.browser.setup</code> displays or clears setup progress; <code>notify</code> reports completion and errors. stderr contains diagnostics only.</p><p>If the client creates a dedicated browser window, enable its CDP endpoint before starting the Agent and pass it in <code>AGENT_BROWSER_CDP</code>. The client owns the window display and lifecycle. The current RPC lets the Agent call tools while processing a prompt; a client cannot send a direct <code>type: agent_browser</code> command. For deterministic address bars, buttons, or live views, the client should control its own window and provide the UI.</p>

## Search credentials and validation scope

<p>Opening pages, snapshots, clicks, form fills, and screenshots do not require an Exa or Brave Search API key. The extension’s <code>agent_browser_web_search</code> is a separate optional tool enabled only when its credentials are configured. Tunmo’s <code>web_search</code> continues to use its own <a href="web-access.md">Web Access</a> configuration.</p><p><code>pnpm test:offline</code> covers local extension registration, command calls, and browser setup with controlled fixtures. It does not validate a live site, an actual Chrome download, or a specific client’s CDP integration. The full offline suite passed on macOS ARM64 and Windows ARM64 with Node 24.0.0, 24.21.0, 25.9.0, and 26.10.0 on 2026-09-28. Future untested Node versions still require separate validation.</p>

## Sources

- `package.json`
- `src/browser-extension.mjs`
- `src/browser-integration.ts`
- `src/browser-setup.ts`
- `src/launcher.ts`
- `test/rpc/browser-native.integration.test.mjs`
- `test/rpc/browser-setup.test.ts`
- `docs/browser-automation.md`
