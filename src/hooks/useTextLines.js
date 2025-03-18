import { useState, useEffect } from 'react'

export const useTextLines = (containerRef, text) => {
  const [lines, setLines] = useState([])

  const getWrappedLines = (text, container) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const computedStyle = window.getComputedStyle(container)
    context.font = computedStyle.font

    const words = text.split(' ')
    const lines = []
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

  const calculateLines = () => {
    if (!containerRef.current) return
    const container = containerRef.current
    const lines = getWrappedLines(text, container)
    setLines(lines)
  }

  useEffect(() => {
    calculateLines()
    const handleResize = () => {
      requestAnimationFrame(calculateLines)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [text])

  return lines
} 