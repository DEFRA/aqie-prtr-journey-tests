import BasePage from './BasePage.js'

class LocationNotFoundPage extends BasePage {
  // ===== Page Anchor =====
  get heading() {
    return $('h1')
  }

  get searchAgainLink() {
    return $('a=Search again')
  }

  get instructionList() {
    return $$('.govuk-list--bullet li')
  }

  // ===== Actions =====

  async waitForPageLoad() {
    await this.waitForVisible(this.heading)
  }

  /**
   * ✅ Validate dynamic error message
   * Example:
   * "someplace"
   */
  async validateErrorMessage(searchTerm) {
    const text = await this.heading.getText()

    if (!text.includes(searchTerm)) {
      throw new Error(
        `Expected search term '${searchTerm}' in error message, but got '${text}'`
      )
    }
  }

  /**
   * ✅ Validate full message (optional strict)
   */
  async validateFullMessage(searchTerm) {
    const expected = `We could not find '${searchTerm}'`
    const actual = await this.heading.getText()

    if (actual.trim() !== expected) {
      throw new Error(`Expected '${expected}' but got '${actual}'`)
    }
  }

  /**
   * ✅ Validate suggestions list exists
   */
  async validateSuggestions() {
    const items = await this.instructionList

    if (items.length === 0) {
      throw new Error('Suggestions list is missing')
    }
  }

  /**
   * ✅ Navigate back to search
   */
  async clickSearchAgain() {
    await this.click(this.searchAgainLink)
  }
}

export default new LocationNotFoundPage()
