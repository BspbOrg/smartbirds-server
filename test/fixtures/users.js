/**
 * Created by groupsky on 19.11.15.
 */

var bcrypt = require('bcrypt');

module.exports = [
  {
    model: "user",
    data: {
      email: "user@smartbirds.com",
      firstName: "Regular",
      lastName: "User",
      isAdmin: false,
      passwordHash: "$2a$10$32SyvkdyXJNRRAX8PBMHq.cyHDI19vdle/v6zeDhn7SxhgAYyFucC",
      passwordSalt: "$2a$10$32SyvkdyXJNRRAX8PBMHq."
    }
  },
  {
    model: "user",
    data: {
      email: "admin@smartbirds.com",
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
      passwordHash: "$2a$10$32SyvkdyXJNRRAX8PBMHq.cyHDI19vdle/v6zeDhn7SxhgAYyFucC",
      passwordSalt: "$2a$10$32SyvkdyXJNRRAX8PBMHq."
    }
  }

];
