import { useState, useEffect } from 'react'
import axios from 'axios'
const API_BASE = import.meta.env.VITE_API_URL || ''
import { FiUsers, FiPlus, FiThumbsUp, FiGlobe, FiPhone, FiClock, FiTrendingUp, FiAlertCircle } from 'react-icons/fi'
import { ReportSkeleton } from '../components/LoadingSkeleton'

export default function CommunityFeed() {
  const [reports, setReports] = useState([])
  const [trendingIds, setTrendingIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'email',
    content: '',
    domain: '',
    phone: '',
    platform: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReports()
    fetchTrending()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/reports`)
      setReports(response.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrending = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/reports/trending`)
      const trendingIdsSet = new Set(response.data.map(r => r._id))
      setTrendingIds(trendingIdsSet)
    } catch (error) {
      console.error('Error fetching trending:', error)
    }
  }

  const handleUpvote = async (id) => {
    try {
      await axios.post(`${API_BASE}/api/reports/${id}/upvote`)
      fetchReports()
      fetchTrending()
    } catch (error) {
      console.error('Error upvoting:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.content.trim()) return

    setSubmitting(true)
    try {
      await axios.post(`${API_BASE}/api/report`, formData)
      setFormData({
        type: 'email',
        content: '',
        domain: '',
        phone: '',
        platform: ''
      })
      setShowForm(false)
      fetchReports()
      fetchTrending()
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isTrending = (reportId) => trendingIds.has(reportId)
  const isRecent = (createdAt) => {
    const hoursAgo = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
    return hoursAgo < 24
  }

  if (loading) {
    return (
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Feed</h1>
          <p className="text-gray-600">Loading community reports...</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <ReportSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FiUsers className="text-4xl text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Community Feed</h1>
          </div>
          <p className="text-gray-600">Real-time scam reports powered by community intelligence</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          {showForm ? (
            <>
              <FiAlertCircle /> Cancel
            </>
          ) : (
            <>
              <FiPlus /> Report Scam
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-indigo-100 animate-fade-in transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiAlertCircle className="text-indigo-600" />
            Quick Report (30 sec)
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="email">Email</option>
                  <option value="message">Message</option>
                  <option value="url">URL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform (optional)
                </label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="Email, SMS, WhatsApp..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={3}
                required
                placeholder="Describe the scam..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain (optional)
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="scam-site.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || !formData.content.trim()}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-lg">No reports yet. Be the first to report a scam!</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-transparent transform hover:-translate-y-1"
              style={{
                borderLeftColor: isTrending(report._id) ? '#f59e0b' : 'transparent'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                      {report.type}
                    </span>
                    {report.platform && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {report.platform}
                      </span>
                    )}
                    {isTrending(report._id) && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold flex items-center gap-1">
                        <FiTrendingUp /> Trending
                      </span>
                    )}
                    {isRecent(report.createdAt) && !isTrending(report._id) && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3 leading-relaxed">{report.content}</p>
                  {(report.domain || report.phone) && (
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                      {report.domain && (
                        <div className="flex items-center gap-1">
                          <FiGlobe className="text-indigo-600" />
                          <span className="font-medium">{report.domain}</span>
                        </div>
                      )}
                      {report.phone && (
                        <div className="flex items-center gap-1">
                          <FiPhone className="text-indigo-600" />
                          <span className="font-medium">{report.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleUpvote(report._id)}
                  className="ml-4 flex flex-col items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all duration-300 min-w-[60px] transform hover:scale-105"
                >
                  <FiThumbsUp className="text-2xl" />
                  <span className="font-semibold text-lg">{report.votes || 0}</span>
                </button>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <FiClock />
                <span>{new Date(report.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

