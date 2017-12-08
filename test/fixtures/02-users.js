/**
 * Created by groupsky on 19.11.15.
 */

module.exports = [
  {
    model: 'user',
    data: {
      email: 'user@smartbirds.com',
      firstName: 'Regular',
      lastName: 'User',
      isAdmin: false,
      passwordHash: '$2a$10$32SyvkdyXJNRRAX8PBMHq.cyHDI19vdle/v6zeDhn7SxhgAYyFucC'
    }
  },
  {
    model: 'user',
    data: {
      email: 'admin@smartbirds.com',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      passwordHash: '$2a$10$32SyvkdyXJNRRAX8PBMHq.cyHDI19vdle/v6zeDhn7SxhgAYyFucC'
    }
  },
  {
    model: 'user',
    data: {
      email: 'user2@smartbirds.com',
      firstName: 'Second',
      lastName: 'User',
      isAdmin: false,
      passwordHash: '$2a$10$32SyvkdyXJNRRAX8PBMHq.cyHDI19vdle/v6zeDhn7SxhgAYyFucC'
    }
  }

]
