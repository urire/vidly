const objectId = require('../../../middleware/objectId');
const mongoose = require('mongoose');

describe('validateObjectId middleware', () => {
    it('should return 404 if id is invalid', () => {
        function status(state) {
            this.status = state;
            return this;
        }
        const req = { params: { id: '1' } };
        const res = {
            status: status,
            send: jest.fn()
        };
        const next = jest.fn();

        objectId(req, res, next);

        expect(res.status).toBe(404);
    });

    it('should call next if id is valid', () => {
        let res = 0;
        function next() {
            res = 1;
        }
        const req = { params: { id: mongoose.Types.ObjectId().toHexString() } };

        objectId(req, res, next);

        expect(res).toEqual(1);
    });
});