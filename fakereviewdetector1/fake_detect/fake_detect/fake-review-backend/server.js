require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const reviewsRouter = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

app.use('/api/reviews', reviewsRouter);

app.get('/', (req, res) => {
  res.json({
    message: '🔍 Fake Review Detector API is running!',
    endpoints: {
      'POST /api/reviews/analyze': 'Analyze a review (no save)',
      'POST /api/reviews/submit':  'Analyze + save to database',
      'GET  /api/reviews':         'Get all saved reviews',
      'GET  /api/reviews/stats':   'Get fake/real counts',
      'DELETE /api/reviews/:id':   'Delete a review',
    },
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});