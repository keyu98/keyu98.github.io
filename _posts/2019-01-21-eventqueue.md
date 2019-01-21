---
layout: post
title:  "异步队列"
subtitle: "项目实战:Redis实现的异步队列缓解压力"
header-img: "img/post-bg-universe.jpg"
tag: 
    - Spring
    - Redis
---

# 场景
### 介绍
* 点到点的的消息传送：
  * 管理员为用户发送站内信
  * 用户和用户发送站内信
  * 系统给用户发送站内信通知。
* 点到面的消息传送：
  * 管理员指定一个群体群发消息

### 难点
* 在很多情况都会发送站内信，频繁的站内信通知会涉及到对数据库的多次重复插入，大大增加了数据库压力。

# 异步队列
![](\img\in-post\eventqueue.PNG)  
* `生产者`产生事件，是事件的来源。
* 事件产生时，不急着处理，而是将事件放进一个`先进先出`的队列中。
* `消费者`处理事件，将事件分类,分类后交给不同的handler处理。

# 实现
## 生产者
```java
@Service
public class EventProducer {

    @Autowired
    JedisAdapter jedisAdapter;

    public boolean fireEvent(EventModel eventModel){
        try{
            //序列化事件
            String json = JSONObject.toJSONString(eventModel);
            String key = RedisKeyUtil.eventQueueKey();
            //将其放入redis队列中
            jedisAdapter.lpush(key,json);
            return true;
        }catch (Exception e){
            return false;
        }
    }
}

```

## 消费者
### handler接口

```java
public interface EventHandler {
    //用于处理事件
    void doHandle(EventModel model);

    //获取其能处理的事件类型
    List<EventType> getSupportEventTypes();
    
}

```
### 事件识别载入

```java
//用hashmap来将事件类型与handler对应
private Map<EventType, List<EventHandler>> config = new HashMap<EventType, List<EventHandler>>();

//获取所有handler类的所有bean
 Map<String,EventHandler> beans = applicationContext.getBeansOfType(EventHandler.class);
        if(beans != null){
            for (Map.Entry<String,EventHandler> entry:beans.entrySet()){
                //遍历传入config
                List<EventType> eventTypes = entry.getValue().getSupportEventTypes();

                for (EventType type:eventTypes){
                    if (!config.containsKey(type)){
                        config.put(type,new ArrayList<EventHandler>());
                    }
                    config.get(type).add(entry.getValue());
                }
            }
```

## 事件识别并执行

```java
Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                while (true){
                    String key = RedisKeyUtil.eventQueueKey();
                    //从redis中取出队列中的事件
                    //brpop阻塞式队列，避免cpu浪费
                    List<String> events = jedisAdapter.brpop(0,key);

                    for (String message:events){
                        if(message.equals(key)){
                            continue;
                        }

                        //将事件反序列化
                        EventModel eventModel = JSON.parseObject(message,EventModel.class);
                        if(!config.containsKey(eventModel.getType())){
                            logger.error("事件无法识别：+"+eventModel.getType());
                            continue;
                        }

                        for (EventHandler handler:config.get(eventModel.getType())){
                            //执行
                            //一种事件可能多个handler执行
                            handler.doHandle(eventModel);
                        }
                    }
                }
            }
        });

        thread.start();;
```