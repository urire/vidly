const mongoose = require('mongoose');   // returns mongoose module
const Joi = require('joi');             // returns Joi class

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    }
});

schema.statics.validate = genre => {
    const schema = { 
        name: Joi.string().min(5).max(50).required() 
    };

    return Joi.object(schema).validate(genre).error;
}

module.exports = mongoose.model('Genre', schema);
module.exports.schema = schema;