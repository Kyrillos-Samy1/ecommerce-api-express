# E-Commerce API (Node.js, Express & MongoDB)

**E-Commerce API** is a full-featured backend application for an e-commerce platform, built with **Node.js, Express, and MongoDB**.  
It provides a secure, scalable, and efficient RESTful API for managing users, products, categories, orders, payments, and more.

---

## Live API

Test the API live here: [E-Commerce API on Vercel](https://ecommerce-api-express.vercel.app/)

> You can test all endpoints using **Postman**. Product images and are hosted on **Cloudinary** for seamless delivery.

---

## 🔗 API Endpoints Documentation  

**Description (300 chars):**  
Comprehensive API endpoints documentation built and tested using Postman, featuring all HTTP methods, parameters, request bodies, and example responses. This guide helps developers easily understand, test, and integrate the backend system with high performance, reliability, and scalability.  

**📘 Postman Documentation:**  
All API endpoints have been tested, validated, and documented using Postman. You can view and interact with them directly through the link below:  

👉 [View Full API Documentation on Postman](https://documenter.getpostman.com/view/41775437/2sB3WjyP5z)

---

## Features

- **User Authentication & Authorization**: JWT-based login, signup, password reset, role-based access (Admin, Manager, User)  
- **CRUD Operations** for Categories, Subcategories, Brands, and Products  
- **Product Management** with multiple variants, stock tracking, and dynamic pricing  
- **Reviews & Wishlist**: Users can review products and manage wishlists  
- **Shopping Cart & Coupons**: Add products, apply discount coupons, adjust quantities  
- **Orders & Payments**: Cash on delivery or online payment integration (Stripe or other gateways)  
- **Advanced Error Handling & Validation**: Centralized error management for reliable API responses  
- **Deployment Ready**: Hosted on **Vercel** with MongoDB Atlas as cloud database  
- **Media Hosting**: Product images uploaded and delivered via **Cloudinary**  

---

## Tech Stack

| Layer          | Tech Used             |
|----------------|----------------------|
| Backend        | Node.js, Express.js  |
| Database       | MongoDB, Mongoose    |
| Authentication | JWT, bcrypt, Crypto  |
| Payment        | Stripe (optional)    |
| Media Hosting  | Cloudinary           |
| Testing        | Postman              |
| Deployment     | Vercel, MongoDB Atlas|

---

## Project Structure

```
ecommerce-api-express
├── config/             # Configuration files
├── middlewares/        # Auth, error handling, validation
├── models/             # Mongoose models
├── node_modules/       # Node.js dependencies
├── routes/             # Express routes
├── services/           # Business logic services
├── utils/              # Helper functions
├── .eslintrc.json      # ESLint configuration
├── .gitignore
├── config.env          # Environment variables
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
└── server.js           # Server entry point
```

---

## Download & Test

You can access and test the API without installing anything locally:  

- **Live API URL**: [https://ecommerce-api-express.vercel.app/](https://ecommerce-api-express.vercel.app/)  
- Use **Postman** or any API client to test all endpoints.  
- All images are hosted on **Cloudinary**.  

> No environment variables or local setup required. Just explore the API online.

---

## Legal Notice & Usage Policy

This project is for **educational purposes** only.  
All source code and media assets are owned by **Kyrillos Samy Doksh Hanna**.

Licensed under the [MIT License](./LICENSE).

For questions or collaborations: `kyrillossamy@outlook.com`

---

## Contact

**Kyrillos Samy Doksh Hanna**  
Email: `kyrillossamy@outlook.com`  
Phone: `+20-1271470997`  
Nickname: `Empire Coder`  
Based in Egypt  

> **Still learning, still building, always improving.**
