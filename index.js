import staticAdapter from "@sveltejs/adapter-static"
import { execSync } from "child_process"
import { join, resolve } from "path"
import { writeFileSync } from "fs"
import chalk from "chalk"

/**
 * @typedef {{
 *     "name"?: string,
 *     "applicationId"?: string,
 *     "icon"?: string,
 *     "port"?: number,
 *     "window"?: {
 *         "width"?: number,
 *         "height"?: number,
 *         "minWidth"?: number,
 *         "minHeight"?: number,
 *         "resizable"?: boolean,
 *         "maximize"?: boolean
 *     },
 *     "output"?: string;
 *     "versions": {
 *         "client": string,
 *         "binary": string
 *     }
 * }} AdapterOptions
 */

/** @type {AdapterOptions} */
const defaultOptions = {
    name: "Svelte Kit",
    applicationId: "dev.svelte.kit",
    port: 8001,
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
    versions: {
        client: "3.1.0",
        binary: "4.2.0",
    },
}

const cliVersion = "^9.1.1"

/**
 * @param {AdapterOptions} options
 */
export default function (options = defaultOptions) {
    return {
        name: "@macfja/svelte-adapter-neutralino",

        async adapt(builder) {
            options = { ...defaultOptions, ...options }
            options.window = { ...defaultOptions.window, ...options.window }
            options.versions = { ...defaultOptions.versions, ...options.versions }
            console.log(
                chalk.bgCyan(" INFO ") +
                    " Using Neutralinojs with version:" +
                    ("\n\t- Client: " + chalk.gray(options.versions.client)) +
                    ("\n\t- Binary: " + chalk.gray(options.versions.binary)) +
                    ("\n\t- CLI: " + chalk.gray(cliVersion))
            )

            const tmpPath = builder.getBuildDirectory("neutralino")
            builder.rimraf(tmpPath)
            builder.mkdirp(join(tmpPath, "build"))

            writeFileSync(
                join(tmpPath, "neutralino.config.json"),
                JSON.stringify({
                    applicationId: options.applicationId,
                    defaultMode: "window",
                    port: options.port,
                    url: "/",
                    documentRoot: "build/",
                    enableServer: true,
                    enableNativeAPI: true,
                    logging: {
                        enabled: true,
                        writeToLogFile: true,
                    },
                    nativeBlockList: [],
                    modes: {
                        window: {
                            title: options.name,
                            width: options.window.width,
                            height: options.window.height,
                            minWidth: options.window.minWidth,
                            minHeight: options.window.minHeight,
                            fullScreen: false,
                            alwaysOnTop: false,
                            icon: "/build/" + options.icon,
                            enableInspector: false,
                            borderless: false,
                            maximize: options.window.maximize,
                            hidden: false,
                            resizable: options.window.resizable,
                            exitProcessOnClose: true,
                        },
                    },
                    cli: {
                        binaryName: options.name,
                        resourcesPath: "/build/",
                        extensionsPath: "/",
                        clientLibrary: "/build/neutralino.js",
                        binaryVersion: options.versions.binary,
                        clientVersion: options.versions.client,
                    },
                })
            )

            console.log(chalk.bgYellow(" Building ") + " Generating static build")
            const adapter = new staticAdapter({ pages: join(tmpPath, "build") })
            await adapter.adapt(builder)

            console.log(chalk.bgYellow(" Building ") + " Downloading Neutralinojs dependencies")
            execSync('npx --quiet "@neutralinojs/neu@' + cliVersion + '" update', { cwd: tmpPath })
            console.log(chalk.bgYellow(" Building ") + " Generating Neutralinojs release")
            execSync('npx --quiet "@neutralinojs/neu@' + cliVersion + '" build --release', { cwd: tmpPath })

            console.log(chalk.bgYellow(" Building ") + " Finalising...")
            builder.mkdirp(options.output)
            builder.copy(join(tmpPath, "dist") + "/.", options.output)

            console.log(
                chalk.bgGreen(" Success ") + " Application is available in " + chalk.cyan(resolve(options.output))
            )
        },
    }
}
