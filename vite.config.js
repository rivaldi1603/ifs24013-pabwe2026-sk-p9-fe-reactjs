import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function inlineEntryCssPlugin() {
  return {
    name: 'inline-entry-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const htmlAsset = bundle['index.html']
      if (!htmlAsset || htmlAsset.type !== 'asset' || typeof htmlAsset.source !== 'string') {
        return
      }

      const cssLinkRegex = /<link\s+[^>]*rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g
      const inlinedFiles = []

      htmlAsset.source = htmlAsset.source.replace(cssLinkRegex, (match, href) => {
        const assetKey = href.replace(/^\.?\//, '')
        const cssAsset = bundle[assetKey]
        if (cssAsset && cssAsset.type === 'asset' && typeof cssAsset.source === 'string') {
          inlinedFiles.push(assetKey)
          return `<style>${cssAsset.source}</style>`
        }
        return match
      })

      for (const key of inlinedFiles) {
        delete bundle[key]
      }
    },
  }
}

function preconnectApiPlugin(apiOrigin) {
  return {
    name: 'preconnect-api',
    apply: 'build',
    transformIndexHtml(html) {
      if (!apiOrigin) return html
      return html.replace(
        '</head>',
        `    <link rel="preconnect" href="${apiOrigin}" crossorigin />\n    <link rel="dns-prefetch" href="${apiOrigin}" />\n  </head>`,
      )
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  let apiOrigin = ''
  const rawBase = env.VITE_DELCOM_BASEURL || env.VITE_API_BASE_URL || ''
  if (rawBase) {
    try {
      apiOrigin = new URL(rawBase).origin
    } catch {
      apiOrigin = ''
    }
  }

  return {
    plugins: [react(), tailwindcss(), preconnectApiPlugin(apiOrigin), inlineEntryCssPlugin()],
    build: {
      target: 'es2022',
      sourcemap: true,
    },
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: [
          'src/App.jsx',
          'src/components/**/*.{js,jsx}',
          'src/helpers/**/*.{js,jsx}',
          'src/hooks/**/*.{js,jsx}',
          'src/features/**/*.{js,jsx}',
        ],
        exclude: ['src/**/*.test.{js,jsx}'],
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  }
})
