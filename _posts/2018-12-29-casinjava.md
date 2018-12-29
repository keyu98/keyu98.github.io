---
layout: post
title:  "java中CAS的原理"
subtitle: "Principle of CAS in Java"
header-img: "img/post-bg-re-vs-ng2.jpg"
tag: 
    - Java并发
---

* 从书中看到java中可以通过CAS的方式实现原子操作。例子中的安全计数器代码如下：  

```java
private void safeCount(){
    for(::){
        int i = atomicI.get();
        boolean suc = atomicI.compareAndSet(i,++i);
        if(suc){
            break;
        }
    }
}
```

# 以下为阅读的jdk11的源码


* `get()`函数用于返回私有值value

{% highlight ruby %}
 public final int get() {
        return value;
    }

{% endhighlight %}

* `value`在AtomicInteger对象初始化时赋值，默认为0


{% highlight ruby %}

public AtomicInteger(int initialValue) {
        value = initialValue;
    }
{% endhighlight %}

* 地址VALUE为static final类型，一旦声明不能更改，VALUE地址与私有变量value绑定。

{% highlight ruby %}
private static final jdk.internal.misc.Unsafe U = jdk.internal.misc.Unsafe.getUnsafe();
private static final long VALUE = U.objectFieldOffset(AtomicInteger.class, "value");
{% endhighlight %}

* 经过源码的查看，其中`atomicI.compareAndSet()`函数如下

{% highlight ruby %}
public final boolean compareAndSet(int expectedValue, int newValue) {
        /**
         *这个函数的作用为将expectedValue的值与VALUE地址上的值做比较，相同则执行成功，否则失败
         *@param VALUE 地址
          @param expectedValue 期望的值
          @param newValue 新值
         *@return 若执行成功则将expectedValue的值替换为newValue，并返回true
                  否则返回false
         */
        return U.compareAndSetInt(this, VALUE, expectedValue, newValue);
    }
{% endhighlight %}
JAVA中的CAS操作都是通过sun包下Unsafe类实现，而Unsafe类中的方法都是native方法，由JVM本地实现,经过继续深入，可以发现最终CAS操作由CPU的操作  
`cmpxchg`实现，具体可以去了解这个操作的用法，这里就不继续深入了。