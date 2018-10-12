---
layout: post
title: <学习GUI> 按钮实现页面切换wxpython
date:   2018-10-12 9:00:38 +0800
categories: 思路
tag: GUI
---


* content
{:toc}

  
这个方法算是自己摸索出来的，目前看来代码量会有些大，不过挺容易理解。  

方法
=====

>1.在初始函数里事先声明会用到的控件  
>2.在button控件的bind的方法函数中提到每一个需要用到的控件，若需要用到，则检测控件是否存在，若存在，则不再声明，不存在，则声明。  
>3.若不需要用到该控件，则检测控件是否存在，若存在，则Destroy，不存在，则不响应。  

示例代码
========

{% highlight ruby %}

#-*- coding:utf-8 -*-
 
 
import wx
 
class TestFrame(wx.Frame):
    def __init__(self):
        wx.Frame.__init__(self,None,-1,u'登陆',size=(370,280),style=wx.MINIMIZE_BOX|
        wx.SYSTEM_MENU|wx.CAPTION|wx.CLOSE_BOX)
        self.SetBackgroundColour('white')
 
        self.button1 = wx.Button(self,-1,u'按钮1',pos = (80,180))
        self.button1.Bind(wx.EVT_BUTTON,self.OnButtonClick1)
 
        self.button2 = wx.Button(self,-1,u'按钮2',pos = (180,180))
        self.button2.Bind(wx.EVT_BUTTON,self.OnButtonClick2)
 
        #Button1显示组件
        self.text1 = None
        self.textc1 = None
 
        #Button2显示组件
        self.text2 = None
        self.textc2 = None
 
        
 
    def OnButtonClick1(self,event):
        if not self.text1:
            self.text1 = wx.StaticText(self,-1,u'用户名',(70,73),(50,-1),wx.ALIGN_CENTER)
            self.text1.SetBackgroundColour('black')#设置背景颜色
            self.text1.SetForegroundColour('white')#设置文本颜色
        if not self.textc1:
            self.textc1 = wx.TextCtrl(self,pos=(140,70))
 
        if self.text2:
            self.text2.Destroy()
        if self.textc2:
            self.textc2.Destroy()
    def OnButtonClick2(self,event):
        if self.text1:
            self.text1.Destroy()
        if self.textc1:
            self.textc1.Destroy()
 
        if not self.text2:
            self.text2 = wx.StaticText(self,-1,u'密码',(70,123),(50,-1),wx.ALIGN_CENTER)
            self.text2.SetBackgroundColour('black')#设置背景颜色
            self.text2.SetForegroundColour('white')#设置文本颜色
        if not self.textc2:
            self.textc2 = wx.TextCtrl(self,pos=(140,120), style=wx.TE_PASSWORD)
            
        
   
if __name__ == "__main__":
    
    app = wx.App()
    frame = TestFrame()
    frame.Show()
    app.MainLoop()

{% endhighlight %}