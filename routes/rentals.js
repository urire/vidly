const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const router = require('express').Router();
const _ = require('lodash'); 
const mongoose = require('mongoose');
const Movie = require('../models/movie');                  
const Customer = require('../models/customer');       
const Rental = require('../models/rental');  

router.post('/', [auth, validate(Rental.validate)], async (req, res) => {   
    // find customer by id
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalid customer');

    // find movie by id
    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send('Invalid movie');

    // check if movie in stock
    if (movie.numberInStock === 0) return res.status(400).send('Movie not in stock.');

    // create new rental
    const rental = new Rental({ 
        customer: _.pick(customer, ['_id', 'name', 'phone']),
        movie: _.pick(movie, ['_id', 'title', 'dailyRentalRate'])       
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    // save rental
    await rental.save();

    // update movie
    await movie.update({ $inc: { numberInStock: -1 } });

    await session.commitTransaction();
    session.endSession();

    // send rental as response
    res.send(rental);
});

module.exports = router;