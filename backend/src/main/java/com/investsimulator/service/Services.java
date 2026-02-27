package com.investsimulator.service;

import com.investsimulator.dto.*;
import com.investsimulator.exception.ResourceNotFoundException;
import com.investsimulator.model.*;
import com.investsimulator.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

// ============================================================
// PortfolioService
// ============================================================
@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final UserRepository        userRepo;
    private final HoldingRepository     holdingRepo;
    private final TransactionRepository txRepo;
    private final PortfolioRepository   portfolioRepo;

    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolio(Long userId) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Holding> holdings = holdingRepo.findAllByUserId(userId);

        BigDecimal portfolioValue = holdings.stream()
            .map(h -> h.getAsset().getCurrentPrice().multiply(h.getQuantity()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCost = holdings.stream()
            .map(Holding::getTotalInvested)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal unrealizedPnl = portfolioValue.subtract(totalCost);
        BigDecimal unrealizedPct = totalCost.compareTo(BigDecimal.ZERO) > 0
            ? unrealizedPnl.divide(totalCost, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;

        BigDecimal realizedPnl = portfolioRepo.findByUserId(userId)
            .map(Portfolio::getRealizedPnl)
            .orElse(BigDecimal.ZERO);

        long winningPositions = holdings.stream()
            .filter(h -> h.getAsset().getCurrentPrice().compareTo(h.getAvgBuyPrice()) > 0)
            .count();

        List<HoldingDTO> holdingDTOs = holdings.stream()
            .map(this::mapHolding)
            .collect(Collectors.toList());

        return new PortfolioResponse(
            user.getVirtualBalance(),
            portfolioValue.setScale(4, RoundingMode.HALF_UP),
            totalCost.setScale(4, RoundingMode.HALF_UP),
            unrealizedPnl.setScale(4, RoundingMode.HALF_UP),
            unrealizedPct.setScale(4, RoundingMode.HALF_UP),
            realizedPnl,
            holdings.size(),
            (int) winningPositions,
            holdingDTOs
        );
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionHistory(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
            Sort.by(Sort.Direction.DESC, "executedAt"));
        return txRepo.findAllByUserIdOrderByExecutedAtDesc(userId, pageable)
            .stream()
            .map(this::mapTransaction)
            .collect(Collectors.toList());
    }

    private HoldingDTO mapHolding(Holding h) {
        BigDecimal curPrice  = h.getAsset().getCurrentPrice();
        BigDecimal curValue  = curPrice.multiply(h.getQuantity());
        BigDecimal costBasis = h.getAvgBuyPrice().multiply(h.getQuantity());
        BigDecimal upnl      = curValue.subtract(costBasis);
        BigDecimal pnlPct    = costBasis.compareTo(BigDecimal.ZERO) > 0
            ? upnl.divide(costBasis, 6, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;

        return new HoldingDTO(
            h.getAsset().getId(),
            h.getAsset().getSymbol(),
            h.getAsset().getName(),
            h.getAsset().getType().name(),
            h.getAsset().getSector(),
            h.getQuantity(),
            h.getAvgBuyPrice(),
            curPrice,
            curValue.setScale(4, RoundingMode.HALF_UP),
            costBasis.setScale(4, RoundingMode.HALF_UP),
            upnl.setScale(4, RoundingMode.HALF_UP),
            pnlPct.setScale(4, RoundingMode.HALF_UP)
        );
    }

    private TransactionDTO mapTransaction(Transaction tx) {
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


// ============================================================
// WatchlistService
// ============================================================
@Service
@RequiredArgsConstructor
class WatchlistService {

    private final WatchlistRepository watchlistRepo;
    private final AssetRepository     assetRepo;
    private final UserRepository      userRepo;

    @Transactional(readOnly = true)
    public List<AssetDTO> getWatchlist(Long userId) {
        return watchlistRepo.findAllByUserIdOrderByAddedAtDesc(userId).stream()
            .map(w -> mapAsset(w.getAsset()))
            .collect(Collectors.toList());
    }

    @Transactional
    public boolean toggle(Long userId, Long assetId) {
        if (watchlistRepo.existsByUserIdAndAssetId(userId, assetId)) {
            watchlistRepo.deleteByUserIdAndAssetId(userId, assetId);
            return false; // removed
        } else {
            User  user  = userRepo.findById(userId).orElseThrow();
            Asset asset = assetRepo.findById(assetId).orElseThrow();
            watchlistRepo.save(WatchlistItem.builder().user(user).asset(asset).build());
            return true;  // added
        }
    }

    private AssetDTO mapAsset(Asset a) {
        return new AssetDTO(a.getId(), a.getSymbol(), a.getName(),
            a.getType().name(), a.getSector(), a.getCurrentPrice(), a.getPriceChangePct());
    }
}
