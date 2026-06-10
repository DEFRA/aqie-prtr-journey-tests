import BasePage from './BasePage.js';

class WasteTransferDetailsPage extends BasePage {

    // ===== Page Anchor =====
    get heading() {
        return $('h1');
    }

    // ===== Summary List =====
    get summaryRows() {
        return $$('.govuk-summary-list__row');
    }

    // ===== Additional Sections =====
    get wasteInfoHeading() {
        return $('h2=What is non hazardous waste?');
    }

    get recoveryInfoHeading() {
        return $('h2=What does recovery mean?');
    }

    // ===== Actions =====

    async waitForPageLoad() {
        await this.waitForVisible(this.heading);
    }

    /**
     * ✅ Validate waste-specific header
     */
    async validateHeader(expectedText) {
        const actual = await this.heading.getText();

        if (!actual.toLowerCase().includes(expectedText.toLowerCase())) {
            throw new Error(
                `Expected header '${expectedText}' but got '${actual}'`
            );
        }
    }

    /**
     * ✅ Generic key-value extractor
     */
    async getValueByKey(keyName) {
        const rows = await this.summaryRows;

        for (const row of rows) {
            const key = await row.$('.govuk-summary-list__key').getText();

            if (key.trim().toLowerCase() === keyName.toLowerCase()) {
                return await row.$('.govuk-summary-list__value').getText();
            }
        }

        throw new Error(`Key '${keyName}' not found`);
    }

    /**
     * ✅ Validate key-value
     */
    async validateKeyValue(key, expectedValue) {
        const actual = await this.getValueByKey(key);

        if (!actual.includes(expectedValue)) {
            throw new Error(
                `Validation failed for '${key}'. Expected '${expectedValue}', found '${actual}'`
            );
        }
    }

    /**
     * ✅ Validate info sections are present (important for business validation)
     */
    async validateInfoSections() {
        await this.waitForVisible(this.wasteInfoHeading);
        await this.waitForVisible(this.recoveryInfoHeading);
    }

    /**
     * ✅ Extract all summary data
     */
    async getAllDetails() {
        const rows = await this.summaryRows;
        const data = {};

        for (const row of rows) {
            const key = await row.$('.govuk-summary-list__key').getText();
            const value = await row.$('.govuk-summary-list__value').getText();

            data[key.trim()] = value.trim();
        }

        return data;
    }
}

export default new WasteTransferDetailsPage();
