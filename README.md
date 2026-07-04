# KIKO Milano E-Commerce Clone 💄✨

A fully functional, modern, full-stack e-commerce storefront clone of **KIKO Milano**. The project has been built using a decoupled architecture, featuring a fast **React Single Page Application (SPA)** client communicating with a secure **Node.js/Express REST API** and a **MongoDB** database.

---

## 🚀 Key Features

### 🛍️ Customer Experience
* **Dynamic Shopping Bag**: Add products, adjust quantities with live stock checks, and calculate shipping values in real-time.
* **Interactive Wishlist**: Save favorite items to a personalized wishlist (persists in MongoDB for registered users).
* **Search & Category Filters**: Search the catalog dynamically or filter by makeup categories (LIPS, FACE, SKIN CARE, etc.).
* **Dynamic Ratings & Reviews**: Real customer reviews dynamically compute product rating averages and star counts.

### 🏷️ Admin Control Center & Campaigns
* **Global Sale Campaign Settings**: Set a global discount percentage (e.g. 10% off) across the entire store. Prices automatically cross out and show sale tags.
* **Newsletter Composer**: Collect customer emails in the footer subscribe box, review subscriber registers, and compose/dispatch HTML promotional campaigns.
* **Product Catalog Moderation**: Register new makeup products, upload images, specify shades, edit inventory, or soft-delete products.
* **Live Sales Dashboard**: A polling dashboard that refreshes every 10 seconds to display total revenue statistics and recent order lists.

### 🔐 Security & Compliance
* **Encrypted Credentials**: Passwords hashed securely using `bcryptjs` before DB write.
* **Stateless Authentication**: Uses JSON Web Tokens (JWT) for secure route validation.
* **Database Defenses**: Strong defenses against NoSQL Injection and Cross-Site Scripting (XSS).
* **Rate Limiting**: Integrated `express-rate-limit` on login, registration, and newsletter actions.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), React Router Dom, Axios, CSS Variables, Montserrat Typography.
* **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt.js, Helmet, Express Rate Limit.

---

## 📂 Project Structure

```
kiko-milano/
├── backend/       # Express REST API Server
└── frontend/      # React Single Page Application (Vite Client)
```

---

## ⚙️ Local Development Setup

### 1. Database Setup
Make sure MongoDB is installed and running locally on your computer at `mongodb://127.0.0.1:27017/kikoDB`.

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the database seed script to populate products:
   ```bash
   node seedProducts.js
   ```
4. Start your local Express server:
   ```bash
   node server.js
   ```
   *(The server will run on http://localhost:3000)*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client development server:
   ```bash
   npm run dev
   ```
   *(The client will open on http://localhost:5173)*

---

## ☁️ Production Deployment

### Backend (Render.com / Railway.app)
1. Link your GitHub repository.
2. Set build command: `npm install` and start command: `node server.js`.
3. Configure environment variables: `MONGO_URI` (MongoDB Atlas link) and `JWT_SECRET`.

### Frontend (Vercel / Netlify)
1. Link your GitHub repository.
2. Select the **Vite** framework preset, root directory `frontend`.
3. Add the environment variable:
   * **Key**: `VITE_API_URL`
   * **Value**: *(Your live backend server link)*
