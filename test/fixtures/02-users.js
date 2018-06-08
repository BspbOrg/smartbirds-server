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
      role: 'user',
      passwordHash: '$2a$10$32SyvkdyXJNRRAX8PBMHq.cyHDI19vdle/v6zeDhn7SxhgAYyFucC' // hash of 'secret'
    }
  },
  {
    model: 'user',
    data: {
      email: 'admin@smartbirds.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      passwordHash: '$2a$10$32SyvkdyXJNRRAX8PBMHq.cyHDI19vdle/v6zeDhn7SxhgAYyFucC' // hash of 'secret'
    }
  },
  {
    model: 'user',
    data: {
      email: 'user2@smartbirds.com',
      firstName: 'Second',
      lastName: 'User',
      role: 'user',
      passwordHash: '$2a$10$32SyvkdyXJNRRAX8PBMHq.cyHDI19vdle/v6zeDhn7SxhgAYyFucC' // hash of 'secret'
    }
  },
  {
    model: 'user',
    data: {
      email: 'birds@smartbirds.com',
      firstName: 'Moderator',
      lastName: 'Birds',
      role: 'moderator',
      forms: { 'formBirds': true },
      passwordHash: '$2a$10$32SyvkdyXJNRRAX8PBMHq.cyHDI19vdle/v6zeDhn7SxhgAYyFucC' // hash of 'secret'
    }
  },
  {
    model: 'user',
    data: {
      email: 'cbm@smartbirds.com',
      firstName: 'Moderator',
      lastName: 'CBM',
      role: 'moderator',
      forms: { 'formCBM': true },
      passwordHash: '$2a$10$32SyvkdyXJNRRAX8PBMHq.cyHDI19vdle/v6zeDhn7SxhgAYyFucC' // hash of 'secret'
    }
  },
  {
    model: 'user',
    data: {
      email: 'adopt@smartbirds.com',
      firstName: 'Adopt',
      lastName: 'Orphans',
      role: 'user',
      passwordHash: '$2a$10$32SyvkdyXJNRRAX8PBMHq.cyHDI19vdle/v6zeDhn7SxhgAYyFucC' // hash of 'secret'
    }
  }
]
