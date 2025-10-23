# Frontend Authentication Implementation

## Overview

The Angular frontend now includes complete authentication functionality with JWT token management.

## Components Created

### 1. **AuthService** (`src/app/services/auth.service.ts`)

Manages authentication state and API calls:

- `login(request)`: Authenticates user and stores token
- `logout()`: Logs out user and clears token
- `getToken()`: Retrieves JWT token from localStorage
- `isAuthenticated()`: Checks if user is authenticated
- `currentUser$`: Observable of current user state

### 2. **AuthGuard** (`src/app/guards/auth.guard.ts`)

Protects routes from unauthorized access:

- Checks if user is authenticated
- Redirects to `/login` if not authenticated
- Applied to all user, case, and task-action routes

### 3. **AuthInterceptor** (`src/app/interceptors/auth.interceptor.ts`)

Automatically adds JWT token to all HTTP requests:

- Intercepts outgoing HTTP requests
- Adds `Authorization: Bearer {token}` header
- Registered in `app.config.ts`

### 4. **LoginComponent** (`src/app/components/login/login.component.ts`)

Login page with username-only authentication:

- Material Design form with username field
- Displays error messages on failed login
- Redirects to `/users` on successful login
- Stores user info and token in localStorage

### 5. **Updated AppComponent**

Navigation toolbar with authentication features:

- Shows/hides toolbar based on authentication status
- Displays current user's name with account icon
- Logout button that clears token and redirects to login
- Material icons for all navigation items

## Routes Configuration

All routes except `/login` are protected by `authGuard`:

```typescript
{ path: 'login', component: LoginComponent }  // Public
{ path: 'users', component: UserListComponent, canActivate: [authGuard] }  // Protected
{ path: 'cases', component: CaseListComponent, canActivate: [authGuard] }  // Protected
{ path: 'task-actions', component: TaskActionListComponent, canActivate: [authGuard] }  // Protected
```

## Authentication Flow

### Login Process:

1. User enters username on login page
2. Frontend sends POST to `/api/authorization/login`
3. Backend validates username exists in Users table
4. Backend generates JWT token with claims (userId, userName, firstName, lastName, correlationId)
5. Frontend receives token and user info
6. Token stored in localStorage
7. User redirected to `/users` page

### Authenticated API Calls:

1. User makes request (e.g., GET /api/users)
2. AuthInterceptor adds `Authorization: Bearer {token}` header
3. Backend validates JWT token
4. API responds with data

### Logout Process:

1. User clicks Logout button
2. Frontend sends POST to `/api/authorization/logout`
3. Token removed from localStorage
4. User redirected to `/login` page

## Storage

- **Token**: Stored in localStorage as `auth_token`
- **User Info**: Stored in localStorage as `auth_user` (JSON)

## Testing

### 1. Login with existing user:

- Open browser to `http://localhost:4200`
- Will redirect to `/login`
- Enter username: `jdoe` (or `asmith`, `bjones`)
- Click Login
- Should redirect to Users page with toolbar visible

### 2. Access protected route without login:

- Clear localStorage or use incognito mode
- Try to access `http://localhost:4200/users`
- Should redirect to `/login`

### 3. Logout:

- Click Logout button in toolbar
- Should redirect to login page
- Toolbar should disappear

## Available Test Users

From the seeded database:

- `jdoe` - John Doe
- `asmith` - Alice Smith
- `bjones` - Bob Jones

## Security Features

- All routes protected by auth guard
- JWT token automatically included in API calls
- Token stored securely in localStorage
- Automatic redirect to login on authentication failure
- Logout clears all authentication data

## Browser Console Commands

For testing/debugging:

```javascript
// Check if authenticated
localStorage.getItem("auth_token");

// Get current user
localStorage.getItem("auth_user");

// Manually clear authentication
localStorage.clear();
```

## Material Icons

All navigation and action buttons now use Material Icons:

- `people` - Users
- `work` - Cases
- `task` - Task Actions
- `account_circle` - User profile
- `login` - Login action
- `logout` - Logout action
- `person` - Username input prefix
