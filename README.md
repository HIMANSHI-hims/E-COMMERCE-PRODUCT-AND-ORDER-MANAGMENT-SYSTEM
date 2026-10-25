# E-Commerce Product and Order Management System

## Overview
The E-Commerce Product and Order Management System is a database project developed using Oracle SQL. It manages customers, product categories, products, customer orders, order items, and payments. The project demonstrates relational database design, SQL queries, integrity constraints, and data validation.

## Objectives
- Design a relational database for an e-commerce application.
- Establish relationships between entities using primary and foreign keys.
- Maintain data integrity using constraints.
- Perform database operations using SQL.
- Validate order totals and payment status using aggregate functions and conditional logic.

## Database Tables
The project consists of the following tables:

1. **Customers** – Stores customer details.
2. **Categories** – Stores product category information.
3. **Products** – Stores product details and their associated categories.
4. **Orders** – Stores customer order information and total amounts.
5. **Order_Items** – Stores the products included in each order, along with quantities and unit prices.
6. **Payments** – Stores payment details, including payment methods, amounts, dates, and statuses.

## Technologies Used
- **Database:** Oracle Database
- **Language:** Oracle SQL
- **Development Environment:** Visual Studio Code with Oracle SQL Developer Extension

## Key Features
- Relational database design with primary and foreign keys.
- Data integrity enforcement using `NOT NULL`, `CHECK`, `DEFAULT`, and other constraints.
- Management of customers, products, orders, and payments.
- Use of SQL joins to retrieve related information across tables.
- Aggregate calculations using `SUM()`.
- Conditional logic using `CASE WHEN`.
- NULL handling using `NVL()`.
- Order validation by comparing stored totals with calculated item totals.
- Payment validation by calculating completed payments, outstanding balances, and payment status classifications.

## Validation
The project includes SQL validation queries to verify the consistency of order and payment data.

### Order Validation
Calculates the total value of order items and compares it with the total amount stored in the `ORDERS` table.

### Payment Validation
Calculates the sum of completed payments for each order, determines the remaining balance, and classifies payment status as:
- Unpaid
- Partially Paid
- Fully Paid
- Overpaid

## How to Run
1. Set up an Oracle Database connection.
2. Open the SQL scripts in Visual Studio Code or Oracle SQL Developer.
3. Execute the table creation scripts in the correct order.
4. Insert the required sample data using the DML scripts.
5. Run the validation queries to verify order totals and payment information.

**Note:** Execute table creation scripts before inserting data. Tables referenced by foreign keys must exist before dependent tables are created.

## Learning Outcomes
This project provides practical experience with relational database design, entity relationships, SQL constraints, joins, aggregate functions, conditional expressions, and database validation.

## Future Enhancements
- Develop a user interface for managing products and orders.
- Add automated order total calculations.
- Implement automated payment status updates.
- Generate sales and payment reports.
