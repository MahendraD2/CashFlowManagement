# CashVista Backend

This is the backend API for the CashVista cash flow management system. It's built with FastAPI and PostgreSQL.

## Features

- User authentication with JWT
- Financial data upload and processing
- Dashboard with financial metrics
- Scenario planning
- Notifications system
- User settings management

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Relational database for persistent storage
- **SQLAlchemy**: SQL toolkit and ORM
- **Pandas**: Data analysis and manipulation
- **Pydantic**: Data validation and settings management
- **JWT**: JSON Web Tokens for authentication

## Setup Instructions

### Prerequisites

- Python 3.10+
- PostgreSQL
- (Optional) Docker and Docker Compose

### Local Development Setup

1. Create a virtual environment:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. Create the database:
   \`\`\`bash
   # In PostgreSQL
   CREATE DATABASE cashvista;
   \`\`\`

4. Start the development server:
   \`\`\`bash
   uvicorn app.main:app --reload
   \`\`\`

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
\`\`\`

Now, let's create a README for the frontend:
