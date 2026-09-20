# 联网搜索与网页读取

先发现资料，再读取正文；搜索摘要和网页内容分别由两个工具提供。

## 搜索互联网

<p><code>web_search</code> 接收必填 <code>query</code> 和可选 <code>maxResults</code>（1–20），返回标题、URL 与摘要。默认 5 条。</p><pre><code class="language-json">{&quot;query&quot;:&quot;QGIS coordinate reference system documentation&quot;,&quot;maxResults&quot;:5}</code></pre><p>这是工具参数示例，不是直接写入 RPC 的命令。用户通过普通 prompt 表达需求，由模型选择并调用工具。</p>

## 读取网页

<p><code>web_read</code> 接收 <code>url</code> 和可选 <code>maxChars</code>（最小 200），支持 HTTP/HTTPS 文本、HTML、JSON、XML 等内容。HTML 提取为正文；不执行网页 JavaScript，也不提供浏览器交互。</p><pre><code class="language-json">{&quot;url&quot;:&quot;https://example.com/&quot;,&quot;maxChars&quot;:12000}</code></pre><p>默认正文字符上限为 40,000，响应默认限制 5 MiB。结果包含最终 URL、重定向、状态码、字节数和截断标记。长页面被截断时不要把结果当成全文；PDF、图片等二进制不在此读取范围内。</p>

## 配置搜索服务

<p>支持 SearXNG、Brave、Tavily。默认使用代码内配置的 Tunmo SearXNG 地址，无需搜索 API Key；实际可用性仍取决于网络和服务状态。</p><pre><code class="language-json">{
  &quot;tunmo&quot;: {
    &quot;webAccess&quot;: {
      &quot;provider&quot;: &quot;searxng&quot;,
      &quot;searxngUrl&quot;: &quot;https://search.example.com/&quot;,
      &quot;timeoutMs&quot;: 20000,
      &quot;maxBytes&quot;: 5242880,
      &quot;maxResults&quot;: 5
    }
  }
}</code></pre><p>将地址换成真实 SearXNG 实例，并合并到现有 settings，不要覆盖其他配置。环境变量优先于配置文件，修改后创建新会话。</p><ul><li><code>TUNMO_WEB_SEARCH_PROVIDER</code>：提供商。</li><li><code>TUNMO_WEB_SEARCH_API_KEY</code>：通用凭据，优先于提供商专用变量。</li><li><code>BRAVE_SEARCH_API_KEY</code> / <code>TAVILY_API_KEY</code>：提供商凭据。</li><li><code>TUNMO_WEB_SEARXNG_URL</code>：实例根地址，也用于已配置的兜底。</li><li><code>TUNMO_WEB_TIMEOUT_MS</code>：1,000–120,000 毫秒。</li><li><code>TUNMO_WEB_MAX_BYTES</code>：web_read 的响应上限（1 KiB–50 MiB）；搜索请求仍使用默认 5 MiB。<code>TUNMO_WEB_MAX_RESULTS</code>：搜索结果条数（1–20）。</li></ul><p>当前代码中的默认 SearXNG 地址使用 HTTP。对传输保护有要求的部署应配置可访问的 HTTPS 搜索端点。Brave / Tavily 失败时可能回退到配置的 SearXNG；使用前确认搜索词可发送到该服务。此页说明配置契约，不表示本次已验证任何托管服务在线。</p><p>timeoutMs 是单次 fetch 请求的超时参数，Provider 回退可能叠加耗时；不能将它当作整次搜索的总截止时间。</p>

## 访问边界与排查

<p>默认拒绝回环、私网与云元数据地址。<code>TUNMO_WEB_ALLOW_PRIVATE_NETWORK=1</code> 仅用于测试，不作为常规配置。通过 <code>/tunmo-web-tools</code> 查看工具和配置状态；失败时读取结构化 details 和错误类型。</p><p>自然语言示例：<q>查找投影坐标系的官方说明，读取相关页面并附上来源链接。</q></p><p><code>PI_OFFLINE=1</code>（或启动 <code>--offline</code>）时，Web Access 返回 <code>Offline</code>。URL、重定向和 DNS 地址检查属于这些联网工具的边界，不是所有扩展和 Python 脚本的系统级网络隔离。</p><p>当前先检查 DNS 解析结果，再由 fetch 建立连接；两者未绑定同一 IP，不能宣称完全防御 DNS rebinding。DNS lookup 未接入取消信号，工具也没有请求频率限流；超时、响应大小和结果条数是不同限制。</p>

## 内容依据

- `extensions/web-access/tools.ts`
- `extensions/web-access/config.ts`
- `extensions/web-access/fetcher.ts`
- `extensions/web-access/url-guard.ts`
- `docs/web-access-design.md`
