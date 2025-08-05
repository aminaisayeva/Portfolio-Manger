# Portfolio-Manger

## Added yfinance Example Script

- Created `dummy.py` to demonstrate basic usage of the [yfinance](https://github.com/ranaroussi/yfinance) library
- The script:
  - Imports `yfinance` as `yf`
  - Fetches ticker data for Apple Inc. (`AAPL`)
  - Retrieves the ticker’s info dictionary
  - Prints the available attributes and methods of the ticker object

**Usage:**

1. Ensure `yfinance` version 0.2.65 is installed:  
   `pip install yfinance[nospam]`
2. Run the script:  
   `python dummy.py'

## Imports

- pip install flask flask_sqlalchemy flask_cors python-dotenv pymysql yfinance[nospam] mysql-connector-python pandas

# Instructions for SQL Data Download

1. Go to command prompt terminal below

2. Type in --> mysql -u root -p

3. Input your password for your MySQL

4. Type in --> source C:/.../schema.sql

5. Type in --> source C:/.../inserts.sql

6. Open MySQL Workbench

## To Run app

- python Portfolio-Manager/app/backend/app.py
- cd frontend/investment-dashboard
- npm run dev
