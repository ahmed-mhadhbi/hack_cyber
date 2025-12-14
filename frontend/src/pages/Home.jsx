import { Link } from 'react-router-dom'
import { FiShield, FiSearch, FiUsers, FiGitBranch, FiAlertCircle } from 'react-icons/fi'

export default function Home() {
  return (
    <div className="px-4 py-6">
      <div className="text-center mb-12 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FiShield className="text-5xl text-indigo-600" />
          <h1 className="text-5xl font-bold text-gray-900">
            ScamGuard
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-2">
          AI-Powered Protection Against Scams
        </p>
        <p className="text-gray-500">
          Advanced detection, community insights, and real-time threat analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/detector"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="text-4xl mb-4 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
            <FiSearch />
          </div>
          <h2 className="text-xl font-semibold mb-2">AI Scam Detector</h2>
          <p className="text-gray-600">
            Instant AI-powered analysis of emails, messages, and URLs
          </p>
        </Link>

        <Link
          to="/feed"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="text-4xl mb-4 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
            <FiUsers />
          </div>
          <h2 className="text-xl font-semibold mb-2">Community Feed</h2>
          <p className="text-gray-600">
            Real-time scam reports and trending threats from the community
          </p>
        </Link>

        <Link
          to="/network"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="text-4xl mb-4 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
            <FiGitBranch />
          </div>
          <h2 className="text-xl font-semibold mb-2">Fraud Network</h2>
          <p className="text-gray-600">
            Interactive visualization of scam connections and patterns
          </p>
        </Link>

        <Link
          to="/response"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="text-4xl mb-4 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
            <FiAlertCircle />
          </div>
          <h2 className="text-xl font-semibold mb-2">Incident Response</h2>
          <p className="text-gray-600">
            Step-by-step guidance and quick reporting for scam incidents
          </p>
        </Link>
      </div>
    </div>
  )
}

