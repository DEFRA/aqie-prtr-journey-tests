import BasePage from './BasePage.js'

class SearchByFacility extends BasePage {
  // ==========================================
  // Locators
  // ==========================================

  get heading() {
    return $('h1')
  }

  get facilityNameInput() {
    return $('#search-input')
  }

  get continueButton() {
    return $('button[type="submit"]')
  }

  // ==========================================
  // Page Load
  // ==========================================

  async waitForPageLoad() {
    await this.heading.waitForDisplayed()
  }

  // ==========================================
  // Actions
  // ==========================================

  async searchFacility(facilityName) {
    await this.facilityNameInput.waitForDisplayed()

    await this.facilityNameInput.clearValue()

    await this.facilityNameInput.setValue(facilityName)

    await this.continueButton.click()
  }
}

export default new SearchByFacility()
