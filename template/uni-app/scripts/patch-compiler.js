/**
 * Patch: Copy UniApp's patched @vue/component-compiler-utils over the standard version.
 *
 * The standard @vue/component-compiler-utils does not export `recyclableRender`
 * or `components` variables from compiled templates, but UniApp's templateLoader
 * expects them. UniApp bundles a patched version in its packages/ directory but
 * Node module resolution picks up the standard one instead.
 *
 * This script copies the patched compileTemplate.js over the standard one so
 * CLI builds (mp-weixin, h5, etc.) work correctly.
 */
const fs = require('fs')
const path = require('path')

const patchedFile = path.resolve(
  __dirname,
  '../node_modules/@dcloudio/vue-cli-plugin-uni/packages/@vue/component-compiler-utils/dist/compileTemplate.js'
)

const targetFile = path.resolve(
  __dirname,
  '../node_modules/@vue/component-compiler-utils/dist/compileTemplate.js'
)

if (!fs.existsSync(patchedFile)) {
  console.log('[patch-compiler] Patched file not found, skipping.')
  process.exit(0)
}

if (!fs.existsSync(targetFile)) {
  console.log('[patch-compiler] Target file not found, skipping.')
  process.exit(0)
}

fs.copyFileSync(patchedFile, targetFile)
console.log('[patch-compiler] Patched @vue/component-compiler-utils/dist/compileTemplate.js with UniApp version.')

// Patch 2: Fix postcss-urlrewrite for Node 22+ (util.isRegExp was removed)
const urlrewriteFile = path.resolve(
  __dirname,
  '../node_modules/postcss-urlrewrite/lib/urlrewrite.js'
)

if (fs.existsSync(urlrewriteFile)) {
  let content = fs.readFileSync(urlrewriteFile, 'utf-8')
  if (content.includes('util.isRegExp')) {
    content = content.replace(/util\.isRegExp/g, '(obj => obj instanceof RegExp)')
    fs.writeFileSync(urlrewriteFile, content)
    console.log('[patch-compiler] Patched postcss-urlrewrite for Node 22+ compatibility.')
  }
}
