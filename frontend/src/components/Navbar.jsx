import { Link, useLocation } from 'react-router-dom'
import { FiShield, FiHome, FiSearch, FiUsers, FiGitBranch, FiAlertCircle } from 'react-icons/fi'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/detector', label: 'Scam Detector', icon: FiSearch },
    { path: '/feed', label: 'Community Feed', icon: FiUsers },
    { path: '/network', label: 'Fraud Network', icon: FiGitBranch },
    { path: '/response', label: 'Incident Response', icon: FiAlertCircle }
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
              <FiShield className="text-2xl text-indigo-600" />
              <span className="text-xl font-bold text-indigo-600">ScamGuard</span>
            </Link>
          </div>
          <div className="flex space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center gap-2 px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={isActive(link.path) ? 'text-indigo-600' : ''} />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

