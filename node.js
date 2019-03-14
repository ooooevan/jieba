// https://blog.csdn.net/fuyzh1024/article/details/7933554

class TrieNode {
  constructor() {
    this.children = {}
    this.bound = false; //是否可为末尾
  }
  add(key, node) {
    if (!this.children[key]) {
      this.children[key] = node;
    }
    return this.children[key];
  }
  find(key) {
    return this.children[key];
  }
  findWord(w) {
    let temp = this
    for (let i = 0, len = w.length; i < len; i++) {
      const _w = w[i];
      temp = temp.find(_w);
      if (!temp) {
        return null;
      }
    }
    return temp;
  }
  addWord(word = '', number, tag) {
    let tempNode = this;
    word.split('').forEach(w => {
      const sub = tempNode.add(w, new TrieNode());
      tempNode.wordCount += 1
      tempNode = sub
    })
    tempNode.bound = true
    // 最后成词，记录频数和词性
    tempNode.number = number
    tempNode.tag = tag
  }

}

module.exports = TrieNode
