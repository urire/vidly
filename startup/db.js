const config = require('config');
const mongoose = require('mongoose');
const winston = require('winston');

module.exports = async () => {
    const db = config.get('db');

    await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }); 

    winston.info(`Connected to ${db}...`);
};