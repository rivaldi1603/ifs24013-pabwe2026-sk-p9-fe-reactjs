import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'

const mockEditorInstances = []
const mockViewerInstances = []

vi.mock('@toast-ui/editor', () => ({
  default: vi.fn(function (opts) {
    let md = opts.initialValue
    const inst = {
      opts,
      getMarkdown: () => md,
      setMarkdown: vi.fn((next) => {
        md = next
      }),
      triggerChange: (next) => {
        md = next
        opts.events.change()
      },
      destroy: vi.fn(),
    }
    mockEditorInstances.push(inst)
    return inst
  }),
}))

vi.mock('@toast-ui/editor/dist/toastui-editor-viewer', () => ({
  default: vi.fn(function (opts) {
    const inst = {
      opts,
      setMarkdown: vi.fn(),
      destroy: vi.fn(),
    }
    mockViewerInstances.push(inst)
    return inst
  }),
}))

describe('MarkdownComponents', () => {
  beforeEach(() => {
    mockEditorInstances.length = 0
    mockViewerInstances.length = 0
  })

  it('renders MarkdownEditor, syncs value, handles change, theme switch, and unmount', () => {
    const onChange = vi.fn()
    const { rerender, unmount } = render(<MarkdownEditor value="# Intro" onChange={onChange} theme="light" />)
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    expect(mockEditorInstances[0].opts.theme).toBe('light')

    mockEditorInstances[0].triggerChange('# Edited')
    expect(onChange).toHaveBeenCalledWith('# Edited')

    rerender(<MarkdownEditor value="# External" onChange={onChange} theme="light" />)
    expect(mockEditorInstances[0].setMarkdown).toHaveBeenCalledWith('# External', false)

    rerender(<MarkdownEditor onChange={onChange} theme="dark" />)
    expect(mockEditorInstances[1].opts.theme).toBe('dark')

    unmount()
    expect(mockEditorInstances[1].destroy).toHaveBeenCalled()
  })

  it('renders MarkdownViewer, syncs content, switches theme, and cleans up', () => {
    const { rerender, unmount } = render(<MarkdownViewer content="# Article" theme="light" />)
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()
    expect(mockViewerInstances[0].opts.theme).toBe('light')

    rerender(<MarkdownViewer content="# Updated" theme="light" />)
    expect(mockViewerInstances[0].setMarkdown).toHaveBeenCalledWith('# Updated')

    rerender(<MarkdownViewer theme="dark" />)
    expect(mockViewerInstances[1].opts.theme).toBe('dark')

    unmount()
    expect(mockViewerInstances[1].destroy).toHaveBeenCalled()
  })
})
