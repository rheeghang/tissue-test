/**
 * @jest-environment jsdom
 */

import React from 'react'
import { useTextLines } from '../useTextLines'

// React 모킹
jest.mock('react', () => {
  const originalReact = jest.requireActual('react')
  return {
    ...originalReact,
    useState: jest.fn(),
    useEffect: jest.fn()
  }
})

describe('useTextLines Hook', () => {
  // DOM 엘리먼트 모킹
  const createMockContainer = (width) => {
    const container = document.createElement('div')
    Object.defineProperty(container, 'clientWidth', { value: width })
    Object.defineProperty(container, 'offsetWidth', { value: width })
    return container
  }

  beforeEach(() => {
    // React hooks 모킹 재설정
    React.useState.mockReset()
    React.useEffect.mockReset()
    
    // 각 테스트 전에 window.getComputedStyle 모킹
    window.getComputedStyle = jest.fn(() => ({
      font: '16px Arial',
      lineHeight: '24px'
    }))

    // 이벤트 리스너 모킹
    window.addEventListener = jest.fn()
    window.removeEventListener = jest.fn()

    // 텍스트 측정을 위한 Canvas API 모킹
    const measureTextMock = jest.fn((text) => {
      // 텍스트 길이에 비례한 너비 반환 (단순화)
      return { width: text.length * 8 }
    })

    const getContextMock = jest.fn(() => ({
      measureText: measureTextMock,
      font: ''
    }))

    const originalCreateElement = document.createElement.bind(document)
    document.createElement = jest.fn((tagName) => {
      if (tagName === 'canvas') {
        return {
          getContext: getContextMock
        }
      }
      return originalCreateElement(tagName)
    })
  })

  afterEach(() => {
    // 모킹 복원
    jest.restoreAllMocks()
  })

  test('컨테이너 너비에 맞게 텍스트를 줄로 분할', () => {
    // useState 모킹 설정
    const setLines = jest.fn()
    const linesState = [[], setLines]
    React.useState.mockImplementationOnce(() => linesState)
    
    // useEffect는 콜백 함수를 즉시 실행하도록 설정
    React.useEffect.mockImplementation(fn => fn())
    
    // 모의 컨테이너 생성
    const containerRef = { current: createMockContainer(300) }
    const text = 'This is a test text that should be split into multiple lines based on the container width'
    
    // 훅 호출
    useTextLines(containerRef, text)
    
    // setLines가 호출되었는지 확인
    expect(setLines).toHaveBeenCalled()
    
    // Canvas getContext가 호출되었는지 확인
    const mockCanvas = document.createElement('canvas')
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
  })

  test('window resize 이벤트 리스너 등록 및 제거', () => {
    // useState 모킹 설정
    React.useState.mockImplementationOnce(() => [[], jest.fn()])
    
    // cleanup 함수를 저장하기 위한 변수
    let cleanupFn
    
    // useEffect는 콜백을 실행하고 반환된 cleanup 함수를 저장
    React.useEffect.mockImplementation(fn => {
      cleanupFn = fn()
      return cleanupFn
    })
    
    // 모의 컨테이너 생성
    const containerRef = { current: createMockContainer(300) }
    const text = 'Test text'
    
    // 훅 호출
    useTextLines(containerRef, text)
    
    // resize 이벤트 리스너가 등록되었는지 확인
    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    
    // cleanup 함수 실행
    if (cleanupFn) cleanupFn()
    
    // resize 이벤트 리스너가 제거되었는지 확인
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  test('컨테이너가 없는 경우 줄 계산 스킵', () => {
    // useState 모킹 설정
    const setLines = jest.fn()
    React.useState.mockImplementationOnce(() => [[], setLines])
    
    // useEffect는 콜백 함수를 즉시 실행하도록 설정
    React.useEffect.mockImplementation(fn => fn())
    
    // 컨테이너 없는 경우
    const containerRef = { current: null }
    const text = 'Test text'
    
    // 훅 호출
    useTextLines(containerRef, text)
    
    // setLines가 호출되지 않았는지 확인
    expect(setLines).not.toHaveBeenCalled()
  })
}) 