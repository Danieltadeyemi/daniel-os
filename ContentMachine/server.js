#!/usr/bin/env node
const express = require('express')
const path    = require('path')
const fs      = require('fs')
const { spawn } = require('child_process')

const app     = express()
const PORT    = 3000
const CM_DIR  = path.resolve(__dirname)
const VAULT   = path.join(CM_DIR, 'vault')
const IDEAS   = path.join(VAULT, 'ideas.md')
const CAPS    = path.join(VAULT, 'captures.json')

// Brew binaries not always on Node's PATH
const ENV = { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}` }

app.use(express.json())

// Serve built app
app.use(express.static(path.join(CM_DIR, 'app')))
app.get('/', (_req, res) => res.sendFile(path.join(CM_DIR, 'app', 'content-machine.html')))

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseIdeas(md) {
  return md.split('\n')
    .filter(l => /^\|\s*\d+/.test(l))
    .map(line => {
      const cols = line.split('|').map(c => c.trim()).filter(Boolean)
      if (cols.length < 6) return null
      return {
        id:     parseInt(cols[0]),
        title:  cols[1],
        pillar: cols[2],
        score:  parseInt(cols[3]) || 0,
        source: cols[4],
        status: cols[5],
        isNew:  false,
      }
    }).filter(Boolean)
}

function sse(res, cmd, args) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = d => res.write(`data: ${JSON.stringify(d)}\n\n`)
  const proc = spawn(cmd, args, { cwd: CM_DIR, env: ENV })
  proc.stdout.on('data', d => send({ out: d.toString() }))
  proc.stderr.on('data', d => send({ out: d.toString() }))
  proc.on('close',  code  => { send({ done: true, code }); res.end() })
  proc.on('error',  err   => { send({ out: 'Error: ' + err.message, done: true, code: 1 }); res.end() })

  res.on('close', () => proc.kill())
}

// ─── Ideas ───────────────────────────────────────────────────────────────────

app.get('/api/vault/ideas', (_req, res) => {
  try {
    res.json(parseIdeas(fs.readFileSync(IDEAS, 'utf8')))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/vault/ideas', (req, res) => {
  try {
    const { title, pillar, source = 'Spark', status = 'Ready' } = req.body
    if (!title || !pillar) return res.status(400).json({ error: 'title and pillar required' })
    const md      = fs.readFileSync(IDEAS, 'utf8')
    const ideas   = parseIdeas(md)
    const nextId  = ideas.length ? Math.max(...ideas.map(i => i.id)) + 1 : 1
    const newRow  = `| ${nextId} | ${title} | ${pillar} | 0 | ${source} | ${status} |`
    fs.writeFileSync(IDEAS, md.trimEnd() + '\n' + newRow + '\n')
    res.json({ id: nextId, title, pillar, score: 0, source, status, isNew: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ─── Captures ────────────────────────────────────────────────────────────────

app.get('/api/captures', (_req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(CAPS, 'utf8')))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// SSE — streams capture.sh output live
app.get('/api/capture/run', (req, res) => {
  const { url, note, end } = req.query
  if (!url || !note) return res.status(400).end('url and note required')
  const args = [path.join(CM_DIR, 'capture.sh'), url, note]
  if (end) args.push(String(end))
  sse(res, 'bash', args)
})

// ─── Deploy ──────────────────────────────────────────────────────────────────

app.get('/api/deploy', (_req, res) => {
  sse(res, 'bash', [path.join(CM_DIR, 'deploy.sh')])
})

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n◈  Content Machine  →  http://localhost:${PORT}\n`)
})
