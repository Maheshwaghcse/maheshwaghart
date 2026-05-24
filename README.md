# 🎨 Mahesh Wagh Art & Sketches E-Commerce

A premium, full-stack, fully responsive e-commerce web application built for showcasing and selling authentic hand-drawn sketches and custom art commissions.

[![Interactive Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](#)
[![Stack](https://img.shields.io/badge/Stack-MERN-blue)](#)
[![License](https://img.shields.io/badge/License-MIT-orange)](#)

---

## ✨ Features

- **🛍️ Guest Checkout Flow**: Users can browse, add items to their cart, input shipping details, and place orders smoothly without being forced to create an account or log in first.
- **📱 3-Column Responsive Grid on Mobile**: Home page showcases featured works beautifully on mobile screens in an optimized, crisp 3-column format with responsive typography.
- **🎭 Drag & Cycle Fanned Showcase**: Interactive, draggable, fluid 3D-fanned portfolio carousel on the home page.
- **🛡️ Secure Admin Control**: Interactive admin panel to manage, add, edit, and delete artwork listings, view order progress, and control user roles.
- **🦾 Artificial Intelligence Integration**: Integrated Gemini AI models to generate metadata, categories, tags, and detailed art descriptions automatically for newly uploaded items.
- **🔒 Password Security**: Uses Mongoose hooks with robust bcrypt hashing to secure and manage all client and admin credentials.

---

## 🛠️ Technology Stack

**Frontend:**
- React (Single Page Application)
- React Router DOM (Dynamic Routing)
- Custom Vanilla CSS (Luxurious dark-mode theme, glassmorphism, fluid animations)
- Vite (Fast development and bundling)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (NoSQL Database)
- JSON Web Tokens (JWT) for secure authentication
- Google Generative AI (Gemini SDK) for automatic descriptions

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites

- Node.js installed
- MongoDB installed locally or a MongoDB Atlas URI

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Maheshwaghcse/maheshwaghart_skech_sell.git
cd maheshwaghart_skech_sell

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sketchecommerce
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run the Development Servers

Run the concurrent server from the root directory:

```bash
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173) and the backend on [http://localhost:5000](http://localhost:5000).

---

## 👤 Admin Setup

To seed initial data or create an admin account, run the seeder or backend setup commands locally.

```bash
# To populate initial demo items
cd backend
node seeder.js
```

---

## 🛡️ License

This project is licensed under the MIT License.
