package com.investsimulator.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

// ============================================================
// Authentication DTOs
// ============================================================

public record SignupRequest(
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String fullName,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    String password,

    @NotNull(message = "Initial capital is required")
    @Positive(message = "Capital must be positive")
    @Max(value = 100000000, message = "Capital cannot exceed ₹10 Crore")
    BigDecimal initialCapital
) {}

public record LoginRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    String password
) {}

public record AuthResponse(
    String token,
    String email,
    String fullName,
    String role,
    BigDecimal virtualBalance
) {}

// ============================================================
// Trading DTOs
// ============================================================

public record TradeRequest(
    @NotNull(message = "Asset ID is required")
    Long assetId,

    @NotBlank(message = "Trade type is required")
    @Pattern(regexp = "BUY|SELL", message = "Trade type must be BUY or SELL")
    String tradeType,

    @NotBlank(message = "Order type is required")
    @Pattern(regexp = "MARKET|LIMIT", message = "Order type must be MARKET or LIMIT")
    String orderType,

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    @DecimalMax(value = "1000000", message = "Quantity too large")
    BigDecimal quantity,

    // Optional: only for LIMIT orders
    BigDecimal limitPrice
) {}

public record TradeResponse(
    boolean success,
    String message,
    BigDecimal newBalance,
    TransactionDTO transaction
) {}

// ============================================================
// Market DTOs
// ============================================================

public record AssetDTO(
    Long id,
    String symbol,
    String name,
    String type,
    String sector,
    BigDecimal currentPrice,
    BigDecimal priceChangePct
) {}

public record PriceUpdateDTO(
    Long assetId,
    String symbol,
    BigDecimal price,
    BigDecimal changePercent,
    long timestamp
) {}

// ============================================================
// Portfolio DTOs
// ============================================================

public record PortfolioResponse(
    BigDecimal cashBalance,
    BigDecimal portfolioValue,
    BigDecimal totalCost,
    BigDecimal unrealizedPnl,
    BigDecimal unrealizedPnlPct,
    BigDecimal realizedPnl,
    int totalPositions,
    int winningPositions,
    List<HoldingDTO> holdings
) {}

public record HoldingDTO(
    Long assetId,
    String symbol,
    String name,
    String type,
    String sector,
    BigDecimal quantity,
    BigDecimal avgBuyPrice,
    BigDecimal currentPrice,
    BigDecimal currentValue,
    BigDecimal costBasis,
    BigDecimal unrealizedPnl,
    BigDecimal pnlPct
) {}

public record TransactionDTO(
    Long id,
    Long assetId,
    String assetSymbol,
    String assetName,
    String assetType,
    String type,
    String orderType,
    BigDecimal quantity,
    BigDecimal pricePerUnit,
    BigDecimal totalAmount,
    BigDecimal realizedPnl,
    String executedAt
) {}

// ============================================================
// Admin DTOs
// ============================================================

public record UserSummaryDTO(
    Long id,
    String fullName,
    String email,
    String role,
    BigDecimal virtualBalance,
    BigDecimal initialCapital,
    Boolean isActive,
    String createdAt,
    String lastLogin
) {}

public record ApiResponse<T>(
    boolean success,
    String message,
    T data
) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "Success", data);
    }
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
