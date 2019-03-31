// Ported from Stefan Gustavson's java implementation
// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
// Read Stefan's excellent paper for details on how this code works.
//
// Sean McCullough banksean@gmail.com

/**
* You can pass in a random number generator object if you like.
* It is assumed to have a random() method.
*/
var r = undefined;
if (r == undefined) r = Math;
var grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
var p = [];
for (var i=0; i<256; i++) {
  p[i] = Math.floor(r.random()*256);
}

// To remove the need for index wrapping, double the permutation table length
var perm = [];
for(var i=0; i<512; i++) {
  perm[i]=p[i & 255];
}

function dot(g, x, y, z) {
  return g[0]*x + g[1]*y + g[2]*z;
};

function mix(a, b, t) {
  return (1.0-t)*a + t*b;
};

function fade(t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
};

// Classic Perlin noise, 3D version
function noise(x, y, z) {
  // Find unit grid cell containing point
  var X = Math.floor(x);
  var Y = Math.floor(y);
  var Z = Math.floor(z);

  // Get relative xyz coordinates of point within that cell
  x = x - X;
  y = y - Y;
  z = z - Z;

  // Wrap the integer cells at 255 (smaller integer period can be introduced here)
  X = X & 255;
  Y = Y & 255;
  Z = Z & 255;

  // Calculate a set of eight hashed gradient indices
  var gi000 = perm[X+perm[Y+perm[Z]]] % 12;
  var gi001 = perm[X+perm[Y+perm[Z+1]]] % 12;
  var gi010 = perm[X+perm[Y+1+perm[Z]]] % 12;
  var gi011 = perm[X+perm[Y+1+perm[Z+1]]] % 12;
  var gi100 = perm[X+1+perm[Y+perm[Z]]] % 12;
  var gi101 = perm[X+1+perm[Y+perm[Z+1]]] % 12;
  var gi110 = perm[X+1+perm[Y+1+perm[Z]]] % 12;
  var gi111 = perm[X+1+perm[Y+1+perm[Z+1]]] % 12;

  // The gradients of each corner are now:
  // g000 = grad3[gi000];
  // g001 = grad3[gi001];
  // g010 = grad3[gi010];
  // g011 = grad3[gi011];
  // g100 = grad3[gi100];
  // g101 = grad3[gi101];
  // g110 = grad3[gi110];
  // g111 = grad3[gi111];
  // Calculate noise contributions from each of the eight corners
  var n000= dot(grad3[gi000], x, y, z);
  var n100= dot(grad3[gi100], x-1, y, z);
  var n010= dot(grad3[gi010], x, y-1, z);
  var n110= dot(grad3[gi110], x-1, y-1, z);
  var n001= dot(grad3[gi001], x, y, z-1);
  var n101= dot(grad3[gi101], x-1, y, z-1);
  var n011= dot(grad3[gi011], x, y-1, z-1);
  var n111= dot(grad3[gi111], x-1, y-1, z-1);
  // Compute the fade curve value for each of x, y, z
  var u = fade(x);
  var v = fade(y);
  var w = fade(z);
  // Interpolate along x the contributions from each of the corners
  var nx00 = mix(n000, n100, u);
  var nx01 = mix(n001, n101, u);
  var nx10 = mix(n010, n110, u);
  var nx11 = mix(n011, n111, u);
  // Interpolate the four results along y
  var nxy0 = mix(nx00, nx10, v);
  var nxy1 = mix(nx01, nx11, v);
  // Interpolate the two last results along z
  var nxyz = mix(nxy0, nxy1, w);

  return nxyz;
};

export { noise };
