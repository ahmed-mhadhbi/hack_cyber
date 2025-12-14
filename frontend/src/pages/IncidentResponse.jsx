import { useState } from 'react'
import axios from 'axios'
import { FiAlertCircle, FiShield, FiFileText, FiCheckSquare, FiSend, FiAlertTriangle, FiZap, FiCheckCircle } from 'react-icons/fi'
import responseData from '../data/incidentResponseData.json'

export default function IncidentResponse() {
  const [selectedScenario, setSelectedScenario] = useState('')
  const [currentGuide, setCurrentGuide] = useState(null)
  const [formData, setFormData] = useState({
    type: 'email',
    content: '',
    domain: '',
    phone: '',
    platform: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)

  const handleScenarioChange = (e) => {
    const scenario = e.target.value
    setSelectedScenario(scenario)
    if (scenario && responseData[scenario]) {
      setCurrentGuide(responseData[scenario])
    } else {
      setCurrentGuide(null)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      await axios.post('/api/report', formData)
      setSuccess(true)
      setFormData({
        type: 'email',
        content: '',
        domain: '',
        phone: '',
        platform: ''
      })
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <FiAlertCircle className="text-4xl text-indigo-600" />
          <h1 className="text-4xl font-bold text-gray-900">Incident Response Guide</h1>
        </div>
        <p className="text-gray-600">AI-powered step-by-step guidance for different scam scenarios</p>
      </div>

      {/* Scenario Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl">
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <FiShield className="text-indigo-600" />
          Select Incident Scenario
        </label>
        <select
          value={selectedScenario}
          onChange={handleScenarioChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg transition-all"
        >
          <option value="">-- Select a scenario --</option>
          <option value="phishing_click">Phishing Click</option>
          <option value="brand_impersonation">Brand Impersonation</option>
          <option value="data_leak">Data Leak</option>
        </select>
      </div>

      {/* Guide Content */}
      {currentGuide && (
        <div className="space-y-6">
          {/* Immediate Actions */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 animate-fade-in transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <FiAlertTriangle className="text-2xl text-red-600" />
              <h2 className="text-2xl font-bold text-red-900">Immediate Actions</h2>
            </div>
            <p className="text-red-800 mb-4 font-medium">Do these steps right away:</p>
            <ul className="space-y-2">
              {currentGuide.immediate_actions.map((action, index) => (
                <li key={index} className="flex items-start gap-3 text-red-900">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Priority Steps */}
          <div className="bg-white rounded-lg shadow-lg p-6 animate-fade-in transition-all duration-300">
            <div className="flex items-center gap-2 mb-6">
              <FiFileText className="text-2xl text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Priority Steps</h2>
            </div>
            <div className="space-y-6">
              {currentGuide.priority_steps.map((step) => (
                <div key={step.step} className="border-l-4 border-indigo-500 pl-6 pb-6 last:pb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full font-bold">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                  </div>
                  <ul className="space-y-2 ml-11">
                    {step.actions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-indigo-500 mt-1.5">✓</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Checklist */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 animate-fade-in transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <FiCheckSquare className="text-2xl text-blue-600" />
              <h2 className="text-2xl font-bold text-blue-900">Evidence Checklist</h2>
            </div>
            <p className="text-blue-800 mb-4">Document these items for your records:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentGuide.evidence_checklist.map((item, index) => (
                <div key={index} className="flex items-start gap-2 bg-white rounded p-3">
                  <input
                    type="checkbox"
                    id={`evidence-${index}`}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={`evidence-${index}`} className="text-blue-900 cursor-pointer">
                    {item}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Form Section */}
      <div className="mt-8 border-t-2 pt-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiSend className="text-indigo-600" />
              Report a Scam
            </h2>
            <p className="text-gray-600">Help protect others by reporting incidents</p>
          </div>
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            {showReportForm ? (
              <>
                <FiAlertCircle /> Hide Form
              </>
            ) : (
              <>
                <FiSend /> Show Report Form
              </>
            )}
          </button>
        </div>

        {showReportForm && (
          <>
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
                ✅ Report submitted successfully! Thank you for helping protect the community.
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="email">Email</option>
                    <option value="message">Message</option>
                    <option value="url">URL</option>
                    <option value="link">Link</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe the scam or paste the content..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domain
                    </label>
                    <input
                      type="text"
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="scam-site.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <input
                    type="text"
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Email, SMS, WhatsApp, etc."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

