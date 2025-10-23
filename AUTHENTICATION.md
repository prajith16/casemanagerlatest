# CaseManager API Authentication

## Overview

The CaseManager API uses JWT (JSON Web Token) authentication for securing endpoints.

## Configuration

JWT settings are configured in `appsettings.json`:

```json
{
  "JwtSettings": {
    "Issuer": "CaseManagerApi",
    "Audience": "CaseManagerClient",
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong123456"
  }
}
```

**Note:** Change the `SecretKey` in production environments!

## Authentication Flow

### 1. Login

**Endpoint:** `POST /api/authorization/login`

**Request Body:**

```json
{
  "userName": "jdoe"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "userName": "jdoe",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Using the Token

Include the JWT token in the `Authorization` header for all protected API calls:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Logout

**Endpoint:** `POST /api/authorization/logout`

Logout is handled client-side by removing the token from storage.

## JWT Token Claims

The JWT token contains the following claims:

- `sub`: Username
- `userId`: User's database ID
- `userName`: Username
- `correlationId`: Unique correlation ID for request tracking
- `jti`: JWT ID (unique identifier)

## Token Expiration

Tokens expire after **8 hours** from issuance.

## Swagger/OpenAPI

Swagger UI includes JWT authentication support:

1. Click the "Authorize" button in Swagger UI
2. Enter `Bearer {your-token}` in the value field
3. Click "Authorize"

## Testing with cURL

### Login

```bash
curl -X POST http://localhost:5226/api/authorization/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"jdoe"}'
```

### Access Protected Endpoint

```bash
curl -X GET http://localhost:5226/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Notes

- No password is required (username-only authentication)
- Ensure HTTPS is used in production
- Change the SecretKey before deploying to production
- Token expiration is set to 8 hours
- Consider implementing token refresh mechanism for production use
