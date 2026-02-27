package com.investsimulator.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets", indexes = {
    @Index(name = "idx_symbol",  columnList = "symbol"),
    @Index(name = "idx_type",    columnList = "type"),
    @Index(name = "idx_active",  columnList = "is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String symbol;  // e.g. NSE:RELIANCE or BINANCE:BTCUSDT

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AssetType type;

    @Column(length = 80)
    private String sector;

    @Column(name = "base_price", nullable = false, precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal basePrice = BigDecimal.ZERO;

    @Column(name = "current_price", nullable = false, precision = 18, scale = 6)
    @Builder.Default
    private BigDecimal currentPrice = BigDecimal.ZERO;

    @Column(name = "price_change_pct", precision = 8, scale = 4)
    @Builder.Default
    private BigDecimal priceChangePct = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
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

    public enum AssetType {
        STOCK, CRYPTO
    }
}
