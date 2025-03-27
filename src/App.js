import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Intro from './Pages/Intro'
import Page1 from './Pages/Page1'
import Home2 from './Pages/Home2'
import Page2 from './Pages/Page2'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home2 />} />
          <Route path="/1" element={<Page1 />} />
          <Route path="/intro" element={<Intro />} />
          <Route path="/page2" element={<Page2 />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
