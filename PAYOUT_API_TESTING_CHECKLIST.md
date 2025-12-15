# Payout API Testing Checklist ✅

Use this checklist to test all payout payment method functionality.

---

## 🔧 Prerequisites

- [ ] Backend API is running and accessible
- [ ] User account is created and verified
- [ ] User is logged in with valid JWT token
- [ ] Network connectivity is available

---

## 1️⃣ View Payout Settings

### Navigate to Payout Settings

- [ ] Open user profile/settings
- [ ] Navigate to payout settings screen
- [ ] Screen loads without errors

### Balance Display

- [ ] Available balance shows correctly
- [ ] Pending balance shows correctly
- [ ] Total earned shows correctly
- [ ] Total paid out shows correctly
- [ ] Minimum payout threshold displays
- [ ] Next payout date displays (if available)
- [ ] Currency symbol is correct ($ or €)

### Payment Methods List

- [ ] Empty state shows when no methods exist
- [ ] "Add Payment Method" button is visible
- [ ] Existing methods display correctly
- [ ] Method icons match method types
- [ ] Default badge shows on default method
- [ ] Verified badge shows on verified methods
- [ ] Sensitive data is masked (IBAN, wallet addresses)

---

## 2️⃣ Add Bank Transfer (IBAN)

### Navigation

- [ ] Click "Add Payment Method"
- [ ] Bank Transfer option is visible and marked as "Recommended"
- [ ] Select Bank Transfer
- [ ] Click "Continue"
- [ ] Add IBAN Method screen opens

### Form Validation

- [ ] Cannot submit with empty account holder name
- [ ] Cannot submit with empty IBAN
- [ ] Invalid IBAN format shows error
- [ ] BIC field accepts 8 or 11 characters
- [ ] IBAN auto-formats with spaces

### Valid Submissions

Test with these IBANs:

- [ ] Germany: `DE89370400440532013000`
- [ ] UK: `GB82WEST12345698765432`
- [ ] France: `FR1420041010050500013M02606`

### Success Flow

- [ ] Submission shows loading state
- [ ] Success message displays
- [ ] Navigates back to payout settings
- [ ] New method appears in list
- [ ] Method is set as default (if first method)

### Error Handling

- [ ] Network error shows user-friendly message
- [ ] Duplicate IBAN error displays correctly
- [ ] Backend validation errors show properly

---

## 3️⃣ Add PayPal

### Navigation

- [ ] Click "Add Payment Method"
- [ ] Select PayPal
- [ ] Click "Continue"
- [ ] Add PayPal Method screen opens

### Form Validation

- [ ] Cannot submit with empty email
- [ ] Invalid email format shows error
- [ ] Valid email formats accepted

### Valid Submissions

Test with:

- [ ] `test@example.com`
- [ ] `user.name@domain.co.uk`
- [ ] `user+tag@gmail.com`

### Success Flow

- [ ] Submission shows loading state
- [ ] Success message displays
- [ ] Navigates back to payout settings
- [ ] New method appears in list

---

## 4️⃣ Add Cryptocurrency - Solana USDC

### Navigation

- [ ] Click "Add Payment Method"
- [ ] Select "USDC on Solana"
- [ ] Click "Continue"
- [ ] Add Crypto Method screen opens
- [ ] Screen shows "USDC on Solana" title
- [ ] Network info displays correctly

### Form Validation

- [ ] Cannot submit with empty wallet address
- [ ] Invalid Solana address shows error
- [ ] Base58 format validation works

### Valid Submissions

Test with Solana address:

- [ ] `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`
- [ ] Address between 32-44 characters
- [ ] No special characters except alphanumeric

### Success Flow

- [ ] Submission shows loading state
- [ ] Success message displays "USDC on Solana added"
- [ ] Navigates back to payout settings
- [ ] New method appears with correct currency and network

---

## 5️⃣ Add Cryptocurrency - Base USDC

### Navigation

- [ ] Click "Add Payment Method"
- [ ] Select "USDC on Base"
- [ ] Click "Continue"
- [ ] Add Crypto Method screen opens
- [ ] Screen shows "USDC on Base" title

### Form Validation

- [ ] Cannot submit with empty wallet address
- [ ] Invalid Ethereum address shows error
- [ ] Must start with `0x`
- [ ] Must be exactly 42 characters

### Valid Submissions

Test with Base/Ethereum address:

- [ ] `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
- [ ] Format: `0x` + 40 hex characters

### Success Flow

- [ ] Submission shows loading state
- [ ] Success message displays "USDC on Base added"
- [ ] Navigates back to payout settings
- [ ] New method appears with Base network indicator

---

## 6️⃣ Add Cryptocurrency - Solana EURC

### Test similar to Solana USDC

- [ ] Select "EURC on Solana"
- [ ] Enter valid Solana wallet address
- [ ] Submit successfully
- [ ] Method shows "EURC (Solana)" in list

---

## 7️⃣ Add Cryptocurrency - Base EURC

### Test similar to Base USDC

- [ ] Select "EURC on Base"
- [ ] Enter valid Base wallet address
- [ ] Submit successfully
- [ ] Method shows "EURC (Base)" in list

---

## 8️⃣ Manage Payment Methods

### View Methods

- [ ] All added methods display correctly
- [ ] Method types show correct icons
- [ ] Masked data displays properly (last 4 digits)

### Set Default Method

- [ ] Click "Set as Default" on non-default method
- [ ] Confirmation or immediate action occurs
- [ ] Method is marked as default
- [ ] Previous default is unmarked
- [ ] Only one method is default at a time

### Delete Method

- [ ] Click delete button on a method
- [ ] Confirmation alert appears
- [ ] Cancel works correctly
- [ ] Confirm deletes the method
- [ ] Method is removed from list
- [ ] Success message displays

### Delete Default Method

- [ ] Try deleting the default method
- [ ] System allows or prevents (based on backend rules)
- [ ] If allowed, another method becomes default

### Delete Last Method

- [ ] Delete all methods
- [ ] Empty state displays correctly

---

## 9️⃣ View Payout History

### Navigation

- [ ] Click "View History" from payout settings
- [ ] Payout History screen opens

### Empty State

- [ ] Empty state shows when no transactions exist
- [ ] Message is clear and user-friendly

### Transaction List

- [ ] Transactions display in reverse chronological order
- [ ] Transaction amounts show correct currency symbol
- [ ] Transaction dates format correctly
- [ ] Status badges show correct colors:
  - Completed: Green
  - Pending: Orange
  - Processing: Orange
  - Failed: Red
  - Cancelled: Gray

### Transaction Details

- [ ] Transaction card shows:
  - Amount
  - Currency
  - Status
  - Method type
  - Requested date
  - Processed date (if available)
  - Completed date (if available)
  - Provider transaction ID (if available)

### Pagination

- [ ] Scroll to bottom loads more transactions
- [ ] Loading indicator shows during load
- [ ] No duplicate transactions appear
- [ ] Reaches end correctly

### Refresh

- [ ] Pull down to refresh
- [ ] Loading indicator shows
- [ ] List updates with latest data

### Status Indicators

Test with different transaction statuses:

- [ ] Pending: Clock icon, orange color
- [ ] Processing: Sync icon, orange color
- [ ] Completed: Checkmark icon, green color
- [ ] Failed: X icon, red color
- [ ] Cancelled: Ban icon, gray color

---

## 🔟 Error Scenarios

### Network Errors

- [ ] Turn off internet
- [ ] Try loading payout settings
- [ ] Appropriate error message shows
- [ ] Try adding payment method
- [ ] Network error message displays

### Authentication Errors

- [ ] Log out or expire token
- [ ] Try accessing payout settings
- [ ] Redirected to login or error shown

### Validation Errors

- [ ] Submit invalid IBAN → Error message clear
- [ ] Submit invalid email → Error message clear
- [ ] Submit invalid wallet → Error message clear
- [ ] Submit short IBAN → Error message clear
- [ ] Submit wrong network address → Error message clear

### Backend Errors

- [ ] Stop backend server
- [ ] Try any payout action
- [ ] User-friendly error message shows (not technical error)

### Duplicate Payment Method

- [ ] Add same IBAN twice
- [ ] Backend rejects with appropriate message
- [ ] Add same PayPal email twice
- [ ] Backend rejects with appropriate message

---

## 1️⃣1️⃣ Edge Cases

### Multiple Payment Methods

- [ ] Add 5+ different payment methods
- [ ] All display correctly in list
- [ ] Scrolling works smoothly
- [ ] Can set any as default
- [ ] Can delete any method

### Long Account Names

- [ ] Enter very long account holder name (100 chars)
- [ ] Field handles it correctly
- [ ] Displays properly in list

### Special Characters

- [ ] Account name with special chars (apostrophes, hyphens)
- [ ] Email with + symbol
- [ ] Handles correctly

### Masked Data

- [ ] IBAN shows only last 4 digits in list
- [ ] PayPal email shows only partial
- [ ] Wallet address shows shortened version

### Currency Display

- [ ] USD transactions show $ symbol
- [ ] EUR transactions show € symbol
- [ ] Amounts format with 2 decimals

---

## 1️⃣2️⃣ Performance

### Loading Times

- [ ] Payout settings loads within 2 seconds
- [ ] Adding method completes within 3 seconds
- [ ] History loads within 2 seconds
- [ ] Pagination is smooth

### Refresh Performance

- [ ] Pull to refresh responds immediately
- [ ] Data updates without delay
- [ ] No duplicate API calls

### Memory Usage

- [ ] No memory leaks when navigating repeatedly
- [ ] Images/icons load efficiently
- [ ] List virtualization works for long history

---

## 1️⃣3️⃣ UI/UX

### Visual Design

- [ ] Colors match app theme
- [ ] Icons are clear and appropriate
- [ ] Text is readable
- [ ] Spacing is consistent
- [ ] Buttons are clearly labeled

### Interaction

- [ ] Buttons have press feedback
- [ ] Loading states are clear
- [ ] Success/error messages are visible
- [ ] Forms are easy to fill
- [ ] Validation feedback is immediate

### Navigation

- [ ] Back buttons work correctly
- [ ] Navigation stack is correct
- [ ] Can navigate to all screens
- [ ] Can return to previous screens

### Responsive

- [ ] Works on small phones
- [ ] Works on large phones
- [ ] Works on tablets
- [ ] Portrait mode works
- [ ] Landscape mode works (if supported)

---

## 1️⃣4️⃣ Localization (if implemented)

### Languages

- [ ] All text displays in correct language
- [ ] Currency symbols appropriate for locale
- [ ] Date formats follow locale conventions
- [ ] Number formats follow locale conventions

### RTL Support (if implemented)

- [ ] UI flips correctly for RTL languages
- [ ] Icons position correctly
- [ ] Text alignment is correct

---

## 1️⃣5️⃣ Security

### Data Privacy

- [ ] Sensitive data is masked in lists
- [ ] Full IBAN not visible in list view
- [ ] Full wallet address not visible in list view
- [ ] PayPal email partially hidden

### Authentication

- [ ] Cannot access without login
- [ ] Token expiration handled correctly
- [ ] Unauthorized access shows error

### Data Transmission

- [ ] All API calls use HTTPS (production)
- [ ] Sensitive data not logged to console (production)

---

## ✅ Sign-off

### Tester Information

- **Tester Name:** ********\_********
- **Date:** ********\_********
- **App Version:** ********\_********
- **Device:** ********\_********
- **OS Version:** ********\_********

### Overall Assessment

- [ ] All critical features work
- [ ] No blocking issues found
- [ ] Performance is acceptable
- [ ] UI/UX is intuitive
- [ ] Ready for production

### Issues Found

_List any issues found during testing:_

1. ***
2. ***
3. ***

### Notes

_Additional comments:_

---

---

---

---

_Testing Checklist Version 1.0_
_Last Updated: December 15, 2025_
