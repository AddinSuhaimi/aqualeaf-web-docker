import pool from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    /* =========================
       TOTAL FARMS
    ========================== */
    const [[{ total_farms }]] = await pool.query(`
      SELECT COUNT(*) AS total_farms
      FROM farm_account
    `)

    /* =========================
       TOTAL SCANS (FRESH + DRIED)
    ========================== */
    const [[{ total_scans }]] = await pool.query(`
      SELECT COUNT(*) AS total_scans
      FROM (
        SELECT timestamp FROM scan_report_fresh
        UNION ALL
        SELECT timestamp FROM scan_report_dried
      ) AS all_scans
    `)

    /* =========================
       SCANS TODAY (FRESH + DRIED)
    ========================== */
    const [[{ scans_today }]] = await pool.query(`
      SELECT COUNT(*) AS scans_today
      FROM (
        SELECT timestamp FROM scan_report_fresh WHERE DATE(timestamp) = CURDATE()
        UNION ALL
        SELECT timestamp FROM scan_report_dried WHERE DATE(timestamp) = CURDATE()
      ) AS today_scans
    `)

    /* =========================
       LAST 6 MONTHS SCAN STATS
    ========================== */
    const [monthlyScans] = await pool.query(`
      SELECT
        DATE_FORMAT(timestamp, '%Y-%m') AS month,
        COUNT(*) AS total
      FROM (
        SELECT timestamp FROM scan_report_fresh
        UNION ALL
        SELECT timestamp FROM scan_report_dried
      ) AS all_scans
      WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(timestamp, '%Y-%m')
      ORDER BY month ASC
    `)

    /* =========================
       RESPONSE
    ========================== */
    return res.status(200).json({
      totalFarms: total_farms,
      totalScans: total_scans,
      scansToday: scans_today,
      monthlyScanStats: monthlyScans
    })

  } catch (err) {
    console.error('Error fetching admin statistics:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
