const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("./users-model");
const restrict = require("../middleware/restrict");

const router = express.Router();

//check the role of the user by defining it in restrict middleware
router.get("/users", restrict("normal"), async (req, res, next) => {
	try {
		res.json(await Users.find());
	} catch (err) {
		next(err);
	}
});

router.post("/users", async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await Users.findBy({ username }).first();

		if (user) {
			return res.status(409).json({
				message: "Username is already taken",
			});
		}

		const newUser = await Users.add({
			username,
			// hash the password with a time complexity of "14"
			password: await bcrypt.hash(password, 14),
		});

		res.status(201).json(newUser);
	} catch (err) {
		next(err);
	}
});

router.post("/login", async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await Users.findBy({ username }).first();

		if (!user) {
			return res.status(401).json({
				message: "Invalid Credentials",
			});
		}

		// hash the password again and see if it matches what we have in the database
		const passwordValid = await bcrypt.compare(password, user.password);

		if (!passwordValid) {
			return res.status(401).json({
				message: "Invalid Credentials",
			});
		}

		// generate a new session for this user,
		// and sends back a session ID
		// req.session.user = user

		//generate a new token
		const payload = {
			userId: user.id,
			username: user.username,
			userRole: "normal", //this value normally comes from the database
		};

		//add cookie and automate the process, instead of just sending back the token itself
		//send back token as cookie
		res.cookie("token", jwt.sign(payload, process.env.JWT_SECRET));
		res.json({
			message: `Welcome ${user.username}!`,
			// token: jwt.sign(payload, process.env.JWT_SECRET),
		});
	} catch (err) {
		next(err);
	}
});

router.get("/logout", async (req, res, next) => {
	try {
		// this will delete the session in the database and try to expire the cookie,
		// though it's ultimately up to the client if they delete the cookie or not.
		// but it becomes useless to them once the session is deleted server-side.
		req.session.destroy((err) => {
			if (err) {
				next(err);
			} else {
				res.status(204).end();
			}
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
