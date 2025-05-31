# Ordering System

## Overview
This project implements a basic ordering system with a Node.js backend and a jQuery/HTML/CSS frontend. Users can browse items, add them to a cart, place orders with automatic offer application, and staff can manage inventory and offers. The system uses in-memory storage and includes logging and error handling for production readiness.

## Directory Structure
```
os/
├── public/
│   └── index.html
├── server.js
├── package.json
├── error.log
├── combined.log
```

- Place `index.html` in the `public` directory to ensure it is served correctly.
- Logs are written to `error.log` and `combined.log` in the root directory.

## Setup
1. **Prerequisites**:
   - Node.js (v16 or higher)
   - npm

2. **Installation**:
   ```bash
   git clone <repository-url>
   cd os
   npm install
   ```

3. **Running the Application**:
   ```bash
   node server.js
   ```
   - Open `http://localhost:3000` in a browser to access the frontend.

4. **Dependencies**:
   - `express`: RESTful API framework
   - `body-parser`: Parse JSON request bodies
   - `winston`: Logging
   - `cors`: Enable cross-origin requests

## Features
- **Browse Items**: View available items with prices and stock levels.
- **Order Items**: Add items to a cart and place orders with automatic offer application.
- **Apply Offers**: View and automatically apply discounts based on conditions.
- **Manage Inventory**: Staff can add, update, or remove items.
- **Manage Offers**: Staff can add, update, or remove offers.

## Approach
- **Backend**: Built with Node.js and Express for RESTful APIs. In-memory storage is used for items, offers, and orders. Winston handles logging to `combined.log` and `error.log`. CORS is enabled for frontend communication.
- **Frontend**: Uses jQuery for API calls and DOM manipulation, with Tailwind CSS for a modern, responsive UI. Includes tabs for User and Staff views, with forms and lists for managing data.
- **Error Handling**: Comprehensive error handling on backend (middleware, try-catch) and frontend (user-friendly error messages with timeouts).
- **Modularity**: Code is organized into separate concerns (API routes, client-side logic, UI rendering).

## Trade-offs
- **In-memory Storage**: Simplifies development but resets on server restart. Suitable for the scope but not for production without a database.
- **No Authentication**: Per requirements, no user authentication is implemented, allowing anyone to access staff features.
- **Simple UI**: Minimal but functional, using Tailwind CSS for a professional look without complex custom styling.
- **jQuery**: Chosen for simplicity, though modern frameworks like React could offer better state management for larger applications.

## Troubleshooting
- **Frontend not loading**: Ensure `index.html` is in the `public` directory. Check the browser console for errors and verify `http://localhost:3000` is accessible.
- **API errors**: Check `error.log` and `combined.log` for backend issues. Ensure the backend is running and CORS is enabled.
- **jQuery issues**: If jQuery fails to load, ensure internet access for the CDN or provide a local copy in the `public` directory.
- **Cart/Order issues**: Verify stock levels and ensure cart is not empty before placing an order.

## Future Improvements
- Add a database (e.g., MongoDB) for persistent storage.
- Implement authentication and role-based access control.
- Enhance UI with animations and order history.
- Add unit tests for backend and frontend logic.

## Repository
The code is available at `<repository-url>` (to be hosted on GitHub).