const express = require("express");
const http = require("http");
const cors = require("cors");
const db = require('./app/models');
const dbConfig = require('./app/config/dbConfig')
const bcrypt = require("bcryptjs");
const authJwt = require("./app/middlewares/authJwt");

const app = express();
const server = http.createServer(app);
const User = db.user;

app.use(require("morgan")("dev"))
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log("Successfully connect to MongoDB.");
    initializeDB();
  }).catch((err) => {
    console.error("Connection error", err);
    process.exit();
  })

async function initializeDB() {
  try {
    const userCount = await User.estimatedDocumentCount();
    if (userCount == 0) {
      let salt = Math.floor(Math.random() * 10);
      const superAdmin = await new User({
        fullname: 'John Doe', email: 'superadmin@evoting.com',
        password: bcrypt.hashSync('password', salt), role: 1
      }).save();
      if (superAdmin) {
        console.log('Super Admin Created');
      }
    }
  } catch (error) {
    console.log(error)
    process.exit()
  }
}

// import routes
require("./app/routes/auth.routes")(app);
require("./app/routes/admin.routes")(app);

app.get("/", (req, res) => res.send({ message: `Visit: http://localhost:3000/` }));

app.get('/ballots', function (req, res) {
  db.ballots.find({}).then(function (docs) {
    res.send({ status: 1, ballots: docs })
  }).catch(err => res.send({ status: 0, message: 'Could not fetch services' }));
})

// default page not found route
app.use("*", (req, res) => {
  res.status(404).json({
    status: 0, message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

const PORT = process.env.PORT || 5555;
server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}.`);
})