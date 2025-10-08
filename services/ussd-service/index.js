const express = require('express');
const app = express();
const ussdController = require('./ussdController');

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ussd-service' });
});

app.post('/api/ussd', ussdController.handleUssdRequest);

module.exports = app;
