---
layout: post
title:  剑指offer解题代码及思路
date:   2018-07-03 20:52:53 +0800
categories: offer相关
tag: 题库
---

* content
{:toc}

1.二维数组的查找
===============
#题目描述#
>在一个二维数组中，每一行都按照从左到右递增的顺序排序，每一列都按照从上到下递增的顺序排序。请完成一个函数，输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。

#解题思路#
>矩阵有序，从左下角来看，向上数字递减，向右数字递增

>从左下角开始查找，如果比目标值小，则右移，如果比目标值大，则上移。最后能够找到我们要的数

{% highlight ruby %}
class Solution {
public:
    bool Find(int target, vector<vector<int> > array) {
        int row = array.size();//得到行数
        int col = array[0].size();//得到列数
        int nowcol = 0;
        int nowrow = row-1;//将元素查找初始值置为左下角
        int now;
        while (nowrow >= 0 && nowcol <= col-1)
        {
            now = array[nowrow][nowcol];
            if (now == target)//如果找到，则返回true
                return true;
            if (now < target)//如果比目标值小，则右移
            {
                nowcol++;
                continue;
            }
            if (now > target)//如果比目标值大，则上移
            {
                nowrow--;
                continue;
            }
        }
        return false;//没有找到，返回false
    }
};
{% endhighlight %}
----
更新中...

