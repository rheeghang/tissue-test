import React, { useEffect, useRef } from 'react'

const RotatedText = ({ text, title, blurAmount }) => {
  const containerRef = useRef(null)
  
  const getWrappedLines = (text, container) => {
    const words = text.split(' ')
    const lines = []
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    context.font = window.getComputedStyle(container).font
    
    let currentLine = ""
    let testLine = ""

    words.forEach((word) => {
      testLine = currentLine ? currentLine + " " + word : word
      const testWidth = context.measureText(testLine).width
      
      if (testWidth > container.clientWidth) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  const wrapText = () => {
    const container = containerRef.current
    if (!container) return

    // 기존 span 요소 제거
    const spans = container.querySelectorAll('span')
    spans.forEach(span => span.remove())

    const lines = getWrappedLines(text, container)
    
    lines.forEach((line) => {
      const span = document.createElement('span')
      span.textContent = line
      span.setAttribute('aria-hidden', 'true') // 스크린 리더가 개별 회전된 줄을 읽지 않도록 함
      container.appendChild(span)
    })
  }

  useEffect(() => {
    wrapText()
    window.addEventListener('resize', wrapText)
    return () => window.removeEventListener('resize', wrapText)
  }, [text])

  return (
    <div className="outer-container w-full pt-[10vh] relative">
        
        <div className="text-block mb-[50px] text-black">
          <h1 
            className="text-lg text-center mb-8 title-span block text-black"
            tabIndex="0"
            style={{
              transform: 'rotate(45deg)',
              transformOrigin: 'center center',
              position: 'relative',
              marginBottom: '40px',
              whiteSpace: 'nowrap',
              filter: `blur(${blurAmount}px)`,
              transition: 'filter 0.3s ease'
            }}
          >
            {title}
          </h1>

          <div 
            className="text-base text-center block text-black"
            style={{
              transform: 'rotate(45deg)',
              transformOrigin: 'center center',
              position: 'relative',
              marginBottom: '30px',
              whiteSpace: 'nowrap',
              filter: `blur(${blurAmount}px)`,
              transition: 'filter 0.3s ease'
            }}
          >
            송예슬
          </div>

          <div 
            className="text-sm text-center block text-black"
            style={{
              transform: 'rotate(45deg)',
              transformOrigin: 'center center',
              position: 'relative',
              whiteSpace: 'nowrap',
              lineHeight: '1.5',
              filter: `blur(${blurAmount}px)`,
              transition: 'filter 0.3s ease'
            }}
          >
            2025, 설치, 초음파 파장, 커스텀 소프트웨어, 가변 크기.<br/>
            국립아시아문화전당 재제작 지원, 작가 제공.
          </div>
        </div>

        <div 
        ref={containerRef}
        className="container w-full relative inline-block text-base leading-[1.5rem] text-left text-black"
        style={{
          wordWrap: 'break-word',
          overflow: 'visible',
          filter: `blur(${blurAmount}px)`,
          transition: 'filter 0.3s ease',
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'block'
        }}
        role="article"
        aria-label="전시회 설명 텍스트"
      >
        
        {/* 스크린 리더용 숨겨진 텍스트 */}
        <div className="sr-only" tabIndex="0">
          {text}
        </div>
        
        <style jsx>{`
          .container span {
            display: block;
            transform: rotate(45deg);
            transform-origin: center center;
            white-space: nowrap;
            margin-bottom: 20px;
            position: relative;
            top: 60px;
          }
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
          }
        `}</style>
      </div>
    </div>
  )
}

export default RotatedText