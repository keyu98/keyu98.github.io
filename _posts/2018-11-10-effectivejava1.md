---
layout: post
title:  JAVA笔记1>创建及销毁对象
date:   2018-11-10 09:52:53 +0800
categories: 编程语言
tag: JAVA笔记
---

* content
{:toc}

1.静态工厂方法
===========
示例：
{% highlight ruby %}
//类中提供公有的静态方法，用于返回类的实例
public static Boolean valueOf(boolean b){
    return b?Boolean.True : Boolean.False;
}
{% endhighlight %}  

类可以通过静态工厂方法来提供它的客户端，而不一定都是通过构造器，这样做有一定的好处。

优点：  
* 静态工厂方法创造对象时，因为静态方法有名称，所以更好分辨。
* 不必每次都调用它们的时候都创建一个新的对象。（若每次返回已经建好的实例，或是将实例缓存起来）
* 它们可以返回原返回类型的任何子类型的对象。
* 在创建参数化型实例时，它们使代码更加简洁。

当然也有一定的缺点：  
* 类如果不含有公有的或者受保护的构造器，就不能被子类化。
* 它们与其他静态方法实际上没有任何区别  

2.当构造器参数太多时，考虑使用构建器
================================

当构造器有多个构造器参数，其中又有好几个可选参数时。  
我们有几个方法可以达到目的。

（1）`重叠构造器`  
运用多态的特性，写多个构造器达到目的，不过随着参数的增加，代码变得难以编写，并且难以阅读。

（2）`JavaBeans 模式`  
创建多个setXX()方法来对每个参数进行赋值。但是因为在构造过程中被分到多个调用中，在构造过程中JavaBean可能处于不一致的状态，将会导致失败。并且阻止了类变成了不可变的可能，需要付出更多的努力来保证线程安全。

（3）`Builder模式`  
幸运的是，还有第三种替代方法，既能保证像重叠构造器模式那样的安全性，也能保证像JavaBeans模式那么好的可读性。这就是Builder模式的一种形式，不直接生成想要的对象，而是让客户端利用所有必要的参数调用构造器（或者静态工厂），得到一个builder对象。然后客户端在builder对象上调用类似于setter的方法，来设置每个相关的可选参数。最后，客户端调用无参的builder方法来生成不可变的对象。这个builder是它构建类的静态成员类。下面就是它的示例：  

{% highlight ruby %}
/**
 * 使用Builder模式
 */
public class Person {
    //必要参数
    private final int id;
    private final String name;
    //可选参数
    private final int age;
    private final String sex;
    private final String phone;
    private final String address;
    private final String desc;

    private Person(Builder builder) {
        this.id = builder.id;
        this.name = builder.name;
        this.age = builder.age;
        this.sex = builder.sex;
        this.phone = builder.phone;
        this.address = builder.address;
        this.desc = builder.desc;
    }

    public static class Builder {
        //必要参数
        private final int id;
        private final String name;
        //可选参数
        private int age;
        private String sex;
        private String phone;
        private String address;
        private String desc;

        public Builder(int id, String name) {
            this.id = id;
            this.name = name;
        }

        public Builder age(int val) {
            this.age = val;
            return this;
        }

        public Builder sex(String val) {
            this.sex = val;
            return this;
        }

        public Builder phone(String val) {
            this.phone = val;
            return this;
        }

        public Builder address(String val) {
            this.address = val;
            return this;
        }

        public Builder desc(String val) {
            this.desc = val;
            return this;
        }

        public Person build() {
            return new Person(this);
        }
    }
}
{% endhighlight %}

当要调用的时候  
{% highlight ruby %}
/**
 * 测试使用
 */
public class Test {

    public static void main(String[] args) {
        Person person = new Person.Builder(1, "张三")
                .age(18).sex("男").desc("测试使用builder模式").build();
        System.out.println(person.toString());
    }
}
{% endhighlight %}  

3.Singleton的创造
==============
所谓Singleton，即`仅被实例化一次的类`  

在Java1.5发布前有两个方法  
(1)创造公有的实例成员，然后将构造器私有，通过公有成员调用  
(2)创造私有的实例成员，然后将构造器私有，采用静态工厂调用  

不过以上方法可能通过复杂的`序列化`攻击或者`反射`攻击来改变他的唯一性。

本次介绍最佳的方法，即`单元素枚举类型`，能够绝对的防止多次实例化。

{% highlight ruby %}
public enum Elvis{
    INSTANCE;

    public void leaveTheBuilding(){...}
}
{% endhighlight %}  

4.通过私有构造器来强化不可实例化的能力
==================================

有的时候，或许会编写一个只包含静态方法和静态域的类，对于这些类来说，我们没有必要将类实例化，只需要直接调用类的静态方法即可。  
{% highlight ruby %}
public class UtilityClass{
    //不可实例化
    private UtilityClass(){
        throw new AssertionError();
    }

    ...
}
{% endhighlight %}  

5.消除过期对象引用
=================
虽然java具有垃圾回收功能，但是对于有些情况则不然。

* 栈是实现的`过期引用`
* `缓存`
* `监听器`和其他`回调`

