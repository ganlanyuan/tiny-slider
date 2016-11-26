var doc = document,
    body = doc.querySelector('body');

var tests = (function () {
  function createSlider() {
    var slider = document.createElement('div');
    slider.className = 'node-test';
    body.appendChild(slider);
    return slider;
  }

  function getSliderObject() {
    return tns({container: doc.querySelector('.slider')});
  }

  function createList() {
    var list = doc.createElement('ul');
        list.className = 'setAttrs_removeAttrs';
        list.innerHTML = "<li></li><li></li><li></li><li></li><li></li>";
    body.appendChild(list);
    return list;
  }

  return {
    createSlider: createSlider,
    getSliderObject : getSliderObject,
    createList: createList,
  }
})();

var slider = tests.createSlider();
    so = tests.getSliderObject();

// # hasAttr
describe('hasAttr:', function () {
  it('check if an element has an expected attribute', function () {
    expect(so.hasAttr(slider, 'class')).toBe(true);
    expect(so.hasAttr(slider, 'id')).toBe(false);
    expect(so.hasAttr(slider, 'hidden')).toBe(false);
  });
});

// # getAttr
describe('getAttr:', function () {
  it('get an element attribute', function () {
    expect(so.getAttr(slider, 'class')).toBe('node-test');
    expect(so.getAttr(slider, 'id')).toBe(null);
  });
});

var list = tests.createList(),
    listItems = list.children;

// # setAttrs
so.setAttrs(listItems, {'hidden': '', 'class': 'item'});
so.setAttrs(list, {'data-list': '1'});
so.setAttrs(list, {'id': 'setAttrs_removeAttrs'});
describe('setAttrs:', function () {
  it('set attributes on elements', function () {
    for (var i = listItems.length; i--;) {
      expect(listItems[i].hasAttribute('hidden')).toBe(true);
    }
  });
  it('set attribute on one element', function () {
    expect(list.getAttribute('data-list')).toBe('1');
  });
});

// # removeAttrs
so.removeAttrs(listItems, 'class');
so.removeAttrs(list, 'id');
describe('removeAttrs:', function () {
  it('remove attributes on elements', function () {
    for (var i = listItems.length; i--;) {
      expect(listItems[i].hasAttribute('class')).toBe(false);
    }
  });
  it('remove attribute on one element', function () {
    expect(list.hasAttribute('id')).toBe(false);
  });
});

// getEventListeners
var ListenerTracker = new function(){
    var is_active=false;
    // listener tracking datas
    var _elements_  =[];
    var _listeners_ =[];
    this.init=function(){
        if(!is_active){//avoid duplicate call
            intercep_events_listeners();
        }
        is_active=true;
    };
    // register individual element an returns its corresponding listeners
    var register_element=function(element){
        if(_elements_.indexOf(element)==-1){
            // NB : split by useCapture to make listener easier to find when removing
            var elt_listeners=[{/*useCapture=false*/},{/*useCapture=true*/}];
            _elements_.push(element);
            _listeners_.push(elt_listeners);
        }
        return _listeners_[_elements_.indexOf(element)];
    };
    var intercep_events_listeners = function(){
        // backup overrided methods
        var _super_={
            "addEventListener"      : HTMLElement.prototype.addEventListener,
            "removeEventListener"   : HTMLElement.prototype.removeEventListener
        };

        Element.prototype["addEventListener"]=function(type, listener, useCapture){
            var listeners=register_element(this);
            // add event before to avoid registering if an error is thrown
            _super_["addEventListener"].apply(this,arguments);
            // adapt to 'elt_listeners' index
            useCapture=useCapture?1:0;

            if(!listeners[useCapture][type])listeners[useCapture][type]=[];
            listeners[useCapture][type].push(listener);
        };
        Element.prototype["removeEventListener"]=function(type, listener, useCapture){
            var listeners=register_element(this);
            // add event before to avoid registering if an error is thrown
            _super_["removeEventListener"].apply(this,arguments);
            // adapt to 'elt_listeners' index
            useCapture=useCapture?1:0;
            if(!listeners[useCapture][type])return;
            var lid = listeners[useCapture][type].indexOf(listener);
            if(lid>-1)listeners[useCapture][type].splice(lid,1);
        };
        Element.prototype["getEventListeners"]=function(type){
            var listeners=register_element(this);
            // convert to listener datas list
            var result=[];
            for(var useCapture=0,list;list=listeners[useCapture];useCapture++){
                if(typeof(type)=="string"){// filtered by type
                    if(list[type]){
                        for(var id in list[type]){
                            result.push({"type":type,"listener":list[type][id],"useCapture":!!useCapture});
                        }
                    }
                }else{// all
                    for(var _type in list){
                        for(var id in list[_type]){
                            result.push({"type":_type,"listener":list[_type][id],"useCapture":!!useCapture});
                        }
                    }
                }
            }
            return result;
        };
    };
}();
ListenerTracker.init();

function clickOnce() {
  console.log('click once!');
}
function clickTwice() {
  console.log('click twice!');
}
function keydownEvent() {
  console.log('keydown event!');
}
list.addEventListener('click', clickOnce);
list.addEventListener('click', clickTwice);
list.addEventListener('keydown', keydownEvent);
listItems[0].addEventListener('click', clickOnce);
listItems[1].addEventListener('keydown', keydownEvent);
so.removeEventsByClone(list);
var newList = doc.querySelector('.setAttrs_removeAttrs');

// # removeEventsByClone
describe('removeEventsByClone:', function () {
  it('remove event listeners on one element', function () {
    expect(newList.getEventListeners().length).toBe(0);
  });
  it('and its children', function () {
    expect(newList.children[0].getEventListeners().length).toBe(0);
    expect(newList.children[1].getEventListeners().length).toBe(0);
  });
});

// # getSlideId
describe('getSlideId: ', function () {
  it('get a unit id for each slider on the page', function () {
    expect(so.getSlideId()).toBe('tns2');
    expect(so.getSlideId()).toBe('tns3');
    expect(so.getSlideId()).toBe('tns4');
    expect(so.getSlideId()).toBe('tns5');
    expect(so.getSlideId()).toBe('tns6');
  });
});

// # toDegree
describe('toDegree: ', function () {
  it('transfer a coordinate to a degree', function () {
    expect(so.toDegree(20, 20)).toBe(45);
    expect(so.toDegree(20, -20)).toBe(135);
    expect(so.toDegree(-20, 20)).toBe(-45);
    expect(so.toDegree(-20, -20)).toBe(-135);
    expect(so.toDegree(20, 0)).toBe(90);
    expect(so.toDegree(0, 20)).toBe(0);
  });
});

// # getTouchDirection
describe('getTouchDirection: ', function () {
  it('check if the given angle is inside a range', function () {
    expect(so.getTouchDirection(15, 15)).toBe('horizontal');
    expect(so.getTouchDirection(-15, 15)).toBe('horizontal');
    expect(so.getTouchDirection(-165, 15)).toBe('horizontal');
    expect(so.getTouchDirection(165, 15)).toBe('horizontal');
    expect(so.getTouchDirection(75, 15)).toBe('vertical');
    expect(so.getTouchDirection(105, 15)).toBe('vertical');
    expect(so.getTouchDirection(-75, 15)).toBe('vertical');
    expect(so.getTouchDirection(-105, 15)).toBe('vertical');
    expect(so.getTouchDirection(30, 15)).toBe(false);
    expect(so.getTouchDirection(60, 15)).toBe(false);
    expect(so.getTouchDirection(135, 15)).toBe(false);
  })
})

// # hideElement
describe('hideElement:', function () {
  it('hide element if it\'s visible', function () {
    var visibleElement = document.createElement('div');
    body.appendChild(visibleElement);
    so.hideElement(visibleElement);
    expect(visibleElement.hasAttribute('hidden')).toBe(true);
  })
})

// # showElement
describe('showElement:', function () {
  it('show element if it\'s hidden', function () {
    var hiddenElement = document.createElement('div');
    hiddenElement.setAttribute('hidden', '');
    body.appendChild(hiddenElement);
    so.showElement(hiddenElement);
    expect(hiddenElement.hasAttribute('hidden')).toBe(false);
  })
})

