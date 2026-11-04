Robots.txt pitfalls: what I learned the hard way | Lobsters


[**Lobsters**](/ "Lobsters (Current traffic: 0%)")
==================================================

* [Active](/active)
* [Recent](/recent)
* [Comments](/comments)
* [Search](/search)
* [Login](/login)

1. [16](/login)

   [Robots.txt pitfalls: what I learned the hard way](/s/s6zfxg/robots_txt_pitfalls_what_i_learned_hard)
   -----------------------------------------------------------------------------------------------------

   [☶](#story_text)
   * [browsers](/t/browsers "Web browsers")
   * [web](/t/web "Web development and news")

   authored by
   [![](/avatars/pyeri-16.png)](/~pyeri)
   [pyeri](/~pyeri)
   2024-10-27 00:19:27
    | 
   [14 comments](#comments-s6zfxg)

This applies to sites indexed on Google that hope to gain organic traffic. As an indie blogger and SEO enthusiast, I foolishly updated my robots.txt file to prevent indexing of certain unwanted parts of my site, leading to subtle repercussions that I couldn't have foreseen.

A few days ago, while reading about SEO, I came across the concept of a "crawl budget." Apparently, Google allocates a specific crawl budget to your indexed site, and the more useless content it has to index and store on its servers, the more it affects your site—resulting in delays for new content indexing, favicon updates, and robots.txt crawling.

Being a minimalist and utilitarian, I decided to prevent indexing of the `/uploads/` directory on my site since it mostly contained images used in my articles. I thought blocking this "useless content" would free up more crawling budget for my primary content, i.e., articles. So, I added this directory to my site's robots.txt:

```
# Group 1
User-agent: *
Disallow: /public/
Disallow: /drafts/
Disallow: /theme/
Disallow: /page*
Disallow: /uploads/

Sitemap: https://prahladyeri.github.io/sitemap.xml
```

The way search engines work means there's typically a 5-7 day gap between updating the robots.txt file and crawlers processing it. After about a week, I noticed that my site's favicon disappeared from SERPs on mobile browsers! Instead, there was a bland (empty) icon in its place. That’s when I realized that my favicons also resided in the `/uploads/` directory. After I recently optimized the favicon format by switching from WEBP to PNG, Google was unable to crawl and index the new favicon at all!

Once I realized this mistake, I removed the blocking of `/uploads/` from the robots.txt and requested a recrawl. But who knows how long it will take for Google's systems to sync this change and start showing the site's favicon back in SERPs! Two lessons learned:

1. The robots.txt file is highly sensitive; avoid modifying it if possible.
2. Applying SEO is like steering an extremely large ship or vessel. You pull a lever now, and the ship only moves after several days!

1. 1. [13](/login "13")

      [![](/avatars/spc476-16.png)](/~spc476)
      [spc476](/~spc476)
      [2024-10-27 04:26:55](/c/mmoxj9)

      The line `Disallow: /page*` doesn't do what you think it does. The `robots.txt` standard doesn't specify globs of regexes, but a simple prefix match. So any URL you have that starts with `/page` will, in fact, be read, but those that start with `/page*` (with a literal asterisk) won't.

      1. [2](/login "2")

         [![](/avatars/belak-16.png)](/~belak)
         [belak](/~belak)
         edited
         [2024-10-28 10:52:13](/c/mtwwut)

         Based on the link which was posted below, this appears to be wrong - while the glob is misleading, Google will ignore it, so `/page*` is equivalent to `/page`. Because matches are just a prefix match, this (accidentally) gives the correct behavior here.
      2. [1](/login "1")

         [![](/avatars/pyeri-16.png)](/~pyeri)
         [pyeri](/~pyeri)
         [2024-10-27 06:18:52](/c/pyzomu)

         Thank you, I almost thought there was some issue with it! I am an SEO enthusiast, not an expert. Chatgpt gave me that regex suggestion, it was quite obviously bluffing!

         1. [11](/login "11")

            [![](/avatars/craftyguy-16.png)](/~craftyguy)
            [craftyguy](/~craftyguy)
            [2024-10-27 23:36:15](/c/dqr5ot)

            > Chatgpt gave me that regex suggestion, it was quite obviously bluffing!

            Yeah, maybe we shouldn't unquestionably accept what AI regurgitates...
         2. [7](/login "7")

            [![](/avatars/WilhelmVonWeiner-16.png)](/~WilhelmVonWeiner)
            [WilhelmVonWeiner](/~WilhelmVonWeiner)
            [2024-10-27 06:40:14](/c/recmgc)

            This how Google interprets the spec: [link](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt). It probably provides more detail than ChatGPT could anyway
      3. [1](/login "1")

         [![](/avatars/andyc-16.png)](/~andyc)
         [andyc](/~andyc)
         [2024-11-14 09:56:28](/c/0oalwk)

         [I went to update my robots.txt, and this page was auto-completed in my browser]

         This doesn't appear to be true, the `*` and `$` metacharacter are standardized:

         <https://datatracker.ietf.org/doc/html/rfc9309#name-special-characters>

         and supported by Google:

         <https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt>

         So `/page*` is equivalent to `/page`, it's not a literal asterisk

         1. [1](/login "1")

            [![](/avatars/spc476-16.png)](/~spc476)
            [spc476](/~spc476)
            [2024-11-14 16:38:30](/c/db87j4)

            Huh. I didn't know about the RFC (from September of 2022). It only took about 30 years to become one, and whoever runs <http://www.robotstxt.org/about.html> should update their site. But given my experiences with web bots, this just complicates the implementation and I doubt the '\*' will ever be parsed correctly in the majority of bots that even follow `robots.txt`.

            1. [1](/login "1")

               [![](/avatars/andyc-16.png)](/~andyc)
               [andyc](/~andyc)
               edited
               [2024-11-14 23:15:54](/c/veluc1)

               Well I will find out, because I just changed my robots.txt to use wildcards :-) We'll see if the traffic from the dozens and dozens of bots drops

               I wouldn't be that surprised if it does, because I bet Google has had this extension forever, and they just got around to standardizing it

               And there is an incentive for other crawlers to understand the format -- because crawling is expensive and you don't want to waste money crawling stuff that is not interesting. There is enough to crawl even if you exclude everything in robots.txt

               ---

               Also I realize I now have a good heuristic for blocking crawlers that don't present a user agent (many of them):

               If an IP address has fetched a page that is disallowed by robots.txt, and reaches a threshold of N per day, then block the IP address. That should get rid of these pesky crawlers -- I think there was an uptick for LLMs

               1. [1](/login "1")

                  [![](/avatars/spc476-16.png)](/~spc476)
                  [spc476](/~spc476)
                  [2024-11-15 00:30:35](/c/mhrdji)

                  I think you are optimistic about this. There was one bot that [had trouble parsing valid HTML](https://boston.conman.org/2019/07/09.1) causing it to generate [a metric buttload of invalid requests](https://boston.conman.org/2019/07/10.1), more than [any other robot](https://boston.conman.org/2019/07/11.1). It would be interesting to see what results you have with MJ12---they might have improved since they [blocked their crawler from my sites](https://boston.conman.org/2019/07/12.1). If "crawling is expensive" you would think they would at least try to make valid requests.

                  1. [1](/login "1")

                     [![](/avatars/andyc-16.png)](/~andyc)
                     [andyc](/~andyc)
                     [2024-11-15 09:17:58](/c/afwnjs)

                     Yeah all those bots are the same ones I see... I don't think anything bad will happen if I block the IPs of the ones doing the most abusive crawling, and that are not respecting the robots.txt wildcards

                     There are tons of bots that don't identify themselves -- they are pretending to be a Mozilla browser

                     (Funny thing: only reason I am fixing this is because [Dreamhost FastCGI broke](https://www.oilshell.org/blog/2024/06/cgi.html), so I'm using plain CGI. But crawling CGI is expensive!)

                     ---

                     At least this one has a decent explanation, although if I blocked it entirely, I'm sure nobody would care:

                     <https://www.mj12bot.com/>

                     I suspect these are the same robots.txt extensions, and they must be very old if they came from Yahoo!

                     > Simple pattern matching in Disallow directives compatible with Yahoo's wildcard specification
                  2. [1](/login "1")

                     [![](/avatars/andyc-16.png)](/~andyc)
                     [andyc](/~andyc)
                     edited
                     [2024-11-18 10:38:43](/c/i23y0p)

                     BTW this seems to have worked already, after disallowing `.wwz` here with a wildcard:

                     <https://www.oilshell.org/robots.txt>

                     ```
                     User-agent: *
                     Disallow: /release/*/*.wwz
                     ```

                     then I have sharply declining traffic:

                     ```
                     $ zcat access.log.2024-11-13.gz |fgrep -c .wwz
                     47960

                     $ zcat access.log.2024-11-14.gz |fgrep -c .wwz
                     18442

                     $ zcat access.log.2024-11-15.gz |fgrep -c .wwz
                     7175

                     $ fgrep -c '.wwz' access.log.2024-11-16
                     2880

                     $ fgrep -c '.wwz' access.log.2024-11-17
                     401
                     ```

                     The only other time I modified robots.txt was 10+ years ago, when the Bing crawler was sorta DDOS-ing us, and I remember it had a very quick and very large effect then too.

                     The fact that some crawlers are poorly coded is a different issue -- what matters is the ones that send the most traffic. And I think they all follow what Yahoo/Google did.

                     In this case I'm trying to stop them from crawling CGI scripts, because they are expensive, and it's basically archived testdata that nobody wants to see
   2. [9](/login "9")

      [![](/avatars/hanno-16.png)](/~hanno)
      [hanno](/~hanno)
      [2024-10-27 10:38:09](/c/esx5wp)

      I mean...
      In the end, you figured out that if you block Google from accessing your favicon, it won't see your favicon. That sounds pretty unsurprising.

      For what it's worth, I hadn't heard of a "Crawl Budget" before, but here's what Google says:
      <https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget>

      > Large sites (1 million+ unique pages) with content that changes moderately often (once a week)
      > Medium or larger sites (10,000+ unique pages) with very rapidly changing content (daily)
      > Sites with a large portion of their total URLs classified by Search Console as Discovered - currently not indexed

      I think there are very few pages that would be affected by the first two criteria. The third you'll notice in your search console (and I guess the advice here is, if you care about SEO, watch your search console, which is, of course, also entirely unsurprising). So I guess "Crawl Budget" is not something to worry about for most web pages.

      1. [2](/login "2")

         [![](/avatars/eeue56-16.png)](/~eeue56)
         [eeue56](/~eeue56)
         [2024-10-27 12:01:27](/c/jsbqd1)

         In my personal experience at work[0], I've found that all the big search engines (and now LLM providers) are pretty cagey with exactly how SEO works, and what they state isn't always how it works in reality. There's plenty of stuff in the [sitemap spec](https://www.sitemaps.org/protocol.html) which is basically ignored, because search engines have realized people are gaming things, or just bad at labelling things correctly.

         We've even resorted to IP-banning some indexing bots from certain paths. Particularly bots in the LLM space, because they weren't respecting robots.txt. I think what's worked best for us is to make sure we have good metrics on what bots are hitting us, when, and traffic coming from users via search engines. That helped us figure out when having separate pages made sense, etc.

         [0] - Norway + Sweden's biggest news media company

         1. [1](/login "1")

            [![](/avatars/Forty-Bot-16.png)](/~Forty-Bot)
            [Forty-Bot](/~Forty-Bot)
            [2024-10-27 12:17:20](/c/gcy5yf)

            > We’ve even resorted to IP-banning some indexing bots from certain paths. Particularly bots in the LLM space, because they weren’t respecting robots.txt.

            My experience as well. Fortunately, IP bans work quite well.

  

[About](/about)
[Tags](/tags)
[Filter](/filters)
[Moderation Log](/moderations)