import User from "../db/models/user";
import UserService from "@/services/UserService";
import MailService from "@/services/MailService";
import { FaultyInputError } from "@/utils/errors";
import { logger } from "@/plugins/winston";

/**
 * Service for contact operations.
 * Handles logic related to user messages to the support team.
 *
 * @class ContactService
 */
class ContactService {
  async sendMessage(
    name: string,
    email: string,
    subject: string,
    message: string,
    category: string,
    locale: string,
    UserId?: string,
  ) {
    let user: User | null = null;
    if (UserId) {
      await UserService.findById(UserId)
        .then((foundUser) => (user = foundUser))
        .catch((e) => {
          logger.warn(e);
        });
    }
    return Promise.all([
      MailService.sendContactMessage(
        name,
        email,
        subject,
        message,
        category,
        user,
        locale,
      ),
      MailService.sendContactNotification(
        name,
        email,
        subject,
        message,
        category,
        locale,
      ),
    ])
      .then(() => {
        return "Message received";
      })
      .catch((err: Error) => {
        throw new FaultyInputError("Failed to send message: " + err.message);
      });
  }
}

export default new ContactService();
