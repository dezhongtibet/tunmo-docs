# Web search and page reading

Discover sources, then read their contents. Search summaries and page text are provided by separate tools.

## Search the web

<p><code>web_search</code> accepts a required <code>query</code> and optional <code>maxResults</code> (1–20), and returns titles, URLs, and summaries. The default is 5 results.</p><pre><code class="language-json">{&quot;query&quot;:&quot;QGIS coordinate reference system documentation&quot;,&quot;maxResults&quot;:5}</code></pre><p>This is a tool-argument example, not a command to write directly to RPC. Users describe what they need in a normal prompt; the model chooses and calls the tool.</p>

## Read a web page

<p><code>web_read</code> accepts a <code>url</code> and optional <code>maxChars</code> (minimum 200). It supports HTTP/HTTPS text, HTML, JSON, XML, and similar content. HTML is extracted as readable text; the tool does not execute page JavaScript or provide browser interaction.</p><pre><code class="language-json">{&quot;url&quot;:&quot;https://example.com/&quot;,&quot;maxChars&quot;:12000}</code></pre><p>The default text limit is 40,000 characters, and the default response limit is 5 MiB. Results include the final URL, redirects, status code, byte count, and truncation indicators. Do not treat a truncated result as the full page. Binary formats such as PDFs and images are outside the scope of this reader.</p>

## Configure a search service

<p>SearXNG, Brave, and Tavily are supported. By default, the tool uses the Tunmo SearXNG address configured in the code, with no search API key required. Actual availability still depends on network connectivity and service status.</p><pre><code class="language-json">{
  &quot;tunmo&quot;: {
    &quot;webAccess&quot;: {
      &quot;provider&quot;: &quot;searxng&quot;,
      &quot;searxngUrl&quot;: &quot;https://search.example.com/&quot;,
      &quot;timeoutMs&quot;: 20000,
      &quot;maxBytes&quot;: 5242880,
      &quot;maxResults&quot;: 5
    }
  }
}</code></pre><p>Replace the address with a real SearXNG instance and merge this into your existing settings without overwriting other configuration. Environment variables take precedence over the configuration file. Create a new session after making changes.</p><ul><li><code>TUNMO_WEB_SEARCH_PROVIDER</code>: The provider.</li><li><code>TUNMO_WEB_SEARCH_API_KEY</code>: A shared credential setting that takes precedence over provider-specific variables.</li><li><code>BRAVE_SEARCH_API_KEY</code> / <code>TAVILY_API_KEY</code>: Provider credentials.</li><li><code>TUNMO_WEB_SEARXNG_URL</code>: The instance's base URL, also used for the configured fallback.</li><li><code>TUNMO_WEB_TIMEOUT_MS</code>: 1,000–120,000 milliseconds.</li><li><code>TUNMO_WEB_MAX_BYTES</code>: The web_read response limit (1 KiB–50 MiB); search requests still use the default 5 MiB limit. <code>TUNMO_WEB_MAX_RESULTS</code>: The number of search results (1–20).</li></ul><p>The default SearXNG address in the current code uses HTTP. Deployments that require transport security should configure an accessible HTTPS search endpoint. If Brave / Tavily fails, the tool may fall back to the configured SearXNG instance. Before use, confirm that search terms may be sent to that service. This page documents the configuration contract; it does not claim that any hosted service has been verified as online.</p><p>timeoutMs is the timeout for an individual fetch request. Provider fallback can add to the elapsed time, so it is not an overall deadline for the entire search.</p>

## Access boundaries and troubleshooting

<p>Loopback, private-network, and cloud metadata addresses are rejected by default. <code>TUNMO_WEB_ALLOW_PRIVATE_NETWORK=1</code> is for testing only, not regular configuration. Use <code>/tunmo-web-tools</code> to inspect tool and configuration status. On failure, check the structured details and error type.</p><p>Example prompt: <q>Find the official documentation for projected coordinate systems, read the relevant pages, and include source links.</q></p><p>With <code>PI_OFFLINE=1</code> (or the <code>--offline</code> startup option), Web Access returns <code>Offline</code>. URL, redirect, and DNS address checks define the boundaries of these web tools; they do not provide system-wide network isolation for all extensions and Python scripts.</p><p>The current implementation checks DNS results before fetch establishes a connection. The two operations are not bound to the same IP address, so this must not be described as complete protection against DNS rebinding. DNS lookup is not connected to the cancellation signal, and the tools do not enforce a request rate limit. Timeouts, response size, and result count are separate limits.</p>

## Sources

- `extensions/web-access/tools.ts`
- `extensions/web-access/config.ts`
- `extensions/web-access/fetcher.ts`
- `extensions/web-access/url-guard.ts`
- `docs/web-access-design.md`
