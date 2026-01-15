// pages/api/logout.js
export default function handler(req, res) {
  // clear the token cookie
  res.setHeader('Set-Cookie', [
    `token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
  ])
  // no content
  return res.status(204).end()
}