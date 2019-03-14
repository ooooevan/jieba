const Node = require('./node')

class Dict {
  constructor() {
    this.root = [];
    this.total = 0;
  }
  insertArr(arr) {
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
    for (let i = 0, len = word.length; i < len; i++) {
      let w = word.slice(0, i + 1);
      if (!this.root[w]) {
        this.root[w] = 0
      }
      if (i === len - 1) {
        this.root[w] = new Node(number, tag)
      }
    }
  }
}

module.exports = Dict
