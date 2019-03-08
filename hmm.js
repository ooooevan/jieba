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
const B = 'B'
const E = 'E'
const M = 'M'
const S = 'S'
const BEMS = [B, E, M, S] //用于遍历时得到BEMS

const startProb = {} //初始状态概率
const probTrans = { //转移概率矩阵相应值
  [B]: {},
  [E]: {},
  [M]: {},
  [S]: {}
}

const prevTrans = { //上一个状态
  [B]: [E, S],
  [E]: [B, M],
  [M]: [B, M],
  [S]: [E, S]
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

function viterbi(sentence) {
  const V = [{}] //保存概率，一个对象一个字符
  let path = {} //保存每种计算过概率的路径
  Object.keys(startProb).forEach(type => {
    const firstW = sentence[0]
    const typeProb = startProb[type]
    const wordProb = data[type][firstW];
    V[0][type] = typeProb + wordProb
    path[type] = [type];
  })

  for (var i = 1; i < sentence.length; i++) {
    V[i] = {}
    var word = sentence[i];
    let newpath = {}
    Object.keys(probTrans).forEach(curType => {
      const prevTypeArr = prevTrans[curType]
      var temp = { //计算哪个概率高和上个type
        prob: '',
        prevType: ''
      };
      prevTypeArr.forEach(prevType => {
        const prevProb = V[i - 1][prevType]
        const curProb = prevProb + probTrans[prevType][curType] + data[curType][word]
        if (!temp.prob || curProb > temp.prob) {
          temp = {
            value: curProb,
            prevType: prevType
          }
        }
      })
      V[i][curType] = temp.prob
      newpath[curType] = path[temp.prevType] + curType
    })
    path = newpath
  }
  const lastProb = V.pop() //最后一个字符计算出的不同type的概率，找出最合适的一个
  let correctProb, correctType
  lastProb.E > lastProb.S ? (correctProb = lastProb.E, correctType = E) : (correctProb = lastProb.S, correctType = S)
  const correctPath = path[correctType]
  return {
    correctProb,
    correctPath
  }
}

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

function _hmm(str) {
  if (str.length === 1) {
    return [str]
  }
  let {
    correctProb,
    correctPath
  } = viterbi(str)
  const result = []
  let temp = ''
  correctPath.split('').forEach((type, idx) => {
    switch (type) {
      case B:
        temp += str[idx]
        break;
      case M:
        temp += str[idx]
        break;
      case E:
        result.push(temp + str[idx])
        temp = ''
        break;
      case S:
        result.push(str[idx])
        break;
    }
  })
  return result
}

function hmm(str) {
  const han_reg = /([\u4E00-\u9FD5]+)/;
  const fu_reg = /([a-zA-Z0-9]+(?:\.\d)?)|([0-9]+(?:\.\d)?%?)/;
  const arr = str.split(han_reg).filter(x => x);
  let result = []
  arr.forEach(ite => {
    if (ite.match(han_reg)) {
      result = result.concat(_hmm(ite))
    } else {
      const _arr = ite.split(fu_reg).filter(x => x)
      _arr.forEach(i => {
        result = result.concat(i)
      })
    }
  })
  return result
}

module.exports = {
  hmm
}