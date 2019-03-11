var nodejieba = require("nodejieba");
// nodejieba.load({
//   dict: nodejieba.DEFAULT_DICT,
//   hmmDict: nodejieba.DEFAULT_HMM_DICT,
//   userDict: './user.txt',
//   idfDict: nodejieba.DEFAULT_IDF_DICT,
//   stopWordDict: nodejieba.DEFAULT_STOP_WORD_DICT,
// });
var sentence = "今天天气很好，🙋 我们去郊游。";

var result = nodejieba.cutHMM("第三方第三反倒是范德萨飞机就给你都不能看了股份发打开是范德萨德萨范德萨德萨范德萨分手的距离何瑞哦会出现这边是范德萨林海股份",true);
var result1 = nodejieba.cut(sentence, 5);
var result2 = nodejieba.cutAll("撒江南皮革厂倒闭了", 5);
// console.log(result);
console.log(result1);
// console.log(result2);
