const test = require('ava');
const Myjieba = require('../index')
const myjieba = new Myjieba()


test("const res = myjieba.cut('南京市长江大桥')", t => {
  const res = myjieba.cut('南京市长江大桥');
  t.deepEqual(res, ['南京市', '长江大桥']);
});

test("myjieba.cutHMM('南京市长江大桥')", t => {
  const res = myjieba.cutHMM('南京市长江大桥');
  t.deepEqual(res, ['南京市', '长江大桥']);
});

test("const res = myjieba.cut('南京市长江大桥', {hmm:true})", t => {
  const res = myjieba.cut('南京市长江大桥', true);
  t.deepEqual(res, ['南京市', '长江大桥']);
});

var sentence = "我是拖拉机学院手扶拖拉机专业的。不用多久，我就会升职加薪，当上CEO，走上人生巅峰。";

test("nodejieba.cut(sentence)", t => {
  const res = myjieba.cut(sentence);
  t.deepEqual(res, ['我',
    '是',
    '拖拉机',
    '学院',
    '手扶拖拉机',
    '专业',
    '的',
    '。',
    '不用',
    '多久',
    '，',
    '我',
    '就',
    '会',
    '升职',
    '加薪',
    '，',
    '当上',
    'CEO',
    '，',
    '走上',
    '人生',
    '巅峰',
    '。'
  ]);
});
test("nodejieba.cut(sentence,{hmm:true})", t => {
  const res = myjieba.cut(sentence, {
    hmm: true
  });
  t.deepEqual(res, ['我',
    '是',
    '拖拉机',
    '学院',
    '手扶拖拉机',
    '专业',
    '的',
    '。',
    '不用',
    '多久',
    '，',
    '我',
    '就',
    '会',
    '升职',
    '加薪',
    '，',
    '当上',
    'CEO',
    '，',
    '走上',
    '人生',
    '巅峰',
    '。'
  ]);
});
test("nodejieba.cutHMM(sentence)", t => {
  const res = myjieba.cutHMM(sentence);
  t.deepEqual(res, ['我',
    '是',
    '拖拉机',
    '学院',
    '手',
    '扶',
    '拖拉机',
    '专业',
    '的',
    '。',
    '不用',
    '多久',
    '，',
    '我',
    '就',
    '会升',
    '职加薪',
    '，',
    '当上',
    'CEO',
    '，',
    '走上',
    '人生',
    '巅峰',
    '。'
  ]);
});
test("nodejieba.cutAll(sentence)", t => {
  const res = myjieba.cutAll(sentence);
  t.deepEqual(res, ['我',
    '是',
    '拖拉',
    '拖拉机',
    '学院',
    '手扶',
    '手扶拖拉机',
    '拖拉',
    '拖拉机',
    '专业',
    '的',
    '。',
    '不用',
    '多久',
    '，',
    '我',
    '就',
    '会升',
    '升职',
    '加薪',
    '，',
    '当上',
    'C',
    'E',
    'O',
    '，',
    '走上',
    '人生',
    '巅峰',
    '。'
  ]);
});
test("nodejieba.cutForSearch(sentence)", t => {
  const res = myjieba.cutForSearch(sentence);
  t.deepEqual(res, ['我',
    '是',
    '拖拉',
    '拖拉机',
    '学院',
    '手扶',
    '拖拉',
    '拖拉机',
    '手扶拖拉机',
    '专业',
    '的',
    '。',
    '不用',
    '多久',
    '，',
    '我',
    '就',
    '会',
    '升职',
    '加薪',
    '，',
    '当上',
    'CEO',
    '，',
    '走上',
    '人生',
    '巅峰',
    '。'
  ]);
});
test("nodejieba.tag(sentence)", t => {
  const res = myjieba.tag(sentence);
  t.deepEqual(res, [{
      word: '我',
      tag: 'r'
    },
    {
      word: '是',
      tag: 'v'
    },
    {
      word: '拖拉机',
      tag: 'n'
    },
    {
      word: '学院',
      tag: 'n'
    },
    {
      word: '手扶拖拉机',
      tag: 'n'
    },
    {
      word: '专业',
      tag: 'n'
    },
    {
      word: '的',
      tag: 'uj'
    },
    {
      word: '。',
      tag: 'x'
    },
    {
      word: '不用',
      tag: 'v'
    },
    {
      word: '多久',
      tag: 'm'
    },
    {
      word: '，',
      tag: 'x'
    },
    {
      word: '我',
      tag: 'r'
    },
    {
      word: '就',
      tag: 'd'
    },
    {
      word: '会',
      tag: 'v'
    },
    {
      word: '升职',
      tag: 'v'
    },
    {
      word: '加薪',
      tag: 'nr'
    },
    {
      word: '，',
      tag: 'x'
    },
    {
      word: '当上',
      tag: 't'
    },
    {
      word: 'CEO',
      tag: 'x' 
    },
    {
      word: '，',
      tag: 'x'
    },
    {
      word: '走上',
      tag: 'v'
    },
    {
      word: '人生',
      tag: 'n'
    },
    {
      word: '巅峰',
      tag: 'n'
    },
    {
      word: '。',
      tag: 'x'
    }
  ]);
});
test('myjieba.cut("今天天气很好，🙋 我们去郊游。")', t => {
  const res = myjieba.cut("今天天气很好，🙋 我们去郊游。")
  t.deepEqual(res, ['今天天气', '很', '好', '，', '🙋', ' ', '我们', '去', '郊游', '。']);
});

test('insertWord("男默女泪")', t => {
  const myjieba = new Myjieba()
  const str = '男默女泪'
  const res = myjieba.cut(str)
  t.deepEqual(res, ['男默女', '泪']);
  myjieba.insertWord(str)
  const res1 = myjieba.cut(str)
  t.deepEqual(res1, ['男默女泪']);
})

test('insertWord("月欠族")', t => {
  const str = '月欠族'
  myjieba.load({
    userDict: __dirname + '/user.txt',
  });
  const res1 = myjieba.cut(str)
  t.deepEqual(res1, ['月欠族']);
})

// test('myjieba.cut("访问www.baidu.com进行搜索")', t => {
//   const res = myjieba.cut("访问www.baidu.com进行搜索")
//   t.deepEqual(res, ['访问', 'www', '.', 'baidu', '.', 'com', '进行', '搜索']);
// });
