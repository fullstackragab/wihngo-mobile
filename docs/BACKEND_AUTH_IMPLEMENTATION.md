# Authentication System Implementation Guide

## For Backend ASP.NET Web API Team

This document provides comprehensive instructions for implementing the authentication system on the backend to match the frontend's expectations.

---

## 📋 Overview

The frontend implements a JWT-based authentication system with:

- Token-based authentication with 24-hour expiry
- Automatic session validation
- Centralized error handling
- Secure token storage

---

## 🔐 Required Authentication Endpoints

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Success Response (200 OK):**

```json
{
  "token": "JWT_TOKEN_STRING",
  "userId": "GUID_OR_STRING",
  "name": "string",
  "email": "string"
}
```

**Error Responses:**

- `409 Conflict` - Email already registered
- `400 Bad Request` - Validation errors

**Implementation Notes:**

- Validate email format and uniqueness
- Hash password using BCrypt or PBKDF2 (minimum 10 rounds)
- Generate JWT token with 24-hour expiry
- Return user data with token immediately (auto-login)

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200 OK):**

```json
{
  "token": "JWT_TOKEN_STRING",
  "userId": "GUID_OR_STRING",
  "name": "string",
  "email": "string"
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing fields

**Implementation Notes:**

- Verify email and password
- Generate new JWT token on each login
- Include user claims in token

---

## 🎫 JWT Token Implementation

### Token Structure

The JWT should include these claims:

```csharp
var claims = new[]
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim(ClaimTypes.Name, user.Name),
    new Claim(ClaimTypes.Email, user.Email),
    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
    new Claim(JwtRegisteredClaimNames.Iat, DateTime.UtcNow.ToString())
};
```

### Token Configuration

```csharp
// appsettings.json
{
  "Jwt": {
    "Key": "YOUR_SECRET_KEY_MIN_32_CHARACTERS",
    "Issuer": "wihngo-api",
    "Audience": "wihngo-app",
    "ExpiryHours": 24
  }
}

// Startup.cs or Program.cs
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = Configuration["Jwt:Issuer"],
            ValidAudience = Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(Configuration["Jwt:Key"])
            ),
            ClockSkew = TimeSpan.Zero // No grace period
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers.Add("Token-Expired", "true");
                }
                return Task.CompletedTask;
            }
        };
    });
```

### Token Generation Helper

```csharp
public class TokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])
        );
        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

---

## 🔒 Protected Endpoints

All endpoints (except auth) must require authentication:

```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BirdsController : ControllerBase
{
    // Get current user ID from token
    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    [HttpGet]
    public async Task<IActionResult> GetBirds()
    {
        var userId = GetCurrentUserId();
        // Use userId for authorization checks
        return Ok(birds);
    }
}
```

---

## ⚠️ Error Handling

### 401 Unauthorized Responses

When token is invalid or expired, return:

```csharp
[HttpGet]
public IActionResult ProtectedEndpoint()
{
    if (!User.Identity.IsAuthenticated)
    {
        return Unauthorized(new
        {
            message = "Authentication required",
            code = "UNAUTHORIZED"
        });
    }
    // ... endpoint logic
}
```

**Important:** Frontend automatically handles 401 responses by:

1. Triggering logout
2. Clearing local storage
3. Redirecting to login screen

### 403 Forbidden Responses

For authorization failures (authenticated but not permitted):

```csharp
return Forbid(); // Or StatusCode(403)
```

---

## 🌐 CORS Configuration

Must allow requests from frontend:

```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder
            .WithOrigins(
                "http://localhost:8081",  // Expo dev
                "exp://localhost:8081",   // Expo custom scheme
                "https://your-production-domain.com"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

---

## 📝 Complete Auth Controller Example

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly TokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        TokenService tokenService,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            // Check if email exists
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return Conflict(new { message = "Email already registered" });
            }

            // Create user
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                Name = dto.Name
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Registration failed",
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            // Generate token
            var token = _tokenService.GenerateToken(user);

            _logger.LogInformation("User registered: {Email}", dto.Email);

            return Ok(new
            {
                token,
                userId = user.Id,
                name = user.Name,
                email = user.Email
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration error");
            return StatusCode(500, new { message = "Registration failed" });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(
                user,
                dto.Password,
                lockoutOnFailure: false
            );

            if (!result.Succeeded)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Generate token
            var token = _tokenService.GenerateToken(user);

            _logger.LogInformation("User logged in: {Email}", dto.Email);

            return Ok(new
            {
                token,
                userId = user.Id,
                name = user.Name,
                email = user.Email
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error");
            return StatusCode(500, new { message = "Login failed" });
        }
    }

    [HttpGet("validate")]
    [Authorize]
    public IActionResult ValidateToken()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email);
        var name = User.FindFirstValue(ClaimTypes.Name);

        return Ok(new
        {
            valid = true,
            userId,
            email,
            name
        });
    }
}

// DTOs
public class RegisterDto
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
}

public class LoginDto
{
    public string Email { get; set; }
    public string Password { get; set; }
}
```

---

## 🔍 Testing Authentication

### Test Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Test Protected Endpoint

```bash
curl -X GET http://localhost:5000/api/birds \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🛡️ Security Best Practices

1. **Password Requirements:**

   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

2. **Token Security:**

   - Use HTTPS in production
   - Set secure, random JWT secret (min 32 chars)
   - Don't store sensitive data in token
   - Implement token rotation for refresh

3. **Rate Limiting:**

   ```csharp
   [HttpPost("login")]
   [RateLimit(Name = "Login", Seconds = 60, Limit = 5)]
   public async Task<IActionResult> Login([FromBody] LoginDto dto)
   ```

4. **Account Lockout:**
   ```csharp
   var result = await _signInManager.CheckPasswordSignInAsync(
       user,
       dto.Password,
       lockoutOnFailure: true // Enable lockout after failed attempts
   );
   ```

---

## 📊 Database Schema

```sql
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsActive BIT NOT NULL DEFAULT 1,
    INDEX IX_Users_Email (Email)
);
```

---

## 🚀 Deployment Checklist

- [ ] Set strong JWT secret in production config
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up rate limiting
- [ ] Enable account lockout
- [ ] Implement logging for auth events
- [ ] Set up monitoring for failed login attempts
- [ ] Configure token expiry (24 hours)
- [ ] Test all auth flows
- [ ] Document API endpoints

---

## 📞 Frontend Integration Points

The frontend expects:

1. Tokens with 24-hour validity
2. Consistent error codes (401 for auth, 403 for authorization)
3. User data returned with token on login/register
4. Standard Bearer token authentication
5. Automatic token validation on protected routes

---

## 🐛 Troubleshooting

### Token Not Working

- Check token expiry
- Verify JWT secret matches
- Ensure ClockSkew is set to Zero
- Check CORS configuration

### 401 Errors

- Verify Authorization header format: `Bearer <token>`
- Check token hasn't expired
- Ensure endpoint has [Authorize] attribute

### CORS Issues

- Add frontend origin to allowed origins
- Use AllowCredentials if needed
- Check preflight requests succeed

---

For questions or issues, contact the frontend team.
