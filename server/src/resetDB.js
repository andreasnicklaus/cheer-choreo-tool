const db = require("./db");
const seed = require("./db/seed");

db.authenticate().then(
  db.sync({ force: true }).then(() => {
    seed();
  })
);
