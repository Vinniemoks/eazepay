const express = require('express');
const app = express();
const PORT = process.env.PORT || 8004;
const ussdController = require('./ussdController');

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ussd-service' });
});

app.post('/api/ussd', ussdController.handleUssdRequest);

app.listen(PORT, () => {
  console.log(`USSD Service running on port ${PORT}`);
});
