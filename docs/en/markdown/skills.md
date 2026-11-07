# Skills and knowledge reuse

Organize repeatable workflows into discoverable, maintainable Skill Directories.

## What a Skill does

<p>A Skill provides task instructions, steps, and supporting resources; tools perform the actual operations. The built-in <code>tunmo-agent</code> Skill guides the Agent in using project capabilities, while <code>skill-creator</code> helps create a standard Skill directory.</p><p>Use the native <code>get_commands</code> command to find <code>skill:*</code> entries. User resources follow Pi's discovery mechanism for project and user directories.</p>

## Create a Skill

<p>Run the following from the repository's <code>skills/skill-creator</code> directory:</p><pre><code class="language-bash">node scripts/create-skill.mjs \
  --name release-notes \
  --description &quot;Creates release notes from verified changes. Use for release note requests.&quot; \
  --when &quot;A verified change list is available.&quot; \
  --step &quot;Group changes by user impact and write release notes.&quot; \
  --constraint &quot;Do not invent changes or compatibility claims.&quot; \
  --output ./generated-skills

node scripts/validate-skill.mjs ./generated-skills/release-notes</code></pre><p>The generator uses Node's built-in modules and requires no network access. Names must use lowercase kebab-case. The references, scripts, and assets directories are created only when actual files are supplied.</p><p>The validator checks the directory structure, referenced paths, and some patterns associated with sensitive content. It does not execute scripts and is neither a security sandbox for arbitrary code nor a complete YAML syntax validator. Before running supporting scripts, make sure you understand what they do.</p>

## Install and verify

<p>Place the complete, validated directory in <code>~/.tunmo/agent/skills/</code>, restart the Agent, and check for <code>skill:release-notes</code>. Copy the files referenced by SKILL.md along with SKILL.md itself.</p>

## Skills bundled with extensions

<p>Starting with Host 0.1.4, extensions can declare bundled Skills in their manifests. When an extension is installed, enabled, and has its dependencies ready, new sessions automatically load the Skill for the selected extension version.</p><p><code>qgis-runtime</code> and <code>geopandas-runtime</code> explain how to use the existing tools and task scripts. A Skill does not register tools itself: <code>gis_execute_python</code> and <code>geopandas_execute_python</code> come from their respective extension versions. Loading a Skill does not expand QGIS's controlled algorithm allowlist.</p><p>Disabling a module revokes tool execution, but any Skill content already loaded in an existing session remains in its context. New sessions refresh the list. Older plugin installations must first be updated through module management and load the new tools once; task scripts can then be written or modified within the current session. Do not copy a module's bundled Skill into the global directory, as this would bypass its loading lifecycle.</p>

## Skill load diagnostics

<p>After ready, invoke <code>/tunmo-skills-diagnostics [requestId]</code> through native <code>prompt</code> to read the current session's Pi resource loader. The query makes no model call and adds no session messages.</p><pre><code class="language-json">{&quot;id&quot;:&quot;rpc-diag-1&quot;,&quot;type&quot;:&quot;prompt&quot;,&quot;message&quot;:&quot;/tunmo-skills-diagnostics diag-1&quot;}</code></pre><p>The RPC <code>response</code> only acknowledges command handling. Read the diagnostic envelope from the JSON string in <code>message</code> of an <code>extension_ui_request</code> with <code>method: notify</code>. Match <code>kind: tunmo.skill-diagnostics</code> and requestId, and verify sessionId / cwd. Omitting requestId returns null. A supplied ID uses 1–128 ASCII characters, starts with a letter or digit, and may then contain letters, digits, periods, underscores, colons and hyphens. The parsed notification looks like this:</p><pre><code class="language-json">{
  &quot;schemaVersion&quot;: 1,
  &quot;kind&quot;: &quot;tunmo.skill-diagnostics&quot;,
  &quot;requestId&quot;: &quot;diag-1&quot;,
  &quot;sessionId&quot;: &quot;client-task-001&quot;,
  &quot;cwd&quot;: &quot;/absolute/project&quot;,
  &quot;success&quot;: true,
  &quot;data&quot;: {
    &quot;revision&quot;: 1,
    &quot;status&quot;: &quot;ready&quot;,
    &quot;skills&quot;: [],
    &quot;diagnostics&quot;: [],
    &quot;resolutionDiagnostics&quot;: []
  }
}</code></pre><ul><li><code>skills</code> contains the Skills actually loaded by Pi, including file paths and sourceInfo.</li><li><code>diagnostics</code> contains Pi validation and collisions, including winnerPath / loserPath. A warning may also mean a Skill was skipped; compare with skills instead of treating every warning as a failure.</li><li><code>resolutionDiagnostics</code> adds explicit missing or inaccessible Skill paths from settings / package manifests, missing local packages, packages unavailable offline, and package resolution failures. Entries contain code, type, message, resourceType and optional path, source, scope. Package issues do not imply a Skill name. Source URLs have credentials, queries and fragments removed.</li><li><code>revision</code> increases on reload and old diagnostics are cleared. status is ready / loading / failed. success means the snapshot was read, not that all resources loaded.</li></ul><p>Disabled resources, negative selectors and unmatched globs are not reported as missing. Silent skips in Pi's nested directory / symlink scans and package manifest parsing fallbacks may still lack diagnostics; an empty list does not prove every configured resource is healthy.</p><p>A missing dependency patch returns <code>success: false</code> and <code>error.code: SkillDiagnosticsUnavailable</code>. Invalid IDs return SkillDiagnosticsRequestInvalid; read errors return SkillDiagnosticsReadFailed. Show query errors instead of replacing them with empty arrays. Initial package resolution errors retain the original startup failure behavior and may prevent ready. Consume stderr continuously: each <code>tunmo-agent: skill-resolution </code> line contains a JSON diagnostic. See <code>docs/architecture.md</code> in the repository for the complete contract.</p>

## Sources

- `skills/skill-creator/scripts/create-skill.mjs`
- `skills/skill-creator/scripts/validate-skill.mjs`
- `src/launcher.ts`
- `docs/skill-creator-design.md`
- `sdk/README.md`
- `src/skill-diagnostics.ts`
- `test/rpc/skill-diagnostics.integration.test.mjs`
