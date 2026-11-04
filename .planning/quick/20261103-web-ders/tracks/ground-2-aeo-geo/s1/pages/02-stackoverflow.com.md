- type: POST
  author: Mike th
  score: 0
  accepted: ''
  text: >-
    Random Binary Tree, prove that the height is O(logn) with high probability


    I am now stuck two days at this exercise from my professor:


    "Consider the ordered binary tree over a set S ⊆ ℕ, built by repeated insertion, where the elements of S are
    inserted by a permutation picked uniformly at random. Prove that the height of the tree is O(logn) with high
    propability."


    My work so far has been to study about the propabilistic analysis of random algorithms. For example, CLSR book has a
    chapter "12.4 Randomly built binary search trees" where its proven that the expected height of a binary tree built
    by repeated insertion over a random permutation is O(logn). Many other books prove this bound. But this is not what
    we are looking for. We want to prove a way stronger bound; that the height is O(logn) with high propability. I've
    studied the classic paper "A Note on the Height of Binary Search Trees, Luc Devroye, 1986" where he proves that the
    height is ~ 4.31107... logn , with high probability. But the analysis is way out of my league. I couldn't understand
    the logic of key points in the paper.


    Every book and article i've seen uses the citation of Devroye's paper, and says "it can also be proven that with
    high probability the height is O(logn)".


    How should I proceed further?


    Thanks in advance.


    https://stackoverflow.com/questions/72665931/random-binary-tree-prove-that-the-height-is-ologn-with-high-probability
- type: ANSWER
  author: btilly
  score: 0
  accepted: ''
  text: >-
    I will outline my best idea based on well-known probability results.  You will need to add details and make it
    rigorous.


    First let's consider the process of descending down pivots to a random node in a binary tree.  Suppose that your
    random node is known to be somewhere between `i` and `i+m-1`.  At the next step which adds to the length of the
    path, you will pick a number `j` in that range.  With probability `(j-1)/m` our random node is now in a range of
    length `j`.  With probability `1/m` it was `j`.  And with probability `(m-j-1)/m` it was above `j` and is now in a
    range of length `(m-j-i)`.  Within those ranges, the unknown node is evenly distributed.


    The obvious continuous approximation is to go from discrete to continuous.  We pick a random number `x` from `0` to
    `m` to be the next pivot.  With probability of `x/m` we are in a range of size `x`.  With probability of `(m-x)/m`
    we are in a range of size `m-x`.  We have therefore shrunk our factor by a random number `X` that is `x/m` or
    `(m-x)/m`.  The distribution of `X` is known.  And the sequence of samples we take from the continuous approximation
    is independent.


    One more note.  `log(X)` has both an expected value `E` and a variance `V` that can be calculated.  Since `X` is
    always between `0` and `1`, its expected value is negative.


    Now pick `ε` with `0 < ε`.  The outline of the proof is as follows.


    - Show that at each step, the expected error from the discrete to the continuous approximation increases by at most
    `O(1)`.


    - Show that the probability that the sum of `(ε - 1/E) log(n)` samples of `log(X)` fails to be below `-log(n)` is
    `O(1/n)`.


    - Show that the probability that a random node is at depth `(2ε + 1/E) log(n)` or less is `O(1/n)`.


    - Show that the probability of a random permutation has ANY node at depth `(3ε + 1/E) log(n)` is `O(1/log(n))` or
    more.


    Let's go.


    1. Show that at each step, the error from the discrete to the continuous approximation increases by at most `O(1)`.


    The two roundoffs in each step are at most 1.  Any errors carried over from the previous step will shrink by a
    random factorThe previous errors from the approximation shrink, but not increase, in the next step.  And the two
    roundoffs are both at most `1`.  So the error increases by at most `2`.


    2. Show that the probability that the sum of `(ε - 1/E) log(n)` samples of `log(X)` fails to be below `-log(n)` is
    `O(1/n)`.


    The expected value of summing `log(X)` for `(ε - 1/E) log(n)` times is `(ε E - 1) log(n)`.  Since `E` is negative,
    this is below our target.  Now we can use the Bernstein Inequalities
    (https://en.wikipedia.org/wiki/Bernstein_inequalities_(probability_theory)) we can put a bound on the probability of
    being that far from the mean.  This will turn out to be proportional to an exponential in the number of variables.
    Since we have `O(log(n))`, this will be proportional to `1/n`.


    3. Show that the probability that a random node is at depth `(2ε + 1/E) log(n)` or less is `O(1/n)`.


    With probability `1 - O(1/n)`, in `(ε + 1/E) log(n)` steps the continuous approximation has converged to within `1`.
    There were `O(log(n))` steps, and therefore the error between continuous and discrete is at most `O(log(n))`.  (Look
    back to step 1 to see that.) So we just have to show that the odds of failing to go from `O(log(n))` possibilities
    to `1` in `ε log(n)` steps is at most `O(1/n)`.


    This would be implied if we could show that for any given constant `a`, the odds of failing to go from `a k` to `1`
    possibilities in at most `k` steps is a negative exponential in `k`.  (`k` here is `ε log(n)`.)


    For that, let's record a 1 every time we cut the space in half with the next element, and a `0` otherwise.  The
    number of such sequences is `2^k`.  But for any given `a`, if `k` is large enough, then you can't cut the space in
    half more than `k/4` times without reducing the search space to `1`.  note that each time with odds at least `1/2`
    you cut the search space by at least `1/2`.  In `k` steps t ... [truncated]

