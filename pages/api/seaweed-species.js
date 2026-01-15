/*
// pages/api/seaweed-species.js
import pool from '@/lib/db'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const [rows] = await pool.query(`SELECT species_id, species_name FROM seaweed_species`)
      return res.status(200).json({ rows })
    }

    if (req.method === 'POST') {
      const { action, id, name, phylum, date_added } = req.body

      if (action === 'add') {
        if (!name) return res.status(400).json({ error: 'Missing species name' })
        await pool.query(`INSERT INTO seaweed_species (species_name, phylum, date_added) VALUES (?, ?, ?)`, [name, phylum, date_added])
        return res.status(200).json({ message: 'Species added' })

      } else if (action === 'edit') {
        if (!id || !name) return res.status(400).json({ error: 'Missing ID or name' })
        await pool.query(`UPDATE seaweed_species SET species_name = ?, phylum = ? WHERE species_id = ?`, [name, phylum, id])
        return res.status(200).json({ message: 'Species updated' })

      } else if (action === 'delete') {
        if (!id) return res.status(400).json({ error: 'Missing ID' })
        await pool.query(`DELETE FROM seaweed_species WHERE species_id = ?`, [id])
        return res.status(200).json({ message: 'Species deleted' })
      }

      return res.status(400).json({ error: 'Invalid action' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[API /seaweed-species]', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
*/