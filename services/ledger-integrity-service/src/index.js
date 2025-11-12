const express = require('express');
const app = express();
const port = 8013;

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Ledger Integrity Service listening at http://localhost:${port}`);
});
