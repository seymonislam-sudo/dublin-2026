// Always open at the top (stop the browser restoring an old scroll position)
  try{if('scrollRestoration' in history)history.scrollRestoration='manual';}catch(e){}
  (function(){
    function toTop(){if(!location.hash)window.scrollTo(0,0);}
    toTop();
    document.addEventListener('DOMContentLoaded',toTop);
    window.addEventListener('load',function(){toTop();setTimeout(toTop,50);});
    window.addEventListener('pageshow',function(e){if(e.persisted)toTop();});
  })();

(function(){
  var loaded={};
  function load(src,done){if(loaded[src]){done&&done();return;}var s=document.createElement('script');s.src=src;s.async=true;s.onload=function(){loaded[src]=1;done&&done();};document.head.appendChild(s);}
  function apply(keys){var imgs=document.querySelectorAll('[data-craic-image]');imgs.forEach(function(el){var k=el.getAttribute('data-craic-image');if(keys.indexOf(k)<0||!window.CRAIC_IMAGES||!window.CRAIC_IMAGES[k])return;var u=window.CRAIC_IMAGES[k];if(el.tagName.toLowerCase()==='image')el.setAttribute('href',u);else el.src=u;el.removeAttribute('data-craic-image');});}
  function gallery(){load('images/gallery-images.js',function(){apply(['before','after']);});}
  function crew(){load('images/crew-images.js',function(){apply(['f-Seymon','f-Louise','f-Jeff','f-Helen','f-Steve','f-Vicky','seymon-card','louise-card','jeff-card','helen-card','steve-card','vicky-card']);});}
  function extras(){load('images/extra-images.js',function(){apply(['spice','lucky']);});}
  window.CraicImageLoader={gallery:gallery,crew:crew,extras:extras,apply:apply};
  document.addEventListener('DOMContentLoaded',function(){gallery();var crewEl=document.getElementById('crew');if(crewEl&&'IntersectionObserver' in window){var o=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting;})){crew();o.disconnect();}},{rootMargin:'500px'});o.observe(crewEl);}else crew();});
})();
