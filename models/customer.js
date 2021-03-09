const mongoose = require('mongoose');  
const Joi = require('joi');                

const schema = new mongoose.Schema({
    isGold: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    phone: {
        type: String,
        required: true,
        min: 5,
        max: 50
    }
});

schema.statics.validate = function(customer) {
    const schema = { 
        name: Joi.string().min(5).max(50).required(), 
        phone: Joi.string().min(5).max(10).required(),
        isGold: Joi.boolean()
    };

    return Joi.object(schema).validate(customer).error;
}

module.exports = mongoose.model('Customer', schema);