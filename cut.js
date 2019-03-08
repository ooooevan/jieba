const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');


// jschardet模块可以检测编码
const {
  getDag,
  getTree
} = require('./getDag');
const {
  hmm
} = require('./hmm')

// tag_model
const dictStr = fs.readFileSync(path.resolve(__dirname, './jieba.dict.utf8')).toString();
const tagData = dictStr.split('\n');

const log = Math.log;

// 获取词的词性
function getTag(str) {
  const arr = cut(str)
  const resultArr = []
  arr.forEach(word => {
    for (let i = 0, len = tagData.length; i < len; i++) {
      let line = tagData[i]
      let lineArr = line.split(' ')
      if (word === lineArr[0]) {
        resultArr.push({
          word,
          tag: lineArr.pop()
        })
        return;
      }
    }
    // 执行到这里说明库中没有词
    resultArr.push({
      word,
      tag: 'x'
    })
  })
  return resultArr;
}

// 找出基于词频的最大切分组合
function cut(str, option = {
  cutAll: false,
  dag: false, //获取词性
  hmm: true,
  cutForSearch: false
}) {

  const tree = getTree();
  const logTotal = log(tree.total)
  const dag = getDag(str);
  // console.log(dag)
  const route = {
    [str.length]: {
      number: 0,
      to: 0
    }
  }
  if (option.dag) {
    return dag
  }

  if (option.cutAll) {
    const result = []
    // 用一个set让已成词的字不再以单字出现。
    // 如：倒闭了  结果为：['倒闭', '了'] ；而不是：['倒', '倒闭', '闭','了']
    const hasInWord = new Set();
    for (let len = str.length, i = 0; i < len; i++) {
      const arr = dag[i];
      if (arr.length === 1) {
        if (!hasInWord.has(i)) {
          result.push(str.slice(i, i + 1))
          hasInWord.add(i)
        }
      } else {
        arr.forEach(x => {
          if (x !== i) {
            result.push(str.slice(i, x + 1))
            hasInWord.add(x)
          }
        })

      }
    }
    return result
  } else {
    for (let len = str.length, i = len - 1; i > -1; i--) {
      const temp = []
      const arr = dag[i];
      for (let j = 0, len = arr.length; j < len; j++) {
        let _i = arr[j];
        let _w = str.slice(i, _i + 1);
        const _node = tree.findWord(_w) || tree;
        let number = (log(_node.number) || 1) - logTotal + route[_i + 1]['number'];
        temp.push({
          number,
          to: _i
        })
      }
      route[i] = temp.sort((a, b) => {
        return b.number - a.number
      })[0]
    }
    var arr = Object.keys(route);
    const result = []
    for (let i = 0, len = arr.length; i < len; i++) {
      const arrIdx = arr[i];
      const item = route[arrIdx];
      if (item.number === 0) {
        break;
      }
      const wordLen = item.to - i + 1;
      const word = str.slice(i, i + wordLen);
      result.push(word)
      i += wordLen - 1;
    }
    if (option.cutForSearch) {
      const searchResult = []
      result.forEach(it => {
        const len = it.length
        if (len > 2) {
          for (let i = 0; i < len - 1; i++) {
            const _it = it.slice(i, i + 2)
            if (tree.findWord(_it)) searchResult.push(_it);
          }
        }
        if (len > 3) {
          for (let i = 0; i < len - 1; i++) {
            const _it = it.slice(i, i + 3)
            if (tree.findWord(_it)) searchResult.push(_it);
          }
        }
        searchResult.push(it);
      })
      return searchResult;
    }
    if (option.hmm) {
      let temp = ''
      let res = []
      for (let i = 0,len = result.length; i < len; i++) {
        const str = result[i];
        if(i === len - 1 || str.length !== 1){
          if (temp) {
            res = res.concat(hmm(temp))
            temp = ''
            res.push(str);
          } else {
            res.push(str);
          }
        }else{
          temp += str
        }
      }
      return res;
    }
    return result;
  }
}

// var data = fs.readFileSync(path.resolve(__dirname, './user.txt'))

// var str = iconv.decode(data, 'utf-8');
// // 编码不对试着用GBK编码
// if(str.indexOf('�') != -1){
//     str = iconv.decode(data, 'gb18030');
// }
// str = str.split('\n')[0]
var str = '程序员'
// console.log(cut(str, {
//   cutAll: false,
//   dag: false,
//   hmm: true, //在cut基础上hmm
//   cutForSearch: false
// }))
console.log(hmm(str))
// cut.hmm()
// cut.dag()  获取有向无环图DAG
// cut.getTag()  获取词性
// console.log(getTag(str))
