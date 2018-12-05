---
layout: post
title: "剑指offer解题代码及思路"
subtitle: "Sword to offer"
author: "KeYu"
header-img: "img/post-bg-halting.jpg"
header-mask: 0.3
tags:
  - 题库
---

**目录**
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

3.从头到尾输出链表
==========

#题目描述#
>输入一个链表，从尾到头打印链表每个节点的值。

#解题思路#
>在拿到问题时,我们在不改变链表的结构的情况下,自然想到的是如果能用到`栈`的数据结构就好了,后进先出,这样的话刚好就可以满足题目的要求.既然想到了用栈来实现这个函数,而递归在本质上就是一个栈结构.  
  我们每访问一个节点的时候,`先递归输出它后面的节点,再输出该节点本身`,最后链表的输出就自然反过来了.

{% highlight ruby %}
class Solution {
 public:
  vector<int> dev;
  vector<int>& printListFromTailToHead(struct ListNode* head) {
    if(head!=NULL) {
      if(head->next!=NULL) {
        dev=printListFromTailToHead(head->next);
      }
      dev.push_back(head->val);
    }
    return dev;
  }
};
{% endhighlight %}

>反向迭代器  
运用vector容器的反向迭代器,有点投机取巧了.

{% highlight ruby %}
class Solution {
public:
    vector<int> printListFromTailToHead(struct ListNode* head) {
        vector<int> v;
                        
        ListNode *p = head;
        while (p != nullptr) {
           v.push_back(p->val);
           p = p->next;
        }
        //反向迭代器创建临时对象
        return vector<int>(v.rbegin(), v.rend());
    }
};
{% endhighlight %}


----
更新中...

