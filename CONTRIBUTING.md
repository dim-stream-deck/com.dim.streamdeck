# Contributing

First, thank you for contributing to **DIM Stream Deck**!

## Developer Quick start

1. [Install Pre-requisites](#pre-requisites)
2. [Clone](#clone-the-repo)
3. [Install the streamdeck cli](#install-the-cli)
4. [Develop](#develop)
5. [Build](#build)

### Pre-requisites

* Install [Git](https://git-scm.com/downloads).
* Install [Node.js](https://nodejs.org/) 26.13.0, pinned in `.node-version`.
* Install [pnpm](https://pnpm.io/) 12.16.1.
* Install Stream Deck 7.1 or newer. The plugin uses Node.js 26 and Elgato SDK 3.

### Clone the repo

To work with this plugin you can simply clone the code repository:

```sh
git clone https://github.com/dim-stream-deck/com.dim.streamdeck
```

To **contribute changes to the project**, you'll want to:

1. Fork DIM Stream Deck to make your own copy of the repository
2. Edit the local files
3. Commit and push your code changes to your fork
4. Create a Pull Request

More detailed information on these steps are [here](https://docs.github.com/en/get-started/quickstart/contributing-to-projects).

### Install the cli

This CLI is required to develop plugins for the Elgato Stream Deck.

* Run `pnpm install --frozen-lockfile` from the repository root.
* The workspace includes the Stream Deck CLI; use `pnpm --filter plugin exec streamdeck`.

### Develop

From the repository root:

* run `pnpm --filter plugin run link`
* run `pnpm --filter plugin exec streamdeck dev`

You're ready, you can now test your changes using only `pnpm run dev`.

Usually actions on the plugin have a relative code also on [DIM](https://github.com/DestinyItemManager/DIM), follow their [contributing guidelines](https://github.com/DestinyItemManager/DIM/blob/master/docs/CONTRIBUTING.md) to setup your local instance.

### Build

Both workspaces build with Vite Plus. The plugin bundle stays CommonJS at `bin/plugin.js`; the property inspector uses relative asset URLs in `pi/`.

* Run `pnpm run build` to type-check and build both workspaces.
* Run `pnpm run test` for the regression suite.
* Run `pnpm run lint` for the quality checks. Existing warnings are tracked separately from migration failures.
* Run `pnpm run pack` to build and generate `plugin/com.dim.streamdeck.streamDeckPlugin`.

The release workflow also downloads the Windows solo-mode and macro executables. Local packaging requires those same files in `solo-mode/` and `macro/` inside the `.sdPlugin` directory.

The plugin build reads its existing `.env` values and copies CanvasKit WASM and clipboard executables using package resolution, which works with pnpm. Never commit `.env` files or generated bundles containing deployment credentials.

The inspector communicates through `property-inspector/src/streamdeck.ts` because Elgato removed the browser SDK export in version 2. Plugin requests are handled in `plugin/src/ui.ts`. Preserve action IDs, saved settings, and the DIM WebSocket protocol when changing these boundaries.
