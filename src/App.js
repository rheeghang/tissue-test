import { useState } from 'react'
import Menu from './components/Menu'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleCloseMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <div className="App">
      <Menu 
        isOpen={isMenuOpen} 
        onClose={handleCloseMenu}
      />
    </div>
  )
}

export default App
