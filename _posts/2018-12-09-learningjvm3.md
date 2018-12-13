---
layout: post
title:  "类文件结构与虚拟机类加载机制"
subtitle: "JVM笔记3"
header-img: "img/post-bg-universe.jpg"
tag: 
    - JVM笔记
---
**目录**
* content
{:toc}

# 平台无关性
* `平台无关性`是JVM所具有的另一重要特性。这些虚拟机可以载入和执行同一种平台无关的字节码，从而实现了程序的“一次编写，到处运行”。  
* 各种平台的虚拟机与所有平台都同一使用的程序存储格式--字节码是构成平台无关性的基石。
* **Java虚拟机不和包括Java在内的任何语言绑定**，它只与“Class 文件”这种特定的二进制文件格式所关联，Class文件中包含了Java虚拟机指令集和符号表以及若干其他辅助信息。

# Class类文件的结构
* Class文件时一组以8位字节为基础单位的二进制流，各个数据严格按照顺序紧凑地排列在Class文件之中，中间没有添加任何分隔符，这使得整个Class文件中存储地内容几乎全是程序运行地必要数据，没有空隙存在。  
* Class文件格式采用一种类似于C语言结构体地伪结构来存储数据，这种伪结构只有两种数据类型：`无符号数`和`表`。  
**无符号数**：属于基本的数据类型，以u1、u2、u4、u8来分别代表1个字节、2个字节、3个字节、4个字节和8个字节的无符号数，无符号数可以用来描述数字、索引引用、数量值或者按照UTF-8编码构成字符串值。  
**表**：表是由多个无符号数或者其他表作为数据项构成的复合数据类型，所有表都习惯性地以“_info”结尾。表用于描述有层次关系地复合结构地数据，整个Class文件本质上就是一张表。  
![](\img\in-post\L-JVM\JVM3-1.PNG)  

## 魔数与Class文件的版本
* 每个Class文件的头4个字节称为`魔数`（Magic Number），它的唯一作用是确定这个文件是否为一个能被虚拟机接受的Class文件。
* 很多文件存储标准中都使用魔数来进行身份识别,Class的魔数值为：`0xCAFEBABE`。
* 第5和第6字节是次版本号（Minor Version），第7和第8字节是主版本号（Major Version）。版本向下兼容。

## 常量池
* 常量池在主次版本号之后，可以理解为Class文件之中的资源仓库。
* 常量池入口需要放置一项u2类型的数据，代表常量池容量计数值（constant_pool_count），从1开始计数。
* 常量池主要存放两大类常量：`字面量`（Literal）和`符号引用`（Symbolic References）。字面量比较接近于Java语言层面的常量概念，如文本字符串、被声明为final的常量等。而符号引用则属于编译原理方面的概念，包括下面三类常量：  
1. 类和接口的全限定名
2. 字段的名称和描述符
3. 方法的名称和描述符
* Java代码进行Javac编译时并不像c与c++连接这一步骤，而是在虚拟机加载Class文件的时候进行`动态连接`。在Class文件中不会保存各个方法和字段的最终内存布局信息，这些符号引用还要经过转换才能直接被虚拟机使用。
* 常量池每一个常量都是一个表，公有11种结构各不相同的表结构数据，它们开始的第一位是一个u1类型的标志位（tag，取值1到12，缺少标志为2的数据类型），代表当前这个常量属于哪种常量类型。如下图  
![](\img\in-post\L-JVM\JVM3-2.PNG)  

## 访问标志
* 常量池结束之后，紧接着的2个字节代表访问标志（acess_flags），**用于识别一些类或接口层次的访问信息**，包括：这个Class是类还是接口；是否定义为public类型；是否定义为abstract类型；如果是类，是否被声明为fianl等。具体如下图：
![](\img\in-post\L-JVM\JVM3-3.PNG)  

## 类索引、父类索引与接口索引集合
* 类索引（this_class）和父类索引（super_class）都是一个u2类型的数据，而接口索引集合（interfaces）是一组u2类型的数据的集合。
* 类索引用于确定这个类的`全限定名`，父类索引用于确定这个类的父类的`全限定名`。它们各自指向一个类型为CONSTANT_Class_info的类描述常量，通过CONSTANT_Class_info类型的常量种的索引值找到定义在CONSTANT_Utf8_info类型的常量种的全限定字符串。
* 接口索引集合，入口第1项---u2类型的接口计数器（interfaces_count），表示索引表的容量。若无接口则为0。

## 字段表集合
* 用于描述`接口或类中声明的变量`。不包括方法内部的变量。
* 包括的信息有：字段的作用域（public、private、protected修饰符）、是类级变量还是实例级变量（static修饰符）、可变性（final）、并发可见性（volatile修饰符，是否强制从主内存读写）、可否序列化（transient修饰符）、字段数据类型（基本类型、对象、数组）、字段名称。用标志位来表示。
* 字段的名字、字段被定义为什么数据类型，引用常量池中的常量来描述。

## 方法表集合
* Class文件存储格式中堆方法的描述与对字段的描述几乎采用完全一致的方式。
* 因为volatile、transient关键字不能修饰方法，所以方法表的访问标志中没有这些。与之相对synchronized、native、strictfp和abstract可以修饰方法，所以方法表的访问标志中增加了这几个标志。
* 方法里的Java代码，经过编译器编译成字节码指令之后，存放在方法属性表中一个名为`Code`的属性里面。

## 属性表集合
* 在Class文件中、字段表、和方法表中都可以携带自己的属性表集合、以用于描述某些场景专有的信息。
* 在《Java虚拟机规范（第2版）》中预定义了9项虚拟机应当能识别的属性：  
1. **Code属性：**Java程序的方法体里面的代码经过Javac编译器处理之后，最终变为字节码指令存储在Code属性内。接口或抽象类的方法不存在Code属性。Code属性是Class文件中最重要的一个属性，在整个Class文件里，Code属性用于描述`代码`，所有其他数据项目哟关于描述元数据（Metadata、包括类、字段、方法定义及其他信息）。
2. **Exception属性：**在方法表中与Code属性平级的一项属性，用于列举出方法中可能抛出的受查异常，也就是throws关键字后面列举的异常。
3. **LineNumberTable属性：**用于描述Java源码行号与字节码行号（字节码的偏移量）之间的对应关系。
4. **LocalVariableTable属性：**用于描述栈帧中局部变量表中变量与Java源码定义的变量之间的关系，在Javac中可以使用-g：none或-g：vars选项来取消或要求生成这项信息。
5. **SourceFile属性：**用于记录生成这个Class的源码文件名称，在Javac中可以使用-g：none或-g：source选项来关闭或要求生成这项信息。
6. **ConstantValue属性：**用于通知虚拟机自动为静态变量赋值。只有被static关键字修饰的变量（类变量）才可以使用这项属性。
7. **InnerClasses属性：**用于记录内部类与宿主类之间的关联。如果一个类中定义了内部类，那编译器将会为它及它所包含的内部类生成InnerClasses属性。
8. **Deprecated及Synthetic属性：**都属于标志类型的布尔属性，只存在有和没有的区别。Deprecated属性用于表示某个类、字段或方法，已经被程序作者定位不再推荐使用，它可以在代码中使用@deprecated注释进行设置。Synthetic代码此字段或方法并不是由Java源码直接产生的，而是由编译器自行添加的。
9. **属性随着JDK的发展，在不断的添加中**

# 虚拟机类加载机制
虚拟机把描述类的数据从Class文件加载到内存，并对数据进行校验、转换解析和初始化、最终形成可以被虚拟机直接使用的Java类型，这就是`虚拟机的类加载机制`。

 `注意`  
* 在实际情况中，每个Class文件都有可能代表Java语言中的一个类或接口。
* Class文件并非指Class必须存在于具体磁盘中的某个文件，这里说的Class文件指的是一串二进制的字节流，无论以何种形式存在都可以。

## 类加载的时机
![](\img\in-post\L-JVM\JVM3-4.PNG)  
* 类从加载到虚拟机内存开始，到卸载出内存，它的声明周期共经过如上`七个阶段`。解析阶段有时候可以在初始化阶段之后开始，这是为了支持Java语言的运行时绑定。
* `有且只有`四种情况必须对类进行**初始化**：（除此之外的其他引用方式都不会触发初始化，称为`被动引用`）  
1. 遇到new、getstatic、putstatic或invokestatic这4个字节码指令时。如果没有进行过初始化，则需要先触发初始化。使用new关键字实例化对象、读取或设置一个类的静态字段（被final修饰、已在编译期把结果放入常量池的静态字段除外）、以及调用一个类的静态方法的时候。
2. 使用java.lang.reflect包的方法对类进行反射调用的时候，如果没有进行过初始化，则需要先触发初始化。
3. 当虚拟机启动时，用户需要指定一个要执行的主类（包含main()方法的那个类），虚拟机会先初始化这个主类。
4. 当初始化一个类的时候，如果发现其父类还没有进行过初始化，则需要先触发其父类的初始化。

* 接口在初始化时，并不要求其父类接口全部都完成了初始化，只有在真正使用到父接口的时候（比如调用父类接口中定义的常量）才会初始化。

## 类加载的过程
### 加载
* 加载阶段类需要完成以下三件事情：  
1. 通过一个类的全限定名来获取定义此类的二进制字节流。
2. 将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构。
3. 在Java对中生成一个代表这个类的java.lang.Class对象，作为方法区这些数据的访问入口。

* 其中从二进制字节流中获取，并没有指明要从一个Class文件中获取，获取方式多种多样。比如ZIP包、网络、运行时计算而成、JSP应用、数据库等。    

* 加载阶段于连接阶段时`交叉进行`的，但开始时间仍然保持着固定的先后顺序。

### 验证
* 这一阶段时为了**确保Class文件中的字节流中包含的信息符合当前虚拟机的要求，并且不会危害虚拟机自身的安全。**

* **文件格式验证**：验证字节流是否符合Class文件格式规范。

* **元数据验证**：对字节码描述的信息进行语义分析，以保证其描述的信息复合Java语言规范的要求。

* **字节码验证**：进行数据流和控制流分析。对类的方法体进行校验分析。这阶段的任务是保证被校验类的方法在运行时不会做出危害虚拟机安全的行为。

* **符号引用验证**：在符号引用转化为直接引用的时候，这个转化动作将在解析阶段发生。符号引用可以看作是对类自身以外的信息进行匹配性的校验。

### 准备
* 准备阶段是正式为类变量`分配内存`并设置类变量`初始值`的阶段。

* 这时候进行内存分配仅包括类变量（被static修饰的变量），而不包括实例变量，实例变量将会在对象实例化时随着对象一起分配在Java堆中。  

* 初始值通常情况下是指数据类型的零值。比如  
`public static int value = 123;`  
其在准备阶段过后的初始值为0，而不是123，赋值为123的动作将在初始化阶段才会被执行。  
如果有`ConstantValue`属性，那么准备阶段变量就会被初始化。在实际的程序中，只有同时被final和static修饰的字段才有ConstantValue属性，且限于基本类型和String。

### 解析
* 解析阶段是将常量池内的`符号引用`替换为`直接引用``的过程。

* **符号引用**：符号引用以一组符号来描述所引用的目标，符号可以是任何形式的字面量，只要使用时能无歧义地定位到目标即可。符号引用与虚拟机实现地内存布局无关。  

* **直接引用**：直接引用可以时直接指向目标的指针、相对偏移量或是一个间接定位到目标的句柄。直接引用是与虚拟机实现的内存布局相关的，同一符号引用在不同虚拟机实例上翻译出来的直接引用一般不会相同。如果有了直接引用，那引用的目标必定在内存中存在。

### 初始化
* 初始化阶段是类加载过程的最后一步，前面的类加载过程除了加载阶段用户可以通过自定义类加载器参与以外，其余动作完全由虚拟机主导控制。到了初始化阶段，才开始真正执行定义的Java程序代码（或者说是字节码）。

* 初始化阶段是执行类构造器`<clinit>()`方法的过程。  
1. 该方法是由编译器自动收集类中所有类变量的赋值动作和静态语句块中的语句合并而产生的，编译器收集的顺序由语句在源文件中出现的顺序所决定，静态语句块中只能访问定义在静态语句块之前的常量，定义在它之后的变量，在前面的静态语句块中可以赋值，但是不能访问。  
2. 该方法与类的构造函数（类构造器`<init>()`方法）不同,它不需要显示地调用父类构造器，虚拟机保证在子类方法执行前，父类的`<clinit>()`方法已经执行完毕。
3. 父类中定义的静态语句块要优先于子类的变量赋值操作。
4. 该方法不是必须的。
5. 接口中不能使用静态语句块，但仍然由变量初始化操作，因此也有`<clinit>()`方法。只有当父接口中定义的变量被使用时，父接口才会被初始化。

## 类加载器
* 虚拟机团队把类加载阶段中的**通过一个类的全限定名来获取描述此类的为二进制字节流**这个动作放到Java虚拟机外部去实现，以便让应用程序自己决定如何去获取所需要的类。实现这个动作的代码模块被称为`类加载器`。

### 类与类加载器
* 对于任意一个类，都需要由加载它的类加载器和这个类本身一同确立其在Java虚拟机的`唯一性`。只有两个类时由同一个类加载器加载的前提下才有意义，否则，即使两个类来源于同一个Class文件，只要加载它们的类加载器不同，那么这两个类就必定不相等。

### 双亲委派模型
* 在Java虚拟机的角度上，只存在两种不同的类加载器：一种是`启动类加载器`（Bootstrap ClassLoader），这类加载器使用C++语言实现，是虚拟机自身的一部分；另一种就是其他的类加载器，这些类加载器都由Java语言实现，独立于虚拟机外部，并且全部`继承`自抽象类java.lang.ClassLoader。

* 若分的更细致一些，绝大部分Java程序都会使用到以下三种系统提供的类加载器：  
1. **启动类加载器（Bootstrap ClassLoader）**:这个类加载器负责将存放在<JAVA_HOME>\lib目录中的，或者被-Xbootclasspath参数所指定的路径中的，并且是虚拟机识别的(仅按照文件名识别，如rt,jar，名字不符合的类库即使放在lib目录也不会被加载)类库加载到虚拟机内存中，启动类加载器无法被Java程序直接引用。
2. **扩展类加载器（Extension ClassLoader）**：这个加载器由sun.misc.Launcher&ExtClassLoader实现，它负责加载<JAVA_HOME>\lib\ext目录中的，或者被java.ext.dirs系统变量所指定的路径中的所有类库，开发者可以直接使用扩展类加载器。
3. **应用程序类加载器（Application ClassLoader）**：这个类加载器由sun.misc.Launcher$AppClassLoader来实现。由于这个类加载器是ClassLoader中的getSystemClassLoader()方法的返回值，所以一般也称为系统类加载器。它负责加载用户类路径(ClassPath)上所指定的类库，开发者可以直接使用这个类加载器，如果应用程序没有自定义过自己的类加载器，一般情况下这个就是程序中的默认类加载器。

* 类加载器之间的关系如图所示：  
![](\img\in-post\L-JVM\JVM3-5.PNG)  
这种层次关系被称为`类的双亲委派模型`（Parents Delegation Model）。

* 双亲委派模型除了顶层的启动类加载器外，其余的类加载器都应当有自己的父类加载器。这里类加载器之间的父子关系一般不会以继承的关系来实现，而是使用`组合`关系来复用父加载器的代码。

* **工作过程：**如果一个类加载器收到了类加载的请求，它首先不会自己去尝试加载这个类，而是把这个请求委派给父类加载器去完成，每一个层次的类加载器都是如此，因此所有的加载器最终都应该传送到顶层的启动类加载器中，只有当父类加载器反馈自己无法完成这个加载请求（它的搜索范围中没有找到所需的类）时，子加载器才会尝试自己去加载。

* `优点`：具备一种带有优先级的层次关系。例如java.lang.Object，它存放在rt.jar中，无论哪一个类加载器要加载这个类，最终都是委派给启动类加载器进行加载，因此Object类在各种类加载器环境中都是同一个类。相反，如果使用双亲委派模型，由各个类加载器自行去加载的话，如果用户自己写了一个名为java.lang.Object的类，并放在程序的ClassPath中，那系统中将会出现多个不同的Object类，Java类型体系中最基础的行为都无从保证，应用将会变得一片混乱。

* 实现：  
{% highlight ruby %}
public abstract class ClassLoader {
    // The parent class loader for delegation
    private final ClassLoader parent;

    public Class<?> loadClass(String name) throws ClassNotFoundException {
        return loadClass(name, false);
    }

    protected Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
        synchronized (getClassLoadingLock(name)) {
            // First, check if the class has already been loaded
            Class<?> c = findLoadedClass(name);
            if (c == null) {
                try {
                    if (parent != null) {
                        c = parent.loadClass(name, false);
                    } else {
                        c = findBootstrapClassOrNull(name);
                    }
                } catch (ClassNotFoundException e) {
                    // ClassNotFoundException thrown if class not found
                    // from the non-null parent class loader
                }

                if (c == null) {
                    // If still not found, then invoke findClass in order
                    // to find the class.
                    c = findClass(name);
                }
            }
            if (resolve) {
                resolveClass(c);
            }
            return c;
        }
    }

    protected Class<?> findClass(String name) throws ClassNotFoundException {
        throw new ClassNotFoundException(name);
    }
}
{% endhighlight %}

### 自定义类加载器实现
* FileSystemClassLoader 是自定义类加载器，继承自 java.lang.ClassLoader，用于加载文件系统上的类。它首先根据类的全名在文件系统上查找类的字节代码文件（.class 文件），然后读取该文件内容，最后通过 defineClass() 方法来把这些字节代码转换成 java.lang.Class 类的实例。

* java.lang.ClassLoader 的 loadClass() 实现了双亲委派模型的逻辑，因此自定义类加载器一般不去重写它，但是需要重写 findClass() 方法。

{% highlight ruby%}
public class FileSystemClassLoader extends ClassLoader {

    private String rootDir;

    public FileSystemClassLoader(String rootDir) {
        this.rootDir = rootDir;
    }

    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] classData = getClassData(name);
        if (classData == null) {
            throw new ClassNotFoundException();
        } else {
            return defineClass(name, classData, 0, classData.length);
        }
    }

    private byte[] getClassData(String className) {
        String path = classNameToPath(className);
        try {
            InputStream ins = new FileInputStream(path);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            int bufferSize = 4096;
            byte[] buffer = new byte[bufferSize];
            int bytesNumRead;
            while ((bytesNumRead = ins.read(buffer)) != -1) {
                baos.write(buffer, 0, bytesNumRead);
            }
            return baos.toByteArray();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    private String classNameToPath(String className) {
        return rootDir + File.separatorChar
                + className.replace('.', File.separatorChar) + ".class";
    }
}
{% endhighlight %}






