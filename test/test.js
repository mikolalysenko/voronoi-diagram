"use strict"

var voronoi = require("../voronoi.js")

require("tape")(function(t) {

  var points = [
    [0,1],
    [0,0],
    [1,0],
    [1,1],
    [0.5,0.5]
  ]

  console.log(voronoi(points))

  t.end()
})