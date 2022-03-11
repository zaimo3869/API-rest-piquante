const limiteNombre = require("express-rate-limit")

const limite = limiteNombre({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: "Vous avez effectuer trop de tentatives de connexion. Tenter à nouveaux dans 5 minutes"
})

module.exports = { limite }