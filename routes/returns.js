const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const router = require('express').Router();
const mongoose = require('mongoose');                     
const Rental = require('../models/rental');       
const Movie = require('../models/movie');


router.post('/', [auth, validate(Rental.validate)], async (req, res) => {
    // find rental from custumerId and movieId
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);
    if(!rental) return res.status(404).send('Rental not found');

    // check if rental already processed
    if(rental.dateReturned) return res.status(400).send('Return date already processed');

    // calculate return fee
    rental.returnFee();

    const session = await mongoose.startSession();
    session.startTransaction();

    // save rental 
    await rental.save();

    // update movie
    await Movie.updateOne({ _id: rental.movie._id }, { $inc: { numberInStock: 1 } });

    await session.commitTransaction();
    session.endSession();

    // send rental as result
    res.send(rental);
});

module.exports = router;