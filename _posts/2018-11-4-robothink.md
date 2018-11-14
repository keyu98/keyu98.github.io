---
layout: post
title: "<机器人足球>Think函数"
tag: 
    - 源码
---

* content
{:toc}

此函数用于机器人的思考与行动，声明在
>`behaviors\naobehavior.cc`的138行左右


`string NaoBehavior::Think(const std::string& message)`  
  
返回值为string类型,一系列的字符串代表机器人接下来的行动。返回的字符串将在
>`main.cc`的519行左右

{% highlight ruby %}
while (gLoop)
    {
        GetMessage(msg);
        string msgToServer = behavior->Think(msg);
        // To support agent sync mode
        msgToServer.append("(syn)");//在返回的字符串后加上"(syn)"
        PutMessage(msgToServer);//将字符串信息传到服务器
        if (mPort != -1) {
            PutMonMessage(behavior->getMonMessage());//从服务器获取信息
        }
    }
{% endhighlight %}


init
========


>`behaviors\naobehavior.cc`的192行左右  

{% highlight ruby %}
while (gLoop)
    if (!mInit) {//如果检查没有初始化,将执行此语句

        mInit = true;
        stringstream ss;
        ss << "(init (unum " << agentUNum << ")(teamname " << agentTeamName << "))";
        action = ss.str();
        return action;
    }
{% endhighlight %}

返回的string格式为  
* `(init(unum 机器人号码)(teamname 机器人队伍的名称))`    
* 用于初始机器人的号码及其队伍信息  

beam
=======
>`behaviors\naobehavior.cc`的238行左右  

{% highlight ruby %}
if(!initBeamed) {//如果初始位置没有初始化
            initBeamed = true;


            double beamX, beamY, beamAngle;

            // Call a virtual function
            // It could either be implemented here (real game)
            // or in the inherited classes
            // Parameters are being filled in the beam function.
            this->beam( beamX, beamY, beamAngle );
            stringstream ss;
            ss << "(beam " << beamX << " " << beamY << " " << beamAngle << ")";
            particleFilter->setForBeam(beamX, beamY, beamAngle);
            action = ss.str();
            return action;
        }
        else {//否则将机器人身体信息置为初始值
            // Not Initialized
            bodyModel->setInitialHead();
            bodyModel->setInitialArm(ARM_LEFT);
            bodyModel->setInitialArm(ARM_RIGHT);
            bodyModel->setInitialLeg(LEG_LEFT);
            bodyModel->setInitialLeg(LEG_RIGHT);
            initialized = true;
        }
    }
{% endhighlight %}

返回的string格式为  
* `(beam 机器人初始化在x轴坐标 机器人初始化在y轴坐标 机器人面向的角度)`    
* 用于初始机器人初始位置及方向信息

composeAction
=============
>`behaviors\naobehavior.cc`的287行左右


{% highlight ruby %}
action = action + composeAction();

    //std::cout << "Sending action: " << action << "\n";
    return action;
{% endhighlight %}

composeAction函数包含了绝大部分机器人思考做出的行动信息以及机器人的交流 
>`behaviors\servercomm`的63行左右

返回的string格式为
* `(he1 HeadYaw参数)`
* `(he2 HeadPitch参数)`

* `(lae1 LShoulderPitch参数)`
* `(lae2 LShoulderRoll参数)`
* `(lae3 LElbowYaw参数)`
* `(lae4 LElbowRoll参数)`

* `(rae1 RShoulderPitch参数)`
* `(rae2 RShoulderRoll参数)`
* `(rae3 RElbowYaw参数)`
* `(rae4 RElbowRoll参数)`

* `(lle1 LHipYawPitch参数)`
* `(lle2 LHipRoll参数)`
* `(lle3 LHipPitch参数)`
* `(lle4 LKneePitch参数)`
* `(lle5 LAnklePitch参数)`
* `(lle6 LAnkleRoll参数)`
* `(lle7 LToePitch参数)`

* `(rle1 RHipYawPitch参数)`
* `(rle2 RHipRoll参数)`
* `(rle3 RHipPitch参数)`
* `(rle4 RKneePitch参数)`
* `(rle5 RAnklePitch参数)`
* `(rle6 RAnkleRoll参数)`
* `(rle7 RToePitch参数)`

* 对应了NAO机器人的所有关节信息
![NAO关节结构](\img\in-post\nao.PNG)

say
====
在composeAction函数关节设置过后，紧接着的是机器人的交流信息

>`servercomm\primitives.cc`的162行左右


{% highlight ruby %}
if (canTrust || fallen) {
        if(makeSayMessage(uNum, time, timeBallLastSeen, ballX, ballY, myX, myY, fallen, message)) {
            ss << message;
            /*
            cout << "Data Sent:\n";
            cout << "\tTime: " << time << "\n";
            cout << "\tTime ball last seen: " << timeBallLastSeen << "\n";
            cout << "\tFallen: " << fallen << "\n";
            cout << "\tBall x: " << ballX << "\n";
            cout << "\tBall y: " << ballY << "\n";
            cout << "\tMy x: " << myX << "\n";
            cout << "\tMy y: " << myY << "\n";
            cout << "\n";
            */
        }
    }
{% endhighlight %}

* `(say 交流的信息)`
* 信息包括机器人的编号，时间，最后一次看到足球的时间，球的xy坐标，机器人的xy坐标，自己是否跌倒