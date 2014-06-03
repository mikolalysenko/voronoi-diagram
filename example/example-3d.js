"use strict"

var shell = require("gl-now")({tickRate:2})
var camera = require("game-shell-orbit-camera")(shell)
var mat4 = require("gl-matrix").mat4
var createSimplicialComplex = require("gl-simplicial-complex")
var sc = require("simplicial-complex")
var createAxes = require("gl-axes")
var ch = require("incremental-convex-hull")
var vd = require("../voronoi")

camera.lookAt(
  [2.5, 2.5, 2.5],
  [0,0,0],
  [0,1,0])

var mesh, axes

var sites = new Array(100)
for(var i=0; i<100; ++i) {
  var p = new Array(3)
  for(var j=0; j<3; ++j) {
    p[j] = 2.0 * Math.random() - 1.0
  }
  sites[i] = p
}

var voronoi = vd(sites)

//Make a new mesh
var cells = []
var points = []
var colors = []

voronoi.cells.forEach(function(cell) {

  if(cell.indexOf(-1) >= 0) {
    return
  }

  var vpoints = cell.map(function(v) {
    return voronoi.positions[v]
  })

  var hull = ch(vpoints)

  //Find center of mass
  var center = [0,0,0]
  for(var i=0; i<vpoints.length; ++i) {
    for(var j=0; j<3; ++j) {
      if(vpoints[i][j] < -1 || vpoints[i][j] > 1) {
        return
      }
      center[j] += vpoints[i][j]
    }
  }
  for(var j=0; j<3; ++j) {
    center[j] /= vpoints.length
  }

  //Rescale points
  var offset = points.length;
  var color = [ Math.random(), Math.random(), Math.random() ]
  for(var i=0; i<vpoints.length; ++i) {
    colors.push(color.slice())
  }
  points.push.apply(points, vpoints)

  //Append cells
  cells.push.apply(cells, hull.map(function(f) {
    return f.map(function(v) {
      return v + offset
    })
  }))
})

shell.on("gl-init", function() {
  var gl = shell.gl
  gl.enable(gl.DEPTH_TEST)
  mesh = createSimplicialComplex(gl, {
    cells: cells,
    positions: points,
    vertexColors: colors
  })

  axes = createAxes(shell.gl, {
    bounds: [[-1,-1,-1],[1,1,1]], 
    tickSpacing: [0.1,0.1,0.1],
    gridColor:[0.5,0.5,0.5]
  })
})

shell.on("tick", function() {
  if(shell.press("space")) {
    updateTriangulation()
  }
})

shell.on("gl-render", function() {
  var cameraParameters = {
    view: camera.view(),
    projection: mat4.perspective(mat4.create(),
          Math.PI/4.0,
          shell.width/shell.height,
          0.1,
          1000.0)
  }
  mesh.draw(cameraParameters)
  axes.draw(cameraParameters)
})