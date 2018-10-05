function test (arr, cb) {
  for (var i = 0; i < arr.length; i++) {
    cb(arr[i]);
  }
}

test([1, 2, 3], function(num) {
  console.log(num + 1);
});
