const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const objectId = require('../middleware/objectId');
const router = require('express').Router();
const _ = require('lodash');  
const Customer = require('../models/customer'); 

router.get('/', async (req, res) => {
    // find all customers
    const customers = await Customer.find().sort('name');

    // send customers as response
    res.send(customers);
});

router.get('/:id', objectId, async (req, res) => {
    // find customer by id
    const customer = await Customer.findById(req.params.id);
    if(!customer) return res.status(404).send('Customer with given id was not found');
    
    // send customer as response
    res.send(customer);
});

router.post('/', [auth, validate(Customer.validate)], async (req, res) => {  
    // check if customer already exist
    let customer = await Customer.findOne(_.pick(req.body, ['name', 'phone']));
    if(customer) return res.status(400).send('Customer with the given name and phone already exist');

    // create new customer
    customer = new Customer(_.pick(req.body, ['isGold', 'name', 'phone']));

    // save customer to db
    await customer.save();

    // send customer as response
    res.send(customer);
});

router.put('/:id', [auth, objectId, validate(Customer.validate)], async (req, res) => {  
    // find and update customer
    customer = await Customer.findByIdAndUpdate(req.params.id, _.pick(req.body, ['isGold', 'name', 'phone']), { new: true });  
    if(!customer) return res.status(404).send('Customer with given id was not found');

    // send customer as response
    res.send(customer);
});

router.delete('/:id', [auth, admin, objectId], async (req, res) => {
    // find and remove customer
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if(!customer) return res.status(404).send('Customer with given id was not found');

    // send customer as response
    res.send(customer);
});

module.exports = router;