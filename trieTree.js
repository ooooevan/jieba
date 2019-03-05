// const fs = require('fs');
// const path = require('path');
const Node = require('./node');
// const fileString = fs.readFileSync(path.resolve(__dirname, './jieba.dict.utf8')).toString();
// const lineArr = fileString.split('\n').filter(s => s);

class standardTrie {
  constructor() {
    this.root = new Node('');
    this.total = 0;
  }
  insertArr(arr) {
    arr.forEach(line => {
      const arr = line.split(' ')
      const word = arr[0];
      const number = arr[1];
      const tag = arr[2];
      this.total += +number
      this.insert(word, number, tag)
    })
  }
  insert(word, number, tag) {
    this.root.addWord(word, number, tag);
  }
  getTree() {
    return this.root;
  }
  find(w) {
    return this.root.find(w);
  }
  findWord(w){
    return this.root.findWord(w);
  }
}

module.exports = standardTrie