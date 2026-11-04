- type: POST
  author: Serve Laurijssen
  score: -1
  accepted: ''
  text: |-
    AJX and google SEO

    I've got the following simple page which uses ajax to load pages. 

    <head>
        <script>
        function loadPage(href)
        {
          var xmlhttp = new XMLHttpRequest();
          xmlhttp.open("GET", href, false);
          xmlhttp.send();
          return xmlhttp.responseText;
        }   

        function setHTML(page)
        {
            document.getElementById('content').innerHTML = loadPage(page);
        }
        </script>
    </head>
    <body onload="setHTML('')">
        <div class="menu">  
          <table align="center">
          <tr><td><input type="image" src="img/welcome.png" onClick="setHTML('welcome.html')" /></td></tr>
          <tr><td><input type="image" src="img/ris.png" onClick="setHTML('ris.html')" /></td></tr>
          </table>
        </div>
    </body>

    Does anyone know if this way is good for google SEO? Will googlebot find and parse welcome.html and ris.html?

    https://stackoverflow.com/questions/25080859/ajx-and-google-seo
- type: ANSWER
  author: John Conde
  score: 0
  accepted: 'true'
  text: >-
    Google now supports processing JavaScript
    (http://googlewebmastercentral.blogspot.com/2014/05/understanding-web-pages-better.html) so this should not cause
    any problems.

