## 学习jieba分词

参考：[https://github.com/ustcdane/annotated_jieba](https://github.com/ustcdane/annotated_jieba)

```js
const Jieba = require('ooooevan-jieba')
const jieba = new Jieba()
const result = jieba.cut('',{
    cutAll: false,
    dag: false,
    hmm: true,
    cutForSearch: false
  })

```

实现了cut、cutHMM、cutAll、cutForSearch、getDag、tag、load方法


### 过程中的问题

### 1、同样的词库，自己的cut(str, true)和hmm方法和官方的结果不一致，cut(str)一样

如: 
```js
str = '到MI京研大厦'
// nodejieba的结果
nodejieba.cut(str); // ['到', 'M', 'I', '京', '研', '大厦']
nodejieba.cut(str, true); // ['到', 'MI', '京研', '大厦']
nodejieba.cutHMM(str);  // [ '到', 'MI', '京', '研大厦' ]
// 自己的结果
cut(str, true);   // [ '到M', 'I京', '研', '大厦' ]
hmm(str);  // ['到M', 'I京', '研大', '厦']
```

通过调试看源码，发现了hmm用到了很多的正则匹配。
```js
const re_userdict = /^(.+?)( [0-9]+)?( [a-z]+)?$/
const re_eng = /[a-zA-Z0-9]/
const re_han_default = /([\u4E00-\u9FD5a-zA-Z0-9+#&\._%]+)/
const re_skip_default = /(\r\n|\s)/
const re_han_cut_all = /([\u4E00-\u9FD5]+)/
const re_skip_cut_all = /[^a-zA-Z0-9+#\n]/

const han_reg = /([\u4E00-\u9FD5]+)/;
const seg_reg = /([a-zA-Z0-9]+(?:\.\d)?)|([0-9]+(?:\.\d)?%?)/;
```
大致策略是先将中文和非中文分开，对于非中文，再区分普通的英文数字和其他特殊字符
使用了一些正则，就能得到一致的结果


#### 2、hmm函数构建根据BEMS构建树未优化，耗时且太长会导致内存不足

在之前，我将用户输入构建构建成树时非常繁琐复杂，浪费很多内存，容易造成内存不足

```js
var str = "我是拖拉机学院手扶拖拉机专业的。不用多久，我就会升职加薪，当上CEO，走上人生巅峰。";
const treeObj = getWordTree(str); //将字符串转为一个大对象，里面包含需要的字符节点相关数据
var treeArr = recursion(treeObj);  //将大对象转为同等的二维数组，里面有2**n个数组，也就是2**n个不同路径
var conarr = getAppropriate(treeArr); //从2**n个数组中选出最优的一个数组
```

这种方法很直白，是我根据hmm算法描述写的，有太多不需要的数据，导致内存可能爆掉。是`2**n`个而不是`4**n`，因为每个字符在所在位置都只有两种类型而不是四种。如开头字符只可能是B或S，不能是E或M。

```js
str = '程序员'
treeObj = {
  b:{
    next:{
      e:{
        next:{...}
      },
      m:{
        next:{...}
      }
    },
    value: -7.5608
  },
  s:{
    next:{
      s:{
        next:{...}
      },
      b:{
        next:{...}
      }
    },
    value: -11.0326
  }
}
treeArr = [ //长度是8
  [{type:B,value:-7.5608},{type:E,value:-8.363},{type:B,value:-9.5638}],
  []
  ...
]
conarr = [ //最优路径
  {type: "B", value: -7.5608126080925, string: "程"},
  {type: "M", value: -9.818418731874154, string: "序"},
  {type: "E", value: -6.2620785681194855, string: "员"}
]

```
导致内存不足后，修改为官方的方式，思路如下小

```js
str = '程序员'
const prevTrans = {   //上一个状态可能类型
  B: [E, S],
  E: [B, M],
  M: [B, M],
  S: [E, S]
}
// 通过动态规划计算下面结果
"'程'的概率" = {B:'', E:'', M:'', S:''}
"'序'的概率" = {B:'', E:'', M:'', S:''}
"'员'的概率" = {B:'', E:'', M:'', S:''}
/*
开头字符概率是确定的，后一个要根据前一个来确定。如'序'(有BEMS)中的B，和前一个一起的可能类型组合是：EB或SB，则选择计算两种的较高概率的一种。
所以概率表保存的是组合的概率，每个字符的概率都基于前n个字符的概率。这里和cut函数最大切分组合类似，只是那里是从后往前，这里是从前往后的*/
/*
"'程'的概率" = {B:'', E:'', M:'', S:''} //保存字符'程'的不同类型的概率
"'序'的概率" = {B:'', E:'', M:'', S:''} //保存字符'程序'的不同类型的概率
"'员'的概率" = {B:'', E:'', M:'', S:''} //保存字符'程序员'的不同类型的概率
*/

// 概率可以确定了，只要在计算概率时，同时保存路径
// 根据最后得到的最大概率类型，就可以得出是哪个路径了
path = {B: "BEB", E: "BME", M: "BMM", S: "BES"}

```

改成官方的方式，果然好多了，再也不怕用太多内存了

#### 3、不用Trie，改用数组

https://blog.csdn.net/daniel_ustc/article/details/48223135

用process.memoryUsage测试用掉的堆和时间

结构如下：
```js
// 如：北京大学
['北':17860,'北京':34488,'北京大':0,'北京大学':'2053'/*...（其他字典）*/]

```

测试性能：
```js
var one = process.memoryUsage()
var start = new Date()

var sentence = "我是拖拉机学院手扶拖拉机专业的。不用多久，我就会升职加薪，当上CEO，走上人生巅峰。";
const myjieba = new Cut()
const res = myjieba.cut(sentence);

var two = process.memoryUsage()
var usage = two.heapUsed - one.heapUsed
console.log(usage)
console.log(new Date() - start)
```

| 时间   | Trie结构     | 数组        |
| ------ | ------------ | ----------- |
| win10  | (127M, 1.1s) | (90M, 0.8s) |
| Ubuntu | (130M, 1.4s) | (75M, 1s)   |

分别用我的win10和虚拟机测试，这里只表现相对情况。结果可见，用数组明显比用Trie结构更好
Trie结构的在`noTrie`分支，且没有保存词性信息，相关函数无效
