---
layout: post
title:  "Object通用方法"
subtitle: "JAVA笔记2"
header-img: "img/java-note2.jpg"
tag: 
    - JAVA笔记
---

**目录**
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

2.hascode()
===========
此方法用于返回`散列值`，而在equals中时用来判断对象是否等价。若两个对象散列值相同，他们不一定等价，但如果两个对象等价，那么他们的散列值必然相同。  

而在我们覆盖`equals（）`时，一定要注意覆盖`hascode（）`方法，保证两者散列值也相等，不然会出现错误。  

{% highlight ruby%}
/*当我们企图将没有覆盖hascode（）的类
与HashMap一起使用时       */
Map<PhoneNumber,String> m
   = new HashMap<PhoneNumber,String>();
m.put(new PhoneNumber(707,867,5309),"Jenny");
m.get(new PhoneNumber(707,867,5309));//null
{% endhighlight %}  

若get本来应当返回“Jenny”，但是却返回null，原因在于两个对象有着不同的散列值。    

理想的散列函数应当具有均匀性，即不相等的对象应当均匀分布到所有可能的散列值上。这就要求了散列函数要把所有域的值都考虑进来。可以将每个域都当成 R 进制的某一位，然后组成一个 R 进制的整数。R 一般取 31，因为它是一个奇素数，如果是偶数的话，当出现乘法溢出，信息就会丢失，因为与 2 相乘相当于向左移一位。  

一个数与 31 相乘可以转换成移位和减法：31*x == (x<<5)-x，编译器会自动进行这个优化。    


{% highlight ruby%}
@Override
public int hashCode() {
    int result = 17;
    result = 31 * result + x;
    result = 31 * result + y;
    result = 31 * result + z;
    return result;
}
{% endhighlight %}  

3.toString()
============
默认返回 ToStringExample@4554617c 这种形式，其中 @ 后面的数值为散列码的无符号十六进制表示。    
当对象传递给println，printf，字符串联操作符（+）以及assert或者调试器打印出来时，toString方法会被`自动调用`。
{% highlight ruby%}
public class ToStringExample {

    private int number;

    public ToStringExample(int number) {
        this.number = number;
    }
}
ToStringExample example = new ToStringExample(123);
System.out.println(example.toString());//返回ToStringExample@4554617c
{% endhighlight %}  

记得始终要`覆盖`toString()，提供好的toString可以使类使用起来更加舒适。 

在实际运用中，toString方法应当返回对象中包含的所以值得关注的信息。  

4.clone()
=========
clone() 是 Object 的 `protected `方法，它不是 public，一个类不显式去重写 clone()，其它类就不能直接去调用该类实例的 clone() 方法。  

重写 clone() 得到以下实现：  
{% highlight ruby%}
public class CloneExample {
    private int a;
    private int b;

    @Override
    public CloneExample clone() throws CloneNotSupportedException {
        return (CloneExample)super.clone();
    }
}
CloneExample e1 = new CloneExample();
try {
    CloneExample e2 = e1.clone();
} catch (CloneNotSupportedException e) {
    e.printStackTrace();
}
//最后抛出异常，java.lang.CloneNotSupportedException: CloneExample
{% endhighlight %} 

以上抛出了 CloneNotSupportedException，这是因为 CloneExample 没有实现 `Cloneable 接口`。  

应该注意的是，clone() 方法并不是 Cloneable 接口的方法，而是 Object 的一个 protected 方法。Cloneable 接口只是规定，如果一个类没有实现 Cloneable 接口又调用了 clone() 方法，就会抛出 CloneNotSupportedException。  

{% highlight ruby%}
public class CloneExample implements Cloneable {//这里实现Cloneable接口
    private int a;
    private int b;

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
{% endhighlight %} 