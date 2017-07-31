// import { tns } from '../../src/tiny-slider';

var doc = document,
    isDemoPage = doc.body.getAttribute('data-page') === 'demos',
    sliders = new Object(),
    speed = Number(document.body.getAttribute('data-speed')),
    edgepadding = 50,
    gutter = 10,
    options= {
      'base': {
        container: '',
        items: 3,
        slideBy: 'page',
      },
      'goto': {
        container: '',
        items: 3,
        slideBy: 'page',
        nav: false,
        controls: false,
      },
      'few-items': {
        container: '',
        items: 9,
        slideBy: 'page',
      },
      'mouse-drag': {
        container: '',
        items: 3,
        mouseDrag: true,
        slideBy: 'page',
      },
      'gutter': {
        container: '',
        items: 3,
        gutter: gutter,
      },
      'edgePadding': {
        container: '',
        items: 3,
        edgePadding: edgepadding,
      },
      'edgePadding-gutter': {
        container: '',
        items: 3,
        gutter: gutter,
        edgePadding: edgepadding,
      },
      'non-loop': {
        container: '',
        items: 3,
        loop: false,
      }, 
      'rewind': {
        container: '',
        items: 3,
        rewind: true,
      }, 
      'slide-by-page': {
        container: '',
        items: 3,
        slideBy: 'page',
      }, 
      'fixedWidth': {
        container: '',
        fixedWidth: 300,
      }, 
      'fixedWidth-gutter': {
        container: '',
        gutter: gutter,
        fixedWidth: 300,
      }, 
      'fixedWidth-edgePadding': {
        container: '',
        edgePadding: edgepadding,
        fixedWidth: 300,
      }, 
      'fixedWidth-edgePadding-gutter': {
        container: '',
        gutter: gutter,
        edgePadding: edgepadding,
        fixedWidth: 300,
      }, 
      'responsive': {
        container: '',
        responsive: {
          600: 2,
          900: 3
        },
        slideBy: 'page',
      }, 
      'arrowKeys': {
        container: '',
        items: 3,
        arrowKeys: true,
      },
      'autoplay': {
        container: '',
        items: 3,
        speed: 300,
        autoplay: true,
        autoplayHoverPause: true,
        autoplayTimeout: 2000,
        autoplayText: ['▶', '❚❚'],
      }, 
      'vertical': {
        container: '',
        items: 3,
        axis: 'vertical',
      }, 
      'vertical-gutter': {
        container: '',
        items: 3,
        axis: 'vertical',
        gutter: gutter,
      }, 
      'vertical-edgePadding': {
        container: '',
        items: 3,
        axis: 'vertical',
        edgePadding: edgepadding,
      }, 
      'vertical-edgePadding-gutter': {
        container: '',
        items: 3,
        axis: 'vertical',
        gutter: gutter,
        edgePadding: edgepadding,
      }, 
      'animation1': {
        container: '',
        mode: 'gallery',
        items: 2,
        animateIn: 'jello',
        animateOut: 'rollOut',
        speed: 1000,
      },
      'animation2': {
        container: '',
        mode: 'gallery',
        items: 2,
        speed: 0,
      },
      'lazyload': {
        container: '',
        items: 3,
        edgePadding: 40,
        lazyload: true,
        onInit: function (info) {
          // console.log(info.items);
        },
      },
      'customize': {
        container: '',
        items: 3,
        controlsContainer: doc.querySelector('#customize-controls'),
        navContainer: doc.querySelector('#customize-thumbnails'),
        autoplay: true,
        autoplayTimeout: 1000,
        autoplayButton: doc.querySelector('#customize-toggle'),
      },
      'autoHeight': {
        container: '',
        autoHeight: true,
        items: 1,
      },
      'nested_inner': {
        container: '',
        items: 3,
        nested: 'inner',
        edgePadding: 20,
        loop: false,
        slideBy: 'page'
      },
      'nested': {
        container: '',
        items: 1,
        loop: false,
        autoHeight: true,
        nested: 'outer'
      }
    };

for (var i in options) {
  var item = options[i];
  item.container = doc.querySelector('#' + i);
  if (!item.speed) { item.speed = speed; }
  if (item.container) {
    sliders[i] = tns(options[i]);
    // sliders[i].destroy();

    // insert code
    if (isDemoPage) {
      doc.querySelector('#' + i + '_wrapper').insertAdjacentHTML('beforeend', '<pre><code class="language-javascript">' + JSON.stringify(item, function (key, value) {
        if (typeof value === 'object') {
          if (value.id) {
            return "document.querySelector('#" + value.id + "')";
          }
        }
        return value;
      }, '  ') + '</code></pre>');
    }
  }
}

// goto
if (doc.querySelector('#base_wrapper')) {
  var goto = doc.querySelector('#base_wrapper .goto-controls'),
      gotoBtn = goto.querySelector('.button'),
      gotoInput = goto.querySelector('input');

  gotoBtn.onclick = function (event) {
    var index = Number(gotoInput.value);
    if (typeof index === 'number') {
      sliders['base'].goTo(index);
    }
  };
}