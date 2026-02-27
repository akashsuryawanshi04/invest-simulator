# Contributing to InvestSimulator

Thank you for your interest in contributing! 🎉

## 🔧 Development Setup

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/invest-simulator.git`
3. Follow the setup guide in `docs/SETUP_GUIDE.md`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## 📋 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add limit order support
fix: correct P&L calculation on partial sell
docs: update API reference table
style: fix linting warnings in TradingPage
refactor: extract price formatter utility
test: add unit tests for TradingService
chore: update dependencies
```

## 🧪 Testing

```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && ./mvnw test
```

## 📬 Pull Request Process

1. Ensure your code passes all linting and tests
2. Update the README if you add new features
3. Reference any related issues: `Closes #42`
4. Request review from a maintainer

## 🐛 Bug Reports

Open an issue with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable

## 💡 Feature Requests

Open an issue with:
- Use case description
- Proposed solution
- Any alternative approaches considered

---

## ⚠️ Important

This is an **educational trading simulator only**. Please do not:
- Connect real brokerage accounts
- Add real money processing
- Integrate real trading APIs for order execution

The platform is designed purely for learning investment concepts safely.
