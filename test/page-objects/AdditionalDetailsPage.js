import BasePage from './BasePage.js'

class AdditionalDetailsPage extends BasePage {
  // ===== Page Anchor =====
  get heading() {
    return $('h1')
  }

  // ===== Summary List =====
  get summaryRows() {
    return $$('.govuk-summary-list__row')
  }

  // ===== Actions =====

  async waitForPageLoad() {
    await this.waitForVisible(this.heading)
  }

  /**
   * ✅ Validate dynamic header (air / water / soil etc.)
   * Example:
   * "Additional details of release to air"
   */
  async validateHeader(expectedHeader) {
    const actualHeader = await this.heading.getText()

    if (!actualHeader.toLowerCase().includes(expectedHeader.toLowerCase())) {
      throw new Error(
        `Expected header '${expectedHeader}' but found '${actualHeader}'`
      )
    }
  }

  /**
   * ✅ Get value from summary list dynamically
   * Example:
   * key = "Total released"
   */
  async getValueByKey(keyName) {
    const rows = await this.summaryRows

    for (const row of rows) {
      const key = await row.$('.govuk-summary-list__key').getText()

      if (key.trim().toLowerCase() === keyName.toLowerCase()) {
        const value = await row.$('.govuk-summary-list__value').getText()
        return value
      }
    }

    throw new Error(`Key '${keyName}' not found`)
  }

  /**
   * ✅ Generic validation
   */
  async validateKeyValue(key, expectedValue) {
    const actualValue = await this.getValueByKey(key)

    if (!actualValue.includes(expectedValue)) {
      throw new Error(
        `For '${key}', expected '${expectedValue}' but found '${actualValue}'`
      )
    }
  }

  /**
   * ✅ Extract all data (useful for assertions/debug)
   */
  async getAllDetails() {
    const rows = await this.summaryRows
    const data = {}

    for (const row of rows) {
      const key = await row.$('.govuk-summary-list__key').getText()
      const value = await row.$('.govuk-summary-list__value').getText()

      data[key.trim()] = value.trim()
    }

    return data
  }
}

export default new AdditionalDetailsPage()
