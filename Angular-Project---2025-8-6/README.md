# BoutiqueFlow (Digital Clothing Shop Management System)

BoutiqueFlow is a comprehensive full-stack digital management platform designed to transition physical clothing shops into a robust online environment. It features a modern Angular frontend, a Node.js REST API, and a secure MongoDB backend.

## 🚀 Tech Stack

- **Frontend:** Angular 20+, Chart.js, RxJS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Security:** Role-Based Access Control (RBAC), Email OTP (Nodemailer), JWT Authentication
- **Utilities:** PDFKit (Invoice Generation), Multer (Image Uploads)

## 📝 Project Overview (CV Entry)

### Description

**Engineered a full-stack digital management platform** to transition a physical clothing shop online, implementing strict role-based access control (RBAC) and Email OTP to secure staff and admin endpoints.

**Developed a responsive Angular frontend** with a real-time dashboard, enabling staff to accurately track complex apparel inventory (sizes, colors, SKUs) while supporting concurrent customer shopping workflows.

**Integrated payment gateways via a Node.js REST API** to process digital clothing sales, automating PDF invoice generation and triggering supplier restock notifications for low-inventory garments.

---

## ✨ Key Features

- **RBAC & OTP Security:** Secure login for Customers, Staff, and Admins with Email OTP verification.
- **Inventory Management:** Precise tracking of stock levels by size (S/M/L/XL) and color with automated low-stock alerts.
- **Real-time Analytics:** Advanced admin dashboard with sales trends, top products, and user metrics.
- **Automated Workflows:** PDF invoice generation for customers and restock notifications for suppliers.
- **E-commerce Ready:** Complete shopping cart, checkout process, and order history tracking.

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BuddhikaBICT-UoR-FoT-6/Angular-Project---2025-8-6.git
   cd Angular-Project---2025-8-6
   ```

2. **Frontend Setup:**
   ```bash
   npm install
   ```

3. **Backend Setup:**
   ```bash
   cd server
   npm install
   # Create a .env file based on .env.example
   npm start
   ```

### Development Server

Run `npm start` in the root directory to start the Angular development server.
The application will be available at `http://localhost:4201/` (proxied to backend on `3000`).

## 📊 Scripts

- `npm run start`: Starts the Angular development server with proxy.
- `npm run build`: Compiles the frontend for production.
- `cd server && npm start`: Starts the backend API.
- `cd server && npm run seed`: Populates the database with initial demo data.

---

*Verified and optimized for performance and professional deployment.*
