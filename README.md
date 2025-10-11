# Hello World - Coolify Deployment Example

A simple, production-ready "Hello World" web application designed for deployment via Coolify. This project demonstrates best practices for Docker Compose, environment configuration, and Coolify integration.

## Features

- **Minimal Node.js/Express Application** - Lightweight and fast
- **Health Check Endpoint** - `/health` endpoint for monitoring
- **Beautiful UI** - Responsive design with gradient background
- **Environment-Based Configuration** - Customizable via environment variables
- **Security Best Practices** - Runs as non-root user, no exposed ports in production
- **Development/Production Separation** - Override file for local development

## Project Structure

```
hello-world-coolify/
├── src/
│   └── server.js                          # Main application server
├── public/                                # Static assets (if needed)
├── docker-compose.yaml                    # Production compose (for Coolify)
├── docker-compose.override.yaml.example   # Local dev template
├── Dockerfile                             # Production Docker image
├── .dockerignore                          # Docker build exclusions
├── .gitignore                             # Git exclusions
├── .env.example                           # Environment variable template
├── package.json                           # Node.js dependencies
└── README.md                              # This file
```

## Quick Start

### Local Development

1. **Clone the repository** (or copy this folder)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create local environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Create Docker override file:**
   ```bash
   cp docker-compose.override.yaml.example docker-compose.override.yaml
   ```

5. **Start the application:**
   ```bash
   # Option A: Run directly with Node.js
   npm start

   # Option B: Run with Docker Compose
   docker-compose up
   ```

6. **Access the application:**
   - Main page: http://localhost:3000
   - Health check: http://localhost:3000/health
   - API info: http://localhost:3000/api/info

### Coolify Deployment

1. **Push to Git Repository:**
   ```bash
   git add .
   git commit -m "Initial commit: Hello World Coolify app"
   git push origin main
   ```

2. **Create New Resource in Coolify:**
   - Go to your Coolify dashboard
   - Click "New Resource"
   - Select "Public Repository" or connect via GitHub App
   - Enter your repository URL

3. **Configure Build Settings:**
   - **Build Pack:** Docker Compose
   - **Compose File Location:** `/docker-compose.yaml` (or path relative to repo root)
   - **Base Directory:** `apps/common/hello-world-coolify` (if in a monorepo)

4. **Set Environment Variables in Coolify UI:**
   ```
   PORT=3000
   NODE_ENV=production
   HELLO_MESSAGE=Hello from Coolify!
   ```

5. **Assign Domain:**
   - In Coolify UI, go to your service
   - Set domain (e.g., `https://hello.example.com`)
   - If app listens on port 3000, specify: `https://hello.example.com:3000`
   - Coolify exposes it as standard `https://hello.example.com`

6. **Deploy:**
   - Click "Deploy" button
   - Monitor build logs
   - Access your application at the assigned domain

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Application port | `3000` | No |
| `NODE_ENV` | Environment mode | `production` | No |
| `HELLO_MESSAGE` | Custom greeting message | `Hello World!` | No |
| `DOCKER_RESTART_POLICY` | Container restart policy | `unless-stopped` | No |
| `DOCKER_WEB_HEALTHCHECK_TEST` | Health check command | Node.js HTTP check | No |

## Endpoints

### `GET /`
Main application page with a beautiful UI displaying:
- Custom hello message
- Environment information
- Node version
- Port number
- Server uptime

**Response:** HTML page

### `GET /health`
Health check endpoint for monitoring and Coolify health checks.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-11T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "production"
}
```

### `GET /api/info`
JSON API endpoint returning application information.

**Response:**
```json
{
  "message": "Hello from Coolify!",
  "environment": "production",
  "nodeVersion": "v20.11.0",
  "port": 3000,
  "uptime": 3600.5,
  "timestamp": "2025-01-11T10:30:00.000Z"
}
```

## Development Workflow

### Hot Reloading (Node.js Watch Mode)

```bash
npm run dev
```

Uses Node.js built-in watch mode (Node 20+) to automatically restart on file changes.

### Docker Development

```bash
# Start with volume mounting for live code updates
docker-compose up

# Rebuild after dependency changes
docker-compose up --build

# Stop containers
docker-compose down
```

The `docker-compose.override.yaml` file:
- Exposes port 3000 to localhost
- Mounts source code for live updates
- Disables restart policy
- Sets development environment

## Production Considerations

### Security

- **Non-root user:** Container runs as `appuser` (UID 1000)
- **No exposed ports:** Coolify handles routing via Traefik proxy
- **Environment-based secrets:** No hard-coded credentials

### Health Checks

The application includes Docker health checks:
- **Interval:** Every 60 seconds
- **Timeout:** 3 seconds
- **Start period:** 5 seconds
- **Retries:** 3 attempts before marking unhealthy

Health check hits `/health` endpoint and verifies 200 response.

### Resource Requirements

**Minimal footprint:**
- **Base Image:** `node:20-alpine` (~40MB compressed)
- **Application:** ~5MB
- **Memory:** ~50MB runtime
- **CPU:** Minimal (single-threaded Express)

### Restart Policy

Default: `unless-stopped`
- Automatically restarts on failure
- Survives server reboots
- Stops only on manual intervention

## Customization

### Change the Greeting Message

**Option 1: Environment Variable**
```bash
# Coolify UI
HELLO_MESSAGE=Welcome to My App!

# Local .env
export HELLO_MESSAGE=Welcome to My App!
```

**Option 2: Modify Source Code**

Edit `src/server.js`:
```javascript
const HELLO_MESSAGE = process.env.HELLO_MESSAGE || 'Your Custom Message';
```

### Add Static Assets

Place files in `public/` directory. They're automatically served:
- `public/favicon.ico` → Available at `/favicon.ico`
- `public/images/logo.png` → Available at `/images/logo.png`
- `public/styles.css` → Available at `/styles.css`

### Add New Routes

Edit `src/server.js`:
```javascript
app.get('/api/hello/:name', (req, res) => {
  res.json({ message: `Hello, ${req.params.name}!` });
});
```

## Troubleshooting

### Port Already in Use (Local Development)

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or change port in .env
export PORT=3001
```

### Health Check Failing in Coolify

1. Verify app listens on correct port:
   ```javascript
   app.listen(PORT, '0.0.0.0', ...)  // Not 'localhost'
   ```

2. Check Coolify domain configuration:
   - Ensure port matches: `https://domain.com:3000` tells Coolify to route to port 3000

3. Check logs in Coolify UI for startup errors

### Cannot Access Application in Coolify

1. **Verify domain assignment** in Coolify UI
2. **Check environment variables** are set correctly
3. **Ensure no port exposure** in `docker-compose.yaml` (should have no `ports:` section)
4. **Review Traefik labels** (Coolify adds these automatically)

### Build Failures

1. **Check Dockerfile** syntax
2. **Verify dependencies** in `package.json`
3. **Review build logs** in Coolify UI
4. **Test locally:**
   ```bash
   docker build -t hello-test .
   docker run -p 3000:3000 hello-test
   ```

## Best Practices Implemented

✅ **Single `docker-compose.yaml`** - Even for single-service app
✅ **No port exposure in production** - Let Coolify handle routing
✅ **Environment variables** - Configurable via `.env`
✅ **Override file for dev** - Keeps production config clean
✅ **Health checks included** - Monitor application health
✅ **Non-root user** - Security best practice
✅ **Production defaults** - Override in dev, not prod
✅ **Documentation** - Comprehensive README and examples

## References

- [Coolify Documentation](https://coolify.io/docs)
- [Docker Compose Specification](https://docs.docker.com/compose/compose-file/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## License

MIT

## Support

For Coolify-specific issues, consult the [Coolify documentation](https://coolify.io/docs) or [community forum](https://coolify.io/discord).

For application issues, review the troubleshooting section above or check application logs.
