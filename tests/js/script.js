tns({
  container: document.querySelector('.customize'),
  items: 3,
  edgePadding: 40,
  controlsContainer: document.querySelector('.customize-tools .controls'),
  navContainer: document.querySelector('.customize-tools .thumbnails'),
  lazyload: true,
});

tns({
  container: document.querySelector('.auto-height'),
  autoHeight: true,
  items: 1,
});

var tt = (function () {
  var my = {}, 
      doc = document,
      div = doc.createElement('div'),
      ul = doc.createElement('ul'),
      li = doc.createElement('li'),
      sliderSetting= {
        'base': {
          container: '',
          items: 3,
          speed: 100,
        },
        'fade': {
          container: '',
          items: 3,
          mode: 'gallery',
          arrowKeys: true,
          // edgePadding: 50,
          speed: 1000,
          gutter: 10,
          animateIn: 'fadeInDown',
          animateOut: 'fadeOutDown',
          animateDelay: 300,
          loop: false,
          // slideBy: 'page',
          // responsive: {
          //   1280: 3,
          //   1706: 4,
          // }
        }, 
        'vertical': {
          container: '',
          items: 2,
          mode: 'carousel',
          axis: 'vertical',
          // arrowKeys: true,
          edgePadding: 50,
          gutter: 10,
          // slideBy: 'page',
          // responsive: {
          //   1280: 3,
          //   1706: 4,
          // }
        }, 
        'responsive': {
          container: '',
          gutter: 10,
          gutterPosition: 'left',
          edgePadding: 50,
          slideBy: 'page',
          speed: 600,
          // arrowKeys: true,
          responsive: {
            600: 2,
            900: 3,
          },
          // rewind: true,
        }, 
        'fixedWidth': {
          container: '',
          gutter: 10,
          edgePadding: 50,
          fixedWidth: 200,
          // arrowKeys: true,
          // rewind: true,
          slideByPage: true,
          loop: false,
        }, 
        'nonLoop': {
          container: '',
          items: 1,
          edgePadding: 50,
          loop: false,
          responsive: {
            800: 2,
            1200: 3,
          }
          // rewind: true,
        }, 
        'slideByPage': {
          container: '',
          items: 3,
          slideByPage: true,
        }, 
        'autoplay': {
          container: '',
          items: 3,
          autoplay: true,
          speed: 300,
          autoplayTimeout: 3000,
          autoplayText: ['▶', '❚❚'],
        }, 
        'arrowKeys': {
          container: '',
          items: 3,
          // edgePadding: 50,
          // arrowKeys: true,
          // slideByPage: true,
        }
      };

  my.createSliderHtml = function () {
    var htmlTemplate = doc.querySelector('.html_template'),
        sliderFragment = doc.createDocumentFragment(),
        docContainer = doc.querySelector('.container'),
        divider = docContainer.querySelector('.divider');

    for (i in sliderSetting) {
      var sd = htmlTemplate.cloneNode(true);
      sd.className = i + '_wrapper';
      sd.querySelector('h2').innerHTML = i;
      sd.querySelector('div').className = sd.querySelector('div').id = i;

      sliderFragment.appendChild(sd);
    }
    docContainer.insertBefore(sliderFragment, divider);
  };

  my.initSliders = function () {
    for (i in sliderSetting) {
      sliderSetting[i].container = doc.querySelector('#' + i);
      tns(sliderSetting[i]);
    }
  };

  return my;
})();

tt.createSliderHtml();
tt.initSliders();

tns().events.on('initialized', function(info) {
  // if (info.container.id === 'vertical') {
    // console.log(info.index, info.container.id);
  // }
});

// document.querySelector('.responsive_wrapper [data-controls="next"]').addEventListener('click', function () {
//   var info = responsiveSD.getInfo();
//   alert(info.indexCached + ' : ' + info.index);
// }, false);

