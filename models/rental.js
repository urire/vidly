const mongoose = require('mongoose');       
const moment = require('moment');         
const Joi = require('joi');             

const schema = new mongoose.Schema({
    customer: { 
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            },
            isGold: {
                type: Boolean,
                default: false
            },
            phone: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            }      
        }),  
        required: true
      },
    movie: {
        type: new mongoose.Schema({
            title: {
                type: String,
                required: true,
                trim: true, 
                minlength: 5,
                maxlength: 255
            },
            dailyRentalRate: { 
                type: Number, 
                required: true,
                min: 0,
                max: 255
            }   
        }),
        required: true
    },
    dateRented: { 
        type: Date, 
        required: true,
        default: Date.now
    },
    dateReturned: { 
        type: Date
    },
    rentalFee: { 
        type: Number, 
        min: 0
    }
});

schema.statics.validate = rental => {
    const schema = {  
      customerId: Joi.objectId().required(),
      movieId: Joi.objectId().required() 
    };
  
    return Joi.object(schema).validate(rental).error;
}

schema.statics.lookup = async function(custumerId, movieId) {
  return await this.findOne({ 'customer._id': custumerId, 'movie._id': movieId });
}

schema.methods.returnFee = function() {
  this.dateReturned = new Date();
  this.rentalFee = moment().diff(this.dateRented, 'days') * this.movie.dailyRentalRate;
}

module.exports = mongoose.model('Rental', schema);