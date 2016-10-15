var tt = (function () {
  var my = {}, 
      doc = document,
      ul = doc.createElement('ul');
      li = doc.createElement('li');

  my.dom = {
    body: doc.querySelector('body'),
    container: doc.querySelector('.container'),
  },
  my.creatSuiteContainer = function () {
    var newUl = ul.cloneNode(true);
    newUl.className = 'suite-container';
    this.dom.body.insertBefore(newUl, this.dom.container);
    this.dom.suiteContainer = newUl;
  },
  my.creatSuite = function (describe, result) {
    var newLi = li.cloneNode(true);
    newLi.innerHTML = describe;
    if (!result) { newLi.className = 'fail'}
    this.dom.suiteContainer.appendChild(newLi);
  }

  return my;
})();
tt.creatSuiteContainer();


