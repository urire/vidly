const auth = require('../middleware/auth');
const validate = require('../middleware/validate');                      
const router = require('express').Router();
const _ = require('lodash');  
const User = require('../models/user');  

router.get('/me', auth, async (req, res) => {
    // find user
    const user = await User.findById(req.user._id).select('-password');

    // send user as response
    res.send(user);
});

router.post('/', validate(User.validate), async (req, res) => {
    // check if user already exist
    let user = await User.findOne({ email: req.body.email });
    if(user) return res.status(400).send('Already registered');
    
    // create new user
    user = new User(_.pick(req.body, ['name', 'email', 'password']));

    // add admin option
    if(req.body.isAdmin) user.isAdmin = true;

    // hash password
    await user.hashPassword();

    // save user to db
    await user.save();

    // send user as response (add authorization token to the header)
    res.header('x-auth-token', user.authToken()).send(_.pick(user, ['_id', 'name', 'email']));
});

module.exports = router;