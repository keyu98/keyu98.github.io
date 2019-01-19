---
layout: post
title:  "枚举和注解"
subtitle: "JAVA笔记6"
header-img: "img/java-note2.jpg"
tag: 
    - JAVA笔记
---

# 枚举
>Java中的`枚举`类型背后的基本想法很简单：它们就是通过公有的静态final域为每个枚举常量导出实例的类。因为没有可以访问的构造器，枚举类型是真正的final。因为客户端既不能创建枚举类型的实例，也不能对它进行扩展，因此很可能没有实例，而只有声明过的枚举常量。换句话说，枚举类型是实例可控的。它们是单例的泛型化，本质上是单元素的枚举。

# 注解

## 理解
* 注解无论在框架上还是在日常的代码编写上都有着很大的作用。它可以让代码变得简洁而又方便。
* 所谓`注解(Annotation)`，我对它的理解就是特定的标记。当我们添加注解时，我们就为某个程序打上了标记。重要的不是标记本身，而是我拿通过反射来获得打上标记的元素，然后对这些元素执行特定的命令。
## 内置注解
* @Override 表示当前方法覆盖了超类中的方法
* @Deprecated 使用注解为元素编辑器发出警告，此为被弃用的代码
* @SuppressWarning 忽略编辑器警告

## 元注解
* @Target 表示注解可以用在什么地方，参数有
  * CONSTRUCTOR：构造器的声明
  * FIELD：域声明（包括enum实例）
  * LOCAL_VARIABLE：局部变量声明
  * METHOD：方法声明
  * PACKAGE：包声明
  * PARAMETER：参数声明
  * TYPE：类、接口（包括注解类型）或enum声明
* @Retention 表示什么级别保存该注解信息，参数有
  * SOURCE：注解将被编译器丢弃
  * CLASS：注解在class文件中可用，但会被VM丢弃
  * RUNTIME：VM将在运行期间保留注解，因此可以通过反射机制读取注解的信息。  
* @Document 将注解包含在Javadoc中
* @Inherited 允许子类继承父类的注解

## 实现
`注解`
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface UseCase {
     public String id();
     public String description() default "no description";//默认值为"no description"
}
```
`使用`
```java
public class PasswordUtils {
     @UseCase(id = 47, description = "Passwords must contain at least one numeric")
     public boolean validatePassword(String password) {
         return (password.matches("\\w*\\d\\w*"));
     }
 
     @UseCase(id = 48)
     public String encryptPassword(String password) {
         return new StringBuilder(password).reverse().toString();
     }
 }
```
`注解处理器`
```java
public static void main(String[] args) {
     List<Integer> useCases = new ArrayList<Integer>();
     Collections.addAll(useCases, 47, 48, 49, 50);
     trackUseCases(useCases, PasswordUtils.class);
 }
 
 public static void trackUseCases(List<Integer> useCases, Class<?> cl) {
     for (Method m : cl.getDeclaredMethods()) {
         UseCase uc = m.getAnnotation(UseCase.class);
         if (uc != null) {
             System.out.println("Found Use Case:" + uc.id() + " "
                         + uc.description());
             useCases.remove(new Integer(uc.id()));
         }
     }
     for (int i : useCases) {
         System.out.println("Warning: Missing use case-" + i);
     }
 }
```
Found Use Case:47 Passwords must contain at least one numeric 

Found Use Case:48 no description  

Warning: Missing use case-49  

Warning: Missing use case-50  