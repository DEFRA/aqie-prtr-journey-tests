import BasePage from './BasePage.js'

class PageNotFoundPage extends BasePage {
  get heading() {
    return $('h1=404')
  }

  get message() {
    return $('p=Page not found')
  }

  async isDisplayed() {
    return (
      (await this.heading.isExisting()) && (await this.message.isExisting())
    )
  }

  async failIfDisplayed(year) {
    if (await this.isDisplayed()) {
      throw new Error(
        `Download document not found for year ${year}. 404 Page displayed.`
      )
    }
  }
}

export default new PageNotFoundPage()
