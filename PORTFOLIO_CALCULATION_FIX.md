# Portfolio Calculation Fix

## Issue Description

The portfolio manager had a bug where adding cash to the account would incorrectly inflate the total return percentage and total return value. This happened because:

1. **Total Value Calculation**: The system correctly included cash balance in the total portfolio value
2. **Initial Investment**: The system used a hardcoded value of $25,000 for the initial investment
3. **Profit/Loss Calculation**: `profit_loss = total_value - total_initial_investment`
4. **Return Percentage**: `total_return_percent = (profit_loss / total_initial_investment) * 100`

When cash was added:
- `total_value` increased (correct)
- `total_initial_investment` remained at $25,000 (incorrect)
- This made it appear as if the additional cash was "profit"

## Solution

### 1. Added `get_total_deposits()` Function

Created a new function in `backend/crud.py` that calculates the actual total deposits from the `cash_transaction` table:

```python
def get_total_deposits(ca_id=1):
    """Calculate total deposits from cash_transaction table."""
    # Sum all DEPOSIT transactions
    cursor.execute(
        "SELECT SUM(ct_amount) as total_deposits FROM cash_transaction WHERE ct_type = 'DEPOSIT' AND ct_ca_id = %s",
        (ca_id,)
    )
    # Returns actual total deposits or falls back to initial $25,000
```

### 2. Updated Portfolio Calculation

Modified the portfolio calculation in `get_portfolio()` to use the actual total deposits:

```python
# Before (incorrect):
total_initial_investment = 25000

# After (correct):
total_initial_investment = get_total_deposits()
```

### 3. Updated Server-Side Calculation

Also fixed the server-side portfolio calculation in `server/routes.ts` to use total deposits instead of just stock cost basis.

## Files Modified

1. **`backend/crud.py`**:
   - Added `get_total_deposits()` function
   - Updated `get_portfolio()` to use actual deposits
   - Updated fallback error handling

2. **`server/routes.ts`**:
   - Updated portfolio calculation to use total deposits

3. **`backend/test_portfolio_fix.py`**:
   - Added test script to verify the fix

## Testing

Run the test script to verify the fix:

```bash
cd backend
python test_portfolio_fix.py
```

The test will:
1. Show initial portfolio state
2. Add $10,000 in cash
3. Show updated portfolio state
4. Verify that profit/loss doesn't change significantly (only due to actual investment gains/losses)

## Expected Behavior

After the fix:
- Adding cash increases the total portfolio value
- Adding cash increases the total deposits by the same amount
- The profit/loss calculation remains accurate: `total_value - total_deposits`
- The return percentage reflects actual investment performance, not cash deposits

## Database Schema

The fix relies on the existing `cash_transaction` table structure:

```sql
CREATE TABLE cash_transaction (
    ct_id INT AUTO_INCREMENT PRIMARY KEY,
    ct_ca_id INT NOT NULL DEFAULT 1,
    ct_type ENUM('DEPOSIT', 'WITHDRAWAL') NOT NULL,
    ct_amount FLOAT NOT NULL,
    ct_date DATE NOT NULL,
    ct_note VARCHAR(100)
);
```

The function sums all transactions where `ct_type = 'DEPOSIT'` to get the total amount deposited. 