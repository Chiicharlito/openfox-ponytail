# Ponytail for Openfox

Display this reference. One-shot: change no files, settings or mode.

Ponytail activates automatically at **full** when this plugin is enabled.
Select your project, open Settings → Plugins → Ponytail (community), and
set the project level. Openfox persists it across restarts. A change takes
effect on the next model call. Without a project, the default is full.

| Level | Behavior |
|-------|----------|
| lite | Build what was asked. Name the smaller option in one line. |
| full | The smallest complete change, appropriate checks, skipped work and risks. Default. |
| ultra | Also question unjustified parts of the request before building. |
| off | Stop automatic instructions; diagnostic commands remain available. |

| Command | Purpose |
|---------|---------|
| /ponytail | Show this usage guide. |
| /ponytail-review | Review a change and its connected code; report only. |
| /ponytail-audit | Review the whole repository; report only. |
| /ponytail-debt | List shortcut comments; report only. |
| /ponytail-gain | Display upstream benchmark results, not savings measured in Openfox. |
| /ponytail-help | Show this reference. |

The six matching skills are also available through Openfox skill discovery.
Only native settings change the persistent level. `/ponytail ultra`,
`/ponytail off`, "stop ponytail" and other conversational requests do not
write settings. Direct the user to the project level selector instead.
Disable the plugin in Settings → Plugins to remove all its contributions;
enable it again to restore them with the saved project level.

Install this community integration from Settings → Plugins using its local
build directory or its GitHub URL after publication. Updates use Openfox's
plugin management. No separate Ponytail environment variables or flag files
are used. This integration does not claim Ponytail's endorsement.

Upstream: https://github.com/DietrichGebert/ponytail (MIT, version 5.1.0).
