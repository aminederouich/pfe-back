const createError = require('http-errors')
const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const indexRouter = require('./routes/index')
const authRoutes = require('./routes/auth')
const jiraClientRoutes = require('./routes/jira_client')
const jiraConfigRoutes = require('./routes/jira_config.routes')
const ticketRoutes = require('./routes/ticket')
const userRoutes = require('./routes/user')
const projectRoutes = require('./routes/project.routes')

const app = express()

// Use CORS middleware
app.use(cors())
app.use(cors({
	origin: 'http://localhost:3000'
}))

// Middleware setup
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/jira_client', jiraClientRoutes)
app.use('/jira_config', jiraConfigRoutes)
app.use('/ticket', ticketRoutes)
app.use('/project', projectRoutes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404))
})

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
	// send the error response as JSON 
	res.status(err.status || 500)
	res.json({
		status: err.status,
		message: err.message,
		error: req.app.get('env') === 'development' ? err : {},
		timestamp: new Date().toISOString(),
		path: req.originalUrl // Show the URL that caused the error
	})
})

module.exports = app
