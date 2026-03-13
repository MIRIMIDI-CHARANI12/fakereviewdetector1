const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { analyzeReview } = require('../services/detectionService');

// Analyze only (no save)
router.post('/analyze', async (req, res) => {
  const { reviewText, rating, reviewerName } = req.body;
  if (!reviewText) return res.status(400).json({ error: 'reviewText is required' });
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1-5' });

  const analysis = analyzeReview(reviewText, rating, reviewerName);
  return res.status(200).json({ success: true, analysis });
});

// Analyze + save to Supabase
router.post('/submit', async (req, res) => {
  const { reviewText, rating, reviewerName, productName } = req.body;
  if (!reviewText) return res.status(400).json({ error: 'reviewText is required' });
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1-5' });

  const analysis = analyzeReview(reviewText, rating, reviewerName);

  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      review_text: reviewText,
      rating,
      reviewer_name: reviewerName || 'Anonymous',
      product_name: productName || 'Unknown Product',
      fake_score: analysis.score,
      verdict: analysis.verdict,
      flags: analysis.flags,
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to save', details: error.message });
  return res.status(201).json({ success: true, savedReview: data, analysis });
});

// Get all reviews
router.get('/', async (req, res) => {
  const { verdict } = req.query;
  let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
  if (verdict) query = query.eq('verdict', verdict.toUpperCase());

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: 'Failed to fetch', details: error.message });
  return res.status(200).json({ success: true, count: data.length, reviews: data });
});

// Get stats
router.get('/stats', async (req, res) => {
  const { data, error } = await supabase.from('reviews').select('verdict, fake_score');
  if (error) return res.status(500).json({ error: 'Failed to fetch stats' });

  const total = data.length;
  return res.status(200).json({
    success: true,
    stats: {
      total,
      fake: data.filter(r => r.verdict === 'FAKE').length,
      suspicious: data.filter(r => r.verdict === 'SUSPICIOUS').length,
      likelyReal: data.filter(r => r.verdict === 'LIKELY REAL').length,
      averageFakeScore: total > 0 ? Math.round(data.reduce((s, r) => s + r.fake_score, 0) / total) : 0,
    },
  });
});

// Delete a review
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('reviews').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Failed to delete' });
  return res.status(200).json({ success: true, message: `Review ${req.params.id} deleted` });
});

module.exports = router;