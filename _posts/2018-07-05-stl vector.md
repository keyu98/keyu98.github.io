---
layout: post
title:  "C++ vector容器用法"
tag: 
    - STL
---

**目录**
* content
{:toc}

介绍
=====

>vector(向量):是一个顺序的容器，与数组类似。它也可以采用下标对其元素进行访问。但是它与数组比起来有着更多的优越性。

>相对于数组，它有较好的动态拓展型，所以避免了内存的浪费，或者是越界的发生。

>本质讲，vector使用动态分配数组来存储它的元素。当新元素插入时候，这个数组需要被重新分配大小为了增加存储空间。其做法是，分配一个新的数组，然后将全部元素移到这个数组。就时间而言，这是一个相对代价高的任务，因为每当一个新的元素加入到容器的时候，vector并不会每次都重新分配大小。

>与其它动态序列容器相比（deques, lists and forward_lists）， vector在访问元素的时候更加高效，在末尾添加和删除元素相对高效。对于其它不在末尾的删除和插入操作，效率更低。比起lists和forward_lists统一的迭代器和引用更好。

用法
====
>头文件
{% highlight ruby %}
#include<vector>
{% endhighlight %}

>声明及其初始化
{% highlight ruby %}
vector<int> vec;        //声明一个int型向量
vector<int> vec(5);     //声明一个初始大小为5的int向量
vector<int> vec(10, 1); //声明一个初始大小为10且值都是1的向量
vector<int> vec(tmp);   //声明并用tmp向量初始化vec向量
vector<int> tmp(vec.begin(), vec.begin() + 3);  //用向量vec的第0个到第2个值初始化tmp
int arr[5] = {1, 2, 3, 4, 5};   
vector<int> vec(arr, arr + 5);      //将arr数组的元素用于初始化vec向量
//说明：当然不包括arr[4]元素，末尾指针都是指结束元素的下一个元素，
//这个主要是为了和vec.end()指针统一。
vector<int> vec(&arr[1], &arr[4]); //将arr[1]~arr[4]范围内的元素作为vec的初始值
{% endhighlight %}

基本操作
========
(1)容量

    向量大小： vec.size();
    向量最大容量： vec.max_size();
    更改向量大小： vec.resize();
    向量真实大小： vec.capacity();
    向量判空： vec.empty();
    减少向量大小到满足元素所占存储空间的大小： vec.shrink_to_fit(); //shrink_to_fit

(2)修改

    多个元素赋值： vec.assign(); //类似于初始化时用数组进行赋值
    末尾添加元素： vec.push_back();
    末尾删除元素： vec.pop_back();
    任意位置插入元素： vec.insert();
    任意位置删除元素： vec.erase();
    交换两个向量的元素： vec.swap();
    清空向量元素： vec.clear();

(3)迭代器

    开始指针：vec.begin();
    末尾指针：vec.end(); //指向最后一个元素的下一个位置
    指向常量的开始指针： vec.cbegin(); //意思就是不能通过这个指针来修改所指的内容，但还是可以通过其他方式修改的，而且指针也是可以移动的。
    指向常量的末尾指针： vec.cend();

(4)元素的访问

    下标访问： vec[1]; //并不会检查是否越界
    at方法访问： vec.at(1); //以上两者的区别就是at会检查是否越界，是则抛出out of range异常
    访问第一个元素： vec.front();
    访问最后一个元素： vec.back();
    返回一个指针： int* p = vec.data(); //可行的原因在于vector在内存中就是一个连续存储的数组，所以可以返回一个指针指向这个数组。这是是C++11的特性.

