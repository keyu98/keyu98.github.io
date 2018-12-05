---
layout: post
title:  "泛型"
subtitle: "JAVA笔记5"
header-img: "img/java-note2.jpg"
tag: 
    - JAVA笔记
---
**目录**
* content
{:toc}

>声明中具有一个或者多个类型参数(type parameter)的类或者接口，就是`泛型`(generic)类或者接口。例如，从Java1.5发行版本起，List接口就只有单个类型参数E，表示列表的元素类型。从技术的角度来看，这个接口的名称应该是指现在的List<E>(读作“E的列表”)，但是人们经常把它简称为List。泛型类和接口统称为泛型(genric type)。  

>每种泛型定义一组参数化的类型(parameterized type)，构成格式为:**先是类或者接口的名称，接着用尖括号（< >）把对应与泛型形式的实际类型参数列表括起来。**例如，List<String>是一个参数化类型，表示元素类型为String的列表。



1.不要在新代码中使用原生态类型
===========================
>每个泛型都定义一个`原生态类型`(raw type)，即不带任何实际类型参数的泛型名称。例如，与List<E>相对应的原生态类型是List。原生态类型就像从类型声明中删除了所有泛型信息一样。实际上，原生态类型List与Java平台没有泛型之前的接口类型List完全一样。

在Java 1.5版本发行之前，以下为集合的声明的例子
{% highlight ruby %}
/**
 *My stamp collection,Contains only Stamp instances.
 */
private final Colection stamps = ...;;
{% endhighlight %} 
先在声明前注释，该集合只能存入Stamp类型，但是如果我们不小心将其他的类型放进了stamp集合中
{% highlight ruby %}
//Error insert
stamps.add(new Coin(...));
{% endhighlight %}
这时，依旧能够通过编译，而且不会受到错误提示。只有当我们要获取coin时才会受到错误提示。但是就编程而言，如果出错应该尽快发现，而不是运行一段时间才发现，这样很危险而且不容易发现出错在哪一行，编译器当然无法理解我们的注释。但是如果使用`泛型`，我们就可以在第一时间发现这种错误,而且表述上更加容易理解。

这种声明到现在的版本依旧可以使用，没有被删掉，原因在于在泛型这一特性出现之前，已经存在有大量的没有使用泛型的Java代码，为了保证**移植的兼容性**，所以才依旧存在。

`注释：`
这一规则有两种情况则例外。
1. 在类文字(class literal)中**必须使用原生态类型**。规范不允许使用参数化类型(虽然允许数组类型和基本类型)。
2. 在使用**instanceof**操作符时使用原生态类型，由于泛型信息可以在运行时被擦除，因此在参数化类型而非无限制通配符类型上使用instanceof操作符时非法的。

**not finished**
