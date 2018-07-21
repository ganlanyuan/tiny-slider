var options = {
  'base': {
    container: '',
    items: 3,
    // loop: false,
    slideBy: 'page',
    mouseDrag: true,
  },
  'start-index': {
    container: '',
    items: 3,
    slideBy: 'page',
    loop: false,
    startIndex: 6,
  },
  'few-items': {
    container: '',
    items: 9,
    edgePadding: edgepadding,
    slideBy: 'page',
    mouseDrag: true,
    arrowKeys: true,
    autoplay: true,
    loop: false,
  },
  'mouse-drag': {
    container: '',
    items: 3,
    mouseDrag: true,
    slideBy: 'page',
  },
  'mouse-drag2': {
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
    // items: 3,
    loop: false,
    responsive: {
      500: {
        items: 2
      },
      900: {
        items: 3
      }
    },
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
    slideBy: 2,
    loop: false,
    arrowKeys: true,
  }, 
  'autoWidth': {
    autoWidth: true,
    items: 3.3,
    slideBy: 2.6,
    gutter: 10,
    mouseDrag: true,
  },
  'autoWidth-non-loop': {
    autoWidth: true,
    loop: false,
    mouseDrag: true,
  },
  'autoWidth-lazyload': {
    autoWidth: true,
    items: 3.3,
    slideBy: 2.6,
    gutter: 10,
    mouseDrag: true,
    lazyload: true,
  },
  'responsive': {
    items: 2,
    controls: false,
    responsive: {
      600: {
        items: 3,
        controls: true,
        edgePadding: 30,
      },
      900: {
        items: 4
      }
    },
  },
  'responsive1': {
    container: '',
    gutter: 10,
    slideBy: 1,
    responsive: {
      600: {
        items: 2,
        edgePadding: 20,
      },
      900: {
        items: 3,
        gutter: 0,
        edgePadding: 40,
        slideBy: 'page',
      }
    },
  }, 
  'responsive2': {
    items: 3,
    autoplayTimeout: 500,
    responsive: {
      600: {
        controls: false,
        autoplay: true,
        autoplayTimeout: 1000,
        autoplayHoverPause: true,
      },
      900: {
        nav: false,
        controls: true,
        autoplay: false,
      }
    },
  },
  'responsive3': {
    items: 3,
    autoplay: true,
    responsive: {
      600: {
        controlsText: ['&lt;', '&gt;'],
        autoplayText: ['&gt;', '||'],
      },
      900: {
        controlsText: ['prev', 'next'],
        autoplayText: ['start', 'stop'],
      }
    },
  },
  'responsive4': {
    items: 3,
    responsive: {
      600: {
        touch: false,
        mouseDrag: false,
        arrowKeys: false,
      },
      900: {
        touch: true,
        mouseDrag: true,
        arrowKeys: true,
      }
    },
  },
  'responsive5': {
    fixedWidth: 300,
    autoHeight: false,
    responsive: {
      600: {
        autoHeight: true,
        fixedWidth: 500,
      }
    },
  },
  'responsive6': {
    fixedWidth: 300,
    edgePadding: edgepadding,
    gutter: gutter,
    loop: false,
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
    autoplayTimeout: 1500,
    autoplayText: ['▶', '❚❚'],
    // autoplayButtonOutput: false,
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
    animateIn: classIn,
    animateOut: classOut,
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
  },
  'customize': {
    container: '',
    items: 3,
    controlsContainer: '#customize-controls',
    navContainer: '#customize-thumbnails',
    navAsThumbnails: true,
    autoplay: true,
    autoplayTimeout: 1000,
    autoplayButton: '#customize-toggle',
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
    slideBy: 'page',
  },
  'nested': {
    container: '',
    items: 1,
    loop: false,
    // autoHeight: true,
    nested: 'outer',
  }
};
