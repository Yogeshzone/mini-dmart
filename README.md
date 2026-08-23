# 🛒 Mini DMart

Mini DMart is a full-stack grocery shopping web application that provides a simple and convenient platform for customers to browse products, manage their cart, place orders, make payments, request returns/exchanges, and manage their profiles.

The application also provides an **Admin Panel** for managing products, categories, users, orders, inventory, payments, returns, exchanges, reviews, pickup slots, and audit logs.

---

## 📌 Project Overview

Mini DMart is designed as a real-world e-commerce grocery application with separate functionality for:

- 👤 Customers
- 🛡️ Administrators

The backend is developed using **Java and Spring Boot** and provides REST APIs for the frontend. Authentication and authorization are implemented using **JWT-based security**.

The frontend is built using **HTML, CSS, and JavaScript** and communicates with the Spring Boot backend through REST APIs.

---

## 🚀 Features

### 👤 Customer Features

- User registration and login
- JWT-based authentication
- Role-based access
- Browse products
- Search products
- View product details
- Browse products by category
- Add products to cart
- Update cart quantities
- Remove products from cart
- Place orders
- View order history
- View order details
- Payment management
- Manage customer profile
- Add and manage delivery address
- Submit product reviews
- View product reviews
- Request product returns
- Request product exchanges
- Select pickup slots
- Logout securely

---

### 🛡️ Admin Features

- Admin authentication
- Admin dashboard
- Product management
- Category management
- User management
- Order management
- Inventory management
- Payment management
- Return management
- Exchange management
- Review management
- Pickup slot management
- Audit log management
- Role-based authorization
- Update order status
- Update inventory
- Approve/reject returns and exchanges
- Approve/reject customer reviews

---

## 🧰 Technology Stack

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- REST APIs
- JWT Authentication
- Maven
- PostgreSQL

### Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API
- Responsive UI

### Development Tools

- Eclipse / Spring Tool Suite
- Visual Studio Code
- PostgreSQL
- pgAdmin
- Git
- GitHub

---

## 🏗️ Project Structure

```text
mini-dmart/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/dmart/mini_dmart/
│   │   │   │       ├── config/
│   │   │   │       ├── controller/
│   │   │   │       ├── dto/
│   │   │   │       ├── entity/
│   │   │   │       ├── exception/
│   │   │   │       ├── repository/
│   │   │   │       ├── security/
│   │   │   │       ├── service/
│   │   │   │       └── util/
│   │   │   │
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   │
│   │   └── test/
│   │
│   ├── pom.xml
│   ├── .env.example
│   ├── .gitignore
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── admin/
│   ├── css/
│   ├── js/
│   ├── pages/
│   ├── customer/
│   ├── index.html
│   ├── login.html
│   └── register.html
│
└── README.md
```

---

## 🔐 Authentication & Authorization

Mini DMart uses **JWT (JSON Web Token)** based authentication.

### Authentication Flow

```text
Customer/Admin
      │
      ▼
   Login
      │
      ▼
Spring Boot Authentication API
      │
      ▼
 Validate Credentials
      │
      ▼
 Generate JWT Token
      │
      ▼
Frontend stores token
      │
      ▼
Token sent with protected API requests
      │
      ▼
JWT Authentication Filter
      │
      ▼
Role-Based Authorization
```

Two main roles are supported:

- `CUSTOMER`
- `ADMIN`

Administrators are redirected to the Admin Dashboard after successful login, while customers are redirected to the customer application.

---

## 🗄️ Database

The application uses **PostgreSQL** as the relational database.

The backend uses:

- Spring Data JPA
- Hibernate
- Entity relationships
- Repository layer
- Service layer

Main entities include:

- User
- Role
- Product
- Category
- Cart
- CartItem
- Order
- OrderItem
- Payment
- Review
- ReturnRequest
- ExchangeRequest
- PickupSlot
- AuditLog

---

## 🔒 Environment Variables

Sensitive configuration values are not stored directly in the repository.

The backend uses environment variables for database credentials and JWT configuration.

Example:

```env
DB_URL=your_database_url
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret
```

The actual `.env` file and sensitive credentials should never be committed to GitHub.

Refer to:

```text
backend/.env.example
```

for the required environment variables.

---

## ⚙️ Running the Backend Locally

### 1. Clone the repository

```bash
git clone https://github.com/Yogeshzone/mini-dmart.git
```

### 2. Open the backend

```text
mini-dmart/backend
```

### 3. Configure environment variables

Create your environment configuration using:

```text
backend/.env.example
```

Provide your PostgreSQL database credentials and JWT secret.

### 4. Create the PostgreSQL database

Create a PostgreSQL database named:

```text
MiniDmart
```

### 5. Run the Spring Boot application

Using Maven:

```bash
cd backend
mvn spring-boot:run
```

Or run:

```text
MiniDmartApplication.java
```

from Eclipse / Spring Tool Suite.

The backend will start on:

```text
http://localhost:8080
```

---

## 🌐 Running the Frontend Locally

Open the `frontend` folder in Visual Studio Code.

You can use **Live Server** to run the frontend.

Open:

```text
frontend/index.html
```

The frontend communicates with the Spring Boot REST APIs.

Make sure the backend is running before testing features that require API/database access.

---

## 🔗 Backend & Frontend Communication

```text
┌─────────────────────────┐
│       Frontend          │
│  HTML + CSS + JavaScript│
└────────────┬────────────┘
             │
             │ REST API
             │ JSON
             ▼
┌─────────────────────────┐
│      Spring Boot        │
│        Backend          │
├─────────────────────────┤
│ Controllers             │
│ Services                │
│ Repositories            │
│ Spring Security + JWT   │
└────────────┬────────────┘
             │
             │ JPA / Hibernate
             ▼
┌─────────────────────────┐
│       PostgreSQL        │
│        Database         │
└─────────────────────────┘
```

---

## 🧱 Backend Architecture

The backend follows a layered architecture:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

### Controller Layer

Handles HTTP requests and exposes REST APIs.

### Service Layer

Contains application and business logic.

### Repository Layer

Handles database operations using Spring Data JPA.

### Entity Layer

Represents database tables using JPA entities.

### DTO Layer

Used to transfer data between the frontend and backend.

### Security Layer

Handles JWT authentication, authorization, and protected API access.

### Exception Layer

Provides centralized exception handling and meaningful API responses.

---

## 🛡️ Security

The application implements:

- JWT authentication
- Password-based authentication
- Role-based authorization
- Protected admin endpoints
- Protected customer endpoints
- Request authentication using JWT
- Environment-based secret configuration

Sensitive credentials are excluded from version control.

---

## 📋 Main Application Modules

| Module | Description |
|---|---|
| Authentication | Registration, login and JWT authentication |
| Users | Customer and admin account management |
| Products | Product creation and management |
| Categories | Product category management |
| Cart | Shopping cart management |
| Orders | Order creation and management |
| Payments | Payment records and status |
| Inventory | Product stock management |
| Reviews | Customer product reviews |
| Returns | Product return requests |
| Exchanges | Product exchange requests |
| Pickup Slots | Pickup slot management |
| Audit Logs | Tracking administrative activities |

---

## 👨‍💻 Author

**Yogesh Landge**

BE Information Technology

Pune, Maharashtra, India

---

## 📄 License

This project was developed as an academic/project implementation for learning and demonstration purposes.
