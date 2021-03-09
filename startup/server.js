const winston = require('winston');       

const port = process.env.PORT || 3000;

module.exports = app => app.listen(port, () => winston.info(`Listening on port ${port}...`))
