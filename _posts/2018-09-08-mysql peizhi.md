---
layout: post
title: "mysql数据库和MySQLdb环境配置"
tag: 
  - 环境配置
---


* content
{:toc}

安装Mysql
==========

Windows环境下安装数据库,  
网址:https://dev.mysql.com/downloads/installer/  
选取MSI Installer  

![mysql安装包](\img\in-post\MSQL1.png)  

这个安装包文件傻瓜式,主要在安装过程中记住自己设置的权限密码就行了.

安装完毕后,配置环境变量.
 
>在win10系统下,步骤如下  
1.找到此电脑,右键属性  
2.点击高级系统设置  
3.点击环境变量  
4.在系统的path下编辑,新添`mysql serve主目录下的bin文件夹地址即可`    

最后打开cmd命令,输入
`mysql -u root -p`  
mysql启动成功

为python增加MySQLdb模块
======================

打开python,输入  
```
>>>import MySQLdb
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ImportError: No module named MySQLdb
>>>
```

说明还没有安装
官网下载安装包,  
网址:https://pypi.org/project/MySQL-python/1.2.5/  

选择合适的版本,不然安装包识别不到python,直接安装即可.

安装完毕后,打开python,输入  
```
>>>import MySQLdb
>>>
```

这时没有报错,模块安装成功

python操作mysql
===============
事先记得打开mysql serve,  
编辑testdb.py文件
{% highlight ruby %}
# -*- coding:utf-8 -*-
import MySQLdb

if __name__ == "__main__":
    test= MySQLdb.connect("localhost","root","root","mysql" )
    cur = test.cursor()
    cur.execute('show tables;')
    for data in cur.fetchall():
        print data
{% endhighlight %}

```
python testdb.py 
```
报错:
`[ERROR]1251--Client does not support authentication protocol requested by server`  

查找原因:  
>mysql服务器要求的认证插件版本与客户端不一致造成的。   
打开mysql命令行输入如下命令查看，系统用户对应的认证插件：  
可以看到root用户使用的plugin是caching_sha2_password，mysql官方网站有如下说明：  
意思是说caching_sha2_password是8.0默认的认证插件，必须使用支持此插件的客户端版本。  

解决办法:
>用管理员身份打开cmd
mysql -uroot -p（输入密码）            进入mysql执行下面三个命令  
use mysql；  
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '你的密码';  
FLUSH PRIVILEGES;  

解决后,再次执行testdb.py文件
![成功](\img\in-post\MSQL2.PNG)  

环境配置成功,已经可以用python来操作mysql数据库

