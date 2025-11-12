const express = require('express');
const app = express();
const port = 8005;

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Agent service listening at http://localhost:${port}`);
});
