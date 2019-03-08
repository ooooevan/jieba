const fs = require('fs');
const path = require('path');
const Trie = require('./trieTree');


const iconv = require('iconv-lite');
// jschardet模块可以检测编码

const log = Math.log;

class Cut {
  constructor() {
    this._loaded = false
    this.DEFAULT_DICT_ITEM = {
      dict: './dict/jieba.dict.utf8',
      hmmDict: './dict/hmm_model.utf8',
      idfDict: './dict/idf.utf8',
      userDict: './user.txt',
      stopWordDict: './dict/stop_words.utf8'
    }
    this.USER_DICT = './user.txt'
  }
  checkLoad() {
    if (!this._loaded) {
      this.load()
    }
  }
  load(options) {
    // let a = __dirname
    // let aa = __dirname
    options = Object.assign(this.DEFAULT_DICT_ITEM, options)
    this.dictPath = options.dict
    this.hmmDictPath = options.hmmDict
    this.userDictPath = options.userDict
    this.idfDictPath = options.idfDict
    this.stopWordDictPath = options.stopWordDict

    this.tireTree = this._getTree();
    this._initProbability();

    this._loaded = true
  }
  _initProbability() {
    const model = fs.readFileSync(path.resolve(__dirname, this.hmmDictPath)).toString();
    const modelArr = model.split('\n')

    const B = 'B'
    const E = 'E'
    const M = 'M'
    const S = 'S'
    const BEMS = [B, E, M, S] //用于遍历时得到BEMS

    this.startProb = {} //初始状态概率
    this.transProb = { //转移概率矩阵相应值
      [B]: {},
      [E]: {},
      [M]: {},
      [S]: {}
    }
    this.prevTrans = { //上一个状态
      [B]: [E, S],
      [E]: [B, M],
      [M]: [B, M],
      [S]: [E, S]
    }

    this.emitProb = { //所有字符对应的发射概率
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
      this.startProb[BEMS[index]] = +item
    })
    // 获取转移概率矩阵的概率
    const transIndex = modelArr.findIndex(item => {
      return item === '#prob_trans 4x4 matrix'
    })
    new Array(4).fill(0).forEach((_, index) => {
      const arr = modelArr[transIndex + index + 1].split(' ')
      arr.forEach((item, ind) => {
        this.transProb[BEMS[index]][BEMS[ind]] = +item
      })
    })
    // 获取字符的发射状态概率
    const emitProbStart = modelArr.findIndex(item => {
      return item === '#prob_emit 4 lines';
    })
    const emitProbArr = modelArr.slice(emitProbStart + 1).filter(i => i.length > 10);
    emitProbArr.forEach((item, index) => {
      let wordAndNumArr = item.split(',');
      wordAndNumArr.forEach(wordAndNum => {
        let word = wordAndNum.split(':')[0];
        let number = wordAndNum.split(':')[1];
        this.emitProb[BEMS[index]][word] = +number
      })
    })
  }
  _getTree() {
    const fileString = fs.readFileSync(path.resolve(__dirname, this.dictPath)).toString();
    const lineArr = fileString.split('\n').filter(s => s);
    const Tree = new Trie();
    Tree.insertArr(lineArr)
    return Tree;
  }
  cut(str, options = {
    cutAll: false,
    dag: false,
    hmm: true,
    cutForSearch: false
  }) {
    this.checkLoad()
    const dag = this.getDag(str);
    if (options.dag) {
      return dag
    }
    // route记录从后往前的概率
    const route = {
      [str.length]: {
        number: 0,
        to: 0
      }
    }
    if (options.cutAll) {
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
          const _node = this.tireTree.findWord(_w) || this.tireTree;
          let number = (log(_node.number) || 1) - log(this.tireTree.total) + route[_i + 1]['number'];
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
      if (options.cutForSearch) {
        const searchResult = []
        result.forEach(it => {
          const len = it.length
          if (len > 2) {
            for (let i = 0; i < len - 1; i++) {
              const _it = it.slice(i, i + 2)
              if (this.tireTree.findWord(_it)) searchResult.push(_it);
            }
          }
          if (len > 3) {
            for (let i = 0; i < len - 1; i++) {
              const _it = it.slice(i, i + 3)
              if (this.tireTree.findWord(_it)) searchResult.push(_it);
            }
          }
          searchResult.push(it);
        })
        return searchResult;
      }
      if (options.hmm) {
        let temp = ''
        let res = []
        for (let i = 0, len = result.length; i < len; i++) {
          const str = result[i];
          if (i === len - 1 || str.length !== 1) {
            if (temp) {
              res = res.concat(this.cutHMM(temp))
              temp = ''
              res.push(str);
            } else {
              res.push(str);
            }
          } else {
            temp += str
          }
        }
        return res;
      }
      return result;
    }
  }
  getDag(str) {
    const DAG = {}
    let wNode;
    for (let i = 0, len = str.length; i < len; i++) {
      const w = str[i];
      wNode = wNode || this.tireTree.find(w)
      if (!DAG[i]) {
        DAG[i] = [i] //每个词都可以是single
      }
      if (!wNode) {
        // 遇到库中没有的特殊字符，或空格
        continue;
      }
      getNext(wNode, i + 1, i, len);
      wNode = null;
    }
    // index：到哪个字结束
    // startIndex：从哪个字开始
    function getNext(node, index, startIndex, len) {
      let w = str[index];
      let wNode;
      wNode = node.find(w);
      if (wNode) {
        if (wNode.bound) {
          DAG[startIndex].push(index);
        }
        getNext(wNode, index + 1, startIndex, len);
      }
    }
    return DAG;
  }
  cutHMM(str) {
    this.checkLoad()

    const han_reg = /([\u4E00-\u9FD5]+)/;
    const fu_reg = /([a-zA-Z0-9]+(?:\.\d)?)|([0-9]+(?:\.\d)?%?)/;

    const arr = str.split(han_reg).filter(x => x);
    let result = []
    arr.forEach(it => {
      if (it.match(han_reg)) {
        result = result.concat(_cutHMM(it))
      } else {
        const _arr = it.split(fu_reg).filter(x => x)
        _arr.forEach(i => {
          result = result.concat(i)
        })
      }
    })

    return result
  }
  _cutHMM(str) {
    if (str.length === 1) {
      return [str]
    }
    let {
      correctProb,
      correctPath
    } = _viterbi(str)
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
  _viterbi(sentence) {
    const V = [{}] //保存概率，一个对象一个字符
    let path = {} //保存每种计算过概率的路径
    Object.keys(this.startProb).forEach(type => {
      const firstW = sentence[0]
      const typeProb = this.startProb[type]
      const wordProb = this.emitProb[type][firstW];
      V[0][type] = typeProb + wordProb
      path[type] = [type];
    })

    for (var i = 1; i < sentence.length; i++) {
      V[i] = {}
      var word = sentence[i];
      let newpath = {}
      Object.keys(this.transProb).forEach(curType => {
        const prevTypeArr = this.prevTrans[curType]
        var temp = { //计算哪个概率高和上个type
          prob: '',
          prevType: ''
        };
        prevTypeArr.forEach(prevType => {
          const prevProb = V[i - 1][prevType]
          const curProb = prevProb + this.transProb[prevType][curType] + this.emitProb[curType][word]
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
  cutAll(str) {
    this.checkLoad()
    return this.cut(str, {
      cutAll: true
    })
  }
  cutForSearch() {
    this.checkLoad()
    return this.cut(str, {
      cutForSearch: true
    })
  }
  tag() {
    this.checkLoad()
    const arr = this.cut(str)
    const resultArr = []
    arr.forEach(word => {
      const _Node = this.tireTree.findWord(word) || {}
      resultArr.push({
        word,
        tag: _Node.tag || 'x'
      })
    })
    return resultArr;
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
// console.log(new Cut().cut(str, {
//   cutAll: false,
//   dag: true, //获取dag图
//   hmm: true, //在cut基础上hmm
//   cutForSearch: false
// }))
// console.log(new Cut().tag(str))  //获取词性
// console.log(new Cut().cutAll(str))  //获取词性
// console.log(new Cut().cutForSearch(str))  //获取词性
// var cc = new Cut();
// cc.load({
//   dict: './jieba.dict.utf8',
// })
// console.log(cc.cut(str))

module.exports = new Cut()
