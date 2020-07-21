/**
 * Created by groupsky on 20.11.15.
 */

module.exports = [
  {
    model: 'zone',
    data: {
      id: 'userPlov',
      status: 'owned',
      owner: {email: 'user@smartbirds.com'},
      location: {nameLocal: 'Plovdiv'}
    }
  },
  {
    model: 'zone',
    data: {
      id: 'freePlov',
      location: {nameLocal: 'Plovdiv'}
    }
  },
  {
    model: 'zone',
    data: {
      id: 'adminPlov',
      owner: {email: 'admin@smartbirds.com'},
      status: 'owned',
      location: {nameLocal: 'Plovdiv'}
    }
  },
  {
    model: 'zone',
    data: {
      id: 'userSofia',
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
      id: 'freeSofia',
      location: {nameLocal: 'Sofia'}
    }
  },
  {
    model: 'zone',
    data: {
      id: 'adminSofia',
      owner: {email: 'admin@smartbirds.com'},
      status: 'owned',
      location: {nameLocal: 'Sofia'}
    }
  }
]
