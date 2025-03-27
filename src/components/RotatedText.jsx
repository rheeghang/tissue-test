import React, { useEffect, useRef } from 'react'

const RotatedText = ({ text, title, artist, caption, blurAmount, onNextClick, onPrevClick }) => {
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

    // HTML 태그와 네비게이션 버튼을 고려한 텍스트 분할
    const parts = text.split('<br>')
    parts.forEach((part, index) => {
      const lines = getWrappedLines(part.replace('[다음]', '').replace('[이전]', ''), container)
      
      lines.forEach((line) => {
        const span = document.createElement('span')
        span.textContent = line
        span.setAttribute('aria-hidden', 'true')
        container.appendChild(span)
      })

      // 네비게이션 버튼 처리
      if (part.includes('[다음]') || part.includes('[이전]')) {
        const navSpan = document.createElement('span');
        const button = document.createElement('button');
        
        if (part.includes('[다음]')) {
          button.textContent = '[다음]';
          button.onclick = onNextClick;
        } else {
          button.textContent = '[이전]';
          button.onclick = onPrevClick;
        }
        
        // 버튼 스타일 변경
        button.className = 'text-black hover:text-gray-600';  // 파란색 제거, 검은색으로 변경
        navSpan.appendChild(button);
        container.appendChild(navSpan);
      }

      // 줄바꿈 처리
      if (index < parts.length - 1) {
        const breakSpan = document.createElement('span');
        breakSpan.style.height = '1.2em';  // 1.5em에서 0.8em으로 줄바꿈 간격 축소
        container.appendChild(breakSpan);
      }
    })
  }

  useEffect(() => {
    wrapText()
    window.addEventListener('resize', wrapText)
    return () => window.removeEventListener('resize', wrapText)
  }, [text, onNextClick, onPrevClick])

  return (
    <div className="outer-container w-full pt-[15vh] relative">
        
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
            {artist}
          </div>

          <div 
            className="text-sm text-center block text-black"
            style={{
              transform: 'rotate(45deg)',
              transformOrigin: 'center center',
              position: 'relative',
              whiteSpace: 'normal',
              lineHeight: '1.5',
              filter: `blur(${blurAmount}px)`,
              transition: 'filter 0.3s ease'
            }}
            dangerouslySetInnerHTML={{ __html: caption }}
          />
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
            margin-bottom: 15px;  // 20px에서 10px로 변경하여 줄간격 축소
            position: relative;
            top: 30px;
          }
          .navigation-button {
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