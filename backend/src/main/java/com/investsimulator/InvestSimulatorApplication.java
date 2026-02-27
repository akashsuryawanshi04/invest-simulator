package com.investsimulator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * InvestSimulator — Virtual Trading & Investment Learning Platform
 *
 * A production-grade educational trading simulator that allows users to
 * practice investing in Indian stocks and cryptocurrencies using virtual money.
 *
 * Features:
 * - JWT-based authentication
 * - Atomic buy/sell trading engine
 * - Real-time price simulation (random walk)
 * - Portfolio P&L tracking
 * - Watchlist management
 * - Admin panel
 *
 * @author InvestSimulator Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableScheduling
@EnableCaching
public class InvestSimulatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(InvestSimulatorApplication.class, args);
        System.out.println("""

            ╔══════════════════════════════════════════════════╗
            ║   InvestSimulator v1.0.0  - Server Started      ║
            ║   API Base: http://localhost:8080/api            ║
            ║   Health:   http://localhost:8080/actuator/health║
            ╚══════════════════════════════════════════════════╝
            """);
    }
}
