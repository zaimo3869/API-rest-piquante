const express = require('express');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: process.cwd() + '/.env' });

const userRoute = require('./routes/users')
const saucesRoute=require('./routes/sauces')
const modelSauce = require('./models/sauces')

mongoose.connect('mongodb+srv://zaim:user@cluster0.rrpzc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use(express.json());

//  Sécuirité CORS

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
app.use(bodyParser.json())

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth',userRoute );
app.use('/api/sauces',saucesRoute );


module.exports = app;