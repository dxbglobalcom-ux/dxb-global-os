Procedural GL JS: open-source 3D mapping library built with Three.js | Lobsters


[**Lobsters**](/ "Lobsters (Current traffic: 0%)")
==================================================

* [Active](/active)
* [Recent](/recent)
* [Comments](/comments)
* [Search](/search)
* [Login](/login)

1. [6](/login)

   [Procedural GL JS: open-source 3D mapping library built with Three.js](https://github.com/felixpalmer/procedural-gl-js)
   -----------------------------------------------------------------------------------------------------------------------

   * [graphics](/t/graphics "Graphics programming")
   * [javascript](/t/javascript "Javascript programming")
   * [visualization](/t/visualization "Data visualization")
   * [web](/t/web "Web development and news")[github.com/felixpalmer](/origins/github.com%2Ffelixpalmer)

   authored by
   [![](/avatars/pheelicks-16.png)](/~pheelicks)
   [pheelicks](/~pheelicks)
   2020-11-20 12:48:24 | 
   caches
   * [Archive.org](https://web.archive.org/web/3/https%3A%2F%2Fgithub.com%2Ffelixpalmer%2Fprocedural-gl-js)
   * [Ghostarchive](https://ghostarchive.org/search?term=https%3A%2F%2Fgithub.com%2Ffelixpalmer%2Fprocedural-gl-js)
    | 
   [5 comments](#comments-tvk0q4)

1. 1. [1](/login "1")

      [![](/avatars/pheelicks-16.png)](/~pheelicks)
      [pheelicks](/~pheelicks)
      [2020-11-20 12:49:39](/c/tpjydb)

      For the last 7 years I've been working on a WebGL powered mapping library, that I've been providing on a commercial basis via [www.procedural.eu](http://www.procedural.eu). It's been used by millions of users across different products

      I recently decided to change the approach and instead provide a new library on an open-source basis, along with an supporting elevation API ([www.nasadem.xyz](http://www.nasadem.xyz)).

      Procedural GL JS is a complete reworking of the original library, with the following features:

      ```
      * Stream in standard raster imagery tiles. Supports map tiles from a variety of providers
      * Batteries included elevation data. Global 3D data coverage courtesy of nasadem.XYZ
      * Powerful overlay capabilities. Draw crisp markers and lines
      * Well-thought-out API, complex applications can be built without needing to deal with 3D concepts
      * Great UX and intuitive controls, mouse-based on desktop & touch-based on mobile
      * Tiny filesize means library is parsed fast. Package size is less than THREE.js thanks to code stripping
      * Novel GPU powered level-of-detail system. Off-loading to the GPU frees up the main JavaScript UI thread
      ```

      I'm planning a series of blog posts about how it works in the future, but for today it's just the launch. Happy to answer any questions!

      1. [1](/login "1")

         [![](/avatars/pekkavaa-16.png)](/~pekkavaa)
         [pekkavaa](/~pekkavaa)
         [2020-11-20 14:21:56](/c/qmvczg)

         Congrats! The demo runs great and the API does seem simple indeed. With a quick scan I couldn't find the code of the LOD system. I can see you use an array texture to upload the map images in chunks but I presume that's not it?

         1. [1](/login "1")

            [![](/avatars/pheelicks-16.png)](/~pheelicks)
            [pheelicks](/~pheelicks)
            [2020-11-20 14:52:23](/c/kmte1l)

            Correct, the array texture is just an atlas which I write chunks to to avoid having to bind many different textures on each frame. I had a version working with an actual WebGL2 array texture, but switched to an emulation so as to support WebGL1.

            The code is mostly in <https://github.com/felixpalmer/procedural-gl-js/blob/main/src/terrain.js>, however as it is a process that takes place on both the CPU and GPU the code is naturally split over a number of locations. At a high level, every few frames the terrain is rendered to a separate buffer, outputting the texture error and tile ids to a render target. This is then read and processed by the JavaScript code which detects tiles which are the wrong resolution tiles and adjusts them (either splitting them up, or combining them with neighbors)

            1. [1](/login "1")

               [![](/avatars/pekkavaa-16.png)](/~pekkavaa)
               [pekkavaa](/~pekkavaa)
               [2020-11-20 16:34:47](/c/wv25wn)

               Thanks for the explanation. That kind of feedback between CPU and GPU must be difficult to do reliably on WebGL :) Performance-wise, I mean. But it looks like you're doing some manual pipelining there to keep the transfer bandwidth low.

               1. [1](/login "1")

                  [![](/avatars/pheelicks-16.png)](/~pheelicks)
                  [pheelicks](/~pheelicks)
                  [2020-11-20 17:06:18](/c/cmdxin)

                  Yes, it took some time to get working. And still I'm not completely happy, as it sometime stalls the pipeline, due to the fact that the readPixels operation can't be done asyncronously. Thus if prior to the read the command buffer is longer than usual (e.g. a texture upload has just slowed it down), then it leads to a long frame

  

[About](/about)
[Tags](/tags)
[Filter](/filters)
[Moderation Log](/moderations)