// ussdController.js
module.exports = {
  handleUssdRequest: (req, res) => {
    const { sessionId, phoneNumber, text } = req.body;
    // Basic USSD menu logic
    let response = '';
    if (!text || text === '') {
      response = 'CON Welcome to AfriPay USSD!\n1. Check Balance\n2. Send Money';
    } else if (text === '1') {
      response = 'END Your balance is NGN 10,000.';
    } else if (text === '2') {
      response = 'CON Enter recipient phone number:';
    } else {
      response = 'END Invalid option.';
    }
    res.send(response);
  }
};
