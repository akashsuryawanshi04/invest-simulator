package com.investsimulator.service;

import com.investsimulator.model.Asset;
import com.investsimulator.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Price Simulation Engine using Random Walk algorithm.
 *
 * Simulates realistic price movements:
 * - Stocks: lower volatility (0.3% per tick)
 * - Crypto: higher volatility (0.8% per tick)
 *
 * Prices drift around a mean-reversion model to prevent
 * prices from going to zero or infinity over time.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PriceSimulationService {

    private final AssetRepository assetRepo;

    @Value("${app.simulation.stock-volatility:0.003}")
    private double stockVolatility;

    @Value("${app.simulation.crypto-volatility:0.008}")
    private double cryptoVolatility;

    private final Random random = new Random();

    /**
     * Update all asset prices every 5 seconds.
     * Uses Geometric Brownian Motion (GBM) simplified.
     */
    @Scheduled(fixedRateString = "${app.simulation.price-update-interval-ms:5000}")
    @Transactional
    public void updateAllPrices() {
        List<Asset> assets = assetRepo.findAllByIsActiveTrue();
        if (assets.isEmpty()) return;

        assets.forEach(this::simulatePrice);
        assetRepo.saveAll(assets);

        log.debug("Updated prices for {} assets at {}", assets.size(), LocalDateTime.now());
    }

    private void simulatePrice(Asset asset) {
        double volatility = asset.getType() == Asset.AssetType.CRYPTO
            ? cryptoVolatility : stockVolatility;

        double currentPrice = asset.getCurrentPrice().doubleValue();
        double basePrice    = asset.getBasePrice().doubleValue();

        // Mean reversion factor — pulls price back toward base over time
        double meanReversionStrength = 0.001;
        double meanReversionForce    = (basePrice - currentPrice) / basePrice * meanReversionStrength;

        // Gaussian random shock
        double randomShock = random.nextGaussian() * volatility;

        // Combined price change
        double priceDelta = currentPrice * (randomShock + meanReversionForce);

        // Apply bounds — price can't go below 1% of base or above 500% of base
        double newPrice = Math.max(
            Math.min(currentPrice + priceDelta, basePrice * 5.0),
            basePrice * 0.01
        );

        // Calculate percentage change from base
        double changeFromBase = ((newPrice - basePrice) / basePrice) * 100.0;

        asset.setCurrentPrice(BigDecimal.valueOf(newPrice).setScale(6, RoundingMode.HALF_UP));
        asset.setPriceChangePct(BigDecimal.valueOf(changeFromBase).setScale(4, RoundingMode.HALF_UP));
        asset.setUpdatedAt(LocalDateTime.now());
    }

    /**
     * Get a snapshot of all current prices.
     * Used for REST API response.
     */
    public Map<Long, BigDecimal> getCurrentPrices() {
        Map<Long, BigDecimal> prices = new LinkedHashMap<>();
        assetRepo.findAllByIsActiveTrue()
            .forEach(a -> prices.put(a.getId(), a.getCurrentPrice()));
        return prices;
    }

    /**
     * Get current price for a specific asset.
     */
    public BigDecimal getPriceForAsset(Long assetId) {
        return assetRepo.findById(assetId)
            .map(Asset::getCurrentPrice)
            .orElseThrow(() -> new RuntimeException("Asset not found: " + assetId));
    }
}
