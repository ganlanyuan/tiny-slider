var nextBtn = document.querySelector('#base_wrapper [data-controls="next"]');

Promise.resolve().then(timeout(3000)).then(function () {
  nextBtn.click();
}).then(timeout(3000)).then(function () {
  nextBtn.click();
}).then(timeout(3000)).then(function () {
  nextBtn.click();
});