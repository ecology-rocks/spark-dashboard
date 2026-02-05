import { google } from 'googleapis'

function relaxedJsonParse(str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    // If strict parse fails, try to relax it (only for dev/trusted inputs)
    // This regex quotes unquoted keys: { type: ... } -> { "type": ... }
    const fixed = str.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ').replace(/'/g, '"') // Replace remaining single quotes with double
    return JSON.parse(fixed)
  }
}

export const handler = async (event) => {
  const { mode, siteUrl } = event.queryStringParameters || {}

  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  console.log(
    'DEBUG CREDENTIALS START:',
    credentialsJson ? credentialsJson.substring(0, 20) : 'UNDEFINED',
    '...',
  )
  if (!credentialsJson) {
    return { statusCode: 500, body: 'Missing Server Credentials' }
  }

  try {
    const credentials = relaxedJsonParse(credentialsJson)
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.split(String.raw`\n`).join('\n')
    }
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })

    const searchconsole = google.searchconsole({ version: 'v1', auth })

    // MODE 1: List all sites this Service Account can access
    if (mode === 'sites') {
      const res = await searchconsole.sites.list()
      const sites = (res.data.siteEntry || [])
        .map((s) => s.siteUrl)
        // Filter out "sc-domain:" properties if you only want URL-prefix ones,
        // or keep them if you use Domain Properties (recommended).
        .sort()

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sites),
      }
    }

    // MODE 2: Query specific site
    if (mode === 'query') {
      if (!siteUrl) return { statusCode: 400, body: 'Missing siteUrl param' }

      // Dynamic Date Range (Last 30 Days)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 30)
      const formatDate = (d) => d.toISOString().split('T')[0]

      const res = await searchconsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['query'],
          rowLimit: 10,
        },
      })

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(res.data.rows || []),
      }
    }

    if (mode === 'overview') {
      if (!siteUrl) return { statusCode: 400, body: 'Missing siteUrl param' }

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 30)
      const formatDate = (d) => d.toISOString().split('T')[0]

      const res = await searchconsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['date'], // <--- Group by Date
          rowLimit: 31,
        },
      })

      // Sort by date just in case
      const rows = (res.data.rows || []).sort((a, b) => (a.keys[0] > b.keys[0] ? 1 : -1))

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      }
    }

    return { statusCode: 400, body: 'Invalid mode' }
  } catch (error) {
    console.error('GSC Error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}
