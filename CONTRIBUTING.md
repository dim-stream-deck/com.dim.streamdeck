# Contributing

First, thank you for contributing to **DIM Stream Deck**!

## Developer Quick start

1. [Install Pre-requisites](#pre-requisites)
2. [Clone](#clone-the-repo)
3. [Install the streamdeck cli](#install-the-cli)
4. [Develop](#develop)
5. [Build](#build)

### Pre-requisites

- Install [Git](https://git-scm.com/downloads).
- Install [Node.js](https://nodejs.org/) 26.13.0, pinned in `.node-version`.
- Install [pnpm](https://pnpm.io/) 12.16.1.
- Install Stream Deck 7.1 or newer. The plugin uses Node.js 26 and Elgato SDK 3.

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

- Run `pnpm install --frozen-lockfile` from the repository root.
- The workspace includes the Stream Deck CLI; use `pnpm --filter plugin exec streamdeck`.

### Develop

From the repository root:

- run `pnpm --filter plugin run link`
- run `pnpm --filter plugin exec streamdeck dev`

You're ready, you can now test your changes using only `pnpm run dev`.

Usually actions on the plugin have a relative code also on [DIM](https://github.com/DestinyItemManager/DIM), follow their [contributing guidelines](https://github.com/DestinyItemManager/DIM/blob/master/docs/CONTRIBUTING.md) to setup your local instance.

### Build

Both workspaces build with Vite Plus. The plugin bundle stays CommonJS at `bin/plugin.js`; the property inspector uses relative asset URLs in `pi/`.

- Run `pnpm run build` to type-check and build both workspaces.
- Run `pnpm run test` for the regression suite.
- Run `pnpm run lint` for the quality checks. Existing warnings are tracked separately from migration failures.
- Run `pnpm run pack` to build and generate `plugin/com.dim.streamdeck.streamDeckPlugin`.

The release workflow also downloads the Windows solo-mode and macro executables. Local packaging requires those same files in `solo-mode/` and `macro/` inside the `.sdPlugin` directory.

The publish workflow creates a draft release, uploads the plugin package, then publishes it. Asset upload failures stop publication, and existing releases are not updated. Enable release immutability in the GitHub repository settings to lock published release assets and tags.

The plugin build reads its existing `.env` values and copies CanvasKit WASM and clipboard executables using package resolution, which works with pnpm. Never commit `.env` files or generated bundles containing deployment credentials.

The inspector communicates through `property-inspector/src/streamdeck.ts` because Elgato removed the browser SDK export in version 2. Plugin requests are handled in `plugin/src/ui.ts`. Preserve action IDs, saved settings, and the DIM WebSocket protocol when changing these boundaries.

### DIM connection status

DIM opts into automatic authorization checks using the `dim-status` WebSocket
subprotocol. After loading saved settings, the plugin sends a `connected` action
with the token for that socket's instance, or no token if it is unpaired. It sends
the status again when a connect deep link updates that instance. Older DIM clients
that do not request the subprotocol receive only the existing action messages.

### Pull Item tiles

Pull Item keys use DIM-style tier pips, a power and damage-type strip, and optional
Champion, weapon-frame or armor-stat, season, masterwork, and lock indicators.
DIM supplies these details through item selection and picker results. Existing
saved actions remain compatible; reselect an item in an updated DIM instance to
populate its additional display details, including the crafted versus enhanced
symbol. Older saved crafted items use the standard crafted symbol as a fallback.
The global Appearance setting controls all Pull Item keys and picker item tiles.
DIM style, the default, scales the full square artwork and separate power strip
together, leaving narrow side margins. Fill key uses the full button width and
crops the artwork above the footer. The key retains the existing equipped
indicator and grayscale preference. Subclass keys keep their original display.

### Installed plugin metadata

Read the plugin version from `streamDeck.info.plugin.version`. Stream Deck can
protect the installed `manifest.json` as a binary file, so parsing it as JSON
crashes packaged plugins even when the development folder works. The runtime
tests cover both plain and protected manifests.

### Automatically opening DIM

Every action's property inspector includes an **Automatically open DIM** global
setting. Choose Stable DIM, Beta DIM, or Disabled. When an action needs DIM and
no DIM tab is connected, the plugin opens the selected site's setup page, at most
once every 30 seconds. Stable DIM is the default. Disabled prevents this automatic
opening. DIM may redirect to login if the browser is not signed in.
