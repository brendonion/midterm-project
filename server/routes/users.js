"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  // TODO delete this, not needed
  // router.get("/", (req, res) => {
  //   knex
  //     .select("*")
  //     .from("users")
  //     .then((results) => {
  //       res.json(results);
  //   });
  // });


  //TODO need to get username, email, and all things that they like/own
  // need username for header
  router.get("/:user_id", (req, res) => {
    var templateVars = {
      user: {
        name: 'name',
        email: 'user@email.com'
      }
    };

    res.render('../public/views/users_user_id', templateVars)

  });

  // need username, email, password from db
  // TODO change query to look for current user logged in
  router.get("/:user_id/editprofile", (req, res) => {
    knex
      .select('*')
      .from('users')
      .where('id', 3)
      .then((results) => {
        // console.log(results[0].id);
        var templateVars = {
          user: {
            id: results[0].id,
            username: results[0].username,
            email: results[0].email,
            password: results[0].password
          }
        }
        // console.log(templateVars);
        res.render('../public/views/users_user_id_editprofile', templateVars)
      })
  });

  // TODO should be put?
  // TODO will have to hash this password as well.
  // TODO change query to look for current user logged in
  router.post("/:user_id/editprofile", (req, res) => {
    const newpassword = req.body.password;
    console.log(newpassword);

    knex('users')
      .where('id', 3)
      .update({
        password: newpassword
      })
      //TODO don't know what it doesn't work if this callback isn't here
      .asCallback((err, results) => {
        if (err) {
          console.log('ERROR:', err);
        } else {
          console.log(results);
        }
      })
  });

  return router;
}
