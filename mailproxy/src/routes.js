const { Router } = require("express");
const MailService = require("./services/MailService");

const router = Router();

router.post("/newUser", (req, res, next) => {
  const { username, userId, userEmail } = req.body;
  MailService.sendUserRegistrationNotice(username, userId, userEmail);
  if (userEmail) {
    MailService.sendWelcomeEmail(username, userId, userEmail);
    MailService.sendEmailConfirmationEmail(username, userId, userEmail);
  }
  res.send("Email successfully sent");
  next();
});

module.exports = router;
