import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInput } from './useInput'

describe('useInput', () => {
  it('manages input value via onChange and setter', () => {
    const { result } = renderHook(() => useInput('initial'))
    expect(result.current[0]).toBe('initial')

    act(() => {
      result.current[1]({ target: { value: 'updated' } })
    })
    expect(result.current[0]).toBe('updated')

    act(() => {
      result.current[2]('reset')
    })
    expect(result.current[0]).toBe('reset')

    const { result: defaultHook } = renderHook(() => useInput())
    expect(defaultHook.current[0]).toBe('')
  })
})
