// import { tns } from '../../src/tiny-slider';

var doc = document,
    sliders = {},
    speed = 100,
    edgepadding = 50,
    gutter = 10,
    options= {
      'base': {
        items: 3,
        slideBy: 'page',
      },
      'mouseDrag': {
        items: 3,
        mouseDrag: true,
        slideBy: 'page',
      },
      'gutter': {
        items: 3,
        gutter: gutter,
      },
      'edgePadding': {
        items: 3,
        edgePadding: edgepadding,
      },
      'edgePaddingGutter': {
        items: 3,
        gutter: gutter,
        edgePadding: edgepadding,
      },
      'nonLoop': {
        items: 3,
        loop: false,
      }, 
      'rewind': {
        items: 3,
        rewind: true,
      }, 
      'slideByPage': {
        items: 3,
        slideBy: 'page',
      }, 
      'fixedWidth': {
        fixedWidth: 300,
      }, 
      'fixedWidthGutter': {
        gutter: gutter,
        fixedWidth: 300,
      }, 
      'fixedWidthEdgePadding': {
        edgePadding: edgepadding,
        fixedWidth: 300,
      }, 
      'fixedWidthEdgePaddingGutter': {
        gutter: gutter,
        edgePadding: edgepadding,
        fixedWidth: 300,
      }, 
      'responsive': {
        responsive: {
          600: 2,
          900: 3,
        },
        slideBy: 'page',
      }, 
      'arrowKeys': {
        items: 3,
        arrowKeys: true,
      },
      'autoplay': {
        items: 3,
        autoplay: true,
        autoplayHoverPause: true,
        autoplayTimeout: speed * 9,
        autoplayText: ['▶', '❚❚'],
      }, 
      'vertical': {
        items: 3,
        axis: 'vertical',
      }, 
      'verticalGutter': {
        items: 3,
        axis: 'vertical',
        gutter: gutter,
      }, 
      'verticalEdgepadding': {
        items: 3,
        axis: 'vertical',
        edgePadding: edgepadding,
      }, 
      'verticalEdgepaddingGutter': {
        items: 3,
        axis: 'vertical',
        gutter: gutter,
        edgePadding: edgepadding,
      }, 
      'animation': {
        speed: speed * 10,
        items: 2,
        mode: 'gallery',
        arrowKeys: true,
        animateIn: 'jello',
        animateOut: 'rollOut',
        animateDelay: speed * 2,
      },
      'lazyload': {
        items: 3,
        edgePadding: 40,
        lazyload: true,
        onInit: function (info) {
          // console.log(info.items);
        },
      },
      'customize': {
        items: 3,
        controlsContainer: doc.querySelector('.customize-tools .controls'),
        navContainer: doc.querySelector('.customize-tools .thumbnails'),
        autoplay: true,
        autoplayButton: doc.querySelector('.playbutton-wrapper > button'),
      },
      'autoHeight': {
        autoHeight: true,
        items: 1,
      }
    };

for (var i in options) {
  var item = options[i];
  item.container = doc.querySelector('#' + i);
  if (!item.speed) { item.speed = speed; }
  sliders[i] = tns(options[i]);
  // sliders[i].destroy();
}

// tns().events.on('initilized', function(info) {
//   console.log(info.container.id);
// });
// console.log(lazyloadS.events === customizeS.events);
// lazyloadS.events.on('transitionEnd', function(info) {
//   console.log(info.container.id);
// });

// tns().events.on('transitionEnd', function(info) {
//   if (info.container.id === 'base') {
//     console.log(e.type, info.container.id);
//   }
// });

// document.querySelector('.responsive_wrapper [data-controls="next"]').addEventListener('click', function () {
//   var info = responsiveSD.getInfo();
//   alert(info.indexCached + ' : ' + info.index);
// }, false);

