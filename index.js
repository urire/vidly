const app = require('express')();

require('./startup/logs')();
require('./startup/config')();
require('./startup/objectid')();
require('./startup/db')();
require('./startup/middleware')(app);
require('./startup/routes')(app);
require('./startup/prod')(app);

module.exports = require('./startup/server')(app);