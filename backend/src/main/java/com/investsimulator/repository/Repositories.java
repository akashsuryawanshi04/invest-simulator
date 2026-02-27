package com.investsimulator.repository;

import com.investsimulator.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

// ============================================================
// UserRepository
// ============================================================
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findAllByIsActiveTrue();

    @Query("SELECT u FROM User u WHERE u.role = :role ORDER BY u.createdAt DESC")
    List<User> findAllByRole(@Param("role") User.Role role);
}

// ============================================================
// AssetRepository
// ============================================================
public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findAllByIsActiveTrue();

    List<Asset> findByTypeAndIsActiveTrue(Asset.AssetType type);

    Optional<Asset> findBySymbol(String symbol);

    @Query("SELECT a FROM Asset a WHERE a.isActive = true AND " +
           "(LOWER(a.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           " LOWER(a.symbol) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Asset> searchAssets(@Param("q") String query);

    @Query("SELECT a FROM Asset a WHERE a.isActive = true ORDER BY ABS(a.priceChangePct) DESC")
    List<Asset> findTopMovers(Pageable pageable);
}

// ============================================================
// HoldingRepository
// ============================================================
public interface HoldingRepository extends JpaRepository<Holding, Long> {

    List<Holding> findAllByUserId(Long userId);

    Optional<Holding> findByUserIdAndAssetId(Long userId, Long assetId);

    boolean existsByUserIdAndAssetId(Long userId, Long assetId);

    @Query("SELECT COUNT(h) FROM Holding h WHERE h.user.id = :userId AND h.quantity > 0")
    long countActivePositions(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Holding h WHERE h.user.id = :userId AND h.asset.id = :assetId")
    void deleteByUserIdAndAssetId(@Param("userId") Long userId, @Param("assetId") Long assetId);
}

// ============================================================
// TransactionRepository
// ============================================================
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findAllByUserIdOrderByExecutedAtDesc(Long userId, Pageable pageable);

    List<Transaction> findTop10ByUserIdOrderByExecutedAtDesc(Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.asset.id = :assetId " +
           "ORDER BY t.executedAt DESC")
    List<Transaction> findByUserIdAndAssetId(@Param("userId") Long userId,
                                              @Param("assetId") Long assetId);

    @Query("SELECT COALESCE(SUM(t.realizedPnl), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = 'SELL'")
    java.math.BigDecimal getTotalRealizedPnl(@Param("userId") Long userId);

    long countByUserId(Long userId);
}

// ============================================================
// WatchlistRepository
// ============================================================
public interface WatchlistRepository extends JpaRepository<WatchlistItem, Long> {

    List<WatchlistItem> findAllByUserIdOrderByAddedAtDesc(Long userId);

    Optional<WatchlistItem> findByUserIdAndAssetId(Long userId, Long assetId);

    boolean existsByUserIdAndAssetId(Long userId, Long assetId);

    void deleteByUserIdAndAssetId(Long userId, Long assetId);
}

// ============================================================
// PortfolioRepository
// ============================================================
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    Optional<Portfolio> findByUserId(Long userId);
}
