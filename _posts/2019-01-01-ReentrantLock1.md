---
layout: post
title:  "ReentrantLock的加锁和解锁原理"
subtitle: "Principle of ReentrantLock"
header-img: "img/post-bg-re-vs-ng2.jpg"
tag: 
    - Java并发
---

ReentrantLock的实现依赖于Java同步器框架AQS。  
AQS使用一个整型的volatile变量(命名为state)来维护同步状态。

* ReentrantLock分为公平锁和非公平锁
# 公平锁
使用公平锁时，加锁方法`lock()`的调用轨迹：  
1. ReentrantLock：lock()
2. FairSync：lock()
3. AbstractQueuedSynchronizer：acquire(int arg)
4. ReentrantLock:tryAcquire(int acquires)

第4步开始加锁，源代码如下  
```java
protected final boolean tryAcquire(int acquires) {
            //获取当前线程
            final Thread current = Thread.currentThread();
            //通过AQS获取同步状态
            int c = getState();
            //同步状态为0，说明临界区处于无锁状态，
            if (c == 0) {
                //判断该线程是否在队首，然后修改同步状态，即加锁
                if (isFirst(current)&&compareAndSetState(0, acquires)) {
                    //将当前线程设置为锁的owner
                    setExclusiveOwnerThread(current);
                    return true;
                }
            }
            //如果临界区处于锁定状态，且上次获取锁的线程为当前线程
            else if (current == getExclusiveOwnerThread()) {
                 //则递增同步状态
                int nextc = c + acquires;
                if (nextc < 0) // overflow
                    throw new Error("Maximum lock count exceeded");
                setState(nextc);
                return true;
            }
            return false;
        }

```
其解锁方法`unlock()`调用轨迹如下:  
1. ReentrantLock：unlock()
2. AbstractQueuedSynchronizer：release(int arg)
3. Sync:tryRelease(int releases)  

第3步才开始真正释放锁
```java
protected final boolean tryRelease(int releases){
    int c = getState() - releases;
    if(Tread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException()
    boolean free = false;
    if(c == 0){//如果state减去releases为0，则释放锁
        free = true;
        setExcluiveOwnerThread(null);//将获取锁的线程设为null，即无锁
    }
    setState(c);//设置state，若c为0，则释放锁
    return free;
}
```

# 非公平锁
非公平锁的释放与公平锁一样，这里仅探讨锁的获取。  

使用非公平锁时，加锁方法lock()调用轨迹如下：
1. ReentrantLock：lock()
2. NonfairSync：lock()
3. AbstractQueuedSynchronizer：compareAndSetState(int expect,int update)

```java
static final class NonfairSync extends Sync {
    private static final long serialVersionUID = 7316153563782823691L;

    final void lock() {
        
        if (compareAndSetState(0, 1))//对state进行CAS
            //若成功则加锁   
            setExclusiveOwnerThread(Thread.currentThread();
        else
            acquire(1);
    }
}

```

第3步进行加锁。  
该方法使用原子操作的方式更新state变量。  


总结：
* 公平锁和非公平锁的释放时，最后都要写一个volatile变量state。
* 公平锁获取时，首先会读volatile变量。
* 非公平锁的获取，首先会用CAS更新volatile变量，这个操作同时具有volatlie写和volatile读的内存语义。