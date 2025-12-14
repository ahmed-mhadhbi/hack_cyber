import { useState } from 'react'
import axios from 'axios'
const API_BASE = import.meta.env.VITE_API_URL || ''
import { FiSearch, FiShield, FiAlertTriangle, FiCheckCircle, FiZap } from 'react-icons/fi'

export default function ScamDetector() {
  const [type, setType] = useState('email')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleScan = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post(`${API_BASE}/api/scan`, { type, content })
      setResult(response.data)
    } catch (err) {
      console.error('Scan error:', err)
      setError('Failed to scan. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level) => {
    if (level === 'High') return 'text-red-700 bg-red-50 border-red-200'
    if (level === 'Medium') return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    return 'text-green-700 bg-green-50 border-green-200'
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-red-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = (score) => {
    if (score >= 70) return 'bg-red-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <FiShield className="text-4xl text-indigo-600" />
          <h1 className="text-4xl font-bold text-gray-900">AI-Powered Scam Detector</h1>
        </div>
        <p className="text-gray-600">
          Advanced AI analysis detects scam indicators in emails, messages, and URLs with high accuracy
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl">
        <form onSubmit={handleScan}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="email">Email</option>
              <option value="message">Message</option>
              <option value="url">URL</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content to Scan
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Paste the email, message, or URL you want to scan..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>AI Analyzing...</span>
              </>
            ) : (
              <>
                <FiSearch className="text-xl" />
                <span>Scan with AI</span>
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-100 animate-fade-in transition-all duration-300">
          <div className="mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-lg border-2 font-semibold transition-all ${getRiskColor(result.riskLevel)}`}>
              {result.riskLevel === 'High' && <FiAlertTriangle className="mr-2 text-xl" />}
              {result.riskLevel === 'Medium' && <FiZap className="mr-2 text-xl" />}
              {result.riskLevel === 'Low' && <FiCheckCircle className="mr-2 text-xl" />}
              AI Risk Assessment: {result.riskLevel}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Scam Score</span>
              <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className={`h-6 rounded-full transition-all duration-500 ${getProgressColor(result.score)}`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <FiShield className="text-indigo-600" />
              <h3 className="text-sm font-semibold text-gray-700">AI-Powered Analysis</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{result.explanation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

