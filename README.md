# CaseManager - Full Stack Application

A comprehensive case management system built with ASP.NET Core Web API backend and Angular frontend, featuring Material UI and Everforest dark theme.

## 🚀 Features

### Backend (ASP.NET Core Web API)

- **User Management**: Create, read, update, and delete users
- **Case Management**: Manage cases with assignment and completion tracking
- **Task Action Management**: Track task actions associated with cases
- **RESTful API**: Full CRUD operations for all entities
- **Swagger Documentation**: Interactive API documentation at the root URL
- **Repository Pattern**: Clean architecture with repository and service layers
- **Dependency Injection**: Properly configured DI container
- **SQLite Database**: Lightweight database with seeded sample data
- **XML Documentation**: Comprehensive API documentation
- **CORS Enabled**: Configured for Angular frontend

### Frontend (Angular + Material UI)

- **Modern Angular**: Standalone components with latest Angular features
- **Material Design**: Angular Material UI components
- **Everforest Theme**: Beautiful dark theme with nature-inspired colors
- **Responsive Design**: Works on all device sizes
- **SCSS Styling**: Advanced styling with variables and mixins
- **Type Safety**: Full TypeScript support with interfaces
- **Service Layer**: Clean separation of concerns
- **Routing**: Full navigation support for all views
- **Proxy Configuration**: Development proxy for seamless API integration

## 📋 Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) or later
- [Node.js](https://nodejs.org/) (v18 or later) and npm
- Any IDE (Visual Studio, Visual Studio Code, JetBrains Rider)

## 🏗️ Project Structure

```
CaseManager/
├── CaseManager.sln                    # Solution file
├── start.sh                           # Startup script for both apps
├── README.md                          # This file
├── .gitignore                         # Git ignore file
│
├── CaseManager.Api/                   # Backend Web API project
│   ├── Controllers/                   # API Controllers
│   │   ├── UsersController.cs
│   │   ├── CasesController.cs
│   │   └── TaskActionsController.cs
│   ├── Data/                          # Database context
│   │   └── CaseManagerDbContext.cs
│   ├── Models/                        # Domain models
│   │   ├── User.cs
│   │   ├── Case.cs
│   │   └── TaskAction.cs
│   ├── Repositories/                  # Repository pattern
│   │   ├── IRepository.cs
│   │   └── Repository.cs
│   ├── Services/                      # Business logic layer
│   │   ├── IUserService.cs
│   │   ├── UserService.cs
│   │   ├── ICaseService.cs
│   │   ├── CaseService.cs
│   │   ├── ITaskActionService.cs
│   │   └── TaskActionService.cs
│   ├── appsettings.json              # Configuration
│   ├── Program.cs                     # Application entry point
│   └── CaseManager.Api.csproj        # Project file
│
└── CaseManager.web/                   # Frontend Angular project
    ├── src/
    │   ├── app/
    │   │   ├── components/            # Angular components
    │   │   │   ├── users/            # User module
    │   │   │   │   ├── user-list.component.ts
    │   │   │   │   ├── user-detail.component.ts
    │   │   │   │   └── user-form.component.ts
    │   │   │   ├── cases/            # Case module
    │   │   │   │   ├── case-list.component.ts
    │   │   │   │   ├── case-detail.component.ts
    │   │   │   │   └── case-form.component.ts
    │   │   │   └── task-actions/     # TaskAction module
    │   │   │       ├── task-action-list.component.ts
    │   │   │       └── task-action-detail.component.ts
    │   │   ├── models/                # TypeScript interfaces
    │   │   │   ├── user.model.ts
    │   │   │   ├── case.model.ts
    │   │   │   └── task-action.model.ts
    │   │   ├── services/              # API services
    │   │   │   ├── user.service.ts
    │   │   │   ├── case.service.ts
    │   │   │   └── task-action.service.ts
    │   │   ├── app.component.ts
    │   │   ├── app.routes.ts
    │   │   └── app.config.ts
    │   ├── environments/              # Environment configs
    │   ├── theme.scss                 # Everforest theme
    │   └── styles.scss                # Global styles
    ├── proxy.conf.json                # Proxy configuration for dev
    ├── PROXY-CONFIG.md                # Proxy documentation
    ├── package.json
    └── angular.json
```

## 🔧 Installation & Setup

1. **Clone or navigate to the project directory**

   ```bash
   cd /Users/prajith/Documents/Sandbox/DotNet/csharp-sdk/CaseManager
   ```

2. **Restore dependencies**

   ```bash
   dotnet restore
   ```

3. **Build the solution**

   ```bash
   dotnet build
   ```

4. **Run the application**

   ```bash
   cd CaseManager.Api
   dotnet run
   ```

5. **Access the API**
   - The application will start on `http://localhost:5226`
   - Swagger UI is available at the root: `http://localhost:5226`

## 📊 Database

The application uses SQLite with Entity Framework Core. The database is automatically created on first run with seeded sample data.

### Models

#### User

- `UserId` (int): Unique identifier
- `UserName` (string): Username
- `FirstName` (string): First name
- `LastName` (string): Last name
- `Address` (string): Address

#### Case

- `CaseId` (int): Unique identifier
- `CaseName` (string): Case title/description
- `IsComplete` (bool): Whether the case is complete
- `CanComplete` (bool): Whether the case can be completed
- `AssignedUserId` (int): User ID to whom the case is assigned

#### TaskAction

- `TaskActionId` (int): Unique identifier
- `TaskActionName` (string): Task action description
- `CaseId` (int): Associated case ID
- `UserId` (int): User ID responsible for this task

### Sample Data

The database is seeded with:

- 3 Users (John Doe, Alice Smith, Bob Jones)
- 3 Cases (Customer Support Request, Technical Issue Investigation, Account Verification)
- 4 Task Actions associated with various cases

## 🔌 API Endpoints

### Users API (`/api/users`)

- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/{id}` - Update an existing user
- `DELETE /api/users/{id}` - Delete a user

### Cases API (`/api/cases`)

- `GET /api/cases` - Get all cases
- `GET /api/cases/{id}` - Get case by ID
- `POST /api/cases` - Create a new case
- `PUT /api/cases/{id}` - Update an existing case
- `DELETE /api/cases/{id}` - Delete a case

### Task Actions API (`/api/taskactions`)

- `GET /api/taskactions` - Get all task actions
- `GET /api/taskactions/{id}` - Get task action by ID
- `POST /api/taskactions` - Create a new task action
- `PUT /api/taskactions/{id}` - Update an existing task action
- `DELETE /api/taskactions/{id}` - Delete a task action

## 📖 API Documentation

Interactive API documentation is available via Swagger UI:

- Navigate to `http://localhost:5226` when the application is running
- All endpoints are documented with descriptions, request/response schemas, and example values
- You can test the API directly from the Swagger UI

## 🔌 Proxy Configuration

The Angular application uses a proxy configuration for seamless API integration during development:

- **proxy.conf.json**: Forwards `/api` requests to `http://localhost:5226`
- **Benefits**:
  - No CORS issues during development
  - Simplified service configuration with relative URLs
  - Same-origin policy compliance
- **How it works**: Angular runs on port 4200, proxy forwards API calls to backend on port 5226
- **Documentation**: See `CaseManager.web/PROXY-CONFIG.md` for detailed information

The proxy is automatically used when running the Angular dev server.

## 🧪 Example API Calls

### Create a new user

```bash
curl -X POST "http://localhost:5226/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "address": "123 Test St, Test City, TC 12345"
  }'
```

### Get all cases

```bash
curl -X GET "http://localhost:5226/api/cases"
```

### Update a case

```bash
curl -X PUT "http://localhost:5226/api/cases/1" \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": 1,
    "caseName": "Updated Case Name",
    "isComplete": true,
    "canComplete": true,
    "assignedUserId": 2
  }'
```

## 🛠️ Technologies Used

### Backend

- **ASP.NET Core 8.0** - Web framework
- **Entity Framework Core 9.0** - ORM
- **SQLite** - Database
- **Swashbuckle.AspNetCore** - Swagger/OpenAPI documentation
- **Repository Pattern** - Data access abstraction
- **Dependency Injection** - Built-in DI container

### Frontend

- **Angular 20** - Modern web framework with standalone components
- **Angular Material** - Material Design components
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **SCSS** - Advanced CSS with variables and mixins
- **Everforest Theme** - Beautiful dark color scheme

## 📝 Configuration

The connection string is configured in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=casemanager.db"
  }
}
```

## 🎯 Architecture

### Backend Architecture

The backend follows a layered architecture:

1. **Controllers**: Handle HTTP requests and responses
2. **Services**: Business logic layer
3. **Repositories**: Data access layer
4. **Models**: Domain entities
5. **Data**: Database context and configuration

### Frontend Architecture

The frontend follows Angular best practices:

1. **Components**: Standalone components with inline templates
2. **Services**: HTTP client services for API communication
3. **Models**: TypeScript interfaces matching backend DTOs
4. **Routing**: Configured routes for all views
5. **Material UI**: Consistent design system across the app

## 🎨 Frontend Features

### User Module

- **List View**: Table displaying all users with search and actions
- **Detail View**: Display user information
- **Add/Edit Form**: Reactive form with validation for creating/updating users
- **Delete**: Confirmation dialog before deletion

### Case Module

- **List View**: Table displaying all cases with status indicators
- **Detail View**: Display case details and related information
- **Add/Edit Form**: Form for managing case properties including assignment
- **Delete**: Safe deletion with confirmation

### TaskAction Module

- **List View**: Table displaying all task actions
- **Detail View**: Display task action details

All modules feature:

- Responsive design
- Loading states
- Error handling
- Everforest dark theme styling

## 🤝 Contributing

Feel free to fork the project and submit pull requests for any improvements.

## 📄 License

This project is open source and available under the MIT License.

## 👥 Authors

CaseManager Team

## 📞 Support

For support, email support@casemanager.com
