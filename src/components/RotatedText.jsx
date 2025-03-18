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
    <div 
      ref={containerRef}
      className="container w-full max-w-[350px] p-[40px_20px_20px] relative inline-block text-lg leading-8 text-left text-exhibition-text overflow-y-auto"
      style={{
        wordWrap: 'break-word',
        filter: `blur(${blurAmount}px)`,
        transition: 'filter 0.3s ease',
      }}
      role="article"
      aria-label="전시회 설명 텍스트"
    >
      {/* 제목 부분 - 회전 추가 */}
      <h1 
        className="text-3xl text-center mb-8 title-span"
        tabIndex="0"
        style={{
          transform: 'rotate(45deg)',
          transformOrigin: 'left bottom',
          display: 'block',
        }}
      >
        {title}
      </h1>
      
      {/* 스크린 리더용 숨겨진 텍스트 */}
      <div className="sr-only" tabIndex="0">
        {text}
      </div>
      
      <style jsx>{`
        .container span {
          display: block;
          transform: rotate(45deg);
          transform-origin: left bottom;
          white-space: nowrap;
          margin-bottom: 10px;
          position: relative;
          top: 5px;
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
  )
}

export default RotatedText