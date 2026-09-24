# SOURCE — the build prompt Opus 5.5 was given (verbatim)

Fetched 2026-09-24 from the Google Doc linked in the description of youtube.com/watch?v=vUjAgGa8tAU (docs.google.com/document/d/1Bzy_RXuTNeoO1WPorJ3B2HOH6gQYDT_5LRX5RdZHfWg, export?format=txt); identical to the text the CEO pasted the same hour. Only section #1 is kept — #2 (stop-motion) and #3 (code review) are the video's other tests and are not this system.
One edit, made at commit time: the two empty credential lines are replaced by the bracketed note inside the text, because the repository's secret scanner (default rules, no allowlist by policy) reads the second name as the first one's value; line endings are normalised to LF. Nothing else differs from the source.

```text
#1 Instagram analytics


Build me a fully functional competitor content intelligence platform for my niche.
The inspiration is a system created by Jacob Lee that works roughly like this:
It automatically scrapes competitors’ latest short-form content, transcribes each video, analyzes the structure and performance, and rebuilds a dashboard showing what is actually working. Each video can be opened to see things like the hook style, individual beats, CTA, performance numbers, and recurring patterns across successful content.
His workflow uses:
* Apify for scraping
* Scribe for transcription
* AI for content analysis and scoring
I want you to take this idea and build the best version of it you can.
My niche
My content is primarily about:
* AI
* AI coding
* Vibe coding
* Claude / Codex / OpenAI and other AI models
* AI agents
* Building apps with AI
* Making money / building businesses with AI
Competitors
Use the following accounts as the initial competitor set:
* @mavgpt
* @charliehills
* @ty.buildssites
* @patsunrick
* @bendoesecome
* @jiannacapri
* @brodyautomates
* @nateherkai
* @raycfu
* @sabrina_ramanov
* @realrobertgutierrez
* @jasoncooperson
* @bobbymarshx
* @gregisenberg
* @cindiezhu
* @opusjake
* @thad.codes
* @shedoesai
Treat these as the default accounts to analyze, while still allowing me to add or remove competitors later.
The platform should automatically analyze their content and use the resulting dataset to identify what is working across my niche.
Core functionality
At minimum, I should be able to:
1. Add and remove competitor accounts.
2. Scrape their recent short-form videos.
3. Pull as much useful metadata as possible, such as:
   * views
   * likes
   * comments
   * shares if available
   * upload date
   * caption
   * duration
   * URL
4. Transcribe each video.
5. Use AI to deeply analyze each piece of content.
For every video, I want useful analysis such as:
* Hook
* Hook type / taxonomy
* Core topic
* Main angle
* Content format
* Structure
* Beat-by-beat breakdown
* Curiosity gaps
* Open loops
* Pattern interrupts
* Value proposition
* Emotional triggers
* CTA
* Why the video may have performed well
* What could be replicated without simply copying the creator
Create your own additional analysis fields if you believe they would make the product more useful.
Performance intelligence
Do not simply show raw view counts.
Try to determine which videos genuinely overperformed for each creator relative to their normal performance.
For example, a creator who normally gets 20,000 views getting 200,000 views is potentially much more interesting than a creator who normally gets 1 million views getting 1.2 million.
Develop a sensible scoring methodology for identifying breakout content.
Use the available data intelligently.
Pattern discovery
This is one of the most important parts of the application.
I want the system to identify patterns across successful videos rather than forcing me to manually watch everything.
For example:
* Hook types consistently outperforming
* Topics gaining traction
* Repeated formats
* Similar opening sentences
* Common video structures
* High-performing CTAs
* Emerging trends
* Topics that appear to be accelerating
* Content gaps competitors are not covering
Build a useful hook taxonomy and automatically classify content into it.
The dashboard should help me go from:
"I have 100 competitor videos to watch"
to:
"These are the 5 patterns that currently matter."
Viral Script Generator
This is the feature I care about most.
Using ALL of the competitor data and patterns the platform has collected, add a feature that generates an original short-form video script for me.
The objective is:
Generate the script that the system believes has the highest probability of performing well in my niche based on the available evidence.
Do not simply remix or copy one competitor's video.
Instead:
1. Analyze the dataset.
2. Identify the strongest current opportunities.
3. Select a topic.
4. Select a hook style.
5. Select an angle.
6. Select an optimal structure.
7. Generate an original script using those insights.
The generated script should feel like something a real creator would actually say — concise, conversational and optimized for short-form retention.
Alongside the script, explain:
* Why this topic was selected
* Why this hook was selected
* What patterns in the dataset influenced it
* Which evidence suggests it could perform well
* The recommended title/on-screen hook
* Suggested video length
* Suggested CTA
Where possible, cite the competitor videos/data points that influenced the decision.
Dashboard
The dashboard is a major part of this product.
Make it polished, fast and genuinely useful rather than simply displaying database rows.
I should be able to quickly see things like:
* Recent competitor videos
* Top-performing videos
* Biggest outliers
* Trending topics
* Trending hooks
* Hook categories
* Competitor comparisons
* Emerging patterns
* Recommended opportunities
* Generated script
Include filtering, sorting and useful visualizations where appropriate.
Clicking a video should open a detailed analysis view.
Design the UI yourself based on what would make this easiest to use as a content creator.
Automation
Ideally the system should be designed so that competitor data can be refreshed automatically and the dashboard updates as new content is discovered.
If there are limitations in the APIs or scraping infrastructure, solve around them intelligently rather than removing major functionality.
API credentials
Use environment variables and never expose API keys in the frontend.
[two credential lines here in the source, APIFY_API_TOKEN and ELEVENLABS_API_KEY, both left empty]

Use this for transcription
If an API, endpoint, package, or service behaves differently from what you expect, investigate it and find a working solution.
Important
You have autonomy over the architecture, database, interface, analysis methodology and implementation.
Use your own intelligence and reasoning for the research, analysis, scoring and product decisions required to make the tool useful. Do not rely on additional external AI research services unless they are genuinely required for basic functionality.
Do not constantly ask me what you should do next.
Make sensible product decisions yourself.
Do not build a superficial mockup where buttons do nothing. Prioritize a genuinely working end-to-end product.
If something cannot be implemented exactly as described, find the closest practical solution and keep moving.
You are being evaluated not only on the quality of the final application, but also on:
* Initiative
* Problem solving
* Product judgment
* Ability to work with unfamiliar APIs
* Quality of analysis
* UI/UX
* Reliability
* How well the generated script uses the underlying data
The final result should feel like a tool I could actually use every week to decide what content I should make next.
```
