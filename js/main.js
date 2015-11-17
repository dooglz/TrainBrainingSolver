"use strict";

var s = {};
s.tree = '%'
s.bplat = 'o'
s.rplat = '!'
s.bguy = '*'
s.rguy = '@'
s.trackH = '-'
s.trackV = '|'
s.startU = 'u'
s.startR = 'r'
s.endH = '='
s.endV = '#'
s.null = '.'
s.up = 0;
s.right = 1;
s.down = 2;
s.left = 3;
s.dirs = ["up","right","down","left"];
s.udirs = ["↑","→","↓","←"];
var showme = false;
var prevt = 0;
setInterval(function () { console.log(((solution.leafadds - prevt) / 10.0) + "route tests/second",solution.leafcount, solution.leafadds, solution.leafrems); prevt = solution.leafadds; }, 10000);

// % tree
// o blue platform
// ! red paltform
// * blue guy
// @ red guy
// - track H
// | track V
// u start, up,
// r start, right.
// = end right 
// # end, vert

var loadedLev = {};
var solution = {};
var yeildAmount = 500000;
var yeildTime = 10;

var lev = ["...........%........",
  "....................",
  "....*.*.*..%..ooo...",
  "....................",
  "...........%........",
  "---r...............=",
  "...........%........",
  "....................",
  "....@.@.@..%..!!!...",
  "....................",
  "...........%........"]
var lev2 = ["...=",
  "-...",
  "r-..",
  "...."]

function Start() {
  loadedLev = ParseLevel(lev);
  solution = {};
  solution.leafcount = 1;
  solution.leafadds = 1;
  solution.leafrems = 1;
  solution.endLeafs = [];
  solution.baseLeaf = new Leaf(null, s.right, loadedLev.start, 0);
  SanityValues();
  //Lets' ggggggg gooooo
  Traverse(solution.baseLeaf);
}

function Traverse(BaseLeaf) {
  var currentLeaf = BaseLeaf;
  //console.log("Traversing", solution.leafcount, currentLeaf.depth);
  var ycount = 0;
  outer_loop:
  while (ycount < yeildAmount) {
    ycount++;
    if (currentLeaf === null) {
      return;
    }
    if (!currentLeaf.scanned) {
      currentLeaf.Scan();
    }
    if (currentLeaf.Done(true) && !currentLeaf.DeadEnd()) {
      //   console.log("Done, moving up", currentLeaf.depth);
      //Back up the tree we go
      currentLeaf = currentLeaf.parent;
      continue outer_loop;
    }
    if (currentLeaf.DeadEnd()) {
      if (currentLeaf == solution.baseLeaf) {
        console.error(currentLeaf);
        return;
      }
      //   console.log("Dead end, moving up", currentLeaf.depth);
      //Back up the tree we go
      currentLeaf.Remove();
      currentLeaf = currentLeaf.parent;
      continue outer_loop;
    }
    for (var i = 0; i < 4; i++) {
      if (currentLeaf.directions[i] == true && !currentLeaf.children[i].Done(true)) {
        //console.log(i,currentLeaf.depth);
        currentLeaf = currentLeaf.children[i];
        // console.log("moving Down", currentLeaf.depth);
        continue outer_loop;
      }
    }
    //um?
    //console.warn(currentLeaf);
  }
  //console.log("Yeilding", currentLeaf.depth, solution.leafcount,solution.leafadds,solution.leafrems, PathToString(LeafPathPositions(currentLeaf)));
  //console.log("Yeilding", currentLeaf.depth, solution.leafcount, solution.leafadds, solution.leafrems);
  setTimeout(function () { Traverse(currentLeaf) }, yeildTime);

}


class Leaf {
  constructor(parent, direction, position, depth) {
    solution.leafcount++;
    solution.leafadds++;
    this.parent = parent;
    this.direction = direction;
    this.position = position;
    this.depth = depth;
    this.scanned = false;
    this.golden = false;
    this.directions = [true, true, true, true];
    this.children = [null, null, null, null];
    if (this.ReachesEnd()) {
      console.log("found valid path", this);
      MakePathGolden(LeafPath(this));
      this.scanned = true;
      this.directions = [false, false, false, false];
      solution.endLeafs.push(this);
      switch (this.direction) {
        case s.up:
          this.directions[s.down] = false;
          break;
        case s.down:
          this.directions[s.up] = false;
          break;
        case s.left:
          this.directions[s.right] = false;
          break;
        case s.right:
          this.directions[s.left] = false;
          break;
      } 
    }
    if(showme){
      showme = false;
      console.log(VisLeaf(this));
    }
  }

  Scan() {
    for (var i = 0; i < 4; i++) {
      if(!this.directions[i]){continue;}
      var newP = Move(this.position, i);
      if (ValidPosition(newP, loadedLev.map, i, loadedLev.bounds) && !IntersectsWithTrack(newP, this)) {
        this.directions[i] = true;
        if (!Exists(this.children[i])) {
          this.children[i] = new Leaf(this, i, newP, this.depth + 1);
        }
      } else {
        this.directions[i] = false;
      }
    }
    this.scanned = true;
  }

  Remove() {
    if (this.ReachesEnd() || this.golden) {
      console.trace();
      console.error(this);
    }
    this.directions = [false, false, false, false];
    this.parent.RemoveChild(this.direction);
  }
  RemoveChild(c) {
    solution.leafcount--;
    solution.leafrems++;
    this.directions[c] = false;
    this.children[c] = null;
  }
  ReachesEnd() {
    return (IsSame(this.position, loadedLev.end));
  }
  DeadEnd() {
    return (this.scanned && !this.directions[0] && !this.directions[1] && !this.directions[2] && !this.directions[3]);
  }

  Done(recurse) {
    //All childeren are either done or nulled
    if (!this.scanned) {
      return false;
    }
    if (this.ReachesEnd()) {
      return true;
    }
    for (var i = 0; i < 4; i++) {
      if ((!recurse && this.directions[i] == true) || (recurse && this.directions[i] == true && !this.children[i].Done(false))) {
        return false;
      }
    }
    return true;
  }
}

function ValidPosition(p, map, dir, bounds) {
  if (p.x < 0 || p.y < 0 || p.x >= bounds.x || p.y >= bounds.y) {
    return false;
  }

  if (!checkSanity(p,dir)){
    return false;
  }
  var tile = map[p.x][p.y];
  if (tile == s.null) {
    return true;
  }
  if (tile == s.endH && (dir == s.right || dir == s.left)) {
    return true;
  }
  if (tile == s.endV && (dir == s.up || dir == s.down)) {
    return true;
  }
  return false;
}

function InBounds(p,bounds) {
  if (p.x < 0 || p.y < 0 || p.x >= bounds.x || p.y >= bounds.y) {
    return false;
  }
  return true;
}

function IntersectsWithTrack(p, leaf) {
  var currentLeaf = leaf;
  do {
    if (IsSame(p, currentLeaf.position)) {
      return true;
    }
    currentLeaf = currentLeaf.parent;
  }
  while (currentLeaf !== null)
  return false;
}

function Move(p, dir) {
  var o = { x: p.x, y: p.y };
  switch (dir) {
    case s.up:
      o.x = p.x - 1;
      break;
    case s.right:
      o.y = p.y + 1;
      break;
    case s.down:
      o.x = p.x + 1;
      break;
    case s.left:
      o.y = p.y - 1;
      break;
    default:
      break;
  }
  return o;
}

function LeafPath(leaf) {
  var currentLeaf = leaf;
  var path = [];

  do {
    path.push(currentLeaf);
    currentLeaf = currentLeaf.parent;
  } while (currentLeaf !== null)

  return path;
}
function LeafPathPositions(leaf) {
  var pos = [];
  var path = LeafPath(leaf);
  path.forEach(function (e) {
    pos.push(e.position);
  }, this);
  return pos;
}
function PathToString(path) {
  var str = "";
  for (var i = path.length - 1; i >= 0; i--) {
    str += " " + path[i].x + "," + path[i].y + ",";
  }
  return str;
}
function PathToDString(path) {
  var str = "";
  for (var i = path.length - 1; i >= 0; i--) {
    str += " " + s.dirs[path[i].direction] + ",";
  }
  return str;
}

function MakePathGolden(path) {
  path.forEach(function (e) {
    e.golden = true;
  }, this);
}

function ParseLevel(lt) {
  var o = {};
  o.rows = lt.length;
  o.columns = lt[0].length;
  o.bounds = { x: o.rows, y: o.columns };
  o.map = [];
  o.trees = [];
  o.bplats = [];
  o.rplats = [];
  o.bguys = [];
  o.rguys = [];
  o.track = [];
  o.start = { x: 0, y: 0 };
  o.end = { x: 0, y: 0 };
  o.space = 0;
  for (var i = 0; i < lt.length; i++) {
    o.map.push(lt[i].split(""));
    for (var j = 0; j < o.map[i].length; j++) {
      switch (o.map[i][j]) {
        case s.tree:
          o.trees.push({ x: i, y: j });
          break;
        case s.bplat:
          o.bplats.push({ x: i, y: j });
          break;
        case s.rplat:
          o.rplats.push({ x: i, y: j });
          break;
        case s.bguy:
          o.bguys.push({ x: i, y: j });
          break;
        case s.rguy:
          o.rguys.push({ x: i, y: j });
          break;
        case s.trackH:
          o.track.push({ x: i, y: j });
          break;
        case s.trackV:
          o.track.push({ x: i, y: j });
          break;
        case s.startU:
          o.start = { x: i, y: j };
          break;
        case s.startR:
          o.start = { x: i, y: j };
          break;
        case s.endH:
          o.end = { x: i, y: j };
          o.endSymbol = s.endH;
          break;
        case s.endV:
          o.end = { x: i, y: j };
          o.endSymbol = s.endV;
          break;
        case s.null:
          o.space++;
          break;
        default:
          break;
      }
    }
  }
  return o;
}

function IsSame(p1, p2) {
  return (p1.x == p2.x && p1.y == p2.y);
}


function VisLeaf(leaf) {
  var pos = LeafPath(leaf);
  var newMap = [];
  for (var i = 0; i < loadedLev.rows; i++) {
    newMap.push([]);
    for (var j = 0; j < loadedLev.columns; j++) {
      var aa = $.grep(pos, function (cc) { return (cc.position.x == i && cc.position.y == j); });
      if (aa.length > 0) {
        aa = s.udirs[aa[0].direction];
      } else {
        aa = loadedLev.map[i][j];
      }
      newMap[i].push(aa);
    }
  }
  var str = "";
  for (var i = 0; i < loadedLev.rows; i++) {
    str += "\r\n";
    for (var j = 0; j < loadedLev.columns; j++) {
      str += (newMap[i][j] + " ");
    }

  }
  return str;
}

function checkSanity(position, direction){
  for (var i = 0; i < sanity.length; i++) {
    var sane = sanity[i];
    if(IsSame(sane,position)){
      if (direction == sane.illegal){
       return false;
      }
    }
  }
  return true;
}

var sanity = [];
function SanityValues() {
  var p1, p2, p1a, p1b, p2a, p2b;
  if (loadedLev.endSymbol == s.endV) {
    //Up
    p1 = Move(loadedLev.end, 0);
    //Right
    p1a = Move(p1, 1);
    //Left
    p1b = Move(p1, 3);
    
    if(InBounds(p1a,loadedLev.bounds)){ sanity.push({x:p1a.x,y:p1a.y,illegal:1})};
    if(InBounds(p1b,loadedLev.bounds)){ sanity.push({x:p1b.x,y:p1b.y,illegal:3})};
    
    //Down
    p2 = Move(loadedLev.end, 2);
    p2a = Move(p2, 1);
    p2b = Move(p2, 3);
    
    if(InBounds(p2a,loadedLev.bounds)){ sanity.push({x:p2a.x,y:p2a.y,illegal:1})};
    if(InBounds(p2b,loadedLev.bounds)){ sanity.push({x:p2b.x,y:p2b.y,illegal:3})};
    
  } else {
    p1 = Move(loadedLev.end, 1);
    p1a = Move(p1, 0);
    p1b = Move(p1, 2);
    
    if(InBounds(p1a,loadedLev.bounds)){ sanity.push({x:p1a.x,y:p1a.y,illegal:0})};
    if(InBounds(p1b,loadedLev.bounds)){ sanity.push({x:p1b.x,y:p1b.y,illegal:2})};
    
    p2 = Move(loadedLev.end, 3);
    p2a = Move(p2, 0);
    p2b = Move(p2, 2);
    
   if(InBounds(p2a,loadedLev.bounds)){  sanity.push({x:p2a.x,y:p2a.y,illegal:0})};
    if(InBounds(p2b,loadedLev.bounds)){ sanity.push({x:p2b.x,y:p2b.y,illegal:2})};
  }
}