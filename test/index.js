const myjieba = require('../index')

var str = '程序员'

// 目前路径有问题，用户传入的路径不能被正确识别，

myjieba.load({
  // dict: './jieba.dict.utf8',
})
console.log(myjieba.cut(str))
