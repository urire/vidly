const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const objectId = require('../middleware/objectId');
const router = require('express').Router();
const _ = require('lodash');  
const Genre = require('../models/genre');
const Movie = require('../models/movie'); 

router.get('/', async (req, res) => {
    // find all movies
    const movies = await Movie.find().sort('title');

    // send movies as response
    res.send(movies);
});

router.get('/:id', objectId, async (req, res) => {
    // find movie by id
    const movie = await Movie.findById(req.params.id);
    if(!movie) return res.status(404).send('Movie with given id was not found');
    
    // send movie as response
    res.send(movie);
});

router.post('/', [auth, validate(Movie.validate)], async (req, res) => {
    // validate genre
    const genre = await Genre.findById(req.body.genreId);
    if(!genre) return res.status(404).send('Genre with given id was not found');
    
    // create new movie
    const movie = new Movie({ 
        ..._.pick(req.body, ['title', 'numberInStock', 'dailyRentalRate']),
        genre: _.pick(genre, ['_id', 'name'])
    });

    // save movie to db
    await movie.save();

    // send movie as response
    res.send(movie);
});

router.put('/:id', [auth, admin, objectId, validate(Movie.validate)], async (req, res) => { 
    // find and update movie
    const movie = await Movie.findByIdAndUpdate(req.params.id, _.pick(req.body, ['title', 'numberInStock', 'dailyRentalRate']), { new: true });  
    if(!movie) return res.status(404).send('Movie with given id was not found');

    // send movie as response
    res.send(movie);
});

router.delete('/:id', [auth, admin, objectId], async (req, res) => {
    // find and remove movie
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if(!movie) return res.status(404).send('Movie with given id was not found');

    // send movie as response
    res.send(movie);
});

module.exports = router;