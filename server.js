const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

// Ensure reports directory exists
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:8080'}`);
  let reqPath = urlObj.pathname;

  // 1. Save Report Endpoint (Receives PDF from client, writes file, returns persistent URLs)
  if (req.method === 'POST' && reqPath === '/api/save-report') {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      try {
        const fullBody = Buffer.concat(body).toString('utf8');
        const parsed = JSON.parse(fullBody);
        let filename = parsed.filename || `Pavement_Design_Report_${Date.now()}.pdf`;
        let base64Data = parsed.pdfBase64 || '';

        // Robustly extract base64 payload regardless of data URI header attributes
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        const pdfBuffer = Buffer.from(base64Data, 'base64');

        if (!filename.toLowerCase().endsWith('.pdf')) {
          filename += '.pdf';
        }

        // Save real PDF file to disk in ./reports
        const filePath = path.join(reportsDir, filename);
        fs.writeFileSync(filePath, pdfBuffer);
        console.log(`[REPORT SAVED] ${filename} (${pdfBuffer.length} bytes)`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          filename: filename,
          downloadUrl: `/reports/${encodeURIComponent(filename)}?dl=1`,
          previewUrl: `/reports/${encodeURIComponent(filename)}`
        }));
      } catch (err) {
        console.error('Save Report Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 2. Serve Reports with explicit Attachment vs Inline Content-Disposition headers
  if (reqPath.startsWith('/reports/')) {
    const filename = decodeURIComponent(path.basename(reqPath));
    const filePath = path.join(reportsDir, filename);

    if (fs.existsSync(filePath)) {
      const isDownload = urlObj.searchParams.get('dl') === '1';
      const disposition = isDownload ? 'attachment' : 'inline';

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(filePath).pipe(res);
      console.log(`[SERVE REPORT] ${filename} as ${disposition}`);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Report file not found');
      return;
    }
  }

  // 3. Static File Serving
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
