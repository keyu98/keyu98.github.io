---
layout: post
title:  "深入剖析finally执行过程"
subtitle: "当try语句块中有return，应该返回什么"
header-img: "img/java-note2.jpg"
tag: 
    - JAVA笔记
---

# 当finally有return时

`测试用例`  

```java
public static Integer testFinally(Integer n){
    try {
        if (n.equals(0)){
            throw new Exception("test");
        }
        return ++n;
    }catch (Exception e){
        
        return ++n;
    }finally {
        n++;
        return n;
    }
}
```

## 当传入值为1时
执行过程如下:  
1. 执行到try语句块的return语句后，执行`++n`操作，此时n为2
2. 在try语句块中没有直接返回语句，而是转向finally语句块
3. 执行finally语句块的`n++`语句
4. 返回**3**

## 当传入值为0时
执行过程如下:  
1. 抛出异常，转向catch语句块
2. 执行到catch语句块的return语句后，执行`++n`操作，此时n为1
3. 执行finally语句块的`n++`语句
4. 返回**2**

# 当finally语句块没有return时

`测试用例`  

```java
public static Integer testFinally(Integer n){
    try {
        if (n.equals(0)){
            throw new Exception("test");
        }
        return ++n;
    }catch (Exception e){
        
        return ++n;
    }finally {
        n++;
    }
}
```

## 当传入值为1时
执行过程如下:  
1. 执行到try语句块的return语句后，执行`++n`操作，此时n为2
2. 在try语句块中没有直接返回语句，而是将此时要返回的值保存(值为2)，然后转向finally语句块
3. 返回finally语句块的`n++`语句，此时值为3
4. 返回try语句块，然后return以前保存的结果
5. 返回**2**

## 当传入值为0时
执行过程如下:  
1. 抛出异常，转向catch语句块
2. 执行到catch语句块的return语句后，执行`++n`操作，此时n为1，将此时return的值保存
3. 执行finally语句块的`n++`语句，此时n为2
4. 返回try语句块，然后return一起保存的结果
5. 返回**1**

# 总结
* 当finally和try或者catch同时有return语句时，优先执行finally的return语句
* 当try或者catch有return语句，但是finally没有return语句时，  
执行return后，并不会马上返回，而是将此时要返回的值给保存下来，  
然后执行finally中的语句，执行完后，返回之前保存的值。