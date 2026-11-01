# Architecture and compatibility review

Reviewed against `08d7890`, using the requested Vite Plus/pnpm migration, dependency updates, Node 26, and Elgato SDK 3 upgrade as the specification.

## Standards

Two confirmed migration findings were fixed:

- The initial review incorrectly recommended replacing the inspector registration UUID with the action context. Live Stream Deck testing exposed that regression: inspector commands must use the registration UUID for both action and global settings, as the official SDPI Components client does. The client now uses that ID and includes the action identifier. Protocol tests cover registration, settings, request correlation, timeouts, and subscription disposal.
- The release workflow and contributor instructions still used Bun. Both now use the pinned pnpm and Node versions.

One review question concerned replies after switching inspectors. The SDK's `sendToPropertyInspector` targets the current inspector, so the server deliberately checks the action ID before replying. This prevents a delayed service operation from sending its result to another action. The abandoned client's request expires after ten seconds.

## Spec

Live inspector testing corrected the original review finding: inspector commands must use the inspector registration UUID. The host translates this to the action context in events delivered to the plugin. The packaged-plugin smoke test exercises SDK 3 registration, action settings updates, and checkpoint requests against a mock Stream Deck host.

The SDK upgrade raises the minimum supported Stream Deck version to 7.1. Action UUIDs, profile files, persisted settings schemas, and the DIM WebSocket protocol remain unchanged. The CommonJS entry point, CanvasKit WASM, and clipboard fallback files remain in the installable package. Mantine 9's renamed props are migrated, and its v8 color resolver preserves the existing light-variant colors.

## Existing lifecycle bugs fixed

Each fix has a regression test that failed before the change:

- `Watcher.start` added another listener for an existing action ID, leaving the previous listener unreachable. It now removes that listener before replacing it.
- Farming Mode stored one listener on a singleton shared by every button. Removing the first button could unsubscribe the second button and retain the first. It now uses the existing per-action Watcher.
- `GridHelper.destroy` removed every listener before emitting `close`. It now emits before removing listeners, allowing owners to clean up.

Packaging also excludes local `state.json`, image caches, and logs. The pnpm store and generated dependency assets are ignored by Git.

## Follow-up priorities

1. **High: global TLS verification bypass.** `plugin/src/main.ts` sets `NODE_TLS_REJECT_UNAUTHORIZED=0`, affecting every HTTPS request. Remove the process-wide setting after verifying the checkpoint service's certificate requirements. If a private CA is required, configure that trust only for the relevant service. This migration preserves the existing network behavior; it does not resolve this security issue.
2. **Fixed: startup depended on checkpoint networking.** The plugin now connects to Stream Deck before loading checkpoint definitions. The definitions request has a five-second timeout, including response body consumption. Inspector requests wait for the load to settle, and checkpoint buttons refresh afterward. A packaged-plugin regression test stalls the fetch and verifies registration and unrelated action settings still work; a unit test covers definitions arriving after an inspector request.
3. **Fixed: image ownership was unbounded.** Downloaded image bytes now use a 32 MiB LRU cache with shared pending requests. Each icon render owns its native images and canvas and releases them in `finally`. Repeated inventory changes still need a live memory check on Stream Deck.
4. **Architecture: imports start services.** Importing the DIM API transitively starts the HTTP/WebSocket server and persistence timers. Move startup and shutdown into explicit functions called by the plugin entry point. Keep the message transport separate from state and action registration so tests can instantiate them without starting the process.

## Verification and limits

Startup follow-up: all 11 regression tests pass, the plugin bundle builds, and `pnpm --filter plugin exec tsc --noEmit` passes. The current workspace build stops in the locally changed `tsrs` typecheck at `plugin/src/dim/api.ts:8` with TS7031; that compiler migration is outside this fix. Lint completes with existing warnings. The results below describe the original migration review.

- Production builds and type checks pass under Node 26.13.0.
- Nine regression tests pass, including a packaged-plugin test in a temporary directory with external services blocked.
- Vite Plus lint reports warnings in existing code, with no errors. These are not suppressed.
- Elgato validates the package with one existing warning: the Tile icon lacks an `@2x` variant.
- pnpm reports Vite peer-version warnings because the Vite Plus core alias has version 1.4.0 while exposing Vite 8.3.5. Production builds and the bundled test runner pass.
- The rebuilt property inspector was verified in the running Stream Deck app: registration and both settings requests receive replies, and controls render. Hardware actions, live DIM/checkpoint integrations, Windows service installation, and clipboard behavior on Windows still need manual testing. The smoke test does not prove those integrations work.

Standards: two confirmed findings fixed, one design question resolved. Spec: one confirmed finding fixed. Three pre-existing lifecycle bugs fixed with regression coverage.

## Performance and caching follow-up

- Removed the unused second persistent cache, leaving one writer for `cache.json.br`.
- Shared pending image downloads and bounded retained encoded bytes to 32 MiB. Failed requests remain retryable.
- Removed duplicate Pull Item and Character initialization updates.
- Made Pull Item's loader use the renderer's cache key, including all visual inputs. Existing item entries are regenerated once under the new key.
- Released native canvases and images after successful and failed renders. Rendered PNGs remain cached; encoded bytes are reused across visual variants. Decoding on a rendered-image cache miss is the tradeoff for simple, bounded ownership.

Manual checks after rebuilding and restarting the plugin:

1. Open a profile with Pull Item and Character buttons. Check that icons appear correctly and revisiting the profile does not flash item loaders when images are cached.
2. Equip and unequip items with grayscale enabled and disabled. Check crafted/exotic borders, elements, overlays, tier marks, and the equipped indicator.
3. Page through the picker, then revisit pages. Check loadout, artifact, character, and enabled/disabled checkpoint icons as well.
4. Disconnect and reconnect the network while opening an uncached icon. Check that a subsequent update can load it after connectivity returns.
5. Leave the plugin running beyond ten minutes, then restart it. Check that cached icons return and logs show one cache-save event per interval, without decompression errors.
6. Repeatedly browse different inventory pages and profiles while watching the plugin process in Activity Monitor. Allow warm-up; memory should settle rather than grow continuously for the same workload. Allocators may retain freed WASM memory, so immediate RSS drops are not expected.
