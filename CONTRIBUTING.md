# Contributing

First, thank you for contributing to DIM Stream Deck!

> Outdated (to be updated after the conversion to Rust)

## Developer Quick start

1. [Install Pre-requisites](#pre-requisites)
2. [Clone](#clone-the-repo)
3. [Install the streamdeck cli](#install-the-stream-deck-cli)
4. [Run and Develop](#run-and-develop)
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

More detailed information on these steps
is [here](https://docs.github.com/en/get-started/quickstart/contributing-to-projects).

### Install the stream-deck cli

This CLI will simplify your development

* Run `npm i -g @elgato/cli`

### Run and Develop

Enter the `./plugin/com.dim.streamdeck` directory and

* Run `streamdeck link`
  > this will link your local project to the Elgato's plugins directory to live develop the plugin (symlink)
* Run `streamdeck dev`

You're ready, you can now test your changes using only `cd .. && pnpm dev`.

### Build

* Run `pnpm build`
