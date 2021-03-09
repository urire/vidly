const request = require('supertest');  
const User = require('../../../models/user');  

describe('/api/auth', () => {
    it('dummy test', () => { expect(1).toEqual(1); });
});

module.exports = () => {
    describe('/api/auth', () => {
        let server;

        beforeEach(() => { 
            server = require('../../../index');    
            token = new User().authToken();
        });

        afterEach(async () => {  
            await User.remove({});              
            await server.close();                 
        });

        describe('POST /', () => {
            let email;
            let password;

            const exec = async () => {
                return await request(server)
                        .post('/api/auth')
                        .set('x-auth-token', token)
                        .send({
                            email,
                            password
                        });
            };

            beforeEach(() => { 
                email = 'uri.reichman88@gmail.com';
                password = '123456789!';
            });

            it('should return 400 if password is less than 5 characters', async () => {
                password = '1234';
                
                const res = await exec();

                expect(res.status).toBe(400);
            });

            it('should return 400 if password is more than 1024 characters', async () => {
                password = new Array(1025).join('a');
                
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

            it('should return 400 if email is invalid email', async () => {
                email = '12345';
                
                const res = await exec();

                expect(res.status).toBe(400);
            });

            it('should return 400 if user not exists', async () => {           
                const res = await exec();

                expect(res.status).toBe(400);
            });

            it('should return 400 if password is invalid', async () => {   
                const user = await request(server)
                    .post('/api/users')
                    .set('x-auth-token', token)
                    .send({
                        name: '12345',
                        email,
                        password
                    });

                token = user.header['x-auth-token'];

                password = '!123456789!'
                
                const res = await exec();

                expect(res.status).toBe(400);
            });

            it('should return token if input is valid', async () => {   
                const user = await request(server)
                    .post('/api/users')
                    .set('x-auth-token', token)
                    .send({
                        name: '12345',
                        email,
                        password
                    });

                token = user.header['x-auth-token'];

                const res = await exec();

                expect(res.status).toBe(200);
                expect(res.text).toEqual(user.header['x-auth-token']);
            });
        });
    });
}
