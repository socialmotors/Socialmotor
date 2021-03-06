const express = require("express")
const router = express.Router()
const passport = require("passport")
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const cloudUploader = require('../configs/cloudinary.config')
const Car = require("../models/car.model");
const User = require ('../models/user.model')




router.get('/', ensureLoggedIn(), (req, res, next) => {
    const carPromise = Car.find({creatorId: req.user._id})
    const userPromise = User.findById(req.user.id)
    Promise.all([carPromise, userPromise])
        .then(data => { 
            console.log(data[0])
            return res.render('profile/profile', { cars: data[0], users: data[1] })
        })
        .catch(err => next(new Error(err)))
})

router.get('/edit/:id', ensureLoggedIn(), (req, res, next) => {
    User.findById(req.user.id)
        .then((editUser) => res.render('profile/profile-edit', { editUser }))
        .catch(err => next(new Error(err)))
})

router.post('/edit/:id', cloudUploader.single('paco'), ensureLoggedIn(), (req, res, next) => {
    const editUser =
    {
        username: req.body.username,
        email: req.body.email,
        profilePicPath: req.file.url,
        age: req.body.age,
        address: req.body.address,
        dni: req.body.dni,
        phoneNumber: req.body.phoneNumber
    } 
    User.findByIdAndUpdate(req.params.id, editUser, { new: true })
        .then(() => res.redirect('/profile'))
        .catch(err => next(new Error(err)))
})



router.get('/delete/:id', ensureLoggedIn(), (req, res, next) => {
    console.log(req.user.id)
    User.findByIdAndRemove(req.user.id)
        .then(() => res.redirect('/'))
        .catch(err => next(new Error(err)))
})

module.exports = router