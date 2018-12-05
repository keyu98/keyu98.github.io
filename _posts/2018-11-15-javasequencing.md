---
layout: post
title:  "Java的序列化"
subtitle: "JAVA笔记4"
header-img: "img/java-note2.jpg"
tag: 
    - JAVA笔记
---
# Java 序列化

>Java 提供了一种对象序列化的机制，该机制中，一个对象可以被表示为一个字节序列，该字节序列包括该对象的数据、有关对象的类型的信息和存储在对象中数据的类型。

>将序列化对象写入文件之后，可以从文件中读取出来，并且对它进行反序列化，也就是说，对象的类型信息、对象的数据，还有对象中的数据类型可以用来在内存中新建对象。

>整个过程都是 Java 虚拟机（JVM）独立的，也就是说，在一个平台上序列化的对象可以在另一个完全不同的平台上反序列化该对象。

>类 ObjectInputStream 和 ObjectOutputStream 是高层次的数据流，它们包含反序列化和序列化对象的方法。

请注意，一个类的对象要想序列化成功，必须满足两个条件：

1. 该类必须实现 `Serializable` 接口。

2. 该类的所有属性必须是可序列化的。如果有一个属性不是可序列化的，则该属性必须注明是短暂的。

`注释：`  
对于一个实体类，不想将所有的属性都进行序列化，有专门的关键字 transient：

>private transient String name;

当对该类序列化时，会自动忽略被 transient 修饰的属性。

# 序列化对象

我们使用`ObjectOutputStream 类`来序列化一个对象,并将对象序列化到一个文件中。当序列化一个对象到文件时，按照Java的标准规定是给文件一个`.ser`后缀名。

{% highlight ruby%}
FileOutputStream fileOut =
new FileOutputStream("/tmp/object.ser");
ObjectOutputStream out = new ObjectOutputStream(fileOut);
out.writeObject(o);
/*其中o是一个对象实例，writeObject方法用于序列化一个对象，并将它发送到输出流。
    public final void writeObject(Object x) throws IOException
*/
out.close();
fileOut.close();
System.out.printf("Serialized data is saved in /tmp/object.ser");
{% endhighlight %} 

# 反序列化对象

下面执行反序列语句，将保存在/tmp/object.ser的序列化对象去取出来。

{% highlight ruby%}
FileInputStream fileIn = new FileInputStream("/tmp/object.ser");
ObjectInputStream in = new ObjectInputStream(fileIn);
o = (Object) in.readObject();
/*该方法从流中取出下一个对象，并将对象反序列化。它的返回值为Object，因此，你需要将它转换成合适的数据类型。
    public final Object readObject() throws IOException, 
                                 ClassNotFoundException
*/
in.close();
fileIn.close();
{% endhighlight %} 

# Serializable 的作用

为什么一个类实现了Serializable接口，它就可以被序列化呢？在上节的示例中，使用ObjectOutputStream来持久化对象，在该类中有如下代码：

{% highlight ruby%}
private void writeObject0(Object obj, boolean unshared) throws IOException {
      ...
    if (obj instanceof String) { 
        writeString((String) obj, unshared);
    } else if (cl.isArray()) { 
        writeArray(obj, desc, unshared);
    } else if (obj instanceof Enum) {
        writeEnum((Enum) obj, desc, unshared);
    } else if (obj instanceof Serializable) {
        writeOrdinaryObject(obj, desc, unshared);
    } else {
        if (extendedDebugInfo) {
            throw new NotSerializableException(cl.getName() + "\n"
                    + debugInfoStack.toString());
        } else {
            throw new NotSerializableException(cl.getName());
        }
    }
    ...
} 
{% endhighlight %} 

从上述代码可知，如果被写对象的类型是String，或数组，或Enum，或Serializable，那么就可以对该对象进行序列化，否则将抛出NotSerializableException。