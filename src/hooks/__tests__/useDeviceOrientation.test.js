
/**
 * @jest-environment jsdom
 */

import React from 'react'
import { useDeviceOrientation } from '../useDeviceOrientation'

// React 모킹
jest.mock('react', () => {
  const originalReact = jest.requireActual('react')
  return {
    ...originalReact,
    useState: jest.fn(),
    useEffect: jest.fn(),
    useRef: jest.fn()
  }
})

describe('useDeviceOrientation Hook', () => {
  // 원래 구현 저장
  const originalDeviceOrientationEvent = window.DeviceOrientationEvent
  const originalAddEventListener = window.addEventListener
  const originalRemoveEventListener = window.removeEventListener

  beforeEach(() => {
    // React hooks 모킹 재설정
    React.useState.mockReset()
    React.useEffect.mockReset()
    React.useRef.mockReset()
    
    // 환경 설정
    global.DeviceOrientationEvent = {
      requestPermission: jest.fn(() => Promise.resolve('granted'))
    }

    // navigator.userAgent 모킹
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true
    })

    // 이벤트 리스너 모킹
    window.addEventListener = jest.fn()
    window.removeEventListener = jest.fn()
  })

  afterEach(() => {
    // 원래 구현 복원
    global.DeviceOrientationEvent = originalDeviceOrientationEvent
    window.addEventListener = originalAddEventListener
    window.removeEventListener = originalRemoveEventListener
    jest.clearAllMocks()
  })

  test('초기 상태 설정 확인', () => {
    // useState 모킹 설정
    const blurAmountState = [10, jest.fn()]
    const permissionState = [false, jest.fn()]
    const referenceAnglesState = [{ beta: 45, gamma: -60 }, jest.fn()]
    
    React.useState.mockImplementationOnce(() => blurAmountState)
    React.useState.mockImplementationOnce(() => permissionState)
    React.useState.mockImplementationOnce(() => referenceAnglesState)
    
    // useRef 기본값 설정
    React.useRef.mockImplementation(() => ({ current: null }))
    
    // useEffect는 단순히 함수를 즉시 실행하도록 설정
    React.useEffect.mockImplementation(fn => fn())
    
    // 훅 호출
    const result = useDeviceOrientation()
    
    // 결과 확인
    expect(result.blurAmount).toBe(10)
    expect(result.permissionGranted).toBe(false)
    expect(typeof result.clearBlur).toBe('function')
    expect(typeof result.calibrateOrientation).toBe('function')
    expect(result.referenceAngles).toEqual({ beta: 45, gamma: -60 })
  })

  test('clearBlur 함수가 blurAmount를 0으로 설정', () => {
    // useState 모킹 설정
    const setBlurAmount = jest.fn()
    const blurAmountState = [10, setBlurAmount]
    
    React.useState.mockImplementationOnce(() => blurAmountState)
    React.useState.mockImplementationOnce(() => [false, jest.fn()])
    React.useState.mockImplementationOnce(() => [{ beta: 45, gamma: -60 }, jest.fn()])
    
    // useRef 기본값 설정
    React.useRef.mockImplementation(() => ({ current: null }))
    
    // useEffect는 단순히 함수를 즉시 실행하도록 설정
    React.useEffect.mockImplementation(fn => fn())
    
    // 훅 호출 및 clearBlur 함수 실행
    const { clearBlur } = useDeviceOrientation()
    clearBlur()
    
    // blurAmount가 0으로 설정되었는지 확인
    expect(setBlurAmount).toHaveBeenCalledWith(0)
  })

  test('iOS에서 권한 요청 성공 시 이벤트 리스너 등록', async () => {
    // useState 모킹 설정
    const setPermissionGranted = jest.fn()
    
    React.useState.mockImplementationOnce(() => [10, jest.fn()])
    React.useState.mockImplementationOnce(() => [false, setPermissionGranted])
    React.useState.mockImplementationOnce(() => [{ beta: 45, gamma: -60 }, jest.fn()])
    
    // useRef 기본값 설정
    React.useRef.mockImplementation(() => ({ current: null }))
    
    // useEffect는 단순히 함수를 즉시 실행하도록 설정
    React.useEffect.mockImplementation(fn => fn())
    
    // 훅 호출 및 requestPermission 함수 실행
    const { requestPermission } = useDeviceOrientation()
    await requestPermission()
    
    // 권한 요청이 호출되었는지 확인
    expect(global.DeviceOrientationEvent.requestPermission).toHaveBeenCalled()
    
    // 권한이 승인되면 permissionGranted가 true로 설정되고 이벤트 리스너가 등록되는지 확인
    expect(setPermissionGranted).toHaveBeenCalledWith(true)
    expect(window.addEventListener).toHaveBeenCalledWith('deviceorientation', expect.any(Function))
  })
}) 