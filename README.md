# 🚀Tech Charity Platform

A modern web platform built with Next.js that enables charitable donations through M-Pesa integration, featuring a responsive dashboard for tracking donations and impact metrics.

## ✅Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation) 
- [Database Schema](#database-schema)
- [M-Pesa Integration](#m-pesa-integration)
- [Contributing](#contributing)

## 🙌Overview

Tech Charity is a platform designed to bridge the digital divide by facilitating technology education and resources for underserved communities. The platform enables seamless donations through M-Pesa integration and provides real-time tracking of impact metrics.

```mermaid
---
title: System Overview
---
graph TB
    Donor((Donor))
    Admin((Admin))
    subgraph Tech_Charity_Platform[" Tech Charity Platform "]
        Frontend[Frontend<br/>Next.js]
        Backend[Backend<br/>Next.js API]
        DB[(MongoDB)]
        MPesa[M-Pesa API]
    end
    
    Donor -->|Makes donation| Frontend
    Frontend -->|Processes request| Backend
    Backend -->|Initiates payment| MPesa
    MPesa -->|Payment callback| Backend
    Backend -->|Stores transaction| DB
    Admin -->|Views dashboard| Frontend

    classDef actor fill:#e1bee7,stroke:#7b1fa2,stroke-width:2px,color:#4a148c
    classDef component fill:#bbdefb,stroke:#1976d2,stroke-width:2px,color:#0d47a1
    classDef database fill:#c8e6c9,stroke:#388e3c,stroke-width:2px,color:#1b5e20
    
    class Donor,Admin actor
    class Frontend,Backend,MPesa component
    class DB database
```

## Features

- 🌐 Responsive web interface
- 💳 M-Pesa payment integration
- 📊 Real-time donation tracking
- 📱 Mobile-first design
- 🔒 Secure payment processing
- 📈 Impact statistics dashboard

## System Architecture

### Payment Flow

```mermaid
---
title: Payment Flow
---
sequenceDiagram
    participant User as 👤 User
    participant Frontend as 🖥️ Frontend
    participant Backend as ⚙️ Backend
    participant MPesa as 💳 M-Pesa
    participant MongoDB as 🗄️ MongoDB

    User->>Frontend: 1. Initiates donation
    Frontend->>Backend: 2. Submits donation details
    Backend->>MPesa: 3. Initiates STK Push
    MPesa->>User: 4. Prompts for payment
    User->>MPesa: 5. Confirms payment
    MPesa->>Backend: 6. Payment callback
    Backend->>MongoDB: 7. Updates donation status
    Backend->>Frontend: 8. Confirms success
    Frontend->>User: 9. Shows confirmation

    note over Backend,MPesa: Secure API Communication
    note over Backend,MongoDB: Real-time Updates
```

### 🚀Component Architecture

```mermaid
---
title: Component Architecture
---
graph TB
    subgraph Frontend["Frontend Layer"]
        Nav[Navigation]
        Form[DonationForm]
        Dash[Dashboard]
        Payment[PaymentProcessor]
    end

    subgraph Backend["Backend Layer"]
        API[API Routes]
        MPesaService[M-Pesa Service]
        DBService[Database Service]
    end

    subgraph Database["Data Layer"]
        Donations[(Donations)]
        Stats[(Statistics)]
    end

    Nav --> Dash
    Form --> Payment
    Payment --> API
    API --> MPesaService
    API --> DBService
    DBService --> Donations
    DBService --> Stats

    classDef frontend fill:#bbdefb,stroke:#1976d2,stroke-width:2px,color:#0d47a1
    classDef backend fill:#ffcdd2,stroke:#c62828,stroke-width:2px,color:#b71c1c
    classDef database fill:#c8e6c9,stroke:#388e3c,stroke-width:2px,color:#1b5e20

    class Nav,Form,Dash,Payment frontend
    class API,MPesaService,DBService backend
    class Donations,Stats database
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- ngrok (for local M-Pesa callback testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mwakidenis/Tech-Charity-System.git
cd Tech-donations
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Environment Setup

Create a `.env.local` file with the following variables:

```env
# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/tech_charity

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_shortcode
MPESA_ENVIRONMENT=sandbox

# Development configuration with ngrok
MPESA_CALLBACK_SECRET_KEY=your_secret_key
MPESA_CALLBACK_URL=your_ngrok_url/api/mpesa/your_secret_key
```

## 📃API Documentation

### Donation Endpoints

```typescript
// Create Donation
POST /api/donations
{
  name: string;
  phone: string;
  amount: number;
}

// Get Donations
GET /api/donations?page=1&limit=10

// Get Donation Stats
GET /api/donations/stats

// M-Pesa Callback
POST /api/mpesa/{secretKey}
```

## 📃Database Schema

```mermaid
---
title: Database Schema
---
erDiagram
    DONATION {
        ObjectId _id PK "Primary Key"
        String name "Donor Name"
        String phone "Phone Number"
        Number amount "Donation Amount"
        String checkoutRequestId "M-Pesa Request ID"
        String status "Transaction Status"
        Date createdAt "Creation Date"
        String mpesaCode "M-Pesa Code"
        Date transactionDate "Payment Date"
    }
```
#### Status Definitions:
- 🟡 **pending**: Awaiting confirmation.
- 🟢 **completed**: Donation was successful.
- 🔴 **failed**: Payment was declined.


## M-Pesa Integration

The platform integrates with M-Pesa's STK Push API for payment processing. Here's the flow:

1. User initiates donation
2. System triggers STK push
3. User receives payment prompt
4. User confirms payment
5. M-Pesa sends callback
6. System updates donation status

### Callback Handling

```mermaid
---
title: M-Pesa Callback Flow
---
flowchart TD
    A[Receive M-Pesa callback] --> B{Valid security key?}
    B -->|Yes ✅| C{Valid IP?}
    B -->|No ❌| D[Log invalid key]
    C -->|Yes ✅| E{Payment successful?}
    C -->|No ❌| F[Log invalid IP]
    E -->|Yes ✅| G[Extract transaction details]
    E -->|No ❌| H[Mark donation as failed]
    G --> I[Update donation status]
    I --> J[Return success]
    H --> K[Return acknowledgment]
    F --> K
    D --> K

    classDef process fill:#bbdefb,stroke:#1976d2,stroke-width:2px,color:#0d47a1
    classDef decision fill:#ffecb3,stroke:#ffa000,stroke-width:2px,color:#ff6f00
    classDef terminal fill:#c8e6c9,stroke:#388e3c,stroke-width:2px,color:#1b5e20
    classDef error fill:#ffcdd2,stroke:#c62828,stroke-width:2px,color:#b71c1c

    class A,G,I process
    class B,C,E decision
    class J,K terminal
    class D,F,H error
```
##
**Made with lots of ❤️ by Mwaki Denis**
##
**Show some ❤️  [![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-%F0%9F%8D%B5-yellow?style=for-the-badge)](https://wa.me/254798750585)**

