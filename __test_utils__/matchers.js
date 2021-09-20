/* eslint-env jest */

expect.extend({
  numberCloseTo: (received, number, numDigits = 2) => {
    const pass = Math.abs(number - received) < (10 ** -numDigits / 2)
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be close to ${number} with precision ${numDigits}`,
        pass: true
      }
    } else {
      return {
        message: () =>
          `expected ${received} to be close to ${number} with precision ${numDigits}`,
        pass: false
      }
    }
  }
})
