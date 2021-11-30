/* eslint-disable no-undef */
/* eslint-disable no-alert */
const express = require('express');
const mysql = require('mysql2/promise');
// const Joi = require('joi');

const router = express.Router();

const { isLoggedIn } = require('../../middleware');
const { dbConfig } = require('../../config');

// Generate dice result
router.get('/dice/', async (req, res) => {
  try {
    const numbers = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];

    isWinner = numbers.every((val, i, arr) => val === arr[0]);

    return res.status(200).send({ isWinner, numbers });
  } catch (err) {
    return res
      .status(500)
      .send({ err: 'Issue by rolling dice. Try again', e: err });
  }
});

module.exports = router;
