const { auth, db } = require('./../config/firebase')
const { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } = require('firebase/auth')
const { doc, setDoc, getDoc } = require('firebase/firestore')

exports.isLogged = async (req, res) => {
	try {
		// Check if the user is authenticated
		const user = auth.currentUser
		if (user) {
			const userDoc = await getDoc(doc(db, 'users', user.uid))
			// Check if the user document exists in Firestore
			if (userDoc.exists()) {
				// If the user document exists, return the user data
				return res.status(200).json({
					error: false,
					message: 'User is authenticated',
					user: {
						IsEmployee: userDoc.data().IsEmployee,
						IsManager: userDoc.data().IsManager,
						LastName: userDoc.data().LastName,
						FirstName: userDoc.data().FirstName,
						uid: user.uid,
						email: user.email,
						name: user.displayName,
						photoURL: user.photoURL,
						phoneNumber: user.phoneNumber,
						providerData: user.providerData,
						metadata: user.metadata,
					}
				})
			}
		} else {
			// If no user is authenticated, respond with an appropriate message
			return res.status(401).json({
				error: true,
				message: 'No user is authenticated'
			})
		}
	} catch (error) {
		console.log(error)
		// Handle any errors
		return res.status(500).json({
			error: true,
			message: 'An error occurred while checking authentication status'
		})
	}
}

// signup
exports.signup = async (req, res) => {
	try {
		// Vérification des paramètres requis
		const { email, password, name } = req.body
		if (!email || !password || !name) {
			return res.status(422).json({
				error: true,
				message: 'Email, password, and name are required'
			})
		}

		// Création de l'utilisateur avec Firebase Auth
		const userCredential = await createUserWithEmailAndPassword(auth, email, password)
		const user = userCredential.user

		// Ajout du profil utilisateur dans Firestore
		const userRef = doc(db, 'users', user.uid)
		await setDoc(userRef, {
			uid: user.uid,
			email: user.email,
			name: name,
		})

		// Réponse réussie
		return res.status(201).json({
			error: false,
			message: 'User created and profile added to Firestore',
			user: {
				uid: user.uid,
				email: user.email,
				name: name,
			}
		})
	} catch (error) {
		// Gestion des erreurs de création
		let errorMessage = 'An error occurred during sign up'
		if (error.code === 'auth/weak-password') {
			errorMessage = 'The password is too weak'
		} else if (error.code === 'auth/email-already-in-use') {
			errorMessage = 'The email address is already in use by another account'
		}

		return res.status(500).json({
			error: true,
			message: errorMessage
		})
	}
}

// signin
exports.signin = async (req, res) => {
	try {
		// Vérification des paramètres requis
		const { email, password } = req.body
		if (!email || !password) {
			return res.status(422).json({
				error: true,
				message: 'Email and password are required'
			})
		}

		// Connexion de l'utilisateur avec Firebase Auth
		const userCredential = await signInWithEmailAndPassword(auth, email, password)
		const user = userCredential.user

		// Réponse réussie
		return res.status(200).json({
			error: false,
			message: 'Sign in successful',
			user: {
				uid: user.uid,
				email: user.email
			}
		})
	} catch (error) {
		// Gestion des erreurs de connexion
		let errorMessage = 'An error occurred during sign in'
		if (error.code === 'auth/wrong-password') {
			errorMessage = 'Incorrect password'
		} else if (error.code === 'auth/user-not-found') {
			errorMessage = 'No user found with this email'
		} else if (error.code === 'auth/invalid-email') {
			errorMessage = 'Invalid email address'
		}

		return res.status(401).json({
			error: true,
			message: errorMessage
		})
	}
}

exports.logout = async (req, res) => {
	try {
		// Déconnexion de l'utilisateur
		await signOut(auth)

		// Réponse réussie
		return res.status(200).json({
			error: false,
			message: 'User has been logged out successfully',
		})
	} catch (error) {
		console.log(error)
		// Gestion des erreurs de déconnexion
		return res.status(500).json({
			error: true,
			message: 'An error occurred during logout',
		})
	}
}
// verify email
// this work after signup & signin
exports.verifyEmail = (req, res) => {
	auth
		.currentUser.sendEmailVerification()
		.then(function () {
			return res.status(200).json({ status: 'Email Verification Sent!' })
		})
		.catch(function (error) {
			let errorCode = error.code
			let errorMessage = error.message
			if (errorCode === 'auth/too-many-requests') {
				return res.status(500).json({ error: errorMessage })
			}
		})
}

// forget password
exports.forgetPassword = (req, res) => {
	if (!req.body.email) {
		return res.status(422).json({ email: 'email is required' })
	}
	auth
		.sendPasswordResetEmail(req.body.email)
		.then(function () {
			return res.status(200).json({ status: 'Password Reset Email Sent' })
		})
		.catch(function (error) {
			let errorCode = error.code
			let errorMessage = error.message
			if (errorCode == 'auth/invalid-email') {
				return res.status(500).json({ error: errorMessage })
			} else if (errorCode == 'auth/user-not-found') {
				return res.status(500).json({ error: errorMessage })
			}
		})
}