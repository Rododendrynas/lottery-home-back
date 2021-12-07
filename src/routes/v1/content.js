/* eslint-disable object-curly-newline */
/* eslint-disable no-plusplus */
/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');
const { dbConfig } = require('../../config');

const router = express.Router();
const { isLoggedIn } = require('../../middleware');

// User input data validation for nickname change
const nicknameSchema = Joi.object({
  nickname: Joi.string().min(3).max(10).required(),
});

const getRandomUniqueNumbers = (range, count) => {
  const nums = new Set();
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (range - 1 + 1) + 1));
  }
  return [...nums];
};

// Generate dice random numbers
router.get('/dice/', isLoggedIn, async (req, res) => {
  // Create random numbers
  const numbers = [];
  try {
    for (let i = 0; i < 3; i++) {
      numbers.push(Math.floor(Math.random() * 6) + 1);
    }
    const isWinner = numbers[0] === numbers[1] && numbers[0] === numbers[2];

    return res.status(200).send({ isWinner, numbers });
  } catch (error) {
    return res
      .status(500)
      .send({ error: 'Issue by getting random numbers. Try again', e: error });
  }
});

// Generate ping pong random lucky numbers
router.post('/pingpong/:count/:range/', isLoggedIn, async (req, res) => {
  const { count } = req.params;
  const { range } = req.params;
  const { num1, num2, num3, num4, num5 } = req.body;

  const userNumbers = [
    Number(num1),
    Number(num2),
    Number(num3),
    Number(num4),
    Number(num5),
  ];

  for (let i = 0; i < userNumbers.length; i++) {
    if (userNumbers[i] < 1 || userNumbers[i] > range) {
      return res.status(400).send({
        error: `Enter your numbers in the range from 1 to ${range}`,
      });
    }
  }

  let randomNumbers = [];
  let matches = [];
  let isWinner = false;

  // Create random numbers
  try {
    randomNumbers = getRandomUniqueNumbers(range, count);
    randomNumbers = randomNumbers.sort((a, b) => a - b);

    matches = randomNumbers.filter((element) => userNumbers.includes(element));
    matches = matches.sort((a, b) => a - b);

    isWinner = matches > 0 ? (isWinner = true) : (isWinner = false);

    console.log(randomNumbers);
    console.log(userNumbers);
    console.log(matches);

    return res.status(200).send({ randomNumbers, matches, isWinner });
  } catch (error) {
    return res.status(500).send({
      error: 'Issue by getting random numbers. Try again',
      e: error,
    });
  }
});

// Delete user
router.delete('/account/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'DELETE FROM users WHERE id = ?';

    const con = await mysql.createConnection(dbConfig);
    await con.execute(sql, [id]);
    await con.end();

    return res.status(200).send({ msg: 'Deleted' });
  } catch (error) {
    return res
      .status(500)
      .send({ error: 'Issue by deleting account. Try again', e: error });
  }
});

// Change user nickname
router.put('/account/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  let { nickname } = req.body;
  console.log(nickname);

  try {
    nickname = await nicknameSchema.validateAsync(req.body);
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ error: 'Nickname must be between 3 and 10 characters.' });
  }
  try {
    const sql = 'UPDATE users SET nickname = ? WHERE id = ?';
    const con = await mysql.createConnection(dbConfig);
    await con.execute(sql, [nickname.nickname, id]);
    await con.end();

    return res
      .status(200)
      .send({ msg: `Nickname was updated to ${nickname.nickname}` });
  } catch (error) {
    if (error.errno === 1062) {
      return res
        .status(200)
        .send({ error: 'Email or nickname is used, please choose another' });
    }
    return res.status(500).send({
      error: 'Issue by updating your nickname. Try again.',
      e: error,
    });
  }
});

// Get user nickname
router.get('/account/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT nickname FROM users WHERE id = ?';

    const con = await mysql.createConnection(dbConfig);
    const [rows] = await con.execute(sql, [id]);
    await con.end();

    return res.status(200).send(rows[0]);
  } catch (error) {
    return res
      .status(500)
      .send({ error: 'Issue by getting your nickname. Try again', e: error });
  }
});

module.exports = router;
