require('dotenv').config();

module.exports = () => { 
    if(!process.env.JWT_PRIVATE_KEY) throw new Error('JWT_PRIVATE_KEY is not defined') 
}
