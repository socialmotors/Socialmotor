const express = require("express");
const router = express.Router();
const cloudUploader = require("../configs/cloudinary.config");
const {
  ensureLoggedIn,
  ensureLoggedOut
} = require('connect-ensure-login');

const Car = require("../models/car.model");
const User = require("../models/user.model");

// Read documents(list)

router.get("/", (req, res, next) => {
  Car.find()
    .populate("creatorId")
    .then((allCars) => res.render("cars/cars-list", {
      allCars
    }))
    .catch((err) => console.log("Ha habido un error!", err));
});

// Read documents (details)

router.get("/:carId/details", ensureLoggedIn('/login'), (req, res, next) => {
  Car.findById(req.params.carId)
    .populate('creatorId')
    .then((car) => res.render("cars/cars-detail", car))
    .catch((err) => console.log("Ha habido un error!", err));
});

// Create documents

router.get("/create", ensureLoggedIn(), (req, res, next) => {

  Car.find()
    .then((allCars) => {
      const carBrands = ["Abarth", "Alfa Romeo", "Alpine", "Aston Martin", "Audi", "Bentley", "BMW", "Borgward", "Bugatti", "Buick", "BYD", "Cadillac", "Caterham", "Chevrolet", "CitroÃ«n", "Cupra", "Dacia", "Dodge", "DS Automobiles", "Faraday Future", "Ferrari", "Fiat", "Ford", "Fornasari", "GTA Motor", "Honda", "Hurtan", "Hyundai", "Infiniti", "Isuzu", "Iveco", "Jaguar", "Jeep", "KIA Motors", "Koenigsegg", "KTM", "Lada", "Lamborghini", "Lancia", "Land Rover", "Lexus", "Lotus", "Mahindra", "Maserati", "Mazda", "McLaren", "Mercedes-Benz", "Mini", "Mitsubishi", "Morgan", "Nash", "Nissan", "Opel", "Pagani", "Peugeot", "Piaggio", "Polaris", "Polestar", "Porsche", "Renault", "Rolls-Royce", "Saab", "SEAT", "Å koda", "Smart", "SsangYong", "Subaru", "Suzuki", "TATA", "Tesla", "Toyota", "Tramontana", "UROVESA", "Volkswagen", "Volvo", "W Motors"]
      const carState = ["Nuevo", "Usado", "KM0"]
      const carAdStatus = ["En venta", "Vendido", "Reservado"]

      return res.render("cars/cars-create", {
        allCars,
        carBrands,
        carState,
        carAdStatus
      })
    })

    .catch((err) => next(new Error(err)))
});


router.post("/create", cloudUploader.single("imgPathForm"), ensureLoggedIn(), (req, res, next) => {
  const location = {
    type: "Point",
    coordinates: [req.body.latitud, req.body.longitud],
  };

  console.log(req.body, location)

  Car.create({
      brand: req.body.brand,
      model: req.body.model,
      carImagePath: req.file.url,
      manufacturingYear: req.body.manufacturingYear,
      creatorId: req.user.id,
      plate: req.body.plate,
      description: req.body.description,
      state: req.body.state,
      kilometres: req.body.kilometres,
      location: location,
      price: req.body.price,
      adStatus: req.body.adStatus,
    })
    .then(() => res.redirect("/cars"))
    .catch((err) => next(new Error(err)));
});

// Edit documents
router.get("/:car_id/edit", ensureLoggedIn(), (req, res, next) => {
  Car.findById(req.params.car_id)
    .then((CarToEdit) => res.render("cars/cars-edit", CarToEdit))
    .catch((err) => next(new Error(err)));
});

router.post("/:car_id/edit", ensureLoggedIn(), (req, res, next) => {
  const location = {
    type: "Point",
    coordinates: [req.body.latitud, req.body.longitud],
  };
  const {
    brand,
    model,
    manufacturingYear,
    plate,
    description
  } = req.body;

  Car.findByIdAndUpdate(
      req.params.car_id, {
        brand,
        model,
        manufacturingYear,
        plate,
        description,
        location
      }, {
        new: true
      }
    )
    .then((editedCar) => res.redirect(`/cars/${editedCar._id}/details`))
    .catch((err) => next(new Error(err)));
});

//Delete document
router.post("/:car_id/delete", ensureLoggedIn(), (req, res, next) => {
  Car.findById(req.params.car_id)
    .then((result) => {
      console.log(result.creatorId, req.user.id)
      if (result.creatorId == req.user.id) {
        return result.id
      } else {
        return res.redirect('/cars')
      }
    })
    .then((resultId) => Car.findByIdAndRemove(resultId))
    .then(res.redirect("/cars"))
    .catch((err) => next(new Error(err)));
});

// Nodemailer send email to owner of the car

const mailer = require('../configs/nodemailer.config')

router.post('/contact', (req, res, next) => {
  let { email, buyerEmail, subject, message } = req.body;

  mailer.sendMail({
    from: '"Social_Motors" <Social_Motors@gmail.com>',
    to: email, buyerEmail,
    subject: subject, 
    text: message,
    html: `<b>${message}</b>`
  })
  .then(info => res.render('email-sent', {email, subject, message, info}))
  .catch(error => console.log(error));
});


router.get('/api', (req, res, next) => {
  Car.find()
    .then(cars => {
      res.json(cars);
    })
    .catch(error => console.log(error))
})

module.exports = router;