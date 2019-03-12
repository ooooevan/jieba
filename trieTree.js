const Node = require('./node');

class standardTrie {
  constructor() {
    this.root = new Node('');
    this.total = 0;
  }
  insertArr(arr) {
    // [ '云计算', '韩玉鉴赏', '蓝翔 nz', '区块链 10 nz' ]
    const numberReg = /^[0-9]+$/
    arr.forEach(line => {
      const arr = line.split(' ')
      const word = arr[0];
      const number = numberReg.test(arr[1]) && +arr[1] || 1;
      const tag = arr[2] || 'x';
      this.total += number
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
