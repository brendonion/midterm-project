"use strict";

const bcrypt  = require("bcrypt");
const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  //TODO need to get username, email, and all things that they like/own
  // need username for header
  // TODO search by user cookie (hard coded right now)
  router.get("/:user_id", (req, res) => {
    console.log('getting userid page')
    const userId = req.params.user_id;
    let subQueryLikes = knex('likes').select('resource_id').where('user_id', userId);
    // let currentUser = '';

    // if (!req.session.user_id) {
    //   knex('resources')
    //   .where('creator', userId)
    //   .orWhereIn('id', subQueryLikes)
    //   .then((results) => {
    //   res.render("../public/views/users_user_id", { user: {username: currentUser}, resources: results });
    //   }).catch((error) => {
    //   console.log(error);
    //   });
    //   return;
    // } else {
      knex('users')
        .select('username')
        .where('users.id', req.session.user_id)
        .asCallback((err, results) => {
          if (err) console.error(err);
          if (results[0].username.length > 0) {
            knex('resources')
            .where('creator', userId)
            .orWhereIn('id', subQueryLikes)
            .then((results) => {
              res.render("../public/views/users_user_id", {
                user: {
                  username: req.username,
                  userid: req.session.user_id
                },
                resources: results,
                icons: {
                  science: 'fa fa-flask',
                  history: 'fa fa-hourglass-end',
                  math: 'fa fa-superscript',
                  geography: 'fa fa-globe'
                }
              });
            }).catch((error) => {
              console.log(error);
            });
          }
    });
    return;
    // }
  });

  // need username, email, password from db
  // TODO change query to look for current user logged in
  router.get("/:user_id/editprofile", (req, res) => {

    // if (!req.session.user_id) {
    //   res.redirect('/');
    //   return;
    // } else {
      knex('users')
      .where('id', req.session.user_id)
      .then((results) => {
        var templateVars = {
          user: {
            userid: results[0].id,
            username: results[0].username,
            email: results[0].email,
            password: results[0].password
          },
        }
        res.render('../public/views/users_user_id_editprofile', templateVars);
        return;
      });
    // }
  });

  router.post(("/:user_id/editprofile"), (req, res) => {
    const newpassword = req.body.password;
    // console.log(newpassword);
    bcrypt.hash(newpassword, 10, function(err, hash) {
      knex('users')
        .select('password')
        .where('id', req.session.user_id)
        .update({
          password: hash
        }).then((results) => {
          res.redirect(`/users/${req.session.user_id}/editprofile`);
          return;
        }).catch((err) => {
          console.log(err);
        });
    });
  });

  return router;
}
