import BasePage from './BasePage.js';

class FacilitiesResultsPage extends BasePage {

    // ===== Page Anchor =====
    get heading() {
        return $('h1*=Facilities near');
    }

    // ===== Table Elements =====
    get tableRows() {
        return $$('table.govuk-table tbody tr');
    }

    // ===== Actions =====

    async waitForPageLoad() {
        await this.waitForVisible(this.heading);
    }

    /**
     * ✅ Get row by facility name (PRIMARY KEY approach)
     */
    async findRowByFacility(facilityName) {
        const rows = await this.tableRows;

        for (const row of rows) {
            const firstCell = await row.$('td:first-child');
            const text = await firstCell.getText();

            if (text.includes(facilityName)) {
                return row;
            }
        }

        throw new Error(`Facility '${facilityName}' not found`);
    }

    /**
     * ✅ Click "View" for a given facility
     */
    async clickViewByFacility(facilityName) {
        const row = await this.findRowByFacility(facilityName);

        const viewLink = await row.$('td:last-child a');
        await this.click(viewLink);
    }

    /**
     * ✅ Advanced: match using facility + activity
     */
    async clickViewByFacilityAndActivity(facilityName, activityName) {
        const rows = await this.tableRows;

        for (const row of rows) {
            const facilityCell = await row.$('td:first-child');
            const activityCell = await row.$('td:nth-child(2)');

            const facilityText = await facilityCell.getText();
            const activityText = await activityCell.getText();

            if (
                facilityText.includes(facilityName) &&
                activityText.includes(activityName)
            ) {
                const viewLink = await row.$('td:last-child a');
                await this.click(viewLink);
                return;
            }
        }

        throw new Error(
            `Row not found for Facility='${facilityName}', Activity='${activityName}'`
        );
    }

    /**
     * ✅ Extract all facility names (for validations)
     */
    async getAllFacilities() {
        const rows = await this.tableRows;
        const facilities = [];

        for (const row of rows) {
            const text = await row.$('td:first-child').getText();
            facilities.push(text.split('\n')[0]); // remove distance text
        }

        return facilities;
    }
}

export default new FacilitiesResultsPage();