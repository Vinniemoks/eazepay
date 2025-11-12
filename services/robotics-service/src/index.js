const express = require('express');
const app = express();
const port = 8040;

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Robotics service listening at http://localhost:${port}`);
});
