/* eslint-disable newline-per-chained-call */
const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { dbConfig, jwtSecret } = require('../../config');

const router = express.Router();

// Validation of user registration and login data
const regUserSchema = Joi.object({
  nickname: Joi.string().required(),
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

const logUserSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

// Register
router.post('/register/', async (req, res) => {
  let userDetails = req.body;
  console.log(userDetails);
  try {
    userDetails = await regUserSchema.validateAsync(userDetails);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: 'Incorrect data.' });
  }

  try {
    const hashedPassword = await bcrypt.hashSync(userDetails.password);
    const con = await mysql.createConnection(dbConfig);

    const [data] = await con.execute(`
        INSERT INTO users (nickname, email, password)
        VALUES (${mysql.escape(userDetails.nickname)}, 
        ${mysql.escape(userDetails.email)}, '${hashedPassword}')
    `);
    await con.end();
    console.log(data);
    return res.status(200).send({ ...data, msg: 'Registered' });
  } catch (error) {
    console.log(error);
    if (error.errno === 1062) {
      return res
        .status(200)
        .send({ error: 'Email or nickname is used, please choose another' });
    }
    return res
      .status(500)
      .send({ error: 'Issue during registration. Try again' });
  }
});

// Login
router.post('/login/', async (req, res) => {
  let userDetails = req.body;

  try {
    userDetails = await logUserSchema.validateAsync(userDetails);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: 'Incorrect email or password' });
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
      return res.status(400).send({ error: 'Incorrect email or password' });
    }

    const isAuthorized = await bcrypt.compareSync(
      userDetails.password,
      data[0].password,
    );

    if (!isAuthorized) {
      return res.status(401).send({ err: 'Incorrect email or password' });
    }

    const token = jwt.sign({ id: data[0].id, email: data[0].email }, jwtSecret);
    return res.status(201).send({ msg: 'Successfully logged in', token });
  } catch (error) {
    return res.status(500).send({ error: 'Incorrect data. Try again' });
  }
});

module.exports = router;
