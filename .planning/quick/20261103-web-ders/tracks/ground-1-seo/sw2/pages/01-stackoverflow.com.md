- type: POST
  author: Alejandro Juárez
  score: 1
  accepted: ''
  text: >-
    Chart.js animate chart after clicking a button


    I’m creating a radar chart using Chart.js. I want to start the animation when you click a button from the menu.
    Right now it starts when you load the site. 


    Here is the actual script:


    var radarChartData = {
        labels : ["Html5","Responsive","LESS","SASS","JavaScript","WordPress","Git","WebGL","LAMP","CSS3","User Interface Design","SEO","Web applications"],
        datasets : [{
            fillColor : "rgba(255,255,255,0.5)",
            strokeColor : "rgba(250,250,250,1)",
            pointColor : "rgba(255,255,255,1)",
            pointStrokeColor : "#fff",              
            data : [100,100,80,80,80,70,50,30,100,100,80,70,70]
        }]          
    }


    var myRadar = new Chart(document.getElementById("skill-radar").getContext("2d"))
        .Radar(radarChartData, {
            scaleShowLabels : true,
            scaleOverride : true,
            scaleSteps : 10,
            scaleStepWidth : 10,
            scaleLineColor : "rgba(250,250,250,.5)",
            angleLineColor : "rgba(250,250,250,.3)",
            scaleFontFamily : "'Exo'",
            scaleFontColor : "#fff",
            scaleFontSize : 10,
            scaleBackdropColor : "rgba(0,0,0,0.75)",
            pointLabelFontFamily : "'Exo'",
            pointLabelFontSize : 16,
            pointLabelFontColor : "#fff",
            animationEasing : "easeOutSine",
            animationSteps : 100,
            pointLabelFontSize : 10
    });


    var chartJsConstruct = function(){

    //..your chart.js invocation with 'new' as shown above

    new Chart(document.getElementById("skill-radar").getContext("2d"))
        .Radar(radarChartData, {
            scaleShowLabels : true,
            scaleOverride : true, 
            scaleSteps : 10, 
            scaleStepWidth : 10, 
            scaleLineColor : "rgba(250,250,250,.5)", 
            angleLineColor : "rgba(250,250,250,.3)", 
            scaleFontFamily : "'Exo'", 
            scaleFontColor : "#fff", scaleFontSize : 10, 
            scaleBackdropColor : "rgba(0,0,0,0.75)", 
            pointLabelFontFamily : "'Exo'", 
            pointLabelFontSize : 16, 
            pointLabelFontColor : "#fff", 
            animationEasing : "easeOutSine", 
            animationSteps : 100, 
            pointLabelFontSize : 10
        });
    };


    var skillsLink = document.getElementById('ui-id-2'); // find the target to add behavior


    // add behavior agnostic of browser

    if (skillsLink.addEventListener){// for Non-IE browsers
        skillsLink.addEventListener('click', chartJsConstruct);
    } else if(skillsLink.attachEvent){// for IE9 and below
        skillsLink.attachEvent('onclick', chartJsConstruct);
    }


    https://stackoverflow.com/questions/21868979/chart-js-animate-chart-after-clicking-a-button
- type: Q-COMMENT
  author: Alejandro Juárez
  score: 0
  accepted: ''
  text: '  > here it is alejuu.com (http://alejuu.com/). What Im tryong to do is to start the animation when you click the skills menu, instead of starting when the website load. Thanks'
- type: Q-COMMENT
  author: Alejandro Juárez
  score: 0
  accepted: ''
  text: '  > The chart is in the skills section'
- type: ANSWER
  author: Vikram
  score: 0
  accepted: ''
  text: >-
    Ok I think I have it. A bit of explanation about what I am trying to achieve here:


    This constructor is what is responsible for configuring and constructing your Chart animation.   

     new Chart(document.getElementById("skill-radar").getContext("2d"))
    .Radar(radarChartData,{
            scaleShowLabels : true
            , scaleOverride : true
            , scaleSteps : 10
            , scaleStepWidth : 10
            , scaleLineColor : "rgba(250,250,250,.5)"
            , angleLineColor : "rgba(250,250,250,.3)"
            , scaleFontFamily : "'Exo'"
            , scaleFontColor : "#fff", scaleFontSize : 10
            , scaleBackdropColor : "rgba(0,0,0,0.75)"
            , pointLabelFontFamily : "'Exo'"
            , pointLabelFontSize : 16
            , pointLabelFontColor : "#fff"
            , animationEasing : "easeOutSine"
            , animationSteps : 100
            , pointLabelFontSize : 10});

    Each time you call the above your animation will be shown. We require a reference to function that can call it each
    time without having to type the cumbersome string above. Javascript lets you do it by wrapping it in a function and
    creating a function expression like this:


    var chartJsConstruct = function(){
                             //..your chart.js invocation with 'new' as shown above
                            };

    Now you can bind it to any action in your code to run the animation like this:


    var skillsLink = document.getElementById('ui-id-2'); // find the target to add behavior


    // add behavior agnostic of browser

    if (skillsLink.addEventListener){// for Non-IE browsers
       skillsLink.addEventListener('click', chartJsConstruct);
    }else if(skillsLink.attachEvent){// for IE9 and below
       skillsLink.attachEvent('onclick', chartJsConstruct);
    }


    This should reload the chart.js animation everytime you click on "Skills" link. Let me know how it goes
- type: A-COMMENT
  author: Vikram
  score: 0
  accepted: ''
  text: '  > @AlejandroJuárez If I open alejuu.com and copy the code the animation happens everytime I click skills link...Can you open your webpage and run that code in the console?'
- type: A-COMMENT
  author: Alejandro Juárez
  score: 0
  accepted: ''
  text: '  > oh your right, but I already paste it inside the script that I created to load the chart , called radarskills.js and doesnt work also I try to paste in the head section, and at least I paste it in the chart.min.js and also doesn’t work, its weird'
- type: A-COMMENT
  author: Vikram
  score: 0
  accepted: ''
  text: '  > @AlejandroJuárez you can create a `<script>` tag like this `<script type="text/javascript">..put code here...</script>` and put code between tags....ensure that this `<script>` tag is defined only after `chart.js` `<script>` tags or you will see a bunch of `undefined` errors in the console.'
- type: A-COMMENT
  author: Alejandro Juárez
  score: 0
  accepted: ''
  text: '  > Thanks!, I tried allready and the chart load but still doesnt do it when u click the button'

