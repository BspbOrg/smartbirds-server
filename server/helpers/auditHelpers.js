const { Op } = require('sequelize')

/**
 * Validation helpers for audit logging system
 * Provides reusable, secure validation for audit-related inputs
 */
module.exports = {
  /**
   * Validate and parse integer parameter
   * @param {*} value - Value to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {number|null} Parsed integer or null
   * @throws {Error} If value is invalid
   */
  validateInteger (value, fieldName) {
    if (value === undefined || value === null || value === '') {
      return null
    }
    const parsed = parseInt(value, 10)
    if (isNaN(parsed) || parsed < 1) {
      throw new Error(`${fieldName} must be a valid positive integer`)
    }
    return parsed
  },

  /**
   * Validate UUID v7 (used for operationId)
   * Prevents SQL injection attacks via UUID parameters
   * @param {string} value - UUID string to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {string|null} Validated UUID or null
   * @throws {Error} If UUID is invalid
   */
  validateUUID (value, fieldName) {
    if (value === undefined || value === null || value === '') {
      return null
    }
    // UUID v7 format: 8-4-7-4-12 hex characters
    // UUIDv7 has version 7 in 13th position
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(value)) {
      throw new Error(`${fieldName} must be a valid UUID v7 format`)
    }
    return value
  },

  /**
   * Validate and parse date parameter
   * @param {string} value - Date string to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {Date|null} Parsed date or null
   * @throws {Error} If date is invalid
   */
  validateDate (value, fieldName) {
    if (value === undefined || value === null || value === '') {
      return null
    }
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid ${fieldName} format. Use ISO 8601 (e.g., 2026-01-15T10:00:00Z)`)
    }
    return date
  },

  /**
   * Build date range filter for Sequelize where clause
   * @param {string} fromDate - Start date (ISO string)
   * @param {string} toDate - End date (ISO string)
   * @returns {Object|null} Sequelize date range filter or null
   * @throws {Error} If dates are invalid
   */
  buildDateRangeFilter (fromDate, toDate) {
    if (!fromDate && !toDate) {
      return null
    }

    const filter = {}

    if (fromDate) {
      const from = this.validateDate(fromDate, 'fromDate')
      filter[Op.gte] = from
    }

    if (toDate) {
      const to = this.validateDate(toDate, 'toDate')
      // Add 1 day and use < to include entire toDate day
      to.setDate(to.getDate() + 1)
      filter[Op.lt] = to
    }

    return filter
  },

  /**
   * Validate enum value against whitelist
   * @param {string} value - Value to validate
   * @param {Array<string>} validValues - Array of valid values
   * @param {string} fieldName - Field name for error messages
   * @returns {string|null} Validated value or null
   * @throws {Error} If value is not in whitelist
   */
  validateEnum (value, validValues, fieldName) {
    if (value === undefined || value === null || value === '') {
      return null
    }
    if (!validValues.includes(value)) {
      throw new Error(`Invalid ${fieldName}. Must be one of: ${validValues.join(', ')}`)
    }
    return value
  },

  /**
   * Validate sort field and order
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort direction (ASC/DESC)
   * @param {Array<string>} validFields - Array of valid sort fields
   * @returns {Object} { sortBy, sortOrder }
   */
  validateSort (sortBy, sortOrder, validFields) {
    const validatedSortBy = validFields.includes(sortBy) ? sortBy : validFields[0]
    const validatedSortOrder = (sortOrder === 'ASC' ? 'ASC' : 'DESC')
    return { sortBy: validatedSortBy, sortOrder: validatedSortOrder }
  },

  /**
   * Validate and sanitize pagination parameters
   * @param {number} limit - Page size
   * @param {number} offset - Offset
   * @param {number} maxLimit - Maximum allowed limit
   * @returns {Object} { limit, offset }
   */
  validatePagination (limit, offset, maxLimit = 500) {
    const validatedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit, 10) || 50))
    const validatedOffset = Math.max(0, parseInt(offset, 10) || 0)
    return { limit: validatedLimit, offset: validatedOffset }
  }
}
