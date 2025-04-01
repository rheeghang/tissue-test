import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Intro from './Pages/Intro'
import Page1 from './Pages/Page1'
import Home1 from './Tutorials/Home1'
import Tutorial1 from './Tutorials/Tutorial1'
import Tutorial2 from './Tutorials/Tutorial2'
import Tutorial3 from './Tutorials/Tutorial3'
import Page2 from './Pages/Page2'
import Page3 from './Pages/Page3'
import About from './Pages/About'
import Page4 from './Pages/Page4'
import Page5 from './Pages/Page5'
import Page6 from './Pages/Page6'
import Page7 from './Pages/Page7'
import Page8 from './Pages/Page8'

import { GuideProvider } from './contexts/GuideContext'
import { ModeProvider } from './contexts/ModeContext'
import { LanguageProvider } from './contexts/LanguageContext'

// Layout이 필요한 라우트들을 감싸는 컴포넌트
const LayoutWrapper = ({ children }) => (
  <Layout>{children}</Layout>
);

function App() {
  return (
    <LanguageProvider>
      <ModeProvider>
        <GuideProvider>
          <Router>
            <Routes>
              {/* Layout 없이 렌더링되는 라우트들 */}
              <Route path="/" element={<Home1 />} />
              <Route path="/tutorial1" element={<Tutorial1 />} />
              <Route path="/tutorial2" element={<Tutorial2 />} />

              {/* Layout과 함께 렌더링되는 라우트들 */}
              <Route element={<LayoutWrapper />}>
                <Route path="/tutorial3" element={<Tutorial3 />} />
                <Route path="/intro" element={<Intro />} />
                <Route path="/1" element={<Page1 />} />
                <Route path="/2" element={<Page2 />} />
                <Route path="/3" element={<Page3 />} />
                <Route path="/about" element={<About />} />
                <Route path="/4" element={<Page4 />} />
                <Route path="/5" element={<Page5 />} />
                <Route path="/6" element={<Page6 />} />
                <Route path="/7" element={<Page7 />} />
                <Route path="/8" element={<Page8 />} />
              </Route>
            </Routes>
          </Router>
        </GuideProvider>
      </ModeProvider>
    </LanguageProvider>
  );
}

export default App;
