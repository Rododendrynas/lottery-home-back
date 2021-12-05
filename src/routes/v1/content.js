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

// Generate random lucky numbers
router.get('/dice/:num', isLoggedIn, async (req, res) => {
  const { num } = req.params;

  // Create random numbers
  const numbers = [];
  try {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < num; i++) {
      numbers.push(Math.floor(Math.random() * 6) + 1);
    }
    console.log(numbers);

    const isWinner = numbers.every((val, i, arr) => val === arr[0]);
    // const isWinner = numbers[0] === numbers[1] && numbers[0] === numbers[2];

    return res.status(200).send({ isWinner, numbers });
  } catch (error) {
    return res
      .status(500)
      .send({ error: 'Issue by getting random numbers. Try again', e: error });
  }
});

// Save user given numbers
router.put('/pingpong/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { numbers } = req.body;

  console.log(numbers);

  try {
    const sql = 'INSERT INTO lucky_numbers (user_id, numbers) VALUES (?, ?)';
    const con = await mysql.createConnection(dbConfig);
    await con.execute(sql, [id, numbers]);
    await con.end();

    return res.status(200).send({ msg: 'Your lucky numbers were saved' });
  } catch (error) {
    return res.status(500).send({
      error: 'Issue by saving your lucky numbers. Try again.',
      e: error,
    });
  }
});

// Get user lucky numbers
router.get('/pingpong/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT numbers FROM lucky_numbers WHERE id = ?';

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

// // Generate ping pong result
// router.get('/ping-pong/', (req, res) => {
//   try {
//     const numbers = [
//       Math.floor(Math.random() * 6) + 1,
//       Math.floor(Math.random() * 6) + 1,
//       Math.floor(Math.random() * 6) + 1,
//       Math.floor(Math.random() * 6) + 1,
//       Math.floor(Math.random() * 6) + 1,
//       Math.floor(Math.random() * 6) + 1,
//     ];

//     // const con = await mysql.createConnection(dbConfig);

//     // await con.execute(`
//     //     INSERT INTO ping_pong (name)
//     //     VALUES (${mysql.escape(clientNumbers.numbers)})
//     // `);

//     // await con.end();

//     return res.status(200).send({ isWinner, numbers });
//   } catch (err) {
//     return res
//       .status(500)
//       .send({ err: 'Issue by rolling dice. Try again', e: err });
//   }
// });

// // Save ping pong client created array to database
// router.post('/ping-pong/', async (req, res) => {
//   const clientNumbers = req.body;

//   // try {
//   //   const con = await mysql.createConnection(dbConfig);

//   //   await con.execute(`
//   //       INSERT INTO ping_pong (numbers)
//   //       VALUES (${mysql.escape(clientNumbers.numbers)})
//   //   `);

//   //   await con.end();

//     return res.status(200).send({
//       msg: `Your lucky numbers ${clientNumbers.numbers} were saved. Please refresh your page.`,
//     });
//   } catch (err) {
//     return res.status(500).send({
//       err: 'Issue by saving your lucky numbers. Try again.',
//     });
//   }
// });

module.exports = router;
