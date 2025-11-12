const express = require('express');
const app = express();
const port = 8012;

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Recon Service listening at http://localhost:${port}`);
});
