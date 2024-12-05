import ax from "./RequestService";

class FeedbackService {
  sendFeedback(stars, text) {
    return ax.post("/feedback", { stars, text }).then((res) => res.data);
  }

  getAll() {
    return ax.get("/feedback").then((res) => res.data);
  }
}

export default new FeedbackService();
