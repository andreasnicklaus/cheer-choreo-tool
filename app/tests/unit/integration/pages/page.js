export default class Page {
  page;
  route;

  constructor(page) {
    if (this.constructor == Page) {
      throw new Error("Class is of abstract type and can't be instantiated");
    }
    this.page = page;
  }

  goToPage() {
    if (!this.page)
      throw new Error(
        "No route was passed. Set this.route to ensure routing works"
      );
    return this.page.goto(this.route);
  }
}
