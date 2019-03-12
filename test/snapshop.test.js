const profiler = require('v8-profiler-node8');
const Myjieba = require('../index')

const myjieba = new Myjieba()

profiler.startProfiling('1', true);
myjieba = new Cut()
myjieba.tag(sentence);

var profile1 = profiler.stopProfiling();
profile1.export(function(error, result) {
  fs.writeFileSync('profile1.heapprofile', result);
  profile1.delete();
});

var snapshot2 = profiler.takeSnapshot('2')
snapshot2.export(function (error, result) {
  fs.writeFileSync('snapshot2.heapsnapshot', result);
  snapshot2.delete();
});
