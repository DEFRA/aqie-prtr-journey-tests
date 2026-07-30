class SearchByYearPage {
  // =====================================
  // Locators
  // =====================================

  get pageForm() {
    return $('form[action="/search-by-year"]')
  }

  get yearInput() {
    return $('input[name="fullSearchQuery"]')
  }

  get continueButton() {
    return $('button[type="submit"]')
  }

  get backLink() {
    return $('a[href="/search-facility"]')
  }

  // =====================================
  // Waits
  // =====================================

  async waitForPageToLoad() {
    await this.pageForm.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: 'Search By Year page failed to load'
    })
  }

  // =====================================
  // Actions
  // =====================================

  async enterYear(year) {
    await this.yearInput.waitForDisplayed()

    await this.yearInput.clearValue()
    await this.yearInput.setValue(year)
  }

  async clickContinue() {
    await this.continueButton.waitForClickable({
      timeout: 10000
    })

    await this.continueButton.click()
  }

  async clickBack() {
    await this.backLink.waitForClickable({
      timeout: 10000
    })

    await this.backLink.click()
  }

  async searchByYear(year) {
    await this.enterYear(year)
    await this.clickContinue()
  }

  async getEnteredYear() {
    return this.yearInput.getValue()
  }

  async open() {
    await browser.url('/search-by-year')
    await this.waitForPageToLoad()
  }
}

export default new SearchByYearPage()
