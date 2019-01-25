---
layout: post
title: "HashMap"
subtitle: "java集合源码剖析之HashMap"
author: "KeYu"
header-style: text
tags:
  - JAVA笔记
---
**目录**
* content
{:toc}

# 简介
Java为数据结构中的映射定义了一个接口java.util.Map，此接口主要有四个常用的实现类，分别是HashMap、Hashtable、LinkedHashMap和TreeMap，类继承关系如下图所示：
![](https://pic2.zhimg.com/80/26341ef9fe5caf66ba0b7c40bba264a5_hd.png)
HashMap具有以下特点：
* 根据hashcode值存储数据，大多数情况可以直接定位到它的值，具有较快的访问速度。
* 是非线程安全的，若需要满足线程安全，可以使用ConcurrentHashMap
* 最多允许一条记录的键位null，允许多条记录的值为null

# 结构
从结构上来讲，HashMap是数组+链表+红黑树(JDK1.8增加红黑树)。如下图所示：  
![](https://pic1.zhimg.com/80/8db4a3bdfb238da1a1c4431d2b6e075c_hd.png)

# 键值对
HashMap中有一个非常重要的字段`transient Node<K,V>[] table;`  
Node是HashMap的一个内部类，其本质是一个键值对，如上图所示的黑点。
```java
static class Node<K,V> implements Map.Entry<K,V> {
        final int hash; //用来定位数组索引位置
        final K key;
        V value;
        Node<K,V> next;//链表的下一个node

        Node(int hash, K key, V value, Node<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }

        public final K getKey()        {//TODO}
        public final V getValue()      {//TODO}
        public final String toString() {//TODO }

        public final int hashCode() {//TODO}

        public final V setValue(V newValue) {//TODO}

        public final boolean equals(Object o) {//TODO}
    }
```

# 关键字段

```java
int threshold;             // 所能容纳的key-value对极限 
final float loadFactor;    // 负载因子
int modCount;  
int size;
```

* threshold字段：
  * 由`transient Node<K,V>[] table;`  的长度length和负载因子LoadFactor决定，threshold=length*Loadfactor。
  * 负载因子越大，其能容纳的键值对越多。
  * 若超过这个数就扩容，扩容后的HashMap容量是以前的两倍。
* length默认值为16，负载因子LoadFactor的默认值为0.75
* size字段记录实际存在的键值对数量
* modCount字段记录了HashMap内部结构发生变化的次数。

# 实现
## 确认哈希桶数组索引位置

```java
//方法一：
static final int hash(Object key) {   //jdk1.8 & jdk1.7
     int h;
     // h = key.hashCode() 为第一步 取hashCode值
     // h ^ (h >>> 16)  为第二步 高位参与运算
     return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
//方法二：
static int indexFor(int h, int length) {  //jdk1.7的源码，jdk1.8没有这个方法，但是实现原理一样的
     return h & (length-1);  //第三步 取模运算
}
```
1. 先取key的hashCode值
2. 进行高位运算
3. 进行取模运算

## put方法
执行过程如下：  
![](https://pic3.zhimg.com/80/58e67eae921e4b431782c07444af824e_hd.png)
```java
 public V put(K key, V value) {
        //对key进行hash处理后，执行putVal方法
        return putVal(hash(key), key, value, false, true);
    }
    
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        //若table为空，则创建
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
        //计算index
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
        else {
            Node<K,V> e; K k;
            //若节点存在了，则直接覆盖value
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            //判断链为红黑树
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            //判断链为链表
            else {
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        //若长度大于8，转换为红黑树
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            treeifyBin(tab, hash);
                        break;
                    }
                    //key存在就直接覆盖value
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        //如果超过最大容量，则扩容
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);
        return null;
    }
```

## 扩容机制
扩容既是重新计算容量,数组无法自动扩容，方法就是用一个新的数组来代替已有的容量小的数组。
![](https://pic2.zhimg.com/80/a285d9b2da279a18b052fe5eed69afe9_hd.png)
* 由于是二倍扩容，因为hash的高位运算。hash值可以被分为两类。
  * 新增加的高位为1：索引变为原索引+oldCap
  * 新增加的高位为0：索引不变

```java
final Node<K,V>[] resize() {
        Node<K,V>[] oldTab = table;
        int oldCap = (oldTab == null) ? 0 : oldTab.length;
        int oldThr = threshold;
        int newCap, newThr = 0;
        if (oldCap > 0) {
            //超过最大值后，不再扩展，只能碰撞了
            if (oldCap >= MAXIMUM_CAPACITY) {
                threshold = Integer.MAX_VALUE;
                return oldTab;
            }
            //若没有超过最大值，就扩充为原来的两倍
            else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                     oldCap >= DEFAULT_INITIAL_CAPACITY)
                newThr = oldThr << 1; // double threshold
        }
        else if (oldThr > 0) // initial capacity was placed in threshold
            newCap = oldThr;
        else {               // zero initial threshold signifies using defaults
            newCap = DEFAULT_INITIAL_CAPACITY;
            newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
        }
        //计算新的resize上限
        if (newThr == 0) {
            float ft = (float)newCap * loadFactor;
            newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                      (int)ft : Integer.MAX_VALUE);
        }
        threshold = newThr;
        @SuppressWarnings({"rawtypes","unchecked"})
            Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
        table = newTab;
        if (oldTab != null) {
            //将每个桶都移动新的桶中
            for (int j = 0; j < oldCap; ++j) {
                Node<K,V> e;
                if ((e = oldTab[j]) != null) {
                    oldTab[j] = null;
                    if (e.next == null)
                        newTab[e.hash & (newCap - 1)] = e;
                    else if (e instanceof TreeNode)
                        ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                    else { // preserve order
                        Node<K,V> loHead = null, loTail = null;
                        Node<K,V> hiHead = null, hiTail = null;
                        Node<K,V> next;
                        do {
                            next = e.next;
                            //原索引
                            if ((e.hash & oldCap) == 0) {
                                if (loTail == null)
                                    loHead = e;
                                else
                                    loTail.next = e;
                                loTail = e;
                            }
                            //原索引+oldCap
                            else {
                                if (hiTail == null)
                                    hiHead = e;
                                else
                                    hiTail.next = e;
                                hiTail = e;
                            }
                        } while ((e = next) != null);
                        //放进桶中
                        if (loTail != null) {
                            loTail.next = null;
                            newTab[j] = loHead;
                        }
                        if (hiTail != null) {
                            hiTail.next = null;
                            newTab[j + oldCap] = hiHead;
                        }
                    }
                }
            }
        }
        return newTab;
    }

```

# 线程的不安全性
例子如下：
```java
public class HashMapInfiniteLoop {  

    private static HashMap<Integer,String> map = new HashMap<Integer,String>(2，0.75f);  
    public static void main(String[] args) {  
        map.put(5,"C");  

        new Thread("Thread1") {  
            public void run() {  
                map.put(7, "B");  
                System.out.println(map);  
            };  
        }.start();  
        new Thread("Thread2") {  
            public void run() {  
                map.put(3, "A");  
                System.out.println(map);  
            };  
        }.start();        
    }  
}
```
就jdk1.7的transfer(扩容后转移桶)方法来谈
```java
 void transfer(Entry[] newTable) {
 Entry[] src = table;                   //src引用了旧的Entry数组
     int newCapacity = newTable.length;
     for (int j = 0; j < src.length; j++) { //遍历旧的Entry数组
         Entry<K,V> e = src[j];             //取得旧Entry数组的每个元素
         if (e != null) {
             src[j] = null;//释放旧Entry数组的对象引用（for循环后，旧的Entry数组不再引用任何对象）
             do {
                 Entry<K,V> next = e.next;
                 int i = indexFor(e.hash, newCapacity); //！！重新计算每个元素在数组中的位置
                 e.next = newTable[i]; //标记[1]
                 newTable[i] = e;      //将元素放在数组上
                 e = next;             //访问下一个Entry链上的元素
             } while (e != null);
         }
     }
 }
```
其中初始化了一个长度为2的数组，loadFactor=0.75，也就是说，当put第二个key的时候，map将会扩容。

* 通过设置断点让线程1和线程2同时debug到transfer方法(3.3小节代码块)的首行。注意此时两个线程已经成功添加数据。放开thread1的断点至transfer方法的“Entry next = e.next;” 这一行；然后放开线程2的的断点，让线程2进行resize。结果如下图。  
![](https://pic4.zhimg.com/80/fa10635a66de637fe3cbd894882ff0c7_hd.png)  
* 注意，Thread1的 e 指向了key(3)，而next指向了key(7)，其在线程二rehash后，指向了线程二重组后的链表。  
* 线程一被调度回来执行，先是执行 newTalbe[i] = e， 然后是e=next，导致了e指向了key(7)，而下一次循环的next = e.next导致了next指向了key(3)。 
![](https://pic4.zhimg.com/80/d39d7eff6e8e04f98f5b53bebe2d4d7f_hd.png)  
* e.next = newTable[i] 导致 key(3).next 指向了 key(7)。注意：此时的key(7).next 已经指向了key(3)， 环形链表就这样出现了。
![](https://pic2.zhimg.com/80/5f3cf5300f041c771a736b40590fd7b1_hd.png)
# 推荐阅读
* [Java 8系列之重新认识HashMap](https://zhuanlan.zhihu.com/p/21673805)
* [jdk1.8中ConcurrentHashMap的实现原理](https://blog.csdn.net/fjse51/article/details/55260493)
* [HashMap? ConcurrentHashMap? 相信看完这篇没人能难住你！](https://crossoverjie.top/2018/07/23/java-senior/ConcurrentHashMap/)