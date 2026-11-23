import { useEffect, useRef } from 'react'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export default function MarkdownViewer({ content = '', theme = 'light' }) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    const instance = new Viewer({
      el: containerRef.current,
      initialValue: content,
      theme: theme === 'dark' ? 'dark' : 'light',
    })
    viewerRef.current = instance

    return () => {
      instance.destroy()
      viewerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  useEffect(() => {
    viewerRef.current.setMarkdown(content)
  }, [content])

  return <div ref={containerRef} data-testid="markdown-viewer" />
}
