const request = require('supertest')
const express = require('express')
const indexRouter = require('./routes/index') // Remplace './index' par le chemin de ton fichier de route

const app = express()
app.use('/', indexRouter)

describe('GET /', () => {
	it('should return a JSON object with the title "CC"', async () => {
		const response = await request(app).get('/')

		expect(response.statusCode).toBe(200) // Vérifie que le code de statut est 200
		expect(response.body).toEqual({ title: 'CC' }) // Vérifie que la réponse JSON contient le bon contenu
	})
})
