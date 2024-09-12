---
layout: page
title: About
permalink: /about/
---
This is Kyle Zhao(赵柯宇), I'm a software engineer at [tencent](https://tencent.com) on [Git](https://github.com/git/git) and Java Web.

# * Work Experience
## *Software Engineer*
<pre>Tencent          2020.06 ~ now</pre>
SCM, Infra, Web

<hr>

## *Intern*
<pre>Zoom Video Communications, Inc   2019.03 ~ 2019.06</pre>
VOIP, Web

<hr>

# * Open Source
### Some of My Contribution
#### [Git](https://github.com/git/git/commits?author=keyu98)
<details>
<summary>merge: avoid write merge state when unable to write index</summary>
<pre>
Writing the merge state after the index write fails is meaningless and
could potentially cause Git to lose changes.
</pre>
</details>

<details>
<summary>merge-tree.c: allow specifying the merge-base when --stdin is passed</summary>
<pre>
The previous commit added a `--merge-base` option in order to allow
using a specified merge-base for the merge.  Extend the input accepted
by `--stdin` to also allow a specified merge-base with each merge
requested.  For example:

    printf "b3 -- b1 b2" | git merge-tree --stdin

does a merge of b1 and b2, and uses b3 as the merge-base.
</pre>
</details>

<details>
<summary>merge-tree.c: add --merge-base="commit" option</summary>
<pre>
This patch will give our callers more flexibility to use `git merge-tree`,
such as:

    git merge-tree --write-tree --merge-base=branch^ HEAD branch

This does a merge of HEAD and branch, but uses branch^ as the merge-base.

And the reason why using an option flag instead of a positional argument
is to allow additional commits passed to merge-tree to be handled via an
octopus merge in the future.
</pre>
</details>

<details>
<summary>send-pack.c: add config push.useBitmaps</summary>
<pre>
Reachability bitmaps are designed to speed up the "counting objects"
phase of generating a pack during a clone or fetch. They are not
optimized for Git clients sending a small topic branch via "git push".
In some cases (see [1]), using reachability bitmaps during "git push"
can cause significant performance regressions.

Add a new "push.useBitmaps" configuration variable to allow users to
tell "git push" not to use bitmaps. We already have "pack.bitmaps"
that controls the use of bitmaps, but a separate configuration variable
allows the reachability bitmaps to still be used in other areas,
such as "git upload-pack", while disabling it only for "git push".

[1]: https://lore.kernel.org/git/87zhoz8b9o.fsf@evledraar.gmail.com/
</pre>
</details>

#### [JGit](https://gerrithub.io/q/project:eclipse-jgit/jgit+kylezhao)

<details>
<summary>Integrate commit-graph feature</summary>
<pre>
CommitGraph: implement commit-graph writer
CommitGraph: implement commit-graph read
CommitGraph: add core.commitGraph config
GC: Write commit-graph files when gc
CommitGraph: add commit-graph for FileObjectDatabase
CommitGraph: teach ObjectReader to get commit-graph
RevWalk: integrate commit-graph with commit parsing
Ensure FileCommitGraph scans commit-graph file if it already exists
Ensure parsed RevCommitCG has derived data from commit-graph
RevWalk: use generation number to optimize getMergedInto()
</pre>
</details>

<details>
<summary>Optimize RevWalk.getMergedInto()</summary>
<pre>
Transitive Relation Definition:
On the DAG of commit history, if A can reach B, C can reach A, then C
can reach B.

Example:
As is shown in the graph below:

  1 - 2 - 3 - 4 (side)
            \
             5 -  6^ (master) - 7 (topic)

Find out which branches is 2 merged into:
After we calculated that master contains 2, we can mark 6 as TEMP_MARK
to avoid unwanted walks.
When we want to figure out if 2 is merge into the topic, the traversal
path would be [7, 6] instead of [7, 6, 5, 3, 2].

Test:
This change can significantly improve performance for tags.
On a copy of the Linux repository, the command 'git tag --contains
commit' had the following performance improvement:

commit      | Before   | After   | Rel %
47a44d27ca  | 29251ms  | 6687ms  | -77%
90327e7dff  | 21388ms  | 6256ms  | -70%
f85fac0efa  | 11150ms  | 7338ms  | -34%
</pre>
</details>

<details>
<summary>PushCommand: allow users to disable use of bitmaps for push
</summary>
<pre>
Reachability bitmaps are designed to speed up the "counting objects"
phase of generating a pack during a clone or fetch. They are not
optimized for Git clients sending a small topic branch via "git push".
In some cases (see [1]), using reachability bitmaps during "git push"
can cause significant performance regressions.

Add PushCommand#setUseBitmaps(boolean) to allow users to tell "git push"
not to use bitmaps.
</pre>
</details>

<details>
<summary>UploadPack: use allow-any-sha1-in-want configuration</summary>
<pre>
C git 2.11 supports setting the equivalent of RequestPolicy.ANY with
uploadpack.allowAnySHA1InWant[1]. Parse this into TransportConfig and
use it from UploadPack.

Add additional tests for [2] and this change.

We can execute "git clone --filter=blob:none --no-checkout" successfully
with config uploadPack.allowFilter is true. But when we checkout, the
git will fetch other missing objects required by the checkout(this is
why we need this config).

When both uploadPack.allowFilter and uploadPack.allowAnySHA1InWant are
true, jgit will support partial clone. If you are using an extremely
large monorepo, this feature can help. It allows users to work on an
incomplete repo which reduces disk usage.

[1] git/git@f8edeaa
[2] change Id39771a6e42d8082099acde11249306828a053c0
</pre>
</details>

<details>
<summary>PushCommand: allow users to disable use of bitmaps for push</summary>
<pre>
Reachability bitmaps are designed to speed up the "counting objects"
phase of generating a pack during a clone or fetch. They are not
optimized for Git clients sending a small topic branch via "git push".
In some cases (see [1]), using reachability bitmaps during "git push"
can cause significant performance regressions.

Add PushCommand#setUseBitmaps(boolean) to allow users to tell "git push"
not to use bitmaps.

[1]: https://lore.kernel.org/git/87zhoz8b9o.fsf@evledraar.gmail.com/
</pre>
</details>

<details>
<summary>TreeRevFilter: fix wrong stop when the given path disappears</summary>
<pre>
When chgs[i] == adds[i], it indicated that a commit added some files
that pList[i] did not have, but didn't mean pList[i] is "empty tree
root".

Follow the example below:

.                           .
└── src                     └── src
    └── d1          ==>          └── d1
        └─ file1                    ├─  file1
                                    └── file2
   c.parents[i]                   c

The variable chg[i] equals to variable add[i],
but commit c.parents[i] is not "empty tree root".

We should add an additional check for no paths matching the filter.
</pre>
</details>




### Award
- [Google Open Source Peer Bonus Award 2023](https://opensource.googleblog.com/2023/05/google-open-source-peer-bonus-program-announces-first-group-of-winners-2023.html)









