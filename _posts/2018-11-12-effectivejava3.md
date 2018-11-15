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

