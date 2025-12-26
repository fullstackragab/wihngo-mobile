# 🔧 ASP.NET Web API - Premium Bird Profile Backend Implementation

**Target Framework:** .NET 6.0 or .NET 8.0  
**Database:** SQL Server / PostgreSQL with Entity Framework Core  
**Created:** December 11, 2025

---

## 📋 Overview

Implement the backend API endpoints to support premium bird profile subscriptions, charity tracking, and premium feature management.

---

## 🗄️ Database Schema

### 1. BirdPremiumSubscription Table

```sql
CREATE TABLE BirdPremiumSubscriptions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    BirdId UNIQUEIDENTIFIER NOT NULL,
    OwnerId UNIQUEIDENTIFIER NOT NULL,

    Status NVARCHAR(20) NOT NULL, -- 'active', 'canceled', 'past_due', 'expired'
    Plan NVARCHAR(20) NOT NULL, -- 'monthly', 'yearly', 'lifetime'

    Provider NVARCHAR(20) NOT NULL, -- 'stripe', 'paypal', 'apple', 'google', 'crypto'
    ProviderSubscriptionId NVARCHAR(255) NOT NULL,

    StartedAt DATETIME2 NOT NULL,
    CurrentPeriodEnd DATETIME2 NOT NULL,
    CanceledAt DATETIME2 NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    FOREIGN KEY (BirdId) REFERENCES Birds(Id),
    FOREIGN KEY (OwnerId) REFERENCES Users(Id),

    INDEX IX_BirdPremiumSubscriptions_BirdId (BirdId),
    INDEX IX_BirdPremiumSubscriptions_OwnerId (OwnerId),
    INDEX IX_BirdPremiumSubscriptions_Status (Status)
);
```

### 2. PremiumStyles Table

```sql
CREATE TABLE PremiumStyles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    BirdId UNIQUEIDENTIFIER NOT NULL UNIQUE,

    FrameId NVARCHAR(50) NULL,
    BadgeId NVARCHAR(50) NULL,
    HighlightColor NVARCHAR(7) NULL, -- Hex color
    ThemeId NVARCHAR(50) NULL,
    CoverImageUrl NVARCHAR(500) NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    FOREIGN KEY (BirdId) REFERENCES Birds(Id) ON DELETE CASCADE
);
```

### 3. CharityAllocations Table

```sql
CREATE TABLE CharityAllocations (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SubscriptionId UNIQUEIDENTIFIER NOT NULL,

    CharityName NVARCHAR(255) NOT NULL,
    Percentage DECIMAL(5,2) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    AllocatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    FOREIGN KEY (SubscriptionId) REFERENCES BirdPremiumSubscriptions(Id),

    INDEX IX_CharityAllocations_SubscriptionId (SubscriptionId),
    INDEX IX_CharityAllocations_AllocatedAt (AllocatedAt)
);
```

### 4. CharityImpactStats Table (Aggregated Stats)

```sql
CREATE TABLE CharityImpactStats (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    TotalContributed DECIMAL(12,2) NOT NULL DEFAULT 0,
    BirdsHelped INT NOT NULL DEFAULT 0,
    SheltersSupported INT NOT NULL DEFAULT 0,
    ConservationProjects INT NOT NULL DEFAULT 0,

    LastUpdated DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
```

---

## 📦 Entity Models

### BirdPremiumSubscription.cs

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wihngo.API.Models
{
    public class BirdPremiumSubscription
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid BirdId { get; set; }

        [Required]
        public Guid OwnerId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } // active, canceled, past_due, expired

        [Required]
        [MaxLength(20)]
        public string Plan { get; set; } // monthly, yearly, lifetime

        [Required]
        [MaxLength(20)]
        public string Provider { get; set; } // stripe, paypal, apple, google, crypto

        [Required]
        [MaxLength(255)]
        public string ProviderSubscriptionId { get; set; }

        [Required]
        public DateTime StartedAt { get; set; }

        [Required]
        public DateTime CurrentPeriodEnd { get; set; }

        public DateTime? CanceledAt { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("BirdId")]
        public virtual Bird Bird { get; set; }

        [ForeignKey("OwnerId")]
        public virtual User Owner { get; set; }

        public virtual ICollection<CharityAllocation> CharityAllocations { get; set; }
    }
}
```

### PremiumStyle.cs

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wihngo.API.Models
{
    public class PremiumStyle
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid BirdId { get; set; }

        [MaxLength(50)]
        public string FrameId { get; set; }

        [MaxLength(50)]
        public string BadgeId { get; set; }

        [MaxLength(7)]
        public string HighlightColor { get; set; }

        [MaxLength(50)]
        public string ThemeId { get; set; }

        [MaxLength(500)]
        public string CoverImageUrl { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("BirdId")]
        public virtual Bird Bird { get; set; }
    }
}
```

### CharityAllocation.cs

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wihngo.API.Models
{
    public class CharityAllocation
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid SubscriptionId { get; set; }

        [Required]
        [MaxLength(255)]
        public string CharityName { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal Percentage { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime AllocatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("SubscriptionId")]
        public virtual BirdPremiumSubscription Subscription { get; set; }
    }
}
```

---

## 📡 API Endpoints

### 1. Premium Subscription Controller

**File:** `Controllers/PremiumSubscriptionController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wihngo.API.DTOs;
using Wihngo.API.Services;

namespace Wihngo.API.Controllers
{
    [ApiController]
    [Route("api/premium")]
    [Authorize]
    public class PremiumSubscriptionController : ControllerBase
    {
        private readonly IPremiumSubscriptionService _subscriptionService;
        private readonly ILogger<PremiumSubscriptionController> _logger;

        public PremiumSubscriptionController(
            IPremiumSubscriptionService subscriptionService,
            ILogger<PremiumSubscriptionController> logger)
        {
            _subscriptionService = subscriptionService;
            _logger = logger;
        }

        /// <summary>
        /// Subscribe a bird to premium
        /// POST /api/premium/subscribe
        /// </summary>
        [HttpPost("subscribe")]
        public async Task<ActionResult<SubscriptionResponseDto>> Subscribe(
            [FromBody] SubscribeDto request)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var result = await _subscriptionService.CreateSubscriptionAsync(
                    request, Guid.Parse(userId));

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating premium subscription");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Get premium status for a bird
        /// GET /api/premium/status/{birdId}
        /// </summary>
        [HttpGet("status/{birdId}")]
        [AllowAnonymous]
        public async Task<ActionResult<PremiumStatusResponseDto>> GetStatus(Guid birdId)
        {
            try
            {
                var status = await _subscriptionService.GetPremiumStatusAsync(birdId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting premium status for bird {BirdId}", birdId);
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Cancel a premium subscription
        /// POST /api/premium/cancel/{birdId}
        /// </summary>
        [HttpPost("cancel/{birdId}")]
        public async Task<ActionResult> CancelSubscription(Guid birdId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                await _subscriptionService.CancelSubscriptionAsync(
                    birdId, Guid.Parse(userId));

                return Ok(new { message = "Subscription canceled successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error canceling subscription");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Update premium style for a bird
        /// PUT /api/premium/style/{birdId}
        /// </summary>
        [HttpPut("style/{birdId}")]
        public async Task<ActionResult<PremiumStyleDto>> UpdateStyle(
            Guid birdId,
            [FromBody] UpdatePremiumStyleDto request)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var style = await _subscriptionService.UpdatePremiumStyleAsync(
                    birdId, request, Guid.Parse(userId));

                return Ok(style);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating premium style");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Get premium style for a bird
        /// GET /api/premium/style/{birdId}
        /// </summary>
        [HttpGet("style/{birdId}")]
        [AllowAnonymous]
        public async Task<ActionResult<PremiumStyleDto>> GetStyle(Guid birdId)
        {
            try
            {
                var style = await _subscriptionService.GetPremiumStyleAsync(birdId);
                if (style == null)
                    return NotFound();

                return Ok(style);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting premium style");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Get available premium plans
        /// GET /api/premium/plans
        /// </summary>
        [HttpGet("plans")]
        [AllowAnonymous]
        public ActionResult<IEnumerable<PremiumPlanDto>> GetPlans()
        {
            var plans = new[]
            {
                new PremiumPlanDto
                {
                    Id = "monthly",
                    Name = "Monthly Celebration",
                    Price = 3.99m,
                    Currency = "USD",
                    Interval = "month",
                    Description = "Show your love & support your bird monthly",
                    CharityAllocation = 10,
                    Features = new[]
                    {
                        "Custom profile theme & cover",
                        "Highlighted Best Moments",
                        "'Celebrated Bird' badge",
                        "Unlimited photos & videos",
                        "Memory collages & story albums",
                        "QR code for profile sharing",
                        "Pin up to 5 story highlights",
                        "Donation tracker display"
                    }
                },
                new PremiumPlanDto
                {
                    Id = "yearly",
                    Name = "Yearly Celebration",
                    Price = 39.99m,
                    Currency = "USD",
                    Interval = "year",
                    Savings = "Save $8/year - 2 months free!",
                    Description = "A year of love & celebration for your bird",
                    CharityAllocation = 15,
                    Features = new[]
                    {
                        "All Monthly features included",
                        "Custom profile theme & cover",
                        "Highlighted Best Moments",
                        "'Celebrated Bird' badge",
                        "Unlimited photos & videos",
                        "Memory collages & story albums",
                        "QR code for profile sharing",
                        "Pin up to 5 story highlights",
                        "Donation tracker display",
                        "Priority support"
                    }
                },
                new PremiumPlanDto
                {
                    Id = "lifetime",
                    Name = "Lifetime Celebration",
                    Price = 69.99m,
                    Currency = "USD",
                    Interval = "lifetime",
                    Savings = "One-time payment, celebrate forever!",
                    Description = "Eternal love & premium features for your bird",
                    CharityAllocation = 20,
                    Features = new[]
                    {
                        "All premium features forever",
                        "Custom profile theme & cover",
                        "Highlighted Best Moments",
                        "'Celebrated Bird' badge",
                        "Unlimited photos & videos",
                        "Memory collages & story albums",
                        "QR code for profile sharing",
                        "Pin up to 5 story highlights",
                        "Donation tracker display",
                        "Exclusive lifetime badge",
                        "Support bird charities",
                        "VIP support access"
                    }
                }
            };

            return Ok(plans);
        }
    }
}
```

### 2. Charity Impact Controller

**File:** `Controllers/CharityController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wihngo.API.DTOs;
using Wihngo.API.Services;

namespace Wihngo.API.Controllers
{
    [ApiController]
    [Route("api/charity")]
    public class CharityController : ControllerBase
    {
        private readonly ICharityService _charityService;
        private readonly ILogger<CharityController> _logger;

        public CharityController(
            ICharityService charityService,
            ILogger<CharityController> logger)
        {
            _charityService = charityService;
            _logger = logger;
        }

        /// <summary>
        /// Get charity impact stats for a specific bird
        /// GET /api/charity/impact/{birdId}
        /// </summary>
        [HttpGet("impact/{birdId}")]
        [AllowAnonymous]
        public async Task<ActionResult<CharityImpactDto>> GetBirdImpact(Guid birdId)
        {
            try
            {
                var impact = await _charityService.GetBirdCharityImpactAsync(birdId);
                return Ok(impact);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting charity impact for bird {BirdId}", birdId);
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Get global charity impact stats
        /// GET /api/charity/impact/global
        /// </summary>
        [HttpGet("impact/global")]
        [AllowAnonymous]
        public async Task<ActionResult<GlobalCharityImpactDto>> GetGlobalImpact()
        {
            try
            {
                var impact = await _charityService.GetGlobalCharityImpactAsync();
                return Ok(impact);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting global charity impact");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        /// <summary>
        /// Get list of supported charities
        /// GET /api/charity/partners
        /// </summary>
        [HttpGet("partners")]
        [AllowAnonymous]
        public ActionResult<IEnumerable<CharityPartnerDto>> GetPartners()
        {
            var partners = new[]
            {
                new CharityPartnerDto
                {
                    Name = "Local Bird Shelter Network",
                    Description = "Rescue and rehabilitation services",
                    Website = "https://birdshelternet.org"
                },
                new CharityPartnerDto
                {
                    Name = "Avian Conservation Fund",
                    Description = "Species protection and habitat preservation",
                    Website = "https://avianconservation.org"
                },
                new CharityPartnerDto
                {
                    Name = "Wildlife Rescue Alliance",
                    Description = "Emergency veterinary care for birds",
                    Website = "https://wildliferescue.org"
                }
            };

            return Ok(partners);
        }
    }
}
```

---

## 🔨 Service Layer

### IPremiumSubscriptionService.cs

```csharp
using Wihngo.API.DTOs;

namespace Wihngo.API.Services
{
    public interface IPremiumSubscriptionService
    {
        Task<SubscriptionResponseDto> CreateSubscriptionAsync(
            SubscribeDto request, Guid userId);

        Task<PremiumStatusResponseDto> GetPremiumStatusAsync(Guid birdId);

        Task CancelSubscriptionAsync(Guid birdId, Guid userId);

        Task<PremiumStyleDto> UpdatePremiumStyleAsync(
            Guid birdId, UpdatePremiumStyleDto request, Guid userId);

        Task<PremiumStyleDto> GetPremiumStyleAsync(Guid birdId);

        Task ProcessSubscriptionWebhookAsync(string provider, object payload);
    }
}
```

### PremiumSubscriptionService.cs

```csharp
using Microsoft.EntityFrameworkCore;
using Wihngo.API.Data;
using Wihngo.API.DTOs;
using Wihngo.API.Models;

namespace Wihngo.API.Services
{
    public class PremiumSubscriptionService : IPremiumSubscriptionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IPaymentService _paymentService;
        private readonly ICharityService _charityService;
        private readonly ILogger<PremiumSubscriptionService> _logger;

        public PremiumSubscriptionService(
            ApplicationDbContext context,
            IPaymentService paymentService,
            ICharityService charityService,
            ILogger<PremiumSubscriptionService> logger)
        {
            _context = context;
            _paymentService = paymentService;
            _charityService = charityService;
            _logger = logger;
        }

        public async Task<SubscriptionResponseDto> CreateSubscriptionAsync(
            SubscribeDto request, Guid userId)
        {
            // Verify bird ownership
            var bird = await _context.Birds
                .FirstOrDefaultAsync(b => b.Id == request.BirdId);

            if (bird == null)
                throw new ArgumentException("Bird not found");

            if (bird.OwnerId != userId)
                throw new UnauthorizedAccessException("You don't own this bird");

            // Check for existing active subscription
            var existing = await _context.BirdPremiumSubscriptions
                .FirstOrDefaultAsync(s => s.BirdId == request.BirdId
                    && s.Status == "active");

            if (existing != null)
                throw new ArgumentException("Bird already has an active subscription");

            // Process payment with provider
            var paymentResult = await _paymentService.ProcessPaymentAsync(request);

            // Calculate period end
            var startDate = DateTime.UtcNow;
            var periodEnd = request.Plan switch
            {
                "monthly" => startDate.AddMonths(1),
                "yearly" => startDate.AddYears(1),
                "lifetime" => startDate.AddYears(100), // Effectively never expires
                _ => throw new ArgumentException("Invalid plan")
            };

            // Create subscription
            var subscription = new BirdPremiumSubscription
            {
                Id = Guid.NewGuid(),
                BirdId = request.BirdId,
                OwnerId = userId,
                Status = "active",
                Plan = request.Plan,
                Provider = request.Provider,
                ProviderSubscriptionId = paymentResult.SubscriptionId,
                StartedAt = startDate,
                CurrentPeriodEnd = periodEnd,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.BirdPremiumSubscriptions.Add(subscription);

            // Update bird premium status
            bird.IsPremium = true;
            bird.UpdatedAt = DateTime.UtcNow;

            // Calculate and record charity allocation
            var price = GetPlanPrice(request.Plan);
            var charityPercentage = GetCharityPercentage(request.Plan);
            var charityAmount = price * (charityPercentage / 100m);

            await _charityService.RecordCharityAllocationAsync(
                subscription.Id, charityAmount, charityPercentage);

            await _context.SaveChangesAsync();

            return new SubscriptionResponseDto
            {
                SubscriptionId = subscription.Id,
                Status = subscription.Status,
                Plan = subscription.Plan,
                CurrentPeriodEnd = subscription.CurrentPeriodEnd,
                Message = "Premium subscription activated successfully!"
            };
        }

        public async Task<PremiumStatusResponseDto> GetPremiumStatusAsync(Guid birdId)
        {
            var subscription = await _context.BirdPremiumSubscriptions
                .Where(s => s.BirdId == birdId && s.Status == "active")
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            return new PremiumStatusResponseDto
            {
                IsPremium = subscription != null,
                Subscription = subscription != null ? MapToDto(subscription) : null
            };
        }

        public async Task CancelSubscriptionAsync(Guid birdId, Guid userId)
        {
            var subscription = await _context.BirdPremiumSubscriptions
                .Include(s => s.Bird)
                .FirstOrDefaultAsync(s => s.BirdId == birdId && s.Status == "active");

            if (subscription == null)
                throw new ArgumentException("No active subscription found");

            if (subscription.OwnerId != userId)
                throw new UnauthorizedAccessException("You don't own this subscription");

            // Cancel with payment provider
            if (subscription.Plan != "lifetime")
            {
                await _paymentService.CancelSubscriptionAsync(
                    subscription.Provider, subscription.ProviderSubscriptionId);
            }

            // Update subscription
            subscription.Status = "canceled";
            subscription.CanceledAt = DateTime.UtcNow;
            subscription.UpdatedAt = DateTime.UtcNow;

            // Update bird
            subscription.Bird.IsPremium = false;
            subscription.Bird.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<PremiumStyleDto> UpdatePremiumStyleAsync(
            Guid birdId, UpdatePremiumStyleDto request, Guid userId)
        {
            // Verify ownership and premium status
            var bird = await _context.Birds
                .FirstOrDefaultAsync(b => b.Id == birdId);

            if (bird == null)
                throw new ArgumentException("Bird not found");

            if (bird.OwnerId != userId)
                throw new UnauthorizedAccessException("You don't own this bird");

            if (!bird.IsPremium)
                throw new ArgumentException("Bird does not have premium");

            // Get or create style
            var style = await _context.PremiumStyles
                .FirstOrDefaultAsync(s => s.BirdId == birdId);

            if (style == null)
            {
                style = new PremiumStyle
                {
                    Id = Guid.NewGuid(),
                    BirdId = birdId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.PremiumStyles.Add(style);
            }

            // Update properties
            if (request.FrameId != null) style.FrameId = request.FrameId;
            if (request.BadgeId != null) style.BadgeId = request.BadgeId;
            if (request.HighlightColor != null) style.HighlightColor = request.HighlightColor;
            if (request.ThemeId != null) style.ThemeId = request.ThemeId;
            if (request.CoverImageUrl != null) style.CoverImageUrl = request.CoverImageUrl;

            style.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapStyleToDto(style);
        }

        public async Task<PremiumStyleDto> GetPremiumStyleAsync(Guid birdId)
        {
            var style = await _context.PremiumStyles
                .FirstOrDefaultAsync(s => s.BirdId == birdId);

            return style != null ? MapStyleToDto(style) : null;
        }

        // Helper methods
        private decimal GetPlanPrice(string plan) => plan switch
        {
            "monthly" => 3.99m,
            "yearly" => 39.99m,
            "lifetime" => 69.99m,
            _ => 0
        };

        private decimal GetCharityPercentage(string plan) => plan switch
        {
            "monthly" => 10,
            "yearly" => 15,
            "lifetime" => 20,
            _ => 0
        };

        private BirdPremiumSubscriptionDto MapToDto(BirdPremiumSubscription sub) =>
            new BirdPremiumSubscriptionDto
            {
                Id = sub.Id,
                BirdId = sub.BirdId,
                OwnerId = sub.OwnerId,
                Status = sub.Status,
                Plan = sub.Plan,
                Provider = sub.Provider,
                ProviderSubscriptionId = sub.ProviderSubscriptionId,
                StartedAt = sub.StartedAt,
                CurrentPeriodEnd = sub.CurrentPeriodEnd,
                CanceledAt = sub.CanceledAt,
                CreatedAt = sub.CreatedAt,
                UpdatedAt = sub.UpdatedAt
            };

        private PremiumStyleDto MapStyleToDto(PremiumStyle style) =>
            new PremiumStyleDto
            {
                FrameId = style.FrameId,
                BadgeId = style.BadgeId,
                HighlightColor = style.HighlightColor,
                ThemeId = style.ThemeId,
                CoverImageUrl = style.CoverImageUrl
            };
    }
}
```

---

## 📨 DTOs

### SubscribeDto.cs

```csharp
using System.ComponentModel.DataAnnotations;

namespace Wihngo.API.DTOs
{
    public class SubscribeDto
    {
        [Required]
        public Guid BirdId { get; set; }

        public string PaymentMethodId { get; set; }

        [Required]
        public string Provider { get; set; } // stripe, paypal, apple, google, crypto

        [Required]
        public string Plan { get; set; } // monthly, yearly, lifetime

        public string CryptoCurrency { get; set; }
        public string CryptoNetwork { get; set; }
    }

    public class SubscriptionResponseDto
    {
        public Guid SubscriptionId { get; set; }
        public string Status { get; set; }
        public string Plan { get; set; }
        public DateTime CurrentPeriodEnd { get; set; }
        public string Message { get; set; }
    }

    public class PremiumStatusResponseDto
    {
        public bool IsPremium { get; set; }
        public BirdPremiumSubscriptionDto Subscription { get; set; }
    }

    public class BirdPremiumSubscriptionDto
    {
        public Guid Id { get; set; }
        public Guid BirdId { get; set; }
        public Guid OwnerId { get; set; }
        public string Status { get; set; }
        public string Plan { get; set; }
        public string Provider { get; set; }
        public string ProviderSubscriptionId { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime CurrentPeriodEnd { get; set; }
        public DateTime? CanceledAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
```

### PremiumStyleDto.cs

```csharp
namespace Wihngo.API.DTOs
{
    public class UpdatePremiumStyleDto
    {
        public string FrameId { get; set; }
        public string BadgeId { get; set; }
        public string HighlightColor { get; set; }
        public string ThemeId { get; set; }
        public string CoverImageUrl { get; set; }
    }

    public class PremiumStyleDto
    {
        public string FrameId { get; set; }
        public string BadgeId { get; set; }
        public string HighlightColor { get; set; }
        public string ThemeId { get; set; }
        public string CoverImageUrl { get; set; }
    }
}
```

### PremiumPlanDto.cs

```csharp
namespace Wihngo.API.DTOs
{
    public class PremiumPlanDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public string Interval { get; set; }
        public string Savings { get; set; }
        public string Description { get; set; }
        public int CharityAllocation { get; set; }
        public string[] Features { get; set; }
    }
}
```

### CharityDto.cs

```csharp
namespace Wihngo.API.DTOs
{
    public class CharityImpactDto
    {
        public decimal TotalContributed { get; set; }
        public int BirdsHelped { get; set; }
        public int SheltersSupported { get; set; }
        public int ConservationProjects { get; set; }
    }

    public class GlobalCharityImpactDto
    {
        public decimal TotalContributed { get; set; }
        public int TotalSubscribers { get; set; }
        public int BirdsHelped { get; set; }
        public int SheltersSupported { get; set; }
        public int ConservationProjects { get; set; }
    }

    public class CharityPartnerDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Website { get; set; }
    }
}
```

---

## ⚙️ Configuration

### appsettings.json

```json
{
  "PaymentProviders": {
    "PayPal": {
      "SupportPaymentUrl": "https://www.paypal.com/ncp/payment/JGD55LPGBHWQW",
      "ClientId": "YOUR_PAYPAL_CLIENT_ID",
      "ClientSecret": "YOUR_PAYPAL_CLIENT_SECRET",
      "Mode": "sandbox"
    },
    "Stripe": {
      "PublishableKey": "YOUR_STRIPE_PUBLISHABLE_KEY",
      "SecretKey": "YOUR_STRIPE_SECRET_KEY"
    }
  },
  "PremiumPlans": {
    "Monthly": {
      "Price": 3.99,
      "CharityPercentage": 10
    },
    "Yearly": {
      "Price": 39.99,
      "CharityPercentage": 15
    },
    "Lifetime": {
      "Price": 69.99,
      "CharityPercentage": 20
    }
  },
  "CharityPartners": [
    {
      "Name": "Local Bird Shelter Network",
      "AllocationKey": "shelter"
    },
    {
      "Name": "Avian Conservation Fund",
      "AllocationKey": "conservation"
    },
    {
      "Name": "Wildlife Rescue Alliance",
      "AllocationKey": "rescue"
    }
  ]
}
```

---

## 🔄 Background Jobs

### CharityAllocationJob.cs

```csharp
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Wihngo.API.Data;
using Wihngo.API.Models;

namespace Wihngo.API.Jobs
{
    public class CharityAllocationJob
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CharityAllocationJob> _logger;

        public CharityAllocationJob(
            ApplicationDbContext context,
            ILogger<CharityAllocationJob> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Process charity allocations for active subscriptions
        /// Runs monthly
        /// </summary>
        [AutomaticRetry(Attempts = 3)]
        public async Task ProcessMonthlyAllocationsAsync()
        {
            var activeSubscriptions = await _context.BirdPremiumSubscriptions
                .Where(s => s.Status == "active" && s.Plan != "lifetime")
                .ToListAsync();

            foreach (var subscription in activeSubscriptions)
            {
                try
                {
                    var price = GetPlanPrice(subscription.Plan);
                    var percentage = GetCharityPercentage(subscription.Plan);
                    var amount = price * (percentage / 100m);

                    var allocation = new CharityAllocation
                    {
                        Id = Guid.NewGuid(),
                        SubscriptionId = subscription.Id,
                        CharityName = "Local Bird Shelter Network",
                        Percentage = percentage,
                        Amount = amount,
                        AllocatedAt = DateTime.UtcNow
                    };

                    _context.CharityAllocations.Add(allocation);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Error allocating charity for subscription {Id}",
                        subscription.Id);
                }
            }

            await _context.SaveChangesAsync();
        }

        private decimal GetPlanPrice(string plan) => plan switch
        {
            "monthly" => 3.99m,
            "yearly" => 39.99m,
            _ => 0
        };

        private decimal GetCharityPercentage(string plan) => plan switch
        {
            "monthly" => 10,
            "yearly" => 15,
            "lifetime" => 20,
            _ => 0
        };
    }
}
```

---

## 🧪 Testing

### Example Integration Tests

```csharp
using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using Wihngo.API.DTOs;

namespace Wihngo.API.Tests
{
    public class PremiumSubscriptionTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public PremiumSubscriptionTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Subscribe_ValidRequest_ReturnsSuccess()
        {
            // Arrange
            var client = _factory.CreateClient();
            var request = new SubscribeDto
            {
                BirdId = Guid.NewGuid(),
                Plan = "monthly",
                Provider = "paypal",
                PaymentMethodId = "pm_test"
            };

            // Act
            var response = await client.PostAsJsonAsync("/api/premium/subscribe", request);

            // Assert
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<SubscriptionResponseDto>();
            Assert.Equal("active", result.Status);
        }

        [Fact]
        public async Task GetPremiumStatus_BirdWithPremium_ReturnsPremiumTrue()
        {
            // Arrange
            var client = _factory.CreateClient();
            var birdId = Guid.NewGuid();

            // Act
            var response = await client.GetAsync($"/api/premium/status/{birdId}");

            // Assert
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<PremiumStatusResponseDto>();
            Assert.NotNull(result);
        }
    }
}
```

---

## 📝 Implementation Checklist

- [ ] Create database tables (BirdPremiumSubscriptions, PremiumStyles, CharityAllocations)
- [ ] Create entity models
- [ ] Implement PremiumSubscriptionService
- [ ] Implement CharityService
- [ ] Create PremiumSubscriptionController
- [ ] Create CharityController
- [ ] Add DTOs for all requests/responses
- [ ] Integrate with payment providers (Stripe, PayPal, crypto)
- [ ] Set up background jobs for charity allocation
- [ ] Add authorization checks (bird ownership)
- [ ] Implement webhook handlers for payment providers
- [ ] Add logging and error handling
- [ ] Write integration tests
- [ ] Update Bird model to include IsPremium flag
- [ ] Document API endpoints (Swagger)
- [ ] Deploy and test in staging environment

---

## 🚀 Quick Start Commands

### Migration

```bash
dotnet ef migrations add AddPremiumSubscriptions
dotnet ef database update
```

### Run Background Job

```bash
RecurringJob.AddOrUpdate<CharityAllocationJob>(
    "process-charity-allocations",
    job => job.ProcessMonthlyAllocationsAsync(),
    Cron.Monthly);
```

---

## 📚 Additional Resources

- Stripe .NET SDK: https://stripe.com/docs/api?lang=dotnet
- PayPal .NET SDK: https://developer.paypal.com/docs/api/overview/
- PayPal Bird Support Payment Link: https://www.paypal.com/ncp/payment/JGD55LPGBHWQW
- EF Core Documentation: https://docs.microsoft.com/ef/core/
- ASP.NET Core Web API: https://docs.microsoft.com/aspnet/core/web-api/
- Hangfire for background jobs: https://www.hangfire.io/

---

**Implementation Status:** Ready for Development  
**Estimated Time:** 3-5 days for full implementation with testing
