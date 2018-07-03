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

2.替换空格
==========

#题目描述#
>请实现一个函数，将一个字符串中的空格替换成“%20”。例如，当字符串为We Are Happy.则经过替换之后的字符串为We%20Are%20Happy。

#解题思路#
>为了使时间复杂度尽量变小，那么就不能从左到右以此替换，我们应该尽量让字符替换的次数变少

>在程序中，我们先从左到右以此记录空格的数量，然后再从右到左依次替换，这样就把每个字符移动的次数都缩小为一次

>在从右到左替换的过程中，由于空格替换为”%20“，增加了两个字符，所以原来的字符应该向后移动【前面的空格数×2】位
{% highlight ruby %}
class Solution {
public:
	void replaceSpace(char *str,int length) {
        int count = 0;//用于记录空格次数
        for (int i=0;i<length;i++){
            if (str[i] == ' ')//如果字符是空格，那么记录加1
                count++;
        }
        for (int i=length-1;i>=0;i--)//从右到左依次替换
        {
            if(str[i] != ' ')
                str[i+2*count] = str[i];//如果不是空格，就将字符向后移动2位
            else
            {
                count--;//空格记录减1
                str[i+count*2]='%';
                str[i+1+count*2]='2';
                str[i+2+count*2]='0';
            }
        }
     }
};
{% endhighlight %}
----
更新中...

