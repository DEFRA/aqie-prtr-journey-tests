class ValidationUtils {
  static validateQuantity(
    facilityName,
    section,
    expected,
    actual,
    validationErrors,
    validationWarnings
  ) {
    const delta = Number((actual - expected).toFixed(2))

    if (Math.abs(delta) > 1) {
      validationErrors.push(
        `[${facilityName}] ${section} Quantity mismatch. Expected=${expected}, Actual=${actual}`
      )
    } else if (delta !== 0) {
      validationWarnings.push(
        `[${facilityName}] ${section} Quantity rounding difference. Expected=${expected}, Actual=${actual}, Delta=${delta}`
      )
    }
  }

  static validateWaste(
    facilityName,
    category,
    expectedRecovery,
    actualRecovery,
    expectedDisposal,
    actualDisposal,
    validationErrors,
    validationWarnings
  ) {
    const hasExcelValues = expectedRecovery > 0 || expectedDisposal > 0

    const hasWebsiteValues = actualRecovery > 0 || actualDisposal > 0

    if (!hasExcelValues && hasWebsiteValues) {
      validationErrors.push(
        `[${facilityName}] ${category} waste exists on website but is blank in Excel`
      )
      return
    }

    if (hasExcelValues && !hasWebsiteValues) {
      validationErrors.push(
        `[${facilityName}] ${category} waste data missing on website`
      )
      return
    }

    const recoveryDelta = Number((actualRecovery - expectedRecovery).toFixed(2))

    const disposalDelta = Number((actualDisposal - expectedDisposal).toFixed(2))

    if (Math.abs(recoveryDelta) > 1) {
      validationErrors.push(
        `[${facilityName}] ${category} Recovery mismatch. Expected=${expectedRecovery}, Actual=${actualRecovery}`
      )
    } else if (recoveryDelta !== 0) {
      validationWarnings.push(
        `[${facilityName}] ${category} Recovery rounding difference. Expected=${expectedRecovery}, Actual=${actualRecovery}, Delta=${recoveryDelta}`
      )
    }

    if (Math.abs(disposalDelta) > 1) {
      validationErrors.push(
        `[${facilityName}] ${category} Disposal mismatch. Expected=${expectedDisposal}, Actual=${actualDisposal}`
      )
    } else if (disposalDelta !== 0) {
      validationWarnings.push(
        `[${facilityName}] ${category} Disposal rounding difference. Expected=${expectedDisposal}, Actual=${actualDisposal}, Delta=${disposalDelta}`
      )
    }
  }
}

export default ValidationUtils
