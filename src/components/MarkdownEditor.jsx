import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export default function MarkdownEditor({ value = '', onChange, theme = 'light' }) {
  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const instance = new Editor({
      el: containerRef.current,
      height: '380px',
      initialEditType: 'markdown',
      previewStyle: 'tab',
      initialValue: value,
      theme: theme === 'dark' ? 'dark' : 'light',
      usageStatistics: false,
      events: {
        change: () => {
          onChangeRef.current(instance.getMarkdown())
        },
      },
    })
    editorRef.current = instance

    return () => {
      instance.destroy()
      editorRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  useEffect(() => {
    if (editorRef.current && editorRef.current.getMarkdown() !== value) {
      editorRef.current.setMarkdown(value, false)
    }
  }, [value])

  return <div ref={containerRef} data-testid="markdown-editor" />
}
