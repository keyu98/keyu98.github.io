---
layout: post
title: "PriorityQueue"
subtitle: "Java集合源码剖析之PriorityQueue"
author: "KeYu"
header-style: text
tags:
  - JAVA笔记
---
**目录**
* content
{:toc}

# 简介
* PriorityQueue意为优先队列，它的对象头总是队列中最小的那一个数。
* 队列由数组实现，数组大小动态增加，容量无限。  
`transient Object[] queue; // non-private to simplify nested class access`
* 其默认由小顶堆实现
* 其可以用来有效解决topK问题，也可以通过修改compactor将其修改为大顶堆
> 小顶堆:是一种经过排序的完全二叉树，其中任一非终端节点的数据值均不大于其左子节点和右子节点的值

# 实现

## 构造函数

```java
//默认大小为11
private static final int DEFAULT_INITIAL_CAPACITY = 11;

/**
 * 无参的构造函数
 */
public PriorityQueue() {
    this(DEFAULT_INITIAL_CAPACITY, null);
}

/**
 * 指定大小的构造函数
 */
public PriorityQueue(int initialCapacity) {
    this(initialCapacity, null);
}

/**
 * 指定大小并能传入自定义comparator，用于元素的比较
 */
public PriorityQueue(int initialCapacity,
                         Comparator<? super E> comparator) {
        // Note: This restriction of at least one is not actually needed,
        // but continues for 1.5 compatibility
        if (initialCapacity < 1)
            throw new IllegalArgumentException();
        this.queue = new Object[initialCapacity];
        this.comparator = comparator;
    }
```

## add方法

```java
//add元素e
public boolean add(E e) {
    return offer(e);
}

/**
 * 在优先级队列插入元素e
 * 优先级队列中不能传入null元素
 */
public boolean offer(E e) {
    //e不能为空
    if (e == null)
        throw new NullPointerException();
    modCount++;
    int i = size;//其中size记录的是优先级队列中已有的元素个数
    if (i >= queue.length)
        grow(i + 1);//若空间不够，则扩容
    size = i + 1;
    if (i == 0)//若没有元素，则直接将e放到堆顶
        queue[0] = e;
    else
        siftUp(i, e);//否则进行一个堆调整
    return true;
}
```

## remove方法

```java
/**
 * 移除小顶堆堆顶元素
 * 默认是最小的元素
 */
public E poll() {
    if (size == 0)
        return null;
    int s = --size;//元素数量减一
    modCount++;
    E result = (E) queue[0];
    E x = (E) queue[s];
    queue[s] = null;
    if (s != 0)
        siftDown(0, x);//从0向下调整
    return result;
}

/**
 * 指定移除对应节点元素
 */
private E removeAt(int i) {
    // assert i >= 0 && i < size;
    modCount++;
    int s = --size;
    if (s == i) // removed last element
        queue[i] = null;
    else {
        E moved = (E) queue[s];
        queue[s] = null;
        siftDown(i, moved);
        if (queue[i] == moved) {
            siftUp(i, moved);
            if (queue[i] != moved)
                return moved;
        }
    }
    return null;
}
```

## 堆调整
* 所谓堆调整，即是让小顶堆始终满足它的定义  
即：`每一个节点的左右孩子，都不小于其父节点`

```java
/**
 * 堆调整
 * 若没有有自定义comparator，则使用默认的比较
 */
private void siftUp(int k, E x) {
    if (comparator != null)
        siftUpUsingComparator(k, x);
    else
        siftUpComparable(k, x);
}

/**
 * 堆调整
 * 向上调整
 * @param k 调整的起始位置
 * @param x 调整的起始位置元素
 */
private void siftUpComparable(int k, E x) {
    Comparable<? super E> key = (Comparable<? super E>) x;
    while (k > 0) {//直到堆顶，堆顶没有上界
        //在数组中，(k-1)/2就是父节点的位置
        int parent = (k - 1) >>> 1;
        Object e = queue[parent];
        //如果其父节点小于比较元素，就完成
        if (key.compareTo((E) e) >= 0)
            break;
        //否则将元素与其父节点交换位置
        queue[k] = e;
        k = parent;
    }
    queue[k] = key;
}

/**
 * 堆调整
 * 向下调整
 * @param k 调整的起始位置
 * @param x 调整的起始位置元素
 */
private void siftDownComparable(int k, E x) {
    Comparable<? super E> key = (Comparable<? super E>)x;
    //最后一个有子节点的节点在数组中的位置为(len-1)/2
    int half = size >>> 1;        // loop while a non-leaf
    //向下调整，直到没有子节点
    while (k < half) {
        //获得其左孩子，数组中位置为(2*k + 1)
        int child = (k << 1) + 1; // assume left child is least
        Object c = queue[child];
        //右孩子
        int right = child + 1;
        
        if (right < size &&
            ((Comparable<? super E>) c).compareTo((E) queue[right]) > 0)
            //有右孩子则与右孩子交换
            //否则与左孩子交换
            c = queue[child = right];
        if (key.compareTo((E) c) <= 0)
            //如果满足堆的定义
            break;
        queue[k] = c;
        k = child;
        //继续向下调整
    }
    queue[k] = key;
}
```

## 扩容

```java
/**
 * 进行扩容
 * 如果值还小，就两倍扩容
 * 否则扩容1.5倍
 */
private void grow(int minCapacity) {
        int oldCapacity = queue.length;
        // Double size if small; else grow by 50%
        int newCapacity = oldCapacity + ((oldCapacity < 64) ?
                                         (oldCapacity + 2) :
                                         (oldCapacity >> 1));
        // overflow-conscious code
        if (newCapacity - MAX_ARRAY_SIZE > 0)
            newCapacity = hugeCapacity(minCapacity);
        queue = Arrays.copyOf(queue, newCapacity);
    }
```