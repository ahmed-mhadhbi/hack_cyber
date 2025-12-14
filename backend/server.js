import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: ['https://hack-cyber.vercel.app','http://localhost:3000'] }))
app.use(express.json())

// MongoDB Atlas connection
const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env file')
  process.exit(1)
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(err => console.error('❌ MongoDB Atlas connection error:', err))

// ScamReport Model
const scamReportSchema = new mongoose.Schema({
  type: { type: String, required: true },
  content: { type: String, required: true },
  domain: String,
  phone: String,
  platform: String,
  votes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

const ScamReport = mongoose.model('ScamReport', scamReportSchema)

// Scam detection rules
const SUSPICIOUS_KEYWORDS = [
  'urgent', 'act now', 'limited time', 'click here', 'verify account',
  'suspended', 'locked', 'expired', 'immediately', 'congratulations',
  'winner', 'prize', 'claim now', 'free money', 'guaranteed',
  'no risk', '100% safe', 'secret', 'exclusive', 'wire transfer',
  'bitcoin', 'crypto', 'investment opportunity', 'get rich quick',
  'nigerian prince', 'inheritance', 'lottery', 'tax refund',
  'irs', 'social security', 'suspended account', 'verify identity'
]

const HIGH_RISK_KEYWORDS = [
  'wire transfer', 'bitcoin', 'crypto', 'nigerian prince',
  'inheritance', 'verify account', 'suspended', 'locked account'
]

// URL heuristics scoring
function analyzeURL(url) {
  let score = 0
  const lowerUrl = url.toLowerCase()
  
  // Suspicious TLDs
  if (lowerUrl.includes('.tk') || lowerUrl.includes('.ml') || 
      lowerUrl.includes('.ga') || lowerUrl.includes('.cf')) {
    score += 30
  }
  
  // URL shortening services (can be legitimate but often used for scams)
  if (lowerUrl.includes('bit.ly') || lowerUrl.includes('tinyurl') || 
      lowerUrl.includes('t.co') || lowerUrl.includes('goo.gl')) {
    score += 10
  }
  
  // IP address instead of domain
  if (/^\d+\.\d+\.\d+\.\d+/.test(url)) {
    score += 25
  }
  
  // Suspicious patterns
  if (lowerUrl.includes('secure-') || lowerUrl.includes('verify-') || 
      lowerUrl.includes('update-') || lowerUrl.includes('confirm-')) {
    score += 15
  }
  
  // Multiple subdomains (suspicious)
  const subdomainCount = (url.match(/\./g) || []).length
  if (subdomainCount > 3) {
    score += 10
  }
  
  // HTTPS check (legitimate sites usually have HTTPS)
  if (!lowerUrl.startsWith('https://')) {
    score += 5
  }
  
  return Math.min(score, 50) // Cap URL score at 50
}

// Keyword scoring
function analyzeKeywords(content) {
  let score = 0
  const lowerContent = content.toLowerCase()
  
  // Count suspicious keywords
  let keywordCount = 0
  let highRiskCount = 0
  
  SUSPICIOUS_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    const matches = (lowerContent.match(regex) || []).length
    if (matches > 0) {
      keywordCount += matches
    }
  })
  
  HIGH_RISK_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    const matches = (lowerContent.match(regex) || []).length
    if (matches > 0) {
      highRiskCount += matches
    }
  })
  
  // Score based on keyword frequency
  score += Math.min(keywordCount * 5, 30) // Up to 30 points for keywords
  score += Math.min(highRiskCount * 15, 30) // Up to 30 points for high-risk keywords
  
  // Excessive punctuation (common in scams)
  const exclamationCount = (content.match(/!/g) || []).length
  if (exclamationCount > 3) {
    score += 10
  }
  
  // ALL CAPS (common in scams)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (capsRatio > 0.3 && content.length > 20) {
    score += 10
  }
  
  return Math.min(score, 60) // Cap keyword score at 60
}

// Extract URLs from content
function extractURLs(content) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi
  return content.match(urlRegex) || []
}

// Calculate total scam score
function calculateScamScore(type, content) {
  let totalScore = 0
  
  // Keyword analysis
  totalScore += analyzeKeywords(content)
  
  // URL analysis
  if (type === 'url' || type === 'link') {
    const urlScore = analyzeURL(content)
    totalScore += urlScore
  } else {
    // Extract and analyze URLs from content
    const urls = extractURLs(content)
    if (urls.length > 0) {
      const maxUrlScore = Math.max(...urls.map(analyzeURL))
      totalScore += maxUrlScore
    }
  }
  
  // Type-specific scoring
  if (type === 'email' || type === 'message') {
    // Emails/messages with URLs are more suspicious
    if (extractURLs(content).length > 0) {
      totalScore += 5
    }
  }
  
  // Ensure score is between 0-100
  return Math.min(Math.max(totalScore, 0), 100)
}

// Determine risk level
function getRiskLevel(score) {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

// Generate explanation
function generateExplanation(score, riskLevel, type, content) {
  const explanations = []
  
  if (score >= 70) {
    explanations.push('⚠️ High scam risk detected!')
    explanations.push('This content shows multiple red flags including suspicious keywords and potentially dangerous URLs.')
    explanations.push('Do not click any links or provide personal information.')
  } else if (score >= 40) {
    explanations.push('⚠️ Moderate scam risk detected.')
    explanations.push('This content contains some suspicious elements. Proceed with caution.')
    explanations.push('Verify the source before taking any action.')
  } else {
    explanations.push('✅ Low scam risk detected.')
    explanations.push('This content appears relatively safe, but always remain vigilant.')
  }
  
  // Add specific findings
  const lowerContent = content.toLowerCase()
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter(kw => 
    lowerContent.includes(kw.toLowerCase())
  )
  
  if (foundKeywords.length > 0) {
    explanations.push(`Found ${foundKeywords.length} suspicious keyword(s).`)
  }
  
  const urls = extractURLs(content)
  if (urls.length > 0) {
    const suspiciousUrls = urls.filter(url => analyzeURL(url) > 20)
    if (suspiciousUrls.length > 0) {
      explanations.push(`Detected ${suspiciousUrls.length} potentially suspicious URL(s).`)
    }
  }
  
  return explanations.join(' ')
}

// Scan endpoint
app.post('/api/scan', (req, res) => {
  try {
    const { type, content } = req.body
    
    // Validation
    if (!type || !content) {
      return res.status(400).json({
        error: 'Missing required fields: type and content are required'
      })
    }
    
    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Content must be a non-empty string'
      })
    }
    
    // Calculate scam score
    const score = calculateScamScore(type.toLowerCase(), content)
    const riskLevel = getRiskLevel(score)
    const explanation = generateExplanation(score, riskLevel, type, content)
    
    res.json({
      score,
      riskLevel,
      explanation
    })
  } catch (error) {
    console.error('Scan error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

// Report routes
app.post('/api/report', async (req, res) => {
  try {
    const { type, content, domain, phone, platform } = req.body
    
    if (!type || !content) {
      return res.status(400).json({
        error: 'type and content are required'
      })
    }
    
    const report = new ScamReport({
      type,
      content,
      domain,
      phone,
      platform,
      votes: 0
    })
    
    await report.save()
    res.status(201).json(report)
  } catch (error) {
    console.error('Report error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await ScamReport.find()
      .sort({ createdAt: -1 })
      .limit(100)
    res.json(reports)
  } catch (error) {
    console.error('Get reports error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

app.get('/api/reports/trending', async (req, res) => {
  try {
    // Get reports from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const reports = await ScamReport.find({
      createdAt: { $gte: twentyFourHoursAgo }
    })
    
    // Calculate trending score for each report
    const now = Date.now()
    const reportsWithScore = reports.map(report => {
      const hoursSinceCreation = (now - report.createdAt.getTime()) / (1000 * 60 * 60)
      const recencyScore = Math.max(0, 24 - hoursSinceCreation) // Higher for more recent
      const voteScore = report.votes * 10 // Weight votes
      const trendingScore = voteScore + recencyScore
      
      return {
        ...report.toObject(),
        trendingScore
      }
    })
    
    // Sort by trending score (descending)
    reportsWithScore.sort((a, b) => b.trendingScore - a.trendingScore)
    
    // Return top 50 trending
    const trending = reportsWithScore.slice(0, 50).map(({ trendingScore, ...report }) => report)
    
    res.json(trending)
  } catch (error) {
    console.error('Get trending error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

app.get('/api/network', async (req, res) => {
  try {
    const reports = await ScamReport.find()
    
    const nodes = []
    const links = []
    const nodeMap = new Map()
    const domainToReports = new Map()
    const phoneToReports = new Map()
    
    // Process reports and build mappings
    reports.forEach((report, index) => {
      const reportId = `report-${report._id}`
      const reportNode = {
        id: reportId,
        label: `Report ${index + 1}`,
        type: 'report',
        votes: report.votes,
        createdAt: report.createdAt
      }
      nodes.push(reportNode)
      nodeMap.set(reportId, reportNode)
      
      // Track domains
      if (report.domain) {
        const domain = report.domain.toLowerCase().trim()
        if (!domainToReports.has(domain)) {
          domainToReports.set(domain, [])
        }
        domainToReports.get(domain).push(reportId)
      }
      
      // Track phone numbers
      if (report.phone) {
        const phone = report.phone.trim()
        if (!phoneToReports.has(phone)) {
          phoneToReports.set(phone, [])
        }
        phoneToReports.get(phone).push(reportId)
      }
    })
    
    // Add domain nodes
    domainToReports.forEach((reportIds, domain) => {
      const domainId = `domain-${domain}`
      const domainNode = {
        id: domainId,
        label: domain,
        type: 'domain',
        count: reportIds.length
      }
      nodes.push(domainNode)
      
      // Create links from reports to domain
      reportIds.forEach(reportId => {
        links.push({
          source: reportId,
          target: domainId,
          type: 'domain'
        })
      })
      
      // Create links between reports that share this domain
      if (reportIds.length > 1) {
        for (let i = 0; i < reportIds.length; i++) {
          for (let j = i + 1; j < reportIds.length; j++) {
            links.push({
              source: reportIds[i],
              target: reportIds[j],
              type: 'shared-domain',
              sharedData: domain
            })
          }
        }
      }
    })
    
    // Add phone nodes
    phoneToReports.forEach((reportIds, phone) => {
      const phoneId = `phone-${phone}`
      const phoneNode = {
        id: phoneId,
        label: phone,
        type: 'phone',
        count: reportIds.length
      }
      nodes.push(phoneNode)
      
      // Create links from reports to phone
      reportIds.forEach(reportId => {
        links.push({
          source: reportId,
          target: phoneId,
          type: 'phone'
        })
      })
      
      // Create links between reports that share this phone
      if (reportIds.length > 1) {
        for (let i = 0; i < reportIds.length; i++) {
          for (let j = i + 1; j < reportIds.length; j++) {
            links.push({
              source: reportIds[i],
              target: reportIds[j],
              type: 'shared-phone',
              sharedData: phone
            })
          }
        }
      }
    })
    
    res.json({
      nodes,
      links
    })
  } catch (error) {
    console.error('Network error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

app.post('/api/reports/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid report ID'
      })
    }
    
    const report = await ScamReport.findByIdAndUpdate(
      id,
      { $inc: { votes: 1 } },
      { new: true }
    )
    
    if (!report) {
      return res.status(404).json({
        error: 'Report not found'
      })
    }
    
    res.json(report)
  } catch (error) {
    console.error('Upvote error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

