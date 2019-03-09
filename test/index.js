const myjieba = require('../index')
const path = require('path')
var str = '程序员'

// 目前路径有问题，用户传入的路径不能被正确识别，

// const a = __dirname
// console.log(a)
// console.log(process.cwd())
// console.log(path.resolve(a, './jieba1.dict.utf8'))
// console.log(path.resolve( './jieba1.dict.utf8'))


// myjieba.load({
//   dict: './jieba1.dict.utf8',
// })
console.log(myjieba.cutHMM(str))
