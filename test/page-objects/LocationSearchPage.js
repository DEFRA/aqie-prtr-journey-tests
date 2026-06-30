import BasePage from './BasePage.js'

class LocationSearchPage extends BasePage {
  // ===== URL =====
  async open() {
    await super.open('/public/iteration-1/location-search')
  }

  // ===== Page Anchor =====
  get heading() {
    return $('h1=Search by location')
  }

  // ===== Navigation =====
  get backLink() {
    return $('a.govuk-back-link')
  }

  // ===== Form Elements =====
  get locationInput() {
    return $('#location-search') // ✅ Best selector (ID = most stable)
  }

  get continueButton() {
    return $('button[type="submit"]')
  }

  // ===== Optional Prototype Link =====
  get noResultsLink() {
    return $('a[href="results-location-none"]')
  }

  // ===== Page Actions =====
  async waitForPageLoad() {
    await this.waitForVisible(this.heading)
  }

  async enterLocation(location) {
    await this.waitForVisible(this.locationInput)
    await this.locationInput.clearValue() // ✅ prevents flaky typing issues
    await this.locationInput.setValue(location)
  }

  async submitSearch() {
    await this.click(this.continueButton)
  }

  async searchForLocation(location) {
    await this.enterLocation(location)
    await this.submitSearch()
  }

  async goBack() {
    await this.click(this.backLink)
  }

  async navigateToNoResults() {
    await this.click(this.noResultsLink)
  }
}

// ✅ Singleton export
export default new LocationSearchPage()
