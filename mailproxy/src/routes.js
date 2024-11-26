const { Router } = require("express");
const MailService = require("./services/MailService");

const router = Router();

router.post("/newUser", (req, res, next) => {
  const { username, userId } = req.body;
  MailService.sendUserRegistrationNotice(username, userId);
  res.send("Email successfully sent");
  next();
});

module.exports = router;
