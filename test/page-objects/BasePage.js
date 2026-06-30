export default class BasePage {
  async open(path = '') {
    await browser.url(path)
  }

  async waitForVisible(element, timeout = 5000) {
    await element.waitForDisplayed({ timeout })
  }

  async waitForClickable(element, timeout = 5000) {
    await element.waitForClickable({ timeout })
  }

  async click(element) {
    await this.waitForClickable(element)
    await element.click()
  }
}
