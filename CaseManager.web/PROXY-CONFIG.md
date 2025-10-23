# Proxy Configuration

This document explains the proxy setup for the CaseManager Angular application.

## Files

### proxy.conf.json

Located at the root of the Angular project, this file configures the proxy to forward API requests to the backend server.

```json
{
  "/api": {
    "target": "http://localhost:5226",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Configuration Details:**

- `/api` - All requests starting with `/api` will be proxied
- `target` - Backend server URL (ASP.NET Core API)
- `secure: false` - Allows HTTP connections (set to true for HTTPS)
- `changeOrigin: true` - Changes the origin header to the target URL
- `logLevel: "debug"` - Shows proxy activity in console

### angular.json

The proxy configuration is referenced in the serve options:

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  },
  ...
}
```

### environment.ts

The environment file now uses relative URLs:

```typescript
export const environment = {
  production: false,
  apiUrl: '/api',
};
```

## How It Works

1. Angular app runs on `http://localhost:4200`
2. When the app makes a request to `/api/users`, the proxy intercepts it
3. The proxy forwards the request to `http://localhost:5226/api/users`
4. The backend responds, and the proxy sends the response back to Angular

## Benefits

- **No CORS issues** - Both frontend and backend appear to be on the same origin
- **Simplified configuration** - No need to hardcode backend URLs
- **Development convenience** - Easy to switch between local and remote backends
- **Production ready** - Same code works in production with proper routing

## Running the Application

The proxy is automatically used when running:

```bash
npm start
# or
ng serve
```

The backend must be running on `http://localhost:5226` for the proxy to work.

## Production Deployment

In production, you would typically:

1. Build the Angular app: `npm run build`
2. Configure your web server (nginx, IIS, etc.) to route `/api/*` to the backend
3. Serve the Angular static files from the same domain

This maintains the same-origin policy and eliminates CORS concerns.
