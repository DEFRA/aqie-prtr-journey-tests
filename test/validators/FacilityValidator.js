import FacilitiesDetailsPage from '../page-objects/FacilitiesDetailsPage.js'
import ValidationUtils from '../utils/ValidationUtils.js'

class FacilityValidator {
  static async validateFacility(
    facilityName,
    excelRow,
    validationErrors,
    validationWarnings
  ) {
    //
    // AIR
    //
    const hasAir = await FacilitiesDetailsPage.hasAirReleases()

    if (excelRow['Air_PR.Quantity']) {
      if (!hasAir) {
        validationErrors.push(`[${facilityName}] Air Releases section missing`)
      } else {
        const air = await FacilitiesDetailsPage.getAirReleases()

        const actualQuantity = FacilitiesDetailsPage.getTotalQuantity(air)

        const actualUnit = FacilitiesDetailsPage.getUnit(air)

        ValidationUtils.validateQuantity(
          facilityName,
          'Air',
          Number(excelRow['Air_PR.Quantity']),
          actualQuantity,
          validationErrors,
          validationWarnings
        )

        if (
          actualUnit?.toLowerCase() !== excelRow['Air_PR.Units']?.toLowerCase()
        ) {
          validationErrors.push(
            `[${facilityName}] Air Unit mismatch. Expected=${excelRow['Air_PR.Units']}, Actual=${actualUnit}`
          )
        }
      }
    } else if (hasAir) {
      validationErrors.push(
        `[${facilityName}] Air Releases section exists but Excel contains no Air data`
      )
    }

    //
    // WATER
    //
    const hasWater = await FacilitiesDetailsPage.hasWaterReleases()

    if (excelRow['Water_PR.Quantity']) {
      if (!hasWater) {
        validationErrors.push(
          `[${facilityName}] Water Releases section missing`
        )
      } else {
        const water = await FacilitiesDetailsPage.getWaterReleases()

        const actualQuantity = FacilitiesDetailsPage.getTotalQuantity(water)

        const actualUnit = FacilitiesDetailsPage.getUnit(water)

        ValidationUtils.validateQuantity(
          facilityName,
          'Water',
          Number(excelRow['Water_PR.Quantity']),
          actualQuantity,
          validationErrors,
          validationWarnings
        )

        if (
          actualUnit?.toLowerCase() !==
          excelRow['Water_PR.Units']?.toLowerCase()
        ) {
          validationErrors.push(
            `[${facilityName}] Water Unit mismatch. Expected=${excelRow['Water_PR.Units']}, Actual=${actualUnit}`
          )
        }
      }
    } else if (hasWater) {
      validationErrors.push(
        `[${facilityName}] Water Releases section exists but Excel contains no Water data`
      )
    }

    //
    // POLLUTANT TRANSFERS
    //
    const hasTransfers = await FacilitiesDetailsPage.hasPollutantTransfers()

    if (excelRow['Pollutant_transfer.Quantity']) {
      if (!hasTransfers) {
        validationErrors.push(
          `[${facilityName}] Pollutant Transfers section missing`
        )
      } else {
        const transfers = await FacilitiesDetailsPage.getPollutantTransfers()

        const actualQuantity = FacilitiesDetailsPage.getTotalQuantity(transfers)

        const actualUnit = FacilitiesDetailsPage.getUnit(transfers)

        ValidationUtils.validateQuantity(
          facilityName,
          'Pollutant Transfer',
          Number(excelRow['Pollutant_transfer.Quantity']),
          actualQuantity,
          validationErrors,
          validationWarnings
        )

        if (
          actualUnit?.toLowerCase() !==
          excelRow['Pollutant_transfer.Units']?.toLowerCase()
        ) {
          validationErrors.push(
            `[${facilityName}] Transfer Unit mismatch. Expected=${excelRow['Pollutant_transfer.Units']}, Actual=${actualUnit}`
          )
        }
      }
    } else if (hasTransfers) {
      validationErrors.push(
        `[${facilityName}] Pollutant Transfers section exists but Excel contains no Transfer data`
      )
    }

    //
    // WASTE
    //
    const waste = await FacilitiesDetailsPage.getWasteTransfers()

    const domesticRecovery =
      FacilitiesDetailsPage.getWasteTransferQuantity(
        waste,
        'Domestic hazardous waste',
        'Recovery'
      ) || 0

    const domesticDisposal =
      FacilitiesDetailsPage.getWasteTransferQuantity(
        waste,
        'Domestic hazardous waste',
        'Disposal'
      ) || 0

    const transRecovery =
      FacilitiesDetailsPage.getWasteTransferQuantity(
        waste,
        'Transboundary hazardous waste',
        'Recovery'
      ) || 0

    const transDisposal =
      FacilitiesDetailsPage.getWasteTransferQuantity(
        waste,
        'Transboundary hazardous waste',
        'Disposal'
      ) || 0

    const nonHazRecovery =
      FacilitiesDetailsPage.getWasteTransferQuantity(
        waste,
        'Non hazardous waste',
        'Recovery'
      ) || 0

    const nonHazDisposal =
      FacilitiesDetailsPage.getWasteTransferQuantity(
        waste,
        'Non hazardous waste',
        'Disposal'
      ) || 0

    ValidationUtils.validateWaste(
      facilityName,
      'Hazardous Domestic',
      Number(excelRow['HazardousDomestic.Recovery'] || 0),
      domesticRecovery,
      Number(excelRow['HazardousDomestic.Disposal'] || 0),
      domesticDisposal,
      validationErrors,
      validationWarnings
    )

    ValidationUtils.validateWaste(
      facilityName,
      'Hazardous Transboundary',
      Number(excelRow['HazardousTransboundary.Recovery'] || 0),
      transRecovery,
      Number(excelRow['HazardousTransboundary.Disposal'] || 0),
      transDisposal,
      validationErrors,
      validationWarnings
    )

    ValidationUtils.validateWaste(
      facilityName,
      'Non Hazardous',
      Number(excelRow['NonHazardous.Recovery'] || 0),
      nonHazRecovery,
      Number(excelRow['NonHazardous.Disposal'] || 0),
      nonHazDisposal,
      validationErrors,
      validationWarnings
    )

    return {
      errors: validationErrors,
      warnings: validationWarnings
    }
  }
}

export default FacilityValidator
