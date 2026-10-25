# ELVORA — E-Commerce Product and Order Management System

**ELVORA** is a database-driven e-commerce management application designed to manage products, inventory, customers, orders, and payments through a unified interface.

The project combines a modern web frontend with a Python backend and an Oracle relational database to demonstrate practical database management concepts and real-world e-commerce workflows.

> **Project Status:** In Development — Approximately 60% Complete

## Overview

ELVORA aims to provide an integrated platform for managing e-commerce operations, with a focus on data consistency, inventory control, order processing, and efficient database operations.

The application is being developed as an academic DBMS project, connecting database concepts with a functional web application.

## Key Features

### Currently Developed
- Modern e-commerce frontend interface.
- Product inventory containing approximately 500 products.
- Oracle SQL database schema and sample data.
- SQL scripts demonstrating DDL, DML, constraints, functions, operators, aggregate functions, joins, subqueries, and validation queries.
- Initial project structure for frontend and backend integration.

### Planned / In Progress
- Live product retrieval from Oracle Database.
- Product creation, editing, searching, filtering, and deletion.
- Inventory updates and low-stock alerts.
- Customer management.
- Order placement and order history.
- Order status management and cancellation.
- Payment tracking and outstanding balance calculation.
- Admin dashboard with database-driven statistics and reports.
- Input validation, transaction handling, and error management.

*Feature availability will be updated as implementation and testing progress.*

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite |
| Backend | Python, FastAPI |
| Database | Oracle Database |
| Database Driver | Python `oracledb` |
| API Server | Uvicorn |
| Environment Configuration | `python-dotenv` |

## Database Design

The database is designed around the following core entities:

- **CUSTOMERS** — Customer information and contact details.
- **CATEGORIES** — Product category information.
- **PRODUCTS** — Product details, pricing, and inventory.
- **ORDERS** — Customer order records.
- **ORDER_ITEMS** — Products and quantities associated with each order.
- **PAYMENTS** — Payment records associated with orders.

Primary keys, foreign keys, and other constraints help maintain relational integrity. The schema will be reused as the application evolves.

## System Architecture

The planned application follows a three-layer architecture:

1. **Frontend Layer:** React provides the user interface for viewing products and managing e-commerce operations.
2. **Backend Layer:** FastAPI exposes REST API endpoints, validates requests, and handles business logic.
3. **Database Layer:** Oracle stores persistent product, customer, order, inventory, and payment data.

The frontend communicates with the backend through HTTP requests. The backend interacts with Oracle using the Python `oracledb` driver.

## Project Structure

The project is organized into separate frontend, backend, and database components. The structure may evolve during development.

```text
ELVORA/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
├── database/
│   ├── create_table.sql
│   ├── insert_data.sql
│   ├── ddl_dml.sql
│   ├── functions.sql
│   ├── operators_aggregates.sql
│   ├── joins_subqueries.sql
│   ├── inventory_validation.sql
│   ├── order_validation.sql
│   └── payment_validation.sql
└── README.md
```

*Adjust the paths to match the actual repository structure.*

## Setup and Installation

### Prerequisites

- Python 3.10 or later.
- Node.js and npm.
- Oracle Database with the ELVORA schema configured.
- Git.

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ELVORA
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment in Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
python -m pip install fastapi uvicorn oracledb python-dotenv
```

Configure the backend environment variables using a local `.env` file. Use the actual Oracle credentials and connection string for your environment.

### 3. Start the backend

From the backend directory, run:

```bash
python -m uvicorn main:app --reload
```

The API should be available at:

- Backend: `http://localhost:8000`
- Interactive API documentation: `http://localhost:8000/docs`

### 4. Set up the frontend

From the frontend directory:

```bash
npm install
```

Create a frontend `.env` file:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Use the local URL printed by Vite to open the application.

**Note:** These commands assume the corresponding files and scripts exist. Complete the Oracle connection configuration and API endpoints before expecting database-backed features to work.

## Database Concepts Demonstrated

- Data Definition Language (DDL).
- Data Manipulation Language (DML).
- Primary and foreign key constraints.
- Unique, not-null, check, and other applicable constraints.
- SQL functions and aggregate operations.
- Joins and subqueries.
- Inventory and order validation.
- Referential integrity and relational database design.
- Transaction management and data consistency as backend operations are implemented.

## Future Enhancements

- Complete integration between the frontend, FastAPI, and Oracle.
- Reliable order processing with transactional inventory updates.
- Enhanced analytics and reporting.
- Product image integration.
- Improved validation, security, and testing.
- Deployment for accessible demonstrations.

## Security Notes

- Store Oracle credentials in backend environment variables.
- Do not commit `.env` files or secrets to GitHub.
- Keep database credentials out of frontend code.
- Validate user input on the backend.
- Use parameterized SQL queries.
- Restrict destructive database operations and protect customer data.

## Project Purpose

ELVORA demonstrates how relational database concepts can be integrated into a full-stack application to support realistic e-commerce product and order management workflows.

**Status:** Active Development

