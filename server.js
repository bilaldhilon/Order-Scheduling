const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const cors = require('cors');
const app = express();
const port = 3000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});

// In-memory storage
let items = [
  { id: 1, name: 'Laptop', price: 999.99, stock: 10 },
  { id: 2, name: 'Phone', price: 499.99, stock: 20 },
  { id: 3, name: 'Headphones', price: 79.99, stock: 50 }
];

let offers = [
  { id: 1, name: 'Buy 2 Get 10% Off', condition: { minItems: 2 }, discount: 0.1 },
  { id: 2, name: 'Laptop 5% Off', condition: { itemId: 1 }, discount: 0.05 }
];

let orders = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Request logging
app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  next();
});

// Error handling for malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error(`Invalid JSON: ${err.message}`);
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  logger.error(`${err.message} - ${req.originalUrl}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Browse Items
app.get('/items', (req, res) => {
  try {
    res.json(items);
  } catch (err) {
    logger.error(`Error fetching items: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Order Items
app.post('/orders', (req, res) => {
  try {
    const { items: orderItems } = req.body;
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      logger.warn('Invalid order data');
      return res.status(400).json({ error: 'Invalid order data' });
    }

    // Validate stock
    for (const orderItem of orderItems) {
      const item = items.find(i => i.id === orderItem.id);
      if (!item) {
        logger.warn(`Item ${orderItem.id} not found`);
        return res.status(400).json({ error: `Item ${orderItem.id} not found` });
      }
      if (item.stock < orderItem.quantity) {
        logger.warn(`Insufficient stock for item ${orderItem.id}`);
        return res.status(400).json({ error: `Insufficient stock for item ${orderItem.id}` });
      }
    }

    // Calculate total and apply offers
    let total = 0;
    let appliedOffers = [];
    for (const orderItem of orderItems) {
      const item = items.find(i => i.id === orderItem.id);
      total += item.price * orderItem.quantity;
    }

    // Apply offers
    for (const offer of offers) {
      if (offer.condition.minItems && orderItems.reduce((sum, oi) => sum + oi.quantity, 0) >= offer.condition.minItems) {
        total *= (1 - offer.discount);
        appliedOffers.push(offer.name);
      } else if (offer.condition.itemId && orderItems.some(oi => oi.id === offer.condition.itemId)) {
        total *= (1 - offer.discount);
        appliedOffers.push(offer.name);
      }
    }

    // Update stock
    for (const orderItem of orderItems) {
      const item = items.find(i => i.id === orderItem.id);
      item.stock -= orderItem.quantity;
    }

    const order = { id: orders.length + 1, items: orderItems, total, appliedOffers, date: new Date() };
    orders.push(order);
    logger.info(`Order placed: ${order.id}`);
    res.status(201).json(order);
  } catch (err) {
    logger.error(`Error placing order: ${err.message}`);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get Offers
app.get('/offers', (req, res) => {
  try {
    res.json(offers);
  } catch (err) {
    logger.error(`Error fetching offers: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Manage Inventory (Add/Update)
app.post('/items-management', (req, res) => {
  try {
    const { id, name, price, stock } = req.body;
    if (!name || typeof price !== 'number' || price < 0 || typeof stock !== 'number' || stock < 0) {
      logger.warn('Invalid item data');
      return res.status(400).json({ error: 'Invalid item data' });
    }

    const existingItem = items.find(i => i.id === id);
    if (existingItem) {
      existingItem.name = name;
      existingItem.price = price;
      existingItem.stock = stock;
      logger.info(`Updated item ${id}`);
      res.json(existingItem);
    } else {
      const newItem = { id: items.length + 1, name, price, stock };
      items.push(newItem);
      logger.info(`Added item ${newItem.id}`);
      res.status(201).json(newItem);
    }
  } catch (err) {
    logger.error(`Error managing item: ${err.message}`);
    res.status(500).json({ error: 'Failed to manage item' });
  }
});

// Manage Inventory (Remove)
app.delete('/items-management/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = items.findIndex(i => i.id === id);
    if (index === -1) {
      logger.warn(`Item ${id} not found`);
      return res.status(404).json({ error: 'Item not found' });
    }
    items.splice(index, 1);
    logger.info(`Removed item ${id}`);
    res.status(204).send();
  } catch (err) {
    logger.error(`Error removing item: ${err.message}`);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Manage Offers (Add/Update)
app.post('/offers-management', (req, res) => {
  try {
    const { id, name, condition, discount } = req.body;
    if (!name || typeof discount !== 'number' || discount < 0 || discount > 1 || !condition) {
      logger.warn('Invalid offer data');
      return res.status(400).json({ error: 'Invalid offer data' });
    }

    const existingOffer = offers.find(o => o.id === id);
    if (existingOffer) {
      existingOffer.name = name;
      existingOffer.condition = condition;
      existingOffer.discount = discount;
      logger.info(`Updated offer ${id}`);
      res.json(existingOffer);
    } else {
      const newOffer = { id: offers.length + 1, name, condition, discount };
      offers.push(newOffer);
      logger.info(`Added offer ${newOffer.id}`);
      res.status(201).json(newOffer);
    }
  } catch (err) {
    logger.error(`Error managing offer: ${err.message}`);
    res.status(500).json({ error: 'Failed to manage offer' });
  }
});

// Manage Offers (Remove)
app.delete('/offers-management/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = offers.findIndex(o => o.id === id);
    if (index === -1) {
      logger.warn(`Offer ${id} not found`);
      return res.status(404).json({ error: 'Offer not found' });
    }
    offers.splice(index, 1);
    logger.info(`Removed offer ${id}`);
    res.status(204).send();
  } catch (err) {
    logger.error(`Error removing offer: ${err.message}`);
    res.status(500).json({ error: 'Failed to remove offer' });
  }
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});