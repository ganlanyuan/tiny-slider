var options = {
  'base': {
    items: 3,
    // loop: false,
    slideBy: 'page',
    mouseDrag: true,
  },
  'start-index-carousel-loop': {
    items: 3,
    slideBy: 'page',
    startIndex: 6,
  },
  'start-index-carousel-non-loop': {
    items: 3,
    slideBy: 'page',
    loop: false,
    startIndex: 6,
  },
  'start-index-gallery-loop': {
    mode: 'gallery',
    items: 3,
    slideBy: 'page',
    startIndex: 6,
  },
  'start-index-gallery-non-loop': {
    mode: 'gallery',
    items: 3,
    slideBy: 'page',
    loop: false,
    startIndex: 6,
  },
  'few-items': {
    items: 9,
    edgePadding: edgepadding,
    slideBy: 'page',
    mouseDrag: true,
    arrowKeys: true,
    autoplay: true,
    loop: false,
  },
  'mouse-drag': {
    items: 3,
    mouseDrag: true,
    slideBy: 'page',
  },
  'mouse-drag2': {
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
  'edgePadding-gutter': {
    items: 3,
    gutter: gutter,
    edgePadding: edgepadding,
  },
  'non-loop': {
    // items: 3,
    loop: false,
    responsive: {
      350: {
        items: 2
      },
      500: {
        items: 3
      }
    },
  }, 
  'rewind': {
    items: 3,
    rewind: true,
  }, 
  'slide-by-page': {
    items: 3,
    slideBy: 'page',
  }, 
  'fixedWidth': {
    fixedWidth: fw,
  }, 
  'fixedWidth-gutter': {
    gutter: gutter,
    fixedWidth: fw,
  }, 
  'fixedWidth-edgePadding': {
    edgePadding: edgepadding,
    fixedWidth: fw,
  }, 
  'fixedWidth-edgePadding-gutter': {
    gutter: gutter,
    edgePadding: edgepadding,
    fixedWidth: fw,
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
  'center-non-loop': {
    items: 4,
    center: true,
    gutter: 10,
    edgePadding: 30,
    loop: false,
  },
  'center-loop': {
    items: 4,
    center: true,
    gutter: 10,
  },
  'center-fixedWidth-non-loop': {
    fixedWidth: fw,
    center: true,
    edgePadding: 30,
    gutter: 10,
    loop: false,
  },
  'center-fixedWidth-loop': {
    fixedWidth: fw,
    center: true,
    edgePadding: 30,
    gutter: 10,
  },
  'center-autoWidth-non-loop': {
    autoWidth: true,
    center: true,
    gutter: 10,
    loop: false,
  },
  'center-autoWidth-loop': {
    autoWidth: true,
    center: true,
    gutter: 10,
  },
  'center-autoWidth-non-loop-edgePadding': {
    autoWidth: true,
    center: true,
    gutter: 10,
    edgePadding: 300,
    loop: false,
  },
  'center-autoWidth-loop-edgePadding': {
    autoWidth: true,
    center: true,
    gutter: 10,
    edgePadding: 300,
  },
  'center-lazyload-non-loop': {
    items: 4,
    center: true,
    gutter: 10,
    edgePadding: 30,
    loop: false,
    lazyload: true,
  },
  'center-lazyload-loop': {
    items: 4,
    center: true,
    gutter: 10,
    lazyload: true,
  },
  'center-lazyload-fixedWidth-non-loop': {
    fixedWidth: fw,
    center: true,
    gutter: 10,
    edgePadding: 30,
    loop: false,
    lazyload: true,
  },
  'center-lazyload-fixedWidth-loop': {
    fixedWidth: fw,
    center: true,
    gutter: 10,
    lazyload: true,
  },
  'center-lazyload-autoWidth-non-loop': {
    autoWidth: true,
    center: true,
    gutter: 10,
    edgePadding: 30,
    loop: false,
    lazyload: true,
  },
  'center-lazyload-autoWidth-loop': {
    autoWidth: true,
    center: true,
    gutter: 10,
    lazyload: true,
  },
  'responsive': {
    items: 2,
    controls: false,
    responsive: {
      350: {
        items: 3,
        controls: true,
        edgePadding: 30,
      },
      500: {
        items: 4
      }
    },
  },
  'responsive1': {
    gutter: 10,
    slideBy: 1,
    responsive: {
      350: {
        items: 2,
        edgePadding: 20,
      },
      500: {
        items: 3,
        gutter: 0,
        edgePadding: 40,
        slideBy: 'page',
      }
    },
  }, 
  'responsive2': {
    items: 3,
    autoplayTimeout: 350,
    responsive: {
      350: {
        controls: false,
        autoplay: true,
        autoplayTimeout: 1000,
        autoplayHoverPause: true,
      },
      500: {
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
      350: {
        controlsText: ['&lt;', '&gt;'],
        autoplayText: ['&gt;', '||'],
      },
      500: {
        controlsText: ['prev', 'next'],
        autoplayText: ['start', 'stop'],
      }
    },
  },
  'responsive4': {
    items: 3,
    responsive: {
      350: {
        touch: false,
        mouseDrag: false,
        arrowKeys: false,
      },
      500: {
        touch: true,
        mouseDrag: true,
        arrowKeys: true,
      }
    },
  },
  'responsive5': {
    fixedWidth: fw,
    autoHeight: false,
    responsive: {
      350: {
        autoHeight: true,
        fixedWidth: fw + 100,
      }
    },
  },
  'responsive6': {
    fixedWidth: 400,
    edgePadding: edgepadding,
    gutter: gutter,
    loop: false,
  },
  'arrowKeys': {
    items: 3,
    arrowKeys: true,
  },
  'autoplay': {
    items: 3,
    speed: 300,
    autoplay: true,
    autoplayHoverPause: true,
    autoplayTimeout: 3500,
    autoplayText: ['▶', '❚❚'],
    // autoplayButtonOutput: false,
  }, 
  'vertical': {
    items: 3,
    axis: 'vertical',
  }, 
  'vertical-gutter': {
    items: 3,
    axis: 'vertical',
    gutter: gutter,
  }, 
  'vertical-edgePadding': {
    items: 3,
    axis: 'vertical',
    edgePadding: edgepadding,
  }, 
  'vertical-edgePadding-gutter': {
    items: 3,
    axis: 'vertical',
    gutter: gutter,
    edgePadding: edgepadding,
  }, 
  'animation1': {
    mode: 'gallery',
    items: 2,
    animateIn: classIn,
    animateOut: classOut,
    speed: 1000,
  },
  'animation2': {
    mode: 'gallery',
    items: 2,
    speed: 0,
  },
  'lazyload': {
    items: 3,
    edgePadding: 40,
    lazyload: true,
  },
  'customize': {
    items: 3,
    navAsThumbnails: true,
    navContainer: '#customize-thumbnails',
    controlsContainer: '#customize-controls',
    autoplay: true,
    autoplayTimeout: 1000,
    autoplayButton: '#customize-toggle',
  },
  'autoHeight': {
    autoHeight: true,
    items: 1,
  },
  'nested_inner': {
    items: 3,
    nested: 'inner',
    edgePadding: 20,
    loop: false,
    slideBy: 'page',
  },
  'nested': {
    items: 1,
    loop: false,
    // autoHeight: true,
    nested: 'outer',
  }
};
