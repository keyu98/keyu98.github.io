---
layout: post
title: "GUI学习笔记2> java中Jbutton的方法"
tag: 
    - GUI
---

JButton 实现了普通的三态外加选中、禁用状态，有很多方法可以设置。

很多时候没有必要去写鼠标监听器。


{% highlight ruby %}


#-*- coding:utf-8 -*-
 
setBorderPainted(boolean b) 
//是否画边框，如果用自定义图片做按钮背景可以设为 false。

setContentAreaFilled(boolean b)
 //是否填充，如果你的自定义图片不是矩形或存在空白边距，可以设为 false 使按钮看起来透明。

setFocusPainted(boolean b)
 //是否绘制焦点(例如浅色虚线框或者加粗的边框表明按钮当前有焦点)。

setMargin(Insets m) 
//改变边距，如果 borderPainted 和 contentAreaFilled 都设成了 false，建议把边距都调为 0:new Insets(0, 0, 0, 0)。

setIcon(Icon defaultIcon)
 //注意了这是改的默认图标。三态中的默认，即鼠标未在其上的时候。

setPressedIcon(Icon pressedIcon) 
//按下时的图标。

setRolloverIcon(Icon rolloverIcon) 
//鼠标经过时的图标。

setRolloverSelectedIcon(Icon rolloverSelectedIcon)
 //鼠标经过时且被选中状态的图标。

setSelectedIcon(Icon selectedIcon)
 //选中时的图标。

setDisabledIcon(Icon disabledIcon) 
//禁用时显示的图标。例如可以换一张灰度图片。

setDisabledSelectedIcon(Icon disabledSelectedIcon) /
/禁用且被选中状态的图标。

{% endhighlight %}