const request = require('supertest');                 
const User = require('../../../models/user');

describe('/api/users', () => {
    it('dummy test', () => { expect(1).toEqual(1); });
});

module.exports = function() {
    describe('/api/users', () => {
        let server;
        let token;

        beforeEach(() => { 
            server = require('../../../index'); 
            token = new User().authToken();
        });

        afterEach(async () => {               
            await server.close();   
            await User.remove({});        
        });

        describe('GET /me', () => {

            const exec = async () => {
                return await request(server)
                        .get('/api/users/me')
                        .set('x-auth-token', token)
                        .send();
            };

            it('should return 401 if token not provided', async () => {
                token = '';

                res = await exec();
                
                expect(res.status).toBe(401);

            });

            it('should return 400 if token is invalid', async () => {
                token = 'a';

                res = await exec();
                
                expect(res.status).toBe(400);

            });

            it('should return user if authorized', async () => {
                user = new User({
                    name: '12345',
                    email: 'mail@gmail.com',
                    password: '!123456789'
                });
                await user.save();
                token = user.authToken();

                res = await exec();
                
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('_id', user._id.toHexString());
                expect(res.body).toHaveProperty('name', '12345');
                expect(res.body).toHaveProperty('email', 'mail@gmail.com');
                expect(res.body).not.toHaveProperty('password');
            });
        });


        describe('POST /', () => {
            let name;
            let email;
            let password;

            const exec = async () => {
                return await request(server)
                        .post('/api/users')
                        .set('x-auth-token', token)
                        .send({
                            name,
                            email,
                            password
                        });
            };

            beforeEach(() => { 
                name = '12345'; 
                email = 'mail@gmail.com';
                password = '!123456789';
            });

            it('should return 400 if name is less than 5 characters', async () => {
                name = '1234';
                
                const res = await exec();

                expect(res.status).toBe(400);
            });

            it('should return 400 if name is more than 50 characters', async () => {
                name = new Array(52).join('a');
                
                const res = await exec();

                expect(res.status).toBe(400);
            });

            it('should return 400 if email is less than 5 characters', async () => {
                email = '1234';
                
                const res = await exec();

                expect(res.status).toBe(400);
            });

            it('should return 400 if email is more than 255 characters', async () => {
                email = new Array(256).join('a');
                
                const res = await exec();

                expect(res.status).toBe(400);
            });

            it('should return 400 if email is not a valid email', async () => {
                email = '12345';
                
                const res = await exec();

                expect(res.status).toBe(400);
            });

            it('should return 400 if password is less than 10 characters', async () => {
                password = '12345';
                
                const res  = await exec();

                expect(res.status).toBe(400);
            });

            it('should return 400 if password is more than 30 characters', async () => {
                password = new Array(31).join('a');
                
                const res = await exec();

                expect(res.status).toBe(400);
            });

            it('should return 400 if password is invalid', async () => {
                password = '1234567891';
                
                const res = await exec();

                expect(res.status).toBe(400);
            });

            it('should return 400 if user already registered', async () => {
                const user = new User({
                    name,
                    email,
                    password
                });
                await user.save();

                const res = await exec();

                expect(res.status).toBe(400);
            });

            it('should save user if it is valid', async () => {
                await exec();
    
                const user = await User.find({ email });
    
                expect(user).not.toBeNull();
            });

            it('should return user if it is valid', async () => {
                const res  = await exec();

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('_id');
                expect(res.body).toHaveProperty('name', '12345');
                expect(res.body).toHaveProperty('email', 'mail@gmail.com');
                expect(res.body).not.toHaveProperty('password');
            });
        });
    });
}