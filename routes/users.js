const express = require('express');
const router = express.Router();
const lim = require("../middleware/limite")
const userCtrl = require('../controllers/users');

const authentification = require("../middleware/authentification")
router.post('/signup', userCtrl.signup);
router.post('/login', lim.limite ,userCtrl.login);

module.exports = router;