// these are routes that return a json

"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  // for all resources
  router.get('/resources', (req, res) => {

    // the search/filters will come as req.query
    console.log('Req query coming through api:', req.query);
    const { topic } = req.query; // extract topic from req.query

    if (topic) {
      // need to make this modular so they can add in more search/filter parameters
      // TODO this query is totes wrong btw
      knex('resources')
        .where('topic', topic)
        .then((results) => {
          res.json(results);
        });
    } else {
      knex('resources')
        .then((results) => {
          res.json(results);
        });
    }
  });

  // for my resources
  router.get('/users/:user_id/resources', (req, res) => {
    // this does the same as the above but user specific (and likes table)
  });

  return router;
}