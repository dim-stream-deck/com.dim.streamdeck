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
* Install [NodeJS](https://nodejs.org/).
* Install [pnpm](https://pnpm.io/installation).

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

* Run `npm i -g @elgato/cli`

### Develop

Enter the `./plugin/com.dim.streamdeck.sdPlugin` directory and

* run `streamdeck link`
* run `streamdeck dev`

You're ready, you can now test your changes using only `cd ../.. && pnpm dev`.

Usually actions on the plugin have a relative code also on [DIM](https://github.com/DestinyItemManager/DIM), follow their [contributing guidelines](https://github.com/DestinyItemManager/DIM/blob/master/docs/CONTRIBUTING.md) to setup your local instance.

### Build

This step will build the plugin and generate the .streamDeckPackage file.

* Run `pnpm build` (from the root)
