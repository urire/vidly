const admin = require('../../../middleware/admin');
const mongoose = require('mongoose');

describe('admin middleware', () => {
    it('should return 403 if user is not an admin', () => {
        function status(state) {
            this.status = state;
            return this;
        }
        const user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            isAdmin: false
        };
        const req = { user: user};
        const res = {
            status: status,
            send: jest.fn()
        };
        const next = jest.fn();

        admin(req, res, next);

        expect(res.status).toBe(403);
    });

    it('should call next if user is an admin', () => {
        let res = 0;
        function next() {
            res = 1;
        }
        const user = { isAdmin: true };
        const req = { user: user};

        admin(req, res, next);

        expect(res).toEqual(1);
    });
});