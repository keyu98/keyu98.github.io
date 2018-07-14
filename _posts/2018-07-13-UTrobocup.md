---
layout: post
title:  UT代码框架
date:   2018-07-09 22:52:53 +0800
categories: robocup
tag: 源码
---

* content
{:toc}

![框架图](/styles/images/robocup框架.png)

主函数
======
{% highlight ruby %}

int main(int argc, char* argv[])
{
    // registering the handler, catching SIGINT signals
    signal(SIGINT, handler);

    // Actually print out the errors that are thrown.
    try
    {
        PrintGreeting();
        ReadOptions(argc,argv);

        if (! Init())
        {
            return 1;
        }

        Run();
        Done();
    }
    catch (char const* c)
    {
        cerr << "-------------ERROR------------" << endl;
        cerr << c << endl;
        cerr << "-----------END ERROR----------" << endl;
    }
    catch (string s)
    {
        cerr << "-------------ERROR------------" << endl;
        cerr << s << endl;
        cerr << "-----------END ERROR----------" << endl;
    }
}

{% endhighlight %}

载入参数
========
源码如下

{% highlight ruby %}

/*
 * Read in parameters from inputsFile, which should be formatted
 * with a set of parameters as key value pairs from strings to
 * floats.  The parameter name should be separated from its value
 * with a tab and parameters should be separated from each other
 * with a single newline.  Parameters will be loaded into the
 * namedParams map.
 */
map<string, string> namedParams;//声明map类型用来存储函数
void LoadParams(const string& inputsFile) {
    istream *input;
    ifstream infile;
    istringstream inString;

    infile.open(inputsFile.c_str(), ifstream::in);//打开文件

    if(!infile) {
        cerr << "Could not open parameter file " << inputsFile << endl;
        exit(1);
    }

    input = &(infile);

    string name;
    bool fBlockComment = false;
    while(!input->eof())
    {

        // Skip comments and empty lines
        //这段代码用于过滤信息
        std::string str;
        std::getline(*input, str);//这一段用于读取整行的文本,并将文本存储在str中
        if (str.length() >= 2 && str.substr(0,2) == "/*") {
            fBlockComment = true;//当长度大于二,且前2个字符为"/*"时,fBlockComment置为true
        } else if (str == "*/") {
            fBlockComment = false;//当字符串为"*/",fBlockComment置为false
        }
        if(fBlockComment || str == "" || str[0] == '#' ) {
            continue;//当fBlockComment为true或者字符串为空,或者第一个字符为'#'时,跳转,过滤消息.
        }

        // otherwise parse strings
        //当遇到我们想要的字符时
        stringstream s(str);
        std::string key;
        std::string value;
        std::getline(s, key, '\t');      //读取key值,遇到'\t'跳转
        std::getline(s, value);          //r读取value值
        if(value.empty()) {
            continue;//当value为空时,转到下一行
        }
        namedParams[key] = value;//将参数存进map容器
    }

    infile.close();//关闭文件
}

{% endhighlight %}

`infile.open(inputsFile.c_str(), ifstream::in);//打开文件` 

>这一段读取时候,open的参数不是文件名,而是文件名.c_str 原因在于如果一个文件名被申明为“string”，那么就必须使用 “c_str”，然而，当你申明一个文件名为字符数组型，就没有必要使用，比如:

```
char filename[20]; 
in.open(finename) 

otherwise 

string filename; 
in.open(filename.c_str)
```
c_str是string类的一个函数，可以把string类型变量转换成char*变量
open()要求的是一个char*字符串

---
`std::getline(*input, str);//这一段用于读取整行的文本,并将文本存储在str中.`
>getline()函数详解:
`istream& getline ( istream &is , string &str , char delim );`
其中 istream &is 表示一个输入流，譬如cin；
string&str表示把从输入流读入的字符串存放在这个字符串中（可以自己随便命名，str什么的都可以）；
char delim表示遇到这个字符停止读入，在不设置的情况下系统默认该字符为'\n'，也就是回车换行符（遇到回车停止读入）。

---

读取设置
=========

{% highlight ruby %}
string teamName;
int uNum;
string outputFile(""); // For optimization
string agentType("naoagent");
string rsg("rsg/agent/nao/nao.rsg");
void ReadOptions(int argc, char* argv[])
{

    teamName = "UTAustinVilla_Base";
    uNum = 0; // Value of 0 means choose next available number

    for( int i = 0; i < argc; i++)
    {
        if ( strcmp( argv[i], "--help" ) == 0 )
        {
            PrintHelp();
            exit(0);
        }
        else if ( strncmp( argv[i], "--host", 6 ) == 0 )
        {
            string tmp=argv[i];

            if ( tmp.length() <= 7 ) // minimal sanity check
            {
                PrintHelp();
                exit(0);
            }
            gHost = tmp.substr(7);
        }
        else if ( strncmp( argv[i], "--mhost", 7 ) == 0 )
        {
            string tmp=argv[i];

            if ( tmp.length() <= 8 ) // minimal sanity check
            {
                PrintHelp();
                exit(0);
            }
            mHost = tmp.substr(8);
        }
        else if ( strncmp( argv[i], "--port", 6) == 0 ) {
            if (i == argc - 1) {
                PrintHelp();
                exit(0);
            }
            gPort = atoi(argv[i+1]);
        }
        else if ( strncmp( argv[i], "--mport", 7) == 0 ) {
            if (i == argc - 1) {
                PrintHelp();
                exit(0);
            }
            mPort = atoi(argv[i+1]);
        }
        else if(strcmp(argv[i], "--team") == 0) {
            if(i == argc - 1) {
                PrintHelp();
                exit(0);
            }

            teamName = argv[i + 1];
        }
        else if(strcmp(argv[i], "--unum") == 0) {
            if(i == argc - 1) {
                PrintHelp();
                exit(0);
            }
            uNum = atoi(argv[i + 1]);
        }
        else if(strcmp(argv[i], "--paramsfile") == 0) {
            if(i == argc - 1) {
                PrintHelp();
                exit(0);
            }
            string inputsFile = argv[i+1];
            LoadParams(inputsFile);
        }
        else if (strcmp(argv[i], "--experimentout") == 0) {
            if(i == argc - 1) {
                PrintHelp();
                exit(0);
            }
            outputFile = argv[i+1];
        }
        else if (strcmp(argv[i], "--optimize") == 0) {
            if(i == argc - 1) {
                PrintHelp();
                exit(0);
            }
            agentType = argv[i+1];
        }
        else if (strcmp(argv[i], "--type") == 0) {
            if(i == argc - 1) {
                PrintHelp();
                exit(0);
            }
            rsg = "rsg/agent/nao/nao_hetero.rsg " + string(argv[i+1]);
            agentBodyType = atoi(argv[i+1]);
        }
        else if (strcmp(argv[i], "--rsg") == 0) {
            if(i == argc - 1) {
                PrintHelp();
                exit(0);
            }
            rsg = argv[i+1];
        }
        else if (strcmp(argv[i], "--pkgoalie") == 0) {
            agentType = "pkgoalie";
        }
        else if (strcmp(argv[i], "--pkshooter") == 0) {
            agentType = "pkshooter";
        }
	else if (strcmp(argv[i], "--gazebo") == 0) {
            agentType = "gazebo";
        }
    } // for-loop
}

{% endhighlight %}

---

初始化函数
==========
{% highlight ruby %}
bool Init()
{
    cout << "connecting to TCP " << gHost << ":" << gPort << "\n";
    //cout << "connecting to UDP " << gHost << ":" << gPort << "\n";

    try
    {
        Addr local(INADDR_ANY,INADDR_ANY);
        gSocket.bind(local);
    }

    catch (BindErr error)
    {
        cerr << "failed to bind socket with '"
             << error.what() << "'" << endl;

        gSocket.close();
        return false;
    }

    try
    {
        Addr server(gPort,gHost);
        gSocket.connect(server);
    }

    catch (ConnectErr error)
    {
        cerr << "connection failed with: '"
             << error.what() << "'" << endl;
        gSocket.close();
        return false;
    }

    // Connect to the monitor port so that we can use the training command parser
    if (mPort != -1) {
        try
        {
            Addr local(INADDR_ANY,INADDR_ANY);
            mSocket.bind(local);
        }

        catch (BindErr error)
        {
            cerr << "failed to bind socket with '"
                 << error.what() << "'" << endl;

            mSocket.close();
            return false;
        }

        try
        {
            Addr server(mPort,gHost);
            mSocket.connect(server);
        }

        catch (ConnectErr error)
        {
            cerr << "connection failed with: '"
                 << error.what() << "'" << endl;
            mSocket.close();
            return false;
        }
    }


    return true;
}

{% endhighlight %}

---

运行函数
========
{% highlight ruby %}
void Run()
{
    Behavior *behavior;
    if (agentType == "naoagent") {
        behavior = new NaoBehavior(teamName, uNum, namedParams, rsg);
    }
    else if (agentType == "pkgoalie") {
        behavior = new PKGoalieBehavior(teamName, uNum, namedParams, rsg);
    }
    else if (agentType == "pkshooter") {
        behavior = new PKShooterBehavior(teamName, uNum, namedParams, rsg);
    }
    else if (agentType == "gazebo") {
      agentBodyType = GAZEBO_AGENT_TYPE;
        behavior = new GazeboBehavior(teamName, uNum, namedParams, rsg);
    }
    else if (agentType == "fixedKickAgent") {
        cerr << "creating OptimizationBehaviorFixedKick" << endl;
        behavior = new OptimizationBehaviorFixedKick(  teamName,
                uNum,
                namedParams,
                rsg,
                outputFile);
    }
    else if (agentType == "walkForwardAgent") {
        cerr << "creating OptimizationBehaviorWalkForward" << endl;
        behavior = new OptimizationBehaviorWalkForward(  teamName,
                uNum,
                namedParams,
                rsg,
                outputFile);
    }
    else {
        throw "unknown agent type";
    }

    PutMessage(behavior->Init()+"(syn)");

    string msg;
    while (gLoop)
    {
        GetMessage(msg);
        string msgToServer = behavior->Think(msg);
        // To support agent sync mode
        msgToServer.append("(syn)");
        PutMessage(msgToServer);
        if (mPort != -1) {
            PutMonMessage(behavior->getMonMessage());
        }
    }
}
{% endhighlight %}

---

结束
====
{% highlight ruby %}
void Done()
{
    gSocket.close();
    cout << "closed connection to " << gHost << ":" << gPort << "\n";
    if (mPort != -1) {
        mSocket.close();
    }
}

bool SelectInput()
{
    fd_set readfds;
    struct timeval tv = {60,0};
    FD_ZERO(&readfds);
    FD_SET(gSocket.getFD(),&readfds);

    while(1) {
        switch(select(gSocket.getFD()+1,&readfds, 0, 0, &tv)) {
        case 1:
            return 1;
        case 0:
            cerr << "(SelectInput) select failed " << strerror(errno) << endl;
            abort();
            return 0;
        default:
            if(errno == EINTR)
                continue;
            cerr << "(SelectInput) select failed " << strerror(errno) << endl;
            abort();
            return 0;
        }
    }
}
{% endhighlight %}

