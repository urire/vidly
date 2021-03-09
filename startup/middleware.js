const error = require('../middleware/error');       
const express = require('express');                 

module.exports = app => {
    app.use(express.json());
    app.use(error);
}