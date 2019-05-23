// Ported from Stefan Gustavson's java implementation
// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
// Read Stefan's excellent paper for details on how this code works.
//
// Sean McCullough banksean@gmail.com

/**
* You can pass in a random number generator object if you like.
* It is assumed to have a random() method.
*/
const r = Math;

const grad3 = [
	[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
	[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
	[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
];

const p = [];
for (let  i=0; i<256; i++) {
  p[i] = Math.floor(r.random()*256);
}
const perm = [];
for(let i=0; i<512; i++) {
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
  let X = Math.floor(x);
  let Y = Math.floor(y);
  let Z = Math.floor(z);

  // Get relative xyz coordinates of point within that cell
  x = x - X;
  y = y - Y;
  z = z - Z;

  // Wrap the integer cells at 255 (smaller integer period can be introduced here)
  X = X & 255;
  Y = Y & 255;
  Z = Z & 255;

  // Calculate a set of eight hashed gradient indices
  const gi000 = perm[X+perm[Y+perm[Z]]] % 12,
  gi001 = perm[X+perm[Y+perm[Z+1]]] % 12,
	gi010 = perm[X+perm[Y+1+perm[Z]]] % 12,
  gi011 = perm[X+perm[Y+1+perm[Z+1]]] % 12,
  gi100 = perm[X+1+perm[Y+perm[Z]]] % 12,
  gi101 = perm[X+1+perm[Y+perm[Z+1]]] % 12,
  gi110 = perm[X+1+perm[Y+1+perm[Z]]] % 12,
  gi111 = perm[X+1+perm[Y+1+perm[Z+1]]] % 12,

  // Calculate noise contributions from each of the eight corners
  n000 = dot(grad3[gi000], x, y, z),
  n100 = dot(grad3[gi100], x-1, y, z),
  n010 = dot(grad3[gi010], x, y-1, z),
  n110 = dot(grad3[gi110], x-1, y-1, z),
  n001 = dot(grad3[gi001], x, y, z-1),
  n101 = dot(grad3[gi101], x-1, y, z-1),
  n011 = dot(grad3[gi011], x, y-1, z-1),
  n111 = dot(grad3[gi111], x-1, y-1, z-1),
  // Compute the fade curve value for each of x, y, z
  u = fade(x),
  v = fade(y),
  w = fade(z),
  // Interpolate along x the contributions from each of the corners
  nx00 = mix(n000, n100, u),
  nx01 = mix(n001, n101, u),
  nx10 = mix(n010, n110, u),
  nx11 = mix(n011, n111, u),
  // Interpolate the four results along y
  nxy0 = mix(nx00, nx10, v),
  nxy1 = mix(nx01, nx11, v),
  // Interpolate the two last results along z
  nxyz = mix(nxy0, nxy1, w);

  return nxyz;
};

export { noise };
