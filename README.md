# EngageAI

An AI-driven predictive platform to forecast social media engagement using historical data and content features.

## Project Overview

EngageAI is a production-ready full-stack application that leverages machine learning to predict engagement metrics (likes, comments, shares) on social media posts. The prediction is based on historical social media data, content features (text, media type, hashtags), time of posting, and user behavior signals.

## Key Features

- Data collection and preprocessing from CSV/API
- Feature extraction from content, metadata, and user interaction patterns
- Machine learning model for engagement prediction
- Real-time prediction capability
- Visualization of trends, feature importance, and predictions
- API endpoints for external use
- Comprehensive analytics system for tracking user behavior

## Project Structure

```
├── frontend/                # React/Next.js frontend application
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── hocs/            # Higher-order components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── styles/          # CSS/Tailwind styles
│   │   └── utils/           # Utility functions
│   ├── package.json         # Dependencies
│   └── README.md            # Frontend documentation
├── backend/                 # Node.js/Express backend
│   ├── src/                 # Source code
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Middleware functions
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── package.json         # Dependencies
│   └── README.md            # Backend documentation
├── ml/                      # Machine learning module
│   ├── data/                # Data storage
│   │   ├── raw/             # Raw data
│   │   └── processed/       # Processed data
│   ├── models/              # Trained models
│   ├── notebooks/           # Jupyter notebooks
│   ├── src/                 # Source code
│   │   ├── features/        # Feature engineering
│   │   ├── models/          # Model training
│   │   ├── preprocessing/   # Data preprocessing
│   │   └── utils/           # Utility functions
│   ├── requirements.txt     # Python dependencies
│   └── README.md            # ML documentation
├── docker/                  # Docker configuration
│   ├── frontend/            # Frontend Dockerfile
│   ├── backend/             # Backend Dockerfile
│   ├── ml/                  # ML Dockerfile
│   └── docker-compose.yml   # Docker Compose configuration
├── .github/                 # GitHub configuration
│   └── workflows/           # GitHub Actions workflows
├── .gitignore               # Git ignore file
├── docker-compose.yml       # Docker Compose configuration
└── README.md                # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Docker and Docker Compose
- PostgreSQL or MongoDB

### Installation

1. Clone the repository
2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Set up the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

## Analytics System

The platform includes a comprehensive analytics system to track user behavior and application usage. This helps in understanding how users interact with the application and provides insights for improvement.

### Features

- Page view tracking
- Event tracking for user interactions
- Conversion tracking
- User property tracking
- Domain-specific event tracking (predictions, social accounts, etc.)

### Implementation

The analytics system is implemented using:

- Core utility (`frontend/src/utils/analytics.js`)
- React component for declarative tracking (`frontend/src/components/Analytics.jsx`)
- Custom React hook (`frontend/src/hooks/useAnalytics.js`)
- Higher-order component (`frontend/src/hocs/withAnalytics.js`)
- React context (`frontend/src/contexts/AnalyticsContext.js`)

### Configuration

Analytics can be configured through environment variables:

```
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

For more details, see the [Analytics Documentation](frontend/docs/analytics.md).
4. Set up the ML module:
   ```bash
   cd ml
   pip install -r requirements.txt
   python -m src.main
   ```

## Technologies Used

### Frontend
- React/Next.js
- Tailwind CSS
- Recharts/Chart.js
- JWT Authentication

### Backend
- Node.js/Express
- REST API
- JWT Authentication

### Machine Learning
- Python
- pandas, scikit-learn, XGBoost/LightGBM
- NLP: TF-IDF/Word2Vec/BERT

### Database
- PostgreSQL/MongoDB

### Deployment
- Docker
- GitHub Actions
- Vercel/Netlify/Heroku

## License

This project is licensed under the MIT License.