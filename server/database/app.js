const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = Number(process.env.PORT || 3030);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

const readData = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', name), 'utf8'));
const reviewsData = readData('reviews.json').reviews;
const dealershipsData = readData('dealerships.json').dealerships;
const Reviews = require('./review');
const Dealerships = require('./dealership');
const Cars = require('./inventory');

const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/dealershipsDB';
mongoose.connect(mongoUrl).then(async () => {
  await Reviews.deleteMany({});
  await Reviews.insertMany(reviewsData);
  await Dealerships.deleteMany({});
  await Dealerships.insertMany(dealershipsData);
  const carData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'car_records.json'), 'utf8'));
  await Cars.deleteMany({});
  await Cars.insertMany(carData.car_records || carData.cars || []);
  console.log('Dealer, review, and inventory data loaded.');
}).catch((error) => console.error('MongoDB connection failed:', error.message));

app.get('/', (_req, res) => res.send('Welcome to the Dealership API'));
app.get('/fetchReviews', async (_req, res) => {
  try { res.json(await Reviews.find().lean()); }
  catch (error) { res.status(500).json({ error: 'Error fetching reviews' }); }
});
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try { res.json(await Reviews.find({ dealership: Number(req.params.id) }).sort({ id: 1 }).lean()); }
  catch (error) { res.status(500).json({ error: 'Error fetching reviews' }); }
});
app.get('/fetchDealers', async (_req, res) => {
  try { res.json(await Dealerships.find().sort({ id: 1 }).lean()); }
  catch (error) { res.status(500).json({ error: 'Error fetching dealerships' }); }
});
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state;
    const query = state.toLowerCase() === 'all' ? {} : { state: state.trim() };
    res.json(await Dealerships.find(query).sort({ id: 1 }).lean());
  } catch (error) { res.status(500).json({ error: 'Error fetching dealerships' }); }
});
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealer = await Dealerships.findOne({ id: Number(req.params.id) }).lean();
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
    res.json([dealer]);
  } catch (error) { res.status(500).json({ error: 'Error fetching dealer' }); }
});
app.get('/fetchCars', async (_req, res) => {
  try { res.json(await Cars.find().limit(200).lean()); }
  catch (error) { res.status(500).json({ error: 'Error fetching cars' }); }
});
app.post('/insert_review', async (req, res) => {
  try {
    const last = await Reviews.findOne().sort({ id: -1 }).lean();
    const review = await Reviews.create({ ...req.body, id: (last?.id || 0) + 1, dealership: Number(req.body.dealership), car_year: Number(req.body.car_year) });
    res.status(201).json(review.toObject());
  } catch (error) { res.status(400).json({ error: 'Could not insert review', details: error.message }); }
});

app.listen(port, '0.0.0.0', () => console.log(`Dealer API listening on port ${port}`));
