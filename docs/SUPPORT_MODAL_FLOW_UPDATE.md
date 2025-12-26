# Support Modal Flow Update

## Overview

Updated the support modal to implement a streamlined payment flow that prioritizes payment method selection before network and currency selection, removing the amount requirement from the crypto flow.

## Changes Made

### 1. Updated Flow Structure

**Previous Flow:**

1. Enter amount
2. Choose payment method (PayPal or Crypto)
3. If Crypto: Select network and currency

**New Flow:**

1. Choose payment method (PayPal or Crypto)
2. If PayPal: Open PayPal link directly
3. If Crypto: Select network first
4. Then select currency (filtered by network)
5. Amount is set to default minimum ($25)

### 2. State Management Updates

Added new state variables:

- `showNetworkSelector`: Controls network selection screen visibility
- `showCurrencySelector`: Controls currency selection screen visibility

These work alongside existing states:

- `paymentMethod`: Tracks selected payment method
- `cryptoNetwork`: Stores selected network
- `cryptoCurrency`: Stores selected currency
- `showCryptoSelector`: Legacy selector (can be removed if not used elsewhere)

### 3. User Interface Changes

#### Payment Method Selection (Initial Screen)

- Shows two large, prominent buttons:
  - **PayPal Button**: Opens PayPal link directly
  - **Crypto Button**: Initiates crypto payment flow
- Added descriptive text under Crypto button: "USDT, USDC, ETH, BNB"
- Removed amount input requirement before payment method selection

#### Network Selection Screen

- Displays three network options from `NETWORK_OPTIONS`:
  - Tron (TRC-20)
  - Ethereum (ERC-20)
  - Binance Smart Chain (BEP-20)
- Shows network name and description
- Back button returns to payment method selection

#### Currency Selection Screen

- Displays currencies filtered by selected network using `getCurrenciesForNetwork()`
- Shows currency icon, name, and code
- Back button returns to network selection
- Automatically creates payment with default minimum amount ($25)

### 4. Integration with Payment Configuration

The modal now uses:

- `NETWORK_OPTIONS` from `@/config/paymentMethods` for network display
- `getCurrenciesForNetwork()` helper to filter currencies by network
- Maintains type safety with `CryptoNetwork` and `CryptoCurrency` types

### 5. Styling Updates

Added new styles:

- `paymentMethodButtonLarge`: Larger, more prominent payment method buttons
- `paymentMethodButtonTextLarge`: Larger text for payment method buttons
- `paymentMethodDescription`: Descriptive text under payment buttons
- `networkCardContent`: Container for network card content
- `networkDescription`: Network description text styling

## Usage Flow

### For PayPal Donations

1. User opens support modal
2. Clicks "PayPal" button
3. Redirected to PayPal payment page

### For Crypto Donations

1. User opens support modal
2. Clicks "Crypto" button
3. Selects network (Tron, Ethereum, or BSC)
4. Selects currency (filtered by network)
5. QR code generated with default $25 amount
6. User sends payment

## Default Amount Handling

Currently, when a user selects a currency, the payment is created with:

- Default amount: `MINIMUM_DONATION_AMOUNT` ($25)
- Total includes platform fee calculation
- Can be modified to add amount selection step if needed

## Benefits

1. **Simplified UX**: Users choose payment method first without amount friction
2. **Network-First Approach**: Ensures users select the correct network before currency
3. **Reduced Steps for PayPal**: Direct link opens without extra navigation
4. **Clear Currency Options**: Only shows currencies available on selected network
5. **Maintains Safety**: Network confirmation warning still works for sensitive transactions

## Future Enhancements

1. **Optional Amount Selection**: Add amount input after currency selection
2. **Remember Preferences**: Save user's preferred network/currency
3. **Dynamic Fee Display**: Show estimated fees per network before selection
4. **Quick Amount Buttons**: Add preset amount options ($25, $50, $100)

## Testing Checklist

- [ ] PayPal button opens correct URL
- [ ] Crypto button shows network selection
- [ ] All three networks are displayed
- [ ] Currencies filtered correctly per network
- [ ] Back navigation works at each step
- [ ] Payment QR code generates successfully
- [ ] Default amount ($25) applied correctly
- [ ] Platform support section displays for bird donations
- [ ] Modal closes and resets state properly

## Files Modified

- `components/support-modal.tsx`: Main implementation
  - Added network and currency selection flows
  - Updated state management
  - Modified UI rendering logic
  - Added new styles

## Related Documentation

- [CRYPTO_PAYMENT_QUICK_REFERENCE.md](CRYPTO_PAYMENT_QUICK_REFERENCE.md) - Payment method configuration
- [CRYPTO_PAYMENT_IMPLEMENTATION_COMPLETE.md](CRYPTO_PAYMENT_IMPLEMENTATION_COMPLETE.md) - Complete implementation guide
