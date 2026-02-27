package com.investsimulator.service;

import com.investsimulator.dto.*;
import com.investsimulator.exception.*;
import com.investsimulator.model.*;
import com.investsimulator.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Core trading engine — handles buy and sell orders atomically.
 * All operations are ACID-compliant via @Transactional.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TradingService {

    private final UserRepository       userRepo;
    private final AssetRepository      assetRepo;
    private final HoldingRepository    holdingRepo;
    private final TransactionRepository txRepo;
    private final PortfolioRepository  portfolioRepo;

    @Transactional
    public TradeResponse executeTrade(Long userId, TradeRequest req) {
        User  user  = userRepo.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Asset asset = assetRepo.findById(req.assetId())
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + req.assetId()));

        if (!asset.getIsActive()) {
            throw new BusinessException("Asset is not available for trading: " + asset.getSymbol());
        }

        BigDecimal price = asset.getCurrentPrice();
        BigDecimal total = price.multiply(req.quantity()).setScale(4, RoundingMode.HALF_UP);

        return switch (req.tradeType().toUpperCase()) {
            case "BUY"  -> executeBuy(user, asset, req.quantity(), price, total, req.orderType());
            case "SELL" -> executeSell(user, asset, req.quantity(), price, total, req.orderType());
            default     -> throw new BusinessException("Invalid trade type: " + req.tradeType());
        };
    }

    // ---- BUY ----------------------------------------------------------------

    private TradeResponse executeBuy(User user, Asset asset, BigDecimal qty,
                                      BigDecimal price, BigDecimal total, String orderType) {
        // Balance check
        if (user.getVirtualBalance().compareTo(total) < 0) {
            return new TradeResponse(false,
                String.format("Insufficient balance. Need ₹%.2f but have ₹%.2f",
                    total, user.getVirtualBalance()),
                user.getVirtualBalance(), null);
        }

        // Deduct balance
        user.setVirtualBalance(user.getVirtualBalance().subtract(total));
        userRepo.save(user);

        // Upsert holding with weighted avg price
        Holding holding = holdingRepo.findByUserIdAndAssetId(user.getId(), asset.getId())
            .orElse(Holding.builder()
                .user(user).asset(asset)
                .quantity(BigDecimal.ZERO)
                .avgBuyPrice(BigDecimal.ZERO)
                .totalInvested(BigDecimal.ZERO)
                .build());

        BigDecimal newQty = holding.getQuantity().add(qty);
        BigDecimal newAvg = holding.getQuantity().compareTo(BigDecimal.ZERO) == 0
            ? price
            : (holding.getQuantity().multiply(holding.getAvgBuyPrice())
                .add(qty.multiply(price)))
                .divide(newQty, 6, RoundingMode.HALF_UP);

        holding.setQuantity(newQty);
        holding.setAvgBuyPrice(newAvg);
        holding.setTotalInvested(holding.getTotalInvested().add(total));
        holdingRepo.save(holding);

        // Record transaction
        Transaction tx = Transaction.builder()
            .user(user).asset(asset)
            .type(Transaction.TradeType.BUY)
            .orderType(Transaction.OrderType.valueOf(orderType.toUpperCase()))
            .quantity(qty).pricePerUnit(price).totalAmount(total)
            .build();
        txRepo.save(tx);

        log.info("BUY executed: user={} asset={} qty={} price={} total={}",
            user.getEmail(), asset.getSymbol(), qty, price, total);

        return new TradeResponse(true,
            String.format("Bought %.4f %s @ ₹%.2f", qty, asset.getName(), price),
            user.getVirtualBalance(), mapTx(tx));
    }

    // ---- SELL ---------------------------------------------------------------

    private TradeResponse executeSell(User user, Asset asset, BigDecimal qty,
                                       BigDecimal price, BigDecimal total, String orderType) {
        Holding holding = holdingRepo.findByUserIdAndAssetId(user.getId(), asset.getId())
            .orElseThrow(() -> new BusinessException("You don't hold any " + asset.getName()));

        if (holding.getQuantity().compareTo(qty) < 0) {
            return new TradeResponse(false,
                String.format("Insufficient holdings. Have %.4f but trying to sell %.4f",
                    holding.getQuantity(), qty),
                user.getVirtualBalance(), null);
        }

        // Realized P&L
        BigDecimal realizedPnl = price.subtract(holding.getAvgBuyPrice())
            .multiply(qty)
            .setScale(4, RoundingMode.HALF_UP);

        BigDecimal avgSnapshot = holding.getAvgBuyPrice();

        // Credit balance
        user.setVirtualBalance(user.getVirtualBalance().add(total));
        userRepo.save(user);

        // Update or remove holding
        BigDecimal newQty = holding.getQuantity().subtract(qty);
        if (newQty.compareTo(new BigDecimal("0.00000001")) <= 0) {
            holdingRepo.delete(holding);
        } else {
            BigDecimal costReduced = holding.getAvgBuyPrice().multiply(qty);
            holding.setQuantity(newQty);
            holding.setTotalInvested(
                holding.getTotalInvested().subtract(costReduced).max(BigDecimal.ZERO));
            holdingRepo.save(holding);
        }

        // Record transaction
        Transaction tx = Transaction.builder()
            .user(user).asset(asset)
            .type(Transaction.TradeType.SELL)
            .orderType(Transaction.OrderType.valueOf(orderType.toUpperCase()))
            .quantity(qty).pricePerUnit(price).totalAmount(total)
            .realizedPnl(realizedPnl).avgBuyPriceSnapshot(avgSnapshot)
            .build();
        txRepo.save(tx);

        // Update portfolio realized P&L
        portfolioRepo.findByUserId(user.getId()).ifPresent(p -> {
            p.setRealizedPnl(p.getRealizedPnl().add(realizedPnl));
            portfolioRepo.save(p);
        });

        log.info("SELL executed: user={} asset={} qty={} price={} pnl={}",
            user.getEmail(), asset.getSymbol(), qty, price, realizedPnl);

        return new TradeResponse(true,
            String.format("Sold %.4f %s @ ₹%.2f | P&L: %s₹%.2f",
                qty, asset.getName(), price,
                realizedPnl.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "", realizedPnl),
            user.getVirtualBalance(), mapTx(tx));
    }

    // ---- Mapper -------------------------------------------------------------

    private TransactionDTO mapTx(Transaction tx) {
        return new TransactionDTO(
            tx.getId(),
            tx.getAsset().getId(),
            tx.getAsset().getSymbol(),
            tx.getAsset().getName(),
            tx.getAsset().getType().name(),
            tx.getType().name(),
            tx.getOrderType().name(),
            tx.getQuantity(),
            tx.getPricePerUnit(),
            tx.getTotalAmount(),
            tx.getRealizedPnl(),
            tx.getExecutedAt().toString()
        );
    }
}
