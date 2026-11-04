marionette: deterministic simulation testing library | Lobsters


[**Lobsters**](/ "Lobsters (Current traffic: 0%)")
==================================================

* [Active](/active)
* [Recent](/recent)
* [Comments](/comments)
* [Search](/search)
* [Login](/login)

1. [11](/login)

   [marionette: deterministic simulation testing library](https://github.com/sb2bg/marionette)
   -------------------------------------------------------------------------------------------

   * [zig](/t/zig "Zig programming")[github.com/sb2bg](/origins/github.com%2Fsb2bg)

   via
   [![](/avatars/miro-16.png)](/~miro)
   [miro](/~miro)
   2026-07-31 21:20:59 | 
   caches
   * [Archive.org](https://web.archive.org/web/3/https%3A%2F%2Fgithub.com%2Fsb2bg%2Fmarionette)
   * [Ghostarchive](https://ghostarchive.org/search?term=https%3A%2F%2Fgithub.com%2Fsb2bg%2Fmarionette)
    | 
   [2 comments](#comments-qpamp4)

1. 1. [6](/login "6")

      [![](/avatars/amw-zero-16.png)](/~amw-zero)
      [amw-zero](/~amw-zero)
      [2026-07-31 23:05:47](/c/3mczrk)

      Nice idea to have it be a swappable implementation of an IO type. I know Zig doesn't have effect types, but this is why I've had this feeling that effect types will make DST a lot easier as well.

      1. [1](/login "1")

         [![](/avatars/sullivan-16.png)](/~sullivan)
         [sullivan](/~sullivan)
         [2026-08-02 09:34:40](/c/zcu0zb)

         Interestingly, Effekt essentially compiles effect handlers down to what `std.Io` already is - capability passing. Now, the benefit in Effekt is that it is type-checked. Without that, nondeterminism can sneak in and give somebody a bad day.

         I tried to address that with Marionette Tidy, which is an AST-based linter that checks for common sources of nondeterminism. It is more of an assistant than an oracle, but can catch banned patterns in Zig code that could potentially cost someone an afternoon.

  

[About](/about)
[Tags](/tags)
[Filter](/filters)
[Moderation Log](/moderations)