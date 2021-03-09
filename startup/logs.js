const config = require('config');
const winston = require('winston');  
require('winston-mongodb');
require('express-async-errors');

module.exports = () => {   
    process.on('unhandledRejection', ex => { throw ex });

    winston.add(new winston.transports.File({
        filename: './logs/info.log',
        level: 'info',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json())
    }));
    winston.add(new winston.transports.File({
        filename: './logs/exceptions.log',
        level: 'error',
        handleExceptions: true,
        format: winston.format.combine(winston.format.timestamp(), winston.format.json())
    }));
    winston.add(new winston.transports.Console({
        level: 'info',
        handleExceptions: true,
        format: winston.format.simple()
    }));    
    winston.add(new winston.transports.MongoDB({
        level: 'error',
        db: config.get('db'),
        handleExceptions: true,
        options: { useUnifiedTopology: true, useNewUrlParser: true },
        format: winston.format.combine(winston.format.timestamp(), winston.format.json())
    }));
};