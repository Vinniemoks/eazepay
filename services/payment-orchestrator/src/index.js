const express = require('express');
const app = express();
const port = 8010;

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Payment Orchestrator listening at http://localhost:${port}`);
});
