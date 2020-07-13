// const { JsonWebTokenError } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

const roles = ["normal", "admin"]; //higher up in arrau the lower the role is

function restrict(role) {
	return async (req, res, next) => {
		const authError = {
			message: "Invalid credentials",
		};

		try {
			// express-session will automatically get the session ID from the cookie
			// header, and check to make sure it's valid and the session for this user exists.
			// if (!req.session || !req.session.user) {
			// 	return res.status(401).json(authError)
			// }

			//validate/verify the received token
			// const token = req.headers.authorization;

			//once we added cookies need to change the request address
			const token = req.cookies.token;

			if (!token) {
				return res.status(401).json(authError);
			}

			jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
				if (err) {
					return res.status(401).json(authError);
				}

				// check for the role in the decoded value
				// if the roles dont manch return err, otherwise grant an access
				// ex: if the user logged in as normal user and the end point defined as admin end point deny access
				//     define admin in router as restrict("admin")
				// if (role && decoded.userRole !== role) {
				// 	return res.status(401).json(authError);
				// }
				// if there are many roles:
				if (role && roles.indexOf(decoded.userRole) < roles.indexOf(role)) {
					return res.status(401).json(authError);
				}

				next();
			});
		} catch (err) {
			next(err);
		}
	};
}

module.exports = restrict;
