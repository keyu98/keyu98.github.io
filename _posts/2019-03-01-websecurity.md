---
layout: post
title:  "常见Web站点安全性问题"
subtitle: "Common Web site security issues"
header-img: "img/about-bg-walle.jpg"
tag: 
    - Web
---

# SQL注入
## 介绍
* SQL注入为常见的网站攻击方式，其攻击原理主要是在站点执行SQL语句时，传入非法参数  

`例子`  
> https://keyu.site?page=1  

其中page是传入的参数，page的值为1，在服务器进行处理时，可能会将page的值写入SQL中，比如:  
`select * from post where page=1`  
这样就完成了一次查找操作，并返回我们想要的值

但是若是进行非法操作比如
> https://keyu.site?page=1;drop table post--

那么最后SQL就变为  
`select * from post where page=1;drop table post--`

情况糟糕了，我们的数据库可能就面临着被删除的危险，并且可能被执行任何操作

## 解决方案
* 验证输入(不常用)
* PreparedStatement(简单有效)  
在传入参数时用占位符代替   
`select * from post where page=?`  
在这种情况下，以前攻击后的SQL就变为  
`select * from post where page='1;drop table post--'`   

# CSRF跨站请求伪造
## 介绍
* 恶意的人可能会使用JavaScript脚本或者其他渠道，在客户端截取你的Cookie，并且伪造它，你的信息就被这样窃取了

## 解决方案
* 利用Http的HttpOnly属性，限制非Http的API访问
* HttpOnly并不能防止对网络频道具有访问权限的攻击者直接访问该Cookie。针对这种情况，应考虑使用安全套结字层(SSL)来提供帮助

# 跨站脚本攻击(XSS)  
## 介绍
* 特别是在允许客户上传的站点，比如评论区，假如客户输入
```html
这是一条评论
<script>
alert("XSS");
</script>
```
当你要在网页展示这段文字时，就会马上弹出XSS的对话框，若是客户输入更加恶意的脚本，情况可能会更加糟糕。

## 解决方案
* 对容易引起漏洞的XSS漏洞的字符转义过滤或者拦截



# 拖库安全
## 介绍
* 这算是最后一道防线了，不法分子已经将你的站点的所有数据库内容给导出了，我们应该怎样才能尽可能地保证数据安全呢
* 有很多站点被拖库后，将用户的密码也暴露出去，自己受损害，还连累了在这里注册的用户。

## 解决方案
* 在数据库不要采用明文的密码，而是将密码进行加密然后再存入数据库中
* 常用的加密方式，为单向的MD5加密，密码只要不够常见，几乎不会被破解，我们也可以给密码加盐，让其更加难以攻破。