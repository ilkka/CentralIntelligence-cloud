const fs = require('fs');

module.exports = {
    apikey: fs.readFileSync('/run/secrets/telegram-bot-apikey', { encoding: 'utf-8' }).trim()
};
