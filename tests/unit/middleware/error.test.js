const error = require('../../../middleware/error');

describe('error middleware', () => {
    it('should return 500 if called', () => {
        function status(state) {
            this.status = state;
            return this;
        }
        const req = {};
        const res = {
            status: status,
            send: jest.fn()
        };
        const next = jest.fn();
        const err = {};

        error(err, req, res, next);

        expect(res.status).toBe(500);
    });
});