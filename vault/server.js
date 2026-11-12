// 사진 보관소 — 의존성 없는 Node 서버. 실행: node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PIN = process.env.VAULT_PIN || '10214';
const DATA = process.env.VAULT_DATA || path.join(__dirname, 'data');
const INDEX = path.join(DATA, 'index.json');
const MAX_BYTES = 2 * 1024 ** 3; // 파일당 2GB
fs.mkdirSync(DATA, { recursive: true });

let meta = {};
try { meta = JSON.parse(fs.readFileSync(INDEX, 'utf8')); } catch {}
const saveMeta = () => fs.writeFileSync(INDEX, JSON.stringify(meta));

const sessions = new Map(); // token -> expiry
const fails = new Map();    // ip -> {n, until}
const sha = s => crypto.createHash('sha256').update(s).digest();
const TYPES = { html: 'text/html; charset=utf-8', js: 'text/javascript', css: 'text/css' };

const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const cookie = req => Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')));
const authed = req => { const t = cookie(req).vault; const e = sessions.get(t); return e && e > Date.now(); };

function login(req, res) {
  const ip = req.socket.remoteAddress;
  const f = fails.get(ip) || { n: 0, until: 0 };
  if (f.until > Date.now()) return json(res, 429, { error: '잠시 후 다시 시도하세요' });
  let body = '';
  req.on('data', c => { body += c; if (body.length > 1000) req.destroy(); });
  req.on('end', () => {
    let pin = ''; try { pin = String(JSON.parse(body).pin); } catch {}
    if (crypto.timingSafeEqual(sha(pin), sha(PIN))) {
      fails.delete(ip);
      const t = crypto.randomBytes(24).toString('hex');
      sessions.set(t, Date.now() + 12 * 3600e3);
      res.setHeader('Set-Cookie', `vault=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200`);
      return json(res, 200, { ok: true });
    }
    f.n++; if (f.n >= 5) { f.until = Date.now() + 60e3 * Math.min(f.n - 4, 30); }
    fails.set(ip, f);
    json(res, 401, { error: '비밀번호가 틀렸습니다' });
  });
}

function upload(req, res, url) {
  const name = (url.searchParams.get('name') || 'file').replace(/[\\/\0]/g, '_').slice(0, 200);
  const id = crypto.randomBytes(8).toString('hex');
  const file = path.join(DATA, id);
  const out = fs.createWriteStream(file);
  let size = 0, aborted = false;
  req.on('data', c => { size += c.length; if (size > MAX_BYTES && !aborted) { aborted = true; req.destroy(); out.destroy(); fs.rm(file, () => {}); } });
  req.pipe(out);
  out.on('finish', () => {
    if (aborted) return;
    meta[id] = { name, size, type: req.headers['content-type'] || 'application/octet-stream', added: Date.now() };
    saveMeta();
    json(res, 200, { id });
  });
  out.on('error', () => json(res, 500, { error: '저장 실패' }));
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  if (p === '/api/login' && req.method === 'POST') return login(req, res);
  if (p.startsWith('/api/')) {
    if (!authed(req)) return json(res, 401, { error: 'locked' });
    if (p === '/api/files') return json(res, 200, Object.entries(meta).map(([id, m]) => ({ id, ...m })).sort((a, b) => b.added - a.added));
    if (p === '/api/upload' && req.method === 'POST') return upload(req, res, url);
    if (p === '/api/logout') { sessions.delete(cookie(req).vault); return json(res, 200, { ok: true }); }
    const m = p.match(/^\/api\/(file|download|delete)\/([0-9a-f]{16})$/);
    if (m && meta[m[2]]) {
      const [, act, id] = m, info = meta[id], fp = path.join(DATA, id);
      if (act === 'delete' && req.method === 'DELETE') { delete meta[id]; saveMeta(); fs.rm(fp, () => {}); return json(res, 200, { ok: true }); }
      if (act !== 'delete') {
        const size = fs.statSync(fp).size;
        const h = { 'Content-Type': info.type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=3600' };
        if (act === 'download') h['Content-Disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(info.name)}`;
        let range = (req.headers.range || '').match(/bytes=(\d*)-(\d*)/), s = 0, e = size - 1, code = 200;
        if (range && (range[1] || range[2])) {
          if (range[1]) { s = +range[1]; if (range[2]) e = Math.min(+range[2], size - 1); } else { s = Math.max(0, size - +range[2]); }
          if (s > e) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); return res.end(); }
          code = 206; h['Content-Range'] = `bytes ${s}-${e}/${size}`;
        }
        h['Content-Length'] = e - s + 1;
        res.writeHead(code, h);
        return fs.createReadStream(fp, { start: s, end: e }).pipe(res);
      }
    }
    return json(res, 404, { error: 'not found' });
  }
  const f = p === '/' ? 'index.html' : p.slice(1);
  const fp = path.join(__dirname, 'public', path.normalize(f));
  if (!fp.startsWith(path.join(__dirname, 'public') + path.sep) || !fs.existsSync(fp)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(fp).slice(1)] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
}).listen(PORT, () => console.log(`보관소 실행 중: http://localhost:${PORT}`));
