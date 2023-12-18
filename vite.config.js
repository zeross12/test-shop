// import { fileURLToPath, URL } from "node:url";
import { copyFileSync } from "node:fs";
// import path from "node:path";
import path from "path";

import { defineConfig, } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

import postCssPxToRem from "postcss-pxtorem";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

/**
 * 复制 env config 文件
 */
if (["test"].includes(process.env.mode)) {
	const fromFile = path.resolve(__dirname, `./${process.env.mode}.config.js`);
	const toFile = path.resolve(__dirname, "./src/config/index.js");
	copyFileSync(fromFile, toFile, 0);
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueJsx(),
		AutoImport({
			resolvers: [ElementPlusResolver()],
		}),
		Components({
			resolvers: [ElementPlusResolver()],
			directoryAsNamespace: true,
		}),
	], 
	envDir : './env',
	base: './',
	resolve: {
		alias: {
			"@": path.join(__dirname, './src')
			//fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	css: {
		postcss: {
			plugins: [	
				postCssPxToRem({
					rootValue: 75,
					propList: ["*"],
					mediaQuery: false,
					selectorBlackList: ['pc-'], // 过滤掉norem-开头的class，不进行rem转换
				}),
			],
		},
	},
	server: {
		host: "0.0.0.0",
		port: 5173,
		https: false,
	},
});
