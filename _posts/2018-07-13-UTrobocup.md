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

载入参数
========
源码如下

```

/*
 * Read in parameters from inputsFile, which should be formatted
 * with a set of parameters as key value pairs from strings to
 * floats.  The parameter name should be separated from its value
 * with a tab and parameters should be separated from each other
 * with a single newline.  Parameters will be loaded into the
 * namedParams map.
 */
map<string, string> namedParams;
void LoadParams(const string& inputsFile) {
    istream *input;
    ifstream infile;
    istringstream inString;

    infile.open(inputsFile.c_str(), ifstream::in);

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
        std::string str;
        std::getline(*input, str);
        if (str.length() >= 2 && str.substr(0,2) == "/*") {
            fBlockComment = true;
        } else if (str == "*/") {
            fBlockComment = false;
        }
        if(fBlockComment || str == "" || str[0] == '#' ) {
            continue;
        }

        // otherwise parse strings
        stringstream s(str);
        std::string key;
        std::string value;
        std::getline(s, key, '\t');      //read thru tab
        std::getline(s, value);          //read thru newline
        if(value.empty()) {
            continue;
        }
        namedParams[key] = value;
    }

    infile.close();
}

```

