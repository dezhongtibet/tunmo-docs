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

## Sources

- `skills/skill-creator/scripts/create-skill.mjs`
- `skills/skill-creator/scripts/validate-skill.mjs`
- `src/launcher.ts`
- `docs/skill-creator-design.md`
- `sdk/README.md`
