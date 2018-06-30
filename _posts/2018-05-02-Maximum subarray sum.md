---
layout: post
title:  Maximum subarray sum（求最大的子数组求和）
date:   2018-05-02 22:01:49 +0800
categories: 算法
tag: 数组
---
求最大的子数组之和
给一串数组，求出它元素之和最大的子数组
例如
    maxSequence([-2, 1, -3, 4, -1, 2, 1, -5, 4])
    # should be 6: [4, -1, 2, 1]


按照一般的方法，代码如下
{% highlight ruby %}
def maxSequence(arr):
    max=0
    for i in range(len(arr)):
        for n in range(i+1,len(arr)+1):
            s=sum(arr[i:n])
            print arr[i:n]
            if (s>max):
                max=s
    return max
{% endhighlight %}

但是有更好的方法，可以只通过一次循环就达到目的
{% highlight ruby %}
def maxSequence(arr):
    max,curr=0,0
    for x in arr:
        curr+=x
        if curr<0:curr=0
        if curr>max:max=curr
    return max
{% endhighlight %}