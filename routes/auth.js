const validate = require('../middleware/validate');            
const router = require('express').Router();                 
const User = require('../models/user');  

router.post('/', validate(User.authenticate), async (req, res) => {
    // check if user already exists
    const user = await User.findOne({ email: req.body.email });
    if(!user) return res.status(400).send('Invalid email');
    
    // authenticate password
    const validPassword = await user.checkPassword(req.body.password);
    if(!validPassword) return res.status(400).send('Invalid password');

    // send authentication token as response
    res.send(user.authToken());
});

module.exports = router;