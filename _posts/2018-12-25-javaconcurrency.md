---
layout: post
title:  "java多线程基础"
subtitle: "Java Concurrency Programming"
header-img: "img/post-bg-re-vs-ng2.jpg"
tag: 
    - Java并发
---

**目录**
* content
{:toc}

# 多线程特性
* 原子性
* 可见性
* 有序性

# 线程和进程概念
* `进程`是独立的应用程序，进程中一般会有多个线程，进程是线程的集合。
* `线程`就是一条执行路径。
* `多线程`目的为了提高程序效率。

# 同步和异步概念
* `同步`：代码从上往下进行执行。
* `异步`：新的一条执行路径，不会影响到其他线程的运行。多线程包含异步概念。
# 多线程创建方式
## 继承Thread类（不推荐）
```java
class ThreadDemo1 extends Tread{
    @Override
    public run(){
        while(true){
            System.out.println("TreadDemo1");
        }
    }
}
/**
 *执行
 */
TreadDemo1 t = new TreadDemo1();
t.start();
```
## 实现runnable接口，重写run方法
```java
class ThreadDemo2 implements Runnable{
    public void run(){
        while(true){
            System.out.println("ThreadDemo2");
        }
    }
}
/**
 *执行
 */
Thread t = new Thread(new ThreadDemo2());
t.start();
```
## 使用匿名内部类
```java
Thread t = new Thread(new Runnable(){
    public void run(){
        while(ture){
            System.out.println("ThreadDemo3");
        }
    }
})
/*
 *执行
 */
t.start();
```

# 多线程的运行状态
* `新建状态`：创建好线程，没有调用start方法之前。
* `就绪状态`：等待cpu分配执行权。
* `运行状态`：执行run方法代码。
* `死亡状态`：run方法执行完毕后，一个未捕获异常终止了run方法使线程猝死。
* `阻塞状态`：wait、sleep方法,锁资源被其他线程抢断等。

# 守护线程、非守护线程
* `用户线程`：用户自己创建的线程，如果主线程停止掉，不会影响用户线程。也叫`非守护线程`。
* `守护线程`：和主线程一起销毁。例如gc线程。
```java
Thread t = new Thread(newThreadDemo());//此时t为用户线程
t.setDaemon(true);//将线程t变为守护线程
t.start;//执行
```

# join方法()
* `作用`：让其他线程变为等待。把指定的线程加入当前线程，可以让两个交替执行的线程合并为顺序执行的线程。比如线程B调用了线程A的join()方法，直到线程A执行完毕后，才会执行线程B。
* `例子`:
```java
/**
 *示例：子线程执行完毕后，主线程才能执行
 */
Thread t1 = new Thread(new Runnable() {

			@Override
			public void run() {
				for (int i = 0; i < 10; i++) {
					try {
						Thread.sleep(10);
					} catch (Exception e) {

					}
					System.out.println(Thread.currentThread().getName() + "i:" + i);
				}
			}
		});
		t1.start();
		// 当在主线程当中执行到t1.join()方法时，就认为主线程应该把执行权让给t1
		t1.join();
		for (int i = 0; i < 10; i++) {
			try {
				Thread.sleep(10);
			} catch (Exception e) {

			}
			System.out.println("main" + "i:" + i);
		}
```
# 优先级
* 现代操作系统基本采用时分的形式调度运行的线程，线程分配得到的时间片的多少决定了线程使用处理器资源的多少，也对应了线程优先级这个概念。在JAVA线程中，通过一个int priority来控制优先级，范围为1-10，其中10最高，默认值为5。
* `例子`：
```java
Thread t = new Thread(new ThreadDemo());//创建线程t
t.setPriority(10);//将线程优先级设为10
t.start();//执行线程
```

# 线程安全
* `原因`：当多个线程共享同一个全局变量，在写的操作时，可能会受到其他线程的干扰。
* `解决方法`:  
1. **内置锁(Synchronized)**:保证线程原子性，当线程进入方法时，自动获取锁，一旦锁被其他线程获取到后，其他的线程就会等待，只有一个线程进行使用。程序执行完毕后就会把锁释放。但是它会降低程序的运行效率(锁资源的竞争)。
2. **显示锁(Lock锁)** 


# 同步方式
## 同步代码块：
```java
/**
 *同步代码块示例
 *object为任意全局对象
 */
synchronized(object){//需要保证同步的不同线程object一致
    //同步的代码
}

```
* ==非静态==同步代码块使用this锁。
* ==静态==同步代码块使用当前类的class字节码文件锁。
## 同步方法
* 用synchronized关键字修饰方法。

```java
/**
 *同步方法示例
 *object为任意全局对象
 */
public synchronized run{//同步方法
    //同步的代码
}

```

# CAS
* CAS有3个操作数，内存值V，旧的预期值A，要修改的新值B。当且仅当预期值A和内存值V相同时，将内存值V修改为B，否则什么都不做。
* 它是整个JUC的基础


# 注意
* 在一个进程中，一定会有主线程。
* 线程运行是调用start方法而不是run方法。

