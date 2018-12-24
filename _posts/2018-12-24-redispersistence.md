---
layout: post
title:  "Redis的持久化"
subtitle: "The persistence of Redis"
header-img: "img/post-bg-os-metro.jpg"
tag: 
    - Redis
---
**目录**
* content
{:toc}

# 常见的持久化方式
* 主从：通过从服务器保存和持久化，如mongoDB和replication sets配置 。
* 日志：操作生成相关日志，并通过日志来恢复数据。

# 快照(snapshotting)
* 也叫rdb，是redis的持久化方式之一。
* Redis可以通过创建快照来获得存储在内存里面的数据在某个时间点上的副本。

## 工作原理
* 每隔`N分钟或N次写操作`后，从内存dump数据形成rdb文件，`压缩`，放在`备份目录`。

## 相关参数
在`redis.conf`配置文件中

{% highlight ruby %}
/*在900秒之内发生1次变化 */
save 900 1 
/*在300秒之内发生10次变化 */
save 300 10 
/*在60秒内发生10000次变化 */
save 60 10000 
/*如果rdb导出出错，客户端停止写入 */
stop-writes-on-bgsave-error yes 
/*使用LZF压缩rdb文件 */
rebcompression yes 
/*存储和加载rdb文件时校验 */
rdbchecksun yes
/*设置rdb文件名 */
dbfilename dump.rdb 
/*设置工作目录，rdb文件会写入该目录 */
dir ./ 
{% endhighlight %}

## 优点
* 文件紧凑，适合进行数据备份。、
* 适用于灾难恢复。
* RDB 可以最大化 Redis 的性能：父进程在保存 RDB 文件时唯一要做的就是 fork 出一个子进程，然后这个子进程就会处理接下来的所有保存工作，父进程无须执行任何磁盘 I/O 操作。
* RDB 在恢复大数据集时的速度比 AOF 的恢复速度要快。

## 缺陷
* 在两个保存点之间，将会丢失大量数据。
* 每次保存 RDB 的时候，Redis 都要 fork() 出一个子进程，并由子进程来进行实际的持久化工作。 在数据集比较庞大时， fork() 可能会非常耗时，造成服务器在某某毫秒内停止处理客户端； 如果数据集非常巨大，并且 CPU 时间非常紧张的话，那么这种停止时间甚至可能会长达整整一秒。 


# 只追加文件(append-only-file,AOF)
* 日志持久化方式

## 工作原理
* 将命令立即写入一个aof日志文件上，通过查询aof文件来进行恢复。
* aof重写：把内存中的数据，逆化成命令，写入aof日志里，以解决aof日志过大的问题，在重写状态下，aof日志依旧进行着追加操作，因此是安全的。
## 相关参数
在`redis.conf`配置文件中

{% highlight ruby %}
/*是否打开aof日志功能 */
appendonly no 

appendsync always    /*每一个命令都立即同步到aof。安全，但是速度慢。 */
           everysec  /*折衷方案，每秒写一次 */
           no        /*写入工作交给操作系统，由操作系统判断缓冲区大小，统一写入到aof。同步频率低，速度快 */    
/*正在导出rdb快照的过程中，不要停止同步aof */
no-appendfsync-on-rewrite yes 
/*aof文件大小比起上次重写时的大小，增长率100%时，重写 */  
auto-aof-rewrite-percentage 100 
/*aof文件，至少超过64M时，重写 */
auto-aof-rewrite-min-size 64mb 
{% endhighlight %}

## 优点
* 让Redis变得非常耐久，丢失数据极少。
* aof文件内容易读，便于分析。

## 缺点
* 体积大。

# 注意
* rdb恢复比aof更加快。
* rdb和aof同时存在时，优先使用aof进行恢复数据。
* 推荐两种持久化方式同时使用。