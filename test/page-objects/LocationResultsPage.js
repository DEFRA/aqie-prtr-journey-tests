import BasePage from './BasePage.js'

class LocationResultsPage extends BasePage {
  // ===== URL (optional) =====
  async open() {
    await super.open('/narrow-location') // adjust if needed
  }

  // ===== Page Anchor =====
  get heading() {
    return $('h1*=Locations matching')
  }

  get locationLinks() {
    return $$('ul.govuk-list li a')
  }

  locationLinkByText(locationName) {
    return $(
      `//ul[contains(@class,"govuk-list")]//a[normalize-space()="${locationName}"]`
    )
  }

  async selectLocation(locationName) {
    const el = await this.locationLinkByText(locationName)
    await el.waitForClickable({ timeout: 5000 })
    await el.click()
  }

  // ===== Other Elements =====
  get tryAgainLink() {
    return $('a[href="location-search.html"]')
  }

  get backLink() {
    return $('a.govuk-back-link')
  }

  // ===== Actions =====
  async waitForPageLoad() {
    await this.waitForVisible(this.heading)
  }

  async getAllLocationTexts() {
    const elements = await this.locationLinks
    return await Promise.all(elements.map(async (el) => await el.getText()))
  }

  async selectLocationContains(partialText) {
    const elements = await this.locationLinks

    for (const el of elements) {
      const text = await el.getText()
      if (text.includes(partialText)) {
        await this.click(el)
        return
      }
    }

    throw new Error(`Location containing '${partialText}' not found`)
  }

  async goBackToSearch() {
    await this.click(this.tryAgainLink)
  }
}

export default new LocationResultsPage()
