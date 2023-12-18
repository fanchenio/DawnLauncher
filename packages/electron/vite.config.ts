import { rmSync, mkdirSync, existsSync, copyFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { type Plugin, defineConfig, normalizePath } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import { notBundle } from 'vite-plugin-electron/plugin'
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
	rmSync('dist-electron', { recursive: true, force: true })
	const isServe = command === 'serve'
	const isBuild = command === 'build'
	const sourcemap = isServe || !!process.env.VSCODE_DEBUG
	return {
		plugins: [
			vue(),
			electron([
				{
					entry: 'electron/main/index.ts',
					onstart({ startup }) {
						if (process.env.VSCODE_DEBUG) {
							console.log('[startup] Electron App')
						} else {
							startup()
						}
					},
					vite: {
						build: {
							sourcemap,
							minify: isBuild,
							outDir: 'dist-electron/main',
							commonjsOptions: {
								ignoreDynamicRequires: true,
							},
							rollupOptions: {
								plugins: [],
								external: [/\.node$/],
							},
						},
						plugins: [isServe && notBundle()],
					},
				},
				{
					entry: 'electron/preload/index.ts',
					onstart({ reload }) {
						reload()
					},
					vite: {
						build: {
							sourcemap: sourcemap ? 'inline' : undefined,
							minify: isBuild,
							outDir: 'dist-electron/preload',
							rollupOptions: {
								external: [],
							},
						},
						plugins: [isServe && notBundle()],
					},
				},
				{
					entry: 'electron/main/worker.ts',
					onstart({ reload }) {
						reload()
					},
					vite: {
						build: {
							sourcemap: sourcemap ? 'inline' : undefined,
							minify: isBuild,
							outDir: 'dist-electron/main',
							commonjsOptions: {
								ignoreDynamicRequires: true,
							},
							rollupOptions: {
								external: [/\.node$/],
							},
						},
						plugins: [isServe && notBundle()],
					},
				},
			]),
			bindingSqlite3(),
		],
		server:
			process.env.VSCODE_DEBUG &&
			(() => {
				const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
				return {
					host: url.hostname,
					port: +url.port,
				}
			})(),
		clearScreen: false,
	}
})

function bindingSqlite3(
	options: {
		output?: string
		better_sqlite3_node?: string
		command?: string
	} = {}
): Plugin {
	const TAG = '[vite-plugin-binding-sqlite3]'
	options.output ??= 'native'
	options.better_sqlite3_node ??= 'better_sqlite3.node'
	options.command ??= 'build'

	return {
		name: 'vite-plugin-binding-sqlite3',
		config(config) {
			// https://github.com/vitejs/vite/blob/v4.4.9/packages/vite/src/node/config.ts#L496-L499
			const resolvedRoot = normalizePath(config.root ? resolve(config.root) : process.cwd())
			const output = resolve(resolvedRoot, options.output)
			const better_sqlite3 = require.resolve('better-sqlite3-multiple-ciphers')
			const better_sqlite3_root = join(
				better_sqlite3.slice(0, better_sqlite3.lastIndexOf('node_modules')),
				'node_modules/better-sqlite3-multiple-ciphers'
			)
			const better_sqlite3_node = join(better_sqlite3_root, 'build/Release', options.better_sqlite3_node)
			const better_sqlite3_copy = join(output, options.better_sqlite3_node)
			if (!existsSync(better_sqlite3_node)) {
				throw new Error(`${TAG} Can not found "${better_sqlite3_node}".`)
			}
			if (!existsSync(output)) {
				mkdirSync(output, { recursive: true })
			}
			copyFileSync(better_sqlite3_node, better_sqlite3_copy)
			/** `native/better_sqlite3.node` */
			const BETTER_SQLITE3_BINDING = better_sqlite3_copy.replace(resolvedRoot + '/', '')
			writeFileSync(join(resolvedRoot, '.env'), `VITE_BETTER_SQLITE3_BINDING=${BETTER_SQLITE3_BINDING}`)

			console.log(TAG, `binding to ${BETTER_SQLITE3_BINDING}`)
		},
	}
}
