const Sauce = require("../models/sauces");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);

  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  try {
    sauce.save();
    res.status(201).json({ message: "sauce enregistré !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error: error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )

    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (res.userId === sauce.userId) {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
            .catch(error => res.status(400).json({ error: error }));
        });
      } else {
        res.status(400).json({ message: "pas authorise" });
      }
    })
    .catch(error => res.status(500).json({ error }));
};
exports.likeDislike = (req, res, next) => {
  Sauce.findById(req.params.id).then(sauce => {
    if (req.body.like == -1) {
      //il veut unliker

      if (sauce.usersLiked.filter(id => id === req.body.userId).length !== 0) {
        //S'il a déjà liké
        //renvoyer un message qui lui indique qu'il doit d'abord retirer son like avant de unlike et mettre à jour la BD
        //return res.status(...).json(...)
        return res
          .status(401)
          .json({ message: "Veuillez d'abord retirer votre Like" });
      }

      if (
        sauce.usersDisliked.filter(id => id === req.body.userId).length !== 0
      ) {
        //S'il a déjà unliké
        //décrémenter le nombre de unlike et retirer ce userId du tableau des unLIkes et mettre à jour la bd
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
        )
          .then(resp =>
            res
              .status(200)
              .json({ message: "Vous avez retiré votre  DisLiker !" })
          )
          .catch(error => res.status(400).json({ error }));
      } else {
        //il n'a pas encore unliké
        //Incrémenter le nombre de unlike et ajouter ce userId dans tableau des unLIkes et mettre à jour la bd
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }
        )
          .then(sauce =>
            res.status(200).json({ message: "Vous avez DisLiker !" })
          )
          .catch(error => res.status(400).json({ error }));
      }
    } else if (req.body.like == 1) {
      //il veut liker
      if (
        sauce.usersDisliked.filter(id => id === req.body.userId).length !== 0
      ) {
        //S'il a déjà unliké
        //renvoyer un message qui lui indique qu'il doit d'abord retirer son unlike avant de like et mettre à jour la BD
        //return res.status(...).json(...)
        return res
          .status(401)
          .json({ message: "Veuillez d'abord retirer votre unlike" });
      }

      if (sauce.usersLiked.filter(id => id === req.body.userId).length !== 0) {
        //S'il a déjà liké
        //décrémenter le nombre de like et retirer ce userId du tableau des likes et mettre à jour la bd
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
        )
          .then(sauce => res.status(200).json({ message: "Vous avez Liker !" }))
          .catch(error => res.status(400).json({ error }));
      } else {
        //il n'a pas encore liké
        //Incrémenter le nombre de like et ajouter ce userId dans tableau des likes et mettre à jour la bd
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }
        )
          .then(sauce => res.status(200).json({ message: "Vous avez Liker !" }))
          .catch(error => res.status(400).json({ error }));
      }
    } else if (req.body.like == 0) {
      if (sauce.usersLiked.filter(id => id === req.body.userId).length !== 0) {
        //S'il a déjà liké
        //décrémenter le nombre de like et retirer ce userId du tableau des likes et mettre à jour la bd
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
        )
          .then(sauce =>
            res.status(200).json({ message: "Vous avez unliker!" })
          )
          .catch(error => res.status(400).json({ error }));
      }

      if (
        sauce.usersDisliked.filter(id => id === req.body.userId).length !== 0
      ) {
        //S'il a déjà unliké
        //décrémenter le nombre de unlike et retirer ce userId du tableau des unLIkes et mettre à jour la bd
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
        )
          .then(resp =>
            res
              .status(200)
              .json({ message: "Vous avez retiré votre  /undislike  !" })
          )
          .catch(error => res.status(400).json({ error }));
      } else {
        res
          .status(200)
          .json({ message: "Vous ne pouvez pas dislike sans like !" });
      }
    } else {
      //pour tout autre valeur de like differentes de 1 et -1
      return res.status(400).json("votre requette est incorrecte");
    }
  });
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => {
      res.status(200).json(sauces);
    })
    .catch(error => {
      res.status(400).json({
        error: error,
      });
    });
};
