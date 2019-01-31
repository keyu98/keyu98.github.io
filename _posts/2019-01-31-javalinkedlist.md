---
layout: post
title: "LinkedList"
subtitle: "Java集合源码剖析之LinkedList"
author: "KeYu"
header-style: text
tags:
  - JAVA笔记
---
**目录**
* content
{:toc}

# 简介
* LinkedList是一个实现了List接口和Deque接口的双端链表。LinkedList的底层链表结构使它能够支持高效的插入和删除操作，实现了Deque接口的它也有着队列的特性；LinkedList不是线程安全的，如果要是LinkedList变得线程安全，可以调用Collection类中的synchronizedList方法。
* 其内部结构如下图所示：  
![](/img/in-post/java_collection/linkedlist1.jpg)

# 实现
## 节点

```java
private static class Node<E> {
        E item;//节点值
        Node<E> next;//后继节点
        Node<E> prev;//前驱节点

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }
```

## 构造函数

```java
public LinkedList() {
}

public LinkedList(Collection<? extends E> c) {
    this();
    addAll(c);
}
```

## add方法
### 插入链表尾

```java
public boolean add(E e) {
    linkLast(e);//这里就只调用了这一个方法
    return true;
}

/**
 * 链接使e作为最后一个元素。
 */
void linkLast(E e) {
    final Node<E> l = last;
    final Node<E> newNode = new Node<>(l, e, null);
    last = newNode;//新建节点
    if (l == null)
        first = newNode;
    else
        l.next = newNode;//指向后继元素也就是指向下一个元素
    size++;
    modCount++;
}

```
### 插入链表头

```java
public void addFirst(E e) {
    linkFirst(e);
}

private void linkFirst(E e) {
    final Node<E> f = first;
    final Node<E> newNode = new Node<>(null, e, f);//新建节点，以头节点为后继节点
    first = newNode;
    //如果链表为空，last节点也指向该节点
    if (f == null)
        last = newNode;
    //否则，将头节点的前驱指针指向新节点，也就是指向前一个元素
    else
        f.prev = newNode;
    size++;
    modCount++;
}
```
### 插入指定位置

```java
public void add(int index, E element) {
    checkPositionIndex(index); //检查索引是否处于[0-size]之间

    if (index == size)//添加在链表尾部
        linkLast(element);
    else//添加在链表中间
        linkBefore(element, node(index));
}

/**
 * 在指定节点前插入
 */
void linkBefore(E e, Node<E> succ) {
    // assert succ != null;
    final Node<E> pred = succ.prev;
    final Node<E> newNode = new Node<>(pred, e, succ);
    succ.prev = newNode;
    if (pred == null)
        first = newNode;
    else
        pred.next = newNode;
    size++;
    modCount++;
}

/**
 * 用于查找指定节点
 * 由源码可知，LinkedList在进行查询操作时：
 * 若在前半段：则从首节点依次遍历
 * 若在后半段：则从尾节点依次遍历
 */
Node<E> node(int index) {
    // assert isElementIndex(index);

    if (index < (size >> 1)) {
        Node<E> x = first;
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        Node<E> x = last;
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
```
### 插入集合

```java
/**
 * 默认尾部插入集合
 */
public boolean addAll(Collection<? extends E> c) {
    return addAll(size, c);
}

/**
 * 指定位置插入集合
 */
public boolean addAll(int index, Collection<? extends E> c) {
    //1:检查index范围是否在size之内
    checkPositionIndex(index);

    //2:toArray()方法把集合的数据存到对象数组中
    Object[] a = c.toArray();
    int numNew = a.length;
    if (numNew == 0)
        return false;

    //3：得到插入位置的前驱节点和后继节点
    Node<E> pred, succ;
    //如果插入位置为尾部，前驱节点为last，后继节点为null
    if (index == size) {
        succ = null;
        pred = last;
    }
    //否则，调用node()方法得到后继节点，再得到前驱节点
    else {
        succ = node(index);
        pred = succ.prev;
    }

    // 4：遍历数据将数据插入
    for (Object o : a) {
        @SuppressWarnings("unchecked") E e = (E) o;
        //创建新节点
        Node<E> newNode = new Node<>(pred, e, null);
        //如果插入位置在链表头部
        if (pred == null)
            first = newNode;
        else
            pred.next = newNode;
        pred = newNode;
    }

    //如果插入位置在尾部，重置last节点
    if (succ == null) {
        last = pred;
    }
    //否则，将插入的链表与先前链表连接起来
    else {
        pred.next = succ;
        succ.prev = pred;
    }

    size += numNew;
    modCount++;
    return true;
}    

```

## 获取节点
### 获取指定索引的节点

```java
public E get(int index) {
    //检查index范围是否在size之内
    checkElementIndex(index);
    //调用Node(index)去找到index对应的node然后返回它的值
    //时间复杂度O(n/2)
    return node(index).item;
}
```

### 根据指定节点的索引

```java
/**
 * 从头遍历，时间复杂度O(n)
 */
public int indexOf(Object o) {
    int index = 0;
    if (o == null) {
        //从头遍历
        for (Node<E> x = first; x != null; x = x.next) {
            if (x.item == null)
                return index;
            index++;
        }
    } else {
        //从头遍历
        for (Node<E> x = first; x != null; x = x.next) {
            if (o.equals(x.item))
                return index;
            index++;
        }
    }
    return -1;
}
/**
 * 从尾遍历，时间复杂度O(n)
 */
public int lastIndexOf(Object o) {
    int index = size;
    if (o == null) {
        //从尾遍历
        for (Node<E> x = last; x != null; x = x.prev) {
            index--;
            if (x.item == null)
                return index;
        }
    } else {
        //从尾遍历
        for (Node<E> x = last; x != null; x = x.prev) {
            index--;
            if (o.equals(x.item))
                return index;
        }
    }
    return -1;
}
```

## 删除

### 删除头节点

```java
public E pop() {
    return removeFirst();
}
public E remove() {
    return removeFirst();
}
public E removeFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return unlinkFirst(f);
}
```

### 删除尾节点

```java
public E removeLast() {
    final Node<E> l = last;
    if (l == null)
        throw new NoSuchElementException();
    return unlinkLast(l);
}
public E pollLast() {
    final Node<E> l = last;
    return (l == null) ? null : unlinkLast(l);
}
```

**区别**：removeLast()在链表为空时将抛出NoSuchElementException，而pollLast()方法返回null。

### 删除指定元素

```java
public boolean remove(Object o) {
    //如果删除对象为null
    if (o == null) {
        //从头开始遍历
        for (Node<E> x = first; x != null; x = x.next) {
            //找到元素
            if (x.item == null) {
                //从链表中移除找到的元素
                unlink(x);
                return true;
            }
        }
    } else {
        //从头开始遍历
        for (Node<E> x = first; x != null; x = x.next) {
            //找到元素
            if (o.equals(x.item)) {
                //从链表中移除找到的元素
                unlink(x);
                return true;
            }
        }
    }
    return false;
}
```

### 删除指定位置元素

```java
public E remove(int index) {
    //检查index范围
    checkElementIndex(index);
    //将节点删除
    return unlink(node(index));
}

E unlink(Node<E> x) {
    // assert x != null;
    final E element = x.item;
    final Node<E> next = x.next;//得到后继节点
    final Node<E> prev = x.prev;//得到前驱节点

    //删除前驱指针
    if (prev == null) {
        first = next;如果删除的节点是头节点,令头节点指向该节点的后继节点
    } else {
        prev.next = next;//将前驱节点的后继节点指向后继节点
        x.prev = null;
    }

    //删除后继指针
    if (next == null) {
        last = prev;//如果删除的节点是尾节点,令尾节点指向该节点的前驱节点
    } else {
        next.prev = prev;
        x.next = null;
    }

    x.item = null;
    size--;
    modCount++;
    return element;
}
```