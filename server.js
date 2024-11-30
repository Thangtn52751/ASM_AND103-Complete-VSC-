const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

const port = 3000;

// MongoDB connection URI
const COMMON = require('./COMON');
const uri = COMMON.uri;

const cakeModel = require('./cakeModel');
const userModel = require('./userModel');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Get all cakes
app.get('/', async (req, res) => {
    await mongoose.connect(uri);
    const cakes = await cakeModel.find();
    res.send(cakes);
});

// Add a new cake
app.post('/add_cake', async (req, res) => {
    await mongoose.connect(uri);
    const newCake = req.body;
    await cakeModel.create(newCake);
    const cakes = await cakeModel.find();
    res.send(cakes);
});

// Delete a cake by ID
app.get('/delete/:id', async (req, res) => {
    await mongoose.connect(uri);
    const { id } = req.params;
    await cakeModel.deleteOne({ _id: id });
    res.send({ message: 'Cake deleted successfully' });
});

// Update a cake by ID
app.put('/update/:id', async (req, res) => {
    await mongoose.connect(uri);
    const { id } = req.params;
    const updatedCake = req.body;
    await cakeModel.updateOne({ _id: id }, updatedCake);
    const cakes = await cakeModel.find();
    res.send(cakes);
});

// Search cakes by name
app.get('/search', async (req, res) => {
    const { name } = req.query;
    await mongoose.connect(uri);
    const cakes = await cakeModel.find({
        name: { $regex: name, $options: 'i' },
    });
    res.send(cakes);
});


const SIMPLE_SECRET_KEY = "simple_secret"; // Chuỗi ký tự cố định cho việc ký JWT

app.post('/register', async (req, res) => {
    await mongoose.connect(uri);
    const { username, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ username });
        if (existingUser) {
            return res.status(400).send({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.create({ username, password: hashedPassword });
        res.send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error registering user', error });
    }
});

app.post('/login', async (req, res) => {
    await mongoose.connect(uri);
    const { username, password } = req.body;

    try {
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, SIMPLE_SECRET_KEY, { expiresIn: '1h' });
        res.send({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).send({ message: 'Error logging in', error });
    }
});