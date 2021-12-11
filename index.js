import staticAdapter from "@sveltejs/adapter-static"
import { execSync, spawnSync } from "child_process"
import { join, resolve } from "path"
import { writeFileSync } from "fs"
import chalk from "chalk"

/**
 * @typedef {{
 *     "name"?: string,
 *     "applicationId"?: string,
 *     "icon"?: string,
 *     "window"?: {
 *         "width"?: number,
 *         "height"?: number,
 *         "minWidth"?: number,
 *         "minHeight"?: number,
 *         "resizable"?: boolean,
 *         "maximize"?: boolean
 *     },
 *     "output"?: string
 * }} AdapterOptions
 */

/** @type {AdapterOptions} */
const defaultOptions = {
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
}

/**
 * @param {AdapterOptions} options
 */
export default function (options = defaultOptions) {
    return {
        name: "@macfja/svelte-adapter-neutralino",

        async adapt(builder) {
            options = { ...defaultOptions, ...options }
            options.window = { ...defaultOptions.window, ...options.window }
            console.log(
                chalk.bgCyan(" INFO ") +
                    " Using Neutralinojs with version:" +
                    ("\n\t- Client: " + chalk.gray("3.0.0")) +
                    ("\n\t- Binary: " + chalk.gray("4.0.0")) +
                    ("\n\t- CLI: " + chalk.gray("^8.0"))
            )

            const tmpPath = join(".svelte-kit", "neutralino")
            spawnSync("rm", ["-rf", tmpPath])
            spawnSync("mkdir", ["-p", join(tmpPath, "build")])

            writeFileSync(
                join(tmpPath, "neutralino.config.json"),
                JSON.stringify({
                    applicationId: options.applicationId,
                    defaultMode: "window",
                    port: 8080,
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
                        binaryVersion: "4.0.0",
                        clientVersion: "3.0.0",
                    },
                })
            )

            console.log(chalk.bgYellow(" Building ") + " Generating static build")
            const adapter = new staticAdapter({ pages: join(tmpPath, "build") })
            await adapter.adapt(builder)

            console.log(chalk.bgYellow(" Building ") + " Downloading Neutralinojs dependencies")
            execSync('npx --quiet "@neutralinojs/neu@^8.0" update', { cwd: tmpPath })
            console.log(chalk.bgYellow(" Building ") + " Generating Neutralinojs release")
            execSync('npx --quiet "@neutralinojs/neu@^8.0" build --release', { cwd: tmpPath })

            console.log(chalk.bgYellow(" Building ") + " Finalising...")
            spawnSync("mkdir", ["-p", options.output])
            spawnSync("cp", ["-r", join(tmpPath, "dist") + "/.", options.output])

            console.log(
                chalk.bgGreen(" Success ") + " Application is available in " + chalk.cyan(resolve(options.output))
            )
        },
    }
}
