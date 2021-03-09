const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../../models/user');

describe('user.authToken', () => {
    it('should return a valid token', () => {
        const payload = { 
            _id: new mongoose.Types.ObjectId().toHexString(), 
            isAdmin: true 
        };
        const user = new User(payload);
        const token = user.authToken();
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

        expect(decoded).toMatchObject(payload);
    });
});