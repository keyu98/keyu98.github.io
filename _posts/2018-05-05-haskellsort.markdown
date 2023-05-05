---
layout: post
title:  "Sorting Algorithms in Haskell"
date:   2018-10-21 20:48:12
---

---

Insert Sort
=======
{% highlight ruby %}
select :: Int -> [Int] -> [Int]
select x [] = [x]
select x (y:ys)
        | x < y = x:y:ys
        | otherwise = y : delete x ys

insertSort :: [Int] -> [Int]
insertSort [] = []
insertSort (x:xs) = delete x (insertSort xs)
{% endhighlight %}

Merge Sort
=======
{% highlight ruby %}
merge :: [Int] -> [Int] -> [Int]
merge xs [] = xs
merge [] ys = ys
merge (x:xs) (y:ys)
        | x > y = y:merge (x:xs) ys
        | otherwise = x:merge xs (y:ys)

mergeSort :: [Int] -> [Int]
mergeSort [] = []
mergeSort [x] = [x]
mergeSort list = merge (mergeSort a) (mergeSort b)
       where 
           (a,b) = splitAt (div (length list)2) list
{% endhighlight %}

Quick Sort
=======
{% highlight ruby %}
quickSort :: [Int] -> [Int]
quickSort [] = []
quickSort (x:xs) = quickSort [a|a<-xs,a<=x] ++ [x] ++ quickSort [a|a<-xs,a>x]
{% endhighlight %}

Bubble Sort
=======
{% highlight ruby %}
swaps :: [Int] -> [Int]
swaps [] = []
swaps [x] = [x]
swaps (x1:x2:xs)
       | x1 > x2 = x2 : swaps(x1:xs)
       | otherwise = x1 : swaps(x2:xs)

bubbleSort :: [Int] -> [Int]
bubbleSort xs
           | swaps xs == xs =xs
           | otherwise = bubbleSort $ swaps xs
{% endhighlight %}


Select Sort
======
{% highlight ruby %}
delete :: Int -> [Int] -> [Int]
delete _ [] = []
delete x (y:ys)
           | x == y =ys
           | otherwise = y:delete x ys


selectSort :: [Int] -> [Int]
selectSort [] = []
selectSort xs = mini : selectSort xs'
        where
            mini = minimum xs
            xs' = delete mini xs
{% endhighlight %}


