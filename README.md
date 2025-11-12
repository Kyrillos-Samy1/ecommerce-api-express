# E-Commerce API (Node.js, Express & MongoDB)

**E-Commerce API** is a full-featured backend application for an e-commerce platform, built with **Node.js, Express, and MongoDB**.  
It provides a secure, scalable, and efficient RESTful API for managing users, products, categories, orders, payments, and more.

---

## Features

- **User Authentication & Authorization**: Secure JWT-based login, signup, password reset, verification, and role-based access (Admin, Manager, User)
- **User & Address Management**: Logged-in users can manage their profile, addresses, passwords, and logout; managers can create and manage users
- **CRUD Operations** for Categories, Subcategories, Brands, and Products with full control for Admins and Managers
- **Product Management**: Supports multiple variants, stock tracking, dynamic pricing, image cover, and array of images for each product
- **Reviews & Ratings**: Users can create reviews; Admins and Managers can moderate all reviews; filter reviews by product
- **Wishlist Management**: Users can add, view, remove, and clear products from their wishlist
- **Shopping Cart & Coupons**: Add products to cart, apply discount coupons, update quantities, remove items, and clear cart
- **Orders & Payments**: Create, view, and cancel orders; supports cash on delivery and Stripe payments; automated emails for order confirmation, payment, and delivery
- **Advanced Searching & Filtering**: Pagination, filtering, sorting, field limiting, and search across products, categories, subcategories, brands, reviews, and coupons
- **Automated Email Notifications**: Sends transactional emails for online payment (stripe), cash payment, update payment status in case cash payment, and delivery updates
- **Media Hosting**: Product images uploaded and delivered via **Cloudinary** for fast and reliable media access
- **Advanced Error Handling & Validation**: Centralized error management ensures reliable API responses
- **Deployment Ready**: Fully hosted backend on **Vercel** with MongoDB Atlas, built for scalability and performance

---

## Tech Stack

| Layer                 | Tech Used                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend               | JavaScript (Node.js), Express.js, dotenv, cookie-parser, compression, morgan, multer, sharp, slugify, validator |
| Database              | MongoDB, Mongoose                                                                                                                                                                                                        |
| Authentication        | JWT, bcryptjs, Crypto                                                                                                                                                                                                    |
| Payment               | Stripe                                                                                                                                                                                                                   |
| Media Hosting         | Cloudinary                                                                                                                                                                                                               |
| Email                 | Nodemailer                                                                                                                                                                                                               |
| Testing               | Postman                                                                                                                                                                                                                  |
| Dev Tools & Lint      | Nodemon, Cross-env, ESLint, Prettier, eslint-config-airbnb, eslint-config-prettier, eslint-plugin-import, eslint-plugin-jsx-a11y, eslint-plugin-node, eslint-plugin-prettier, eslint-plugin-react                        |
| Deployment            | Vercel, MongoDB Atlas                                                                                                                                                                                                    |
| Security & Middleware | express-validator, express-mongo-sanitize, express-xss-sanitizer, helmet, hpp, cors, compression, express-rate-limit                                                                                                     |

---

## Project Structure

```
ecommerce-api-express
├── config/             # Configuration files (DB, Cloudinary, etc.)
├── middlewares/        # Custom middlewares for auth, security, error handling, image uploads, validation errors, and request preprocessing
├── models/             # Mongoose models
├── node_modules/       # Node.js dependencies
├── routes/             # Express routes
├── services/           # Business logic services
├── utils/              # Helper functions for emails, validation layers, API Errors, API Features, and Sanitize Data
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

## API Endpoints Documentation

**Description:**  
 
- Comprehensive API endpoints documentation built and tested using Postman, featuring all HTTP methods, parameters, request bodies, and example responses. This guide helps developers easily understand, test, and
  integrate the backend system with high performance, reliability, and scalability.

**Postman Documentation:**  

- All API endpoints have been tested, validated, and documented using Postman. You can view and interact with them directly through the link below:

**You can access and test the API without installing anything locally:**

- **Live API URL**: *[https://documenter.getpostman.com/view/41775437/2sB3WjyP5z](https://documenter.getpostman.com/view/41775437/2sB3WjyP5z)*

- *Go to Environments and create a new environment (or use an existing one).*

- *Add a variable:*

```
baseURL
```

- *Set its value to:*

```
https://ecommerce-api-express.vercel.app
```

- *Use it in requests like this:*

```
{{baseURL}}/api/v1/products
```

- *This makes it easy to switch environments or update the base URL later.*

> No environment variables or local setup required. Just explore the API online.

---

## Legal Notice & Usage Policy

This project is intended for **educational and portfolio purposes only**.  
All source code and media assets are owned and maintained by **Kyrillos Samy Doksh Hanna**.

**Unauthorized use, reproduction, or distribution of this code for commercial purposes is strictly prohibited**.

Licensed under the [MIT License](./LICENSE).

> For commercial inquiries, collaborations, or special permissions, please get in touch with me directly at: `kyrillossamy@outlook.com`
---

## Contact

**Crafted with vision by Kyrillos Samy Doksh Hanna**  
Email: `kyrillossamy@outlook.com`  
Phone: `+20-1271470997`  
Nickname: `Empire Coder`  
Based in Egypt

> **Still learning, still building, always improving.**
