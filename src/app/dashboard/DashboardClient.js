'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardClient({ user }) {

  const [previewData, setPreviewData] = useState([])

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    species: '',
    quality: '',
    reportType: 'fresh',
  })

  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.replace('/')
  }

  const [speciesOptions, setSpeciesOptions] = useState([])

  useEffect(() => {
    const fetchSpecies = async () => {
      const res = await fetch('/api/scan-report/seaweed-species')
      const data = await res.json()
      setSpeciesOptions(data)
    }

    fetchSpecies()
  }, [filters.reportType])

  const generatePDF = async () => {
    const response = await fetch('/api/scan-report/pdf-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          species: filters.species,
          quality: filters.quality,
          reportType: filters.reportType
        })
    })

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    const today = new Date()
    const dateStr = today.toISOString().split('T')[0] // format: YYYY-MM-DD
    const filename = `Seaweed_Report_${dateStr}.pdf`

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }

  const fetchPreviewData = async () => {
    const res = await fetch('/api/scan-report/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    })
    const data = await res.json()
    setPreviewData(data)
    console.log(data[0])
  }

  const generateCSV = async () => {
    const res = await fetch('/api/scan-report/export-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        species: filters.species,
        quality: filters.quality,
        reportType: filters.reportType
      })
    })

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)

    const today = new Date()
    const dateStr = today.toISOString().split('T')[0] // format: YYYY-MM-DD
    const filename = `Seaweed_Report_${dateStr}.csv`

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
}


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Image src="/aqualeaf-logo.png" alt="Logo" width={32} height={32} />
          <nav className="space-x-4 text-sm text-gray-700">
            <a href="#" className="hover:underline">Latest Updates</a>
            <a href="#" className="hover:underline">Seaweed Information</a>
            <a href="#" className="hover:underline">Contact</a>
          </nav>
        </div>
        <button onClick={handleLogout} className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow">
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-8">
        {/* Farm Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-semibold">{user.farm_name}</h2>
            <p className="text-gray-600">Kampung Laut, Jalan Percubaan, Malaysia</p>
            <details className="mt-2 border rounded p-3 bg-white shadow-sm">
              <summary className="font-medium cursor-pointer">Info</summary>
              <p className="text-sm mt-2">Brief information about the farm, seaweed types, etc. if needed.</p>
            </details>
          </div>
        </div>

        {/* Report Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Filters */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-1">Generate Report</h3>
            <p className="text-sm text-gray-500 mb-4">Data Filters</p>
            <div className="space-y-4">
              {/* Date Range Picker */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Select seaweed type */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seaweed Type
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={filters.reportType}
                onChange={(e) =>
                  setFilters(prev => ({ ...prev, reportType: e.target.value }))
                }
              >
                <option value="fresh">Fresh Seaweed</option>
                <option value="dried">Dried Seaweed</option>
              </select>

              {/* Other dropdowns */}
              <label htmlFor="speciesDropdown">Filter by Seaweed Species</label>
                <select
                  id="speciesDropdown"
                  className="w-full border rounded px-3 py-2"
                  value={filters.species}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, species: e.target.value }))
                  }
                >
                  <option value="">Do not filter</option>
                  {speciesOptions.map((s) => (
                    <option key={s.species_id} value={s.species_id}>
                      {s.phylum}
                    </option>
                  ))}
                </select>

              <label htmlFor="qualityDropdown">Filter by Quality Status</label>
                <select
                  id="qualityDropdown"
                  className="w-full border rounded px-3 py-2"
                  value={filters.quality}
                  onChange={(e) => setFilters({ ...filters, quality: e.target.value })}
                >
                  <option value="">Do not filter</option>
                  <option value="Good">Good</option>
                  <option value="Bad">Bad</option>
                </select>

              <button
                onClick={fetchPreviewData}
                className="cursor-pointer bg-ocean text-white px-4 py-2 rounded w-full">
                Preview Data
              </button>

              {/* Generate button */}
              <div className="flex gap-4 mt-2">
              <button
                onClick={generatePDF}
                className="cursor-pointer bg-leaf text-white px-4 py-2 rounded w-full mt-2"
              >
                Generate PDF Report
              </button>

              <button
                onClick={generateCSV}
                className="cursor-pointer bg-leaf text-white px-4 py-2 rounded w-full mt-2"
              >
                Generate CSV File
              </button>
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4 text-charcoal">Preview Data</h3>

            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-teal-600 text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Species</th>
                    <th className="px-4 py-3 font-semibold">Quality</th>
                    <th className="px-4 py-3 font-semibold">Impurity</th>
                    <th className="px-4 py-3 font-semibold">
                      {filters.reportType === "dried" ? "Appearance" : "Health"}
                    </th>
                    <th className="px-4 py-3 font-semibold">Scan Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-gray-400">
                        No data previewed yet.
                      </td>
                    </tr>
                  ) : (
                    previewData.map((item, i) => (
                      <tr key={i} className="bg-white hover:bg-teal-50 transition">
                        <td className="px-4 py-2 font-medium text-gray-800">{item.phylum || item.species}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.quality_status === 'Good' ? 'bg-green-100 text-green-700' :
                            item.quality_status === 'Bad' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.quality_status || item.quality}
                          </span>
                        </td>
                        <td className="px-4 py-2">{item.impurity_status || item.impurity}%</td>
                        <td className="px-4 py-2">{item.status}</td>
                        <td className="px-4 py-2">{item.timestamp}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
