package com.investsimulator.controller;

import com.investsimulator.dto.*;
import com.investsimulator.exception.*;
import com.investsimulator.model.*;
import com.investsimulator.repository.*;
import com.investsimulator.security.CustomUserPrincipal;
import com.investsimulator.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// ============================================================
// AuthController — POST /api/auth/signup, /api/auth/login
// ============================================================
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserRepository      userRepo;
    private final PortfolioRepository portfolioRepo;
    private final JwtService          jwtService;
    private final PasswordEncoder     passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest req) {
        if (userRepo.existsByEmail(req.email())) {
            throw new BusinessException("Email is already registered: " + req.email());
        }

        User user = User.builder()
            .fullName(req.fullName())
            .email(req.email())
            .passwordHash(passwordEncoder.encode(req.password()))
            .virtualBalance(req.initialCapital())
            .initialCapital(req.initialCapital())
            .role(User.Role.USER)
            .build();
        userRepo.save(user);

        // Auto-create portfolio
        portfolioRepo.save(Portfolio.builder().user(user).build());

        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        log.info("New user registered: {}", user.getEmail());

        return ResponseEntity.status(201).body(ApiResponse.ok(
            "Account created successfully",
            new AuthResponse(token, user.getEmail(), user.getFullName(),
                user.getRole().name(), user.getVirtualBalance())
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepo.findByEmail(req.email())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        if (!user.getIsActive()) {
            throw new UnauthorizedException("Account is deactivated. Contact support.");
        }

        user.setLastLogin(java.time.LocalDateTime.now());
        userRepo.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        log.info("User logged in: {}", user.getEmail());

        return ResponseEntity.ok(ApiResponse.ok(
            "Login successful",
            new AuthResponse(token, user.getEmail(), user.getFullName(),
                user.getRole().name(), user.getVirtualBalance())
        ));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AuthResponse>> me(Authentication auth) {
        Long userId = ((CustomUserPrincipal) auth.getPrincipal()).getUserId();
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return ResponseEntity.ok(ApiResponse.ok(
            new AuthResponse(token, user.getEmail(), user.getFullName(),
                user.getRole().name(), user.getVirtualBalance())
        ));
    }
}


// ============================================================
// MarketController — GET /api/market/assets, /api/market/prices
// ============================================================
@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final AssetRepository         assetRepo;
    private final PriceSimulationService  priceService;

    @GetMapping("/assets")
    public ResponseEntity<ApiResponse<List<AssetDTO>>> getAllAssets(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String search
    ) {
        List<Asset> assets;

        if (search != null && !search.isBlank()) {
            assets = assetRepo.searchAssets(search.trim());
        } else if (type != null && !type.isBlank()) {
            assets = assetRepo.findByTypeAndIsActiveTrue(
                Asset.AssetType.valueOf(type.toUpperCase()));
        } else {
            assets = assetRepo.findAllByIsActiveTrue();
        }

        List<AssetDTO> dtos = assets.stream().map(this::mapAsset).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @GetMapping("/assets/{id}")
    public ResponseEntity<ApiResponse<AssetDTO>> getAsset(@PathVariable Long id) {
        return assetRepo.findById(id)
            .map(a -> ResponseEntity.ok(ApiResponse.ok(mapAsset(a))))
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + id));
    }

    @GetMapping("/assets/symbol/{symbol}")
    public ResponseEntity<ApiResponse<AssetDTO>> getAssetBySymbol(@PathVariable String symbol) {
        return assetRepo.findBySymbol(symbol.toUpperCase())
            .map(a -> ResponseEntity.ok(ApiResponse.ok(mapAsset(a))))
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + symbol));
    }

    @GetMapping("/prices")
    public ResponseEntity<ApiResponse<Map<Long, BigDecimal>>> getLivePrices() {
        return ResponseEntity.ok(ApiResponse.ok(priceService.getCurrentPrices()));
    }

    @GetMapping("/movers")
    public ResponseEntity<ApiResponse<List<AssetDTO>>> getTopMovers() {
        var pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        List<AssetDTO> movers = assetRepo.findTopMovers(pageable)
            .stream().map(this::mapAsset).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(movers));
    }

    private AssetDTO mapAsset(Asset a) {
        return new AssetDTO(a.getId(), a.getSymbol(), a.getName(),
            a.getType().name(), a.getSector(), a.getCurrentPrice(), a.getPriceChangePct());
    }
}


// ============================================================
// TradeController — POST /api/trade/execute
// ============================================================
@RestController
@RequestMapping("/api/trade")
@RequiredArgsConstructor
@Slf4j
public class TradeController {

    private final TradingService tradingService;

    @PostMapping("/execute")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TradeResponse>> executeTrade(
        @Valid @RequestBody TradeRequest req,
        Authentication auth
    ) {
        Long userId = ((CustomUserPrincipal) auth.getPrincipal()).getUserId();
        TradeResponse response = tradingService.executeTrade(userId, req);

        if (response.success()) {
            return ResponseEntity.ok(ApiResponse.ok(response.message(), response));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error(response.message()));
        }
    }
}


// ============================================================
// PortfolioController — GET /api/portfolio, /api/portfolio/history
// ============================================================
@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService  portfolioService;
    private final WatchlistService  watchlistService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PortfolioResponse>> getPortfolio(Authentication auth) {
        Long userId = ((CustomUserPrincipal) auth.getPrincipal()).getUserId();
        return ResponseEntity.ok(ApiResponse.ok(portfolioService.getPortfolio(userId)));
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<TransactionDTO>>> getHistory(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size,
        Authentication auth
    ) {
        Long userId = ((CustomUserPrincipal) auth.getPrincipal()).getUserId();
        return ResponseEntity.ok(ApiResponse.ok(
            portfolioService.getTransactionHistory(userId, page, Math.min(size, 200))
        ));
    }

    @GetMapping("/watchlist")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AssetDTO>>> getWatchlist(Authentication auth) {
        Long userId = ((CustomUserPrincipal) auth.getPrincipal()).getUserId();
        return ResponseEntity.ok(ApiResponse.ok(watchlistService.getWatchlist(userId)));
    }

    @PostMapping("/watchlist/{assetId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Boolean>> toggleWatchlist(
        @PathVariable Long assetId,
        Authentication auth
    ) {
        Long userId = ((CustomUserPrincipal) auth.getPrincipal()).getUserId();
        boolean added = watchlistService.toggle(userId, assetId);
        String msg = added ? "Added to watchlist" : "Removed from watchlist";
        return ResponseEntity.ok(ApiResponse.ok(msg, added));
    }
}


// ============================================================
// AdminController — GET/PUT /api/admin/**
// ============================================================
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminController {

    private final UserRepository  userRepo;
    private final AssetRepository assetRepo;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserSummaryDTO>>> getAllUsers() {
        List<UserSummaryDTO> users = userRepo.findAll().stream()
            .map(u -> new UserSummaryDTO(u.getId(), u.getFullName(), u.getEmail(),
                u.getRole().name(), u.getVirtualBalance(), u.getInitialCapital(),
                u.getIsActive(),
                u.getCreatedAt() != null ? u.getCreatedAt().toString() : null,
                u.getLastLogin() != null  ? u.getLastLogin().toString()  : null))
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PutMapping("/users/{id}/reset")
    public ResponseEntity<ApiResponse<String>> resetUserBalance(@PathVariable Long id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setVirtualBalance(user.getInitialCapital());
        userRepo.save(user);
        log.info("Admin reset balance for user: {}", user.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Balance reset to ₹" + user.getInitialCapital(), "done"));
    }

    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<ApiResponse<String>> toggleUserStatus(@PathVariable Long id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(!user.getIsActive());
        userRepo.save(user);
        String status = user.getIsActive() ? "activated" : "deactivated";
        return ResponseEntity.ok(ApiResponse.ok("User " + status, status));
    }

    @PostMapping("/assets")
    public ResponseEntity<ApiResponse<Asset>> addAsset(@RequestBody Asset asset) {
        Asset saved = assetRepo.save(asset);
        return ResponseEntity.status(201).body(ApiResponse.ok("Asset added", saved));
    }

    @PutMapping("/assets/{id}/toggle")
    public ResponseEntity<ApiResponse<String>> toggleAsset(@PathVariable Long id) {
        Asset asset = assetRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        asset.setIsActive(!asset.getIsActive());
        assetRepo.save(asset);
        return ResponseEntity.ok(ApiResponse.ok(
            "Asset " + (asset.getIsActive() ? "enabled" : "disabled"), "done"));
    }
}
