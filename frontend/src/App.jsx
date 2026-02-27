import { useState, useEffect, useRef, useCallback, useReducer } from "react";

// ============================================================
// CONSTANTS & INITIAL DATA
// ============================================================

const NSE_STOCKS = [
  { id: "s1", symbol: "NSE:RELIANCE", name: "Reliance Industries", price: 2847.50, change: 1.23, sector: "Energy", type: "stock" },
  { id: "s2", symbol: "NSE:TCS", name: "Tata Consultancy Services", price: 3921.75, change: -0.87, sector: "IT", type: "stock" },
  { id: "s3", symbol: "NSE:HDFCBANK", name: "HDFC Bank", price: 1654.30, change: 0.54, sector: "Banking", type: "stock" },
  { id: "s4", symbol: "NSE:INFY", name: "Infosys", price: 1489.60, change: -1.12, sector: "IT", type: "stock" },
  { id: "s5", symbol: "NSE:HINDUNILVR", name: "Hindustan Unilever", price: 2378.90, change: 0.78, sector: "FMCG", type: "stock" },
  { id: "s6", symbol: "NSE:ICICIBANK", name: "ICICI Bank", price: 1089.45, change: 1.45, sector: "Banking", type: "stock" },
  { id: "s7", symbol: "NSE:SBIN", name: "State Bank of India", price: 812.30, change: 2.11, sector: "Banking", type: "stock" },
  { id: "s8", symbol: "NSE:BHARTIARTL", name: "Bharti Airtel", price: 1723.80, change: 0.33, sector: "Telecom", type: "stock" },
  { id: "s9", symbol: "NSE:ITC", name: "ITC Limited", price: 453.20, change: -0.45, sector: "FMCG", type: "stock" },
  { id: "s10", symbol: "NSE:KOTAKBANK", name: "Kotak Mahindra Bank", price: 1876.55, change: 0.91, sector: "Banking", type: "stock" },
  { id: "s11", symbol: "NSE:LT", name: "Larsen & Toubro", price: 3564.10, change: 1.67, sector: "Infrastructure", type: "stock" },
  { id: "s12", symbol: "NSE:AXISBANK", name: "Axis Bank", price: 1134.75, change: -0.23, sector: "Banking", type: "stock" },
  { id: "s13", symbol: "NSE:WIPRO", name: "Wipro", price: 567.40, change: -1.89, sector: "IT", type: "stock" },
  { id: "s14", symbol: "NSE:MARUTI", name: "Maruti Suzuki India", price: 12450.00, change: 0.66, sector: "Auto", type: "stock" },
  { id: "s15", symbol: "NSE:SUNPHARMA", name: "Sun Pharmaceutical", price: 1678.25, change: 1.34, sector: "Pharma", type: "stock" },
  { id: "s16", symbol: "NSE:HCLTECH", name: "HCL Technologies", price: 1789.50, change: 0.44, sector: "IT", type: "stock" },
  { id: "s17", symbol: "NSE:TATAMOTORS", name: "Tata Motors", price: 967.80, change: 3.21, sector: "Auto", type: "stock" },
  { id: "s18", symbol: "NSE:ONGC", name: "Oil & Natural Gas Corp", price: 276.45, change: -0.78, sector: "Energy", type: "stock" },
  { id: "s19", symbol: "NSE:POWERGRID", name: "Power Grid Corporation", price: 327.60, change: 0.98, sector: "Utilities", type: "stock" },
  { id: "s20", symbol: "NSE:NTPC", name: "NTPC Limited", price: 389.25, change: 1.56, sector: "Utilities", type: "stock" },
  { id: "s21", symbol: "NSE:BAJFINANCE", name: "Bajaj Finance", price: 7234.80, change: -1.23, sector: "Finance", type: "stock" },
  { id: "s22", symbol: "NSE:TITAN", name: "Titan Company", price: 3456.70, change: 2.34, sector: "Consumer", type: "stock" },
  { id: "s23", symbol: "NSE:ASIANPAINT", name: "Asian Paints", price: 2987.30, change: -0.56, sector: "Consumer", type: "stock" },
  { id: "s24", symbol: "NSE:ULTRACEMCO", name: "UltraTech Cement", price: 11234.50, change: 0.89, sector: "Materials", type: "stock" },
  { id: "s25", symbol: "NSE:NESTLEIND", name: "Nestlé India", price: 24567.00, change: 0.34, sector: "FMCG", type: "stock" },
];

const CRYPTO_ASSETS = [
  { id: "c1", symbol: "BINANCE:BTCUSDT", name: "Bitcoin", price: 67432.50, change: 2.34, sector: "Layer 1", type: "crypto" },
  { id: "c2", symbol: "BINANCE:ETHUSDT", name: "Ethereum", price: 3456.78, change: -1.23, sector: "Layer 1", type: "crypto" },
  { id: "c3", symbol: "BINANCE:BNBUSDT", name: "BNB", price: 567.34, change: 0.78, sector: "Exchange", type: "crypto" },
  { id: "c4", symbol: "BINANCE:SOLUSDT", name: "Solana", price: 189.45, change: 4.56, sector: "Layer 1", type: "crypto" },
  { id: "c5", symbol: "BINANCE:XRPUSDT", name: "XRP", price: 0.6234, change: -2.11, sector: "Payments", type: "crypto" },
  { id: "c6", symbol: "BINANCE:ADAUSDT", name: "Cardano", price: 0.4891, change: 1.67, sector: "Layer 1", type: "crypto" },
  { id: "c7", symbol: "BINANCE:AVAXUSDT", name: "Avalanche", price: 38.76, change: -3.45, sector: "Layer 1", type: "crypto" },
  { id: "c8", symbol: "BINANCE:DOGEUSDT", name: "Dogecoin", price: 0.1456, change: 5.67, sector: "Meme", type: "crypto" },
  { id: "c9", symbol: "BINANCE:DOTUSDT", name: "Polkadot", price: 7.89, change: -0.89, sector: "Interop", type: "crypto" },
  { id: "c10", symbol: "BINANCE:MATICUSDT", name: "Polygon", price: 0.8923, change: 2.34, sector: "Layer 2", type: "crypto" },
  { id: "c11", symbol: "BINANCE:LINKUSDT", name: "Chainlink", price: 14.56, change: 3.21, sector: "Oracle", type: "crypto" },
  { id: "c12", symbol: "BINANCE:UNIUSDT", name: "Uniswap", price: 10.23, change: -1.56, sector: "DeFi", type: "crypto" },
  { id: "c13", symbol: "BINANCE:LTCUSDT", name: "Litecoin", price: 87.45, change: 0.45, sector: "Payments", type: "crypto" },
  { id: "c14", symbol: "BINANCE:ATOMUSDT", name: "Cosmos", price: 9.67, change: -2.34, sector: "Interop", type: "crypto" },
  { id: "c15", symbol: "BINANCE:NEARUSDT", name: "NEAR Protocol", price: 5.34, change: 1.23, sector: "Layer 1", type: "crypto" },
  { id: "c16", symbol: "BINANCE:FTMUSDT", name: "Fantom", price: 0.7823, change: 6.78, sector: "Layer 1", type: "crypto" },
  { id: "c17", symbol: "BINANCE:ALGOUSDT", name: "Algorand", price: 0.1967, change: -0.34, sector: "Layer 1", type: "crypto" },
  { id: "c18", symbol: "BINANCE:ICPUSDT", name: "Internet Computer", price: 12.34, change: 2.89, sector: "Web3", type: "crypto" },
  { id: "c19", symbol: "BINANCE:APTUSDT", name: "Aptos", price: 9.45, change: -4.56, sector: "Layer 1", type: "crypto" },
  { id: "c20", symbol: "BINANCE:ARBUSDT", name: "Arbitrum", price: 1.23, change: 3.67, sector: "Layer 2", type: "crypto" },
];

const ALL_ASSETS = [...NSE_STOCKS, ...CRYPTO_ASSETS];

const CAPITAL_OPTIONS = [
  { label: "₹1 Lakh", value: 100000 },
  { label: "₹5 Lakhs", value: 500000 },
  { label: "₹10 Lakhs", value: 1000000 },
  { label: "₹25 Lakhs", value: 2500000 },
  { label: "₹1 Crore", value: 10000000 },
];

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1D", "1W"];

const formatCurrency = (val, type = "stock") => {
  if (type === "crypto" && val < 1) return `$${val.toFixed(4)}`;
  if (type === "crypto") return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val) => val.toLocaleString("en-IN");

// ============================================================
// STATE MANAGEMENT
// ============================================================

const initialState = {
  user: null,
  prices: {},
  holdings: {},
  transactions: [],
  watchlist: [],
  wallet: 0,
  totalInvested: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN": {
      const savedData = localStorage.getItem(`invest_${action.user.email}`);
      if (savedData) {
        return { ...state, ...JSON.parse(savedData), user: action.user };
      }
      return {
        ...state,
        user: action.user,
        wallet: action.capital,
        holdings: {},
        transactions: [],
        watchlist: [],
        totalInvested: 0,
      };
    }
    case "LOGOUT":
      return { ...initialState };
    case "UPDATE_PRICES":
      return { ...state, prices: action.prices };
    case "BUY": {
      const { assetId, qty, price, asset } = action;
      const cost = qty * price;
      if (cost > state.wallet) return state;
      const existing = state.holdings[assetId] || { qty: 0, avgPrice: 0, asset };
      const newQty = existing.qty + qty;
      const newAvg = (existing.qty * existing.avgPrice + qty * price) / newQty;
      const newTx = { id: Date.now(), type: "BUY", assetId, asset, qty, price, total: cost, date: new Date().toISOString() };
      return {
        ...state,
        wallet: state.wallet - cost,
        holdings: { ...state.holdings, [assetId]: { qty: newQty, avgPrice: newAvg, asset } },
        transactions: [newTx, ...state.transactions],
        totalInvested: state.totalInvested + cost,
      };
    }
    case "SELL": {
      const { assetId, qty, price } = action;
      const existing = state.holdings[assetId];
      if (!existing || existing.qty < qty) return state;
      const revenue = qty * price;
      const newQty = existing.qty - qty;
      const newHoldings = { ...state.holdings };
      if (newQty === 0) delete newHoldings[assetId];
      else newHoldings[assetId] = { ...existing, qty: newQty };
      const costBasis = qty * existing.avgPrice;
      const newTx = { id: Date.now(), type: "SELL", assetId, asset: existing.asset, qty, price, total: revenue, pnl: revenue - costBasis, date: new Date().toISOString() };
      return {
        ...state,
        wallet: state.wallet + revenue,
        holdings: newHoldings,
        transactions: [newTx, ...state.transactions],
        totalInvested: state.totalInvested - costBasis,
      };
    }
    case "TOGGLE_WATCHLIST": {
      const { assetId } = action;
      const wl = state.watchlist.includes(assetId)
        ? state.watchlist.filter((id) => id !== assetId)
        : [...state.watchlist, assetId];
      return { ...state, watchlist: wl };
    }
    default:
      return state;
  }
}

// ============================================================
// HOOKS
// ============================================================

function usePriceEngine(assets, dispatch) {
  useEffect(() => {
    const init = {};
    assets.forEach((a) => { init[a.id] = { price: a.price, change: a.change }; });
    dispatch({ type: "UPDATE_PRICES", prices: init });

    const interval = setInterval(() => {
      dispatch((prev) => {
        if (!prev) return null;
        const updated = { ...prev.prices };
        assets.forEach((a) => {
          const old = updated[a.id]?.price || a.price;
          const volatility = a.type === "crypto" ? 0.008 : 0.004;
          const delta = old * volatility * (Math.random() * 2 - 1);
          const newPrice = Math.max(old + delta, old * 0.001);
          const change = ((newPrice - a.price) / a.price) * 100;
          updated[a.id] = { price: newPrice, change };
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);
}

// ============================================================
// COMPONENTS
// ============================================================

const Sparkline = ({ change }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const noise = (Math.random() - 0.5) * 10;
    return 30 - (i / 9) * (change > 0 ? 15 : -15) + noise;
  });
  const path = pts.map((y, i) => `${i === 0 ? "M" : "L"}${(i / 9) * 60},${y}`).join(" ");
  const color = change >= 0 ? "#22c55e" : "#ef4444";
  return (
    <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const PriceTag = ({ price, change, type }) => (
  <div style={{ textAlign: "right" }}>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", fontWeight: 600, color: "#f5c842" }}>
      {formatCurrency(price, type)}
    </div>
    <div style={{ fontSize: "0.72rem", color: change >= 0 ? "#22c55e" : "#ef4444", fontWeight: 500 }}>
      {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
    </div>
  </div>
);

// ============================================================
// TRADINGVIEW CHART
// ============================================================

const TradingViewChart = ({ symbol, timeframe }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: timeframe === "1m" ? "1" : timeframe === "5m" ? "5" : timeframe === "15m" ? "15" : timeframe === "30m" ? "30" : timeframe === "1h" ? "60" : timeframe === "4h" ? "240" : timeframe === "1D" ? "D" : "W",
          timezone: "Asia/Kolkata",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0d0f14",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tv_chart_container",
          backgroundColor: "rgba(13, 15, 20, 1)",
          gridColor: "rgba(245, 200, 66, 0.05)",
          hide_side_toolbar: false,
        });
      }
    };
    containerRef.current.appendChild(script);
    const div = document.createElement("div");
    div.id = "tv_chart_container";
    div.style.height = "100%";
    div.style.width = "100%";
    containerRef.current.appendChild(div);
  }, [symbol, timeframe]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
};

// ============================================================
// LOGIN / ONBOARDING
// ============================================================

const LoginPage = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [capital, setCapital] = useState(500000);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please fill all fields"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    if (mode === "signup") {
      if (!name) { setError("Name required"); setLoading(false); return; }
      const users = JSON.parse(localStorage.getItem("invest_users") || "[]");
      if (users.find((u) => u.email === email)) { setError("Email already registered"); setLoading(false); return; }
      users.push({ email, password, name });
      localStorage.setItem("invest_users", JSON.stringify(users));
      onLogin({ email, name, capital });
    } else {
      const users = JSON.parse(localStorage.getItem("invest_users") || "[]");
      const user = users.find((u) => u.email === email && u.password === password);
      if (!user) { setError("Invalid credentials"); setLoading(false); return; }
      onLogin({ email, name: user.name });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080a0e", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative", overflow: "hidden" }}>
      {/* BG grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(245,200,66,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,200,66,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,200,66,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <div style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #f5c842 0%, #e8a020 100%)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d0f14" strokeWidth="2.5">
                <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
                <polyline points="16,7 22,7 22,13" />
              </svg>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "#f5c842", letterSpacing: "-0.02em" }}>InvestSimulator</span>
          </div>
          <p style={{ color: "#6b7280", fontSize: "0.82rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Virtual Trading • Real Learning</p>
        </div>

        {/* Card */}
        <div style={{ background: "#0d0f14", border: "1px solid rgba(245,200,66,0.15)", borderRadius: "16px", padding: "2rem", backdropFilter: "blur(20px)", boxShadow: "0 0 60px rgba(245,200,66,0.05)" }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "#080a0e", borderRadius: "8px", padding: "4px", marginBottom: "1.5rem" }}>
            {["login", "signup"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s", background: mode === m ? "#f5c842" : "transparent", color: mode === m ? "#0d0f14" : "#6b7280", textTransform: "capitalize" }}>
                {m}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mode === "signup" && (
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.4rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                  style={{ width: "100%", padding: "0.7rem 1rem", background: "#080a0e", border: "1px solid rgba(245,200,66,0.2)", borderRadius: "8px", color: "#f9fafb", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.4rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="trader@example.com"
                style={{ width: "100%", padding: "0.7rem 1rem", background: "#080a0e", border: "1px solid rgba(245,200,66,0.2)", borderRadius: "8px", color: "#f9fafb", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.4rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                style={{ width: "100%", padding: "0.7rem 1rem", background: "#080a0e", border: "1px solid rgba(245,200,66,0.2)", borderRadius: "8px", color: "#f9fafb", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>

            {mode === "signup" && (
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.6rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Starting Virtual Capital</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                  {CAPITAL_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setCapital(opt.value)}
                      style={{ padding: "0.5rem", borderRadius: "6px", border: capital === opt.value ? "1.5px solid #f5c842" : "1px solid rgba(245,200,66,0.15)", background: capital === opt.value ? "rgba(245,200,66,0.1)" : "transparent", color: capital === opt.value ? "#f5c842" : "#6b7280", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, transition: "all 0.15s" }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <div style={{ color: "#ef4444", fontSize: "0.8rem", background: "rgba(239,68,68,0.08)", padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}

            <button onClick={handleSubmit} disabled={loading}
              style={{ padding: "0.8rem", background: loading ? "rgba(245,200,66,0.5)" : "#f5c842", color: "#0d0f14", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.95rem", cursor: loading ? "default" : "pointer", transition: "all 0.2s", letterSpacing: "0.02em" }}>
              {loading ? "Authenticating..." : mode === "login" ? "Sign In to Trade" : "Create Account & Start Trading"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#374151", fontSize: "0.75rem", marginTop: "1.5rem" }}>
          Demo credentials: any email/password after signing up · Virtual money only · No real trades
        </p>
      </div>
    </div>
  );
};

// ============================================================
// SIDEBAR
// ============================================================

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "market", label: "Markets", icon: "◈" },
  { id: "chart", label: "Chart", icon: "◉" },
  { id: "portfolio", label: "Portfolio", icon: "◎" },
  { id: "watchlist", label: "Watchlist", icon: "◈" },
  { id: "history", label: "History", icon: "◐" },
  { id: "admin", label: "Admin", icon: "⊞" },
];

const Sidebar = ({ page, setPage, user, wallet, prices, holdings }) => {
  const portfolioValue = Object.entries(holdings).reduce((sum, [id, h]) => {
    const price = prices[id]?.price || h.asset.price;
    return sum + h.qty * price;
  }, 0);
  const total = wallet + portfolioValue;

  return (
    <div style={{ width: "220px", minHeight: "100vh", background: "#080a0e", borderRight: "1px solid rgba(245,200,66,0.08)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid rgba(245,200,66,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "28px", height: "28px", background: "#f5c842", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d0f14" strokeWidth="2.5"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17" /><polyline points="16,7 22,7 22,13" /></svg>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "#f5c842" }}>InvestSim</span>
        </div>
      </div>

      {/* Wallet summary */}
      <div style={{ padding: "1rem", borderBottom: "1px solid rgba(245,200,66,0.08)", background: "rgba(245,200,66,0.03)" }}>
        <div style={{ fontSize: "0.65rem", color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Portfolio Value</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", fontWeight: 700, color: "#f5c842" }}>₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
        <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.2rem" }}>Cash: ₹{wallet.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.75rem 0.5rem" }}>
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => setPage(item.id)}
            style={{ display: "flex", alignItems: "center", gap: "0.7rem", width: "100%", padding: "0.6rem 0.75rem", borderRadius: "8px", border: "none", cursor: "pointer", marginBottom: "0.15rem", background: page === item.id ? "rgba(245,200,66,0.1)" : "transparent", color: page === item.id ? "#f5c842" : "#6b7280", transition: "all 0.15s", textAlign: "left", fontSize: "0.85rem", fontWeight: page === item.id ? 600 : 400 }}>
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{item.icon}</span>
            {item.label}
            {page === item.id && <div style={{ marginLeft: "auto", width: "3px", height: "16px", background: "#f5c842", borderRadius: "2px" }} />}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: "1rem", borderTop: "1px solid rgba(245,200,66,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #f5c842, #e8a020)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "#0d0f14", flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#d1d5db", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "Trader"}</div>
            <div style={{ fontSize: "0.65rem", color: "#6b7280" }}>Virtual Account</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD PAGE
// ============================================================

const StatCard = ({ label, value, sub, color = "#f5c842", icon }) => (
  <div style={{ background: "#0d0f14", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "12px", padding: "1.25rem 1.5rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
      <span style={{ fontSize: "0.72rem", color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: "1.1rem" }}>{icon}</span>
    </div>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.4rem", fontWeight: 700, color, marginBottom: "0.2rem" }}>{value}</div>
    {sub && <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>{sub}</div>}
  </div>
);

const DashboardPage = ({ state, prices, setPage, setSelectedAsset }) => {
  const { wallet, holdings, transactions } = state;

  const portfolioValue = Object.entries(holdings).reduce((sum, [id, h]) => {
    const price = prices[id]?.price || h.asset.price;
    return sum + h.qty * price;
  }, 0);

  const totalCost = Object.entries(holdings).reduce((sum, [id, h]) => sum + h.qty * h.avgPrice, 0);
  const totalPnL = portfolioValue - totalCost;
  const pnlPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  const totalValue = wallet + portfolioValue;

  const winners = Object.entries(holdings).filter(([id, h]) => {
    const cur = prices[id]?.price || h.asset.price;
    return cur > h.avgPrice;
  }).length;

  const recentTx = transactions.slice(0, 5);

  // Top movers
  const topMovers = ALL_ASSETS.map((a) => ({ ...a, currentPrice: prices[a.id]?.price || a.price, currentChange: prices[a.id]?.change || a.change }))
    .sort((a, b) => Math.abs(b.currentChange) - Math.abs(a.currentChange))
    .slice(0, 6);

  return (
    <div style={{ padding: "1.5rem", overflowY: "auto", height: "100%" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f9fafb", margin: 0 }}>Dashboard</h1>
        <p style={{ color: "#6b7280", fontSize: "0.82rem", margin: "0.25rem 0 0" }}>Live portfolio overview · Virtual trading account</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard label="Total Portfolio" value={`₹${totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} sub="Cash + Holdings" icon="💼" />
        <StatCard label="Invested Value" value={`₹${portfolioValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} sub={`${Object.keys(holdings).length} positions`} icon="📈" />
        <StatCard label="Unrealized P&L" value={`${totalPnL >= 0 ? "+" : ""}₹${Math.abs(totalPnL).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} sub={`${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`} color={totalPnL >= 0 ? "#22c55e" : "#ef4444"} icon={totalPnL >= 0 ? "🟢" : "🔴"} />
        <StatCard label="Available Cash" value={`₹${wallet.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} sub="Ready to deploy" icon="💰" color="#60a5fa" />
        <StatCard label="Winning Positions" value={`${winners}/${Object.keys(holdings).length}`} sub="In profit" icon="🏆" color="#a78bfa" />
        <StatCard label="Total Trades" value={transactions.length} sub="All time" icon="📊" color="#34d399" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Top Movers */}
        <div style={{ background: "#0d0f14", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>Top Movers</div>
          {topMovers.map((a) => (
            <div key={a.id} onClick={() => { setSelectedAsset(a); setPage("chart"); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: "32px", height: "32px", background: a.type === "crypto" ? "rgba(139,92,246,0.15)" : "rgba(245,200,66,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: a.type === "crypto" ? "#a78bfa" : "#f5c842" }}>
                  {a.symbol.split(":")[1]?.slice(0, 3)}
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#f9fafb" }}>{a.name.split(" ")[0]}</div>
                  <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>{a.type === "stock" ? "NSE" : "CRYPTO"}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Sparkline change={a.currentChange} />
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: "#f5c842" }}>{formatCurrency(a.currentPrice, a.type)}</div>
                  <div style={{ fontSize: "0.68rem", color: a.currentChange >= 0 ? "#22c55e" : "#ef4444" }}>{a.currentChange >= 0 ? "▲" : "▼"} {Math.abs(a.currentChange).toFixed(2)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Trades */}
        <div style={{ background: "#0d0f14", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>Recent Trades</div>
          {recentTx.length === 0 ? (
            <div style={{ textAlign: "center", color: "#4b5563", padding: "2rem 0", fontSize: "0.85rem" }}>No trades yet. Start trading!</div>
          ) : recentTx.map((tx) => (
            <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "4px", background: tx.type === "BUY" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: tx.type === "BUY" ? "#22c55e" : "#ef4444" }}>{tx.type}</span>
                  <span style={{ fontSize: "0.82rem", color: "#f9fafb" }}>{tx.asset?.name?.split(" ")[0]}</span>
                </div>
                <div style={{ fontSize: "0.68rem", color: "#6b7280", marginTop: "0.1rem" }}>{tx.qty} units @ {formatCurrency(tx.price, tx.asset?.type)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#f5c842" }}>₹{tx.total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                {tx.pnl !== undefined && <div style={{ fontSize: "0.68rem", color: tx.pnl >= 0 ? "#22c55e" : "#ef4444" }}>{tx.pnl >= 0 ? "+" : ""}₹{Math.abs(tx.pnl).toFixed(0)}</div>}
              </div>
            </div>
          ))}
          {recentTx.length > 0 && (
            <button onClick={() => setPage("history")} style={{ marginTop: "0.75rem", width: "100%", padding: "0.5rem", background: "transparent", border: "1px solid rgba(245,200,66,0.15)", borderRadius: "6px", color: "#f5c842", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>
              View All Trades →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MARKET PAGE
// ============================================================

const MarketPage = ({ prices, watchlist, dispatch, setSelectedAsset, setPage }) => {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");

  const filtered = ALL_ASSETS
    .filter((a) => tab === "all" || (tab === "stocks" ? a.type === "stock" : a.type === "crypto"))
    .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase()))
    .map((a) => ({ ...a, curPrice: prices[a.id]?.price || a.price, curChange: prices[a.id]?.change || a.change }))
    .sort((a, b) => {
      if (sort === "change") return Math.abs(b.curChange) - Math.abs(a.curChange);
      if (sort === "price") return b.curPrice - a.curPrice;
      return a.name.localeCompare(b.name);
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(245,200,66,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f9fafb", margin: 0 }}>Markets</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["all", "stocks", "crypto"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "0.35rem 0.75rem", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, background: tab === t ? "#f5c842" : "rgba(245,200,66,0.08)", color: tab === t ? "#0d0f14" : "#9ca3af", textTransform: "capitalize" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets..."
            style={{ flex: 1, padding: "0.55rem 1rem", background: "#0d0f14", border: "1px solid rgba(245,200,66,0.15)", borderRadius: "8px", color: "#f9fafb", fontSize: "0.85rem", outline: "none", fontFamily: "inherit" }} />
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            style={{ padding: "0.55rem 0.75rem", background: "#0d0f14", border: "1px solid rgba(245,200,66,0.15)", borderRadius: "8px", color: "#9ca3af", fontSize: "0.82rem", outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
            <option value="name">Sort: Name</option>
            <option value="change">Sort: % Change</option>
            <option value="price">Sort: Price</option>
          </select>
        </div>
      </div>

      {/* Table Header */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 80px 80px", gap: "0.5rem", padding: "0.5rem 1.5rem", fontSize: "0.65rem", color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid rgba(245,200,66,0.06)" }}>
        <span>Asset</span><span style={{ textAlign: "right" }}>Price</span><span style={{ textAlign: "right" }}>24h %</span><span style={{ textAlign: "center" }}>Chart</span><span style={{ textAlign: "center" }}>Watch</span>
      </div>

      {/* Asset List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.map((asset) => {
          const isWatched = watchlist.includes(asset.id);
          return (
            <div key={asset.id}
              onClick={() => { setSelectedAsset(asset); setPage("chart"); }}
              style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 80px 80px", gap: "0.5rem", padding: "0.75rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", transition: "background 0.15s", alignItems: "center" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(245,200,66,0.03)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: asset.type === "crypto" ? "rgba(139,92,246,0.12)" : "rgba(245,200,66,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 700, color: asset.type === "crypto" ? "#a78bfa" : "#f5c842", flexShrink: 0 }}>
                  {asset.symbol.split(":")[1]?.replace("USDT", "").slice(0, 4)}
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f9fafb" }}>{asset.name}</div>
                  <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>{asset.symbol} · {asset.sector}</div>
                </div>
              </div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: "#f5c842", fontWeight: 600 }}>
                {formatCurrency(asset.curPrice, asset.type)}
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: asset.curChange >= 0 ? "#22c55e" : "#ef4444", background: asset.curChange >= 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                  {asset.curChange >= 0 ? "+" : ""}{asset.curChange.toFixed(2)}%
                </span>
              </div>
              <div style={{ textAlign: "center" }}><Sparkline change={asset.curChange} /></div>
              <div style={{ textAlign: "center" }}>
                <button onClick={(e) => { e.stopPropagation(); dispatch({ type: "TOGGLE_WATCHLIST", assetId: asset.id }); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: isWatched ? "#f5c842" : "#374151", transition: "color 0.15s" }}>
                  {isWatched ? "★" : "☆"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// CHART / TRADING PAGE
// ============================================================

const TradingPage = ({ selectedAsset, state, prices, dispatch }) => {
  const [timeframe, setTimeframe] = useState("1D");
  const [tradeType, setTradeType] = useState("BUY");
  const [qty, setQty] = useState("");
  const [orderType, setOrderType] = useState("MARKET");
  const [msg, setMsg] = useState(null);

  const asset = selectedAsset || ALL_ASSETS[0];
  const price = prices[asset.id]?.price || asset.price;
  const change = prices[asset.id]?.change || asset.change;
  const holding = state.holdings[asset.id];
  const total = parseFloat(qty || 0) * price;
  const isWatched = state.watchlist.includes(asset.id);

  const executeTrade = () => {
    const q = parseFloat(qty);
    if (!q || q <= 0) { setMsg({ type: "error", text: "Enter a valid quantity" }); return; }
    if (tradeType === "BUY" && total > state.wallet) { setMsg({ type: "error", text: "Insufficient balance" }); return; }
    if (tradeType === "SELL" && (!holding || holding.qty < q)) { setMsg({ type: "error", text: "Insufficient holdings" }); return; }
    dispatch({ type: tradeType, assetId: asset.id, qty: q, price, asset });
    setMsg({ type: "success", text: `${tradeType} order executed: ${q} units @ ${formatCurrency(price, asset.type)}` });
    setQty("");
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Chart Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Asset Header */}
        <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(245,200,66,0.08)", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div style={{ width: "36px", height: "36px", background: asset.type === "crypto" ? "rgba(139,92,246,0.15)" : "rgba(245,200,66,0.1)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: asset.type === "crypto" ? "#a78bfa" : "#f5c842" }}>
              {asset.symbol.split(":")[1]?.replace("USDT", "").slice(0, 4)}
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f9fafb" }}>{asset.name}</div>
              <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>{asset.symbol} · {asset.sector}</div>
            </div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.3rem", fontWeight: 700, color: "#f5c842" }}>{formatCurrency(price, asset.type)}</div>
          <div style={{ fontSize: "0.85rem", color: change >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(3)}%</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.3rem" }}>
            {TIMEFRAMES.map((tf) => (
              <button key={tf} onClick={() => setTimeframe(tf)}
                style={{ padding: "0.25rem 0.5rem", borderRadius: "5px", border: "none", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600, background: timeframe === tf ? "rgba(245,200,66,0.15)" : "transparent", color: timeframe === tf ? "#f5c842" : "#4b5563", transition: "all 0.15s" }}>
                {tf}
              </button>
            ))}
          </div>
          <button onClick={() => dispatch({ type: "TOGGLE_WATCHLIST", assetId: asset.id })}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: isWatched ? "#f5c842" : "#374151" }}>
            {isWatched ? "★" : "☆"}
          </button>
        </div>

        {/* TradingView Chart */}
        <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          <TradingViewChart symbol={asset.symbol} timeframe={timeframe} />
        </div>
      </div>

      {/* Trading Panel */}
      <div style={{ width: "300px", borderLeft: "1px solid rgba(245,200,66,0.08)", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "1rem", overflowY: "auto" }}>
          {/* Buy/Sell Toggle */}
          <div style={{ display: "flex", background: "#080a0e", borderRadius: "8px", padding: "3px", marginBottom: "1rem" }}>
            {["BUY", "SELL"].map((t) => (
              <button key={t} onClick={() => setTradeType(t)}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", transition: "all 0.2s", background: tradeType === t ? (t === "BUY" ? "#22c55e" : "#ef4444") : "transparent", color: tradeType === t ? "#fff" : "#6b7280" }}>
                {t}
              </button>
            ))}
          </div>

          {/* Order Type */}
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ fontSize: "0.68rem", color: "#6b7280", display: "block", marginBottom: "0.3rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Order Type</label>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {["MARKET", "LIMIT"].map((t) => (
                <button key={t} onClick={() => setOrderType(t)}
                  style={{ flex: 1, padding: "0.4rem", borderRadius: "6px", border: orderType === t ? "1.5px solid #f5c842" : "1px solid rgba(245,200,66,0.15)", background: orderType === t ? "rgba(245,200,66,0.1)" : "transparent", color: orderType === t ? "#f5c842" : "#6b7280", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div style={{ background: "#080a0e", borderRadius: "8px", padding: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.65rem", color: "#6b7280", marginBottom: "0.2rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Market Price</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1rem", color: "#f5c842", fontWeight: 700 }}>{formatCurrency(price, asset.type)}</div>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ fontSize: "0.68rem", color: "#6b7280", display: "block", marginBottom: "0.3rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Quantity</label>
            <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0.00" min="0" step="any"
              style={{ width: "100%", padding: "0.65rem 1rem", background: "#080a0e", border: "1px solid rgba(245,200,66,0.2)", borderRadius: "8px", color: "#f9fafb", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontFamily: "'JetBrains Mono', monospace" }} />
            {/* Quick qty buttons */}
            {tradeType === "BUY" && (
              <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.4rem" }}>
                {[25, 50, 75, 100].map((pct) => (
                  <button key={pct} onClick={() => setQty(((state.wallet * pct / 100) / price).toFixed(asset.type === "crypto" ? 6 : 0))}
                    style={{ flex: 1, padding: "0.25rem", borderRadius: "4px", border: "1px solid rgba(245,200,66,0.1)", background: "transparent", color: "#6b7280", cursor: "pointer", fontSize: "0.68rem" }}>
                    {pct}%
                  </button>
                ))}
              </div>
            )}
            {tradeType === "SELL" && holding && (
              <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.4rem" }}>
                {[25, 50, 75, 100].map((pct) => (
                  <button key={pct} onClick={() => setQty((holding.qty * pct / 100).toFixed(asset.type === "crypto" ? 6 : 0))}
                    style={{ flex: 1, padding: "0.25rem", borderRadius: "4px", border: "1px solid rgba(245,200,66,0.1)", background: "transparent", color: "#6b7280", cursor: "pointer", fontSize: "0.68rem" }}>
                    {pct}%
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div style={{ background: "rgba(245,200,66,0.04)", borderRadius: "8px", padding: "0.75rem", marginBottom: "1rem", border: "1px solid rgba(245,200,66,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#6b7280", marginBottom: "0.3rem" }}>
              <span>Est. Total</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#f5c842", fontWeight: 600 }}>₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#6b7280" }}>
              <span>Available</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9ca3af" }}>₹{state.wallet.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {/* Message */}
          {msg && (
            <div style={{ padding: "0.6rem 0.75rem", borderRadius: "6px", marginBottom: "0.75rem", fontSize: "0.75rem", background: msg.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msg.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, color: msg.type === "success" ? "#22c55e" : "#ef4444" }}>
              {msg.text}
            </div>
          )}

          <button onClick={executeTrade}
            style={{ width: "100%", padding: "0.8rem", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s", background: tradeType === "BUY" ? "#22c55e" : "#ef4444", color: "#fff" }}>
            {tradeType === "BUY" ? "Place Buy Order" : "Place Sell Order"}
          </button>

          {/* Holding Info */}
          {holding && (
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#080a0e", borderRadius: "8px", border: "1px solid rgba(245,200,66,0.08)" }}>
              <div style={{ fontSize: "0.68rem", color: "#6b7280", marginBottom: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Your Position</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "#6b7280" }}>Qty</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#f9fafb" }}>{holding.qty}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "#6b7280" }}>Avg Price</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#f9fafb" }}>{formatCurrency(holding.avgPrice, asset.type)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                <span style={{ color: "#6b7280" }}>P&L</span>
                {(() => {
                  const pnl = (price - holding.avgPrice) * holding.qty;
                  return <span style={{ fontFamily: "'JetBrains Mono', monospace", color: pnl >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toFixed(2)}</span>;
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PORTFOLIO PAGE
// ============================================================

const PortfolioPage = ({ state, prices, setSelectedAsset, setPage }) => {
  const { holdings, wallet, totalInvested } = state;

  const enriched = Object.entries(holdings).map(([id, h]) => {
    const curPrice = prices[id]?.price || h.asset.price;
    const curValue = curPrice * h.qty;
    const costBasis = h.avgPrice * h.qty;
    const pnl = curValue - costBasis;
    const pnlPct = (pnl / costBasis) * 100;
    return { id, ...h, curPrice, curValue, costBasis, pnl, pnlPct };
  });

  const totalPortValue = enriched.reduce((sum, e) => sum + e.curValue, 0);
  const totalCost = enriched.reduce((sum, e) => sum + e.costBasis, 0);
  const totalPnL = totalPortValue - totalCost;

  return (
    <div style={{ padding: "1.5rem", overflowY: "auto", height: "100%" }}>
      <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f9fafb", margin: "0 0 0.25rem" }}>Portfolio</h1>
      <p style={{ color: "#6b7280", fontSize: "0.82rem", margin: "0 0 1.5rem" }}>Your investment positions</p>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Portfolio Value", val: `₹${totalPortValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, color: "#f5c842" },
          { label: "Total Cost", val: `₹${totalCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, color: "#9ca3af" },
          { label: "Total P&L", val: `${totalPnL >= 0 ? "+" : ""}₹${Math.abs(totalPnL).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, color: totalPnL >= 0 ? "#22c55e" : "#ef4444" },
          { label: "Cash Available", val: `₹${wallet.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, color: "#60a5fa" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#0d0f14", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "10px", padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: "0.65rem", color: "#6b7280", marginBottom: "0.4rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {enriched.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#0d0f14", borderRadius: "12px", border: "1px solid rgba(245,200,66,0.1)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
          <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>No holdings yet. Go to Markets to start trading!</div>
        </div>
      ) : (
        <div style={{ background: "#0d0f14", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: "0.5rem", padding: "0.75rem 1.25rem", fontSize: "0.65rem", color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid rgba(245,200,66,0.06)" }}>
            <span>Asset</span><span style={{ textAlign: "right" }}>Qty</span><span style={{ textAlign: "right" }}>Avg Price</span><span style={{ textAlign: "right" }}>Cur Price</span><span style={{ textAlign: "right" }}>Value</span><span style={{ textAlign: "right" }}>P&L</span>
          </div>
          {enriched.map((h) => (
            <div key={h.id} onClick={() => { setSelectedAsset(h.asset); setPage("chart"); }}
              style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: "0.5rem", padding: "0.9rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", alignItems: "center" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(245,200,66,0.03)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: h.asset.type === "crypto" ? "rgba(139,92,246,0.12)" : "rgba(245,200,66,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", fontWeight: 700, color: h.asset.type === "crypto" ? "#a78bfa" : "#f5c842" }}>
                  {h.asset.symbol.split(":")[1]?.replace("USDT", "").slice(0, 3)}
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#f9fafb" }}>{h.asset.name}</div>
                  <div style={{ fontSize: "0.65rem", color: "#6b7280" }}>{h.asset.type === "stock" ? "NSE" : "CRYPTO"}</div>
                </div>
              </div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", color: "#d1d5db" }}>{h.qty}</div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: "#9ca3af" }}>{formatCurrency(h.avgPrice, h.asset.type)}</div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", color: "#f5c842" }}>{formatCurrency(h.curPrice, h.asset.type)}</div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", color: "#f9fafb" }}>₹{h.curValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: h.pnl >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{h.pnl >= 0 ? "+" : ""}₹{Math.abs(h.pnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                <div style={{ fontSize: "0.65rem", color: h.pnlPct >= 0 ? "#16a34a" : "#dc2626" }}>{h.pnlPct >= 0 ? "+" : ""}{h.pnlPct.toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asset Allocation */}
      {enriched.length > 0 && (
        <div style={{ marginTop: "1.5rem", background: "#0d0f14", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>Allocation</div>
          {enriched.map((h) => {
            const pct = totalPortValue > 0 ? (h.curValue / totalPortValue) * 100 : 0;
            return (
              <div key={h.id} style={{ marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "#d1d5db" }}>{h.asset.name}</span>
                  <span style={{ color: "#6b7280" }}>{pct.toFixed(1)}%</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: h.asset.type === "crypto" ? "#a78bfa" : "#f5c842", borderRadius: "2px", transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================
// WATCHLIST PAGE
// ============================================================

const WatchlistPage = ({ state, prices, dispatch, setSelectedAsset, setPage }) => {
  const watched = ALL_ASSETS.filter((a) => state.watchlist.includes(a.id)).map((a) => ({
    ...a, curPrice: prices[a.id]?.price || a.price, curChange: prices[a.id]?.change || a.change,
  }));

  return (
    <div style={{ padding: "1.5rem", overflowY: "auto", height: "100%" }}>
      <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f9fafb", margin: "0 0 0.25rem" }}>Watchlist</h1>
      <p style={{ color: "#6b7280", fontSize: "0.82rem", margin: "0 0 1.5rem" }}>Track your favourite assets</p>

      {watched.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#0d0f14", borderRadius: "12px", border: "1px solid rgba(245,200,66,0.1)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>★</div>
          <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>No assets in watchlist. Star any asset in Markets to add it here.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {watched.map((a) => (
            <div key={a.id} style={{ background: "#0d0f14", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "12px", padding: "1.25rem", cursor: "pointer", transition: "border-color 0.15s" }}
              onClick={() => { setSelectedAsset(a); setPage("chart"); }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(245,200,66,0.3)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(245,200,66,0.1)"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: "40px", height: "40px", background: a.type === "crypto" ? "rgba(139,92,246,0.12)" : "rgba(245,200,66,0.08)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: a.type === "crypto" ? "#a78bfa" : "#f5c842" }}>
                    {a.symbol.split(":")[1]?.replace("USDT", "").slice(0, 4)}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#f9fafb" }}>{a.name}</div>
                    <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>{a.sector}</div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); dispatch({ type: "TOGGLE_WATCHLIST", assetId: a.id }); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#f5c842", fontSize: "1rem" }}>★</button>
              </div>
              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", fontWeight: 700, color: "#f5c842" }}>{formatCurrency(a.curPrice, a.type)}</div>
                  <div style={{ fontSize: "0.72rem", color: a.curChange >= 0 ? "#22c55e" : "#ef4444", marginTop: "0.1rem" }}>{a.curChange >= 0 ? "▲" : "▼"} {Math.abs(a.curChange).toFixed(2)}%</div>
                </div>
                <Sparkline change={a.curChange} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// HISTORY PAGE
// ============================================================

const HistoryPage = ({ transactions }) => {
  const totalBuy = transactions.filter((t) => t.type === "BUY").reduce((s, t) => s + t.total, 0);
  const totalSell = transactions.filter((t) => t.type === "SELL").reduce((s, t) => s + t.total, 0);
  const realizedPnL = transactions.filter((t) => t.pnl !== undefined).reduce((s, t) => s + t.pnl, 0);

  return (
    <div style={{ padding: "1.5rem", overflowY: "auto", height: "100%" }}>
      <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f9fafb", margin: "0 0 0.25rem" }}>Trade History</h1>
      <p style={{ color: "#6b7280", fontSize: "0.82rem", margin: "0 0 1.5rem" }}>Complete record of all your simulated trades</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "#0d0f14", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "10px", padding: "1rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#6b7280", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Bought</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", fontWeight: 700, color: "#22c55e" }}>₹{totalBuy.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
        </div>
        <div style={{ background: "#0d0f14", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "1rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#6b7280", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Sold</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", fontWeight: 700, color: "#ef4444" }}>₹{totalSell.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
        </div>
        <div style={{ background: "#0d0f14", border: `1px solid ${realizedPnL >= 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: "10px", padding: "1rem" }}>
          <div style={{ fontSize: "0.65rem", color: "#6b7280", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Realized P&L</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", fontWeight: 700, color: realizedPnL >= 0 ? "#22c55e" : "#ef4444" }}>{realizedPnL >= 0 ? "+" : ""}₹{Math.abs(realizedPnL).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "#0d0f14", borderRadius: "12px", border: "1px solid rgba(245,200,66,0.1)" }}>
          <div style={{ color: "#6b7280" }}>No trades yet</div>
        </div>
      ) : (
        <div style={{ background: "#0d0f14", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 2fr 1fr 1fr 1fr 1fr", gap: "0.5rem", padding: "0.7rem 1.25rem", fontSize: "0.65rem", color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid rgba(245,200,66,0.06)" }}>
            <span>Type</span><span>Asset</span><span style={{ textAlign: "right" }}>Qty</span><span style={{ textAlign: "right" }}>Price</span><span style={{ textAlign: "right" }}>Total</span><span style={{ textAlign: "right" }}>P&L</span>
          </div>
          {transactions.map((tx) => (
            <div key={tx.id} style={{ display: "grid", gridTemplateColumns: "auto 2fr 1fr 1fr 1fr 1fr", gap: "0.5rem", padding: "0.8rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "4px", background: tx.type === "BUY" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: tx.type === "BUY" ? "#22c55e" : "#ef4444" }}>{tx.type}</span>
              <div>
                <div style={{ fontSize: "0.82rem", color: "#f9fafb" }}>{tx.asset?.name}</div>
                <div style={{ fontSize: "0.65rem", color: "#6b7280" }}>{new Date(tx.date).toLocaleDateString("en-IN")} {new Date(tx.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "#d1d5db" }}>{tx.qty}</div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: "#9ca3af" }}>{formatCurrency(tx.price, tx.asset?.type)}</div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", color: "#f5c842" }}>₹{tx.total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
              <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: tx.pnl !== undefined ? (tx.pnl >= 0 ? "#22c55e" : "#ef4444") : "#4b5563", fontWeight: tx.pnl !== undefined ? 600 : 400 }}>
                {tx.pnl !== undefined ? `${tx.pnl >= 0 ? "+" : ""}₹${Math.abs(tx.pnl).toFixed(0)}` : "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// ADMIN PAGE
// ============================================================

const AdminPage = ({ state, dispatch, onLogout }) => {
  const [resetConfirm, setResetConfirm] = useState(false);
  const users = JSON.parse(localStorage.getItem("invest_users") || "[]");

  const handleReset = () => {
    if (resetConfirm) {
      localStorage.removeItem(`invest_${state.user.email}`);
      onLogout();
    } else setResetConfirm(true);
  };

  return (
    <div style={{ padding: "1.5rem", overflowY: "auto", height: "100%" }}>
      <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f9fafb", margin: "0 0 0.25rem" }}>Admin Panel</h1>
      <p style={{ color: "#6b7280", fontSize: "0.82rem", margin: "0 0 1.5rem" }}>Simulation management & controls</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* System Stats */}
        <div style={{ background: "#0d0f14", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>System Info</div>
          {[
            ["Platform", "InvestSimulator v1.0"],
            ["Mode", "Virtual Trading (Demo)"],
            ["Active User", state.user?.email],
            ["Assets: NSE Stocks", NSE_STOCKS.length],
            ["Assets: Crypto", CRYPTO_ASSETS.length],
            ["Price Engine", "Live Simulation (3s interval)"],
            ["Chart Provider", "TradingView Widgets"],
            ["Data Storage", "localStorage (Browser)"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.8rem" }}>
              <span style={{ color: "#6b7280" }}>{k}</span>
              <span style={{ color: "#d1d5db", fontFamily: k === "Active User" ? "monospace" : "inherit", fontSize: "0.75rem" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Account Management */}
        <div>
          <div style={{ background: "#0d0f14", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>Account Controls</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button onClick={handleReset}
                style={{ padding: "0.7rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", background: resetConfirm ? "#ef4444" : "rgba(239,68,68,0.1)", color: resetConfirm ? "#fff" : "#ef4444", border: "1px solid rgba(239,68,68,0.3)", transition: "all 0.2s" }}>
                {resetConfirm ? "⚠️ Confirm Reset (Logs you out)" : "Reset Account & Balance"}
              </button>
              {resetConfirm && <button onClick={() => setResetConfirm(false)} style={{ padding: "0.5rem", background: "transparent", border: "1px solid rgba(245,200,66,0.15)", borderRadius: "6px", color: "#6b7280", cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>}
              <button onClick={onLogout}
                style={{ padding: "0.7rem 1rem", borderRadius: "8px", border: "1px solid rgba(245,200,66,0.15)", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", background: "transparent", color: "#9ca3af", transition: "all 0.2s" }}>
                Sign Out
              </button>
            </div>
          </div>

          <div style={{ background: "#0d0f14", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>Registered Users ({users.length})</div>
            {users.length === 0 ? <div style={{ color: "#4b5563", fontSize: "0.82rem" }}>No users found</div> : users.map((u, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.8rem" }}>
                <span style={{ color: "#d1d5db" }}>{u.name}</span>
                <span style={{ color: "#6b7280", fontFamily: "monospace", fontSize: "0.72rem" }}>{u.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backend Architecture Info */}
      <div style={{ marginTop: "1.5rem", background: "#0d0f14", border: "1px solid rgba(245,200,66,0.1)", borderRadius: "12px", padding: "1.25rem" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>Production Backend Architecture (Spring Boot)</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "#4b5563", lineHeight: 1.8, background: "#080a0e", padding: "1rem", borderRadius: "8px" }}>
          <span style={{ color: "#f5c842" }}>Controllers:</span> <span style={{ color: "#9ca3af" }}>AuthController, MarketController, TradeController, PortfolioController, AdminController</span>{"\n"}
          <span style={{ color: "#f5c842" }}>Services:</span> <span style={{ color: "#9ca3af" }}>UserService, TradingService, PriceSimulationService, PortfolioService</span>{"\n"}
          <span style={{ color: "#f5c842" }}>Repositories:</span> <span style={{ color: "#9ca3af" }}>UserRepo, AssetRepo, TransactionRepo, HoldingRepo, WatchlistRepo</span>{"\n"}
          <span style={{ color: "#f5c842" }}>Security:</span> <span style={{ color: "#9ca3af" }}>JWT Auth, BCrypt passwords, CORS, input validation</span>{"\n"}
          <span style={{ color: "#f5c842" }}>Database:</span> <span style={{ color: "#9ca3af" }}>MySQL 8 with HikariCP connection pool, JPA/Hibernate ORM</span>{"\n"}
          <span style={{ color: "#f5c842" }}>APIs:</span> <span style={{ color: "#9ca3af" }}>POST /auth/signup, /auth/login | GET /market/assets | POST /trade/buy, /trade/sell | GET /portfolio/{"{userId}"}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// TICKER BAR
// ============================================================

const TickerBar = ({ prices }) => {
  const items = ALL_ASSETS.slice(0, 15).map((a) => ({
    ...a, curPrice: prices[a.id]?.price || a.price, curChange: prices[a.id]?.change || a.change,
  }));
  const ticker = [...items, ...items];

  return (
    <div style={{ background: "#080a0e", borderBottom: "1px solid rgba(245,200,66,0.08)", height: "32px", overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", height: "100%", animation: "ticker 45s linear infinite", whiteSpace: "nowrap" }}>
        {ticker.map((a, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0 1.5rem", fontSize: "0.7rem", borderRight: "1px solid rgba(245,200,66,0.06)" }}>
            <span style={{ color: "#6b7280", fontWeight: 600 }}>{a.symbol.split(":")[1]?.replace("USDT", "")}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#f5c842" }}>{formatCurrency(a.curPrice, a.type)}</span>
            <span style={{ color: a.curChange >= 0 ? "#22c55e" : "#ef4444" }}>{a.curChange >= 0 ? "▲" : "▼"}{Math.abs(a.curChange).toFixed(2)}%</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [prices, setPrices] = useState({});
  const [page, setPage] = useState("dashboard");
  const [selectedAsset, setSelectedAsset] = useState(ALL_ASSETS[0]);

  // Price engine - updates prices periodically
  useEffect(() => {
    const init = {};
    ALL_ASSETS.forEach((a) => { init[a.id] = { price: a.price, change: a.change }; });
    setPrices(init);

    const interval = setInterval(() => {
      setPrices((prev) => {
        const updated = { ...prev };
        ALL_ASSETS.forEach((a) => {
          const old = updated[a.id]?.price || a.price;
          const volatility = a.type === "crypto" ? 0.006 : 0.003;
          const delta = old * volatility * (Math.random() * 2 - 1);
          const newPrice = Math.max(old + delta, old * 0.01);
          const change = ((newPrice - a.price) / a.price) * 100;
          updated[a.id] = { price: newPrice, change };
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Persist state
  useEffect(() => {
    if (state.user) {
      const toSave = { wallet: state.wallet, holdings: state.holdings, transactions: state.transactions, watchlist: state.watchlist, totalInvested: state.totalInvested };
      localStorage.setItem(`invest_${state.user.email}`, JSON.stringify(toSave));
    }
  }, [state]);

  const handleLogin = (user) => {
    dispatch({ type: "LOGIN", user, capital: user.capital || 500000 });
  };

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    setPage("dashboard");
  };

  // Inject fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=JetBrains+Mono:wght@400;600;700&family=Sora:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    document.body.style.margin = "0";
    document.body.style.fontFamily = "'Sora', sans-serif";
    document.body.style.background = "#080a0e";
  }, []);

  if (!state.user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage state={state} prices={prices} setPage={setPage} setSelectedAsset={setSelectedAsset} />;
      case "market": return <MarketPage prices={prices} watchlist={state.watchlist} dispatch={dispatch} setSelectedAsset={setSelectedAsset} setPage={setPage} />;
      case "chart": return <TradingPage selectedAsset={selectedAsset} state={state} prices={prices} dispatch={dispatch} />;
      case "portfolio": return <PortfolioPage state={state} prices={prices} setSelectedAsset={setSelectedAsset} setPage={setPage} />;
      case "watchlist": return <WatchlistPage state={state} prices={prices} dispatch={dispatch} setSelectedAsset={setSelectedAsset} setPage={setPage} />;
      case "history": return <HistoryPage transactions={state.transactions} />;
      case "admin": return <AdminPage state={state} dispatch={dispatch} onLogout={handleLogout} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#080a0e", color: "#f9fafb", fontFamily: "'Sora', sans-serif" }}>
      <TickerBar prices={prices} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar page={page} setPage={setPage} user={state.user} wallet={state.wallet} prices={prices} holdings={state.holdings} />
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
