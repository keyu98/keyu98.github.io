---
layout: post
title: "MapReduce"
subtitle: "映射/归约与海量数据处理"
author: "KeYu"
header-style: text
tags:
  - 算法
  - 海量数据处理
---

>MapReduce是一种编程模型，用于大规模数据集(大于1TB)的并行运算。概念"Map(映射)"和"Reduce(归约)"，和它们的主要思想，都是从函数式编程语言里借来的，还有从矢量编程语言里借来的特性。它极大地方便了编程人员在不会分布式并行编程的情况下，将自己的程序运行在分布式系统上。 当前的软件实现是指定一个Map(映射)函数，用来把一组键值对映射成一组新的键值对，指定并发的Reduce(归约)函数，用来保证所有映射的键值对中的每一个共享相同的键组。

# 直观理解
**分而治之**  
想要统计一堆牌中有多少张黑桃，最简单的方法是一张一张去数。而 MapReduce 则是让多个玩家来并行地统计，从而大大缩短统计时间：  
1. 把这堆牌分配给多个玩家；
2. 让每个玩家统计自己手中有多少张黑桃；
3. 把所有玩家统计的黑桃数量加起来就是最终的结果。

# 基本原理
MapReduce 用来对海量数据进行离线分析，通过将计算任务分配给集群的多台机器，使得这些计算能够并行地进行。   
它分为 Map 和 Reduce 两个阶段：  
* Map（映射）：对每个目标应用同一操作；
* Reduce（归纳）：整合部分结果。  

在下图中，
* file 被划分为多个 split，每个分片由一个 Mapper Task 去处理。Map 过程中输入的是 [K1, V1] 数据，这是一种键值对形式的数据，键为泛型的 K1 类型，值为泛型的 V1 类型。输出也是一个泛型的键值对 [K2, V2]。
* Shuffle 过程主要是对 Map 阶段输出的键值对进行整合，将键相同的键值对整合到一组中，得到 [K2, {V2,...}] 的整合数据，作为 Reudce 阶段的输入。
* Reduce 处理完之后得到 [K3, V3] 键值对，Hadoop 会将输出的数据存到分布式文件系统 HDFS 中。
![](/img/in-post/MapReduce.png)

# 伪代码
## Map函数
* 接受一个键值对(key-value pair)，产生一组中间键值对。MapReduce框架会将map函数产生的中间键值对里键相同的值传递给一个reduce函数。

```java
ClassMapper

methodmap(String input_key, String input_value):

// input_key: text document name

// input_value: document contents

for eachword w ininput_value:

EmitIntermediate(w, "1");
```
## Reduce函数
* 接受一个键，以及相关的一组值，将这组值进行合并产生一组规模更小的值(通常只有一个或零个值)

```java
ClassReducer

method reduce(String output_key,Iteratorintermediate_values):

// output_key: a word

// output_values: a list of counts

intresult = 0;

for eachv inintermediate_values:

result += ParseInt(v);

Emit(AsString(result));
```
在统计词频的例子里，map函数接受的键是文件名，值是文件的内容，map逐个遍历单词，每遇到一个单词w，就产生一个中间键值对<w, "1">，这表示单词w咱又找到了一个;MapReduce将键相同(都是单词w)的键值对传给reduce函数，这样reduce函数接受的键就是单词w，值是一串"1"(最基本的实现是这样，但可以优化)，个数等于键为w的键值对的个数，然后将这些"1"累加就得到单词w的出现次数。最后这些单词的出现次数会被写到用户定义的位置，存储在底层的分布式存储系统(GFS或HDFS)。

# 参考
[MapReduce /by CyC2018](https://xiaozhuanlan.com/topic/2146059378)