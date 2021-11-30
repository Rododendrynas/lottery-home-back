/* eslint-disable newline-per-chained-call */
const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { dbConfig, jwtSecret } = require('../../config');

const router = express.Router();

// Validation of user registration and login data
const userSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

// Register
router.post('/register', async (req, res) => {
  let userDetails = req.body;
  try {
    userDetails = await userSchema.validateAsync(userDetails);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: 'Incorrect data.' });
  }

  try {
    const hashedPassword = await bcrypt.hashSync(userDetails.password);
    const con = await mysql.createConnection(dbConfig);

    const [data] = await con.execute(`
        INSERT INTO users (email, password)
        VALUES (${mysql.escape(userDetails.name)}, 
        ${mysql.escape(userDetails.email)}, '${hashedPassword}')
    `);
    await con.end();
    return res.status(200).send(data, { msg: 'Registered' });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'Issue. Try again' });
  }
});

// Login
router.post('/login', async (req, res) => {
  let userDetails = req.body;

  try {
    userDetails = await userSchema.validateAsync(userDetails);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: 'Incorrect email or password' });
  }

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(`
          SELECT * FROM users 
          WHERE email =  (${mysql.escape(userDetails.email)})
          LIMIT 1
      `);

    await con.end();

    if (data.length === 0) {
      return res.status(400).send({ err: 'Incorrect email or password' });
    }

    const isAuthorized = await bcrypt.compareSync(
      userDetails.password,
      data[0].password,
    );

    if (!isAuthorized) {
      return res.status(400).send({ err: 'Incorrect email or password' });
    }

    const token = jwt.sign({ id: data[0].id, email: data[0].email }, jwtSecret);
    return res.send({ msg: 'Successfully logged in', token });
  } catch (err) {
    return res.status(500).send({ err: 'Incorrect data. Try again' });
  }
});

module.exports = router;
