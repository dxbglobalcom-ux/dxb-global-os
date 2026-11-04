The Impact of Google's Manifest Version 3 Update on Ad Blocker Effectiveness | Lobsters


[**Lobsters**](/ "Lobsters (Current traffic: 0%)")
==================================================

* [Active](/active)
* [Recent](/recent)
* [Comments](/comments)
* [Search](/search)
* [Login](/login)

1. [32](/login)

   [The Impact of Google's Manifest Version 3 Update on Ad Blocker Effectiveness](https://arxiv.org/abs/2503.01000)
   ----------------------------------------------------------------------------------------------------------------

   * [browsers](/t/browsers "Web browsers")
   * [privacy](/t/privacy "Privacy")[arxiv.org](/domains/arxiv.org)

   via
   [![](/avatars/wonk-16.png)](/~wonk)
   [wonk](/~wonk)
   2026-06-17 02:30:42 | 
   caches
   * [Archive.org](https://web.archive.org/web/3/https%3A%2F%2Farxiv.org%2Fabs%2F2503.01000)
   * [Ghostarchive](https://ghostarchive.org/search?term=https%3A%2F%2Farxiv.org%2Fabs%2F2503.01000)
    | 
   [22 comments](#comments-fxulig)

1. 1. [25](/login "25")

      [![](/avatars/wonk-16.png)](/~wonk)
      [wonk](/~wonk)
      [2026-06-17 02:35:45](/c/z55zrw)

      I learned about this paper via [@lake’s comment](https://lobste.rs/c/i4ouub) and was really surprised to see their key findings, as documented from [their repo](https://github.com/lukic-papadopoulos-research/impact_of_google_mv3_update_on_ad_blocker_effectiveness/tree/c95598f906b9b1f4b1a64143ddd3e31d6bfc4b72), which stated:

      > 1. No significant effectiveness reduction: MV3 ad blockers perform comparably to MV2 versions
      > 2. Improved tracker blocking: Some MV3 versions showed enhanced anti-tracking capabilities
      > 3. Successful adaptation: Ad blocker developers effectively adapted to new API constraints
   2. [18](/login "18")

      [![](/avatars/technomancy-16.png)](/~technomancy)
      [technomancy](/~technomancy)
      [2026-06-17 10:53:17](/c/7gn0jb)

      The uBlock Origin wiki has a page about why it works much better on Firefox than on Chromium-based browsers: <https://github.com/gorhill/uBlock/wiki/uBlock-Origin-works-best-on-Firefox>

      I was surprised to see that Manifest v3 isn't mentioned at all on there. I wonder if it's just that the page is relatively old? But you can see that focusing on Manifest v3 appears to not give you the whole story.

      1. [2](/login "2")

         [![](/avatars/creesch-16.png)](/~creesch)
         [creesch](/~creesch)
         [2026-06-18 03:28:56](/c/8fgyyk)

         At least one of those WebExtension API calls on there is Firefox only. It's one of those interesting but also slightly annoying facts about Firefox's switch to WebExtension as a "standard". They took chromes API, proposed to make it into a [W3C standard](https://github.com/w3c/webextensions), implemented most of it ([not all of it](https://lobste.rs/c/eozjcz)) and also started proposing and introducing new API calls. Some of the latter new API calls seem to have specifically been introduced to allow things that Chrome is not allowing.

         Anyway, there is more specific information about MV3 on the homepage: <https://ublockorigin.com/>

         > **What Was Manifest V3?**
         >
         > Manifest V3 was Google's major update to the Chrome extension platform. The most significant change was replacing the `webRequest` API with the more limited `declarativeNetRequest` API. While Google cited security and performance benefits, this change removed capabilities that content blockers like uBlock Origin relied on for effective ad and tracker blocking.
         >
         > **How This Affected uBlock Origin**
         >
         > uBlock Origin used the `webRequest` API to intercept and block network requests in real-time. The replacement `declarativeNetRequest` API has hard limits on the number of filter rules (previously 30,000, now 330,000) and lacks the dynamic filtering capabilities that made uBlock Origin so effective. As a result, the full uBlock Origin extension was removed from the Chrome Web Store in late 2024. Chrome permanently disabled all remaining MV2 extensions in July 2025.
         >
         > **If You Use Chrome**
         >
         > **uBlock Origin Lite** is available for Chrome. This is a separate extension built specifically for Manifest V3, but it has significant limitations:
         >
         > * Cannot use all filter lists simultaneously (rule limits apply)
         > * No cosmetic filtering in the default mode
         > * No scriptlet injection by default
         > * Limited dynamic filtering capabilities
         > * Requires broader host permissions upfront

         What I gather from this is that blocking ads is still possible, but with limits. Which likely means to in regular usage for an average user there might not be a perceivable difference if all you care about are visible ads. Just speculation on my part though, I haven't gone through the linked study in detail to see if they accounted for this as well.
   3. [15](/login "15")

      [![](/avatars/cole-k-16.png)](/~cole-k)
      [cole-k](/~cole-k)
      [2026-06-17 13:58:03](/c/viwekj)

      I shared this with some friends without thinking/reading much and they made a good observation I wanted to share.

      The results of this study are predicated on their measurements.

      > we evaluated uBlock MV3 and MV2 on a main sample of 1,000 websites across five measurement runs beginning July 12, 2025, and obtained consistent results for 824 websites (i.e., websites with valid data across all five runs; others were excluded due to redirects, anti-automation/ad-blocking, or failed instrumentation).

      Some things to point out here:

      * We need to believe that these 1000 (really 824) websites are a representative sample
      * They call out excluding websites due to "anit-automation/ad-blocking" which is concerning because the whole point is to evaluate the efficacy of ad-blockers.

      I believe this is the list of 1000 websites they checked. <https://github.com/lukic-papadopoulos-research/impact_of_google_mv3_update_on_ad_blocker_effectiveness/blob/c95598f906b9b1f4b1a64143ddd3e31d6bfc4b72/01_data/top_1000_websites_tranco.csv>

      I did some ctrl+f and didn't find e.g. `google.com` or `youtube.com` (the latter was harder to verify because I'm trying to search a CSV on GH on my phone and there are hits for their "youtube" column).

      Those with more time/interest may wish to cross-reference this list. I did see some websites I've visited before in it (and some ad-laden ones, like news sites), although I can't be sure they weren't pruned...

      1. [3](/login "3")

         [![](/avatars/alemi-16.png)](/~alemi)
         [alemi](/~alemi)
         [2026-06-17 17:37:09](/c/bcmlee)

         This paper looks like a sugar coat for the mv2 removal.
      2. [3](/login "3")

         [![](/avatars/lake-16.png)](/~lake)
         [lake](/~lake)
         edited
         [2026-06-17 19:00:34](/c/1emp7m)

         I don't mean to defend the paper -- this post was a result of a comment I wrote, but I was actually curious if someone could look at it more critically -- but I want to point out that the list of websites the researchers used appears to be from an organisation called [Tranco](https://tranco-list.eu/). I hadn't heard of them before, but they do have a downloadable list of top 1M websites measured according to however they measure it (I haven't looked closely). I expect the top 1000 is taken from there, but one could verify.

         > Across five separate measurement runs, we consistently obtained results for 924 of these websites, excluding those that redirected users, deployed ad-blocking prevention or anti-automation mechanisms, or were inaccessible.

         I see why this might cause concern, and maybe there was a better way to do it. But I also see how from their perspective, excluding websites that use anti-adblock could lead to a less clean experiment, if what they're trying is to measure how well adblocking works in situations where websites aren't explicitly hostile to adblocking (as in, "We measure how well MV3 adblockers bypass anti-adblock" is a somewhat different experiment than just measuring how well they block ads).

         Now, sidestepping the paper itself, in my anecdotal experience uBO Lite can usually block ads on YouTube, though I don't use YouTube with uBO Lite that often. Those who do can speak more to that. Similarly, as I observer in an [adjacent thread,](https://lobste.rs/c/lfxwbj) uBO Lite does get rid of anti-adblocking pop-ups for websites (where I've seen them in a browser with a less sophisticated adblock.)

         Either way, it's good to see people dig into it more. Ultimately, it would be best if another research group would try to replicate this. It would also be good to include a Chromium-based browser that still supports MV2 (like [Helium](https://helium.computer/)) in addition to Firefox, to verify results across the two browser engines.
   4. [7](/login "7")

      [![](/avatars/olliej-16.png)](/~olliej)
      [olliej](/~olliej)
      [2026-06-17 19:50:28](/c/zdtfrp)

      I’m unsure what sites they checked, but the majority of websites *do* use statically blockable ads, that’s literally the reason block lists exist. MV3 makes no change to that so why would you be comparing effectiveness?

      The problem is plenty of sites do not, and those ads *cannot* be blocked by static lists. The fact that they report improved coverage implies that they were literally only testing the kinds of ads that are not impacted by the change.

      The entire point of a mv2 vs mv3 comparison should be on the thing that changed, not the thing that remained unchanged.

      The argument is very simple: mv3 breaks a number of ad and tracker blocking mechanisms. An effectiveness comparison should be testing exactly that: can mv3 block the kinds of garbage that mv2 can.

      This entire “study” is seems to be at best incompetence.
   5. [6](/login "6")

      [![](/avatars/inactive-user-16.png)](/~inactive-user)
      [inactive-user](/~inactive-user)
      [2026-06-17 10:56:40](/c/1hqizi)

      Anecdotally this matches my experience. After switching from uBlock Origin to uBlock Origin Lite a year or two ago I haven't noticed any increase in the amount of visible ads. There was a period where YouTube was able to detect the presence of an ad blocker and refused to play videos, which was solved by not watching YouTube until the situation was fixed.

      The only feature I miss is custom persistent element-zapper configuration, which I used to remove non-advertising elements from some domains. The uBOL FAQ says this feature is possible in MV3 but was removed due to the "Lite" extension's focus on efficiency[0] , which is frustrating, because it implies it would be possible to have migrated the non-"Lite" extension to MV3 and then we wouldn't have had to go through all this rigamarole.

      Maybe the solution is a separate extension, focused exclusively on "I want to zap chunks of web pages even if it's slow". There used to be an extension named Stylish that did this (and more), but it was purchased by a spyware company, became spyware, and was removed from the Chrome extension registry.

      [0] <https://github.com/uBlockOrigin/uBOL-home/wiki/Frequently-asked-questions-(FAQ)#is-ubo-lite-a-bad-faith-attempt-at-converting-ubo-to-mv3>

      1. [3](/login "3")

         [![](/avatars/BryceWray-16.png)](/~BryceWray)
         [BryceWray](/~BryceWray)
         [2026-06-17 12:50:00](/c/wk9ixy)

         > Maybe the solution is a separate extension, focused exclusively on "I want to zap chunks of web pages even if it's slow". There used to be an extension named Stylish that did this (and more), but it was purchased by a spyware company, became spyware, and was removed from the Chrome extension registry.

         You might try the (apparently) similar Stylus, which is FOSS:

         <https://github.com/openstyles/stylus/>
      2. [1](/login "1")

         [![](/avatars/sunshowers-16.png)](/~sunshowers)
         [sunshowers](/~sunshowers)
         [2026-06-17 11:47:46](/c/zkq4bm)

         Curious, has anti-adblock blocking gotten worse?

         1. [4](/login "4")

            [![](/avatars/lake-16.png)](/~lake)
            [lake](/~lake)
            [2026-06-17 18:38:07](/c/lfxwbj)

            On my phone (GrapheneOS), I use two browsers, Vanadium (stock browser in GOS, has some ad blocking built-in) and [Helium](https://github.com/jqssun/android-helium-browser), which is a fork of Vanadium that supports extensions. In Vanadium, I sometimes see the "please turn off your ad-blocker" pop-ups [(dickovers?)](https://lobste.rs/s/xsurh7/what_is_dickover). In Helium, where I use uBO Lite, I don't see those when I try the same websites.

            So, in my anecdotal experience, uBO Lite does deal okay with anti-adblock scripts.

            1. [2](/login "2")

               [![](/avatars/sunshowers-16.png)](/~sunshowers)
               [sunshowers](/~sunshowers)
               [2026-06-18 20:10:18](/c/f7tqmu)

               Thanks. That's encouraging for sure, and meaningfully shifts my beliefs.

               I hate anti-adblock modals so much. Just straight up telling users to make their security posture worse.
   6. [5](/login "5")

      [![](/avatars/alurm-16.png)](/~alurm)
      [alurm](/~alurm)
      [2026-06-17 16:03:00](/c/nsoziv)

      My experience: I tried using Chrome with uBlock origin lite some months ago and I did encounter more ads. So I switched to Brave.

      1. [2](/login "2")

         [![](/avatars/wwfn-16.png)](/~wwfn)
         [wwfn](/~wwfn)
         [2026-06-17 16:57:47](/c/sxtzfj)

         why stay with a blink based browser and not firefox, compatability?

         1. [5](/login "5")

            [![](/avatars/alurm-16.png)](/~alurm)
            [alurm](/~alurm)
            edited
            [2026-06-17 18:19:20](/c/dye7hh)

            I wanted tab sync to work, which has forced me to use the same browser on my desktop and on my phone. I found Firefox to drain too much energy on Android compared to alternatives, and sync has failed me two times, I think. There are many other little things which affect the decision of course. I think this is quite individual and hard to argue. At the end of the day it doesn't really matter to me whether it's blink or something else.

            Side note: it's really annoying that Lobsters tries to block Brave, I would appreciate if this website didn't do that. Many features of Lobsters don't work if JavaScript is disabled. I wanted to contribute, but I don't know Ruby or Rails so I gave up, after trying twice in a span of a year.

            1. [1](/login "1")

               [![](/avatars/stilic-16.png)](/~stilic)
               [stilic](/~stilic)
               [2026-06-18 01:41:18](/c/7reiqa)

               They're completely in their right to block Brave.
               The explanation over at <https://github.com/lobsters/lobsters-ansible/issues/45> is a good résumé if you want to know why.

               1. [3](/login "3")

                  [![](/avatars/alurm-16.png)](/~alurm)
                  [alurm](/~alurm)
                  [2026-06-18 10:50:05](/c/wor44u)

                  I'm aware of that resume, yeah. It didn't affect my opinion.
      2. [1](/login "1")

         [![](/avatars/olliej-16.png)](/~olliej)
         [olliej](/~olliej)
         [2026-06-17 19:55:16](/c/gydhbs)

         Switching to brave won’t help: you’re just using a chrome wrapper, and afaict chrome is pulling out the entire mechanism required support mv2 style ad blockers from chromium and blink.

         If you don’t want to use chrome, then don’t use chrome, but understand all those “browsers” that are simply wrapping chrome are going to be stuck doing whatever Google lets them do. It’s exactly what Google did with android: claim one thing, gain monopoly status, then change the rules.

         1. [1](/login "1")

            [![](/avatars/alurm-16.png)](/~alurm)
            [alurm](/~alurm)
            [2026-06-17 20:45:28](/c/iexc95)

            I don't use uBlock origin on Brave, I just use the builtin adblocker. Pretty much all ads are blocked. So it already helped.

            I'm not sure if it's implemented as a MV2 extension under the hood. Perhaps it is, and eventually adblocking will stop working well on Brave, in which case I can switch to something else. But to me that's quite a lot of ifs, especially considering some of the issues I had with Firefox. (There are issues with Brave as well, of course, it's not black-and-white.)

            Sure, being a Chromium fork comes with a dependency on what the upstream does, which may introduce problems (or result in a maintainance burden, etc.), but it also comes with all of the upsides of what Chromium offers.

            1. [2](/login "2")

               [![](/avatars/olliej-16.png)](/~olliej)
               [olliej](/~olliej)
               [2026-06-17 21:27:08](/c/mxay91)

               > I don't use uBlock origin on Brave, I just use the builtin adblocker. Pretty much all ads are blocked. So it already helped.

               If it's blocking ads in YouTube, it's dependent on the support chromium currently has for synchronous blocking of requests, which is only present to support MV2, and to my knowledge is being stripped from chromium.

               It will be interesting to see how long the chrome wrappers continue to try to maintain support for mv2 (or at least mv2 semantics) themselves.

               1. [1](/login "1")

                  [![](/avatars/alurm-16.png)](/~alurm)
                  [alurm](/~alurm)
                  [2026-06-17 21:44:38](/c/ue0ped)

                  I see. Yeah, I wonder how long is it gonna last as well.
   7. [1](/login "1")

      [![](/avatars/riking-16.png)](/~riking)
      [riking](/~riking)
      [2026-06-18 12:58:00](/c/rdiw2z)

      I've been assuming that MV3 unlocks powerful anti-adblock techniques that are being held in reserve until after it's mandatory.

  

[About](/about)
[Tags](/tags)
[Filter](/filters)
[Moderation Log](/moderations)