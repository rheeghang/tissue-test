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

import { GuideProvider } from './contexts/GuideContext'
import { ModeProvider } from './contexts/ModeContext'

// Layout이 필요한 라우트들을 감싸는 컴포넌트
const LayoutWrapper = ({ children }) => (
  <Layout>{children}</Layout>
);

function App() {
  return (
    <Router>
      <ModeProvider>
        <GuideProvider>
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
            </Route>
          </Routes>
        </GuideProvider>
      </ModeProvider>
    </Router>
  );
}

export default App;
