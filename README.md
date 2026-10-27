# ELVORA — E-Commerce Product and Order Management System

ELVORA is a database-driven e-commerce application developed as a Database Management Systems (DBMS) project. It provides a platform for managing products, customers, orders, inventory, and payments through a web-based interface backed by an Oracle relational database.

The project demonstrates the practical application of SQL, database design, integrity constraints, joins, subqueries, functions, views, and PL/SQL concepts in an e-commerce environment.

## Features

- **Product Management:** View and manage product information, prices, categories, and stock quantities.
- **Customer Management:** Maintain customer information and delivery details.
- **Order Management:** Place orders and maintain order and order-item records.
- **Order History:** Retrieve order information through the Oracle `Order_History_View`.
- **Payment Management:** Store payment details, methods, amounts, and payment statuses.
- **Inventory Validation:** Validate stock availability and support inventory consistency.
- **Database Validation:** Apply constraints and validation logic to maintain data integrity.
- **SQL and PL/SQL Demonstrations:** Implement database functions, joins, subqueries, aggregate operations, views, and explicit cursors.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite |
| Backend | Python, FastAPI |
| Database | Oracle Database |
| Database Language | SQL and PL/SQL |
| API Communication | HTTP/REST |

## System Architecture

ELVORA follows a frontend–backend–database architecture.

```text
                 USER
                   |
                   v
          React + Vite Frontend
                   |
                   v
             FastAPI Backend
                   |
                   v
             Oracle Database
                   |
                   v
       Products, Customers, Orders,
       Order Items, Payments, Views
```

1. **Frontend:** Provides the user interface for browsing products, managing the cart, placing orders, and viewing order information.
2. **Backend:** Handles application requests, communicates with Oracle, and implements order-processing logic.
3. **Database:** Stores relational data and enforces database rules through constraints, SQL operations, and other database objects.

## Database Design

The database is designed around the core entities of an e-commerce application.

- **Customers:** Stores customer details.
- **Categories:** Organizes products into categories.
- **Products:** Stores product details, prices, and inventory quantities.
- **Orders:** Records customer orders and their totals.
- **Order Items:** Stores the products and quantities associated with each order.
- **Payments:** Maintains payment details and payment status.

Relationships between these entities support customer orders containing multiple products and the corresponding payment records.

## SQL and PL/SQL Concepts Implemented

The project demonstrates the following DBMS concepts:

- **DDL:** `CREATE`, `ALTER`, and other schema-management operations.
- **DML:** `INSERT`, `UPDATE`, `DELETE`, and data retrieval.
- **Integrity Constraints:** Primary keys, foreign keys, unique constraints, `NOT NULL`, and check constraints.
- **Joins:** Combining related records across tables.
- **Subqueries:** Using nested queries to retrieve and analyze data.
- **SQL Functions:** Character, numeric, date, conversion, and NULL-handling functions.
- **Aggregate Functions:** `COUNT`, `SUM`, `AVG`, `MAX`, and `MIN`.
- **Conditional Expressions:** `CASE` expressions.
- **Views:** `Order_History_View` for retrieving order-history information.
- **Explicit Cursors:** Fetching query results one row at a time in PL/SQL.
- **Indexes:** Index-related database scripts for query optimization.
- **Validation Logic:** SQL scripts and database logic for order, payment, and inventory validation.

## Project Structure

```text
ELVORA/
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
│
├── backend/
│   ├── main.py
│   ├── db.py
│   └── routers/
│       └── orders.py
│
├── admins.sql
├── ALTER.sql
├── create_indexes.sql
├── create_table.sql
├── customer_order_details.sql
├── ddl_dml.sql
├── e1.sql
├── functions.sql
├── image.sql
├── index_correction.sql
├── indexes.sql
├── insert_data.sql
├── inventory_audit.sql
├── inventory_validation.sql
├── joins_subqueries.sql
├── operators_aggregates.sql
├── order_validation.sql
├── payment_trigger.sql
├── payment_validation.sql
├── reset_and_update.sql
├── SUBQUEIRES.sql
├── view_data.sql
└── VIEW.SQL
```

*Note: Update the structure if your repository has additional files or a different folder arrangement.*

## Prerequisites

Install the following before running the application:

- Node.js and npm
- Python 3
- Oracle Database with an accessible database service
- Oracle SQL Developer or another Oracle-compatible SQL client

## Installation and Setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ELVORA
```

Replace the placeholder with your actual GitHub repository URL.

### 2. Configure the Oracle database

1. Connect to your Oracle database using your configured service.
2. Execute the SQL scripts in the appropriate order.
3. Create the tables and constraints before inserting sample data.
4. Configure the backend database connection using your Oracle credentials and service name.

**Important:** Review scripts such as `reset_and_update.sql` before executing them, because reset scripts may modify or remove existing data.

### 3. Start the backend

Open a terminal in the backend directory:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```bash
pip install fastapi uvicorn oracledb
```

If the repository includes a `requirements.txt`, use it instead:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will normally be available at `http://127.0.0.1:8000`.

API documentation is normally available at `http://127.0.0.1:8000/docs`.

### 4. Configure and start the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create or update the frontend `.env` file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

Vite will display the local development URL, normally `http://localhost:5173`.

### 5. Verify the application

- Confirm that the Oracle database connection succeeds.
- Verify that the backend can communicate with Oracle.
- Open the frontend in your browser.
- Test product browsing, cart operations, order placement, payment-related functionality, and order history.
- Check the database to confirm that the expected records are stored correctly.

## Learning Outcomes

This project provides practical experience with:

- Relational database design and entity relationships.
- SQL queries and database integrity constraints.
- Backend integration with an Oracle database.
- REST API development using FastAPI.
- Frontend development using React and Vite.
- Database-driven e-commerce workflows.
- PL/SQL programming and data validation.

## Team Members

- **Himanshi Srivastava**
- **Avantika Pratyush**

## Project Purpose

ELVORA demonstrates how database concepts can be integrated into a full-stack application to manage a practical business workflow. It combines relational database operations with backend processing and a user-facing interface to illustrate the role of DBMS concepts in real-world software systems.
