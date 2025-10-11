const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HELLO_MESSAGE = process.env.HELLO_MESSAGE || 'Hello World!';

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint (required for Coolify)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown'
  });
});

// Main route
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World - Coolify</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 60px 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 600px;
            width: 100%;
        }
        h1 {
            font-size: 3rem;
            color: #333;
            margin-bottom: 20px;
            animation: fadeInDown 0.8s ease-out;
        }
        .message {
            font-size: 1.5rem;
            color: #667eea;
            margin-bottom: 30px;
            animation: fadeInUp 0.8s ease-out 0.2s backwards;
        }
        .info {
            background: #f7f7f7;
            border-radius: 10px;
            padding: 20px;
            margin-top: 30px;
            animation: fadeInUp 0.8s ease-out 0.4s backwards;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-item:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #666;
        }
        .info-value {
            color: #333;
            font-family: 'Courier New', monospace;
        }
        .badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            margin-top: 20px;
            animation: fadeInUp 0.8s ease-out 0.6s backwards;
        }
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @media (max-width: 600px) {
            h1 {
                font-size: 2rem;
            }
            .message {
                font-size: 1.2rem;
            }
            .container {
                padding: 40px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 ${escapeHtml(HELLO_MESSAGE)}</h1>
        <p class="message">Your Coolify deployment is working perfectly!</p>

        <div class="info">
            <div class="info-item">
                <span class="info-label">Environment:</span>
                <span class="info-value">${escapeHtml(process.env.NODE_ENV || 'production')}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Node Version:</span>
                <span class="info-value">${process.version}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Port:</span>
                <span class="info-value">${PORT}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Uptime:</span>
                <span class="info-value">${formatUptime(process.uptime())}</span>
            </div>
        </div>

        <div class="badge">Deployed with Coolify</div>
    </div>
</body>
</html>
  `;
  res.send(html);
});

// API endpoint for JSON response
app.get('/api/info', (req, res) => {
  res.json({
    message: HELLO_MESSAGE,
    environment: process.env.NODE_ENV || 'production',
    nodeVersion: process.version,
    port: PORT,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Not Found</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
            padding: 20px;
        }
        h1 { font-size: 4rem; margin-bottom: 20px; }
        p { font-size: 1.5rem; }
        a { color: white; text-decoration: underline; }
    </style>
</head>
<body>
    <div>
        <h1>404</h1>
        <p>Page not found</p>
        <p><a href="/">Go back home</a></p>
    </div>
</body>
</html>
  `);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Hello World Server Started               ║
╠════════════════════════════════════════════╣
║   Port:        ${PORT.toString().padEnd(28)} ║
║   Environment: ${(process.env.NODE_ENV || 'production').padEnd(28)} ║
║   Node:        ${process.version.padEnd(28)} ║
╚════════════════════════════════════════════╝
  `);
});

// Helper functions
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
