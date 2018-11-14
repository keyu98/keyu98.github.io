---
layout: post
title: "将整数每一位拆分"
subtitle: "Split integers"
author: "KeYu"
header-style: text
tags:
  - 算法
---


用数学的方法来拆分
===============

{% highlight ruby %}
n=12345
while (n>0):
    l.append(n%10)
    n=n/10
l=list(reversed(l))#将顺序倒过来
{% endhighlight %}

此时l生成列表[1,2,3,4,5]


类型转换的方法来拆分
================
{% highlight ruby %}
n=12345
l=list(str(n))#现将整数转化为字符串，然后变成列表
l=map(int,l)#将列表中的元素转化成整数
{% endhighlight %}

代码简单，但是运行时间却会长一些