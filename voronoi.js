"use strict"

var incrementalDelaunay = require("incremental-delaunay")
var circumcenter = require("circumcenter")

module.exports = voronoiDiagram

function voronoiDiagram(points) {
  if(points.length === 0) {
    return { cells: [], points: [] }
  }

  //First triangulate the points
  var dimension = points[0].length
  var triangulation = incrementalDelaunay(dimension)
  for(var i=0; i<points.length; ++i) {
    triangulation.insert(points[i])
  }

  //Create point at infinity
  var pointAtInfinity = new Array(dimension)
  for(var i=0; i<dimension; ++i) {
    pointAtInfinity[i] = Infinity
  }

  //Build point index
  var dualPoints = [ ]
outer_loop:
  for(var cur=triangulation.next; cur!==triangulation; cur=cur.next) {
    var verts = cur.vertices
    var p = new Array(verts.length)
    for(var i=0; i<verts.length; ++i) {
      if(verts[i] <= dimension) {
        cur.index = -1
        continue outer_loop
      }
      p[i] = triangulation.points[verts[i]]
    }
    cur.index = dualPoints.length
    dualPoints.push(circumcenter(p))
  }

  //Build dual cells
  var dualCells = new Array(points.length)
  for(var i=0; i<points.length; ++i) {
    var v = i + dimension + 1
    var d = triangulation._dual[v]
    if(dimension === 2) {
      var c = [ d[0].index ]
      var s = d[0].vertices[(d[0].vertices.indexOf(v) + 1)%3]
      for(var j=1; j<d.length; ++j) {
        for(var k=1; k<d.length; ++k) {
          var x = (d[k].vertices.indexOf(v)+2)%3
          if(d[k].vertices[x] === s) {
            if(d[k].index !== -1 || (c.length > 0 && c[c.length-1] !== d[k].index)) {
              c.push(d[k].index)
            }
            s = d[k].vertices[(x+2)%3]
            break
          }
        }
      }
      if(c[0] === -1 && c[c.length - 1] === -1 && c.length > 0) {
        c.pop()
      }
      dualCells[i] = c
    } else {
      var c = new Array(d.length)
      for(var j=0; j<d.length; ++j) {
        c[j] = d.index
      }
      dualCells[i] = c
    }
  }

  //Return the resulting cells
  return {
    cells: dualCells,
    points: dualPoints
  }
}