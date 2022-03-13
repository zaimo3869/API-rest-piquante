const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, `${process.env.TOKEN_KEY}`);
    const userId = decodedToken.userId; 
    res.userId = userId;
    if (req.body.userId && req.body.userId !== userId) {
      res.status(401).json("Utilisateur non autorisé à supprimer / modifier");
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: error | "Requête non-authentifiée !" });
  }
};
