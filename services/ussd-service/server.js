const app = require('./index');
const PORT = process.env.PORT || 8004;
app.listen(PORT, () => {
  console.log(`USSD Service running on port ${PORT}`);
});
