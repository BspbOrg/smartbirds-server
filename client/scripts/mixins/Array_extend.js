// based on http://stackoverflow.com/a/17368101/96100
Object.defineProperty(Array.prototype, 'extend', {
  __proto__: null,
  enumerable: false,
  configurable: false,
  writable: false,
  value: function (other_array) {
    /* you should include a test to check whether other_array really is an array */
    other_array.forEach(function(v) {this.push(v)}, this);
  },
});
