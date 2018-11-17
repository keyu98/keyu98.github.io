---
layout: post
title:  "类与接口"
subtitle: "JAVA笔记3"
header-img: "img/java-note2.jpg"
tag: 
    - JAVA笔记
---

* content
{:toc}

1.使类和成员的可访问性最小化
==========================

模块设计的好坏与它是否`隐藏`其内部数据和其他实现细节有很大的关系。设计良好的模块会隐藏所有的实现细节，把他的`API`和它的实现清晰地隔离开来。最后使模块之间只能通过他们的API进行通信，一个模块不需要知道其他模块的内部工作情况。  

这个概念被称为`信息隐藏`或者`封装`,是软件设计的基本原则之一。  

这样做的好处在于：
* 它可以有效地接触组成系统的各模块之间的耦合关系，使得这些模块可以独立地开发、测试、优化、使用、理解和修改。  

* 加快开发速度，使之可以`并行开发`。  

* 减轻维护负担，更好理解模块，并且调试时不会影响其他的模块。

* 虽然不论是对内还是对外都不会带来更好的性能但是却可以更好的`调节性能`。在完成大型系统的时候，它的优点有更好的体现，即使整个系统不可用，但是这些独立的模块有些却是有用的，当我们对其中一个模块进行优化时，也不会影响到其他模块的正确性。

**公有类不应该直接暴露数据域。**  
可以使用包含私有域和共有访问方法（getter）和包含私有域和公有设值方法（setter）的类代替

2.使可变性最小化
===============

不可变类只是其*实例不可被修改*的类。每个实例包含的所有信息都必须在创建该实例的时候就提供，并在对象的整个生命周期内不可变。  java中有许多不可变的类，其中就包括String，基本类型的包装类，BigInteger和BigDecimal。  

好处在于：**不可变的类比可变的类更加易于设计、实现和使用。他们不容易出错，且更加安全。**  

为了使类变得不可变，需要遵循以下五条规则：  
1. **不要提供任何会修改对象的方法**

2. **保证类不会被扩展。**这样是为了粗心和恶意子类改变原本的不可变性。通常方法是将类设为`final`的。

3. **使所有的域都是final的。**通过系统的强制方式，更加清楚表明意图。

4. **是所有的域都成为私有的。**为了防止客户端获得访问被域引用的可变对象的权限，从而直接修改这些对象。

5. **确保对于可变组件的互斥访问。**如果类里有指向可变对象的域，那么就要确保该类的客户端无法获得这些可变对象的引用。

但是依旧有一个不容忽视的`缺点`:  
*对于每个不同的值都需要一个单独的对象*，这样的话，创造这种对象的代价可能会变得很高，例如我们有一个上百万位的BigInteger，当我们只需要修改它其中一位时，我们却要重新创造一个对象。 如果能够猜测会经常用到的多步骤操作，然后将他们作为基本类型提供。若无法预测，最好的方法时提供一个公有的可变配套类。可以这样认为，在特定环境下，相对于BigInteger而言，BigSet就扮演了这个角色。  

3.复合优先与继承
===============
继承是代码重用的有力手段，但并非最佳。  
在以下情况继承是`安全`的：
1. 包的内部使用，在那里超类以及子类的实现都在同一个程序员的控制下。 

2. 对于专门为了继承而设计、并且有很好的文档说明的类。   

然而，对于普通的具体类进行`跨越包边界`的继承，则是非常危险的！  

**复合(composition):**不扩展现有的类，而是在新的类中增加一个私有域，引用现有类的一个实例。  

**转发(fowarding):**新类中的每个实例方法都可以调用被包含的现有类实例中对应的方法，并返回结果。  

{% highlight ruby%}
public class FowardSet<E> implements Set<E> {   #转发类，被装饰类

    //引用现有类的实例，增加私有域
    private final Set<E> set;

    public FowardSet(Set<E> set){
        this.set = set;
    }


    /*
     *转发方法
     */
    @Override
    public int size() {
        return set.size();
    }

    @Override
    public boolean isEmpty() {
        return set.isEmpty();
    }

    @Override
    public boolean contains(Object o) {
        return set.contains(o);
    }

    @NotNull
    @Override
    public Iterator<E> iterator() {
        return set.iterator();
    }

    @NotNull
    @Override
    public Object[] toArray() {
        return set.toArray();
    }

    @NotNull
    @Override
    public <T> T[] toArray(T[] a) {
        return set.toArray(a);
    }

    @Override
    public boolean add(E e) {
        return set.add(e);
    }

    @Override
    public boolean remove(Object o) {
        return set.remove(o);
    }

    @Override
    public boolean containsAll(Collection<?> c) {
        return set.containsAll(c);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        return set.addAll(c);
    }

    @Override
    public boolean retainAll(Collection<?> c) {
        return set.retainAll(c);
    }

    @Override
    public boolean removeAll(Collection<?> c) {
        return set.removeAll(c);
    }

    @Override
    public void clear() {
        set.clear();
    }

    @Override
    public boolean equals(Object obj) {
        return set.equals(obj);
    }

    @Override
    public String toString() {
        return set.toString();
    }

    @Override
    public int hashCode() {
        return set.hashCode();
    }
}

/*
 * 包装类(wrapper class),采用装饰者模式
 */
public class InstrumentedSet<E> extends FowardSet<E> {
    private int addCount=0;

    public InstrumentedSet(Set<E> set) {
        super(set);
    }

    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount+=c.size();
        return super.addAll(c);
    }

    public int getAddCount() {
        return addCount;
    }
}
{% endhighlight %} 

4.要么为继承而设计，并提供文档说明，要么就禁止继承
================================================

专门为继承而设计的类，很有必要提供文档说明，不仅仅要描述作用，其重要的实现细节也是必不可少的。   

为了允许继承，类还必须遵守一些其他的**约束**：
1. `构造器`绝不能调用可被覆盖的方法。

2. 在决定实现Cloneable或者Serializable接口时，不论是`clone`还是`readObject`都不允许调用可被覆盖的方法。

3. 在决定实现Serializable，并且该类有`readResolve`或者`writeReplace`方法，就必须使这两种方法**成为受保护的方法而不是私有的方法**。

5.接口总体看来优于抽象类
==============

1. **现有的类可以很容易被更新，以实现新的接口**。但是若要实现由抽象类定义的类型，类就必须成为抽象类的一个子类。

2. **接口是定义mixin(混合类型)的理想选择。**接口允许类来添加任选的功能，将之合并到其基本的类型中。但抽象类不行，类不可能有一个以上的父亲，类层次结构中也没有适当的地方来插入mixin。

3. **接口允许我们构造非层次结构的类型框架。**比如我们有一个接口表示歌唱家，另一个表示作曲家，在现实生活中存在一个有音乐天赋的人，他既是歌唱家又是作曲家，同时实现这两个接口是完全允许的，我们甚至可以添加更多这样类似的接口。若没有接口，另一种做法则是编写一个臃肿的类层次，每一个属性都包含一个单独的类，如果整个系统中有n个属性，那么就必须支持2^n种可能的组合。这种现象称为*组合爆炸*。

4. **抽象类的演变比接口的演变要容易的多。**抽象类中添加新的方法，始终可以增加具体方法，它包含合理的默认实现。但对于接口，这样行不通。因此设计公有的接口要十分的谨慎。*接口一旦被公开发行，并且被广泛实现，再想改变这个接口几乎是不可能的。*我们必须保证接口在初次设计时就是正确的。

6.接口只用于定义类型。
==================
当类实现接口时，接口就充当这个类的实例的类型。**因此，类实现了该接口，就表明客户端可以对这个类的的实例进行某些动作。**如果出于其他的目的来定义接口是`不恰当`的。

有一种接口类型，它不包含方法，只有静态的final域，每一个域都导出一个常量，这样的接口被称为**常量接口**。这种接口模式实际上是对接口的不良使用。实现常量接口会把实现细节泄露出到该类导出的api中，类实现常量接口对用户来讲，本身也没什么价值，这样反而会让他们更加糊涂。更糟糕的是，在将来发行的版本中，这个类被修改了，它不再需要使用这些常量了，但是依然必须实现这个接口，以保证二进制兼容性。

在java平台库中有几个常量接口，例如`java.io.ObjectStreamConstants`，这些应当被看作反面教材。正常情况下应当采用**枚举类型**或者**不可实例化的工具类**来导出这些常量。

7.类层次优于标签类
===============
有时候我们可能会遇到含有两种或者多种风格的类，并且包含表示实例风格的标签（tag）域。例如一个Figure类，它可以同时表示圆形或者矩形，可以将它的构造函数分为两种，一种只有一个参数为圆形，一种有两个参数为矩形来区分，并给标签赋值。

{%highlight ruby%}
class Figure{
    enum Shape {RECTANGLE,CIRCLE};
    final Shape shape;//标签
    double r;
    double x,y;
    Figure(double a){
        r = a;
        shape = Shape.CIRCLE;//标签赋值
    }
    Figure(double a,double b){
        x = a;
        y = b;
        shape = Shape.RECTANGLE;//标签赋值
    }

    //.....
}
{%endhighlight%}

实际上，这种方法并不好，可读性差，且内存占用增加。

我们应当**先编写他们的父类，具有他们公共的信息，然后分别继承**（这个很容易理解，就不举例说明了）。这样`层次型`的类，简单而且清楚，并且不包含在原来版本中所见到的样板代码，没有受到不相关的数据域的拖累，还可以反应类型之间本质的层次关系，有助于增强灵活性，更好在编译时进行类型检查。

8.用函数对象表示策略。
===================
java没有提供**函数指针**,但是我们可以用对象引用来实现同样的功能。我们可以定义一个对象，它的方法执行其他对象上的操作。如果一个类仅仅导出这样一个方法，它的实例实际上就等同于一个指向该方法的指针，这样的实例被称为`函数对象`。

例如
{%highlight ruby%}
class StringLengthComparator{//该类用于比较两个String长度
    public int compare(String s1,String s2){
        return s1.length() - s2.length()
    }
}
{%endhighlight%}

我们也可以将之优化，把这个类作为一个**Singleton**可以说是非常合适的。

9.优先考虑静态成员类。
=================

**如果成员类不要求访问外围实例，就要始终把static修饰符放在他的声明中，使它作为静态成员类，而不是非静态成员类。**如果省略了static修饰符，那么每个实例都包含一个额外的指向外围对象的引用，保留这份引用需要消耗时间和空间，并且会导致我外围实例在符合垃圾回收时依然得以保留。