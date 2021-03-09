const request = require('supertest');
const mongoose = require('mongoose');
const Movie = require('../../../models/movie');                      
const User = require('../../../models/user');
const Genre = require('../../../models/genre');

describe('/api/movies', () => {
    it('dummy test', () => { expect(1).toEqual(1); });
});

module.exports = function() {
    describe('/api/movies', () => {
        let server;
        let token;

        beforeEach(() => { 
            server = require('../../../index'); 
            token = new User().authToken();
        });

        afterEach(async () => {               
            await server.close();   
            await Movie.remove({});   
            await Genre.remove({});        
        });

        describe('GET /', () => {
            it('should return all movies', async () => {
                await Movie.collection.insertMany([
                    { 
                        title: 'movie1',
                        genreId: mongoose.Types.ObjectId(),
                        numberInStock: 10,
                        dailyRentalRate: 2
                    },
                    { 
                        title: 'movie2',
                        genreId: mongoose.Types.ObjectId(),
                        numberInStock: 10,
                        dailyRentalRate: 2
                    }
                ]);
    
                const res = await request(server).get('/api/movies');
    
                expect(res.status).toBe(200);
                expect(res.body.length).toBe(2);
                expect(res.body.some(m => m.title === 'movie1')).toBeTruthy();
                expect(res.body.some(m => m.title === 'movie2')).toBeTruthy();
            });
        });

        describe('GET /:id', () => {
            it('should return a movie if valid id passed', async () => {
                let res = await request(server)
                    .post('/api/genres')
                    .set('x-auth-token', token)
                    .send({ name: 'genre1' });
                
                const movie = new Movie({ 
                    title: 'movie1',
                    genre: { _id: res.body._id, name: 'genre1' },
                    numberInStock: 10,
                    dailyRentalRate: 2
                });
                await movie.save();
    
                res = await request(server).get('/api/movies/' + movie._id);
    
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('title', movie.title);
            });

            it('should return 404 if invalid id passed', async () => {
                const res = await request(server).get('/api/movies/1');
    
                expect(res.status).toBe(404);
            });

            it('should return 404 if no movie with the given id exist', async () => {
                const id = mongoose.Types.ObjectId();
                const res = await request(server).get('/api/movies/' + id);
    
                expect(res.status).toBe(404);
            });
        });

        describe('POST /', async () => {      
            let title;      
            let genreId;
            let numberInStock;
            let dailyRentalRate;

            const exec = async () => {
                return await request(server)
                    .post('/api/movies')
                    .set('x-auth-token', token)
                    .send({ 
                        title,
                        genreId,
                        numberInStock,
                        dailyRentalRate
                    });
            };

            beforeEach(() => {
                title = 'movie1';
                numberInStock = 10;
                dailyRentalRate = 2;
                genreId = mongoose.Types.ObjectId().toHexString();
            });

            it('should return 401 if client did not logged in', async () => {
                token = '';
    
                const res = await exec();
    
                expect(res.status).toBe(401);
            });

            it('should return 400 if title is less than 5 characters', async () => {
                title = '1234';
    
                const res = await exec();
    
                expect(res.status).toBe(400);
            });

            it('should return 400 if title is more than 255 characters', async () => {
                title = new Array(256).join('a');
    
                const res = await exec();
    
                expect(res.status).toBe(400);
            });

            it('should return 400 if number in stock is negative', async () => {
                numberInStock = -1;
    
                const res = await exec();
    
                expect(res.status).toBe(400);
            });

            it('should return 400 if number in stock is larger than 255', async () => {
                numberInStock = 256;
    
                const res = await exec();
    
                expect(res.status).toBe(400);
            });

            it('should return 400 if daily rental rate is negative', async () => {
                dailyRentalRate = -1;
    
                const res = await exec();
    
                expect(res.status).toBe(400);
            });

            it('should return 400 if daily rental rate is larger than 255', async () => {
                dailyRentalRate = 256;
    
                const res = await exec();
    
                expect(res.status).toBe(400);
            });

            it('should save movie if it is valid', async () => {
                await exec();
    
                const movie = await Movie.find({ 
                    title,
                    genreId,
                    numberInStock,
                    dailyRentalRate
                });
    
                expect(movie).not.toBeNull();
            });

            it('should return the movie if it is valid', async () => {
                let res = await request(server)
                    .post('/api/genres')
                    .set('x-auth-token', token)
                    .send({ name: 'genre1' });

                genreId = res.body._id;

                res = await exec();
    
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('_id');
                expect(res.body).toHaveProperty('title', 'movie1');
                expect(res.body).toHaveProperty('genre._id', genreId);
                expect(res.body).toHaveProperty('numberInStock', 10);
                expect(res.body).toHaveProperty('dailyRentalRate', 2);
            });
        });
            
        describe('PUT /', async () => {  
            let genre;
            let movie;
            let id;
            let newTitle;
            let newStock;
            let newDaily;

            const exec = async () => {
                return await request(server)
                  .put('/api/movies/' + id)
                  .set('x-auth-token', token)
                  .send({ 
                      title: newTitle,
                      genreId: genre._id,
                      numberInStock: newStock,
                      dailyRentalRate: newDaily
                    });
            };

            beforeEach(async () => {   
                newStock = 3;
                newDaily = 11;  
                newTitle = 'movie1';
                genre = new Genre({ name: 'genre1' });
                await genre.save();

                movie = new Movie({ 
                    title: newTitle,
                    genre,
                    numberInStock: 10,
                    dailyRentalRate: 2
                });
                await movie.save();
                
                token = new User({ isAdmin: true }).authToken();     
                id = movie._id;
            });

            it('should return 401 if client is not logged in', async () => {
                token = ''; 
      
                const res = await exec();
      
                expect(res.status).toBe(401);
            });

            it('should return 400 if title is less than 5 characters', async () => {
                newTitle = '1234'; 
                
                const res = await exec();
          
                expect(res.status).toBe(400);
            });

            it('should return 400 if title is more than 255 characters', async () => {
                newTitle = new Array(256).join('a');
          
                const res = await exec();
          
                expect(res.status).toBe(400);
            });

            it('should return 403 if the user is not an admin', async () => {
                token = new User({ isAdmin: false }).authToken(); 
          
                const res = await exec();
          
                expect(res.status).toBe(403);
            });

            it('should return 404 if id is invalid', async () => {
                id = 1;
          
                const res = await exec();
          
                expect(res.status).toBe(404);
            });

            it('should return 404 if genre with the given id was not found', async () => {
                id = mongoose.Types.ObjectId();
          
                const res = await exec();
          
                expect(res.status).toBe(404);
            });

            it('should update the movie if input is valid', async () => {
                await exec();
          
                const updatedMovie = await Movie.findById(movie._id);
          
                expect(updatedMovie.title).toBe(newTitle);
                expect(updatedMovie.numberInStock).toBe(newStock);
                expect(updatedMovie.dailyRentalRate).toBe(newDaily);
            });

            it('should return the updated movie if it is valid', async () => {
                const res = await exec();
          
                expect(res.body).toHaveProperty('_id', movie._id.toHexString());
                expect(res.body).toHaveProperty('genre');
                expect(res.body).toHaveProperty('title', newTitle);
                expect(res.body).toHaveProperty('numberInStock', newStock);
                expect(res.body).toHaveProperty('dailyRentalRate', newDaily);       
            });
        });

        describe('DELETE /', async () => {
            let genre;
            let movie;
            let id;
            let newTitle;
            let newStock;
            let newDaily;

            const exec = async () => {
                return await request(server)
                  .delete('/api/movies/' + id)
                  .set('x-auth-token', token)
                  .send({ 
                      title: newTitle,
                      genreId: genre._id,
                      numberInStock: newStock,
                      dailyRentalRate: newDaily
                    });
            };

            beforeEach(async () => {   
                newStock = 3;
                newDaily = 11;  
                newTitle = 'movie1';
                genre = new Genre({ name: 'genre1' });
                await genre.save();

                movie = new Movie({ 
                    title: newTitle,
                    genre,
                    numberInStock: 10,
                    dailyRentalRate: 2
                });
                await movie.save();
                
                token = new User({ isAdmin: true }).authToken();     
                id = movie._id;
            });

            it('should return 401 if client is not logged in', async () => {
                token = ''; 
          
                const res = await exec();
          
                expect(res.status).toBe(401);
            });

            it('should return 403 if the user is not an admin', async () => {
                token = new User({ isAdmin: false }).authToken(); 
          
                const res = await exec();
          
                expect(res.status).toBe(403);
            });

            it('should return 404 if id is invalid', async () => {
                id = 1; 
                
                const res = await exec();
          
                expect(res.status).toBe(404);
            });
          
            it('should return 404 if no movie with the given id was found', async () => {
                id = mongoose.Types.ObjectId();
          
                const res = await exec();
          
                expect(res.status).toBe(404);
            });

            it('should delete the movie if input is valid', async () => {
                await exec();
          
                const movieInDb = await Movie.findById(id);
          
                expect(movieInDb).toBeNull();
            });

            it('should return the removed movie', async () => {
                const res = await exec();
          
                expect(res.body).toHaveProperty('_id', movie._id.toHexString());
                expect(res.body).toHaveProperty('title', movie.title);
                expect(res.body).toHaveProperty('genre');
                expect(res.body).toHaveProperty('numberInStock', movie.numberInStock);
                expect(res.body).toHaveProperty('dailyRentalRate', movie.dailyRentalRate);              
            });
        });
    });
}