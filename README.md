# StoreFront - React & Node.js (L10)

Full-stack e-commerce application with React frontend and Node.js/Express backend.

---

## Project Structure

```
storefront-react/
├── server.js                    # Node.js backend
├── orders.json                  # Data storage (auto-created)
├── package.json
├── README.md
└── src/
    ├── index.html
    ├── index.js
    ├── App.js
    ├── App.css
    ├── components/
    │   ├── Navbar.js
    │   ├── HomePage.js
    │   ├── SignUpPage.js
    │   ├── ProductsPage.js
    │   ├── CartPage.js
    │   ├── FinalizationPage.js
    │   ├── OrderHistoryPage.js    # NEW (L10)
    │   └── OrderApprovalPage.js   # NEW (L10)
    └── utils/
        └── localStorage.js
```

---

## Installation

### 1. Change Directory to the Project Folder

```bash
cd /path/to/directory/storefront-demo-react/
```

Make sure you see the `package.json` file when you run the `ls` command.

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Backend Packages (optional for this project, for your own project you have to install this command so that your project.json file gets these dependencies)

```bash
npm install express cors
```

---

## Running the Application

**You must run TWO servers:**

### Terminal 1: Backend

```bash
npm run server
```

Expected output:
```
Server running on http://localhost:3000
```

### Terminal 2: Frontend

```bash
npm start
```

Expected output:
```
Server running at http://localhost:1234
```

### Access

- Frontend: http://localhost:1234
- Backend: http://localhost:3000

---

## API Endpoints

### Create Order
```
POST /api/orders
Body: { items, total, shipping, payment }
Response: { success: true, orderId: "ORD-123" }
```

### Get All Orders
```
GET /api/orders
Response: [ { orderId, status, items, ... } ]
```

### Get Single Order
```
GET /api/orders/:orderId
Response: { orderId, status, items, ... }
```

### Approve Order
```
PUT /api/orders/:orderId/approve
Response: { success: true, message: "Order approved" }
```

### Decline Order
```
PUT /api/orders/:orderId/decline
Response: { success: true, message: "Order declined" }
```

---

## Key Concepts

### File System (fs) Module

```javascript
const fs = require('fs');
const path = require('path');

// Define file path
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Read from file
function readOrders() {
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
}

// Write to file
function writeOrders(orders) {
    const data = JSON.stringify(orders, null, 2);
    fs.writeFileSync(ORDERS_FILE, data, 'utf8');
}
```

### CORS Setup

```javascript
const cors = require('cors');
app.use(cors());
```

---

## Adapting for Your Theme

### Conference Theme
- Change: `orders.json` → `registrations.json`
- Change: `/api/orders` → `/api/registrations`
- Update: React components to match theme

### Magazine Theme
- Change: `orders.json` → `articles.json`
- Change: `/api/orders` → `/api/articles`
- Update: React components to match theme

---

## Troubleshooting

### Backend won't start
```bash
npm install express cors
```

### CORS errors
Add before routes: `app.use(cors())`

### Port already in use
Change PORT in server.js to 3001 and update React fetch URLs

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "parcel": "^2.9.0",
    "process": "^0.11.10"
  }
}
```

---

## Available Scripts

```json
{
  "scripts": {
    "start": "parcel src/index.html --open",
    "server": "node server.js"
  }
}
```

---

IST 256 - Penn State University - 2026