import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
const API_BASE = import.meta.env.VITE_API_URL || ''
import ForceGraph2D from 'react-force-graph-2d'
import { FiGitBranch, FiInfo, FiX } from 'react-icons/fi'
import { GraphSkeleton } from '../components/LoadingSkeleton'

export default function FraudNetwork() {
  const [networkData, setNetworkData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)
  const graphRef = useRef()

  useEffect(() => {
    fetchNetwork()
  }, [])

  const fetchNetwork = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/network`)
      setNetworkData(response.data)
    } catch (error) {
      console.error('Error fetching network:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNodeColor = (node) => {
    switch (node.type) {
      case 'report':
        return '#6366f1' // indigo
      case 'domain':
        return '#ef4444' // red
      case 'phone':
        return '#f59e0b' // amber
      default:
        return '#6b7280' // gray
    }
  }

  const getNodeSize = (node) => {
    if (node.type === 'report') {
      return (node.votes || 0) * 2 + 8
    }
    if (node.type === 'domain' || node.type === 'phone') {
      return (node.count || 1) * 3 + 10
    }
    return 8
  }

  const handleNodeClick = (node) => {
    setSelectedNode(node)
    // Center on node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <FiGitBranch className="text-4xl text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Fraud Network</h1>
          </div>
          <p className="text-gray-600">AI-powered network analysis of scam connections</p>
        </div>
        <GraphSkeleton />
      </div>
    )
  }

  if (!networkData || networkData.nodes.length === 0) {
    return (
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Fraud Network</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <div className="text-4xl mb-4">🕸️</div>
          <p>No network data available yet.</p>
          <p className="text-sm mt-2">Report some scams to see the network visualization!</p>
        </div>
      </div>
    )
  }

  const stats = {
    totalNodes: networkData.nodes.length,
    totalLinks: networkData.links.length,
    reports: networkData.nodes.filter(n => n.type === 'report').length,
    domains: networkData.nodes.filter(n => n.type === 'domain').length,
    phones: networkData.nodes.filter(n => n.type === 'phone').length
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <FiGitBranch className="text-4xl text-indigo-600" />
          <h1 className="text-4xl font-bold text-gray-900">Fraud Network</h1>
        </div>
        <p className="text-gray-600">AI-powered network analysis reveals connections between scams and shared data</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500">
          <div className="text-2xl font-bold text-indigo-600">{stats.totalNodes}</div>
          <div className="text-sm text-gray-600">Total Nodes</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">{stats.totalLinks}</div>
          <div className="text-sm text-gray-600">Connections</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-400">
          <div className="text-2xl font-bold text-indigo-600">{stats.reports}</div>
          <div className="text-sm text-gray-600">Reports</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">{stats.domains}</div>
          <div className="text-sm text-gray-600">Domains</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
          <div className="text-2xl font-bold text-amber-600">{stats.phones}</div>
          <div className="text-sm text-gray-600">Phones</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Network Graph</h2>
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span>Reports</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Domains</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Phones</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <ForceGraph2D
                ref={graphRef}
                graphData={networkData}
                nodeLabel={(node) => `${node.label || node.id}\nType: ${node.type}`}
                nodeColor={getNodeColor}
                nodeVal={getNodeSize}
                linkColor={() => 'rgba(255, 255, 255, 0.2)'}
                linkWidth={1}
                linkDirectionalArrowLength={4}
                linkDirectionalArrowRelPos={1}
                onNodeClick={handleNodeClick}
                nodeCanvasObjectMode={() => 'after'}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.label || node.id
                  const fontSize = 12 / globalScale
                  ctx.font = `${fontSize}px Sans-Serif`
                  ctx.textAlign = 'center'
                  ctx.textBaseline = 'middle'
                  ctx.fillStyle = '#ffffff'
                  ctx.fillText(label, node.x, node.y + getNodeSize(node) + fontSize)
                }}
                cooldownTicks={100}
                onEngineStop={() => {
                  if (graphRef.current) {
                    graphRef.current.zoomToFit(400)
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-4 sticky top-4 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiInfo className="text-indigo-600" />
                Node Details
              </h3>
              {selectedNode && (
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX />
                </button>
              )}
            </div>
            {selectedNode ? (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Type</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getNodeColor(selectedNode) }}
                    ></div>
                    <span className="font-semibold capitalize">{selectedNode.type}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Label</div>
                  <div className="font-medium text-sm break-words">{selectedNode.label || selectedNode.id}</div>
                </div>
                {selectedNode.votes !== undefined && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Votes</div>
                    <div className="font-semibold">{selectedNode.votes || 0}</div>
                  </div>
                )}
                {selectedNode.count !== undefined && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Connected Reports</div>
                    <div className="font-semibold">{selectedNode.count}</div>
                  </div>
                )}
                {selectedNode.createdAt && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Created</div>
                    <div className="text-sm">
                      {new Date(selectedNode.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-sm text-center py-8">
                <FiInfo className="text-3xl mx-auto mb-2 text-gray-400" />
                <p>Click a node to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

