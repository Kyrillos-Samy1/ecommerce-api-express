# E-Commerce API (Node.js, Express & MongoDB)

**E-Commerce API** is a full-featured backend application for an e-commerce platform, built with **Node.js, Express, and MongoDB**.  
It provides a secure, scalable, and efficient RESTful API for managing users, products, categories, orders, payments, and more.

---

## Live API

Test the API live here: [E-Commerce API on Vercel](https://ecommerce-api-express.vercel.app/)

> You can test all endpoints using **Postman**. Product images and videos are hosted on **Cloudinary** for seamless delivery.

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
- **Media Hosting**: Product images/videos uploaded and delivered via **Cloudinary**  

---

## Tech Stack

| Layer        | Tech Used                      |
|--------------|--------------------------------|
| Backend      | Node.js, Express.js             |
| Database     | MongoDB, Mongoose              |
| Authentication | JWT, bcrypt                  |
| Payment      | Stripe (optional)              |
| Media Hosting | Cloudinary                     |
| Testing      | Postman                        |
| Deployment   | Vercel, MongoDB Atlas           |

---

## Project Structure

ecommerce-api-express
├── src
│ ├── controllers/ # Request handlers for API endpoints
│ ├── models/ # Mongoose models
│ ├── routes/ # Express routes
│ ├── middleware/ # Auth, error handling, validation
│ ├── utils/ # Helper functions
│ ├── app.js # Express app setup
│ └── server.js # Server entry point
├── assets/ # Demo videos, Postman requests
├── .gitignore
├── README.md
├── package.json
└── LICENSE

---


---

## Download & Test

You can access and test the API without installing anything locally:  

- **Live API URL**: [https://ecommerce-api-express.vercel.app/](https://ecommerce-api-express.vercel.app/)  
- Use **Postman** or any API client to test all endpoints.  
- Product images and videos are hosted on **Cloudinary**.  

> No environment variables or local setup required. Just explore the API online.

---

## Product / API Demo Video

Watch the demo of the API in action:  

- **Demo Video**: [Insert your video link here]  

> Replace the placeholder link with your Cloudinary or YouTube video showing the API requests or product testing.

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

> **Learning, building, and improving every day.**
