# Backend Implementation Guide - USDT Multi-Network Payment System

## Overview

This guide provides complete instructions for implementing USDT cryptocurrency payment processing across multiple blockchain networks (TRON, Ethereum, and Binance Smart Chain) in the ASP.NET Web API backend.

**Important Updates:**

- **Custom Donation Amounts**: Users can enter any amount ≥ $10 (no preset amounts)
- **Platform Fee**: 5% fee on all transactions with a $1 minimum
- **Fee Justification**: Crypto networks don't allow payments < $10 due to blockchain fees
- **Total Amount Calculation**: Total = Donation Amount + Platform Fee (5%, min $1)

## Table of Contents

1. [Wallet Configuration](#wallet-configuration)
2. [Database Models](#database-models)
3. [Payment Service Implementation](#payment-service-implementation)
4. [Blockchain Integration](#blockchain-integration)
5. [API Endpoints](#api-endpoints)
6. [Security Considerations](#security-considerations)
7. [Testing](#testing)

---

## 1. Wallet Configuration

### Platform Wallet Addresses

Configure these USDT receiving addresses for each network:

```csharp
// appsettings.json or Environment Variables
{
  "CryptoPayment": {
    "USDT": {
      "Tron": {
        "Address": "TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA",
        "Network": "tron",
        "ChainId": null,
        "Enabled": true
      },
      "Ethereum": {
        "Address": "0x4cc28f4cea7b440858b903b5c46685cb1478cdc4",
        "Network": "ethereum",
        "ChainId": "1",
        "Enabled": true
      },
      "BinanceSmartChain": {
        "Address": "0x83675000ac9915614afff618906421a2baea0020",
        "Network": "binance-smart-chain",
        "ChainId": "56",
        "Enabled": true
      }
    },
    "MinimumAmount": 10.0,
    "PlatformFeePercentage": 0.05,
    "MinimumPlatformFee": 1.0,
    "PaymentExpirationMinutes": 30,
    "PollingIntervalSeconds": 15
  }
}
```

### Configuration Model

```csharp
// Models/Configuration/CryptoPaymentSettings.cs
public class CryptoPaymentSettings
{
    public Dictionary<string, CurrencyNetworkSettings> USDT { get; set; }
    public decimal MinimumAmount { get; set; }
    public decimal PlatformFeePercentage { get; set; }
    public decimal MinimumPlatformFee { get; set; }
    public int PaymentExpirationMinutes { get; set; }
    public int PollingIntervalSeconds { get; set; }
}

public class CurrencyNetworkSettings
{
    public string Address { get; set; }
    public string Network { get; set; }
    public string ChainId { get; set; }
    public bool Enabled { get; set; }
}

/// <summary>
/// Helper methods for platform fee calculations
/// </summary>
public static class FeeCalculationHelper
{
    /// <summary>
    /// Calculate platform fee for a donation/support amount
    /// </summary>
    public static decimal CalculatePlatformFee(decimal amount, decimal feePercentage, decimal minimumFee)
    {
        var calculatedFee = amount * feePercentage;
        return Math.Max(calculatedFee, minimumFee);
    }

    /// <summary>
    /// Calculate total amount including platform fee
    /// </summary>
    public static (decimal donationAmount, decimal platformFee, decimal totalAmount) CalculateTotalAmount(
        decimal donationAmount,
        decimal feePercentage,
        decimal minimumFee)
    {
        var platformFee = CalculatePlatformFee(donationAmount, feePercentage, minimumFee);
        var totalAmount = donationAmount + platformFee;
        return (donationAmount, platformFee, totalAmount);
    }
}
```

---

## 2. Database Models

### CryptoPaymentRequest Entity

```csharp
// Models/CryptoPaymentRequest.cs
public class CryptoPaymentRequest
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? BirdId { get; set; } // Nullable for non-bird payments

    // Amount details
    public decimal AmountUsd { get; set; } // User's intended donation amount
    public decimal PlatformFee { get; set; } // 5% platform fee (minimum $1)
    public decimal TotalAmountUsd { get; set; } // Total charged (AmountUsd + PlatformFee)
    public decimal AmountCrypto { get; set; } // Converted crypto amount (based on TotalAmountUsd)
    public string Currency { get; set; } // "USDT"
    public string Network { get; set; } // "tron", "ethereum", "binance-smart-chain"
    public decimal ExchangeRate { get; set; }

    // Payment details
    public string WalletAddress { get; set; } // Platform receiving address
    public string UserWalletAddress { get; set; } // User's sending address (optional)
    public string QrCodeData { get; set; } // Base64 encoded QR code
    public string PaymentUri { get; set; } // Payment URI for wallets

    // Transaction details
    public string TransactionHash { get; set; }
    public int Confirmations { get; set; }
    public int RequiredConfirmations { get; set; }

    // Status
    public PaymentStatus Status { get; set; }
    public string Purpose { get; set; } // "premium_subscription", "donation", "purchase"
    public string Plan { get; set; } // "monthly", "yearly", "lifetime"

    // Timing
    public DateTime ExpiresAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; }
    public Bird Bird { get; set; }
}

public enum PaymentStatus
{
    Pending,      // Payment initiated, awaiting transaction
    Confirming,   // Transaction detected, awaiting confirmations
    Confirmed,    // Payment confirmed
    Completed,    // Payment completed and credited
    Expired,      // Payment window expired
    Cancelled,    // Payment cancelled by user
    Failed        // Payment failed
}
```

### SupportTransaction Entity

```csharp
// Models/SupportTransaction.cs
public class SupportTransaction
{
    public Guid Id { get; set; }
    public Guid SupporterId { get; set; }
    public Guid? BirdId { get; set; } // Nullable for platform support

    // Amount details
    public decimal Amount { get; set; } // User's donation amount
    public decimal PlatformFee { get; set; } // 5% platform fee (minimum $1)
    public decimal TotalAmount { get; set; } // Total charged (Amount + PlatformFee)

    // Payment details
    public string PaymentProvider { get; set; } // "Crypto", "PayPal"
    public string PaymentId { get; set; } // Transaction hash or PayPal ID
    public string Status { get; set; } // "completed", "pending", "failed"

    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User Supporter { get; set; }
    public Bird Bird { get; set; }
}
```

### Database Migration

```csharp
// Migrations/AddCryptoPayments.cs
public partial class AddCryptoPayments : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "CryptoPaymentRequests",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                UserId = table.Column<Guid>(nullable: false),
                BirdId = table.Column<Guid>(nullable: true),
                AmountUsd = table.Column<decimal>(type: "decimal(18,2)", nullable: false, comment: "User's donation amount"),
                PlatformFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false, comment: "5% platform fee (min $1)"),
                TotalAmountUsd = table.Column<decimal>(type: "decimal(18,2)", nullable: false, comment: "Total charged (AmountUsd + PlatformFee)"),
                AmountCrypto = table.Column<decimal>(type: "decimal(18,8)", nullable: false, comment: "Crypto amount based on TotalAmountUsd"),
                Currency = table.Column<string>(maxLength: 10, nullable: false),
                Network = table.Column<string>(maxLength: 50, nullable: false),
                ExchangeRate = table.Column<decimal>(type: "decimal(18,8)", nullable: false),
                WalletAddress = table.Column<string>(maxLength: 100, nullable: false),
                UserWalletAddress = table.Column<string>(maxLength: 100, nullable: true),
                QrCodeData = table.Column<string>(nullable: true),
                PaymentUri = table.Column<string>(maxLength: 500, nullable: false),
                TransactionHash = table.Column<string>(maxLength: 100, nullable: true),
                Confirmations = table.Column<int>(nullable: false, defaultValue: 0),
                RequiredConfirmations = table.Column<int>(nullable: false),
                Status = table.Column<int>(nullable: false),
                Purpose = table.Column<string>(maxLength: 50, nullable: false),
                Plan = table.Column<string>(maxLength: 20, nullable: true),
                ExpiresAt = table.Column<DateTime>(nullable: false),
                ConfirmedAt = table.Column<DateTime>(nullable: true),
                CompletedAt = table.Column<DateTime>(nullable: true),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_CryptoPaymentRequests", x => x.Id);
                table.ForeignKey(
                    name: "FK_CryptoPaymentRequests_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_CryptoPaymentRequests_Birds_BirdId",
                    column: x => x.BirdId,
                    principalTable: "Birds",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateIndex(
            name: "IX_CryptoPaymentRequests_UserId",
            table: "CryptoPaymentRequests",
            column: "UserId");

        migrationBuilder.CreateIndex(
            name: "IX_CryptoPaymentRequests_TransactionHash",
            table: "CryptoPaymentRequests",
            column: "TransactionHash");

        migrationBuilder.CreateIndex(
            name: "IX_CryptoPaymentRequests_Status",
            table: "CryptoPaymentRequests",
            column: "Status");

        // Support Transactions Table
        migrationBuilder.CreateTable(
            name: "SupportTransactions",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                SupporterId = table.Column<Guid>(nullable: false),
                BirdId = table.Column<Guid>(nullable: true),
                Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false, comment: "User's donation amount"),
                PlatformFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false, comment: "Platform fee (5%, min $1)"),
                TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false, comment: "Total charged"),
                PaymentProvider = table.Column<string>(maxLength: 50, nullable: false),
                PaymentId = table.Column<string>(maxLength: 100, nullable: false),
                Status = table.Column<string>(maxLength: 20, nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_SupportTransactions", x => x.Id);
                table.ForeignKey(
                    name: "FK_SupportTransactions_Users_SupporterId",
                    column: x => x.SupporterId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_SupportTransactions_Birds_BirdId",
                    column: x => x.BirdId,
                    principalTable: "Birds",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateIndex(
            name: "IX_SupportTransactions_SupporterId",
            table: "SupportTransactions",
            column: "SupporterId");

        migrationBuilder.CreateIndex(
            name: "IX_SupportTransactions_BirdId",
            table: "SupportTransactions",
            column: "BirdId");

        migrationBuilder.CreateIndex(
            name: "IX_SupportTransactions_PaymentId",
            table: "SupportTransactions",
            column: "PaymentId");
    }
}
```

---

## 3. Payment Service Implementation

### ICryptoPaymentService Interface

```csharp
// Services/Interfaces/ICryptoPaymentService.cs
public interface ICryptoPaymentService
{
    Task<CryptoPaymentResponse> CreatePaymentAsync(CreateCryptoPaymentDto dto, Guid userId);
    Task<CryptoPaymentRequest> GetPaymentAsync(Guid paymentId, Guid userId);
    Task<CryptoPaymentRequest> VerifyPaymentAsync(Guid paymentId, string transactionHash, Guid userId);
    Task<CryptoPaymentRequest> CheckPaymentStatusAsync(Guid paymentId, Guid userId);
    Task<decimal> GetExchangeRateAsync(string currency);
    Task<List<CryptoPaymentRequest>> GetPaymentHistoryAsync(Guid userId, int page = 1, int pageSize = 20);
    Task CancelPaymentAsync(Guid paymentId, Guid userId);
    string GetWalletAddressForNetwork(string currency, string network);
}
```

### CryptoPaymentService Implementation

```csharp
// Services/CryptoPaymentService.cs
public class CryptoPaymentService : ICryptoPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CryptoPaymentService> _logger;
    private readonly IBlockchainService _blockchainService;
    private readonly IQrCodeService _qrCodeService;
    private readonly CryptoPaymentSettings _settings;

    public CryptoPaymentService(
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<CryptoPaymentService> logger,
        IBlockchainService blockchainService,
        IQrCodeService qrCodeService,
        IOptions<CryptoPaymentSettings> settings)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _blockchainService = blockchainService;
        _qrCodeService = qrCodeService;
        _settings = settings.Value;
    }

    public async Task<CryptoPaymentResponse> CreatePaymentAsync(CreateCryptoPaymentDto dto, Guid userId)
    {
        _logger.LogInformation($"Creating crypto payment for user {userId}: {dto.AmountUsd} USD");

        // Validate network for currency
        var walletAddress = GetWalletAddressForNetwork(dto.Currency, dto.Network);
        if (string.IsNullOrEmpty(walletAddress))
        {
            throw new InvalidOperationException($"Unsupported network '{dto.Network}' for currency '{dto.Currency}'");
        }

        // Validate minimum amount
        if (dto.AmountUsd < _settings.MinimumAmount)
        {
            throw new InvalidOperationException(
                $"Minimum payment amount is ${_settings.MinimumAmount}. " +
                $"This minimum is required because cryptocurrency network fees make smaller transactions uneconomical."
            );
        }

        // Calculate platform fee and total amount
        var (donationAmount, platformFee, totalAmountUsd) = FeeCalculationHelper.CalculateTotalAmount(
            dto.AmountUsd,
            _settings.PlatformFeePercentage,
            _settings.MinimumPlatformFee
        );

        _logger.LogInformation(
            $"Fee calculation - Donation: ${donationAmount:F2}, " +
            $"Platform Fee: ${platformFee:F2} ({_settings.PlatformFeePercentage:P0}), " +
            $"Total: ${totalAmountUsd:F2}"
        );

        // Get current exchange rate
        var exchangeRate = await GetExchangeRateAsync(dto.Currency);

        // Calculate crypto amount based on TOTAL amount (donation + fee)
        var amountCrypto = totalAmountUsd / exchangeRate;

        // Get required confirmations based on network
        var requiredConfirmations = GetRequiredConfirmations(dto.Network);

        // Generate payment URI for the TOTAL amount
        var paymentUri = GeneratePaymentUri(dto.Currency, dto.Network, walletAddress, amountCrypto);

        // Generate QR code
        var qrCodeData = await _qrCodeService.GenerateQrCodeAsync(paymentUri);

        // Create payment request
        var payment = new CryptoPaymentRequest
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BirdId = dto.BirdId,
            AmountUsd = donationAmount, // User's intended donation amount
            PlatformFee = platformFee, // 5% platform fee
            TotalAmountUsd = totalAmountUsd, // Total to be charged
            AmountCrypto = amountCrypto, // Crypto amount for total
            Currency = dto.Currency,
            Network = dto.Network,
            ExchangeRate = exchangeRate,
            WalletAddress = walletAddress,
            UserWalletAddress = dto.UserWalletAddress,
            QrCodeData = qrCodeData,
            PaymentUri = paymentUri,
            Confirmations = 0,
            RequiredConfirmations = requiredConfirmations,
            Status = PaymentStatus.Pending,
            Purpose = dto.Purpose,
            Plan = dto.Plan,
            ExpiresAt = DateTime.UtcNow.AddMinutes(_settings.PaymentExpirationMinutes),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.CryptoPaymentRequests.Add(payment);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Payment created: {payment.Id}");

        return new CryptoPaymentResponse
        {
            PaymentRequest = payment,
            Message = "Payment request created successfully",
            FeeBreakdown = new FeeBreakdown
            {
                DonationAmount = donationAmount,
                PlatformFee = platformFee,
                PlatformFeePercentage = _settings.PlatformFeePercentage,
                TotalAmount = totalAmountUsd,
                Explanation = $"A {(_settings.PlatformFeePercentage * 100):F0}% platform fee (minimum ${_settings.MinimumPlatformFee}) " +
                             "helps maintain Wihngo and support bird conservation efforts."
            }
        };
    }

    public string GetWalletAddressForNetwork(string currency, string network)
    {
        if (currency != "USDT")
        {
            _logger.LogWarning($"Unsupported currency: {currency}");
            return null;
        }

        var networkSettings = network.ToLower() switch
        {
            "tron" => _settings.USDT.GetValueOrDefault("Tron"),
            "ethereum" => _settings.USDT.GetValueOrDefault("Ethereum"),
            "binance-smart-chain" => _settings.USDT.GetValueOrDefault("BinanceSmartChain"),
            _ => null
        };

        if (networkSettings == null || !networkSettings.Enabled)
        {
            _logger.LogWarning($"Network '{network}' not configured or disabled for {currency}");
            return null;
        }

        return networkSettings.Address;
    }

    private int GetRequiredConfirmations(string network)
    {
        return network.ToLower() switch
        {
            "tron" => 19,
            "ethereum" => 12,
            "binance-smart-chain" => 15,
            _ => 12
        };
    }

    private string GeneratePaymentUri(string currency, string network, string address, decimal amount)
    {
        // For USDT, the URI format depends on the network
        return network.ToLower() switch
        {
            "tron" => $"tron:{address}?amount={amount}&token=USDT",
            "ethereum" => $"ethereum:{address}?value=0&token=0xdAC17F958D2ee523a2206206994597C13D831ec7&amount={amount}",
            "binance-smart-chain" => $"ethereum:{address}?chainId=56&value=0&token=0x55d398326f99059fF775485246999027B3197955&amount={amount}",
            _ => address
        };
    }

    public async Task<decimal> GetExchangeRateAsync(string currency)
    {
        try
        {
            // For USDT, the rate is typically 1:1 with USD, but can fluctuate slightly
            // In production, fetch from a reliable price oracle like:
            // - CoinGecko API
            // - CoinMarketCap API
            // - Chainlink Price Feeds
            // - Binance API

            // Example: Using a hypothetical price service
            // var rate = await _priceService.GetPriceAsync(currency, "USD");

            // For USDT, we'll use a near 1:1 rate
            if (currency == "USDT")
            {
                return 1.00m; // In production, fetch actual rate
            }

            throw new NotSupportedException($"Currency {currency} is not supported");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to get exchange rate for {currency}");
            throw new InvalidOperationException("Unable to get current exchange rate", ex);
        }
    }

    public async Task<CryptoPaymentRequest> VerifyPaymentAsync(Guid paymentId, string transactionHash, Guid userId)
    {
        var payment = await _context.CryptoPaymentRequests
            .FirstOrDefaultAsync(p => p.Id == paymentId && p.UserId == userId);

        if (payment == null)
        {
            throw new NotFoundException("Payment not found");
        }

        if (payment.Status != PaymentStatus.Pending)
        {
            _logger.LogWarning($"Payment {paymentId} is not in pending status: {payment.Status}");
            return payment;
        }

        // Verify transaction on blockchain
        var transaction = await _blockchainService.GetTransactionAsync(
            transactionHash,
            payment.Network);

        if (transaction == null)
        {
            throw new InvalidOperationException("Transaction not found on blockchain");
        }

        // Verify transaction details
        if (!transaction.ToAddress.Equals(payment.WalletAddress, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Transaction destination address does not match");
        }

        if (transaction.Amount < payment.AmountCrypto * 0.99m) // Allow 1% tolerance
        {
            throw new InvalidOperationException($"Transaction amount ({transaction.Amount}) is less than required ({payment.AmountCrypto})");
        }

        // Update payment with transaction details
        payment.TransactionHash = transactionHash;
        payment.Confirmations = transaction.Confirmations;
        payment.UserWalletAddress = transaction.FromAddress;
        payment.Status = transaction.Confirmations >= payment.RequiredConfirmations
            ? PaymentStatus.Confirmed
            : PaymentStatus.Confirming;
        payment.UpdatedAt = DateTime.UtcNow;

        if (payment.Status == PaymentStatus.Confirmed)
        {
            payment.ConfirmedAt = DateTime.UtcNow;
            await ProcessConfirmedPaymentAsync(payment);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation($"Payment {paymentId} verified: {payment.Status}, Confirmations: {payment.Confirmations}/{payment.RequiredConfirmations}");

        return payment;
    }

    public async Task<CryptoPaymentRequest> CheckPaymentStatusAsync(Guid paymentId, Guid userId)
    {
        var payment = await _context.CryptoPaymentRequests
            .FirstOrDefaultAsync(p => p.Id == paymentId && p.UserId == userId);

        if (payment == null)
        {
            throw new NotFoundException("Payment not found");
        }

        // Check if payment has expired
        if (payment.Status == PaymentStatus.Pending && DateTime.UtcNow > payment.ExpiresAt)
        {
            payment.Status = PaymentStatus.Expired;
            payment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return payment;
        }

        // If payment is confirming, check for updates
        if (payment.Status == PaymentStatus.Confirming && !string.IsNullOrEmpty(payment.TransactionHash))
        {
            try
            {
                var transaction = await _blockchainService.GetTransactionAsync(
                    payment.TransactionHash,
                    payment.Network);

                if (transaction != null)
                {
                    payment.Confirmations = transaction.Confirmations;

                    if (transaction.Confirmations >= payment.RequiredConfirmations &&
                        payment.Status != PaymentStatus.Confirmed)
                    {
                        payment.Status = PaymentStatus.Confirmed;
                        payment.ConfirmedAt = DateTime.UtcNow;
                        await ProcessConfirmedPaymentAsync(payment);
                    }

                    payment.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking payment status for {paymentId}");
            }
        }

        return payment;
    }

    private async Task ProcessConfirmedPaymentAsync(CryptoPaymentRequest payment)
    {
        _logger.LogInformation($"Processing confirmed payment: {payment.Id}");

        try
        {
            // Handle payment based on purpose
            switch (payment.Purpose)
            {
                case "premium_subscription":
                    await ActivatePremiumSubscriptionAsync(payment);
                    break;
                case "donation":
                    await ProcessDonationAsync(payment);
                    break;
                case "purchase":
                    await ProcessPurchaseAsync(payment);
                    break;
                default:
                    _logger.LogWarning($"Unknown payment purpose: {payment.Purpose}");
                    break;
            }

            payment.Status = PaymentStatus.Completed;
            payment.CompletedAt = DateTime.UtcNow;
            payment.UpdatedAt = DateTime.UtcNow;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error processing confirmed payment {payment.Id}");
            payment.Status = PaymentStatus.Failed;
            payment.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    private async Task ActivatePremiumSubscriptionAsync(CryptoPaymentRequest payment)
    {
        if (payment.BirdId == null)
        {
            throw new InvalidOperationException("Bird ID is required for premium subscription");
        }

        var bird = await _context.Birds.FindAsync(payment.BirdId.Value);
        if (bird == null)
        {
            throw new NotFoundException("Bird not found");
        }

        // Calculate subscription end date based on plan
        var endDate = payment.Plan switch
        {
            "monthly" => DateTime.UtcNow.AddMonths(1),
            "yearly" => DateTime.UtcNow.AddYears(1),
            "lifetime" => DateTime.MaxValue,
            _ => throw new InvalidOperationException($"Unknown plan: {payment.Plan}")
        };

        // Update bird premium status
        bird.IsPremium = true;
        bird.PremiumStartDate = DateTime.UtcNow;
        bird.PremiumEndDate = endDate;
        bird.UpdatedAt = DateTime.UtcNow;

        _logger.LogInformation($"Activated premium subscription for bird {bird.Id} until {endDate}");
    }

    private async Task ProcessDonationAsync(CryptoPaymentRequest payment)
    {
        // Handle donation logic
        _logger.LogInformation($"Processing donation of ${payment.AmountUsd}");
        // Add donation record, update stats, send thank you notification, etc.
    }

    private async Task ProcessPurchaseAsync(CryptoPaymentRequest payment)
    {
        // Handle purchase logic
        _logger.LogInformation($"Processing purchase of ${payment.AmountUsd}");
        // Fulfill purchase, update inventory, send confirmation, etc.
    }

    public async Task<List<CryptoPaymentRequest>> GetPaymentHistoryAsync(Guid userId, int page = 1, int pageSize = 20)
    {
        return await _context.CryptoPaymentRequests
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task CancelPaymentAsync(Guid paymentId, Guid userId)
    {
        var payment = await _context.CryptoPaymentRequests
            .FirstOrDefaultAsync(p => p.Id == paymentId && p.UserId == userId);

        if (payment == null)
        {
            throw new NotFoundException("Payment not found");
        }

        if (payment.Status != PaymentStatus.Pending)
        {
            throw new InvalidOperationException($"Cannot cancel payment in {payment.Status} status");
        }

        payment.Status = PaymentStatus.Cancelled;
        payment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Payment {paymentId} cancelled by user");
    }
}
```

---

## 4. Blockchain Integration

### IBlockchainService Interface

```csharp
// Services/Interfaces/IBlockchainService.cs
public interface IBlockchainService
{
    Task<BlockchainTransaction> GetTransactionAsync(string transactionHash, string network);
    Task<List<BlockchainTransaction>> GetTransactionsByAddressAsync(string address, string network, int limit = 100);
    Task<decimal> GetBalanceAsync(string address, string network, string tokenAddress = null);
}

public class BlockchainTransaction
{
    public string Hash { get; set; }
    public string FromAddress { get; set; }
    public string ToAddress { get; set; }
    public decimal Amount { get; set; }
    public int Confirmations { get; set; }
    public long BlockNumber { get; set; }
    public DateTime Timestamp { get; set; }
    public string Status { get; set; } // "confirmed", "pending", "failed"
}
```

### BlockchainService Implementation

```csharp
// Services/BlockchainService.cs
public class BlockchainService : IBlockchainService
{
    private readonly ILogger<BlockchainService> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public BlockchainService(
        ILogger<BlockchainService> logger,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration)
    {
        _logger = logger;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<BlockchainTransaction> GetTransactionAsync(string transactionHash, string network)
    {
        return network.ToLower() switch
        {
            "tron" => await GetTronTransactionAsync(transactionHash),
            "ethereum" => await GetEthereumTransactionAsync(transactionHash),
            "binance-smart-chain" => await GetBscTransactionAsync(transactionHash),
            _ => throw new NotSupportedException($"Network {network} is not supported")
        };
    }

    private async Task<BlockchainTransaction> GetTronTransactionAsync(string txHash)
    {
        try
        {
            // Use TronGrid API or TronWeb
            // Documentation: https://developers.tron.network/reference/gettransactionbyid

            var client = _httpClientFactory.CreateClient();
            var apiKey = _configuration["BlockchainApi:TronGrid:ApiKey"];
            client.DefaultRequestHeaders.Add("TRON-PRO-API-KEY", apiKey);

            var response = await client.GetAsync($"https://api.trongrid.io/wallet/gettransactionbyid?value={txHash}");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var tx = JsonSerializer.Deserialize<TronTransaction>(content);

            // Parse USDT TRC-20 transaction
            // Contract address for USDT on TRON: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
            var transaction = new BlockchainTransaction
            {
                Hash = txHash,
                // Parse from, to, and amount from contract data
                Confirmations = await GetTronConfirmationsAsync(txHash),
                Status = tx.Ret?[0]?.ContractRet == "SUCCESS" ? "confirmed" : "pending"
            };

            return transaction;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching TRON transaction {txHash}");
            throw;
        }
    }

    private async Task<BlockchainTransaction> GetEthereumTransactionAsync(string txHash)
    {
        try
        {
            // Use Etherscan API or Infura/Alchemy Web3 provider
            // Documentation: https://docs.etherscan.io/api-endpoints/accounts

            var client = _httpClientFactory.CreateClient();
            var apiKey = _configuration["BlockchainApi:Etherscan:ApiKey"];

            var response = await client.GetAsync(
                $"https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash={txHash}&apikey={apiKey}");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<EtherscanResponse>(content);

            // For USDT (ERC-20), parse the transaction logs
            // USDT contract on Ethereum: 0xdAC17F958D2ee523a2206206994597C13D831ec7

            var confirmations = await GetEthereumConfirmationsAsync(txHash);

            var transaction = new BlockchainTransaction
            {
                Hash = txHash,
                FromAddress = result.Result.From,
                ToAddress = result.Result.To,
                Confirmations = confirmations,
                Status = confirmations > 0 ? "confirmed" : "pending"
            };

            return transaction;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching Ethereum transaction {txHash}");
            throw;
        }
    }

    private async Task<BlockchainTransaction> GetBscTransactionAsync(string txHash)
    {
        try
        {
            // Use BscScan API (similar to Etherscan)
            // Documentation: https://docs.bscscan.com/api-endpoints/accounts

            var client = _httpClientFactory.CreateClient();
            var apiKey = _configuration["BlockchainApi:BscScan:ApiKey"];

            var response = await client.GetAsync(
                $"https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash={txHash}&apikey={apiKey}");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<BscScanResponse>(content);

            // For USDT (BEP-20), parse the transaction logs
            // USDT contract on BSC: 0x55d398326f99059fF775485246999027B3197955

            var confirmations = await GetBscConfirmationsAsync(txHash);

            var transaction = new BlockchainTransaction
            {
                Hash = txHash,
                FromAddress = result.Result.From,
                ToAddress = result.Result.To,
                Confirmations = confirmations,
                Status = confirmations > 0 ? "confirmed" : "pending"
            };

            return transaction;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching BSC transaction {txHash}");
            throw;
        }
    }

    private async Task<int> GetTronConfirmationsAsync(string txHash)
    {
        // Fetch current block height and transaction block height
        // Confirmations = Current Block - Transaction Block
        // Implement based on TronGrid API
        return 0; // Placeholder
    }

    private async Task<int> GetEthereumConfirmationsAsync(string txHash)
    {
        // Fetch current block height and transaction block height
        // Confirmations = Current Block - Transaction Block
        // Implement based on Etherscan or Infura API
        return 0; // Placeholder
    }

    private async Task<int> GetBscConfirmationsAsync(string txHash)
    {
        // Fetch current block height and transaction block height
        // Confirmations = Current Block - Transaction Block
        // Implement based on BscScan API
        return 0; // Placeholder
    }

    public async Task<List<BlockchainTransaction>> GetTransactionsByAddressAsync(
        string address, string network, int limit = 100)
    {
        return network.ToLower() switch
        {
            "tron" => await GetTronTransactionsByAddressAsync(address, limit),
            "ethereum" => await GetEthereumTransactionsByAddressAsync(address, limit),
            "binance-smart-chain" => await GetBscTransactionsByAddressAsync(address, limit),
            _ => throw new NotSupportedException($"Network {network} is not supported")
        };
    }

    private async Task<List<BlockchainTransaction>> GetTronTransactionsByAddressAsync(string address, int limit)
    {
        // Implement using TronGrid API
        // Filter for USDT TRC-20 transfers
        return new List<BlockchainTransaction>();
    }

    private async Task<List<BlockchainTransaction>> GetEthereumTransactionsByAddressAsync(string address, int limit)
    {
        // Implement using Etherscan API
        // Filter for USDT ERC-20 transfers
        return new List<BlockchainTransaction>();
    }

    private async Task<List<BlockchainTransaction>> GetBscTransactionsByAddressAsync(string address, int limit)
    {
        // Implement using BscScan API
        // Filter for USDT BEP-20 transfers
        return new List<BlockchainTransaction>();
    }

    public async Task<decimal> GetBalanceAsync(string address, string network, string tokenAddress = null)
    {
        // Implement balance checking for each network
        return 0m;
    }
}
```

---

## 5. API Endpoints

### CryptoPaymentController

```csharp
// Controllers/CryptoPaymentController.cs
[ApiController]
[Route("api/payments/crypto")]
[Authorize]
public class CryptoPaymentController : ControllerBase
{
    private readonly ICryptoPaymentService _paymentService;
    private readonly ILogger<CryptoPaymentController> _logger;

    public CryptoPaymentController(
        ICryptoPaymentService paymentService,
        ILogger<CryptoPaymentController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new crypto payment request
    /// </summary>
    [HttpPost("create")]
    [ProducesResponseType(typeof(CryptoPaymentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePayment([FromBody] CreateCryptoPaymentDto dto)
    {
        var userId = GetUserId();
        var response = await _paymentService.CreatePaymentAsync(dto, userId);
        return Ok(response);
    }

    /// <summary>
    /// Get payment request details
    /// </summary>
    [HttpGet("{paymentId}")]
    [ProducesResponseType(typeof(CryptoPaymentRequest), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPayment(Guid paymentId)
    {
        var userId = GetUserId();
        var payment = await _paymentService.GetPaymentAsync(paymentId, userId);
        return Ok(payment);
    }

    /// <summary>
    /// Verify a payment with transaction hash
    /// </summary>
    [HttpPost("{paymentId}/verify")]
    [ProducesResponseType(typeof(CryptoPaymentRequest), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyPayment(
        Guid paymentId,
        [FromBody] VerifyPaymentDto dto)
    {
        var userId = GetUserId();
        var payment = await _paymentService.VerifyPaymentAsync(
            paymentId,
            dto.TransactionHash,
            userId);
        return Ok(payment);
    }

    /// <summary>
    /// Check payment status and update confirmations
    /// </summary>
    [HttpPost("{paymentId}/check-status")]
    [ProducesResponseType(typeof(CryptoPaymentRequest), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckPaymentStatus(Guid paymentId)
    {
        var userId = GetUserId();
        var payment = await _paymentService.CheckPaymentStatusAsync(paymentId, userId);
        return Ok(payment);
    }

    /// <summary>
    /// Get current exchange rate for a currency
    /// </summary>
    [HttpGet("rates/{currency}")]
    [ProducesResponseType(typeof(ExchangeRateResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetExchangeRate(string currency)
    {
        var rate = await _paymentService.GetExchangeRateAsync(currency);
        return Ok(new ExchangeRateResponse
        {
            Currency = currency,
            UsdRate = rate,
            LastUpdated = DateTime.UtcNow,
            Source = "Internal"
        });
    }

    /// <summary>
    /// Get payment history for the authenticated user
    /// </summary>
    [HttpGet("history")]
    [ProducesResponseType(typeof(PaymentHistoryResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaymentHistory(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        var payments = await _paymentService.GetPaymentHistoryAsync(userId, page, pageSize);
        return Ok(new PaymentHistoryResponse
        {
            Payments = payments,
            Page = page,
            PageSize = pageSize,
            Total = payments.Count
        });
    }

    /// <summary>
    /// Cancel a pending payment
    /// </summary>
    [HttpPost("{paymentId}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CancelPayment(Guid paymentId)
    {
        var userId = GetUserId();
        await _paymentService.CancelPaymentAsync(paymentId, userId);
        return Ok(new { message = "Payment cancelled successfully" });
    }

    /// <summary>
    /// Get platform wallet address for a specific network
    /// </summary>
    [HttpGet("wallet/{currency}/{network}")]
    [ProducesResponseType(typeof(WalletInfoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetWalletInfo(string currency, string network)
    {
        var address = _paymentService.GetWalletAddressForNetwork(currency, network);

        if (string.IsNullOrEmpty(address))
        {
            return NotFound(new { message = $"No wallet configured for {currency} on {network}" });
        }

        return Ok(new WalletInfoResponse
        {
            Currency = currency,
            Network = network,
            Address = address,
            IsActive = true,
            MinimumAmount = 10.0m,
            MinimumReason = "Cryptocurrency network fees make transactions below $10 uneconomical. " +
                           "This minimum ensures your donation reaches its destination effectively."
        });
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim);
    }
}
```

### SupportTransactionController

```csharp
// Controllers/SupportTransactionController.cs
[ApiController]
[Route("api/support")]
[Authorize]
public class SupportTransactionController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SupportTransactionController> _logger;

    public SupportTransactionController(
        ApplicationDbContext context,
        ILogger<SupportTransactionController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Create a support transaction record
    /// </summary>
    [HttpPost("transactions")]
    [ProducesResponseType(typeof(SupportTransaction), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTransaction([FromBody] CreateSupportTransactionDto dto)
    {
        var userId = GetUserId();

        // Validate supporter is the authenticated user
        if (dto.SupporterId != userId)
        {
            return Forbid();
        }

        // Validate fee calculation
        var expectedFee = Math.Max(dto.Amount * 0.05m, 1.0m);
        if (Math.Abs(dto.PlatformFee - expectedFee) > 0.01m)
        {
            return BadRequest(new {
                message = "Platform fee calculation is incorrect",
                expectedFee = expectedFee,
                providedFee = dto.PlatformFee
            });
        }

        var expectedTotal = dto.Amount + dto.PlatformFee;
        if (Math.Abs(dto.TotalAmount - expectedTotal) > 0.01m)
        {
            return BadRequest(new {
                message = "Total amount calculation is incorrect",
                expectedTotal = expectedTotal,
                providedTotal = dto.TotalAmount
            });
        }

        var transaction = new SupportTransaction
        {
            Id = Guid.NewGuid(),
            SupporterId = dto.SupporterId,
            BirdId = dto.BirdId,
            Amount = dto.Amount,
            PlatformFee = dto.PlatformFee,
            TotalAmount = dto.TotalAmount,
            PaymentProvider = dto.PaymentProvider,
            PaymentId = dto.PaymentId,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.SupportTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            $"Support transaction created: {transaction.Id} - " +
            $"Supporter: {dto.SupporterId}, Amount: ${dto.Amount}, Fee: ${dto.PlatformFee}, Total: ${dto.TotalAmount}"
        );

        return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
    }

    /// <summary>
    /// Get a support transaction by ID
    /// </summary>
    [HttpGet("transactions/{id}")]
    [ProducesResponseType(typeof(SupportTransaction), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTransaction(Guid id)
    {
        var transaction = await _context.SupportTransactions
            .Include(t => t.Supporter)
            .Include(t => t.Bird)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transaction == null)
        {
            return NotFound();
        }

        return Ok(transaction);
    }

    /// <summary>
    /// Get support transactions for a bird
    /// </summary>
    [HttpGet("birds/{birdId}/transactions")]
    [ProducesResponseType(typeof(List<SupportTransaction>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBirdTransactions(
        Guid birdId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var transactions = await _context.SupportTransactions
            .Where(t => t.BirdId == birdId && t.Status == "completed")
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(transactions);
    }

    /// <summary>
    /// Calculate platform fee for an amount
    /// </summary>
    [HttpGet("calculate-fee")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public IActionResult CalculateFee([FromQuery] decimal amount)
    {
        if (amount < 10)
        {
            return BadRequest(new {
                message = "Minimum donation amount is $10",
                reason = "Cryptocurrency network fees make smaller transactions uneconomical"
            });
        }

        var platformFee = Math.Max(amount * 0.05m, 1.0m);
        var totalAmount = amount + platformFee;

        return Ok(new
        {
            donationAmount = amount,
            platformFee = platformFee,
            platformFeePercentage = 5.0m,
            totalAmount = totalAmount,
            breakdown = $"${amount:F2} donation + ${platformFee:F2} platform fee (5%, min $1) = ${totalAmount:F2} total"
        });
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim);
    }
}
```

### DTOs

```csharp
// Models/DTOs/CreateCryptoPaymentDto.cs
public class CreateCryptoPaymentDto
{
    [Required]
    [Range(10, double.MaxValue, ErrorMessage = "Minimum donation amount is $10")]
    public decimal AmountUsd { get; set; } // User's intended donation amount (before platform fee)

    [Required]
    public string Currency { get; set; } // "USDT"

    [Required]
    public string Network { get; set; } // "tron", "ethereum", "binance-smart-chain"

    [Required]
    public string Purpose { get; set; } // "premium_subscription", "donation", "purchase"

    public Guid? BirdId { get; set; }
    public string Plan { get; set; } // "monthly", "yearly", "lifetime"
    public string UserWalletAddress { get; set; }
}

public class CreateSupportTransactionDto
{
    [Required]
    public Guid SupporterId { get; set; }

    public Guid? BirdId { get; set; }

    [Required]
    [Range(10, double.MaxValue)]
    public decimal Amount { get; set; } // User's donation amount

    [Required]
    [Range(0, double.MaxValue)]
    public decimal PlatformFee { get; set; } // 5% platform fee (min $1)

    [Required]
    [Range(0, double.MaxValue)]
    public decimal TotalAmount { get; set; } // Total charged

    [Required]
    public string PaymentProvider { get; set; }

    [Required]
    public string PaymentId { get; set; }

    [Required]
    public string Status { get; set; }
}

public class VerifyPaymentDto
{
    [Required]
    public string TransactionHash { get; set; }
    public string UserWalletAddress { get; set; }
}

public class CryptoPaymentResponse
{
    public CryptoPaymentRequest PaymentRequest { get; set; }
    public string Message { get; set; }
    public FeeBreakdown FeeBreakdown { get; set; } // Added for transparency
}

public class FeeBreakdown
{
    public decimal DonationAmount { get; set; }
    public decimal PlatformFee { get; set; }
    public decimal PlatformFeePercentage { get; set; }
    public decimal TotalAmount { get; set; }
    public string Explanation { get; set; }
}

public class ExchangeRateResponse
{
    public string Currency { get; set; }
    public decimal UsdRate { get; set; }
    public DateTime LastUpdated { get; set; }
    public string Source { get; set; }
}

public class WalletInfoResponse
{
    public string Currency { get; set; }
    public string Network { get; set; }
    public string Address { get; set; }
    public bool IsActive { get; set; }
    public decimal MinimumAmount { get; set; }
    public string MinimumReason { get; set; }
}

public class PaymentHistoryResponse
{
    public List<CryptoPaymentRequest> Payments { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int Total { get; set; }
}
```

---

## 6. Security Considerations

### Critical Security Measures

1. **Wallet Address Validation**

   - Verify all wallet addresses before storing
   - Validate transaction amounts match payment requests
   - Check transaction destination matches platform wallet

2. **API Security**

   - Require authentication for all payment endpoints
   - Implement rate limiting to prevent abuse
   - Use HTTPS only for all API communication

3. **Transaction Verification**

   - Always verify transactions on the blockchain
   - Check confirmations before marking as complete
   - Implement double-spend protection

4. **Data Protection**

   - Never expose private keys in code or logs
   - Store sensitive configuration in environment variables or Azure Key Vault
   - Log only necessary transaction details

5. **Error Handling**
   - Don't expose internal errors to clients
   - Log all errors for monitoring
   - Implement retry logic for blockchain API calls

### Recommended Security Libraries

```csharp
// Install NuGet packages:
// - Microsoft.AspNetCore.Authentication.JwtBearer
// - Microsoft.EntityFrameworkCore.SqlServer
// - NBitcoin (for Bitcoin/crypto utilities)
// - Nethereum.Web3 (for Ethereum/BSC integration)
```

---

## 7. Testing

### Unit Tests

```csharp
// Tests/Services/CryptoPaymentServiceTests.cs
public class CryptoPaymentServiceTests
{
    private readonly Mock<ApplicationDbContext> _contextMock;
    private readonly Mock<IBlockchainService> _blockchainMock;
    private readonly Mock<IQrCodeService> _qrCodeMock;
    private readonly CryptoPaymentService _service;

    [Fact]
    public async Task CreatePayment_ValidRequest_CreatesPayment()
    {
        // Arrange
        var dto = new CreateCryptoPaymentDto
        {
            AmountUsd = 50m,
            Currency = "USDT",
            Network = "tron",
            Purpose = "premium_subscription",
            Plan = "monthly"
        };

        // Act
        var result = await _service.CreatePaymentAsync(dto, Guid.NewGuid());

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.PaymentRequest);
        Assert.Equal(PaymentStatus.Pending, result.PaymentRequest.Status);
    }

    [Fact]
    public async Task GetWalletAddressForNetwork_Tron_ReturnsCorrectAddress()
    {
        // Act
        var address = _service.GetWalletAddressForNetwork("USDT", "tron");

        // Assert
        Assert.Equal("TGRzhw2kwBW5PzncWfKCnqsvkrBezfsgiA", address);
    }

    [Fact]
    public async Task VerifyPayment_ValidTransaction_UpdatesPaymentStatus()
    {
        // Arrange
        var paymentId = Guid.NewGuid();
        var txHash = "0x123...";

        _blockchainMock
            .Setup(x => x.GetTransactionAsync(txHash, "tron"))
            .ReturnsAsync(new BlockchainTransaction
            {
                Hash = txHash,
                Confirmations = 20,
                Amount = 50m
            });

        // Act
        var result = await _service.VerifyPaymentAsync(paymentId, txHash, Guid.NewGuid());

        // Assert
        Assert.Equal(PaymentStatus.Confirmed, result.Status);
    }
}
```

### Integration Tests

```csharp
// Tests/Integration/CryptoPaymentIntegrationTests.cs
public class CryptoPaymentIntegrationTests : IClassFixture<WebApplicationFactory<Startup>>
{
    private readonly HttpClient _client;

    public CryptoPaymentIntegrationTests(WebApplicationFactory<Startup> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreatePayment_EndToEnd_Success()
    {
        // Arrange
        var request = new CreateCryptoPaymentDto
        {
            AmountUsd = 50m,
            Currency = "USDT",
            Network = "tron",
            Purpose = "premium_subscription",
            Plan = "monthly"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/payments/crypto/create", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<CryptoPaymentResponse>();
        Assert.NotNull(result.PaymentRequest);
    }
}
```

---

## 8. Background Services

### Payment Monitoring Service

```csharp
// Services/PaymentMonitoringService.cs
public class PaymentMonitoringService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PaymentMonitoringService> _logger;
    private readonly int _pollingIntervalSeconds;

    public PaymentMonitoringService(
        IServiceProvider serviceProvider,
        ILogger<PaymentMonitoringService> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _pollingIntervalSeconds = configuration.GetValue<int>("CryptoPayment:PollingIntervalSeconds", 15);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Payment Monitoring Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await MonitorPendingPaymentsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error monitoring payments");
            }

            await Task.Delay(TimeSpan.FromSeconds(_pollingIntervalSeconds), stoppingToken);
        }

        _logger.LogInformation("Payment Monitoring Service stopped");
    }

    private async Task MonitorPendingPaymentsAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var blockchainService = scope.ServiceProvider.GetRequiredService<IBlockchainService>();

        // Get all payments that need monitoring
        var paymentsToMonitor = await context.CryptoPaymentRequests
            .Where(p => p.Status == PaymentStatus.Pending || p.Status == PaymentStatus.Confirming)
            .Where(p => p.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        _logger.LogInformation($"Monitoring {paymentsToMonitor.Count} payments");

        foreach (var payment in paymentsToMonitor)
        {
            try
            {
                await CheckPaymentStatusAsync(payment, blockchainService, context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking payment {payment.Id}");
            }
        }

        await context.SaveChangesAsync();
    }

    private async Task CheckPaymentStatusAsync(
        CryptoPaymentRequest payment,
        IBlockchainService blockchainService,
        ApplicationDbContext context)
    {
        // For pending payments, check for incoming transactions
        if (payment.Status == PaymentStatus.Pending)
        {
            var transactions = await blockchainService.GetTransactionsByAddressAsync(
                payment.WalletAddress,
                payment.Network,
                limit: 10);

            var matchingTx = transactions.FirstOrDefault(tx =>
                tx.ToAddress.Equals(payment.WalletAddress, StringComparison.OrdinalIgnoreCase) &&
                tx.Amount >= payment.AmountCrypto * 0.99m &&
                tx.Timestamp >= payment.CreatedAt);

            if (matchingTx != null)
            {
                payment.TransactionHash = matchingTx.Hash;
                payment.Confirmations = matchingTx.Confirmations;
                payment.UserWalletAddress = matchingTx.FromAddress;
                payment.Status = matchingTx.Confirmations >= payment.RequiredConfirmations
                    ? PaymentStatus.Confirmed
                    : PaymentStatus.Confirming;
                payment.UpdatedAt = DateTime.UtcNow;

                _logger.LogInformation($"Transaction detected for payment {payment.Id}: {matchingTx.Hash}");
            }
        }

        // For confirming payments, update confirmation count
        if (payment.Status == PaymentStatus.Confirming && !string.IsNullOrEmpty(payment.TransactionHash))
        {
            var transaction = await blockchainService.GetTransactionAsync(
                payment.TransactionHash,
                payment.Network);

            if (transaction != null)
            {
                payment.Confirmations = transaction.Confirmations;

                if (transaction.Confirmations >= payment.RequiredConfirmations)
                {
                    payment.Status = PaymentStatus.Confirmed;
                    payment.ConfirmedAt = DateTime.UtcNow;
                    _logger.LogInformation($"Payment {payment.Id} confirmed with {transaction.Confirmations} confirmations");

                    // Process the confirmed payment
                    // This should trigger subscription activation, etc.
                }

                payment.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
```

### Register Background Service

```csharp
// Startup.cs or Program.cs
services.AddHostedService<PaymentMonitoringService>();
```

---

## 9. Deployment Checklist

- [ ] Configure wallet addresses in production environment
- [ ] Set up blockchain API keys (TronGrid, Etherscan, BscScan)
- [ ] Configure database connection strings
- [ ] Set up application insights/logging
- [ ] Enable HTTPS and configure SSL certificates
- [ ] Configure authentication and authorization
- [ ] Set up rate limiting
- [ ] Configure CORS policies
- [ ] Test payment flow end-to-end
- [ ] Set up monitoring and alerts
- [ ] Document API endpoints
- [ ] Prepare rollback plan

---

## 10. Monitoring and Maintenance

### Key Metrics to Monitor

1. **Payment Success Rate**: Track percentage of successful payments
2. **Average Confirmation Time**: Monitor blockchain confirmation times
3. **Failed Transactions**: Alert on failed verification attempts
4. **API Response Times**: Monitor blockchain API performance
5. **Pending Payments**: Track payments awaiting confirmation

### Recommended Tools

- **Application Insights** for logging and monitoring
- **Azure Monitor** for infrastructure monitoring
- **Sentry** or **Raygun** for error tracking
- **SignalR** for real-time payment status updates to clients

---

## Support and Resources

### Blockchain API Documentation

- **TRON**: https://developers.tron.network/
- **Ethereum**: https://ethereum.org/en/developers/
- **BSC**: https://docs.bnbchain.org/

### NuGet Packages

```bash
# Blockchain integration
dotnet add package Nethereum.Web3
dotnet add package NBitcoin

# QR Code generation
dotnet add package QRCoder

# HTTP clients
dotnet add package Microsoft.Extensions.Http.Polly
```

### Additional Considerations

- Implement webhook support for blockchain events
- Consider using Chainlink or similar oracle services for exchange rates
- Implement multi-signature wallets for enhanced security
- Set up automated reconciliation processes
- Plan for network upgrades and maintenance windows

---

## Contact

For questions or issues with this implementation, please contact the development team or create an issue in the project repository.

**Last Updated**: December 11, 2025
**Version**: 1.0
