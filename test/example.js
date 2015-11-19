process.env.NODE_ENV = 'test';

var should = require('should');
var setup = require("./_setup");
console.log(setup);

describe('smartbirds Tests', function(){

  before(function(done){
    setup.init(done);
  });

  after(function(done){
    setup.finish(done);
  });

  it('should have booted into the test env', function(){
    process.env.NODE_ENV.should.equal('test');
    setup.api.env.should.equal('test');
    should.exist(setup.api.id);
  });

});
