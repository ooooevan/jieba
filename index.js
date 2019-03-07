var nodejieba = require("nodejieba");
nodejieba.load({
  dict: nodejieba.DEFAULT_DICT,
  hmmDict: nodejieba.DEFAULT_HMM_DICT,
  userDict: './user.txt',
  idfDict: nodejieba.DEFAULT_IDF_DICT,
  stopWordDict: nodejieba.DEFAULT_STOP_WORD_DICT,
});
var result = nodejieba.cutHMM("开发者可以指定自己自定义的词典",true);
var result1 = nodejieba.cutForSearch("开发者可以指定自己自定义的词典", 5);
var result2 = nodejieba.cutAll("撒江南皮革厂倒闭了", 5);
console.log(result);
// console.log(result1);
// console.log(result2);
