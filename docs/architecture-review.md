# Architecture and compatibility review

Reviewed against `08d7890`, using the requested Vite Plus/pnpm migration, dependency updates, Node 26, and Elgato SDK 3 upgrade as the specification.

## Standards

Two confirmed migration findings were fixed:

- Inspector requests used the registration UUID rather than the action context and omitted the action identifier on settings commands. The client now sends the documented command shape. Protocol tests cover registration, settings, request correlation, timeouts, and subscription disposal.
- The release workflow and contributor instructions still used Bun. Both now use the pinned pnpm and Node versions.

One review question concerned replies after switching inspectors. The SDK's `sendToPropertyInspector` targets the current inspector, so the server deliberately checks the action ID before replying. This prevents a delayed service operation from sending its result to another action. The abandoned client's request expires after ten seconds.

## Spec

One confirmed migration finding was fixed, also found by the standards review: action-scoped messages must use `actionInfo.context`. The packaged-plugin smoke test exercises SDK 3 registration, action settings updates, and checkpoint requests against a mock Stream Deck host.

The SDK upgrade raises the minimum supported Stream Deck version to 7.1. Action UUIDs, profile files, persisted settings schemas, and the DIM WebSocket protocol remain unchanged. The CommonJS entry point, CanvasKit WASM, and clipboard fallback files remain in the installable package. Mantine 9's renamed props are migrated, and its v8 color resolver preserves the existing light-variant colors.

## Existing lifecycle bugs fixed

Each fix has a regression test that failed before the change:

- `Watcher.start` added another listener for an existing action ID, leaving the previous listener unreachable. It now removes that listener before replacing it.
- Farming Mode stored one listener on a singleton shared by every button. Removing the first button could unsubscribe the second button and retain the first. It now uses the existing per-action Watcher.
- `GridHelper.destroy` removed every listener before emitting `close`. It now emits before removing listeners, allowing owners to clean up.

Packaging also excludes local `state.json`, image caches, and logs. The pnpm store and generated dependency assets are ignored by Git.

## Follow-up priorities

1. **High: global TLS verification bypass.** `plugin/src/main.ts` sets `NODE_TLS_REJECT_UNAUTHORIZED=0`, affecting every HTTPS request. Remove the process-wide setting after verifying the checkpoint service's certificate requirements. If a private CA is required, configure that trust only for the relevant service. This migration preserves the existing network behavior; it does not resolve this security issue.
2. **Medium: startup depends on checkpoint networking.** `plugin/src/plugin.ts` waits for `loadActivities()` before connecting to Stream Deck, and that fetch has no timeout. A stalled service can prevent unrelated actions from connecting. Connect first and load checkpoint data independently, with an explicit readiness state and a bounded timeout.
3. **Medium: image ownership is unbounded.** `plugin/src/util/canvas.ts` keeps CanvasKit images in a module-level map without eviction or disposal. Define who owns each native image before introducing eviction, then verify memory use while repeatedly changing inventories.
4. **Architecture: imports start services.** Importing the DIM API transitively starts the HTTP/WebSocket server and persistence timers. Move startup and shutdown into explicit functions called by the plugin entry point. Keep the message transport separate from state and action registration so tests can instantiate them without starting the process.

## Verification and limits

- Production builds and type checks pass under Node 26.13.0.
- Eight regression tests pass, including a packaged-plugin test in a temporary directory with external services blocked.
- Vite Plus lint reports warnings in existing code, with no errors. These are not suppressed.
- Elgato validates the package with one existing warning: the Tile icon lacks an `@2x` variant.
- pnpm reports Vite peer-version warnings because the Vite Plus core alias has version 1.4.0 while exposing Vite 8.3.5. Production builds and the bundled test runner pass.
- Actual Stream Deck hardware, live DIM/checkpoint integrations, Windows service installation, and clipboard behavior on Windows still need manual testing. The smoke test does not prove those integrations work.

Standards: two confirmed findings fixed, one design question resolved. Spec: one confirmed finding fixed. Three pre-existing lifecycle bugs fixed with regression coverage.
