import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ScamDetector from './pages/ScamDetector'
import CommunityFeed from './pages/CommunityFeed'
import FraudNetwork from './pages/FraudNetwork'
import IncidentResponse from './pages/IncidentResponse'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detector" element={<ScamDetector />} />
          <Route path="/feed" element={<CommunityFeed />} />
          <Route path="/network" element={<FraudNetwork />} />
          <Route path="/response" element={<IncidentResponse />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

