exports.default = {
  audit: function (api) {
    return {
      chunkSize: 10000,
      // How long to keep access_audit records (days)
      retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS, 10) || 90
    }
  }
}
