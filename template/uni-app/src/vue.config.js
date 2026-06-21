module.exports = {
	productionSourceMap: false,
	transpileDependencies: ['vue-i18n'],
	configureWebpack: config => {
		if (process.env.NODE_ENV === 'production') {
			config.optimization.minimizer[0].options.terserOptions.compress.warnings = false
			config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
			config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true
			config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log']
		}
		// Use CommonJS entry for vue-i18n to avoid ESM issues with webpack 4
		config.resolve.alias = config.resolve.alias || {}
		config.resolve.alias['vue-i18n'] = 'vue-i18n/dist/vue-i18n.common.js'
	}
}
