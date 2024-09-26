var express = require('express')
var router = express.Router()

/**
 * Handles the GET request for the root route.
 *
 * If the MySQL connection is in a disconnected state, it attempts to connect to the database.
 * Logs the connection status and information.
 *
 * @function
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
// eslint-disable-next-line no-unused-vars
router.get('/', function (req, res, next) {
	res.json({ title: 'CC' })
})

module.exports = router
