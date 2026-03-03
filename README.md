💰 MyMoney Pro - Daily Financial Management

<div align="center">

![MyMoney Pro](public/app-icon.png)

**A modern, AI-powered personal finance management application for budget-conscious individuals**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Cholarajarp/MyMoney_Pro_Daily_Financial_Management)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/python-3.11+-3776ab.svg)](https://www.python.org/)
[![Deploy to Render](https://img.shields.io/badge/deploy-render-46e3b7.svg)](https://render.com)

[Features](#-features)  • [Quick Start](#-quick-start)  

</div>

---

## 🌟 Overview

MyMoney Pro is a comprehensive personal finance management application designed specifically for Indian users and currency (₹ Rupees). Track expenses, manage budgets, and gain actionable insights into your spending habits with real-time analytics and smart AI-powered categorization.

Built with modern technologies and featuring a beautiful glassmorphic UI, MyMoney Pro makes financial management accessible, intuitive, and enjoyable.

---

## ✨ Features

### 💳 Core Financial Management
- **Real-time Dashboard** - Monitor your financial health at a glance with interactive charts
- **Transaction Tracking** - Record income and expenses with automatic categorization
- **Smart Categorization** - AI-powered automatic categorization of transactions
- **Multi-Account Support** - Manage checking, savings, credit cards, and investment accounts
- **Search & Filter** - Quickly find transactions with powerful search capabilities

### 🎯 Budget & Planning
- **Category Budgets** - Set spending limits for different categories
- **Envelope Budgeting** - YNAB-style envelope system - give every rupee a job
- **Budget vs. Actual** - Visual comparison of planned vs. actual spending
- **Rollover Support** - Carry forward unused budget to next month
- **Priority-based Auto-assignment** - Smart budget allocation

### 📊 Analytics & Insights
- **Spending Analytics** - Detailed breakdown by category, merchant, and time
- **Visual Charts** - Interactive pie charts, bar graphs, and trend lines
- **Top Merchants** - Identify where you spend the most
- **Monthly Comparisons** - Track spending trends over time
- **Expense Patterns** - Discover spending patterns and habits

### 🔔 Smart Features
- **Real-time Notifications** - Stay updated on budget limits and spending
- **Recurring Transactions** - Auto-track subscriptions and regular bills
- **CSV Export** - Download your financial data anytime
- **PDF Reports** - Generate professional financial reports
- **Net Worth Tracking** - Monitor your overall financial position

### 🎨 Modern UI/UX
- **Glassmorphic Design** - Beautiful modern interface with smooth animations
- **Dark Mode Support** - Easy on the eyes for night-time use
- **Responsive Layout** - Works perfectly on mobile, tablet, and desktop
- **PWA Support** - Install as a standalone app on any device
- **Intuitive Navigation** - User-friendly interface for all age groups

### 🔒 Security & Privacy
- **JWT Authentication** - Secure login system
- **Password Encryption** - Bcrypt hashing for password security
- **User Isolation** - Complete data separation between users
- **Local First** - Your data stays with you

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have installed:
- **Node.js** 18+ and npm ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **pip** (comes with Python)
- **Git** ([Download](https://git-scm.com/))

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/Cholarajarp/MyMoney_Pro_Daily_Financial_Management.git
cd MyMoney_Pro_Daily_Financial_Management
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
pip install -r requirements.txt
```

4. **Initialize the database**
```bash
python init_db.py
```

5. **Start the backend server**
```bash
python backend/app.py
```

6. **Start the frontend (in a new terminal)**
```bash
npm start
```

7. **Open your browser**
Navigate to `http://localhost:3000`

8. **Create an account and start tracking!**

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

The repository now uses a single combined Dockerfile that builds the React frontend and runs the Flask backend from one container. The easiest way to run it locally is using Docker Compose:

```bash
# Build and start the app
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

The application will be available at:
- App (frontend + backend on same origin): `http://localhost:5000`

### Manual Docker Build

**Build combined app image:**
```bash
docker build -t mymoney-app -f Dockerfile .
docker run -p 5000:5000 -v $(pwd)/instance:/app/instance mymoney-app
```

Notes:
- The frontend is served as static assets by the Flask app (no separate frontend container needed).
- Set `DATABASE_URL`/`JWT_SECRET` as environment variables when running in production.


---

## 🌐 Deploy to Render

MyMoney Pro is optimized for deployment on Render with zero configuration needed.

### Automated Deployment (Using Blueprint)

1. Fork this repository to your GitHub account
2. Sign up at [Render.com](https://render.com)
3. Click **"New Blueprint Instance"**
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and deploy both frontend and backend
6. Your app will be live in minutes! 🎉

### Manual Deployment

**Backend Web Service:**
1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure:
   - **Name:** `mymoney-backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn -w 4 -b 0.0.0.0:$PORT backend.app:app`
4. Add environment variables (optional):
   - `JWT_SECRET`: Your secret key
   - `DATABASE_URL`: PostgreSQL connection string (if using PostgreSQL)
5. Deploy!

**Frontend Static Site:**
1. Create a new **Static Site** on Render
2. Connect your GitHub repository
3. Configure:
   - **Name:** `mymoney-frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://mymoney-backend.onrender.com`)
5. Deploy!

### Database Setup on Render

For production, it's recommended to use PostgreSQL:

1. Create a **PostgreSQL** database on Render
2. Copy the **Internal Database URL**
3. Add it as `DATABASE_URL` environment variable to your backend service
4. Render will automatically restart and migrate to PostgreSQL

---

## 📁 Project Structure

```
MyMoney_Pro_Daily_Financial_Management/
├── 📂 public/                    # Static files
│   ├── app-icon.png             # App icon
│   ├── index.html               # HTML template
│   └── manifest.json            # PWA manifest
├── 📂 src/
│   ├── 📂 components/           # React components
│   │   ├── 📂 auth/            # Authentication components
│   │   │   ├── LoginForm.jsx
│   │   │   ├── SignupForm.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── Accounts.jsx        # Account management
│   │   ├── EnvelopeBudget.jsx  # YNAB-style budgeting
│   │   ├── Investments.jsx     # Investment tracking
│   │   ├── NetWorthTracker.jsx # Net worth dashboard
│   │   └── RecurringTransactions.jsx
│   ├── 📂 utils/               # Utility functions
│   │   └── smartCategorization.js  # AI categorization
│   ├── App.jsx                 # Main app component
│   ├── index.js                # Entry point
│   ├── index.css               # Global styles
│   └── theme-init.js           # Theme initialization
├── 📂 backend/
│   └── app.py                  # Flask backend server
├── 📂 instance/
│   └── mymoney.db              # SQLite database (dev)
├── 📄 Dockerfile.frontend       # Frontend Docker config
├── 📄 Dockerfile.backend        # Backend Docker config
├── 📄 docker-compose.yml        # Docker Compose config
├── 📄 render.yaml               # Render deployment config
├── 📄 package.json              # Node dependencies
├── 📄 requirements.txt          # Python dependencies
├── 📄 init_db.py               # Database initialization
├── 📄 tailwind.config.js       # Tailwind CSS config
└── 📄 README.md                # This file
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - Modern React with Hooks
- **Lucide React** - Beautiful icon library
- **Recharts** - Interactive charting library
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS & Autoprefixer** - CSS processing
- **jsPDF** - PDF generation
- **PWA Support** - Progressive Web App features

### Backend
- **Python 3.11+** - Modern Python
- **Flask** - Lightweight web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **Flask-CORS** - Cross-Origin Resource Sharing
- **PyJWT** - JSON Web Token implementation
- **Gunicorn** - WSGI HTTP Server
- **PostgreSQL/SQLite** - Database support

### DevOps & Deployment
- **Docker & Docker Compose** - Containerization
- **Render** - Cloud hosting platform
- **GitHub Actions** - CI/CD ready
- **Nginx** - Web server (in Docker)

---

## 🎯 Features in Detail

### Smart Transaction Categorization

MyMoney Pro uses advanced pattern matching to automatically categorize transactions:

```javascript
// Automatically detects and categorizes based on merchant names
"Swiggy" → Food & Dining 🍔
"Uber" → Transportation 🚗
"Amazon" → Shopping 🛍️
"Big Bazaar" → Groceries 🛒
```

**Supported Categories:**
- Food & Dining, Groceries, Transportation
- Shopping, Electronics, Entertainment
- Bills & Utilities, Healthcare, Housing
- Personal Care, Education, Travel
- Subscriptions, Gifts & Donations

### Envelope Budgeting (YNAB Method)

Based on the proven "You Need A Budget" methodology:

1. **Give Every Rupee a Job** - Assign all your income to categories
2. **Embrace Your True Expenses** - Plan for irregular expenses
3. **Roll With the Punches** - Adjust budgets as needed
4. **Age Your Money** - Spend last month's income

### Real-time Analytics

- Category-wise spending breakdown
- Budget vs. actual comparison
- Monthly spending trends
- Top merchants analysis
- Spending pattern detection
- Custom date range filtering

---

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000
PORT=3000
```

**Backend (.env):**
```env
JWT_SECRET=your-super-secret-key-change-this
DATABASE_URL=sqlite:///mymoney.db
# Or for PostgreSQL:
# DATABASE_URL=postgresql://user:password@host:5432/dbname
FLASK_ENV=production
PORT=5000
```

### Customization

**Change Currency:**
Edit `src/App.jsx` and search for "₹" to change currency symbols.

**Add Categories:**
Edit `src/utils/smartCategorization.js` to add custom categories and keywords.

**Modify Colors:**
Edit `tailwind.config.js` or component styles.

---

## 📊 API Documentation

### Authentication Endpoints

```
POST /api/signup              - Register new user
POST /api/login               - User login
GET  /api/profile             - Get user profile
PUT  /api/profile             - Update profile
```

### Transaction Endpoints

```
GET    /api/transactions      - Get all transactions
POST   /api/transactions      - Add new transaction
PUT    /api/transactions/:id  - Update transaction
DELETE /api/transactions/:id  - Delete transaction
```

### Budget Endpoints

```
GET  /api/budgets            - Get all budgets
POST /api/budgets            - Create budget
PUT  /api/budgets/:id        - Update budget
```

### Envelope Budget Endpoints

```
GET  /api/envelope-budgets   - Get envelope budgets
POST /api/envelope-budgets   - Create envelope
PUT  /api/envelope-budgets/:id - Update envelope
```

### Analytics Endpoints

```
GET /api/analytics/summary   - Get financial summary
GET /api/analytics/trends    - Get spending trends
GET /api/analytics/categories - Category breakdown
```

---

## 🧪 Testing

### Run Frontend Tests

```bash
npm test
```

### Run Backend Tests

```bash
pytest backend_tests/
```

### Run All Tests

```bash
npm test && pytest backend_tests/
```

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

### How to Contribute

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Test thoroughly before submitting PR

---

## 🐛 Known Issues & Roadmap

### Known Issues
- [ ] Real-time notifications need backend WebSocket support
- [ ] CSV export formatting improvements
- [ ] Mobile app performance optimization

### Upcoming Features
- [ ] Bank account integration (Plaid/Yodlee)
- [ ] Investment portfolio tracking
- [ ] Bill payment reminders
- [ ] Expense sharing for families
- [ ] AI-powered financial advice
- [ ] Multi-language support (Hindi, Tamil, Telugu, etc.)
- [ ] Voice-based transaction entry
- [ ] Receipt scanning with OCR
- [ ] Cryptocurrency tracking

---

## 📱 PWA Installation

MyMoney Pro can be installed as a Progressive Web App:

### On Mobile (Android/iOS)
1. Open the app in Chrome/Safari
2. Tap the menu (⋮) or share button
3. Select "Add to Home Screen"
4. Enjoy the native app experience!

### On Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install MyMoney Pro"
3. Use it like a native desktop app!

---

## 💡 Tips for Best Experience

1. **Set Up Budgets First** - Define your spending limits before tracking
2. **Enable Notifications** - Stay on top of your spending
3. **Review Weekly** - Check your analytics every week
4. **Categorize Regularly** - Keep transactions properly categorized
5. **Use Envelope Method** - Allocate every rupee for better control
6. **Export Regularly** - Backup your data with CSV exports
7. **Set Realistic Goals** - Start small and adjust as needed

---

## 🔒 Privacy & Security

- **No Data Sharing** - Your financial data is never shared with third parties
- **Encrypted Passwords** - Bcrypt hashing for password security
- **JWT Authentication** - Secure session management
- **Local First** - Data stored locally in SQLite by default
- **HTTPS Only** - All production deployments use HTTPS
- **No Tracking** - No analytics or tracking scripts

---

## 📧 Support & Contact

- **GitHub Issues:** [Report bugs or request features](https://github.com/Cholarajarp/MyMoney_Pro_Daily_Financial_Management/issues)
- **Discussions:** [Ask questions or share ideas](https://github.com/Cholarajarp/MyMoney_Pro_Daily_Financial_Management/discussions)
- **Author:** [@Cholarajarp](https://github.com/Cholarajarp)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ for budget-conscious individuals
- Inspired by YNAB (You Need A Budget) methodology
- Designed specifically for Indian users and currency
- Thanks to the open-source community for amazing tools

---

## 🌟 Star This Repository

If you find MyMoney Pro helpful, please consider giving it a star ⭐️ on GitHub!

---

<div align="center">

**Made with 💙 by [Cholarajarp](https://github.com/Cholarajarp)**

*Empowering everyone to take control of their finances*

[⬆ Back to Top](#-mymoney-pro---daily-financial-management)

</div>

