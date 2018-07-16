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

int main(int argc, char* argv[]) //main传入的参数可以在start.sh文件中找到
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

`int main(int argc, char* argv[])`关于主函数传参   
>`main(int argc, char *argv[ ], char **env)`才是UNIX和Linux中的标准写法。  
argc: 整数,用来统计你运行程序时送给main函数的命令行参数的个数   
*argv[ ]: 指针数组，用来存放指向你的字符串参数的指针，每一个元素指向一个参数  
argv[0] 指向程序运行的全路径名  
argv[1] 指向在DOS命令行中执行程序名后的第一个字符串  
argv[2] 指向执行程序名后的第二个字符串  
...   
argv[argc]为NULL。   
**env:字符串数组。env[ ]的每一个元素都包含ENVVAR=value形式的字符串。其中ENVVAR为环境变量，value 为ENVVAR的对应值。   
argc, argv,env是在main( )函数之前被赋值的，编译器生成的可执行文件，main( )不是真正的入口点，而是一个标准的函数,这个函数名与具体的操作系统有关。

---

读取主函数参数
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

此段大概用来检查参数是否准确,以及将在`start.sh`中传入的参数用变量名表示.  
在3d仿真比赛中主要用的是`nao`机器人

---
`string rsg("rsg/agent/nao/nao.rsg");` 
>这个位置在Linux安装robocup环境时的rcsserver3d-0.6.10/data里面.这里主要时nao机器人的躯体类型信息

内容如下:

```
; -*- mode: lisp; -*-

(RSG 0 1)
(
 (importScene rsg/agent/nao/nao_hetero.rsg 0)
)
 
```


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

此段为服务器编程,主要用于和服务器交互信息

---

PutMessage()
=============

```
void PutMessage(const string& msg)
{
    if (msg.empty())
    {
        return;
    }

    // prefix the message with its payload length
    unsigned int len = htonl(msg.size());
    string prefix((const char*)&len,sizeof(unsigned int));
    string str = prefix + msg;
    if ( static_cast<ssize_t>(str.size()) != write(gSocket.getFD(), str.data(), str.size())) {
        LOG_STR("could not put entire message: " + msg);
    }
}
```
`此段用于机器人向服务器传递信息`

PutMonMessage()
=================

```
void PutMonMessage(const string& msg)
{
    if (msg.empty())
    {
        return;
    }

    // prefix the message with its payload length
    unsigned int len = htonl(msg.size());
    string prefix((const char*)&len,sizeof(unsigned int));
    string str = prefix + msg;
    if ( static_cast<ssize_t>(str.size()) != write(mSocket.getFD(), str.data(), str.size())) {
        LOG_STR("could not put entire monitor message: " + msg);
    }
}
```
`此段用于传递监控信息`


GetMessage()
=============

```
bool GetMessage(string& msg)
{
    static char buffer[16 * 1024];

    unsigned int bytesRead = 0;
    while(bytesRead < sizeof(unsigned int))
    {
        SelectInput();
        int readResult = read(gSocket.getFD(), buffer + bytesRead, sizeof(unsigned int) - bytesRead);
        if(readResult < 0)
            continue;
        if (readResult == 0) {
            // [patmac] Kill ourselves if we disconnect from the server
            // for instance when the server is killed.  This helps to
            // prevent runaway agents.
            cerr << "Lost connection to server" << endl;
            Done();
            exit(1);
        }
        bytesRead += readResult;
    }

    //cerr << "buffer = |" << string(buffer+1) << "|\n";
    //cerr << "bytesRead = |" << bytesRead << "|\n";
    //cerr << "Size of buffer = |" << sizeof(buffer) << "|\n";
    //cerr << "buffer = |" << buffer << "|\n";
    //cerr << "buffer[5] = |" << buffer[5] << "|\n";
    //printf ("xxx-%s\n", buffer+5);

    // msg is prefixed with it's total length
    union int_char_t {
        char *c;
        unsigned int *i;
    };
    int_char_t size;
    size.c = buffer;
    unsigned int msgLen = ntohl(*(size.i));
    // cerr << "GM 6 / " << msgLen << " (bytesRead " << bytesRead << ")\n";
    if(sizeof(unsigned int) + msgLen > sizeof(buffer)) {
        cerr << "too long message; aborting" << endl;
        abort();
    }

    // read remaining message segments
    unsigned int msgRead = bytesRead - sizeof(unsigned int);

    //cerr << "msgRead = |" << msgRead << "|\n";

    char *offset = buffer + bytesRead;

    while (msgRead < msgLen)
    {
        if (! SelectInput())
        {
            return false;
        }

        unsigned readLen = sizeof(buffer) - msgRead;
        if(readLen > msgLen - msgRead)
            readLen = msgLen - msgRead;

        int readResult = read(gSocket.getFD(), offset, readLen);
        if(readResult < 0)
            continue;
        msgRead += readResult;
        offset += readResult;
        //cerr << "msgRead = |" << msgRead << "|\n";
    }

    // zero terminate received data
    (*offset) = 0;

    msg = string(buffer+sizeof(unsigned int));

    // DEBUG
    //cout << msg << endl;

    static string lastMsg = "";
    if (msg.compare(lastMsg) == 0) {
        cerr << "Duplicate message received from server -- has the server killed us?\n";
        Done();
        exit(1);
    }
    lastMsg = msg;

    return true;
}
```
`此段用于获取服务器信息`

载入机器人参数
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

运行
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

以下为机器人运行的主要循环  
机器人不断从服务器获取信息`GetMessage(msg);`   
机器人进行思考和运动`msgToServer.append("(syn)");`  
机器人向服务器传递信息`PutMessage(msgToServer);`

```
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
```


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

`这里主要是一些结束时,断开服务器的操作`

start.sh文件
============
{% highlight ruby %}
#!/bin/bash
#
# UT Austin Villa start script for 3D Simulation Competitions
#


AGENT_BINARY=agentspark
BINARY_DIR="."
LIBS_DIR="./libs"
NUM_PLAYERS=3

team="UTAustinVilla_Base"
host="localhost"
port=3100
paramsfile=paramfiles/defaultParams.txt
mhost="localhost"


export LD_LIBRARY_PATH=$LIBS_DIR:$LD_LIBRARY_PATH


usage()
{
  (echo "Usage: $0 [options]"
   echo "Available options:"
   echo "  --help                       prints this"
   echo "  HOST                         specifies server host (default: localhost)"
   echo "  -p, --port PORT              specifies server port (default: 3100)"
   echo "  -t, --team TEAMNAME          specifies team name"
   echo "  -mh, --mhost HOST            IP of the monitor for sending draw commands (default: localhost)"
   echo "  -pf, --paramsfile FILENAME   name of a parameters file to be loaded (default: paramfiles/defaultParams.txt)") 1>&2
}


fParsedHost=false
paramsfile_args="--paramsfile ${paramsfile}"

while [ $# -gt 0 ]
do
  case $1 in

    --help)
      usage
      exit 0
      ;;

    -mh|--mhost)
      if [ $# -lt 2 ]; then
        usage
        exit 1
      fi
      mhost="${2}"
      shift 1
      ;;

    -p|--port)
      if [ $# -lt 2 ]; then
        usage
        exit 1
      fi
      port="${2}"
      shift 1
      ;;

    -t|--team)
      if [ $# -lt 2 ]; then
        usage
        exit 1
      fi
      team="${2}"
      shift 1
      ;;

    -pf|--paramsfile)
      if [ $# -lt 2 ]; then
        usage
        exit 1
      fi
      DIR_PARAMS="$( cd "$( dirname "$2" )" && pwd )"
      PARAMS_FILE=$DIR_PARAMS/$(basename $2)
      paramsfile_args="${paramsfile_args} --paramsfile ${PARAMS_FILE}"
      shift 1
      ;;
    *)
      if $fParsedHost;
      then
        echo 1>&2
        echo "invalid option \"${1}\"." 1>&2
        echo 1>&2
        usage
        exit 1
      else
        host="${1}"
	fParsedHost=true
      fi
      ;;
  esac

  shift 1
done

opt="${opt} --host=${host} --port ${port} --team ${team} ${paramsfile_args} --mhost=${mhost}"

DIR="$( cd "$( dirname "$0" )" && pwd )" 
cd $DIR

for ((i=1;i<=$NUM_PLAYERS;i++)); do
    case $i in
	1|2)
	    echo "Running agent No. $i -- Type 0"
	    "$BINARY_DIR/$AGENT_BINARY" $opt --unum $i --type 0 --paramsfile paramfiles/defaultParams_t0.txt &#> /dev/null &
	    #"$BINARY_DIR/$AGENT_BINARY" $opt --unum $i --type 0 --paramsfile paramfiles/defaultParams_t0.txt > stdout$i 2> stderr$i &
	    ;;
	3|4)
	    echo "Running agent No. $i -- Type 1"
	    "$BINARY_DIR/$AGENT_BINARY" $opt --unum $i --type 1 --paramsfile paramfiles/defaultParams_t1.txt &#>  /dev/null &
	    #"$BINARY_DIR/$AGENT_BINARY" $opt --unum $i --type 1 --paramsfile paramfiles/defaultParams_t1.txt > stdout$i 2> stderr$i &
	    ;;
	5|6)
	    echo "Running agent No. $i -- Type 2"
	    "$BINARY_DIR/$AGENT_BINARY" $opt --unum $i --type 2 --paramsfile paramfiles/defaultParams_t2.txt &#> /dev/null &
	    #"$BINARY_DIR/$AGENT_BINARY" $opt --unum $i --type 2 --paramsfile paramfiles/defaultParams_t2.txt > stdout$i 2> stderr$i &
	    ;;
	7|8)
	    echo "Running agent No. $i -- Type 3"
	    "$BINARY_DIR/$AGENT_BINARY" $opt --unum $i --type 3 --paramsfile paramfiles/defaultParams_t3.txt &#> /dev/null &
	    #"$BINARY_DIR/$AGENT_BINARY" $opt --unum $i --type 3 --paramsfile paramfiles/defaultParams_t3.txt > stdout$i 2> stderr$i &
	    ;;
	*)
	    echo "Running agent No. $i -- Type 4"
	    "$BINARY_DIR/$AGENT_BINARY" $opt --unum $i --type 4 --paramsfile paramfiles/defaultParams_t4.txt &#> /dev/null &
	    #"$BINARY_DIR/$AGENT_BINARY" $opt --unum $i --type 4 --paramsfile paramfiles/defaultParams_t4.txt > stdout$i 2> stderr$i &
	    ;;
	
    esac
    sleep 1
done
{% endhighlight %}

`"$BINARY_DIR/$AGENT_BINARY" $opt --unum $i --type 0 --paramsfile paramfiles/defaultParams_t0.txt &#> /dev/null &`调用1或者2编号的机器人时的语句
>其中`"$BINARY_DIR/$AGENT_BINARY"`指的是生成的`agentspark`二进制文件,这里面有机器人的动作,策略等一系列的信息.   
由此可见,`agentspark`的参数分别为`host`(默认为localhost),`port`(默认为3100),`team`(队伍名字),`paramsfile_args`(机器人参数文件),`mhost`(默认localhost),`i`(即队员的编号).


