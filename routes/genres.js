const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const objectId = require('../middleware/objectId');
const router = require('express').Router();  
const Genre = require('../models/genre');  

router.get('/', async (req, res) => {
    // find all genres
    const genres = await Genre.find().sort('name');

    // send genres as response
    res.send(genres);
});

router.get('/:id', objectId, async (req, res) => {
    // find genre by id
    const genre = await Genre.findById(req.params.id);
    if(!genre) return res.status(404).send('Genre with given id was not found');
    
    // send genre as response
    res.send(genre);
});

router.post('/', [auth, validate(Genre.validate)], async (req, res) => {
    // check if genre already exist
    let genre = await Genre.findOne({ name: req.body.name });
    if(genre) return res.status(400).send('Genre with the given name already exist');

    // create new genre
    genre = new Genre({ name: req.body.name });

    // save genre to db
    await genre.save();

    // send genre as response
    res.send(genre);
});

router.put('/:id', [auth, objectId, validate(Genre.validate)], async (req, res) => {  
    // check if genre already exist
    let genre = await Genre.findOne({ name: req.body.name });
    if(genre) return res.status(400).send('Genre with the given name already exist');

    // find and update genre
    genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if(!genre) return res.status(404).send('Genre with given id was not found');

    // send genre as response
    res.send(genre);
});

router.delete('/:id', [auth, admin, objectId], async (req, res) => {
    // find and remove genre
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if(!genre) return res.status(404).send('Genre with given id was not found');

    // send genre as response
    res.send(genre);
});

module.exports = router;