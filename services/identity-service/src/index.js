const express = require('express');
const app = express();
const port = 8000;

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Identity service listening at http://localhost:${port}`);
});
