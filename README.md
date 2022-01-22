# Svelte Adapter for Neutralino

A SvelteKit adapter to generate a [Neutralinojs](https://neutralino.js.org/) application

## Installation

```
npm install --save-dev @macfja/svelte-adapter-neutralino
```

## Usage

```javascript
// svelte.config.js
import adapter from "@macfja/svelte-adapter-neutralino"

export default {
    kit: {
        adapter: adapter({
            // default options are shown
            name: "Svelte Kit",
            applicationId: "dev.svelte.kit",
            icon: "favicon.png",
            window: {
                width: 800,
                height: 500,
                minWidth: 400,
                minHeight: 200,
                resizable: true,
                maximize: false,
            },
            output: "build",
            verions: {
                client: "3.1.0",
                binary: "4.2.0",
            },
        }),
    },
}
```

## Contributing

Contributions are welcome. Please open up an issue or create PR if you would like to help out.

Read more in the [Contributing file](CONTRIBUTING.md)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
