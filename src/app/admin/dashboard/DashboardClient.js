'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function DashboardClient({ admin }) {
  const router = useRouter()

  const [farmAccounts, setFarmAccounts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredAccounts, setFilteredAccounts] = useState([])
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalScans: 0,
    scansToday: 0,
    monthlyScanStats: []
  })
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Fetch logs with filters
  useEffect(() => {
    const query = new URLSearchParams()
    if (selectedEvent) query.append('eventType', selectedEvent)
    if (startDate) query.append('startDate', startDate)
    if (endDate) query.append('endDate', endDate)

    fetch(`/api/admin/system-logs?${query.toString()}`)
      .then(res => res.json())
      .then(data => setLogs(data.logs || []))
      .catch(err => console.error('Error fetching logs:', err))
  }, [selectedEvent, startDate, endDate])

  useEffect(() => {
    setFilteredLogs(logs)
  }, [logs])

  useEffect(() => {
  setFilteredLogs(logs)
  }, [logs])

  useEffect(() => {
    // Fetch farm accounts for UC-14
    fetch('/api/farm-accounts')
      .then(res => res.json())
      .then(data => {
        setFarmAccounts(data.accounts || [])
      })
      .catch(err => console.error('Error fetching farm accounts:', err))


    // Fetch statistics for UC-13 summary + chart/table
    fetch('/api/admin/statistics')
      .then(res => res.json())
      .then(data => {
        setStats({
          totalFarms: data.totalFarms || 0,
          totalScans: data.totalScans || 0,
          scansToday: data.scansToday || 0,
          monthlyScanStats: data.monthlyScanStats || []
        })
      })
      .catch(err => console.error('Error fetching statistics:', err))
  }, [])

  useEffect(() => {
    const term = searchTerm.toLowerCase()
    setFilteredAccounts(
      farmAccounts.filter(account =>
        account.farm_name.toLowerCase().includes(term) ||
        account.email.toLowerCase().includes(term)
      )
    )
  }, [searchTerm, farmAccounts])

  // Logs Pagination
  const [logsPage, setLogsPage] = useState(1);
  const logsPerPage = 10;
  const totalLogsPages = Math.ceil(filteredLogs.length / logsPerPage);
  const currentLogs = filteredLogs.slice(
    (logsPage - 1) * logsPerPage,
    logsPage * logsPerPage
  );
  const nextLogsPage = () => setLogsPage((prev) => Math.min(prev + 1, totalLogsPages));
  const prevLogsPage = () => setLogsPage((prev) => Math.max(prev - 1, 1));

  // Reset logs page if filter changes
  useEffect(() => {
    setLogsPage(1);
  }, [filteredLogs]);

  // Farm Accounts Pagination
  const [accountsPage, setAccountsPage] = useState(1);
  const accountsPerPage = 10;
  const totalAccountsPages = Math.ceil(filteredAccounts.length / accountsPerPage);
  const currentAccounts = filteredAccounts.slice(
    (accountsPage - 1) * accountsPerPage,
    accountsPage * accountsPerPage
  );
  const nextAccountsPage = () => setAccountsPage((prev) => Math.min(prev + 1, totalAccountsPages));
  const prevAccountsPage = () => setAccountsPage((prev) => Math.max(prev - 1, 1));

  // Reset accounts page if search/filter changes
  useEffect(() => {
    setAccountsPage(1);
  }, [filteredAccounts]);

  const handleAccountAction = async (farmId, action) => {
    const confirmMessage = `Are you sure you want to ${action} this farm account?`
    if (!window.confirm(confirmMessage)) return

    try {
      const res = await fetch(`/api/farm-accounts/${farmId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          adminEmail: admin.email, // from props
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'Action failed')
        return
      }

      alert(data.message)

      // Refresh farm accounts after update
      const refreshed = await fetch('/api/farm-accounts')
      const refreshedData = await refreshed.json()
      setFarmAccounts(refreshedData.accounts || [])

    } catch (err) {
      console.error('Account action error:', err)
      alert('Unexpected error occurred')
    }
  }

  const handleDeleteAccount = async (farmId) => {
    try {
      const res = await fetch(`/api/farm-accounts/${farmId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'Delete failed')
        return
      }

      alert('Account permanently deleted.')

      // Refresh farm accounts
      const refreshed = await fetch('/api/farm-accounts')
      const refreshedData = await refreshed.json()
      setFarmAccounts(refreshedData.accounts || [])
    } catch (err) {
      console.error('Delete account error:', err)
      alert('Unexpected error occurred during deletion')
    }
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.replace('/')
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* === Header === */}
      <header className="bg-white shadow-md flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Image src="/aqualeaf-logo.png" alt="Logo" width={32} height={32} />
          <div className="text-sm text-charcoal font-bold">LOGGED IN AS ADMINISTRATOR</div>
        </div>
        <button
          onClick={handleLogout}
          className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow"
        >
          Sign Out
        </button>
      </header>

      {/* === Main Body === */}
      <div className="p-6 space-y-10">

        {/* === UC-13: System Logs and Stats Panel === */}
        <div className="bg-white shadow-lg rounded-xl p-6">

          <h2 className="text-xl font-semibold text-charcoal mb-6">
            AquaLeaf Usage Statistics
          </h2>

          {/* === Stats + Scan Table Combined Row === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {/* Left Column: Stats stacked */}
            <div className="flex flex-col gap-4">
              <div className="bg-[#E6F4F1] text-[#00796B] rounded-lg shadow-sm p-4">
                <div className="text-sm font-medium">Total Farms</div>
                <div className="text-3xl font-bold">{stats.totalFarms}</div>
              </div>

              <div className="bg-[#E3F2FD] text-[#0D47A1] rounded-lg shadow-sm p-4">
                <div className="text-sm font-medium">Total Scans</div>
                <div className="text-3xl font-bold">{stats.totalScans}</div>
              </div>

              <div className="bg-[#F1F8E9] text-[#33691E] rounded-lg shadow-sm p-4">
                <div className="text-sm font-medium">Scans Submitted Today</div>
                <div className="text-3xl font-bold">{stats.scansToday}</div>
              </div>
            </div>

            {/* Right Column: Monthly Scan Table */}
            <div>
              <h3 className="text-lg font-semibold text-charcoal mb-3">
                Scans Over Last 6 Months
              </h3>
              <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full text-sm text-gray-800">
                  <thead className="bg-teal-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Month</th>
                      <th className="px-4 py-3 text-left font-semibold">Total Scans</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.monthlyScanStats?.length > 0 ? (
                      stats.monthlyScanStats.map((entry, idx) => (
                        <tr
                          key={idx}
                          className="bg-white hover:bg-teal-50 transition"
                        >
                          <td className="px-4 py-2">{entry.month}</td>
                          <td className="px-4 py-2">{entry.total}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="px-4 py-3 text-gray-500">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* === System Logs Table === */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">
            System Event Logs
          </h3>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-charcoal mb-1">
                Filter by Event
              </label>
              <select
                className="border rounded-md px-3 py-2 text-gray-900"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="">All Events</option>
                <option value="LOGIN_ADMIN">Admin Login</option>
                <option value="LOGIN_ADMIN_FAILED">Admin Login Failed</option>
                <option value="LOGIN_FARM">Farm Login</option>
                <option value="LOGIN_FARM_FAILED">Farm Login Failed</option>
                <option value="LOGIN_FARM_BLOCKED">Farm Login Blocked</option>
                <option value="SUSPEND_FARM">Suspend Farm Account</option>
                <option value="REINSTATE_FARM">Reinstate Farm Account</option>
                <option value="DEACTIVATE_FARM">Deactivate Farm Account</option>
                <option value="DELETE_FARM">Delete Farm Account</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-charcoal mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="border rounded-md px-3 py-2 text-gray-900"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-charcoal mb-1">
                End Date
              </label>
              <input
                type="date"
                className="border rounded-md px-3 py-2 text-gray-900"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Logs Table */}
          <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-gray-800">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
                  <th className="px-4 py-3 text-left font-semibold">Event</th>
                  <th className="px-4 py-3 text-left font-semibold">Actor</th>
                  <th className="px-4 py-3 text-left font-semibold">Target Farm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentLogs.length > 0 ? (
                  currentLogs.map((log, idx) => (
                    <tr
                      key={idx}
                      className="bg-white hover:bg-teal-50 transition"
                    >
                      <td className="px-4 py-2">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 font-medium">{log.event_type}</td>
                      <td className="px-4 py-2">{log.actor_email || '-'}</td>
                      <td className="px-4 py-2">{log.target_farm || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-gray-500">
                      No logs available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={prevLogsPage} disabled={logsPage === 1} className="px-3 py-1 bg-teal-600 text-white rounded disabled:opacity-50 cursor-pointer">
              Prev
            </button>
            <span className="text-sm text-gray-700 self-center">{logsPage}</span>
            <button onClick={nextLogsPage} disabled={logsPage === totalLogsPages} className="px-3 py-1 bg-teal-600 text-white rounded disabled:opacity-50 cursor-pointer">
              Next
            </button>
          </div>
        </div>

        {/* === UC-14: Manage Farm Accounts Panel === */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-charcoal mb-4">Manage Farm Accounts</h2>

          {/* === Search Input === */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="border text-gray-900 placeholder-gray-400 px-3 py-2 rounded w-full sm:w-1/2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* === Table === */}
          <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-gray-800">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Farm</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentAccounts.map(account => (
                  <tr key={account.id} className="bg-white hover:bg-teal-50 transition">
                    <td className="px-4 py-2">{account.farm_name}</td>
                    <td className="px-4 py-2">{account.email}</td>
                    <td className="px-4 py-2 capitalize">{account.status}</td>
                    <td className="px-4 py-2 space-x-2">
                      {account.status === 'deactivated' ? (
                        <>
                          <span className="text-gray-400 italic">Deactivated</span>
                          <button
                            className="bg-red-800 text-white px-3 py-1 rounded-md hover:bg-red-900 transition cursor-pointer"
                            onClick={() => {
                              const confirmed = window.confirm(
                                '!!! PERMANENT DELETE !!!\n\nThis action will permanently remove the account and all associated data.\n\nAre you 100% sure? This cannot be undone.'
                              )
                              if (confirmed) {
                                handleDeleteAccount(account.id)
                              }
                            }}
                          >
                            Delete Account
                          </button>
                        </>
                      ) : account.status === 'active' ? (
                        <>
                          <button
                            className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition cursor-pointer"
                            onClick={() => handleAccountAction(account.id, 'suspend')}
                          >
                            Suspend
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition cursor-pointer"
                            onClick={() => {
                              const confirmed = window.confirm(
                                '⚠️ WARNING: Deactivating this farm account is permanent and cannot be undone.\n\nAre you absolutely sure you want to deactivate this account?'
                              )
                              if (confirmed) {
                                handleAccountAction(account.id, 'deactivate')
                              }
                            }}
                          >
                            Deactivate
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition cursor-pointer"
                            onClick={() => handleAccountAction(account.id, 'reinstate')}
                          >
                            Reinstate
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition cursor-pointer"
                            onClick={() => handleAccountAction(account.id, 'deactivate')}
                          >
                            Deactivate
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={prevAccountsPage} disabled={accountsPage === 1} className="px-3 py-1 bg-teal-600 text-white rounded disabled:opacity-50 cursor-pointer">
              Prev
            </button>
            <span className="text-sm text-gray-700 self-center">{accountsPage}</span>
            <button onClick={nextAccountsPage} disabled={accountsPage === totalAccountsPages} className="px-3 py-1 bg-teal-600 text-white rounded disabled:opacity-50 cursor-pointer">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

}
