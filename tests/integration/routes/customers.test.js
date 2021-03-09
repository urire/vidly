const request = require('supertest');
const mongoose = require('mongoose');
const Customer = require('../../../models/customer'); 
const User = require('../../../models/user');   

describe('/api/customers', () => {
    it('dummy test', () => { expect(1).toEqual(1); });
});

module.exports = function() {
    describe('/api/customers', () => {
        let server;
        let token;

        beforeEach(() => { 
            server = require('../../../index'); 
            token = new User().authToken();
        });

        afterEach(async () => { 
            await Customer.remove({});               
            await server.close();                
        });

        describe('GET /', () => {
            it('should return all customers', async () => {
                await Customer.collection.insertMany([
                    { 
                        name: '12345',
                        phone: '12345'
                    },
                    { 
                        name: '54321',
                        phone: '54321'
                    }
                ]);

                const res = await request(server).get('/api/customers');

                expect(res.status).toBe(200);
                expect(res.body.length).toBe(2);
                expect(res.body.some(c => c.name === '12345')).toBeTruthy();
                expect(res.body.some(c => c.name === '54321')).toBeTruthy();
            });

            describe('GET /:id', () => {
                it('should return a customer if valid id passed', async () => {
                    const customer = new Customer({ 
                        name: '12345',
                        phone: '12345'
                    });

                    await customer.save();

                    const res = await request(server).get('/api/customers/' + customer._id);
        
                    expect(res.status).toBe(200);
                    expect(res.body).toHaveProperty('name', customer.name);
                    expect(res.body).toHaveProperty('phone', customer.phone);
                });

                it('should return 404 if invalid id passed', async () => {
                    const res = await request(server).get('/api/customers/1');
        
                    expect(res.status).toBe(404);
                });

                it('should return 404 if no customer with the given id exist', async () => {
                    const id = mongoose.Types.ObjectId();
                    const res = await request(server).get('/api/customers/' + id);
        
                    expect(res.status).toBe(404);
                });
            });

            describe('POST /', async () => {
                let name;      
                let phone;

                const exec = async () => {
                    return await request(server)
                        .post('/api/customers')
                        .set('x-auth-token', token)
                        .send({ 
                            name,
                            phone
                        });
                };

                beforeEach(() => {
                    name = '12345';
                    phone = '12345';
                });

                it('should return 401 if client did not logged in', async () => {
                    token = '';
        
                    const res = await exec();
        
                    expect(res.status).toBe(401);
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

                it('should return 400 if phone is less than 5 characters', async () => {
                    phone = '1234';
        
                    const res = await exec();
        
                    expect(res.status).toBe(400);
                });

                it('should return 400 if phone is more than 50 characters', async () => {
                    phone = new Array(52).join('a');
        
                    const res = await exec();
        
                    expect(res.status).toBe(400);
                });

                it('should save customer if it is valid', async () => {
                    await exec();
        
                    const customer = await Customer.find({ 
                        name,
                        phone
                    });
        
                    expect(customer).not.toBeNull();
                });

                it('should return the customer if it is valid', async () => {
                    res = await exec();
        
                    expect(res.status).toBe(200);
                    expect(res.body).toHaveProperty('_id');
                    expect(res.body).toHaveProperty('isGold', false);
                    expect(res.body).toHaveProperty('name', name);
                    expect(res.body).toHaveProperty('phone', phone);
                });
            });

            describe('PUT /', async () => {
                let customer;
                let id;
                let newName;
                let newPhone;

                const exec = async () => {
                    return await request(server)
                        .put('/api/customers/' + id)
                        .set('x-auth-token', token)
                        .send({ 
                            name: newName,
                            phone: newPhone
                    });
                };

                beforeEach(async () => {   
                    newName = '12345';
                    newPhone = '12345'; 

                    customer = new Customer({ 
                        name: newName,
                        phone: newPhone
                    });
                    await customer.save();
                    
                    token = new User({ isAdmin: true }).authToken();     
                    id = customer._id;
                });

                it('should return 401 if client is not logged in', async () => {
                    token = ''; 
        
                    const res = await exec();
        
                    expect(res.status).toBe(401);
                });

                it('should return 400 if name is less than 5 characters', async () => {
                    newName = '1234'; 
                    
                    const res = await exec();
            
                    expect(res.status).toBe(400);
                });

                it('should return 400 if name is more than 50 characters', async () => {
                    newName = new Array(52).join('a');
            
                    const res = await exec();
            
                    expect(res.status).toBe(400);
                });

                it('should return 400 if phone is less than 5 characters', async () => {
                    newPhone = '1234'; 
                    
                    const res = await exec();
            
                    expect(res.status).toBe(400);
                });

                it('should return 400 if phone is more than 50 characters', async () => {
                    newPhone = new Array(52).join('a');
            
                    const res = await exec();
            
                    expect(res.status).toBe(400);
                });

                it('should return 404 if id is invalid', async () => {
                    id = 1;
            
                    const res = await exec();
            
                    expect(res.status).toBe(404);
                });

                it('should return 404 if customer with the given id was not found', async () => {
                    id = mongoose.Types.ObjectId();
            
                    const res = await exec();
            
                    expect(res.status).toBe(404);
                });

                it('should update the customer if input is valid', async () => {
                    await exec();
            
                    const updatedCustomer = await Customer.findById(customer._id);
            
                    expect(updatedCustomer.name).toBe(newName);
                    expect(updatedCustomer.phone).toBe(newPhone);
                });

                it('should return the updated customer if it is valid', async () => {
                    const res = await exec();
            
                    expect(res.body).toHaveProperty('_id', customer._id.toHexString());
                    expect(res.body).toHaveProperty('name', newName);
                    expect(res.body).toHaveProperty('phone', newPhone);
                    expect(res.body).toHaveProperty('isGold', false);       
                });
            });

            describe('DELETE /', async () => {
                let customer;
                let id;
                let newName;
                let newPhone;

                const exec = async () => {
                    return await request(server)
                    .delete('/api/customers/' + id)
                    .set('x-auth-token', token)
                    .send({ 
                        name: newName,
                        phone: newPhone
                    });
                };

                beforeEach(async () => {   
                    newName = '12345';
                    newPhone = '12345'; 

                    customer = new Customer({ 
                        name: newName,
                        phone: newPhone
                    });
                    await customer.save();
                    
                    token = new User({ isAdmin: true }).authToken();     
                    id = customer._id;
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

                it('should return 404 if no customer with the given id was found', async () => {
                    id = mongoose.Types.ObjectId();
            
                    const res = await exec();
            
                    expect(res.status).toBe(404);
                });

                it('should delete the customer if input is valid', async () => {
                    await exec();
            
                    const customerInDb = await Customer.findById(id);
            
                    expect(customerInDb).toBeNull();
                });

                it('should return the removed customer', async () => {
                    const res = await exec();
            
                    expect(res.body).toHaveProperty('_id', customer._id.toHexString());
                    expect(res.body).toHaveProperty('name', newName);
                    expect(res.body).toHaveProperty('phone', newPhone);
                    expect(res.body).toHaveProperty('isGold', false);
                });
            });
        });
    });
}