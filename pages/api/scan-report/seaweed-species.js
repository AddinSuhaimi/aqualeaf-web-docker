// pages/api/seaweed-species.js
import pool from '@/lib/db'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const token = req.cookies.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const farmId = decoded.farm_id
    const { reportType } = req.body;
    const table = reportType === 'dried' ? 'scan_report_dried' : 'scan_report_fresh';

    const [rows] = await pool.query(`
      SELECT DISTINCT ss.species_id, ss.phylum
      FROM ${table} sr
      JOIN seaweed_species ss ON sr.species_id = ss.species_id
      WHERE sr.farm_id = ?
    `, [farmId])

    res.status(200).json(rows)
  } catch (err) {
    console.error('[Species Fetch Error]:', err)
    res.status(500).json({ error: 'Failed to fetch species' })
  }
}
