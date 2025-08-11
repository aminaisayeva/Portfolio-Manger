# MySQL Data Acquisition

## Instructions for SQL Data Download

1. Go to command prompt terminal below

2. Type in --> mysql -u root -p

3. Input your password for your MySQL

4. Type in --> source C:/.../master.sql

## If you would like to run the files separately

1. Go to command prompt terminal below

2. Type in --> mysql -u root -p

3. Input your password for your MySQL

4. Type in --> source C:/.../schema.sql

5. Type in --> source C:/.../procedures.sql

6. Type in --> source C:/.../triggers.sql

7. Type in --> source C:/.../scheduler.sql

8. Type in --> source C:/.../data.sql

## Database File Descriptions

### 1. `master.sql`
Master SQL script that **runs all other database files** in the correct order.  
- Calls `schema.sql`, `procedures.sql`, `triggers.sql`, `scheduler.sql`, and `data.sql` sequentially.  
- Used to set up or reset the entire database in one command.

---

### 2. `schema.sql`
Defines the **database schema**.  
- Creates all tables with primary keys, foreign keys, and constraints.  
- Establishes the database structure required for the project.

---

### 3. `procedures.sql`
Contains **stored procedures** for reusable database operations.  
- Encapsulates common logic (e.g., recalculating portfolio snapshots).  
- Improves performance and maintains cleaner application code.

---

### 4. `triggers.sql`
Defines **database triggers** that run automatically on specific events.  
- Updates balances or logs transactions when inserts/updates occur.  
- Enforces business rules directly in the database.

---

### 5. `scheduler.sql`
Sets up **scheduled database events**.  
- Automates recurring tasks like nightly snapshot calculations or cleanup routines.  
- Ensures time-based operations run without manual intervention.

---

### 6. `data.sql`
Provides **sample data inserts**.  
- Populates tables with initial records for testing and development.  
- Simulates realistic data to validate schema and procedures.

---
