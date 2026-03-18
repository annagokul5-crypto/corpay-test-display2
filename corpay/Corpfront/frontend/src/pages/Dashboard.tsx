import { useEffect, useState, useCallback } from 'react'
import { api } from '../services/api'
import { DollarSign, TrendingUp, Users, Activity, RefreshCw } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    employees: 0,
    posts: 0,
    payments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async (isRetry = false) => {
    if (!isRetry) setLoading(true)
    setError(null)
    try {
      const [revenue, employees, posts, payments] = await Promise.all([
        api.get('/dashboard/revenue'),
        api.get('/dashboard/employees'),
        api.get('/dashboard/posts'),
        api.get('/dashboard/payments'),
      ])

      setStats({
        revenue: revenue.data?.total_amount || 0,
        employees: Array.isArray(employees.data) ? employees.data.length : 0,
        posts: Array.isArray(posts.data) ? posts.data.length : 0,
        payments: payments.data?.transaction_count || 0,
      })
    } catch (err: any) {
      console.error('Error fetching stats:', err)
      const message = err.code === 'ECONNABORTED'
        ? 'Request timed out - the database may be waking up. Retrying...'
        : 'Failed to load dashboard data. Click refresh to retry.'
      setError(message)
      if (err.code === 'ECONNABORTED' && !isRetry) {
        setTimeout(() => fetchStats(true), 3000)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(() => fetchStats(true), 60000)
    return () => clearInterval(interval)
  }, [fetchStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading dashboard data...</p>
          <p className="text-gray-400 text-sm mt-1">This may take a moment if the database is waking up</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <button
          onClick={() => fetchStats()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchStats()} className="ml-4 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-900 text-xs font-medium">
            Retry
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${(stats.revenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Employee Milestones</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.employees}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Social Posts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.posts}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Transactions Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.payments}</p>
            </div>
            <Activity className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

