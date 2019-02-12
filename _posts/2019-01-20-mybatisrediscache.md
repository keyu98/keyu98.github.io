---
layout: post
title:  "Redis二级缓存"
subtitle: "项目实战:Spring Boot下关于MyBatis的二级缓存"
header-img: "img/post-bg-universe.jpg"
tag: 
    - Spring
    - Redis
---

# MyBatis
* MyBatis作为一个优秀的ORM框架，缓存是其必不可少的功能之一。
* 其本身具有缓存的功能，默认开启一级缓存，它的一级缓存是SqlSession级别的缓存。在操作数据库时需要构造SqlSession对象，其对象中有一个内存区域用于存储缓存数据。但是不同的sqlSession之间的缓存区域却是相互不影响的。
* 其有内置的二级缓存，但是默认关闭。其实SqlSessionFactory级别的，作用域为mapper的同一个namespace，不同的sqlSession两次执行相同namespace下的sql语句，第二次会从缓存中查询，而不从数据库中查询，大大提高了查询效率。

# Redis做缓存的好处
* Redis支持数据的持久化
* 支持数据备份
* 性能极高-Redis能读的速度是110000次/s,写的速度是81000次/s

# 原理
## 装饰器模式
* 在MyBatis的存储模块中，采用装饰器模式的变体。
![](\img\in-post\MybatisCache.PNG)  
结构如上图所示
* 在装饰器模式下，可扩展性强。
* 当有新功能添加时，我们只需要添加新的装饰器实现类，然后以组合方式添加这个新的装饰器即可。
* 如果我们要实现一个自己的二级缓存，我们只需要实现MyBatis的Cache接口。

> 如下图，在启动二级缓存后，`CachingExecutor`作为`Executor`的装饰者，增强了Executor的功能，使其具有缓存查询的功能。

![](\img\in-post\mybatiscache2.PNG)

## CacheKey
* CacheKey可以说是实现缓存的关键，MyBatis根据CacheKey的不同从而区分缓存是否命中。(即两次查询是否是完全相同的)

```java
@Override
  public String toString() {
    StringBuilder returnValue = new StringBuilder().append(hashcode).append(':').append(checksum);
    for (int i = 0; i < updateList.size(); i++) {
      returnValue.append(':').append(updateList.get(i));
    }

    return returnValue.toString();
  }
```
以下为一次缓存生成的CacheKey经过toString方法生成的字符串
`-1322037613:765342372:site.keyu.askme.dao.CommentDao.getCommentById:0:2147483647:select   id,  user_id, content, created_date, entity_id, entity_type, status   from   comment   where id=?:25:SqlSessionFactoryBean`

* 它由以下四个部分构成:
  * MappedStatement的id
  * 指定查询结果集的范围，也就是RowBound.offset和RowBounds.limit
  * 查询所使用的SQL语句，也就是boundSql.getSql()方法返回的SQL语句，其中可能包含"?"占位符
  * 用户传递给上述SQL语句的实际参数值


## 实现

## 配置
```xml
<settings>
    <!-- 启动二级缓存  -->
    <setting name="cacheEnabled" value="true" />

    <!-- ...  -->
</settings>
```

## 缓存工具类
* 实现缓存的`取出`，`存储`，`清除`等。
* 实现pojo的序列化，这里采用的Alibaba的开源项目`fastjson`
* 在这里使用的`Jedis`来操作Redis

```java
package site.keyu.askme.utils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Component;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import site.keyu.askme.pojo.Comment;

import java.util.List;

/**
 * @Author:Keyu
 */
@Component
public class RedisCacheUtil implements InitializingBean {

    private static final Logger logger = LoggerFactory.getLogger(RedisCacheUtil.class);
    private JedisPool pool;


    @Override
    public void afterPropertiesSet() throws Exception {
        pool = new JedisPool("redis://localhost:6379/3");
    }

    public void putCathe(Object key,Object value){
        Jedis jedis = null;
        try {
            jedis = pool.getResource();
            String json = JSONObject.toJSONString(value);
            jedis.set(key.toString(),json);
            logger.info("存储缓存 key:"+key);
        } catch (Exception e) {
            logger.error("发生异常" + e.getMessage());
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public Object getCathe(Object key){
        Jedis jedis = null;
        try {
            jedis = pool.getResource();
            String json = jedis.get(key.toString());
            //取得热点缓存数据
            List<Comment> value = JSON.parseArray(json,Comment.class);
            if (value == null){
                logger.info("未命中 key:"+key);
            }
            else{
                logger.info("命中 key:"+key);
            }

            return  value;
        } catch (Exception e) {
            logger.error("发生异常" + e.getMessage());
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
        return null;
    }

    public Object removeCathe(Object key){
        Jedis jedis = null;
        try {
            jedis = pool.getResource();
            return  jedis.expire(key.toString(),0);
        } catch (Exception e) {
            logger.error("发生异常" + e.getMessage());
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
        return null;

    }

    public int getCatheSize(){
        Jedis jedis = null;
        try {
            jedis = pool.getResource();
            int size = Integer.valueOf(jedis.dbSize().toString());
        } catch (Exception e) {
            logger.error("发生异常" + e.getMessage());
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
        return 0;
    }

    public void clearCathe(){
        Jedis jedis = null;
        try {
            jedis = pool.getResource();
            jedis.flushDB();
        } catch (Exception e) {
            logger.error("发生异常" + e.getMessage());
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }

    }
}

```

## 实现Cache类


```java
package site.keyu.askme.cache;

import org.apache.ibatis.cache.Cache;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import site.keyu.askme.utils.RedisCacheUtil;

import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * @Author:Keyu
 */
public class MyBatisRedisCache implements Cache {


    private static RedisCacheUtil redisCacheUtil;

    private final ReadWriteLock readWriteLock = new ReentrantReadWriteLock();

    private static final Logger logger = LoggerFactory.getLogger(MyBatisRedisCache.class);
    private String id;

    /**
     * 这里需要静态注入工具类
     * @param redisCacheUtil
     */
    public static void setRedisCacheUtil(RedisCacheUtil redisCacheUtil){
        MyBatisRedisCache.redisCacheUtil = redisCacheUtil;
    }

    public MyBatisRedisCache(final String id) {
      if (id == null) {
        throw new IllegalArgumentException("Cache instances require an ID");
       }
      logger.debug(">>>>>>初始化 id:" + id);
       this.id = id;
    }
    @Override
    public String getId() {
        return this.id;
    }

    @Override
    public void putObject(Object key, Object value) {
        logger.debug(">>>>>>putObejct key:"+key);

        redisCacheUtil.putCathe(key,value);

    }

    @Override
    public Object getObject(Object key) {

        logger.debug("<<<<<<<<getObject key:"+key);
        Object value = redisCacheUtil.getCathe(key);
        return value;
    }

    @Override
    public Object removeObject(Object key) {
        logger.debug(">>>>>>>>>removeObject key:"+key);
        return redisCacheUtil.removeCathe(key);
    }

    @Override
    public void clear() {
        logger.debug(">>>>>>>>>清空缓存");
        redisCacheUtil.clearCathe();
    }

    @Override
    public int getSize() {
        return  redisCacheUtil.getCatheSize();
    }

    @Override
    public ReadWriteLock getReadWriteLock() {
        return readWriteLock;
    }
}

```

## 静态注入组件

```java
package site.keyu.askme.cache;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import site.keyu.askme.utils.RedisCacheUtil;

/**
 * @Author:Keyu
 */
@Component
public class MyBatisRedisCacheTransfer {

    @Autowired
    public void setRedisCatheUtil(RedisCacheUtil redisCatheUtil){
        MyBatisRedisCache.setRedisCacheUtil(redisCatheUtil);
    }

}

```


## 使用
* 在需要使用二级缓存的Mapper下声明刚刚定义好的缓存类即可

```java

/**
 * @Author:Keyu
 */
@Mapper
@CacheNamespace(implementation = site.keyu.askme.cache.MyBatisRedisCache.class)
public interface CommentDao {
    //TODO
}
```

# 测试
## 第一次请求
* 未命中缓存并且存储缓存
![](\img\in-post\Cache1.PNG)  
## 第二次请求
* 命中缓存，直接从缓存中取得数据
![](\img\in-post\Cache2.PNG)  
## Redis
* MyBatis自动生成Id存储在Redis中，Key如下
![](\img\in-post\Cache3.PNG)  

