// ussdController.js
const logger = require('./utils/logger');

module.exports = {
  handleUssdRequest: (req, res) => {
    const { sessionId, phoneNumber, text } = req.body;
    
    logger.info('USSD request received', {
      sessionId,
      phoneNumber,
      text,
      ip: req.ip
    });
    
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
    
    logger.info('USSD response sent', {
      sessionId,
      phoneNumber,
      responseType: response.startsWith('CON') ? 'continue' : 'end'
    });
    
    res.send(response);
  }
};
