const jwt = require('jsonwebtoken');                            

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send('Access denied: no token provided');
    
    try {
        req.user = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        next();
    } catch (ex) {
        res.status(400).send('Access denied: invalid token');
    }
}