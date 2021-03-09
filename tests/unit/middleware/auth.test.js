const auth = require('../../../middleware/auth');
const mongoose = require('mongoose');
const User = require('../../../models/user');

describe('auth middleware', () => {
    it('should populate req.user with the payload of the valid JWT', () => {
        const user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            isAdmin: true
        };
        const req = { header: jest.fn(() => new User(user).authToken()) };
        const res = {};
        const next = jest.fn();

        auth(req, res, next);

        expect(req.user).toMatchObject(user);
    });
});