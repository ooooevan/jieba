const profiler = require('v8-profiler-node8');
const fs = require('fs');
const Cut = require('../index')
var sentence = "我是拖拉机学院手扶拖拉机专业的。不用多久，我就会升职加薪，当上CEO，走上人生巅峰。";

profiler.startProfiling('1', true);
const myjieba = new Cut()
myjieba.cut(sentence);

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
