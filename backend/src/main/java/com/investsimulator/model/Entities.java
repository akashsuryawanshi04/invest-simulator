package com.investsimulator.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// ============================================================
// Holding.java — User position in an asset
// ============================================================
@Entity
@Table(name = "holdings",
    uniqueConstraints = @UniqueConstraint(name = "uq_user_asset", columnNames = {"user_id", "asset_id"}),
    indexes = {
        @Index(name = "idx_holdings_user", columnList = "user_id"),
        @Index(name = "idx_holdings_asset", columnList = "asset_id")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class Holding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(nullable = false, precision = 18, scale = 8)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "avg_buy_price", nullable = false, precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal avgBuyPrice = BigDecimal.ZERO;

    @Column(name = "total_invested", nullable = false, precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal totalInvested = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


// ============================================================
// Transaction.java — Trade ledger entry
// ============================================================
@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_tx_user",       columnList = "user_id"),
    @Index(name = "idx_tx_asset",      columnList = "asset_id"),
    @Index(name = "idx_tx_type",       columnList = "type"),
    @Index(name = "idx_tx_date",       columnList = "executed_at"),
    @Index(name = "idx_tx_user_asset", columnList = "user_id, asset_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 4)
    private TradeType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 6)
    @Builder.Default
    private OrderType orderType = OrderType.MARKET;

    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal quantity;

    @Column(name = "price_per_unit", nullable = false, precision = 18, scale = 6)
    private BigDecimal pricePerUnit;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 4)
    private BigDecimal totalAmount;

    // Only populated for SELL transactions
    @Column(name = "realized_pnl", precision = 18, scale = 4)
    private BigDecimal realizedPnl;

    // Snapshot of avg buy price at time of sell
    @Column(name = "avg_buy_price_snapshot", precision = 18, scale = 6)
    private BigDecimal avgBuyPriceSnapshot;

    @Column(name = "executed_at", nullable = false, updatable = false)
    private LocalDateTime executedAt;

    @PrePersist
    void prePersist() {
        executedAt = LocalDateTime.now();
    }

    public enum TradeType  { BUY, SELL }
    public enum OrderType  { MARKET, LIMIT }
}


// ============================================================
// Portfolio.java — Aggregated portfolio stats per user
// ============================================================
@Entity
@Table(name = "portfolios", indexes = {
    @Index(name = "idx_portfolio_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "total_invested", nullable = false, precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal totalInvested = BigDecimal.ZERO;

    @Column(name = "total_current_value", nullable = false, precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal totalCurrentValue = BigDecimal.ZERO;

    @Column(name = "realized_pnl", nullable = false, precision = 18, scale = 4)
    @Builder.Default
    private BigDecimal realizedPnl = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


// ============================================================
// WatchlistItem.java — User's saved assets
// ============================================================
@Entity
@Table(name = "watchlist",
    uniqueConstraints = @UniqueConstraint(name = "uq_watchlist_user_asset", columnNames = {"user_id", "asset_id"}),
    indexes = @Index(name = "idx_watchlist_user", columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class WatchlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(name = "added_at", nullable = false)
    @Builder.Default
    private LocalDateTime addedAt = LocalDateTime.now();
}
