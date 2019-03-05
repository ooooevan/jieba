const fs = require('fs');
const path = require('path');
const Trie = require('./trieTree');
const fileString = fs.readFileSync(path.resolve(__dirname, './jieba.dict.utf8')).toString();
const lineArr = fileString.split('\n').filter(s => s);

const Tree = new Trie();
Tree.insertArr(lineArr)

function getTree() {
  return Tree;
}

function getDag(str = '') {
  const DAG = {}
  const tree = getTree();
  let wNode;
  for (let i = 0, len = str.length; i < len; i++) {
    const w = str[i];
    wNode = wNode || tree.find(w)
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

module.exports = {
  getDag,
  getTree
}