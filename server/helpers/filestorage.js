module.exports = {
  /**
   * This function checks if the user is denied to access given file
   *
   * @param user - User trying to acces the file
   * @param stat - File meta data
   */
  isDeniedRead (user, stat) {
    return (
      stat.custom &&
      stat.custom.userId &&
      !user.isAdmin &&
      !user.isOrgAdmin &&
      !user.isModerator &&
      // allow viewing images from public lists
      stat.type !== 'image/jpeg' &&
      stat.custom.userId !== user.userId
    )
  }
}
