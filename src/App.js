import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Intro from './Pages/Intro'
import Page1 from './Pages/Page1'
import Home2 from './Pages/Home2'
import Page2 from './Pages/Page2'
import Page3 from './Pages/Page3'
import { GuideProvider } from './contexts/GuideContext'
import { ModeProvider } from './contexts/ModeContext'

function App() {
  return (
    <ModeProvider>
      <GuideProvider>
          <Layout>
            <Router>
              <Routes>
                <Route path="/" element={<Home2 />} />
                <Route path="/1" element={<Page1 />} />
                <Route path="/2" element={<Page2 />} />
                <Route path="/3" element={<Page3 />} />
                <Route path="/intro" element={<Intro />} />
              </Routes>
            </Router>
          </Layout>

      </GuideProvider>
    </ModeProvider>
  )
}

export default App
