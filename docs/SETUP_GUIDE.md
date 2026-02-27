# InvestSimulator — Complete Setup & Deployment Guide

## Project Architecture Overview

```
invest-simulator/
├── frontend/                        # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── SignupPage.jsx
│   │   │   ├── Layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── TickerBar.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── DashboardPage.jsx
│   │   │   ├── Market/
│   │   │   │   └── MarketPage.jsx
│   │   │   ├── Chart/
│   │   │   │   ├── TradingPage.jsx
│   │   │   │   └── TradingViewChart.jsx
│   │   │   ├── Portfolio/
│   │   │   │   └── PortfolioPage.jsx
│   │   │   ├── Watchlist/
│   │   │   │   └── WatchlistPage.jsx
│   │   │   ├── History/
│   │   │   │   └── HistoryPage.jsx
│   │   │   └── Admin/
│   │   │       └── AdminPage.jsx
│   │   ├── services/
│   │   │   ├── api.js               # Axios client
│   │   │   ├── authService.js
│   │   │   └── tradeService.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── usePrices.js
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── App.jsx                  # Main app + routing
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                         # Spring Boot
│   └── src/main/
│       ├── java/com/investsimulator/
│       │   ├── InvestSimulatorApplication.java
│       │   ├── model/               # JPA entities
│       │   │   ├── User.java
│       │   │   ├── Asset.java
│       │   │   ├── Holding.java
│       │   │   ├── Transaction.java
│       │   │   ├── Portfolio.java
│       │   │   └── WatchlistItem.java
│       │   ├── dto/                 # Request/Response DTOs
│       │   │   ├── SignupRequest.java
│       │   │   ├── LoginRequest.java
│       │   │   ├── AuthResponse.java
│       │   │   ├── TradeRequest.java
│       │   │   └── PortfolioResponse.java
│       │   ├── repository/          # JPA Repositories
│       │   │   ├── UserRepository.java
│       │   │   ├── AssetRepository.java
│       │   │   ├── HoldingRepository.java
│       │   │   ├── TransactionRepository.java
│       │   │   └── WatchlistRepository.java
│       │   ├── service/             # Business logic
│       │   │   ├── TradingService.java
│       │   │   ├── PortfolioService.java
│       │   │   ├── UserService.java
│       │   │   ├── WatchlistService.java
│       │   │   └── PriceSimulationService.java
│       │   ├── controller/          # REST endpoints
│       │   │   ├── AuthController.java
│       │   │   ├── MarketController.java
│       │   │   ├── TradeController.java
│       │   │   ├── PortfolioController.java
│       │   │   └── AdminController.java
│       │   ├── security/
│       │   │   ├── JwtService.java
│       │   │   ├── JwtAuthFilter.java
│       │   │   ├── SecurityConfig.java
│       │   │   └── CustomUserPrincipal.java
│       │   └── exception/
│       │       ├── GlobalExceptionHandler.java
│       │       ├── BusinessException.java
│       │       └── ResourceNotFoundException.java
│       └── resources/
│           └── application.properties
│
├── database/
│   └── schema.sql                   # Full DB schema
└── docker-compose.yml
```

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Java | 17+ | OpenJDK recommended |
| Maven | 3.8+ | Or use the included wrapper |
| MySQL | 8.0+ | Or Docker |
| Node.js | 18+ | For frontend |
| npm | 9+ | Package manager |

---

## Step 1: Database Setup

```bash
# Option A: Direct MySQL
mysql -u root -p
CREATE DATABASE invest_simulator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
mysql -u root -p invest_simulator < database/schema.sql

# Option B: Docker MySQL
docker run -d \
  --name invest-mysql \
  -e MYSQL_ROOT_PASSWORD=yourpassword \
  -e MYSQL_DATABASE=invest_simulator \
  -p 3306:3306 \
  mysql:8.0

docker exec -i invest-mysql mysql -u root -pyourpassword invest_simulator < database/schema.sql
```

---

## Step 2: Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/invest_simulator?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_DB_PASSWORD

# IMPORTANT: Change this secret in production!
app.jwt.secret=MinimumOf256BitSecretKeyHereForHS256AlgorithmSecurity123456
app.jwt.expiration-ms=86400000

app.cors.allowed-origins=http://localhost:5173
```

---

## Step 3: Run Backend

```bash
cd backend
./mvnw clean install -DskipTests
./mvnw spring-boot:run

# Backend runs at http://localhost:8080
# Health check: GET http://localhost:8080/api/market/assets
```

---

## Step 4: Frontend Setup

```bash
cd frontend
npm install
npm run dev

# Frontend runs at http://localhost:5173
```

### Frontend API Client (`src/services/api.js`):

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

// Auto-attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('invest_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('invest_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth services
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
};

// Market services
export const marketAPI = {
  getAssets:  (params) => api.get('/market/assets', { params }),
  getAsset:   (id)     => api.get(`/market/assets/${id}`),
  getLivePrices: ()    => api.get('/market/prices'),
};

// Trading services
export const tradeAPI = {
  executeTrade: (data) => api.post('/trade/execute', data),
};

// Portfolio services
export const portfolioAPI = {
  getPortfolio: ()     => api.get('/portfolio'),
  getHistory:   (params) => api.get('/portfolio/history', { params }),
  getWatchlist: ()     => api.get('/portfolio/watchlist'),
  toggleWatch:  (id)  => api.post(`/portfolio/watchlist/${id}`),
};
```

---

## API Reference

### Authentication

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/auth/signup` | POST | `{fullName, email, password, initialCapital}` | `{token, email, fullName, role}` |
| `/api/auth/login` | POST | `{email, password}` | `{token, email, fullName, role}` |

### Market

| Endpoint | Method | Auth | Params |
|----------|--------|------|--------|
| `/api/market/assets` | GET | None | `?type=STOCK&search=reliance` |
| `/api/market/assets/{id}` | GET | None | — |
| `/api/market/prices` | GET | None | — |

### Trading

| Endpoint | Method | Auth | Body |
|----------|--------|------|------|
| `/api/trade/execute` | POST | JWT | `{assetId, tradeType, orderType, quantity}` |

### Portfolio

| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| `/api/portfolio` | GET | JWT | Full portfolio summary |
| `/api/portfolio/history` | GET | JWT | `?page=0&size=50` |
| `/api/portfolio/watchlist` | GET | JWT | — |
| `/api/portfolio/watchlist/{assetId}` | POST | JWT | Toggle add/remove |

### Admin

| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| `/api/admin/users` | GET | ADMIN | All users |
| `/api/admin/users/{id}/reset` | PUT | ADMIN | Reset balance |
| `/api/admin/assets` | POST | ADMIN | Add new asset |

---

## Real-time Price Updates (WebSocket — Optional Upgrade)

```java
// Add spring-boot-starter-websocket dependency then:

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOrigins("*").withSockJS();
    }
}

// In PriceSimulationService:
@Autowired private SimpMessagingTemplate messagingTemplate;

@Scheduled(fixedRate = 3000)
public void broadcastPrices() {
    Map<Long, BigDecimal> prices = getCurrentPrices();
    messagingTemplate.convertAndSend("/topic/prices", prices);
}
```

Frontend connection:
```javascript
import { Client } from '@stomp/stompjs';
const client = new Client({ brokerURL: 'ws://localhost:8080/ws' });
client.onConnect = () => {
  client.subscribe('/topic/prices', (msg) => {
    const prices = JSON.parse(msg.body);
    setPrices(prices);
  });
};
client.activate();
```

---

## Docker Compose (Full Stack)

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: investsim123
      MYSQL_DATABASE: invest_simulator
    ports: ["3306:3306"]
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports: ["8080:8080"]
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/invest_simulator?useSSL=false
      SPRING_DATASOURCE_PASSWORD: investsim123
      APP_JWT_SECRET: YourProductionJWTSecretKeyHere256Bits
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports: ["3000:80"]
    depends_on: [backend]
    environment:
      VITE_API_BASE_URL: http://backend:8080/api

volumes:
  mysql_data:
```

```bash
# Launch everything
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

---

## Production Deployment (AWS / DigitalOcean)

### Backend (EC2 / App Engine)
```bash
# Build JAR
./mvnw clean package -DskipTests
java -jar target/invest-simulator-1.0.0.jar --spring.profiles.active=prod

# With environment variables
export DB_URL="jdbc:mysql://your-rds-endpoint:3306/invest_simulator"
export DB_PASS="your-prod-password"
export JWT_SECRET="your-256bit-production-secret"
```

### Frontend (S3 + CloudFront / Netlify / Vercel)
```bash
# Build static files
npm run build

# Netlify
netlify deploy --prod --dir=dist

# Vercel
vercel --prod

# AWS S3
aws s3 sync dist/ s3://your-bucket-name --delete
```

### Environment Variables (Production)
```
# Backend
SPRING_DATASOURCE_URL=jdbc:mysql://prod-db:3306/invest_simulator
SPRING_DATASOURCE_USERNAME=investapp
SPRING_DATASOURCE_PASSWORD=<secure_password>
APP_JWT_SECRET=<256_bit_random_secret>
APP_CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Frontend
VITE_API_BASE_URL=https://api.your-domain.com
```

---

## Security Checklist ✅

- [x] JWT stored in memory or httpOnly cookies (not localStorage in prod)
- [x] BCrypt password hashing (strength 12)
- [x] SQL injection protection via JPA/Hibernate parameterized queries
- [x] CORS restricted to allowed origins
- [x] Input validation with Bean Validation (@Valid, @NotBlank, @Email)
- [x] Role-based access control (RBAC) with Spring Security
- [x] API keys / secrets in environment variables only
- [x] No real trading APIs connected (pure simulation)
- [x] Rate limiting (add `spring-boot-starter-actuator` + bucket4j)

---

## TradingView Widget Integration

The frontend uses the free TradingView Widget which provides:
- Real live market charts (not simulated)
- NSE stocks via `NSE:SYMBOL` format
- Crypto via `BINANCE:COINUSDT` format
- Full technical analysis tools

```javascript
// Chart initialization
new window.TradingView.widget({
  symbol: "NSE:RELIANCE",       // or "BINANCE:BTCUSDT"
  interval: "D",                 // 1, 5, 15, 30, 60, 240, D, W
  theme: "dark",
  container_id: "chart_container",
  autosize: true,
  timezone: "Asia/Kolkata",
  locale: "en",
});
```

Note: TradingView charts show real market data; trades executed in InvestSimulator use simulated prices (random walk algorithm) to ensure no real financial data is used for trade execution, making this purely educational.

---

## Performance Optimizations

### Database
```sql
-- Add composite index for frequent portfolio queries
CREATE INDEX idx_holdings_user_asset ON holdings(user_id, asset_id);
CREATE INDEX idx_tx_user_date ON transactions(user_id, executed_at DESC);

-- Partition price_history by month for large datasets
ALTER TABLE price_history PARTITION BY RANGE (MONTH(recorded_at)) (
  PARTITION p1 VALUES LESS THAN (2),
  PARTITION p2 VALUES LESS THAN (3),
  -- ... etc
  PARTITION p12 VALUES LESS THAN MAXVALUE
);
```

### Spring Boot
```java
// Cache asset list (rarely changes)
@Cacheable("assets")
public List<AssetDTO> getAllAssets() { ... }

// Enable caching
@SpringBootApplication
@EnableCaching
@EnableScheduling
public class InvestSimulatorApplication { ... }
```

### Frontend
- Use React.memo for asset list rows
- Debounce search input (300ms)
- Only re-render changed price cells (use React.useMemo)
- Lazy load chart component

---

## Monitoring & Logging

```java
// Add to pom.xml
// spring-boot-starter-actuator

// application.properties
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=always

// Custom metrics
@Component
class TradeMetrics {
    private final Counter tradeCounter;
    
    TradeMetrics(MeterRegistry registry) {
        this.tradeCounter = registry.counter("trades_executed_total");
    }
    
    public void recordTrade(String type) {
        tradeCounter.increment(1, "type", type);
    }
}
```

---

## 🎯 Feature Roadmap

| Feature | Status | Notes |
|---------|--------|-------|
| Core trading simulation | ✅ Done | Buy/sell with virtual capital |
| TradingView charts | ✅ Done | Real charts, simulated prices |
| Portfolio tracking | ✅ Done | Unrealized + realized P&L |
| Watchlist | ✅ Done | Per-user watchlists |
| Price simulation engine | ✅ Done | Random walk with volatility |
| JWT authentication | ✅ Done | Secure session management |
| Admin panel | ✅ Done | User & asset management |
| WebSocket live prices | 🔲 Optional | Real-time push updates |
| Leaderboard | 🔲 Optional | Compare with other traders |
| Limit orders | 🔲 Optional | Queue-based order matching |
| Options simulation | 🔲 Optional | Advanced derivatives |
| Portfolio analytics | 🔲 Optional | Sharpe ratio, beta, alpha |
| Mobile app | 🔲 Optional | React Native |

---

Built with ❤️ for learning investing without real financial risk.
