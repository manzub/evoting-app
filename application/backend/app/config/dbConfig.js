const dbConfig = {
  HOST: "localhost",
  PORT: 27017,
  DB: "evoting",
  ROLES: {
    customer: 0,
    superAdmin: 1,
    userAdmin: 2,
    vehicleAdmin: 3
  }
}

module.exports = dbConfig;