

var cost = null;
var xs = null, N = null, D = null;
var edges_arr = null;
var ds_orig2d = null;
var ds_orig3d = null;
var embed = null;
var edges = [];

var normal = function() {
  var N = 15, x = 0;
  for (var n = 0; n < N; n++) {
    x += Math.random();
  }
  x = 2*x - N;
  x = x/N;
  return x;
};


function knn_edges(K, ds_orig){
  edges = [];
  for (var i = 0; i < N; i++) {
    var knn = [];
    // stupid, dumb, easy hack for testing:
    for (var k = 0; k < K; k++) {
      var x = null, xd = 100000;
      for (var j = 0; j < N; j++) {
        var D = ds_orig[i + N*j];
        if ( i!=j && knn.indexOf(j) == -1 && D < xd) {
          x = j;
          xd = D;
        }
      }
      knn.push(x);
      edges.push([i, x]);
    }
  }
}

function calc_ds(ds_orig) {
  for (var i = 0; i < N; i++)
  for (var j = 0; j < N; j++) {
    var sum = 0;
    for (var d = 0; d < D; d++){
      var diff = xs[D*i + d] - xs[D*j + d];
      sum += diff*diff;
    }
    ds_orig[i + N*j] = Math.sqrt(sum);
  }
}

function make_edges_arr(thresh){
  edges, edges_arr;
  edges_arr = new Uint32Array(2*edges.length);
  for (var n in edges) {
    edges_arr[2*n]   = edges[n][0];
    edges_arr[2*n+1] = edges[n][1];
  }
}

self.onmessage = function(e) {
  data = e.data
  switch (data.cmd) {
    case "init":

      xs = data.xs;
      N = data.N;
      D = data.D;
      ds_orig3d = new Float32Array(N*N);
      calc_ds(ds_orig3d);

      embed = new Float32Array(3*N);

      for (var n = 0; n < embed.length; n++) {
        embed[n] = normal();
      }

      knn_edges(3, ds_orig3d);

      embed = xs;
      
      postMessage({ msg: "ready"});
      postMessage({msg: "edges", edges: edges})
      postMessage({ msg: "update", embed: embed});
      break;
    case "init_2d":

      N = data.N;

      xs = data.xs;
      D = data.D;
      ds_orig2d = new Float32Array(N*N);
      calc_ds(ds_orig2d);
      
      embed = new Float32Array(2*N);
      init_s = data.init_s || 8;
      for (var n = 0; n < embed.length; n++) {
        embed[n] = init_s*normal();
      }

      knn_edges(3, ds_orig2d);
      Ne = edges.length;
      make_edges_arr();

      embed = xs;

      postMessage({ msg: "ready"});
      // postMessage({msg: "edges", edges: edges_arr})
      postMessage({ msg: "update", embed: embed});
      break;



  }
}