/**
 * Created by groupsky on 20.11.15.
 */

module.exports = [
  {
    model: "zone",
    data: {
      id: "user zone",
      owner: {
        email: "user@smartbirds.com"
      }
    }
  },
  {
    model: "zone",
    data: {
      id: "free zone"
    }
  },

  {
    model: "zone",
    data: {
      id: "admin zone",
      owner: {email:"admin@smartbirds.com"}
    }
  }

];
