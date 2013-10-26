voronoi-diagram
===============
Construct a voronoi diagram for a collection of points

## Example

```javascript
var voronoi = require("voronoi-diagram")

var points = [[
  [1, 0],
  [0, 1],
  [0, 0]
]]

console.log(voronoi(points))
```

## API

### `require("voronoi-diagram")(points)`
Constructs a voronoi diagram for a collection of points.

* `points` is an array of points in `n`-dimensional space

**Returns** An object with two properties

* `points` an array of points representing the location of the voronoi sites
* `cells` an array of indices with the same length as `points` representing the voronoi sites.  `-1` indicates a point at infinity

## Credits
(c) 2013 Mikola Lysenko. MIT License