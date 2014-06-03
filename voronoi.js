"use strict"

var triangulate = require("delaunay-triangulate")
var circumcenter = require("circumcenter")
var uniq = require("uniq")

module.exports = voronoi

function compareInt(a, b) {
  return a - b
}

function voronoi1D(points) {
  if(points.length === 1) {
    return {
      cells: [ [-1] ],
      positions: []
    }
  }
  var tagged = points.map(function(p, i) {
    return [ p[0], i ]
  })
  tagged.sort(function(a,b) {
    return a-b
  })
  var cells = new Array(points.length)
  for(var i=0; i<cells.length; ++i) {
    cells[i] = [-1,-1]
  }
  var dualPoints = []
  for(var j=1; j<tagged.length; ++j) {
    var a = tagged[j-1]
    var b = tagged[j]
    var center = 0.5*(a[0]+b[0])
    var n = dualPoints.length
    dualPoints.push([center])
    cells[a[1]][1] = n
    cells[b[1]][0] = n
  }
  cells[tagged[0][1]][1] = 0
  cells[tagged[tagged.length-1][1]][0] = dualPoints.length-1
  return {
    cells: cells,
    positions: dualPoints
  }
}

function voronoi(points) {
  var n = points.length
  if(n === 0) {
    return { cells: [], positions: [] }
  }
  var d = points[0].length
  if(d < 1) {
    return { cells: [], positions: [] }
  }
  if(d === 1) {
    return voronoi1D(points)
  }

  //First delaunay triangulate all points including point at infinity
  var cells = triangulate(points, true)

  //Construct dual points
  var stars = new Array(n)
  for(var i=0; i<n; ++i) {
    stars[i] = []
  }
  var nc = cells.length
  var tuple = new Array(d+1)
  var cellIndex = new Array(nc)
  var dualPoints = []
  for(var i=0; i<nc; ++i) {
    var verts = cells[i]
    var skip = false
    for(var j=0; j<=d; ++j) {
      var v = verts[j]
      if(v < 0) {
        cellIndex[i] = -1
        skip = true
      } else {
        stars[v].push(i)
        tuple[j] = points[v]
      }
    }
    if(skip) {
      continue
    }
    cellIndex[i] = dualPoints.length
    dualPoints.push(circumcenter(tuple))
  }

  //Build dual cells
  var dualCells
  if(d === 2) {
    dualCells = new Array(n)
    for(var i=0; i<n; ++i) {
      var dual = stars[i]
      var c = [ cellIndex[dual[0]] ]
      var s = cells[dual[0]][(cells[dual[0]].indexOf(i)+1) % 3]
      for(var j=1; j<dual.length; ++j) {
        for(var k=1; k<dual.length; ++k) {
          var x = (cells[dual[k]].indexOf(i) + 2) % 3
          if(cells[dual[k]][x] === s) {
            c.push(cellIndex[dual[k]])
            s = cells[dual[k]][(x+2)%3]
            break
          }
        }
      }
      dualCells[i] = c
    }
  } else {
    for(var i=0; i<n; ++i) {
      var s = stars[i]
      for(var j=0; j<s.length; ++j) {
        s[j] = cellIndex[s[j]]
      }
      uniq(s, compareInt)
    }
    dualCells = stars
  }

  //Return the resulting cells
  return {
    cells: dualCells,
    positions: dualPoints
  }
}