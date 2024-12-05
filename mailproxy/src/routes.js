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

router.post("/newFeedback", (req, res, next) => {
  const { username, userEmail, stars, text } = req.body;
  MailService.sendFeedbackNotice(username, userEmail, stars, text);
  res.send("Email successfully sent");
  next();
});

module.exports = router;
