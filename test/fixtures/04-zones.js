/**
 * Created by groupsky on 20.11.15.
 */

module.exports = [
  {
    model: 'zone',
    data: {
      id: 'userZonePlovdiv',
      status: 'owned',
      owner: {email: 'user@smartbirds.com'},
      location: {nameLocal: 'Plovdiv'}
    }
  },
  {
    model: 'zone',
    data: {
      id: 'freeZonePlovdiv',
      location: {nameLocal: 'Plovdiv'}
    }
  },
  {
    model: 'zone',
    data: {
      id: 'adminZonePlovdiv',
      owner: {email: 'admin@smartbirds.com'},
      status: 'owned',
      location: {nameLocal: 'Plovdiv'}
    }
  },
  {
    model: 'zone',
    data: {
      id: 'userZoneSofia',
      owner: {
        email: 'user@smartbirds.com'
      },
      status: 'owned',
      location: {nameLocal: 'Sofia'}
    }
  },
  {
    model: 'zone',
    data: {
      id: 'freeZoneSofia',
      location: {nameLocal: 'Sofia'}
    }
  },
  {
    model: 'zone',
    data: {
      id: 'adminZoneSofia',
      owner: {email: 'admin@smartbirds.com'},
      status: 'owned',
      location: {nameLocal: 'Sofia'}
    }
  }
]
