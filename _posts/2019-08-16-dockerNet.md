---
layout: post
title:  "Docker的网络通信原理"
subtitle: "同一宿主机内的docker通信"
header-img: "img/about-bg-walle.jpg"
tag: 
    - 虚拟化
    - 网络原理
---

最近学习了下有关docker的网络通信原理，因此想记一下笔记，便于自己消化。
## 虚拟网桥 

* 已经有学过docker的原理，docker通过network namespace来限制网络，从而使容器进程只能看到自己的network namespace中的网络栈。所以在同一宿主机中的容器进程是不能通过unix socket来进行通信的，因为他们之间并不"可见"。  
* 每一个容器其实可以看做一个主机，而主机间的通信的话，思路就很简单，我们可以将他们连在同一台交换机的不同端口上。 
* 而Docker项目当然想到了这一点，因此在安装了docker的linux 主机上，我们可以发现自己多了这样一个网卡，也就是下图所示的docker0网桥,他起到了关键性的作用。这里用到一钟名字叫做**Veth Pair**的虚拟设备。Veth Pair总是以两张虚拟网卡(Veth Peer)的形式成对出现，并且从其中一张网卡发出的数据包可以直接出现到另外一张网卡上面，即使他们的network namespace不同。  
* 当启动一个容器后，进入容器，观察容器的网卡设备。 

```
$ route 
Kernel IP routing table 
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface 
default         172.17.0.1      0.0.0.0         UG    0      0        0 eth0 
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 eth0 
``` 
  
* 如果进入一个docker容器，查看它的路由，可以发现对于每一个172.17.0.0/16的请求，都会交给eth0网卡，假如发送给ip地址为172.17.0.3这样一个docker容器，可以发现，其对应的网关为0.0.0.0(直连规则)，ip包将会经过本机的eth0网卡，通过二层网络发往目标主机。veth0 其实就是Veth Pair的一部分，他是属于容器的那一端虚拟网卡，而另外一端则在宿主机上。 
* 在一个有两个docker容器处于运行状态的宿主机的网络设备如下: 

``` 
$ ifconfig
docker0   Link encap:Ethernet  HWaddr 02:42:40:45:BC:57 
          inet addr:172.17.0.1  Bcast:172.17.255.255  Mask:255.255.0.0 
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1 
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0 
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0 
          collisions:0 txqueuelen:0 
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B) 
 
 eth0      Link encap:Ethernet  HWaddr 72:E9:5D:1E:EE:E0 
           inet addr:192.168.0.43  Bcast:0.0.0.0  Mask:255.255.254.0 
           UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1 
           RX packets:16 errors:0 dropped:0 overruns:0 frame:0 
           TX packets:0 errors:0 dropped:0 overruns:0 carrier:0 
           collisions:0 txqueuelen:0 
           RX bytes:1296 (1.2 KiB)  TX bytes:0 (0.0 B) 
  
eth1      Link encap:Ethernet  HWaddr 02:42:AC:12:00:24 
           inet addr:172.18.0.36  Bcast:0.0.0.0  Mask:255.255.0.0 
           UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1 
           RX packets:78608 errors:0 dropped:0 overruns:0 frame:0 
           TX packets:11713 errors:0 dropped:0 overruns:0 carrier:0 
           collisions:0 txqueuelen:0 
           RX bytes:98787459 (94.2 MiB)  TX bytes:11837133 (11.2 MiB) 
  
lo        Link encap:Local Loopback 
          inet addr:127.0.0.1  Mask:255.0.0.0 
          UP LOOPBACK RUNNING  MTU:65536  Metric:1 
          RX packets:130 errors:0 dropped:0 overruns:0 frame:0 
          TX packets:130 errors:0 dropped:0 overruns:0 carrier:0 
          collisions:0 txqueuelen:1 
          RX bytes:15054 (14.7 KiB)  TX bytes:15054 (14.7 KiB) 
 
veth51a7259 Link encap:Ethernet  HWaddr 8E:EA:64:6E:0F:6A 
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1 
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0 
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0 
          collisions:0 txqueuelen:0 
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B) 
 
veth62df903 Link encap:Ethernet  HWaddr 02:48:0B:6D:47:80 
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1 
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0 
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0 
          collisions:0 txqueuelen:0 
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B) 
``` 
 
 可以发现它有两个名字分别叫做veth51a7259、veth62df903的虚拟网卡设备，他们则是Veth Pair的另外一端，可以猜到，这两个虚拟网卡分别与两个不同docker容器的eth0建立了联系。打个比方，vethxxx与容器的eth0之间可以近似于看做网线，而vethxxx就可以看做插在docker0上的端口。 
  
  * 他们的关系就如下图所示: 
  ![](/img/in-post/docker-net.jpg) 
  假如容器Container要向Container2发送数据，流程大概是: 
  1. 数据交给eth0虚拟网卡，通过查询Container2的IP地址，发现是直连，因此进入二层网络，通过MAC地址寻址。进行ARP广播。 
  2. docker0扮演二层交换机角色，收到ARP请求，将ARP广播，Container2收到请求，发现与自己的IP地址相同，回复请求，并将自己的MAC地址发给Container容器。 
  3. Container收到Container2的MAC地址，因此数据包得以发送出去。 