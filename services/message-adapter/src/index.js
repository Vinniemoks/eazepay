const express = require('express');
const app = express();
const port = 8011;

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Message Adapter listening at http://localhost:${port}`);
});
