class SearchFacilityPage {
  // ===================================================
  // Locators
  // ===================================================

  get pageHeadingContainer() {
    return $('[data-testid="app-heading"]')
  }

  get pageTitle() {
    return $('[data-testid="app-heading-title"]')
  }

  get continueButton() {
    return $('button[type="submit"]')
  }

  get locationRadio() {
    return $('input[name="searchType"][value="location"]')
  }

  get facilityNameRadio() {
    return $('input[name="searchType"][value="name"]')
  }

  get regionRadio() {
    return $('input[name="searchType"][value="region"]')
  }

  get riverBasinRadio() {
    return $('input[name="searchType"][value="river-basin"]')
  }

  get yearRadio() {
    return $('input[name="searchType"][value="year"]')
  }

  // ===================================================
  // Waits
  // ===================================================

  async waitForPageToLoad() {
    await this.pageHeadingContainer.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: 'Search Facility page failed to load'
    })
  }

  async waitForContinueButton() {
    await this.continueButton.waitForClickable({
      timeout: 10000
    })
  }

  // ===================================================
  // Generic Actions
  // ===================================================

  async selectSearchType(type) {
    const radioMap = {
      location: this.locationRadio,
      name: this.facilityNameRadio,
      region: this.regionRadio,
      'river-basin': this.riverBasinRadio,
      year: this.yearRadio
    }

    const radio = radioMap[type]

    if (!radio) {
      throw new Error(`Unsupported search type: ${type}`)
    }

    await radio.waitForExist({
      timeout: 10000
    })

    await browser.execute((selector) => {
      document.querySelector(selector).checked = true
    }, `input[name="searchType"][value="${type}"]`)
  }

  async clickContinue() {
    await this.waitForContinueButton()
    await this.continueButton.click()
  }

  async chooseSearchAndContinue(type) {
    await this.selectSearchType(type)
    await this.clickContinue()
  }

  // ===================================================
  // Assertions Helpers
  // ===================================================

  async getPageTitle() {
    return this.pageTitle.getText()
  }

  async isLoaded() {
    return this.pageHeadingContainer.isDisplayed()
  }

  // ===================================================
  // Navigation
  // ===================================================

  async open() {
    await browser.url('/search-facility')
    await this.waitForPageToLoad()
  }
}

export default new SearchFacilityPage()
