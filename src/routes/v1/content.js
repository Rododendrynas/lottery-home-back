const express = require('express');
const mysql = require('mysql2/promise');
const { dbConfig } = require('../../config');

const router = express.Router();

// const { isLoggedIn } = require('../../middleware');

// Generate dice result
router.get('/dice/:id', async (req, res) => {
  try {
    const numbers = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];

    // const isWinner = numbers.every((val, i, arr) => val === arr[0]);
    const isWinner = numbers[0] === numbers[1] && numbers[0] === numbers[2];

    const con = await mysql.createConnection(dbConfig);
    const { id } = req.params;
    const sql = 'INSERT INTO dice (id, numbers, isWinner) VALUES (?, ?, ?)';
    await con.execute(sql, [id, JSON.stringify(numbers), isWinner]);
    await con.end();

    return res.status(200).send({ isWinner, numbers });
  } catch (err) {
    return res
      .status(500)
      .send({ err: 'Issue by rolling dice. Try again', e: err });
  }
});

router.delete('/account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'DELETE FROM users WHERE id = ?';

    const con = await mysql.createConnection(dbConfig);

    await con.execute(sql, [id]);

    return res.status(200).send({ msg: 'Deleted' });
  } catch (err) {
    return res
      .status(500)
      .send({ err: 'Issue by deleting account. Try again', e: err });
  }
});

router.put('/account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname } = req.body;
    const sql = 'UPDATE users SET nickname = ? WHERE id = ?';

    const con = await mysql.createConnection(dbConfig);

    await con.execute(sql, [nickname, id]);

    return res.status(200).send({ msg: 'Nickname was updated' });
  } catch (err) {
    return res
      .status(500)
      .send({ err: 'Issue by updating your nickname. Try again', e: err });
  }
});

router.get('/account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT nickname FROM users WHERE id = ?';

    const con = await mysql.createConnection(dbConfig);

    const result = await con.query(sql, [id]);

    return res.status(200).send({ result });
  } catch (err) {
    return res
      .status(500)
      .send({ err: 'Issue by getting your nickname. Try again', e: err });
  }
});

// Generate ping pong result
router.get('/ping-pong/', (req, res) => {
  try {
    const numbers = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];

    // const con = await mysql.createConnection(dbConfig);

    // await con.execute(`
    //     INSERT INTO ping_pong (name)
    //     VALUES (${mysql.escape(clientNumbers.numbers)})
    // `);

    // await con.end();

    return res.status(200).send({ isWinner, numbers });
  } catch (err) {
    return res
      .status(500)
      .send({ err: 'Issue by rolling dice. Try again', e: err });
  }
});

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
