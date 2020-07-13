const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const usersRouter = require("./users/users-router");

const server = express();
const port = process.env.PORT || 5000;

server.use(helmet());
server.use(cors());
server.use(express.json());

//it will take any incoming cookies, parse them and 
//give us as an object on the request do we can just read the values easily
server.use(cookieParser())

// no need for the sessions anymore as we added cookies and cookie parser
// server.use(
// 	session({
// 		resave: false, // avoid recreating sessions that have not changed
// 		saveUninitialized: false, // comply with GDPR laws for setting cookies automatically
// 		secret: "keep it secret, keep it safe", // cryptographically sign the cookie
// 	})
// );

server.use(usersRouter);
server.use((err, req, res, next) => {
	console.log(err);

	res.status(500).json({
		message: "Something went wrong",
	});
});

server.listen(port, () => {
	console.log(`Running at http://localhost:${port}`);
});
