import BasePage from './BasePage.js'
import createLogger from '../helpers/logger.js'

const logger = createLogger()

class DownloadDataPage extends BasePage {
  // ===== URL =====

  async open() {
    await super.open('/public/iteration-1/download')
  }

  // ===== Page Anchor =====

  get heading() {
    return $('h1=Download all data for a year')
  }

  // ===== All Download Buttons =====
  get downloadButtons() {
    return $$('a[data-testid="aq-button-secondary"]')
  }

  /**
   * ✅ Dynamic locator by year
   */
  downloadButtonByYear(year) {
    return $(
      `//a[@data-testid="aq-button-secondary"][.//span[contains(normalize-space(),"Download ${year} data")]]`
    )
  }

  // ==== Back Link ===
  get backLink() {
    return $('a.govuk-back-link')
  }

  // ===== Actions =====

  async waitForPageLoad() {
    await this.waitForVisible(this.heading)
  }

  /**
   * ✅ Click download for specific year
   */
  async clickDownloadByYear(year) {
    const button = this.downloadButtonByYear(year)

    await button.waitForDisplayed({ timeout: 10000 })
    await button.scrollIntoView()
    await button.waitForClickable({ timeout: 10000 })

    await button.click()
  }

  /**
   * ✅ Verify year exists
   */
  async isYearAvailable(year) {
    return await this.downloadButtonByYear(year).isDisplayed()
  }

  /**
   * ✅ Get all available years (useful for validations)
   */
  async getAllAvailableYears() {
    const elements = await this.downloadButtons

    const years = []

    for (const el of elements) {
      const text = await el.getText()
      logger.info('Element text:', text)
      const match = text.match(/\d{4}/)
      if (match) {
        years.push(match[0])
      }
    }

    return years
  }

  /**
   * Clicks the Back link
   */
  async clickBackLink() {
    await this.backLink.click()
  }
}

export default new DownloadDataPage()
