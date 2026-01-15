// GET /api/farm-accounts
import pool from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const [rows] = await pool.query(`
      SELECT farm_id, farm_name, email, account_status
      FROM farm_account
      ORDER BY created_at DESC
    `)

    const accounts = rows.map(row => ({
      id: row.farm_id,
      farm_name: row.farm_name,
      email: row.email,
      status: row.account_status
    }))

    res.status(200).json({ accounts })
  } catch (error) {
    console.error('Error fetching farm accounts:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
