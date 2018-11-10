---
layout: post
title:  JAVA笔记2>Object通用方法
date:   2018-11-10 15:20:53 +0800
categories: 编程语言
tag: JAVA笔记
---

* content
{:toc}

概览
====
{% highlight ruby %}
public native int hashCode()

public boolean equals(Object obj)

protected native Object clone() throws CloneNotSupportedException

public String toString()

public final native Class<?> getClass()

protected void finalize() throws Throwable {}

public final native void notify()

public final native void notifyAll()

public final native void wait(long timeout) throws InterruptedException

public final void wait(long timeout, int nanos) throws InterruptedException

public final void wait() throws InterruptedException
{% endhighlight %} 

1.equals()
======================

覆盖equals方法看起来简单，实际上很容易导致错误，而且后果非常的严重，应该尽量避免覆盖该方法，在这种情况下，类的每一个实例都`只和自身相等`。    

那么，什么时候应该覆盖`Object.equals`呢？如果类具有自己特有的“逻辑相等”概念，并且超类（即父类）还没有覆盖equals以实现期望的行为，这个时候，我们就需要覆盖equals方法。  

equals方法实现了`等价关系`:  
* `自反性`  
>x.equals(x); // true  

* `对称性`  

>x.equals(y) == y.equals(x); // true  
  
* `传递性`  

>if (x.equals(y) && y.equals(z))  
>    x.equals(z); // true;  
  
* `一致性`  

多次调用 equals() 方法结果不变  

>x.equals(y) == x.equals(y); // true  

* `与 null 的比较`  

对任何不是 null 的对象 x 调用 x.equals(null) 结果都为 false  

>x.equals(null); // false;  

以下为一系列高质量equals方法诀窍：  
```
1. 使用==操作符检查“参数是否为这个对象引用”
2. 使用instanceof操作符检查“参数是否为正确类型”
3. 把参数转换成正确的类型
4. 对于该类中的每个“关键”域，检查参数中的域是否与该对象中对应的域相匹配
5. 确定对称、传递、一致性
```

{% highlight ruby %}
public class EqualExample {

    private int x;
    private int y;
    private int z;

    public EqualExample(int x, int y, int z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true; //检查对象是否是否为同一对象引用
        if (o == null || !(o instanceof getClass())) return false;//检查是否为正确类型

        EqualExample that = (EqualExample) o;//转换为正确的类型

        if (x != that.x) return false;
        if (y != that.y) return false;
        return z == that.z;
    }
}
{% endhighlight %} 