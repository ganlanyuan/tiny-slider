var win = {};
var doc = {};
var docElement = {};
var classListSupport = {};

function initDOM(){
    win = window;
    doc = document;
    docElement = document.documentElement;
    classListSupport = 'classList' in document.createElement('_');

    // ChildNode.remove - runs upon DOM initialization function
    if(!("remove" in Element.prototype)){
        Element.prototype.remove = function(){
        if(this.parentNode) {
            this.parentNode.removeChild(this);
        }
        };
    }
}

export { win, doc, docElement, classListSupport, initDOM };