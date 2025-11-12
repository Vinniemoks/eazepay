const express = require('express');
const app = express();
const port = 8020;

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`IoT service listening at http://localhost:${port}`);
});
