const fs = require('fs');

module.exports = {
    fmiApikey: fs.readFileSync('/run/secrets/fmi-apikey', { encoding: 'utf-8' }).trim()
};
