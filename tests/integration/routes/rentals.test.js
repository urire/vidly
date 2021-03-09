const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../../models/user');      
const Rental = require('../../../models/rental');  
const Customer = require('../../../models/customer');  
const Movie = require('../../../models/movie'); 
const Genre = require('../../../models/genre');   

describe('/api/rentals', () => {
    it('dummy test', () => { expect(1).toEqual(1); });
});

module.exports = function() {
    describe('/api/rentals', () => {
        let server;
        let token;

        beforeEach(() => { 
            server = require('../../../index'); 
            token = new User().authToken();
        });

        afterEach(async () => {               
            await server.close();   
            await Rental.remove({});    
            await Customer.remove({}); 
            await Movie.remove({}); 
            await Genre.remove({});    
        });

        describe('POST /', async () => {
            let customer;      
            let movie;
            let genre;
            let customerId;      
            let movieId 

            const exec = async () => {
                return await request(server)
                    .post('/api/rentals')
                    .set('x-auth-token', token)
                    .send({ 
                        customerId: customerId,
                        movieId: movieId
                    });
            };

            beforeEach(async () => {
                customer = new Customer({
                    name: '12345',
                    phone: '12345'
                });
                await customer.save();

                genre = new Genre({ name: 'genre1' });
                await genre.save();

                movie = new Movie({
                    title: 'movie',
                    genre,
                    numberInStock: 10,
                    dailyRentalRate: 2
                }); 

                await movie.save();

                customerId = customer._id;
                movieId = movie._id;
            });

            it('should return 401 if client did not logged in', async () => {
                token = '';
    
                const res = await exec();
    
                expect(res.status).toBe(401);
            });

            it('should return 400 if customer object id is invalid', async () => {
                customerId = '1234';
    
                const res = await exec();
    
                expect(res.status).toBe(400);
            });

            it('should return 400 if movie object id is invalid', async () => {
                movieId = '1234';
    
                const res = await exec();
    
                expect(res.status).toBe(400);
            });

            it('should return 400 if customer object id is invalid', async () => {
                customerId = mongoose.Types.ObjectId();
    
                const res = await exec();
    
                expect(res.status).toBe(400);
            });

            it('should return 400 if movie object id is invalid', async () => {
                movieId = mongoose.Types.ObjectId();
    
                const res = await exec();
    
                expect(res.status).toBe(400);
            });

            it('should return 400 if movie stock is 0', async () => {
                movie.numberInStock = 0;
                await movie.save();
    
                const res = await exec();
    
                expect(res.status).toBe(400);
            });

            it('should return 200 if input is valid', async () => {
                const res = await exec();
    
                expect(res.status).toBe(200);
                expect(Object.keys(res.body)).toEqual(expect.arrayContaining([
                    '_id',
                    'customer',
                    'movie',
                    'dateRented'          
                ])); 
            });
        });
    });
}