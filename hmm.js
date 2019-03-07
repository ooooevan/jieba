/**
 * 基于语料库对语句进行HMM分词
 * 
 *  */

const fs = require('fs');
const path = require('path');


// hmm_model
const model = fs.readFileSync(path.resolve(__dirname, './hmm_model.utf8')).toString();
const modelArr = model.split('\n')
const mini = -3.14e+100
const B = 'b'
const E = 'e'
const M = 'm'
const S = 's'
const BEMS = [B, E, M, S] //用于遍历时得到BEMS

const startProb = {} //初始状态概率
const probTrans = { //转移概率矩阵相应值
  [B]: {},
  [E]: {},
  [M]: {},
  [S]: {}
}
const data = { //所有字符对应的发射概率
  [B]: {},
  [E]: {},
  [M]: {},
  [S]: {}
}

// 获取初始状态概率
const startIndex = modelArr.findIndex(item => {
  return item === '#prob_start'
})
const startArr = modelArr[startIndex + 1].split(' ')
startArr.forEach((item, index) => {
  startProb[BEMS[index]] = +item
})
// 获取转移概率矩阵的概率
const transIndex = modelArr.findIndex(item => {
  return item === '#prob_trans 4x4 matrix'
})
new Array(4).fill(0).forEach((_, index) => {
  const arr = modelArr[transIndex + index + 1].split(' ')
  arr.forEach((item, ind) => {
    probTrans[BEMS[index]][BEMS[ind]] = +item
  })
})

// 获取字符的发射状态概率
const dataStart = modelArr.findIndex(item => {
  return item === '#prob_emit 4 lines';
})
const dataArr = modelArr.slice(dataStart + 1).filter(i => i.length > 10);
dataArr.forEach((item, index) => {
  let wordAndNumArr = item.split(',');
  wordAndNumArr.forEach(wordAndNum => {
    let word = wordAndNum.split(':')[0];
    let number = wordAndNum.split(':')[1];
    data[BEMS[index]][word] = +number
  })
})

// 用递归将字符转换成一颗树形对象
function getWordTree(str) {
  const result = {};
  let wordWord = str[0];
  // 首字符计算概率，不可能出现，则概率为：-3.14e+100
  Object.keys(startProb).forEach(type => {
    const typeNum = startProb[type]
    const wordNum = data[type][wordWord];
    if (typeNum <= mini) {
      return;
    }
    const temp = {
      string: wordWord,
      type: type,
      value: typeNum + wordNum,
    }
    result[type] = temp
    getNextWord(temp, type, 1)

    function getNextWord(res, type, wordIndex) {
      let wordWord = str[wordIndex];
      if (!wordWord) {
        return
      }
      const probTrans1 = probTrans[type]; //A-B映射的前者，由递归中的上一个决定
      Object.keys(probTrans1).forEach(key2 => {
        const typeNum = probTrans1[key2];
        const wordNum = data[key2][wordWord];
        if (typeNum <= mini) {
          return;
        }
        const temp = {
          string: wordWord,
          type: key2,
          value: typeNum + wordNum,
        }
        if (!res['next']) {
          res['next'] = {}
        }
        res['next'][key2] = temp
        getNextWord(temp, key2, wordIndex + 1)
      })
    }
  })
  return result;
}

// 将树形对象转换成所有的路径
function recursion(tree) {
  const ll = []
  Object.keys(tree).forEach(key => {
    var temp = tree[key];
    var arr = [].concat({
      type: temp.type,
      value: temp.value,
      string: temp.string
    });
    return _recursion(temp, arr);
  })

  function _recursion(obj, initArr) {
    Object.keys(obj.next).forEach(key => {
      var temp = obj.next[key];
      var currentArr = initArr.concat({
        type: temp.type,
        value: temp.value,
        string: temp.string
      })
      if (!temp.next) {
        ll.push(currentArr)
      } else {
        _recursion(temp, currentArr);
      }
    })
  }
  return ll
}

// 选取最合适的路径
function getAppropriate(tranArr) {
  // 过滤不符合逻辑的情况，如最后一个是B、M
  tranArr = tranArr.filter(arr => {
    const last = arr[arr.length - 1];
    return last.type === E || last.type === S
  })
  const calArr = tranArr.map(arr => {
    arr.cal = arr.reduce((prev, next) => {
      return prev + next.value
    }, 0)
    return arr
  })
  // 和最小的是最恰当的
  calArr.sort((a, b) => {
    return b.cal - a.cal
  })
  return calArr[0];
}

function getResultStr(conarr) {
  // 输出HMM结果
  const printArr = [];
  let tempstr = ''
  conarr.forEach(it => {
    if (it.type === B) {
      tempstr = it.string;
    } else if (it.type === E) {
      tempstr += it.string
      printArr.push(tempstr);
      tempstr = ''
    } else if (it.type === M) {
      tempstr += it.string
    } else {
      printArr.push(it.string)
    }
  })
  return printArr
}




function _hmm(str) {
  if(str.length === 1){
    return [str]
  }
  const tranObj = getWordTree(str)
  var tranArr = recursion(tranObj)
  var conarr = getAppropriate(tranArr);
  var printArr = getResultStr(conarr);
  return printArr
}

function hmm(str){
  const han_reg = /([\u4E00-\u9FD5]+)/;
  const fu_reg = /([a-zA-Z0-9]+(?:\.\d)?)|([0-9]+(?:\.\d)?%?)/;
  const arr = str.split(han_reg).filter(x=>x);
  let result = []
  arr.forEach(ite => {
    if(ite.match(han_reg)){
      result = result.concat(_hmm(ite))
    }else{
      const _arr = ite.split(fu_reg).filter(x=>x)
      _arr.forEach(i=>{
        result = result.concat(i)
      })
    }
  })
  return result
}

module.exports = {
  hmm
}