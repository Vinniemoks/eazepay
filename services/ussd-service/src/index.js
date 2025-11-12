const express = require('express');
const app = express();
const port = 8004;

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`USSD service listening at http://localhost:${port}`);
});
