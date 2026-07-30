class FacilityUtils {
  static getSearchableFacilityName(facilityName) {
    return facilityName.replace(/\s+EPR\/.*$/i, '')
  }
}

export default FacilityUtils
