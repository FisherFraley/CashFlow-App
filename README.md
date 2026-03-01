# Cash Flow Planner

A personal finance web app for visualizing how your money flows — from income through expenses, savings, and one-time purchases — using an interactive Sankey diagram.

Built with React, TypeScript, and Vite. Inspired by tools like Monarch Money.

## Features

- **Sankey Diagram** — Interactive cash flow visualization powered by Plotly.js showing income sources flowing through to expenses, savings, and purchases
- **Monthly Breakdown** — Category-by-category spending view with progress bars and per-item detail
- **Natural Language Chat** — Add budget items conversationally (e.g., "rent 1500 monthly", "coffee 5 today") — no `$` sign required
- **Sidebar Budget Manager** — Traditional form-based editing for income, expenses, savings, and one-time items
- **Light & Dark Mode** — Claude-inspired warm amber/terracotta theme with glass morphism design
- **Data Persistence** — Budget saved to localStorage with JSON import/export
- **Responsive Layout** — Collapsible sidebar and chat panel with smooth transitions

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** — dev server and build tool
- **Plotly.js** via `react-plotly.js` — Sankey diagram rendering
- **CSS Modules** — scoped styling with CSS custom properties for theming
- **Vitest** — 61 unit tests across parser, calculations, Sankey transform, and utilities
- **Lucide React** — icon library

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
  components/
    AppContent.tsx          # Main orchestrator with state management
    chat/                   # Chat panel, input, message bubbles, preview cards
    dashboard/              # Dashboard, SankeyChart, SummaryCards, MonthlyBreakdown, ViewNav
    forms/                  # BudgetManager, BudgetSection, BudgetItemForm, ItemList
    layout/                 # Layout (CSS Grid shell), Header
    shared/                 # Button, Card, Modal, WelcomeModal, EmptyState
  constants/
    categories.ts           # Category lists for each budget type
    sampleData.ts           # Demo budget data
  context/
    BudgetContext.tsx        # Budget state provider with localStorage
    ThemeContext.tsx         # Light/dark theme provider
  hooks/
    useLocalStorage.ts      # Generic localStorage hook
  types/
    index.ts                # TypeScript interfaces (BudgetItem, ChatMessage, Summary, etc.)
  utils/
    calculations.ts         # Summary calculations (income, expenses, savings rate, net cash flow)
    chatParser.ts           # Natural language parser for budget items
    formatCurrency.ts       # Currency formatting and frequency-to-monthly conversion
    sankeyTransform.ts      # Builds Plotly Sankey data from budget items
  test/
    setup.ts                # Vitest setup with jest-dom matchers
```

## Chat Parser

The chat panel uses a regex-based natural language parser — no AI API required. It supports:

- **Amounts**: `$1500`, `1500`, `400 dollars`, `20 bucks`, `costs 500`
- **Frequencies**: `monthly`, `weekly`, `biweekly`, `yearly`, `one-time`, `today`
- **Auto-categorization**: 80+ keyword mappings (e.g., "rent" -> Housing, "netflix" -> Subscriptions, "401k" -> Retirement)
- **Updates**: "update rent to 1600" matches existing items

## Deployment

The app is deployed via [Vercel](https://vercel.com). Push to `main` triggers automatic deployment.

## License

MIT
