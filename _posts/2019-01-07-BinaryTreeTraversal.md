---
layout: post
title:  "二叉树遍历"
subtitle: "Traversal of Binary Tree"
header-img: "img/post-bg-os-metro.jpg"
tag: 
    - 数据结构
---
**目录**
* content
{:toc}

设一个二叉树节点的树根为V，左右孩子分别为L，R。  
按照某种次序访问树中的节点，每个节点被访问恰好一次。由局部根节点访问的次序可以分为3种遍历方式。
* 先序遍历 V->L->R
* 中序遍历 L->V->R 
* 后序遍历 L->R->V

# 先序遍历

## 递归实现

```cpp
template <typename T,typename VST>
void traverse(BinNodePosi(T) x,VST &visit){
    if (!x) return;
    visit(x->data);
    traverse(x->lChild,visit);
    traverse(x->rChild,visit);
}
```

## 迭代实现
* 在递归遍历中，每一个递归实例尽管只对应于一帧，但是因为它们必须具有通用格式，所以并不能做到足够小。我们完全可以使得每一帧做到足够小，尽管从big O意义上讲每一帧都可以看作一个常数，但是差异依旧巨大，所以很有必要改为迭代形式。
* 通过引入栈来实现

### 方式1  
```cpp
template <typename T,typename VST>
void travPre_I1(BinNodePosi(T) x,VST &visit){
    Stack <BinBodePosi(T)> S;//辅助栈
    if (x) S.push(x); //根节点入栈
    while (!S.empty()){//当栈不为空时
        x = S.pop(); visit(x->data);//弹出并访问
        /**
         *先检查右孩子，先入后出
         *如果有右孩子，则右孩子入栈
         *如果有左孩子，则左孩子入栈
         */
        if(HasRChild(*x)) S.push(x->rChild);
        if(HasLChild(*x)) S.push(x->lChild);
    }
}
```


### 方式2
* 对于任何一个子树，对于先序遍历来说，一旦树根节点被访问，那么接下来访问的就是它的左孩子，以及左孩子的左孩子，直到左孩子的分支到尽头。
* 我们可以沿着这个左侧链出发，研究出来新的一种迭代算法

```cpp
/**
 *用于遍历左侧链，并将其右孩子入栈
 */
template <typename T,typename VST>
static void visitAlongLeftBranch(//分摊O(1)
    BinNodePosi(T) x,
    VST & visit,
    Stack <BinNodePosi(T)> &S)
{
    while(x) {
        visit(x->data);//访问当前节点
        S.push(x->rChild);//将右孩子入栈
        x = x->lChild;//沿着左侧链下行
    }
}

template <typename T,typename VST>
void travPre_I2(BinNodePosi(T) x,VST & visit){
    Stack <BinNodePosi(T)> S;//辅助栈
    
    while(true){
        visitAlongLeftBranch(x,visit,S);//访问左侧链
        if(S.empty()) break;//栈空退出
        x = S.pop();//弹出下一子树的根
    }
}
```

# 中序遍历

## 递归实现
```cpp
template <typename T,typename VST>
void traverse(BinNodePosi(T) x,VST &visit){
    if (!x) return;
    traverse(x->lChild,visit);
    visit(x->data);
    traverse(x->rChild,visit);
}
```

## 迭代实现
* 通过观察访问的次序，我们可以发现：
  * 访问从根节点左孩子开始，直到左侧链到底，访问的第一个节点是最后一个不为空的左孩子。
  * 在任一局部，当控制权转给根节点，根节点不会马上访问，它会将控制权谦让给左孩子，直到它的左孩子接受访问后才会继续深入到它的左孩子的右子树中，而接下来才会返回根节点处。

```cpp
/**
 *用于遍历左侧链，将经过的所有节点入栈
 */
template <typename T,typename VST>
static void goAlongLeftBranch(BinNodePosi(T) x,Stack <BinNodePosi(T)> &S)
{
    while(x) {//反复将其左孩子入栈，沿着左分支深入
        S.push(x);
        x = x->lChild;
    }
}

template <typename T,typename VST>
void travIn_I1(BinNodePosi(T) x,V &visit){
    Stack <BinNodePosi(T)> S;//辅助栈
    while(true){
        if (x == NULL) {
            if(S.empty()) break;//若栈为空则结束
            x = S.pop();//弹出
            continue;
        }
        goAlongLeftBranch(x,S);//将左分支全部入栈
        if(S.empty()) break;//若栈为空则结束
        x = S.pop();//弹出
        visit(x->data);//访问
        x = x->rChild;//转向其右子树
    }
}
```

# 后序遍历

## 递归实现
```cpp
template <typename T,typename VST>
void traverse(BinNodePosi(T) x,VST &visit){
    if (!x) return;
    traverse(x->lChild,visit);
    traverse(x->rChild,visit);
    visit(x->data);
}
```

## 迭代实现
* 通过观察访问的次序，我们可以发现：
  * 访问从根节点的左孩子开始，直到左分支的底部，然后再检查左分支底部是否有右孩子，如果有，继续将其右孩子当成根节点再进行当前这一段的步骤。
  * 直到一个节点既没有左分支也没有右分支，那么将访问它。这就是第一个访问的节点。
  * 左子树访问完成后，若右子树为空或者右子树已经访问过，这时候直接访问根节点。

```cpp
template <typename T,typename VST>
void travAft_I1(BinNodePosi(T) x,V &visit){
    Stack <BinNodePosi(T)> S;//辅助栈
    BinNodePosi(T) prev = NULL;
    while (true){
        
        goAlongLeftBranch(x);//将左分支全部入栈
        if(S.empty()) break;//若栈为空则结束
        BinNodePosi(T) x = S.pop();
        if (!HasRChild(*x) || x->RChild == pre){
            //若右子树为空，或者右子树被访问过
            pre = x;//记录
            visit(top->data);//访问
        }
        else{
            x = x->right;//转到右分支
        }
    }
    
}
```

# 层次遍历
* 所有节点按照深度次序，由高到低访问。
* 引入队列来解决

## 迭代实现
```cpp
template <typename T,typename VST>
void travLevel(BinNodePosi(T) x,VST &visit){
    Queue<BinNodePosi(T)> Q;//引入辅助队列
    Q.enqueue(x);//根节点入队
    while(!Q.empty()){//当队列不为空
        BinNodePosi(T) x = Q.dequeue();//队首结点出队
        visit(x->data);//访问
        /**
         *将其左右孩子入队
         */
        if (HasLChild(*x)) Q.enqueue(x->lChild);
        if (HasRChild(*x)) Q.enqueue(x->rChild);
    }
}
```