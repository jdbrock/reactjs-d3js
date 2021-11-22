(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rd3 = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/home/robson/projetos/rd3/node_modules/d3-voronoi/dist/d3-voronoi.js":[function(require,module,exports){
// https://d3js.org/d3-voronoi/ v1.1.4 Copyright 2018 Mike Bostock
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
typeof define === 'function' && define.amd ? define(['exports'], factory) :
(factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

function constant(x) {
  return function() {
    return x;
  };
}

function x(d) {
  return d[0];
}

function y(d) {
  return d[1];
}

function RedBlackTree() {
  this._ = null; // root node
}

function RedBlackNode(node) {
  node.U = // parent node
  node.C = // color - true for red, false for black
  node.L = // left node
  node.R = // right node
  node.P = // previous node
  node.N = null; // next node
}

RedBlackTree.prototype = {
  constructor: RedBlackTree,

  insert: function(after, node) {
    var parent, grandpa, uncle;

    if (after) {
      node.P = after;
      node.N = after.N;
      if (after.N) after.N.P = node;
      after.N = node;
      if (after.R) {
        after = after.R;
        while (after.L) after = after.L;
        after.L = node;
      } else {
        after.R = node;
      }
      parent = after;
    } else if (this._) {
      after = RedBlackFirst(this._);
      node.P = null;
      node.N = after;
      after.P = after.L = node;
      parent = after;
    } else {
      node.P = node.N = null;
      this._ = node;
      parent = null;
    }
    node.L = node.R = null;
    node.U = parent;
    node.C = true;

    after = node;
    while (parent && parent.C) {
      grandpa = parent.U;
      if (parent === grandpa.L) {
        uncle = grandpa.R;
        if (uncle && uncle.C) {
          parent.C = uncle.C = false;
          grandpa.C = true;
          after = grandpa;
        } else {
          if (after === parent.R) {
            RedBlackRotateLeft(this, parent);
            after = parent;
            parent = after.U;
          }
          parent.C = false;
          grandpa.C = true;
          RedBlackRotateRight(this, grandpa);
        }
      } else {
        uncle = grandpa.L;
        if (uncle && uncle.C) {
          parent.C = uncle.C = false;
          grandpa.C = true;
          after = grandpa;
        } else {
          if (after === parent.L) {
            RedBlackRotateRight(this, parent);
            after = parent;
            parent = after.U;
          }
          parent.C = false;
          grandpa.C = true;
          RedBlackRotateLeft(this, grandpa);
        }
      }
      parent = after.U;
    }
    this._.C = false;
  },

  remove: function(node) {
    if (node.N) node.N.P = node.P;
    if (node.P) node.P.N = node.N;
    node.N = node.P = null;

    var parent = node.U,
        sibling,
        left = node.L,
        right = node.R,
        next,
        red;

    if (!left) next = right;
    else if (!right) next = left;
    else next = RedBlackFirst(right);

    if (parent) {
      if (parent.L === node) parent.L = next;
      else parent.R = next;
    } else {
      this._ = next;
    }

    if (left && right) {
      red = next.C;
      next.C = node.C;
      next.L = left;
      left.U = next;
      if (next !== right) {
        parent = next.U;
        next.U = node.U;
        node = next.R;
        parent.L = node;
        next.R = right;
        right.U = next;
      } else {
        next.U = parent;
        parent = next;
        node = next.R;
      }
    } else {
      red = node.C;
      node = next;
    }

    if (node) node.U = parent;
    if (red) return;
    if (node && node.C) { node.C = false; return; }

    do {
      if (node === this._) break;
      if (node === parent.L) {
        sibling = parent.R;
        if (sibling.C) {
          sibling.C = false;
          parent.C = true;
          RedBlackRotateLeft(this, parent);
          sibling = parent.R;
        }
        if ((sibling.L && sibling.L.C)
            || (sibling.R && sibling.R.C)) {
          if (!sibling.R || !sibling.R.C) {
            sibling.L.C = false;
            sibling.C = true;
            RedBlackRotateRight(this, sibling);
            sibling = parent.R;
          }
          sibling.C = parent.C;
          parent.C = sibling.R.C = false;
          RedBlackRotateLeft(this, parent);
          node = this._;
          break;
        }
      } else {
        sibling = parent.L;
        if (sibling.C) {
          sibling.C = false;
          parent.C = true;
          RedBlackRotateRight(this, parent);
          sibling = parent.L;
        }
        if ((sibling.L && sibling.L.C)
          || (sibling.R && sibling.R.C)) {
          if (!sibling.L || !sibling.L.C) {
            sibling.R.C = false;
            sibling.C = true;
            RedBlackRotateLeft(this, sibling);
            sibling = parent.L;
          }
          sibling.C = parent.C;
          parent.C = sibling.L.C = false;
          RedBlackRotateRight(this, parent);
          node = this._;
          break;
        }
      }
      sibling.C = true;
      node = parent;
      parent = parent.U;
    } while (!node.C);

    if (node) node.C = false;
  }
};

function RedBlackRotateLeft(tree, node) {
  var p = node,
      q = node.R,
      parent = p.U;

  if (parent) {
    if (parent.L === p) parent.L = q;
    else parent.R = q;
  } else {
    tree._ = q;
  }

  q.U = parent;
  p.U = q;
  p.R = q.L;
  if (p.R) p.R.U = p;
  q.L = p;
}

function RedBlackRotateRight(tree, node) {
  var p = node,
      q = node.L,
      parent = p.U;

  if (parent) {
    if (parent.L === p) parent.L = q;
    else parent.R = q;
  } else {
    tree._ = q;
  }

  q.U = parent;
  p.U = q;
  p.L = q.R;
  if (p.L) p.L.U = p;
  q.R = p;
}

function RedBlackFirst(node) {
  while (node.L) node = node.L;
  return node;
}

function createEdge(left, right, v0, v1) {
  var edge = [null, null],
      index = edges.push(edge) - 1;
  edge.left = left;
  edge.right = right;
  if (v0) setEdgeEnd(edge, left, right, v0);
  if (v1) setEdgeEnd(edge, right, left, v1);
  cells[left.index].halfedges.push(index);
  cells[right.index].halfedges.push(index);
  return edge;
}

function createBorderEdge(left, v0, v1) {
  var edge = [v0, v1];
  edge.left = left;
  return edge;
}

function setEdgeEnd(edge, left, right, vertex) {
  if (!edge[0] && !edge[1]) {
    edge[0] = vertex;
    edge.left = left;
    edge.right = right;
  } else if (edge.left === right) {
    edge[1] = vertex;
  } else {
    edge[0] = vertex;
  }
}

// Liang–Barsky line clipping.
function clipEdge(edge, x0, y0, x1, y1) {
  var a = edge[0],
      b = edge[1],
      ax = a[0],
      ay = a[1],
      bx = b[0],
      by = b[1],
      t0 = 0,
      t1 = 1,
      dx = bx - ax,
      dy = by - ay,
      r;

  r = x0 - ax;
  if (!dx && r > 0) return;
  r /= dx;
  if (dx < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dx > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }

  r = x1 - ax;
  if (!dx && r < 0) return;
  r /= dx;
  if (dx < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dx > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }

  r = y0 - ay;
  if (!dy && r > 0) return;
  r /= dy;
  if (dy < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dy > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }

  r = y1 - ay;
  if (!dy && r < 0) return;
  r /= dy;
  if (dy < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dy > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }

  if (!(t0 > 0) && !(t1 < 1)) return true; // TODO Better check?

  if (t0 > 0) edge[0] = [ax + t0 * dx, ay + t0 * dy];
  if (t1 < 1) edge[1] = [ax + t1 * dx, ay + t1 * dy];
  return true;
}

function connectEdge(edge, x0, y0, x1, y1) {
  var v1 = edge[1];
  if (v1) return true;

  var v0 = edge[0],
      left = edge.left,
      right = edge.right,
      lx = left[0],
      ly = left[1],
      rx = right[0],
      ry = right[1],
      fx = (lx + rx) / 2,
      fy = (ly + ry) / 2,
      fm,
      fb;

  if (ry === ly) {
    if (fx < x0 || fx >= x1) return;
    if (lx > rx) {
      if (!v0) v0 = [fx, y0];
      else if (v0[1] >= y1) return;
      v1 = [fx, y1];
    } else {
      if (!v0) v0 = [fx, y1];
      else if (v0[1] < y0) return;
      v1 = [fx, y0];
    }
  } else {
    fm = (lx - rx) / (ry - ly);
    fb = fy - fm * fx;
    if (fm < -1 || fm > 1) {
      if (lx > rx) {
        if (!v0) v0 = [(y0 - fb) / fm, y0];
        else if (v0[1] >= y1) return;
        v1 = [(y1 - fb) / fm, y1];
      } else {
        if (!v0) v0 = [(y1 - fb) / fm, y1];
        else if (v0[1] < y0) return;
        v1 = [(y0 - fb) / fm, y0];
      }
    } else {
      if (ly < ry) {
        if (!v0) v0 = [x0, fm * x0 + fb];
        else if (v0[0] >= x1) return;
        v1 = [x1, fm * x1 + fb];
      } else {
        if (!v0) v0 = [x1, fm * x1 + fb];
        else if (v0[0] < x0) return;
        v1 = [x0, fm * x0 + fb];
      }
    }
  }

  edge[0] = v0;
  edge[1] = v1;
  return true;
}

function clipEdges(x0, y0, x1, y1) {
  var i = edges.length,
      edge;

  while (i--) {
    if (!connectEdge(edge = edges[i], x0, y0, x1, y1)
        || !clipEdge(edge, x0, y0, x1, y1)
        || !(Math.abs(edge[0][0] - edge[1][0]) > epsilon
            || Math.abs(edge[0][1] - edge[1][1]) > epsilon)) {
      delete edges[i];
    }
  }
}

function createCell(site) {
  return cells[site.index] = {
    site: site,
    halfedges: []
  };
}

function cellHalfedgeAngle(cell, edge) {
  var site = cell.site,
      va = edge.left,
      vb = edge.right;
  if (site === vb) vb = va, va = site;
  if (vb) return Math.atan2(vb[1] - va[1], vb[0] - va[0]);
  if (site === va) va = edge[1], vb = edge[0];
  else va = edge[0], vb = edge[1];
  return Math.atan2(va[0] - vb[0], vb[1] - va[1]);
}

function cellHalfedgeStart(cell, edge) {
  return edge[+(edge.left !== cell.site)];
}

function cellHalfedgeEnd(cell, edge) {
  return edge[+(edge.left === cell.site)];
}

function sortCellHalfedges() {
  for (var i = 0, n = cells.length, cell, halfedges, j, m; i < n; ++i) {
    if ((cell = cells[i]) && (m = (halfedges = cell.halfedges).length)) {
      var index = new Array(m),
          array = new Array(m);
      for (j = 0; j < m; ++j) index[j] = j, array[j] = cellHalfedgeAngle(cell, edges[halfedges[j]]);
      index.sort(function(i, j) { return array[j] - array[i]; });
      for (j = 0; j < m; ++j) array[j] = halfedges[index[j]];
      for (j = 0; j < m; ++j) halfedges[j] = array[j];
    }
  }
}

function clipCells(x0, y0, x1, y1) {
  var nCells = cells.length,
      iCell,
      cell,
      site,
      iHalfedge,
      halfedges,
      nHalfedges,
      start,
      startX,
      startY,
      end,
      endX,
      endY,
      cover = true;

  for (iCell = 0; iCell < nCells; ++iCell) {
    if (cell = cells[iCell]) {
      site = cell.site;
      halfedges = cell.halfedges;
      iHalfedge = halfedges.length;

      // Remove any dangling clipped edges.
      while (iHalfedge--) {
        if (!edges[halfedges[iHalfedge]]) {
          halfedges.splice(iHalfedge, 1);
        }
      }

      // Insert any border edges as necessary.
      iHalfedge = 0, nHalfedges = halfedges.length;
      while (iHalfedge < nHalfedges) {
        end = cellHalfedgeEnd(cell, edges[halfedges[iHalfedge]]), endX = end[0], endY = end[1];
        start = cellHalfedgeStart(cell, edges[halfedges[++iHalfedge % nHalfedges]]), startX = start[0], startY = start[1];
        if (Math.abs(endX - startX) > epsilon || Math.abs(endY - startY) > epsilon) {
          halfedges.splice(iHalfedge, 0, edges.push(createBorderEdge(site, end,
              Math.abs(endX - x0) < epsilon && y1 - endY > epsilon ? [x0, Math.abs(startX - x0) < epsilon ? startY : y1]
              : Math.abs(endY - y1) < epsilon && x1 - endX > epsilon ? [Math.abs(startY - y1) < epsilon ? startX : x1, y1]
              : Math.abs(endX - x1) < epsilon && endY - y0 > epsilon ? [x1, Math.abs(startX - x1) < epsilon ? startY : y0]
              : Math.abs(endY - y0) < epsilon && endX - x0 > epsilon ? [Math.abs(startY - y0) < epsilon ? startX : x0, y0]
              : null)) - 1);
          ++nHalfedges;
        }
      }

      if (nHalfedges) cover = false;
    }
  }

  // If there weren’t any edges, have the closest site cover the extent.
  // It doesn’t matter which corner of the extent we measure!
  if (cover) {
    var dx, dy, d2, dc = Infinity;

    for (iCell = 0, cover = null; iCell < nCells; ++iCell) {
      if (cell = cells[iCell]) {
        site = cell.site;
        dx = site[0] - x0;
        dy = site[1] - y0;
        d2 = dx * dx + dy * dy;
        if (d2 < dc) dc = d2, cover = cell;
      }
    }

    if (cover) {
      var v00 = [x0, y0], v01 = [x0, y1], v11 = [x1, y1], v10 = [x1, y0];
      cover.halfedges.push(
        edges.push(createBorderEdge(site = cover.site, v00, v01)) - 1,
        edges.push(createBorderEdge(site, v01, v11)) - 1,
        edges.push(createBorderEdge(site, v11, v10)) - 1,
        edges.push(createBorderEdge(site, v10, v00)) - 1
      );
    }
  }

  // Lastly delete any cells with no edges; these were entirely clipped.
  for (iCell = 0; iCell < nCells; ++iCell) {
    if (cell = cells[iCell]) {
      if (!cell.halfedges.length) {
        delete cells[iCell];
      }
    }
  }
}

var circlePool = [];

var firstCircle;

function Circle() {
  RedBlackNode(this);
  this.x =
  this.y =
  this.arc =
  this.site =
  this.cy = null;
}

function attachCircle(arc) {
  var lArc = arc.P,
      rArc = arc.N;

  if (!lArc || !rArc) return;

  var lSite = lArc.site,
      cSite = arc.site,
      rSite = rArc.site;

  if (lSite === rSite) return;

  var bx = cSite[0],
      by = cSite[1],
      ax = lSite[0] - bx,
      ay = lSite[1] - by,
      cx = rSite[0] - bx,
      cy = rSite[1] - by;

  var d = 2 * (ax * cy - ay * cx);
  if (d >= -epsilon2) return;

  var ha = ax * ax + ay * ay,
      hc = cx * cx + cy * cy,
      x = (cy * ha - ay * hc) / d,
      y = (ax * hc - cx * ha) / d;

  var circle = circlePool.pop() || new Circle;
  circle.arc = arc;
  circle.site = cSite;
  circle.x = x + bx;
  circle.y = (circle.cy = y + by) + Math.sqrt(x * x + y * y); // y bottom

  arc.circle = circle;

  var before = null,
      node = circles._;

  while (node) {
    if (circle.y < node.y || (circle.y === node.y && circle.x <= node.x)) {
      if (node.L) node = node.L;
      else { before = node.P; break; }
    } else {
      if (node.R) node = node.R;
      else { before = node; break; }
    }
  }

  circles.insert(before, circle);
  if (!before) firstCircle = circle;
}

function detachCircle(arc) {
  var circle = arc.circle;
  if (circle) {
    if (!circle.P) firstCircle = circle.N;
    circles.remove(circle);
    circlePool.push(circle);
    RedBlackNode(circle);
    arc.circle = null;
  }
}

var beachPool = [];

function Beach() {
  RedBlackNode(this);
  this.edge =
  this.site =
  this.circle = null;
}

function createBeach(site) {
  var beach = beachPool.pop() || new Beach;
  beach.site = site;
  return beach;
}

function detachBeach(beach) {
  detachCircle(beach);
  beaches.remove(beach);
  beachPool.push(beach);
  RedBlackNode(beach);
}

function removeBeach(beach) {
  var circle = beach.circle,
      x = circle.x,
      y = circle.cy,
      vertex = [x, y],
      previous = beach.P,
      next = beach.N,
      disappearing = [beach];

  detachBeach(beach);

  var lArc = previous;
  while (lArc.circle
      && Math.abs(x - lArc.circle.x) < epsilon
      && Math.abs(y - lArc.circle.cy) < epsilon) {
    previous = lArc.P;
    disappearing.unshift(lArc);
    detachBeach(lArc);
    lArc = previous;
  }

  disappearing.unshift(lArc);
  detachCircle(lArc);

  var rArc = next;
  while (rArc.circle
      && Math.abs(x - rArc.circle.x) < epsilon
      && Math.abs(y - rArc.circle.cy) < epsilon) {
    next = rArc.N;
    disappearing.push(rArc);
    detachBeach(rArc);
    rArc = next;
  }

  disappearing.push(rArc);
  detachCircle(rArc);

  var nArcs = disappearing.length,
      iArc;
  for (iArc = 1; iArc < nArcs; ++iArc) {
    rArc = disappearing[iArc];
    lArc = disappearing[iArc - 1];
    setEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
  }

  lArc = disappearing[0];
  rArc = disappearing[nArcs - 1];
  rArc.edge = createEdge(lArc.site, rArc.site, null, vertex);

  attachCircle(lArc);
  attachCircle(rArc);
}

function addBeach(site) {
  var x = site[0],
      directrix = site[1],
      lArc,
      rArc,
      dxl,
      dxr,
      node = beaches._;

  while (node) {
    dxl = leftBreakPoint(node, directrix) - x;
    if (dxl > epsilon) node = node.L; else {
      dxr = x - rightBreakPoint(node, directrix);
      if (dxr > epsilon) {
        if (!node.R) {
          lArc = node;
          break;
        }
        node = node.R;
      } else {
        if (dxl > -epsilon) {
          lArc = node.P;
          rArc = node;
        } else if (dxr > -epsilon) {
          lArc = node;
          rArc = node.N;
        } else {
          lArc = rArc = node;
        }
        break;
      }
    }
  }

  createCell(site);
  var newArc = createBeach(site);
  beaches.insert(lArc, newArc);

  if (!lArc && !rArc) return;

  if (lArc === rArc) {
    detachCircle(lArc);
    rArc = createBeach(lArc.site);
    beaches.insert(newArc, rArc);
    newArc.edge = rArc.edge = createEdge(lArc.site, newArc.site);
    attachCircle(lArc);
    attachCircle(rArc);
    return;
  }

  if (!rArc) { // && lArc
    newArc.edge = createEdge(lArc.site, newArc.site);
    return;
  }

  // else lArc !== rArc
  detachCircle(lArc);
  detachCircle(rArc);

  var lSite = lArc.site,
      ax = lSite[0],
      ay = lSite[1],
      bx = site[0] - ax,
      by = site[1] - ay,
      rSite = rArc.site,
      cx = rSite[0] - ax,
      cy = rSite[1] - ay,
      d = 2 * (bx * cy - by * cx),
      hb = bx * bx + by * by,
      hc = cx * cx + cy * cy,
      vertex = [(cy * hb - by * hc) / d + ax, (bx * hc - cx * hb) / d + ay];

  setEdgeEnd(rArc.edge, lSite, rSite, vertex);
  newArc.edge = createEdge(lSite, site, null, vertex);
  rArc.edge = createEdge(site, rSite, null, vertex);
  attachCircle(lArc);
  attachCircle(rArc);
}

function leftBreakPoint(arc, directrix) {
  var site = arc.site,
      rfocx = site[0],
      rfocy = site[1],
      pby2 = rfocy - directrix;

  if (!pby2) return rfocx;

  var lArc = arc.P;
  if (!lArc) return -Infinity;

  site = lArc.site;
  var lfocx = site[0],
      lfocy = site[1],
      plby2 = lfocy - directrix;

  if (!plby2) return lfocx;

  var hl = lfocx - rfocx,
      aby2 = 1 / pby2 - 1 / plby2,
      b = hl / plby2;

  if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;

  return (rfocx + lfocx) / 2;
}

function rightBreakPoint(arc, directrix) {
  var rArc = arc.N;
  if (rArc) return leftBreakPoint(rArc, directrix);
  var site = arc.site;
  return site[1] === directrix ? site[0] : Infinity;
}

var epsilon = 1e-6;
var epsilon2 = 1e-12;
var beaches;
var cells;
var circles;
var edges;

function triangleArea(a, b, c) {
  return (a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]);
}

function lexicographic(a, b) {
  return b[1] - a[1]
      || b[0] - a[0];
}

function Diagram(sites, extent) {
  var site = sites.sort(lexicographic).pop(),
      x,
      y,
      circle;

  edges = [];
  cells = new Array(sites.length);
  beaches = new RedBlackTree;
  circles = new RedBlackTree;

  while (true) {
    circle = firstCircle;
    if (site && (!circle || site[1] < circle.y || (site[1] === circle.y && site[0] < circle.x))) {
      if (site[0] !== x || site[1] !== y) {
        addBeach(site);
        x = site[0], y = site[1];
      }
      site = sites.pop();
    } else if (circle) {
      removeBeach(circle.arc);
    } else {
      break;
    }
  }

  sortCellHalfedges();

  if (extent) {
    var x0 = +extent[0][0],
        y0 = +extent[0][1],
        x1 = +extent[1][0],
        y1 = +extent[1][1];
    clipEdges(x0, y0, x1, y1);
    clipCells(x0, y0, x1, y1);
  }

  this.edges = edges;
  this.cells = cells;

  beaches =
  circles =
  edges =
  cells = null;
}

Diagram.prototype = {
  constructor: Diagram,

  polygons: function() {
    var edges = this.edges;

    return this.cells.map(function(cell) {
      var polygon = cell.halfedges.map(function(i) { return cellHalfedgeStart(cell, edges[i]); });
      polygon.data = cell.site.data;
      return polygon;
    });
  },

  triangles: function() {
    var triangles = [],
        edges = this.edges;

    this.cells.forEach(function(cell, i) {
      if (!(m = (halfedges = cell.halfedges).length)) return;
      var site = cell.site,
          halfedges,
          j = -1,
          m,
          s0,
          e1 = edges[halfedges[m - 1]],
          s1 = e1.left === site ? e1.right : e1.left;

      while (++j < m) {
        s0 = s1;
        e1 = edges[halfedges[j]];
        s1 = e1.left === site ? e1.right : e1.left;
        if (s0 && s1 && i < s0.index && i < s1.index && triangleArea(site, s0, s1) < 0) {
          triangles.push([site.data, s0.data, s1.data]);
        }
      }
    });

    return triangles;
  },

  links: function() {
    return this.edges.filter(function(edge) {
      return edge.right;
    }).map(function(edge) {
      return {
        source: edge.left.data,
        target: edge.right.data
      };
    });
  },

  find: function(x, y, radius) {
    var that = this, i0, i1 = that._found || 0, n = that.cells.length, cell;

    // Use the previously-found cell, or start with an arbitrary one.
    while (!(cell = that.cells[i1])) if (++i1 >= n) return null;
    var dx = x - cell.site[0], dy = y - cell.site[1], d2 = dx * dx + dy * dy;

    // Traverse the half-edges to find a closer cell, if any.
    do {
      cell = that.cells[i0 = i1], i1 = null;
      cell.halfedges.forEach(function(e) {
        var edge = that.edges[e], v = edge.left;
        if ((v === cell.site || !v) && !(v = edge.right)) return;
        var vx = x - v[0], vy = y - v[1], v2 = vx * vx + vy * vy;
        if (v2 < d2) d2 = v2, i1 = v.index;
      });
    } while (i1 !== null);

    that._found = i0;

    return radius == null || d2 <= radius * radius ? cell.site : null;
  }
};

function voronoi() {
  var x$$1 = x,
      y$$1 = y,
      extent = null;

  function voronoi(data) {
    return new Diagram(data.map(function(d, i) {
      var s = [Math.round(x$$1(d, i, data) / epsilon) * epsilon, Math.round(y$$1(d, i, data) / epsilon) * epsilon];
      s.index = i;
      s.data = d;
      return s;
    }), extent);
  }

  voronoi.polygons = function(data) {
    return voronoi(data).polygons();
  };

  voronoi.links = function(data) {
    return voronoi(data).links();
  };

  voronoi.triangles = function(data) {
    return voronoi(data).triangles();
  };

  voronoi.x = function(_) {
    return arguments.length ? (x$$1 = typeof _ === "function" ? _ : constant(+_), voronoi) : x$$1;
  };

  voronoi.y = function(_) {
    return arguments.length ? (y$$1 = typeof _ === "function" ? _ : constant(+_), voronoi) : y$$1;
  };

  voronoi.extent = function(_) {
    return arguments.length ? (extent = _ == null ? null : [[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]], voronoi) : extent && [[extent[0][0], extent[0][1]], [extent[1][0], extent[1][1]]];
  };

  voronoi.size = function(_) {
    return arguments.length ? (extent = _ == null ? null : [[0, 0], [+_[0], +_[1]]], voronoi) : extent && [extent[1][0] - extent[0][0], extent[1][1] - extent[0][1]];
  };

  return voronoi;
}

exports.voronoi = voronoi;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],"/home/robson/projetos/rd3/node_modules/d3plus-text/build/d3plus-text.full.js":[function(require,module,exports){
function _classCallCheck2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass2(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof2(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof2(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

/*
  d3plus-text v1.0.2
  A smart SVG text box with line wrapping and automatic font size scaling.
  Copyright (c) 2021 D3plus - https://d3plus.org
  @license MIT
*/
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) : factory();
})(function () {
  'use strict';

  function createCommonjsModule(fn) {
    var module = {
      exports: {}
    };
    return fn(module, module.exports), module.exports;
  }

  var _global = createCommonjsModule(function (module) {
    // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
    var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self // eslint-disable-next-line no-new-func
    : Function('return this')();
    if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
  });

  var hasOwnProperty = {}.hasOwnProperty;

  var _has = function _has(it, key) {
    return hasOwnProperty.call(it, key);
  };

  var _fails = function _fails(exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  }; // Thank's IE8 for his funny defineProperty


  var _descriptors = !_fails(function () {
    return Object.defineProperty({}, 'a', {
      get: function get() {
        return 7;
      }
    }).a != 7;
  });

  var _core = createCommonjsModule(function (module) {
    var core = module.exports = {
      version: '2.6.12'
    };
    if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
  });

  var _isObject = function _isObject(it) {
    return _typeof2(it) === 'object' ? it !== null : typeof it === 'function';
  };

  var _anObject = function _anObject(it) {
    if (!_isObject(it)) throw TypeError(it + ' is not an object!');
    return it;
  };

  var document$1 = _global.document; // typeof document.createElement is 'object' in old IE

  var is = _isObject(document$1) && _isObject(document$1.createElement);

  var _domCreate = function _domCreate(it) {
    return is ? document$1.createElement(it) : {};
  };

  var _ie8DomDefine = !_descriptors && !_fails(function () {
    return Object.defineProperty(_domCreate('div'), 'a', {
      get: function get() {
        return 7;
      }
    }).a != 7;
  }); // 7.1.1 ToPrimitive(input [, PreferredType])
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string


  var _toPrimitive = function _toPrimitive(it, S) {
    if (!_isObject(it)) return it;
    var fn, val;
    if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var dP = Object.defineProperty;
  var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
    _anObject(O);

    P = _toPrimitive(P, true);

    _anObject(Attributes);

    if (_ie8DomDefine) try {
      return dP(O, P, Attributes);
    } catch (e) {
      /* empty */
    }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };
  var _objectDp = {
    f: f
  };

  var _propertyDesc = function _propertyDesc(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var _hide = _descriptors ? function (object, key, value) {
    return _objectDp.f(object, key, _propertyDesc(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var id = 0;
  var px = Math.random();

  var _uid = function _uid(key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };

  var _library = false;

  var _shared = createCommonjsModule(function (module) {
    var SHARED = '__core-js_shared__';
    var store = _global[SHARED] || (_global[SHARED] = {});
    (module.exports = function (key, value) {
      return store[key] || (store[key] = value !== undefined ? value : {});
    })('versions', []).push({
      version: _core.version,
      mode: 'global',
      copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
    });
  });

  var _functionToString = _shared('native-function-to-string', Function.toString);

  var _redefine = createCommonjsModule(function (module) {
    var SRC = _uid('src');

    var TO_STRING = 'toString';

    var TPL = ('' + _functionToString).split(TO_STRING);

    _core.inspectSource = function (it) {
      return _functionToString.call(it);
    };

    (module.exports = function (O, key, val, safe) {
      var isFunction = typeof val == 'function';
      if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
      if (O[key] === val) return;
      if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));

      if (O === _global) {
        O[key] = val;
      } else if (!safe) {
        delete O[key];

        _hide(O, key, val);
      } else if (O[key]) {
        O[key] = val;
      } else {
        _hide(O, key, val);
      } // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative

    })(Function.prototype, TO_STRING, function toString() {
      return typeof this == 'function' && this[SRC] || _functionToString.call(this);
    });
  });

  var _aFunction = function _aFunction(it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  }; // optional / simple context binding


  var _ctx = function _ctx(fn, that, length) {
    _aFunction(fn);

    if (that === undefined) return fn;

    switch (length) {
      case 1:
        return function (a) {
          return fn.call(that, a);
        };

      case 2:
        return function (a, b) {
          return fn.call(that, a, b);
        };

      case 3:
        return function (a, b, c) {
          return fn.call(that, a, b, c);
        };
    }

    return function ()
    /* ...args */
    {
      return fn.apply(that, arguments);
    };
  };

  var PROTOTYPE = 'prototype';

  var $export = function $export(type, name, source) {
    var IS_FORCED = type & $export.F;
    var IS_GLOBAL = type & $export.G;
    var IS_STATIC = type & $export.S;
    var IS_PROTO = type & $export.P;
    var IS_BIND = type & $export.B;
    var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
    var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
    var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
    var key, own, out, exp;
    if (IS_GLOBAL) source = name;

    for (key in source) {
      // contains in native
      own = !IS_FORCED && target && target[key] !== undefined; // export native or passed

      out = (own ? target : source)[key]; // bind timers to global for call from export context

      exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out; // extend global

      if (target) _redefine(target, key, out, type & $export.U); // export

      if (exports[key] != out) _hide(exports, key, exp);
      if (IS_PROTO && expProto[key] != out) expProto[key] = out;
    }
  };

  _global.core = _core; // type bitmap

  $export.F = 1; // forced

  $export.G = 2; // global

  $export.S = 4; // static

  $export.P = 8; // proto

  $export.B = 16; // bind

  $export.W = 32; // wrap

  $export.U = 64; // safe

  $export.R = 128; // real proto method for `library`

  var _export = $export;

  var _meta = createCommonjsModule(function (module) {
    var META = _uid('meta');

    var setDesc = _objectDp.f;
    var id = 0;

    var isExtensible = Object.isExtensible || function () {
      return true;
    };

    var FREEZE = !_fails(function () {
      return isExtensible(Object.preventExtensions({}));
    });

    var setMeta = function setMeta(it) {
      setDesc(it, META, {
        value: {
          i: 'O' + ++id,
          // object ID
          w: {} // weak collections IDs

        }
      });
    };

    var fastKey = function fastKey(it, create) {
      // return primitive with prefix
      if (!_isObject(it)) return _typeof2(it) == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;

      if (!_has(it, META)) {
        // can't set metadata to uncaught frozen object
        if (!isExtensible(it)) return 'F'; // not necessary to add metadata

        if (!create) return 'E'; // add missing metadata

        setMeta(it); // return object ID
      }

      return it[META].i;
    };

    var getWeak = function getWeak(it, create) {
      if (!_has(it, META)) {
        // can't set metadata to uncaught frozen object
        if (!isExtensible(it)) return true; // not necessary to add metadata

        if (!create) return false; // add missing metadata

        setMeta(it); // return hash weak collections IDs
      }

      return it[META].w;
    }; // add metadata on freeze-family methods calling


    var onFreeze = function onFreeze(it) {
      if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
      return it;
    };

    var meta = module.exports = {
      KEY: META,
      NEED: false,
      fastKey: fastKey,
      getWeak: getWeak,
      onFreeze: onFreeze
    };
  });

  var _wks = createCommonjsModule(function (module) {
    var store = _shared('wks');

    var _Symbol = _global.Symbol;
    var USE_SYMBOL = typeof _Symbol == 'function';

    var $exports = module.exports = function (name) {
      return store[name] || (store[name] = USE_SYMBOL && _Symbol[name] || (USE_SYMBOL ? _Symbol : _uid)('Symbol.' + name));
    };

    $exports.store = store;
  });

  var def = _objectDp.f;

  var TAG = _wks('toStringTag');

  var _setToStringTag = function _setToStringTag(it, tag, stat) {
    if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, {
      configurable: true,
      value: tag
    });
  };

  var f$1 = _wks;
  var _wksExt = {
    f: f$1
  };
  var defineProperty = _objectDp.f;

  var _wksDefine = function _wksDefine(name) {
    var $Symbol = _core.Symbol || (_core.Symbol = _global.Symbol || {});
    if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, {
      value: _wksExt.f(name)
    });
  };

  var toString = {}.toString;

  var _cof = function _cof(it) {
    return toString.call(it).slice(8, -1);
  }; // fallback for non-array-like ES3 and non-enumerable old V8 strings
  // eslint-disable-next-line no-prototype-builtins


  var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
    return _cof(it) == 'String' ? it.split('') : Object(it);
  }; // 7.2.1 RequireObjectCoercible(argument)


  var _defined = function _defined(it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  }; // to indexed object, toObject with fallback for non-array-like ES3 strings


  var _toIobject = function _toIobject(it) {
    return _iobject(_defined(it));
  }; // 7.1.4 ToInteger


  var ceil = Math.ceil;
  var floor = Math.floor;

  var _toInteger = function _toInteger(it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  }; // 7.1.15 ToLength


  var min = Math.min;

  var _toLength = function _toLength(it) {
    return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min;

  var _toAbsoluteIndex = function _toAbsoluteIndex(index, length) {
    index = _toInteger(index);
    return index < 0 ? max(index + length, 0) : min$1(index, length);
  }; // false -> Array#indexOf
  // true  -> Array#includes


  var _arrayIncludes = function _arrayIncludes(IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = _toIobject($this);

      var length = _toLength(O.length);

      var index = _toAbsoluteIndex(fromIndex, length);

      var value; // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare

      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++]; // eslint-disable-next-line no-self-compare

        if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
      } else for (; length > index; index++) {
        if (IS_INCLUDES || index in O) {
          if (O[index] === el) return IS_INCLUDES || index || 0;
        }
      }
      return !IS_INCLUDES && -1;
    };
  };

  var shared = _shared('keys');

  var _sharedKey = function _sharedKey(key) {
    return shared[key] || (shared[key] = _uid(key));
  };

  var arrayIndexOf = _arrayIncludes(false);

  var IE_PROTO = _sharedKey('IE_PROTO');

  var _objectKeysInternal = function _objectKeysInternal(object, names) {
    var O = _toIobject(object);

    var i = 0;
    var result = [];
    var key;

    for (key in O) {
      if (key != IE_PROTO) _has(O, key) && result.push(key);
    } // Don't enum bug & hidden keys


    while (names.length > i) {
      if (_has(O, key = names[i++])) {
        ~arrayIndexOf(result, key) || result.push(key);
      }
    }

    return result;
  }; // IE 8- don't enum bug keys


  var _enumBugKeys = 'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'.split(','); // 19.1.2.14 / 15.2.3.14 Object.keys(O)


  var _objectKeys = Object.keys || function keys(O) {
    return _objectKeysInternal(O, _enumBugKeys);
  };

  var f$2 = Object.getOwnPropertySymbols;
  var _objectGops = {
    f: f$2
  };
  var f$3 = {}.propertyIsEnumerable;
  var _objectPie = {
    f: f$3
  }; // all enumerable object keys, includes symbols

  var _enumKeys = function _enumKeys(it) {
    var result = _objectKeys(it);

    var getSymbols = _objectGops.f;

    if (getSymbols) {
      var symbols = getSymbols(it);
      var isEnum = _objectPie.f;
      var i = 0;
      var key;

      while (symbols.length > i) {
        if (isEnum.call(it, key = symbols[i++])) result.push(key);
      }
    }

    return result;
  }; // 7.2.2 IsArray(argument)


  var _isArray = Array.isArray || function isArray(arg) {
    return _cof(arg) == 'Array';
  }; // 7.1.13 ToObject(argument)


  var _toObject = function _toObject(it) {
    return Object(_defined(it));
  };

  var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    _anObject(O);

    var keys = _objectKeys(Properties);

    var length = keys.length;
    var i = 0;
    var P;

    while (length > i) {
      _objectDp.f(O, P = keys[i++], Properties[P]);
    }

    return O;
  };

  var document$2 = _global.document;

  var _html = document$2 && document$2.documentElement; // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])


  var IE_PROTO$1 = _sharedKey('IE_PROTO');

  var Empty = function Empty() {
    /* empty */
  };

  var PROTOTYPE$1 = 'prototype'; // Create object with fake `null` prototype: use iframe Object with cleared prototype

  var _createDict = function createDict() {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = _domCreate('iframe');

    var i = _enumBugKeys.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;
    iframe.style.display = 'none';

    _html.appendChild(iframe);

    iframe.src = 'javascript:'; // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);

    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
    iframeDocument.close();
    _createDict = iframeDocument.F;

    while (i--) {
      delete _createDict[PROTOTYPE$1][_enumBugKeys[i]];
    }

    return _createDict();
  };

  var _objectCreate = Object.create || function create(O, Properties) {
    var result;

    if (O !== null) {
      Empty[PROTOTYPE$1] = _anObject(O);
      result = new Empty();
      Empty[PROTOTYPE$1] = null; // add "__proto__" for Object.getPrototypeOf polyfill

      result[IE_PROTO$1] = O;
    } else result = _createDict();

    return Properties === undefined ? result : _objectDps(result, Properties);
  }; // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)


  var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

  var f$4 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return _objectKeysInternal(O, hiddenKeys);
  };

  var _objectGopn = {
    f: f$4
  }; // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

  var gOPN = _objectGopn.f;
  var toString$1 = {}.toString;
  var windowNames = (typeof window === "undefined" ? "undefined" : _typeof2(window)) == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

  var getWindowNames = function getWindowNames(it) {
    try {
      return gOPN(it);
    } catch (e) {
      return windowNames.slice();
    }
  };

  var f$5 = function getOwnPropertyNames(it) {
    return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(_toIobject(it));
  };

  var _objectGopnExt = {
    f: f$5
  };
  var gOPD = Object.getOwnPropertyDescriptor;
  var f$6 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
    O = _toIobject(O);
    P = _toPrimitive(P, true);
    if (_ie8DomDefine) try {
      return gOPD(O, P);
    } catch (e) {
      /* empty */
    }
    if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
  };
  var _objectGopd = {
    f: f$6
  }; // ECMAScript 6 symbols shim

  var META = _meta.KEY;
  var gOPD$1 = _objectGopd.f;
  var dP$1 = _objectDp.f;
  var gOPN$1 = _objectGopnExt.f;
  var $Symbol = _global.Symbol;
  var $JSON = _global.JSON;

  var _stringify = $JSON && $JSON.stringify;

  var PROTOTYPE$2 = 'prototype';

  var HIDDEN = _wks('_hidden');

  var TO_PRIMITIVE = _wks('toPrimitive');

  var isEnum = {}.propertyIsEnumerable;

  var SymbolRegistry = _shared('symbol-registry');

  var AllSymbols = _shared('symbols');

  var OPSymbols = _shared('op-symbols');

  var ObjectProto = Object[PROTOTYPE$2];
  var USE_NATIVE = typeof $Symbol == 'function' && !!_objectGops.f;
  var QObject = _global.QObject; // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173

  var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild; // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687

  var setSymbolDesc = _descriptors && _fails(function () {
    return _objectCreate(dP$1({}, 'a', {
      get: function get() {
        return dP$1(this, 'a', {
          value: 7
        }).a;
      }
    })).a != 7;
  }) ? function (it, key, D) {
    var protoDesc = gOPD$1(ObjectProto, key);
    if (protoDesc) delete ObjectProto[key];
    dP$1(it, key, D);
    if (protoDesc && it !== ObjectProto) dP$1(ObjectProto, key, protoDesc);
  } : dP$1;

  var wrap = function wrap(tag) {
    var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);

    sym._k = tag;
    return sym;
  };

  var isSymbol = USE_NATIVE && _typeof2($Symbol.iterator) == 'symbol' ? function (it) {
    return _typeof2(it) == 'symbol';
  } : function (it) {
    return it instanceof $Symbol;
  };

  var $defineProperty = function defineProperty(it, key, D) {
    if (it === ObjectProto) $defineProperty(OPSymbols, key, D);

    _anObject(it);

    key = _toPrimitive(key, true);

    _anObject(D);

    if (_has(AllSymbols, key)) {
      if (!D.enumerable) {
        if (!_has(it, HIDDEN)) dP$1(it, HIDDEN, _propertyDesc(1, {}));
        it[HIDDEN][key] = true;
      } else {
        if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
        D = _objectCreate(D, {
          enumerable: _propertyDesc(0, false)
        });
      }

      return setSymbolDesc(it, key, D);
    }

    return dP$1(it, key, D);
  };

  var $defineProperties = function defineProperties(it, P) {
    _anObject(it);

    var keys = _enumKeys(P = _toIobject(P));

    var i = 0;
    var l = keys.length;
    var key;

    while (l > i) {
      $defineProperty(it, key = keys[i++], P[key]);
    }

    return it;
  };

  var $create = function create(it, P) {
    return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
  };

  var $propertyIsEnumerable = function propertyIsEnumerable(key) {
    var E = isEnum.call(this, key = _toPrimitive(key, true));
    if (this === ObjectProto && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
    return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
  };

  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
    it = _toIobject(it);
    key = _toPrimitive(key, true);
    if (it === ObjectProto && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
    var D = gOPD$1(it, key);
    if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
    return D;
  };

  var $getOwnPropertyNames = function getOwnPropertyNames(it) {
    var names = gOPN$1(_toIobject(it));
    var result = [];
    var i = 0;
    var key;

    while (names.length > i) {
      if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
    }

    return result;
  };

  var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
    var IS_OP = it === ObjectProto;
    var names = gOPN$1(IS_OP ? OPSymbols : _toIobject(it));
    var result = [];
    var i = 0;
    var key;

    while (names.length > i) {
      if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
    }

    return result;
  }; // 19.4.1.1 Symbol([description])


  if (!USE_NATIVE) {
    $Symbol = function _Symbol2() {
      if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');

      var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);

      var $set = function $set(value) {
        if (this === ObjectProto) $set.call(OPSymbols, value);
        if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
        setSymbolDesc(this, tag, _propertyDesc(1, value));
      };

      if (_descriptors && setter) setSymbolDesc(ObjectProto, tag, {
        configurable: true,
        set: $set
      });
      return wrap(tag);
    };

    _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
      return this._k;
    });

    _objectGopd.f = $getOwnPropertyDescriptor;
    _objectDp.f = $defineProperty;
    _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
    _objectPie.f = $propertyIsEnumerable;
    _objectGops.f = $getOwnPropertySymbols;

    if (_descriptors && !_library) {
      _redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
    }

    _wksExt.f = function (name) {
      return wrap(_wks(name));
    };
  }

  _export(_export.G + _export.W + _export.F * !USE_NATIVE, {
    Symbol: $Symbol
  });

  for (var es6Symbols = // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'.split(','), j = 0; es6Symbols.length > j;) {
    _wks(es6Symbols[j++]);
  }

  for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) {
    _wksDefine(wellKnownSymbols[k++]);
  }

  _export(_export.S + _export.F * !USE_NATIVE, 'Symbol', {
    // 19.4.2.1 Symbol.for(key)
    'for': function _for(key) {
      return _has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
    },
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: function keyFor(sym) {
      if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');

      for (var key in SymbolRegistry) {
        if (SymbolRegistry[key] === sym) return key;
      }
    },
    useSetter: function useSetter() {
      setter = true;
    },
    useSimple: function useSimple() {
      setter = false;
    }
  });

  _export(_export.S + _export.F * !USE_NATIVE, 'Object', {
    // 19.1.2.2 Object.create(O [, Properties])
    create: $create,
    // 19.1.2.4 Object.defineProperty(O, P, Attributes)
    defineProperty: $defineProperty,
    // 19.1.2.3 Object.defineProperties(O, Properties)
    defineProperties: $defineProperties,
    // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: $getOwnPropertyNames,
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: $getOwnPropertySymbols
  }); // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
  // https://bugs.chromium.org/p/v8/issues/detail?id=3443


  var FAILS_ON_PRIMITIVES = _fails(function () {
    _objectGops.f(1);
  });

  _export(_export.S + _export.F * FAILS_ON_PRIMITIVES, 'Object', {
    getOwnPropertySymbols: function getOwnPropertySymbols(it) {
      return _objectGops.f(_toObject(it));
    }
  }); // 24.3.2 JSON.stringify(value [, replacer [, space]])


  $JSON && _export(_export.S + _export.F * (!USE_NATIVE || _fails(function () {
    var S = $Symbol(); // MS Edge converts symbol values to JSON as {}
    // WebKit converts symbol values to JSON as null
    // V8 throws on boxed symbols

    return _stringify([S]) != '[null]' || _stringify({
      a: S
    }) != '{}' || _stringify(Object(S)) != '{}';
  })), 'JSON', {
    stringify: function stringify(it) {
      var args = [it];
      var i = 1;
      var replacer, $replacer;

      while (arguments.length > i) {
        args.push(arguments[i++]);
      }

      $replacer = replacer = args[1];
      if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined

      if (!_isArray(replacer)) replacer = function replacer(key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return _stringify.apply($JSON, args);
    }
  }); // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)

  $Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf); // 19.4.3.5 Symbol.prototype[@@toStringTag]

  _setToStringTag($Symbol, 'Symbol'); // 20.2.1.9 Math[@@toStringTag]


  _setToStringTag(Math, 'Math', true); // 24.3.3 JSON[@@toStringTag]


  _setToStringTag(_global.JSON, 'JSON', true); // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])


  _export(_export.S, 'Object', {
    create: _objectCreate
  }); // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)


  _export(_export.S + _export.F * !_descriptors, 'Object', {
    defineProperty: _objectDp.f
  }); // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)


  _export(_export.S + _export.F * !_descriptors, 'Object', {
    defineProperties: _objectDps
  }); // most Object methods by ES6 should accept primitives


  var _objectSap = function _objectSap(KEY, exec) {
    var fn = (_core.Object || {})[KEY] || Object[KEY];
    var exp = {};
    exp[KEY] = exec(fn);

    _export(_export.S + _export.F * _fails(function () {
      fn(1);
    }), 'Object', exp);
  }; // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)


  var $getOwnPropertyDescriptor$1 = _objectGopd.f;

  _objectSap('getOwnPropertyDescriptor', function () {
    return function getOwnPropertyDescriptor(it, key) {
      return $getOwnPropertyDescriptor$1(_toIobject(it), key);
    };
  }); // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


  var IE_PROTO$2 = _sharedKey('IE_PROTO');

  var ObjectProto$1 = Object.prototype;

  var _objectGpo = Object.getPrototypeOf || function (O) {
    O = _toObject(O);
    if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];

    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    }

    return O instanceof Object ? ObjectProto$1 : null;
  }; // 19.1.2.9 Object.getPrototypeOf(O)


  _objectSap('getPrototypeOf', function () {
    return function getPrototypeOf(it) {
      return _objectGpo(_toObject(it));
    };
  }); // 19.1.2.14 Object.keys(O)


  _objectSap('keys', function () {
    return function keys(it) {
      return _objectKeys(_toObject(it));
    };
  }); // 19.1.2.7 Object.getOwnPropertyNames(O)


  _objectSap('getOwnPropertyNames', function () {
    return _objectGopnExt.f;
  }); // 19.1.2.5 Object.freeze(O)


  var meta = _meta.onFreeze;

  _objectSap('freeze', function ($freeze) {
    return function freeze(it) {
      return $freeze && _isObject(it) ? $freeze(meta(it)) : it;
    };
  }); // 19.1.2.17 Object.seal(O)


  var meta$1 = _meta.onFreeze;

  _objectSap('seal', function ($seal) {
    return function seal(it) {
      return $seal && _isObject(it) ? $seal(meta$1(it)) : it;
    };
  }); // 19.1.2.15 Object.preventExtensions(O)


  var meta$2 = _meta.onFreeze;

  _objectSap('preventExtensions', function ($preventExtensions) {
    return function preventExtensions(it) {
      return $preventExtensions && _isObject(it) ? $preventExtensions(meta$2(it)) : it;
    };
  }); // 19.1.2.12 Object.isFrozen(O)


  _objectSap('isFrozen', function ($isFrozen) {
    return function isFrozen(it) {
      return _isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
    };
  }); // 19.1.2.13 Object.isSealed(O)


  _objectSap('isSealed', function ($isSealed) {
    return function isSealed(it) {
      return _isObject(it) ? $isSealed ? $isSealed(it) : false : true;
    };
  }); // 19.1.2.11 Object.isExtensible(O)


  _objectSap('isExtensible', function ($isExtensible) {
    return function isExtensible(it) {
      return _isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
    };
  }); // 19.1.2.1 Object.assign(target, source, ...)


  var $assign = Object.assign; // should work with symbols and should have deterministic property order (V8 bug)

  var _objectAssign = !$assign || _fails(function () {
    var A = {};
    var B = {}; // eslint-disable-next-line no-undef

    var S = Symbol();
    var K = 'abcdefghijklmnopqrst';
    A[S] = 7;
    K.split('').forEach(function (k) {
      B[k] = k;
    });
    return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
  }) ? function assign(target, source) {
    // eslint-disable-line no-unused-vars
    var T = _toObject(target);

    var aLen = arguments.length;
    var index = 1;
    var getSymbols = _objectGops.f;
    var isEnum = _objectPie.f;

    while (aLen > index) {
      var S = _iobject(arguments[index++]);

      var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
      var length = keys.length;
      var j = 0;
      var key;

      while (length > j) {
        key = keys[j++];
        if (!_descriptors || isEnum.call(S, key)) T[key] = S[key];
      }
    }

    return T;
  } : $assign; // 19.1.3.1 Object.assign(target, source)


  _export(_export.S + _export.F, 'Object', {
    assign: _objectAssign
  }); // 7.2.9 SameValue(x, y)


  var _sameValue = Object.is || function is(x, y) {
    // eslint-disable-next-line no-self-compare
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  }; // 19.1.3.10 Object.is(value1, value2)


  _export(_export.S, 'Object', {
    is: _sameValue
  }); // Works with __proto__ only. Old v8 can't work with null proto objects.

  /* eslint-disable no-proto */


  var check = function check(O, proto) {
    _anObject(O);

    if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
  };

  var _setProto = {
    set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) {
        buggy = true;
      }

      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
    check: check
  }; // 19.1.3.19 Object.setPrototypeOf(O, proto)

  _export(_export.S, 'Object', {
    setPrototypeOf: _setProto.set
  }); // getting tag from 19.1.3.6 Object.prototype.toString()


  var TAG$1 = _wks('toStringTag'); // ES3 wrong here


  var ARG = _cof(function () {
    return arguments;
  }()) == 'Arguments'; // fallback for IE11 Script Access Denied error

  var tryGet = function tryGet(it, key) {
    try {
      return it[key];
    } catch (e) {
      /* empty */
    }
  };

  var _classof = function _classof(it) {
    var O, T, B;
    return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T // builtinTag case
    : ARG ? _cof(O) // ES3 arguments fallback
    : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
  }; // 19.1.3.6 Object.prototype.toString()


  var test = {};
  test[_wks('toStringTag')] = 'z';

  if (test + '' != '[object z]') {
    _redefine(Object.prototype, 'toString', function toString() {
      return '[object ' + _classof(this) + ']';
    }, true);
  } // fast apply, http://jsperf.lnkit.com/fast-apply/5


  var _invoke = function _invoke(fn, args, that) {
    var un = that === undefined;

    switch (args.length) {
      case 0:
        return un ? fn() : fn.call(that);

      case 1:
        return un ? fn(args[0]) : fn.call(that, args[0]);

      case 2:
        return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);

      case 3:
        return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);

      case 4:
        return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);
    }

    return fn.apply(that, args);
  };

  var arraySlice = [].slice;
  var factories = {};

  var construct = function construct(F, len, args) {
    if (!(len in factories)) {
      for (var n = [], i = 0; i < len; i++) {
        n[i] = 'a[' + i + ']';
      } // eslint-disable-next-line no-new-func


      factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
    }

    return factories[len](F, args);
  };

  var _bind = Function.bind || function bind(that
  /* , ...args */
  ) {
    var fn = _aFunction(this);

    var partArgs = arraySlice.call(arguments, 1);

    var bound = function bound()
    /* args... */
    {
      var args = partArgs.concat(arraySlice.call(arguments));
      return this instanceof bound ? construct(fn, args.length, args) : _invoke(fn, args, that);
    };

    if (_isObject(fn.prototype)) bound.prototype = fn.prototype;
    return bound;
  }; // 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)


  _export(_export.P, 'Function', {
    bind: _bind
  });

  var dP$2 = _objectDp.f;
  var FProto = Function.prototype;
  var nameRE = /^\s*function ([^ (]*)/;
  var NAME = 'name'; // 19.2.4.2 name

  NAME in FProto || _descriptors && dP$2(FProto, NAME, {
    configurable: true,
    get: function get() {
      try {
        return ('' + this).match(nameRE)[1];
      } catch (e) {
        return '';
      }
    }
  });

  var HAS_INSTANCE = _wks('hasInstance');

  var FunctionProto = Function.prototype; // 19.2.3.6 Function.prototype[@@hasInstance](V)

  if (!(HAS_INSTANCE in FunctionProto)) _objectDp.f(FunctionProto, HAS_INSTANCE, {
    value: function value(O) {
      if (typeof this != 'function' || !_isObject(O)) return false;
      if (!_isObject(this.prototype)) return O instanceof this; // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:

      while (O = _objectGpo(O)) {
        if (this.prototype === O) return true;
      }

      return false;
    }
  });

  var _stringWs = "\t\n\x0B\f\r \xA0\u1680\u180E\u2000\u2001\u2002\u2003" + "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";

  var space = '[' + _stringWs + ']';
  var non = "\u200B\x85";
  var ltrim = RegExp('^' + space + space + '*');
  var rtrim = RegExp(space + space + '*$');

  var exporter = function exporter(KEY, exec, ALIAS) {
    var exp = {};

    var FORCE = _fails(function () {
      return !!_stringWs[KEY]() || non[KEY]() != non;
    });

    var fn = exp[KEY] = FORCE ? exec(trim) : _stringWs[KEY];
    if (ALIAS) exp[ALIAS] = fn;

    _export(_export.P + _export.F * FORCE, 'String', exp);
  }; // 1 -> String#trimLeft
  // 2 -> String#trimRight
  // 3 -> String#trim


  var trim = exporter.trim = function (string, TYPE) {
    string = String(_defined(string));
    if (TYPE & 1) string = string.replace(ltrim, '');
    if (TYPE & 2) string = string.replace(rtrim, '');
    return string;
  };

  var _stringTrim = exporter;
  var $parseInt = _global.parseInt;
  var $trim = _stringTrim.trim;
  var hex = /^[-+]?0[xX]/;

  var _parseInt = $parseInt(_stringWs + '08') !== 8 || $parseInt(_stringWs + '0x16') !== 22 ? function parseInt(str, radix) {
    var string = $trim(String(str), 3);
    return $parseInt(string, radix >>> 0 || (hex.test(string) ? 16 : 10));
  } : $parseInt; // 18.2.5 parseInt(string, radix)


  _export(_export.G + _export.F * (parseInt != _parseInt), {
    parseInt: _parseInt
  });

  var $parseFloat = _global.parseFloat;
  var $trim$1 = _stringTrim.trim;

  var _parseFloat = 1 / $parseFloat(_stringWs + '-0') !== -Infinity ? function parseFloat(str) {
    var string = $trim$1(String(str), 3);
    var result = $parseFloat(string);
    return result === 0 && string.charAt(0) == '-' ? -0 : result;
  } : $parseFloat; // 18.2.4 parseFloat(string)


  _export(_export.G + _export.F * (parseFloat != _parseFloat), {
    parseFloat: _parseFloat
  });

  var setPrototypeOf = _setProto.set;

  var _inheritIfRequired = function _inheritIfRequired(that, target, C) {
    var S = target.constructor;
    var P;

    if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && _isObject(P) && setPrototypeOf) {
      setPrototypeOf(that, P);
    }

    return that;
  };

  var gOPN$2 = _objectGopn.f;
  var gOPD$2 = _objectGopd.f;
  var dP$3 = _objectDp.f;
  var $trim$2 = _stringTrim.trim;
  var NUMBER = 'Number';
  var $Number = _global[NUMBER];
  var Base = $Number;
  var proto = $Number.prototype; // Opera ~12 has broken Object#toString

  var BROKEN_COF = _cof(_objectCreate(proto)) == NUMBER;
  var TRIM = ('trim' in String.prototype); // 7.1.3 ToNumber(argument)

  var toNumber = function toNumber(argument) {
    var it = _toPrimitive(argument, false);

    if (typeof it == 'string' && it.length > 2) {
      it = TRIM ? it.trim() : $trim$2(it, 3);
      var first = it.charCodeAt(0);
      var third, radix, maxCode;

      if (first === 43 || first === 45) {
        third = it.charCodeAt(2);
        if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
      } else if (first === 48) {
        switch (it.charCodeAt(1)) {
          case 66:
          case 98:
            radix = 2;
            maxCode = 49;
            break;
          // fast equal /^0b[01]+$/i

          case 79:
          case 111:
            radix = 8;
            maxCode = 55;
            break;
          // fast equal /^0o[0-7]+$/i

          default:
            return +it;
        }

        for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
          code = digits.charCodeAt(i); // parseInt parses a string to a first unavailable symbol
          // but ToNumber should return NaN if a string contains unavailable symbols

          if (code < 48 || code > maxCode) return NaN;
        }

        return parseInt(digits, radix);
      }
    }

    return +it;
  };

  if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
    $Number = function Number(value) {
      var it = arguments.length < 1 ? 0 : value;
      var that = this;
      return that instanceof $Number // check on 1..constructor(foo) case
      && (BROKEN_COF ? _fails(function () {
        proto.valueOf.call(that);
      }) : _cof(that) != NUMBER) ? _inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
    };

    for (var keys = _descriptors ? gOPN$2(Base) : ( // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' + // ES6 (in case, if modules with ES6 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' + 'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger').split(','), j$1 = 0, key; keys.length > j$1; j$1++) {
      if (_has(Base, key = keys[j$1]) && !_has($Number, key)) {
        dP$3($Number, key, gOPD$2(Base, key));
      }
    }

    $Number.prototype = proto;
    proto.constructor = $Number;

    _redefine(_global, NUMBER, $Number);
  }

  var _aNumberValue = function _aNumberValue(it, msg) {
    if (typeof it != 'number' && _cof(it) != 'Number') throw TypeError(msg);
    return +it;
  };

  var _stringRepeat = function repeat(count) {
    var str = String(_defined(this));
    var res = '';

    var n = _toInteger(count);

    if (n < 0 || n == Infinity) throw RangeError("Count can't be negative");

    for (; n > 0; (n >>>= 1) && (str += str)) {
      if (n & 1) res += str;
    }

    return res;
  };

  var $toFixed = 1.0.toFixed;
  var floor$1 = Math.floor;
  var data = [0, 0, 0, 0, 0, 0];
  var ERROR = 'Number.toFixed: incorrect invocation!';
  var ZERO = '0';

  var multiply = function multiply(n, c) {
    var i = -1;
    var c2 = c;

    while (++i < 6) {
      c2 += n * data[i];
      data[i] = c2 % 1e7;
      c2 = floor$1(c2 / 1e7);
    }
  };

  var divide = function divide(n) {
    var i = 6;
    var c = 0;

    while (--i >= 0) {
      c += data[i];
      data[i] = floor$1(c / n);
      c = c % n * 1e7;
    }
  };

  var numToString = function numToString() {
    var i = 6;
    var s = '';

    while (--i >= 0) {
      if (s !== '' || i === 0 || data[i] !== 0) {
        var t = String(data[i]);
        s = s === '' ? t : s + _stringRepeat.call(ZERO, 7 - t.length) + t;
      }
    }

    return s;
  };

  var pow = function pow(x, n, acc) {
    return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
  };

  var log = function log(x) {
    var n = 0;
    var x2 = x;

    while (x2 >= 4096) {
      n += 12;
      x2 /= 4096;
    }

    while (x2 >= 2) {
      n += 1;
      x2 /= 2;
    }

    return n;
  };

  _export(_export.P + _export.F * (!!$toFixed && (0.00008.toFixed(3) !== '0.000' || 0.9.toFixed(0) !== '1' || 1.255.toFixed(2) !== '1.25' || 1000000000000000128.0.toFixed(0) !== '1000000000000000128') || !_fails(function () {
    // V8 ~ Android 4.3-
    $toFixed.call({});
  })), 'Number', {
    toFixed: function toFixed(fractionDigits) {
      var x = _aNumberValue(this, ERROR);

      var f = _toInteger(fractionDigits);

      var s = '';
      var m = ZERO;
      var e, z, j, k;
      if (f < 0 || f > 20) throw RangeError(ERROR); // eslint-disable-next-line no-self-compare

      if (x != x) return 'NaN';
      if (x <= -1e21 || x >= 1e21) return String(x);

      if (x < 0) {
        s = '-';
        x = -x;
      }

      if (x > 1e-21) {
        e = log(x * pow(2, 69, 1)) - 69;
        z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
        z *= 0x10000000000000;
        e = 52 - e;

        if (e > 0) {
          multiply(0, z);
          j = f;

          while (j >= 7) {
            multiply(1e7, 0);
            j -= 7;
          }

          multiply(pow(10, j, 1), 0);
          j = e - 1;

          while (j >= 23) {
            divide(1 << 23);
            j -= 23;
          }

          divide(1 << j);
          multiply(1, 1);
          divide(2);
          m = numToString();
        } else {
          multiply(0, z);
          multiply(1 << -e, 0);
          m = numToString() + _stringRepeat.call(ZERO, f);
        }
      }

      if (f > 0) {
        k = m.length;
        m = s + (k <= f ? '0.' + _stringRepeat.call(ZERO, f - k) + m : m.slice(0, k - f) + '.' + m.slice(k - f));
      } else {
        m = s + m;
      }

      return m;
    }
  });

  var $toPrecision = 1.0.toPrecision;

  _export(_export.P + _export.F * (_fails(function () {
    // IE7-
    return $toPrecision.call(1, undefined) !== '1';
  }) || !_fails(function () {
    // V8 ~ Android 4.3-
    $toPrecision.call({});
  })), 'Number', {
    toPrecision: function toPrecision(precision) {
      var that = _aNumberValue(this, 'Number#toPrecision: incorrect invocation!');

      return precision === undefined ? $toPrecision.call(that) : $toPrecision.call(that, precision);
    }
  }); // 20.1.2.1 Number.EPSILON


  _export(_export.S, 'Number', {
    EPSILON: Math.pow(2, -52)
  }); // 20.1.2.2 Number.isFinite(number)


  var _isFinite = _global.isFinite;

  _export(_export.S, 'Number', {
    isFinite: function isFinite(it) {
      return typeof it == 'number' && _isFinite(it);
    }
  }); // 20.1.2.3 Number.isInteger(number)


  var floor$2 = Math.floor;

  var _isInteger = function isInteger(it) {
    return !_isObject(it) && isFinite(it) && floor$2(it) === it;
  }; // 20.1.2.3 Number.isInteger(number)


  _export(_export.S, 'Number', {
    isInteger: _isInteger
  }); // 20.1.2.4 Number.isNaN(number)


  _export(_export.S, 'Number', {
    isNaN: function isNaN(number) {
      // eslint-disable-next-line no-self-compare
      return number != number;
    }
  }); // 20.1.2.5 Number.isSafeInteger(number)


  var abs = Math.abs;

  _export(_export.S, 'Number', {
    isSafeInteger: function isSafeInteger(number) {
      return _isInteger(number) && abs(number) <= 0x1fffffffffffff;
    }
  }); // 20.1.2.6 Number.MAX_SAFE_INTEGER


  _export(_export.S, 'Number', {
    MAX_SAFE_INTEGER: 0x1fffffffffffff
  }); // 20.1.2.10 Number.MIN_SAFE_INTEGER


  _export(_export.S, 'Number', {
    MIN_SAFE_INTEGER: -0x1fffffffffffff
  }); // 20.1.2.12 Number.parseFloat(string)


  _export(_export.S + _export.F * (Number.parseFloat != _parseFloat), 'Number', {
    parseFloat: _parseFloat
  }); // 20.1.2.13 Number.parseInt(string, radix)


  _export(_export.S + _export.F * (Number.parseInt != _parseInt), 'Number', {
    parseInt: _parseInt
  }); // 20.2.2.20 Math.log1p(x)


  var _mathLog1p = Math.log1p || function log1p(x) {
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
  }; // 20.2.2.3 Math.acosh(x)


  var sqrt = Math.sqrt;
  var $acosh = Math.acosh;

  _export(_export.S + _export.F * !($acosh // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  && Math.floor($acosh(Number.MAX_VALUE)) == 710 // Tor Browser bug: Math.acosh(Infinity) -> NaN
  && $acosh(Infinity) == Infinity), 'Math', {
    acosh: function acosh(x) {
      return (x = +x) < 1 ? NaN : x > 94906265.62425156 ? Math.log(x) + Math.LN2 : _mathLog1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
    }
  }); // 20.2.2.5 Math.asinh(x)


  var $asinh = Math.asinh;

  function asinh(x) {
    return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
  } // Tor Browser bug: Math.asinh(0) -> -0


  _export(_export.S + _export.F * !($asinh && 1 / $asinh(0) > 0), 'Math', {
    asinh: asinh
  }); // 20.2.2.7 Math.atanh(x)


  var $atanh = Math.atanh; // Tor Browser bug: Math.atanh(-0) -> 0

  _export(_export.S + _export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {
    atanh: function atanh(x) {
      return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
    }
  }); // 20.2.2.28 Math.sign(x)


  var _mathSign = Math.sign || function sign(x) {
    // eslint-disable-next-line no-self-compare
    return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
  }; // 20.2.2.9 Math.cbrt(x)


  _export(_export.S, 'Math', {
    cbrt: function cbrt(x) {
      return _mathSign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
    }
  }); // 20.2.2.11 Math.clz32(x)


  _export(_export.S, 'Math', {
    clz32: function clz32(x) {
      return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
    }
  }); // 20.2.2.12 Math.cosh(x)


  var exp = Math.exp;

  _export(_export.S, 'Math', {
    cosh: function cosh(x) {
      return (exp(x = +x) + exp(-x)) / 2;
    }
  }); // 20.2.2.14 Math.expm1(x)


  var $expm1 = Math.expm1;

  var _mathExpm1 = !$expm1 // Old FF bug
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168 // Tor Browser bug
  || $expm1(-2e-17) != -2e-17 ? function expm1(x) {
    return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
  } : $expm1; // 20.2.2.14 Math.expm1(x)


  _export(_export.S + _export.F * (_mathExpm1 != Math.expm1), 'Math', {
    expm1: _mathExpm1
  }); // 20.2.2.16 Math.fround(x)


  var pow$1 = Math.pow;
  var EPSILON = pow$1(2, -52);
  var EPSILON32 = pow$1(2, -23);
  var MAX32 = pow$1(2, 127) * (2 - EPSILON32);
  var MIN32 = pow$1(2, -126);

  var roundTiesToEven = function roundTiesToEven(n) {
    return n + 1 / EPSILON - 1 / EPSILON;
  };

  var _mathFround = Math.fround || function fround(x) {
    var $abs = Math.abs(x);

    var $sign = _mathSign(x);

    var a, result;
    if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs); // eslint-disable-next-line no-self-compare

    if (result > MAX32 || result != result) return $sign * Infinity;
    return $sign * result;
  }; // 20.2.2.16 Math.fround(x)


  _export(_export.S, 'Math', {
    fround: _mathFround
  }); // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])


  var abs$1 = Math.abs;

  _export(_export.S, 'Math', {
    hypot: function hypot(value1, value2) {
      // eslint-disable-line no-unused-vars
      var sum = 0;
      var i = 0;
      var aLen = arguments.length;
      var larg = 0;
      var arg, div;

      while (i < aLen) {
        arg = abs$1(arguments[i++]);

        if (larg < arg) {
          div = larg / arg;
          sum = sum * div * div + 1;
          larg = arg;
        } else if (arg > 0) {
          div = arg / larg;
          sum += div * div;
        } else sum += arg;
      }

      return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
    }
  }); // 20.2.2.18 Math.imul(x, y)


  var $imul = Math.imul; // some WebKit versions fails with big numbers, some has wrong arity

  _export(_export.S + _export.F * _fails(function () {
    return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
  }), 'Math', {
    imul: function imul(x, y) {
      var UINT16 = 0xffff;
      var xn = +x;
      var yn = +y;
      var xl = UINT16 & xn;
      var yl = UINT16 & yn;
      return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
    }
  }); // 20.2.2.21 Math.log10(x)


  _export(_export.S, 'Math', {
    log10: function log10(x) {
      return Math.log(x) * Math.LOG10E;
    }
  }); // 20.2.2.20 Math.log1p(x)


  _export(_export.S, 'Math', {
    log1p: _mathLog1p
  }); // 20.2.2.22 Math.log2(x)


  _export(_export.S, 'Math', {
    log2: function log2(x) {
      return Math.log(x) / Math.LN2;
    }
  }); // 20.2.2.28 Math.sign(x)


  _export(_export.S, 'Math', {
    sign: _mathSign
  }); // 20.2.2.30 Math.sinh(x)


  var exp$1 = Math.exp; // V8 near Chromium 38 has a problem with very small numbers

  _export(_export.S + _export.F * _fails(function () {
    return !Math.sinh(-2e-17) != -2e-17;
  }), 'Math', {
    sinh: function sinh(x) {
      return Math.abs(x = +x) < 1 ? (_mathExpm1(x) - _mathExpm1(-x)) / 2 : (exp$1(x - 1) - exp$1(-x - 1)) * (Math.E / 2);
    }
  }); // 20.2.2.33 Math.tanh(x)


  var exp$2 = Math.exp;

  _export(_export.S, 'Math', {
    tanh: function tanh(x) {
      var a = _mathExpm1(x = +x);

      var b = _mathExpm1(-x);

      return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp$2(x) + exp$2(-x));
    }
  }); // 20.2.2.34 Math.trunc(x)


  _export(_export.S, 'Math', {
    trunc: function trunc(it) {
      return (it > 0 ? Math.floor : Math.ceil)(it);
    }
  });

  var fromCharCode = String.fromCharCode;
  var $fromCodePoint = String.fromCodePoint; // length should be 1, old FF problem

  _export(_export.S + _export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
    // 21.1.2.2 String.fromCodePoint(...codePoints)
    fromCodePoint: function fromCodePoint(x) {
      // eslint-disable-line no-unused-vars
      var res = [];
      var aLen = arguments.length;
      var i = 0;
      var code;

      while (aLen > i) {
        code = +arguments[i++];
        if (_toAbsoluteIndex(code, 0x10ffff) !== code) throw RangeError(code + ' is not a valid code point');
        res.push(code < 0x10000 ? fromCharCode(code) : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00));
      }

      return res.join('');
    }
  });

  _export(_export.S, 'String', {
    // 21.1.2.4 String.raw(callSite, ...substitutions)
    raw: function raw(callSite) {
      var tpl = _toIobject(callSite.raw);

      var len = _toLength(tpl.length);

      var aLen = arguments.length;
      var res = [];
      var i = 0;

      while (len > i) {
        res.push(String(tpl[i++]));
        if (i < aLen) res.push(String(arguments[i]));
      }

      return res.join('');
    }
  }); // 21.1.3.25 String.prototype.trim()


  _stringTrim('trim', function ($trim) {
    return function trim() {
      return $trim(this, 3);
    };
  }); // true  -> String#at
  // false -> String#codePointAt


  var _stringAt = function _stringAt(TO_STRING) {
    return function (that, pos) {
      var s = String(_defined(that));

      var i = _toInteger(pos);

      var l = s.length;
      var a, b;
      if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };

  var _iterators = {};
  var IteratorPrototype = {}; // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()

  _hide(IteratorPrototype, _wks('iterator'), function () {
    return this;
  });

  var _iterCreate = function _iterCreate(Constructor, NAME, next) {
    Constructor.prototype = _objectCreate(IteratorPrototype, {
      next: _propertyDesc(1, next)
    });

    _setToStringTag(Constructor, NAME + ' Iterator');
  };

  var ITERATOR = _wks('iterator');

  var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`

  var FF_ITERATOR = '@@iterator';
  var KEYS = 'keys';
  var VALUES = 'values';

  var returnThis = function returnThis() {
    return this;
  };

  var _iterDefine = function _iterDefine(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    _iterCreate(Constructor, NAME, next);

    var getMethod = function getMethod(kind) {
      if (!BUGGY && kind in proto) return proto[kind];

      switch (kind) {
        case KEYS:
          return function keys() {
            return new Constructor(this, kind);
          };

        case VALUES:
          return function values() {
            return new Constructor(this, kind);
          };
      }

      return function entries() {
        return new Constructor(this, kind);
      };
    };

    var TAG = NAME + ' Iterator';
    var DEF_VALUES = DEFAULT == VALUES;
    var VALUES_BUG = false;
    var proto = Base.prototype;
    var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
    var $default = $native || getMethod(DEFAULT);
    var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
    var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
    var methods, key, IteratorPrototype; // Fix native

    if ($anyNative) {
      IteratorPrototype = _objectGpo($anyNative.call(new Base()));

      if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
        // Set @@toStringTag to native iterators
        _setToStringTag(IteratorPrototype, TAG, true); // fix for some old engines


        if (typeof IteratorPrototype[ITERATOR] != 'function') _hide(IteratorPrototype, ITERATOR, returnThis);
      }
    } // fix Array#{values, @@iterator}.name in V8 / FF


    if (DEF_VALUES && $native && $native.name !== VALUES) {
      VALUES_BUG = true;

      $default = function values() {
        return $native.call(this);
      };
    } // Define iterator


    if (BUGGY || VALUES_BUG || !proto[ITERATOR]) {
      _hide(proto, ITERATOR, $default);
    } // Plug for library


    _iterators[NAME] = $default;
    _iterators[TAG] = returnThis;

    if (DEFAULT) {
      methods = {
        values: DEF_VALUES ? $default : getMethod(VALUES),
        keys: IS_SET ? $default : getMethod(KEYS),
        entries: $entries
      };
      if (FORCED) for (key in methods) {
        if (!(key in proto)) _redefine(proto, key, methods[key]);
      } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
    }

    return methods;
  };

  var $at = _stringAt(true); // 21.1.3.27 String.prototype[@@iterator]()


  _iterDefine(String, 'String', function (iterated) {
    this._t = String(iterated); // target

    this._i = 0; // next index
    // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var index = this._i;
    var point;
    if (index >= O.length) return {
      value: undefined,
      done: true
    };
    point = $at(O, index);
    this._i += point.length;
    return {
      value: point,
      done: false
    };
  });

  var $at$1 = _stringAt(false);

  _export(_export.P, 'String', {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    codePointAt: function codePointAt(pos) {
      return $at$1(this, pos);
    }
  }); // 7.2.8 IsRegExp(argument)


  var MATCH = _wks('match');

  var _isRegexp = function _isRegexp(it) {
    var isRegExp;
    return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
  }; // helper for String#{startsWith, endsWith, includes}


  var _stringContext = function _stringContext(that, searchString, NAME) {
    if (_isRegexp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
    return String(_defined(that));
  };

  var MATCH$1 = _wks('match');

  var _failsIsRegexp = function _failsIsRegexp(KEY) {
    var re = /./;

    try {
      '/./'[KEY](re);
    } catch (e) {
      try {
        re[MATCH$1] = false;
        return !'/./'[KEY](re);
      } catch (f) {
        /* empty */
      }
    }

    return true;
  };

  var ENDS_WITH = 'endsWith';
  var $endsWith = ''[ENDS_WITH];

  _export(_export.P + _export.F * _failsIsRegexp(ENDS_WITH), 'String', {
    endsWith: function endsWith(searchString
    /* , endPosition = @length */
    ) {
      var that = _stringContext(this, searchString, ENDS_WITH);

      var endPosition = arguments.length > 1 ? arguments[1] : undefined;

      var len = _toLength(that.length);

      var end = endPosition === undefined ? len : Math.min(_toLength(endPosition), len);
      var search = String(searchString);
      return $endsWith ? $endsWith.call(that, search, end) : that.slice(end - search.length, end) === search;
    }
  });

  var INCLUDES = 'includes';

  _export(_export.P + _export.F * _failsIsRegexp(INCLUDES), 'String', {
    includes: function includes(searchString
    /* , position = 0 */
    ) {
      return !!~_stringContext(this, searchString, INCLUDES).indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  _export(_export.P, 'String', {
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: _stringRepeat
  });

  var STARTS_WITH = 'startsWith';
  var $startsWith = ''[STARTS_WITH];

  _export(_export.P + _export.F * _failsIsRegexp(STARTS_WITH), 'String', {
    startsWith: function startsWith(searchString
    /* , position = 0 */
    ) {
      var that = _stringContext(this, searchString, STARTS_WITH);

      var index = _toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));

      var search = String(searchString);
      return $startsWith ? $startsWith.call(that, search, index) : that.slice(index, index + search.length) === search;
    }
  });

  var quot = /"/g; // B.2.3.2.1 CreateHTML(string, tag, attribute, value)

  var createHTML = function createHTML(string, tag, attribute, value) {
    var S = String(_defined(string));
    var p1 = '<' + tag;
    if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
    return p1 + '>' + S + '</' + tag + '>';
  };

  var _stringHtml = function _stringHtml(NAME, exec) {
    var O = {};
    O[NAME] = exec(createHTML);

    _export(_export.P + _export.F * _fails(function () {
      var test = ''[NAME]('"');
      return test !== test.toLowerCase() || test.split('"').length > 3;
    }), 'String', O);
  }; // B.2.3.2 String.prototype.anchor(name)


  _stringHtml('anchor', function (createHTML) {
    return function anchor(name) {
      return createHTML(this, 'a', 'name', name);
    };
  }); // B.2.3.3 String.prototype.big()


  _stringHtml('big', function (createHTML) {
    return function big() {
      return createHTML(this, 'big', '', '');
    };
  }); // B.2.3.4 String.prototype.blink()


  _stringHtml('blink', function (createHTML) {
    return function blink() {
      return createHTML(this, 'blink', '', '');
    };
  }); // B.2.3.5 String.prototype.bold()


  _stringHtml('bold', function (createHTML) {
    return function bold() {
      return createHTML(this, 'b', '', '');
    };
  }); // B.2.3.6 String.prototype.fixed()


  _stringHtml('fixed', function (createHTML) {
    return function fixed() {
      return createHTML(this, 'tt', '', '');
    };
  }); // B.2.3.7 String.prototype.fontcolor(color)


  _stringHtml('fontcolor', function (createHTML) {
    return function fontcolor(color) {
      return createHTML(this, 'font', 'color', color);
    };
  }); // B.2.3.8 String.prototype.fontsize(size)


  _stringHtml('fontsize', function (createHTML) {
    return function fontsize(size) {
      return createHTML(this, 'font', 'size', size);
    };
  }); // B.2.3.9 String.prototype.italics()


  _stringHtml('italics', function (createHTML) {
    return function italics() {
      return createHTML(this, 'i', '', '');
    };
  }); // B.2.3.10 String.prototype.link(url)


  _stringHtml('link', function (createHTML) {
    return function link(url) {
      return createHTML(this, 'a', 'href', url);
    };
  }); // B.2.3.11 String.prototype.small()


  _stringHtml('small', function (createHTML) {
    return function small() {
      return createHTML(this, 'small', '', '');
    };
  }); // B.2.3.12 String.prototype.strike()


  _stringHtml('strike', function (createHTML) {
    return function strike() {
      return createHTML(this, 'strike', '', '');
    };
  }); // B.2.3.13 String.prototype.sub()


  _stringHtml('sub', function (createHTML) {
    return function sub() {
      return createHTML(this, 'sub', '', '');
    };
  }); // B.2.3.14 String.prototype.sup()


  _stringHtml('sup', function (createHTML) {
    return function sup() {
      return createHTML(this, 'sup', '', '');
    };
  }); // 20.3.3.1 / 15.9.4.4 Date.now()


  _export(_export.S, 'Date', {
    now: function now() {
      return new Date().getTime();
    }
  });

  _export(_export.P + _export.F * _fails(function () {
    return new Date(NaN).toJSON() !== null || Date.prototype.toJSON.call({
      toISOString: function toISOString() {
        return 1;
      }
    }) !== 1;
  }), 'Date', {
    // eslint-disable-next-line no-unused-vars
    toJSON: function toJSON(key) {
      var O = _toObject(this);

      var pv = _toPrimitive(O);

      return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
    }
  }); // 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()


  var getTime = Date.prototype.getTime;
  var $toISOString = Date.prototype.toISOString;

  var lz = function lz(num) {
    return num > 9 ? num : '0' + num;
  }; // PhantomJS / old WebKit has a broken implementations


  var _dateToIsoString = _fails(function () {
    return $toISOString.call(new Date(-5e13 - 1)) != '0385-07-25T07:06:39.999Z';
  }) || !_fails(function () {
    $toISOString.call(new Date(NaN));
  }) ? function toISOString() {
    if (!isFinite(getTime.call(this))) throw RangeError('Invalid time value');
    var d = this;
    var y = d.getUTCFullYear();
    var m = d.getUTCMilliseconds();
    var s = y < 0 ? '-' : y > 9999 ? '+' : '';
    return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) + '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) + 'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) + ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
  } : $toISOString; // 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
  // PhantomJS / old WebKit has a broken implementations


  _export(_export.P + _export.F * (Date.prototype.toISOString !== _dateToIsoString), 'Date', {
    toISOString: _dateToIsoString
  });

  var DateProto = Date.prototype;
  var INVALID_DATE = 'Invalid Date';
  var TO_STRING = 'toString';
  var $toString = DateProto[TO_STRING];
  var getTime$1 = DateProto.getTime;

  if (new Date(NaN) + '' != INVALID_DATE) {
    _redefine(DateProto, TO_STRING, function toString() {
      var value = getTime$1.call(this); // eslint-disable-next-line no-self-compare

      return value === value ? $toString.call(this) : INVALID_DATE;
    });
  }

  var NUMBER$1 = 'number';

  var _dateToPrimitive = function _dateToPrimitive(hint) {
    if (hint !== 'string' && hint !== NUMBER$1 && hint !== 'default') throw TypeError('Incorrect hint');
    return _toPrimitive(_anObject(this), hint != NUMBER$1);
  };

  var TO_PRIMITIVE$1 = _wks('toPrimitive');

  var proto$1 = Date.prototype;
  if (!(TO_PRIMITIVE$1 in proto$1)) _hide(proto$1, TO_PRIMITIVE$1, _dateToPrimitive); // 22.1.2.2 / 15.4.3.2 Array.isArray(arg)

  _export(_export.S, 'Array', {
    isArray: _isArray
  }); // call something on iterator step with safe closing on error


  var _iterCall = function _iterCall(iterator, fn, value, entries) {
    try {
      return entries ? fn(_anObject(value)[0], value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
    } catch (e) {
      var ret = iterator['return'];
      if (ret !== undefined) _anObject(ret.call(iterator));
      throw e;
    }
  }; // check on default Array iterator


  var ITERATOR$1 = _wks('iterator');

  var ArrayProto = Array.prototype;

  var _isArrayIter = function _isArrayIter(it) {
    return it !== undefined && (_iterators.Array === it || ArrayProto[ITERATOR$1] === it);
  };

  var _createProperty = function _createProperty(object, index, value) {
    if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));else object[index] = value;
  };

  var ITERATOR$2 = _wks('iterator');

  var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
    if (it != undefined) return it[ITERATOR$2] || it['@@iterator'] || _iterators[_classof(it)];
  };

  var ITERATOR$3 = _wks('iterator');

  var SAFE_CLOSING = false;

  try {
    var riter = [7][ITERATOR$3]();

    riter['return'] = function () {
      SAFE_CLOSING = true;
    }; // eslint-disable-next-line no-throw-literal


    Array.from(riter, function () {
      throw 2;
    });
  } catch (e) {
    /* empty */
  }

  var _iterDetect = function _iterDetect(exec, skipClosing) {
    if (!skipClosing && !SAFE_CLOSING) return false;
    var safe = false;

    try {
      var arr = [7];
      var iter = arr[ITERATOR$3]();

      iter.next = function () {
        return {
          done: safe = true
        };
      };

      arr[ITERATOR$3] = function () {
        return iter;
      };

      exec(arr);
    } catch (e) {
      /* empty */
    }

    return safe;
  };

  _export(_export.S + _export.F * !_iterDetect(function (iter) {
    Array.from(iter);
  }), 'Array', {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function from(arrayLike
    /* , mapfn = undefined, thisArg = undefined */
    ) {
      var O = _toObject(arrayLike);

      var C = typeof this == 'function' ? this : Array;
      var aLen = arguments.length;
      var mapfn = aLen > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      var index = 0;
      var iterFn = core_getIteratorMethod(O);
      var length, result, step, iterator;
      if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2); // if object isn't iterable or it's array with default iterator - use simple case

      if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
        for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
          _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
        }
      } else {
        length = _toLength(O.length);

        for (result = new C(length); length > index; index++) {
          _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
        }
      }

      result.length = index;
      return result;
    }
  }); // WebKit Array.of isn't generic


  _export(_export.S + _export.F * _fails(function () {
    function F() {
      /* empty */
    }

    return !(Array.of.call(F) instanceof F);
  }), 'Array', {
    // 22.1.2.3 Array.of( ...items)
    of: function of()
    /* ...args */
    {
      var index = 0;
      var aLen = arguments.length;
      var result = new (typeof this == 'function' ? this : Array)(aLen);

      while (aLen > index) {
        _createProperty(result, index, arguments[index++]);
      }

      result.length = aLen;
      return result;
    }
  });

  var _strictMethod = function _strictMethod(method, arg) {
    return !!method && _fails(function () {
      // eslint-disable-next-line no-useless-call
      arg ? method.call(null, function () {
        /* empty */
      }, 1) : method.call(null);
    });
  }; // 22.1.3.13 Array.prototype.join(separator)


  var arrayJoin = [].join; // fallback for not array-like strings

  _export(_export.P + _export.F * (_iobject != Object || !_strictMethod(arrayJoin)), 'Array', {
    join: function join(separator) {
      return arrayJoin.call(_toIobject(this), separator === undefined ? ',' : separator);
    }
  });

  var arraySlice$1 = [].slice; // fallback for not array-like ES3 strings and DOM objects

  _export(_export.P + _export.F * _fails(function () {
    if (_html) arraySlice$1.call(_html);
  }), 'Array', {
    slice: function slice(begin, end) {
      var len = _toLength(this.length);

      var klass = _cof(this);

      end = end === undefined ? len : end;
      if (klass == 'Array') return arraySlice$1.call(this, begin, end);

      var start = _toAbsoluteIndex(begin, len);

      var upTo = _toAbsoluteIndex(end, len);

      var size = _toLength(upTo - start);

      var cloned = new Array(size);
      var i = 0;

      for (; i < size; i++) {
        cloned[i] = klass == 'String' ? this.charAt(start + i) : this[start + i];
      }

      return cloned;
    }
  });

  var $sort = [].sort;
  var test$1 = [1, 2, 3];

  _export(_export.P + _export.F * (_fails(function () {
    // IE8-
    test$1.sort(undefined);
  }) || !_fails(function () {
    // V8 bug
    test$1.sort(null); // Old WebKit
  }) || !_strictMethod($sort)), 'Array', {
    // 22.1.3.25 Array.prototype.sort(comparefn)
    sort: function sort(comparefn) {
      return comparefn === undefined ? $sort.call(_toObject(this)) : $sort.call(_toObject(this), _aFunction(comparefn));
    }
  });

  var SPECIES = _wks('species');

  var _arraySpeciesConstructor = function _arraySpeciesConstructor(original) {
    var C;

    if (_isArray(original)) {
      C = original.constructor; // cross-realm fallback

      if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;

      if (_isObject(C)) {
        C = C[SPECIES];
        if (C === null) C = undefined;
      }
    }

    return C === undefined ? Array : C;
  }; // 9.4.2.3 ArraySpeciesCreate(originalArray, length)


  var _arraySpeciesCreate = function _arraySpeciesCreate(original, length) {
    return new (_arraySpeciesConstructor(original))(length);
  }; // 0 -> Array#forEach
  // 1 -> Array#map
  // 2 -> Array#filter
  // 3 -> Array#some
  // 4 -> Array#every
  // 5 -> Array#find
  // 6 -> Array#findIndex


  var _arrayMethods = function _arrayMethods(TYPE, $create) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    var create = $create || _arraySpeciesCreate;
    return function ($this, callbackfn, that) {
      var O = _toObject($this);

      var self = _iobject(O);

      var f = _ctx(callbackfn, that, 3);

      var length = _toLength(self.length);

      var index = 0;
      var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
      var val, res;

      for (; length > index; index++) {
        if (NO_HOLES || index in self) {
          val = self[index];
          res = f(val, index, O);

          if (TYPE) {
            if (IS_MAP) result[index] = res; // map
            else if (res) switch (TYPE) {
                case 3:
                  return true;
                // some

                case 5:
                  return val;
                // find

                case 6:
                  return index;
                // findIndex

                case 2:
                  result.push(val);
                // filter
              } else if (IS_EVERY) return false; // every
          }
        }
      }

      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
    };
  };

  var $forEach = _arrayMethods(0);

  var STRICT = _strictMethod([].forEach, true);

  _export(_export.P + _export.F * !STRICT, 'Array', {
    // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
    forEach: function forEach(callbackfn
    /* , thisArg */
    ) {
      return $forEach(this, callbackfn, arguments[1]);
    }
  });

  var $map = _arrayMethods(1);

  _export(_export.P + _export.F * !_strictMethod([].map, true), 'Array', {
    // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
    map: function map(callbackfn
    /* , thisArg */
    ) {
      return $map(this, callbackfn, arguments[1]);
    }
  });

  var $filter = _arrayMethods(2);

  _export(_export.P + _export.F * !_strictMethod([].filter, true), 'Array', {
    // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
    filter: function filter(callbackfn
    /* , thisArg */
    ) {
      return $filter(this, callbackfn, arguments[1]);
    }
  });

  var $some = _arrayMethods(3);

  _export(_export.P + _export.F * !_strictMethod([].some, true), 'Array', {
    // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
    some: function some(callbackfn
    /* , thisArg */
    ) {
      return $some(this, callbackfn, arguments[1]);
    }
  });

  var $every = _arrayMethods(4);

  _export(_export.P + _export.F * !_strictMethod([].every, true), 'Array', {
    // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
    every: function every(callbackfn
    /* , thisArg */
    ) {
      return $every(this, callbackfn, arguments[1]);
    }
  });

  var _arrayReduce = function _arrayReduce(that, callbackfn, aLen, memo, isRight) {
    _aFunction(callbackfn);

    var O = _toObject(that);

    var self = _iobject(O);

    var length = _toLength(O.length);

    var index = isRight ? length - 1 : 0;
    var i = isRight ? -1 : 1;
    if (aLen < 2) for (;;) {
      if (index in self) {
        memo = self[index];
        index += i;
        break;
      }

      index += i;

      if (isRight ? index < 0 : length <= index) {
        throw TypeError('Reduce of empty array with no initial value');
      }
    }

    for (; isRight ? index >= 0 : length > index; index += i) {
      if (index in self) {
        memo = callbackfn(memo, self[index], index, O);
      }
    }

    return memo;
  };

  _export(_export.P + _export.F * !_strictMethod([].reduce, true), 'Array', {
    // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
    reduce: function reduce(callbackfn
    /* , initialValue */
    ) {
      return _arrayReduce(this, callbackfn, arguments.length, arguments[1], false);
    }
  });

  _export(_export.P + _export.F * !_strictMethod([].reduceRight, true), 'Array', {
    // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
    reduceRight: function reduceRight(callbackfn
    /* , initialValue */
    ) {
      return _arrayReduce(this, callbackfn, arguments.length, arguments[1], true);
    }
  });

  var $indexOf = _arrayIncludes(false);

  var $native = [].indexOf;
  var NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;

  _export(_export.P + _export.F * (NEGATIVE_ZERO || !_strictMethod($native)), 'Array', {
    // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
    indexOf: function indexOf(searchElement
    /* , fromIndex = 0 */
    ) {
      return NEGATIVE_ZERO // convert -0 to +0
      ? $native.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments[1]);
    }
  });

  var $native$1 = [].lastIndexOf;
  var NEGATIVE_ZERO$1 = !!$native$1 && 1 / [1].lastIndexOf(1, -0) < 0;

  _export(_export.P + _export.F * (NEGATIVE_ZERO$1 || !_strictMethod($native$1)), 'Array', {
    // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
    lastIndexOf: function lastIndexOf(searchElement
    /* , fromIndex = @[*-1] */
    ) {
      // convert -0 to +0
      if (NEGATIVE_ZERO$1) return $native$1.apply(this, arguments) || 0;

      var O = _toIobject(this);

      var length = _toLength(O.length);

      var index = length - 1;
      if (arguments.length > 1) index = Math.min(index, _toInteger(arguments[1]));
      if (index < 0) index = length + index;

      for (; index >= 0; index--) {
        if (index in O) if (O[index] === searchElement) return index || 0;
      }

      return -1;
    }
  });

  var _arrayCopyWithin = [].copyWithin || function copyWithin(target
  /* = 0 */
  , start
  /* = 0, end = @length */
  ) {
    var O = _toObject(this);

    var len = _toLength(O.length);

    var to = _toAbsoluteIndex(target, len);

    var from = _toAbsoluteIndex(start, len);

    var end = arguments.length > 2 ? arguments[2] : undefined;
    var count = Math.min((end === undefined ? len : _toAbsoluteIndex(end, len)) - from, len - to);
    var inc = 1;

    if (from < to && to < from + count) {
      inc = -1;
      from += count - 1;
      to += count - 1;
    }

    while (count-- > 0) {
      if (from in O) O[to] = O[from];else delete O[to];
      to += inc;
      from += inc;
    }

    return O;
  }; // 22.1.3.31 Array.prototype[@@unscopables]


  var UNSCOPABLES = _wks('unscopables');

  var ArrayProto$1 = Array.prototype;
  if (ArrayProto$1[UNSCOPABLES] == undefined) _hide(ArrayProto$1, UNSCOPABLES, {});

  var _addToUnscopables = function _addToUnscopables(key) {
    ArrayProto$1[UNSCOPABLES][key] = true;
  }; // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)


  _export(_export.P, 'Array', {
    copyWithin: _arrayCopyWithin
  });

  _addToUnscopables('copyWithin');

  var _arrayFill = function fill(value
  /* , start = 0, end = @length */
  ) {
    var O = _toObject(this);

    var length = _toLength(O.length);

    var aLen = arguments.length;

    var index = _toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);

    var end = aLen > 2 ? arguments[2] : undefined;
    var endPos = end === undefined ? length : _toAbsoluteIndex(end, length);

    while (endPos > index) {
      O[index++] = value;
    }

    return O;
  }; // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)


  _export(_export.P, 'Array', {
    fill: _arrayFill
  });

  _addToUnscopables('fill'); // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)


  var $find = _arrayMethods(5);

  var KEY = 'find';
  var forced = true; // Shouldn't skip holes

  if (KEY in []) Array(1)[KEY](function () {
    forced = false;
  });

  _export(_export.P + _export.F * forced, 'Array', {
    find: function find(callbackfn
    /* , that = undefined */
    ) {
      return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  _addToUnscopables(KEY); // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)


  var $find$1 = _arrayMethods(6);

  var KEY$1 = 'findIndex';
  var forced$1 = true; // Shouldn't skip holes

  if (KEY$1 in []) Array(1)[KEY$1](function () {
    forced$1 = false;
  });

  _export(_export.P + _export.F * forced$1, 'Array', {
    findIndex: function findIndex(callbackfn
    /* , that = undefined */
    ) {
      return $find$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  _addToUnscopables(KEY$1);

  var SPECIES$1 = _wks('species');

  var _setSpecies = function _setSpecies(KEY) {
    var C = _global[KEY];
    if (_descriptors && C && !C[SPECIES$1]) _objectDp.f(C, SPECIES$1, {
      configurable: true,
      get: function get() {
        return this;
      }
    });
  };

  _setSpecies('Array');

  var _iterStep = function _iterStep(done, value) {
    return {
      value: value,
      done: !!done
    };
  }; // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()


  var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
    this._t = _toIobject(iterated); // target

    this._i = 0; // next index

    this._k = kind; // kind
    // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var kind = this._k;
    var index = this._i++;

    if (!O || index >= O.length) {
      this._t = undefined;
      return _iterStep(1);
    }

    if (kind == 'keys') return _iterStep(0, index);
    if (kind == 'values') return _iterStep(0, O[index]);
    return _iterStep(0, [index, O[index]]);
  }, 'values'); // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)


  _iterators.Arguments = _iterators.Array;

  _addToUnscopables('keys');

  _addToUnscopables('values');

  _addToUnscopables('entries'); // 21.2.5.3 get RegExp.prototype.flags


  var _flags = function _flags() {
    var that = _anObject(this);

    var result = '';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.unicode) result += 'u';
    if (that.sticky) result += 'y';
    return result;
  };

  var dP$4 = _objectDp.f;
  var gOPN$3 = _objectGopn.f;
  var $RegExp = _global.RegExp;
  var Base$1 = $RegExp;
  var proto$2 = $RegExp.prototype;
  var re1 = /a/g;
  var re2 = /a/g; // "new" creates a new object, old webkit buggy here

  var CORRECT_NEW = new $RegExp(re1) !== re1;

  if (_descriptors && (!CORRECT_NEW || _fails(function () {
    re2[_wks('match')] = false; // RegExp constructor can alter flags and IsRegExp works correct with @@match

    return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
  }))) {
    $RegExp = function RegExp(p, f) {
      var tiRE = this instanceof $RegExp;

      var piRE = _isRegexp(p);

      var fiU = f === undefined;
      return !tiRE && piRE && p.constructor === $RegExp && fiU ? p : _inheritIfRequired(CORRECT_NEW ? new Base$1(piRE && !fiU ? p.source : p, f) : Base$1((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? _flags.call(p) : f), tiRE ? this : proto$2, $RegExp);
    };

    var proxy = function proxy(key) {
      key in $RegExp || dP$4($RegExp, key, {
        configurable: true,
        get: function get() {
          return Base$1[key];
        },
        set: function set(it) {
          Base$1[key] = it;
        }
      });
    };

    for (var keys$1 = gOPN$3(Base$1), i = 0; keys$1.length > i;) {
      proxy(keys$1[i++]);
    }

    proto$2.constructor = $RegExp;
    $RegExp.prototype = proto$2;

    _redefine(_global, 'RegExp', $RegExp);
  }

  _setSpecies('RegExp');

  var nativeExec = RegExp.prototype.exec; // This always refers to the native implementation, because the
  // String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
  // which loads this file before patching the method.

  var nativeReplace = String.prototype.replace;
  var patchedExec = nativeExec;
  var LAST_INDEX = 'lastIndex';

  var UPDATES_LAST_INDEX_WRONG = function () {
    var re1 = /a/,
        re2 = /b*/g;
    nativeExec.call(re1, 'a');
    nativeExec.call(re2, 'a');
    return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
  }(); // nonparticipating capturing group, copied from es5-shim's String#split patch.


  var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;
  var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

  if (PATCH) {
    patchedExec = function exec(str) {
      var re = this;
      var lastIndex, reCopy, match, i;

      if (NPCG_INCLUDED) {
        reCopy = new RegExp('^' + re.source + '$(?!\\s)', _flags.call(re));
      }

      if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];
      match = nativeExec.call(re, str);

      if (UPDATES_LAST_INDEX_WRONG && match) {
        re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
      }

      if (NPCG_INCLUDED && match && match.length > 1) {
        // Fix browsers whose `exec` methods don't consistently return `undefined`
        // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
        // eslint-disable-next-line no-loop-func
        nativeReplace.call(match[0], reCopy, function () {
          for (i = 1; i < arguments.length - 2; i++) {
            if (arguments[i] === undefined) match[i] = undefined;
          }
        });
      }

      return match;
    };
  }

  var _regexpExec = patchedExec;

  _export({
    target: 'RegExp',
    proto: true,
    forced: _regexpExec !== /./.exec
  }, {
    exec: _regexpExec
  }); // 21.2.5.3 get RegExp.prototype.flags()


  if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
    configurable: true,
    get: _flags
  });
  var TO_STRING$1 = 'toString';
  var $toString$1 = /./[TO_STRING$1];

  var define = function define(fn) {
    _redefine(RegExp.prototype, TO_STRING$1, fn, true);
  }; // 21.2.5.14 RegExp.prototype.toString()


  if (_fails(function () {
    return $toString$1.call({
      source: 'a',
      flags: 'b'
    }) != '/a/b';
  })) {
    define(function toString() {
      var R = _anObject(this);

      return '/'.concat(R.source, '/', 'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
    }); // FF44- RegExp#toString has a wrong name
  } else if ($toString$1.name != TO_STRING$1) {
    define(function toString() {
      return $toString$1.call(this);
    });
  }

  var at = _stringAt(true); // `AdvanceStringIndex` abstract operation
  // https://tc39.github.io/ecma262/#sec-advancestringindex


  var _advanceStringIndex = function _advanceStringIndex(S, index, unicode) {
    return index + (unicode ? at(S, index).length : 1);
  };

  var builtinExec = RegExp.prototype.exec; // `RegExpExec` abstract operation
  // https://tc39.github.io/ecma262/#sec-regexpexec

  var _regexpExecAbstract = function _regexpExecAbstract(R, S) {
    var exec = R.exec;

    if (typeof exec === 'function') {
      var result = exec.call(R, S);

      if (_typeof2(result) !== 'object') {
        throw new TypeError('RegExp exec method returned something other than an Object or null');
      }

      return result;
    }

    if (_classof(R) !== 'RegExp') {
      throw new TypeError('RegExp#exec called on incompatible receiver');
    }

    return builtinExec.call(R, S);
  };

  var SPECIES$2 = _wks('species');

  var REPLACE_SUPPORTS_NAMED_GROUPS = !_fails(function () {
    // #replace needs built-in support for named groups.
    // #match works fine because it just return the exec results, even if it has
    // a "grops" property.
    var re = /./;

    re.exec = function () {
      var result = [];
      result.groups = {
        a: '7'
      };
      return result;
    };

    return ''.replace(re, '$<a>') !== '7';
  });

  var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = function () {
    // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
    var re = /(?:)/;
    var originalExec = re.exec;

    re.exec = function () {
      return originalExec.apply(this, arguments);
    };

    var result = 'ab'.split(re);
    return result.length === 2 && result[0] === 'a' && result[1] === 'b';
  }();

  var _fixReWks = function _fixReWks(KEY, length, exec) {
    var SYMBOL = _wks(KEY);

    var DELEGATES_TO_SYMBOL = !_fails(function () {
      // String methods call symbol-named RegEp methods
      var O = {};

      O[SYMBOL] = function () {
        return 7;
      };

      return ''[KEY](O) != 7;
    });
    var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !_fails(function () {
      // Symbol-named RegExp methods call .exec
      var execCalled = false;
      var re = /a/;

      re.exec = function () {
        execCalled = true;
        return null;
      };

      if (KEY === 'split') {
        // RegExp[@@split] doesn't call the regex's exec method, but first creates
        // a new one. We need to return the patched regex when creating the new one.
        re.constructor = {};

        re.constructor[SPECIES$2] = function () {
          return re;
        };
      }

      re[SYMBOL]('');
      return !execCalled;
    }) : undefined;

    if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS || KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC) {
      var nativeRegExpMethod = /./[SYMBOL];
      var fns = exec(_defined, SYMBOL, ''[KEY], function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === _regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return {
              done: true,
              value: nativeRegExpMethod.call(regexp, str, arg2)
            };
          }

          return {
            done: true,
            value: nativeMethod.call(str, regexp, arg2)
          };
        }

        return {
          done: false
        };
      });
      var strfn = fns[0];
      var rxfn = fns[1];

      _redefine(String.prototype, KEY, strfn);

      _hide(RegExp.prototype, SYMBOL, length == 2 // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) {
        return rxfn.call(string, this, arg);
      } // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) {
        return rxfn.call(string, this);
      });
    }
  }; // @@match logic


  _fixReWks('match', 1, function (defined, MATCH, $match, maybeCallNative) {
    return [// `String.prototype.match` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = defined(this);
      var fn = regexp == undefined ? undefined : regexp[MATCH];
      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    }, // `RegExp.prototype[@@match]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
    function (regexp) {
      var res = maybeCallNative($match, regexp, this);
      if (res.done) return res.value;

      var rx = _anObject(regexp);

      var S = String(this);
      if (!rx.global) return _regexpExecAbstract(rx, S);
      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;

      while ((result = _regexpExecAbstract(rx, S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
        n++;
      }

      return n === 0 ? null : A;
    }];
  });

  var max$1 = Math.max;
  var min$2 = Math.min;
  var floor$3 = Math.floor;
  var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
  var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

  var maybeToString = function maybeToString(it) {
    return it === undefined ? it : String(it);
  }; // @@replace logic


  _fixReWks('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
    return [// `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = defined(this);
      var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
      return fn !== undefined ? fn.call(searchValue, O, replaceValue) : $replace.call(String(O), searchValue, replaceValue);
    }, // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      var res = maybeCallNative($replace, regexp, this, replaceValue);
      if (res.done) return res.value;

      var rx = _anObject(regexp);

      var S = String(this);
      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);
      var global = rx.global;

      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }

      var results = [];

      while (true) {
        var result = _regexpExecAbstract(rx, S);

        if (result === null) break;
        results.push(result);
        if (!global) break;
        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;

      for (var i = 0; i < results.length; i++) {
        result = results[i];
        var matched = String(result[0]);
        var position = max$1(min$2(_toInteger(result.index), S.length), 0);
        var captures = []; // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.

        for (var j = 1; j < result.length; j++) {
          captures.push(maybeToString(result[j]));
        }

        var namedCaptures = result.groups;

        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }

        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }

      return accumulatedResult + S.slice(nextSourcePosition);
    }]; // https://tc39.github.io/ecma262/#sec-getsubstitution

    function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
      var tailPos = position + matched.length;
      var m = captures.length;
      var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;

      if (namedCaptures !== undefined) {
        namedCaptures = _toObject(namedCaptures);
        symbols = SUBSTITUTION_SYMBOLS;
      }

      return $replace.call(replacement, symbols, function (match, ch) {
        var capture;

        switch (ch.charAt(0)) {
          case '$':
            return '$';

          case '&':
            return matched;

          case '`':
            return str.slice(0, position);

          case "'":
            return str.slice(tailPos);

          case '<':
            capture = namedCaptures[ch.slice(1, -1)];
            break;

          default:
            // \d\d?
            var n = +ch;
            if (n === 0) return match;

            if (n > m) {
              var f = floor$3(n / 10);
              if (f === 0) return match;
              if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
              return match;
            }

            capture = captures[n - 1];
        }

        return capture === undefined ? '' : capture;
      });
    }
  }); // @@search logic


  _fixReWks('search', 1, function (defined, SEARCH, $search, maybeCallNative) {
    return [// `String.prototype.search` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = defined(this);
      var fn = regexp == undefined ? undefined : regexp[SEARCH];
      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
    }, // `RegExp.prototype[@@search]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
    function (regexp) {
      var res = maybeCallNative($search, regexp, this);
      if (res.done) return res.value;

      var rx = _anObject(regexp);

      var S = String(this);
      var previousLastIndex = rx.lastIndex;
      if (!_sameValue(previousLastIndex, 0)) rx.lastIndex = 0;

      var result = _regexpExecAbstract(rx, S);

      if (!_sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
      return result === null ? -1 : result.index;
    }];
  }); // 7.3.20 SpeciesConstructor(O, defaultConstructor)


  var SPECIES$3 = _wks('species');

  var _speciesConstructor = function _speciesConstructor(O, D) {
    var C = _anObject(O).constructor;

    var S;
    return C === undefined || (S = _anObject(C)[SPECIES$3]) == undefined ? D : _aFunction(S);
  };

  var $min = Math.min;
  var $push = [].push;
  var $SPLIT = 'split';
  var LENGTH = 'length';
  var LAST_INDEX$1 = 'lastIndex';
  var MAX_UINT32 = 0xffffffff; // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError

  var SUPPORTS_Y = !_fails(function () {
    RegExp(MAX_UINT32, 'y');
  }); // @@split logic

  _fixReWks('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
    var internalSplit;

    if ('abbc'[$SPLIT](/(b)*/)[1] == 'c' || 'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 || 'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 || '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 || '.'[$SPLIT](/()()/)[LENGTH] > 1 || ''[$SPLIT](/.?/)[LENGTH]) {
      // based on es5-shim implementation, need to rework it
      internalSplit = function internalSplit(separator, limit) {
        var string = String(this);
        if (separator === undefined && limit === 0) return []; // If `separator` is not a regex, use native split

        if (!_isRegexp(separator)) return $split.call(string, separator, limit);
        var output = [];
        var flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.unicode ? 'u' : '') + (separator.sticky ? 'y' : '');
        var lastLastIndex = 0;
        var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0; // Make `global` and avoid `lastIndex` issues by working with a copy

        var separatorCopy = new RegExp(separator.source, flags + 'g');
        var match, lastIndex, lastLength;

        while (match = _regexpExec.call(separatorCopy, string)) {
          lastIndex = separatorCopy[LAST_INDEX$1];

          if (lastIndex > lastLastIndex) {
            output.push(string.slice(lastLastIndex, match.index));
            if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
            lastLength = match[0][LENGTH];
            lastLastIndex = lastIndex;
            if (output[LENGTH] >= splitLimit) break;
          }

          if (separatorCopy[LAST_INDEX$1] === match.index) separatorCopy[LAST_INDEX$1]++; // Avoid an infinite loop
        }

        if (lastLastIndex === string[LENGTH]) {
          if (lastLength || !separatorCopy.test('')) output.push('');
        } else output.push(string.slice(lastLastIndex));

        return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
      }; // Chakra, V8

    } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
      internalSplit = function internalSplit(separator, limit) {
        return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
      };
    } else {
      internalSplit = $split;
    }

    return [// `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = defined(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined ? splitter.call(separator, O, limit) : internalSplit.call(String(O), separator, limit);
    }, // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
      if (res.done) return res.value;

      var rx = _anObject(regexp);

      var S = String(this);

      var C = _speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') + (rx.multiline ? 'm' : '') + (rx.unicode ? 'u' : '') + (SUPPORTS_Y ? 'y' : 'g'); // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.

      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return _regexpExecAbstract(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];

      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;

        var z = _regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));

        var e;

        if (z === null || (e = $min(_toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p) {
          q = _advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;

          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }

          q = p = e;
        }
      }

      A.push(S.slice(p));
      return A;
    }];
  });

  var _anInstance = function _anInstance(it, Constructor, name, forbiddenField) {
    if (!(it instanceof Constructor) || forbiddenField !== undefined && forbiddenField in it) {
      throw TypeError(name + ': incorrect invocation!');
    }

    return it;
  };

  var _forOf = createCommonjsModule(function (module) {
    var BREAK = {};
    var RETURN = {};

    var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
      var iterFn = ITERATOR ? function () {
        return iterable;
      } : core_getIteratorMethod(iterable);

      var f = _ctx(fn, that, entries ? 2 : 1);

      var index = 0;
      var length, step, iterator, result;
      if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!'); // fast case for arrays with default iterator

      if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
        result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
        if (result === BREAK || result === RETURN) return result;
      } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
        result = _iterCall(iterator, f, step.value, entries);
        if (result === BREAK || result === RETURN) return result;
      }
    };

    exports.BREAK = BREAK;
    exports.RETURN = RETURN;
  });

  var process = _global.process;
  var setTask = _global.setImmediate;
  var clearTask = _global.clearImmediate;
  var MessageChannel = _global.MessageChannel;
  var Dispatch = _global.Dispatch;
  var counter = 0;
  var queue = {};
  var ONREADYSTATECHANGE = 'onreadystatechange';
  var defer, channel, port;

  var run = function run() {
    var id = +this; // eslint-disable-next-line no-prototype-builtins

    if (queue.hasOwnProperty(id)) {
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  };

  var listener = function listener(event) {
    run.call(event.data);
  }; // Node.js 0.9+ & IE10+ has setImmediate, otherwise:


  if (!setTask || !clearTask) {
    setTask = function setImmediate(fn) {
      var args = [];
      var i = 1;

      while (arguments.length > i) {
        args.push(arguments[i++]);
      }

      queue[++counter] = function () {
        // eslint-disable-next-line no-new-func
        _invoke(typeof fn == 'function' ? fn : Function(fn), args);
      };

      defer(counter);
      return counter;
    };

    clearTask = function clearImmediate(id) {
      delete queue[id];
    }; // Node.js 0.8-


    if (_cof(process) == 'process') {
      defer = function defer(id) {
        process.nextTick(_ctx(run, id, 1));
      }; // Sphere (JS game engine) Dispatch API

    } else if (Dispatch && Dispatch.now) {
      defer = function defer(id) {
        Dispatch.now(_ctx(run, id, 1));
      }; // Browsers with MessageChannel, includes WebWorkers

    } else if (MessageChannel) {
      channel = new MessageChannel();
      port = channel.port2;
      channel.port1.onmessage = listener;
      defer = _ctx(port.postMessage, port, 1); // Browsers with postMessage, skip WebWorkers
      // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
    } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
      defer = function defer(id) {
        _global.postMessage(id + '', '*');
      };

      _global.addEventListener('message', listener, false); // IE8-

    } else if (ONREADYSTATECHANGE in _domCreate('script')) {
      defer = function defer(id) {
        _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
          _html.removeChild(this);

          run.call(id);
        };
      }; // Rest old browsers

    } else {
      defer = function defer(id) {
        setTimeout(_ctx(run, id, 1), 0);
      };
    }
  }

  var _task = {
    set: setTask,
    clear: clearTask
  };
  var macrotask = _task.set;
  var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
  var process$1 = _global.process;
  var Promise$1 = _global.Promise;
  var isNode = _cof(process$1) == 'process';

  var _microtask = function _microtask() {
    var head, last, notify;

    var flush = function flush() {
      var parent, fn;
      if (isNode && (parent = process$1.domain)) parent.exit();

      while (head) {
        fn = head.fn;
        head = head.next;

        try {
          fn();
        } catch (e) {
          if (head) notify();else last = undefined;
          throw e;
        }
      }

      last = undefined;
      if (parent) parent.enter();
    }; // Node.js


    if (isNode) {
      notify = function notify() {
        process$1.nextTick(flush);
      }; // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339

    } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
      var toggle = true;
      var node = document.createTextNode('');
      new Observer(flush).observe(node, {
        characterData: true
      }); // eslint-disable-line no-new

      notify = function notify() {
        node.data = toggle = !toggle;
      }; // environments with maybe non-completely correct, but existent Promise

    } else if (Promise$1 && Promise$1.resolve) {
      // Promise.resolve without an argument throws an error in LG WebOS 2
      var promise = Promise$1.resolve(undefined);

      notify = function notify() {
        promise.then(flush);
      }; // for other environments - macrotask based on:
      // - setImmediate
      // - MessageChannel
      // - window.postMessag
      // - onreadystatechange
      // - setTimeout

    } else {
      notify = function notify() {
        // strange IE + webpack dev server bug - use .call(global)
        macrotask.call(_global, flush);
      };
    }

    return function (fn) {
      var task = {
        fn: fn,
        next: undefined
      };
      if (last) last.next = task;

      if (!head) {
        head = task;
        notify();
      }

      last = task;
    };
  }; // 25.4.1.5 NewPromiseCapability(C)


  function PromiseCapability(C) {
    var resolve, reject;
    this.promise = new C(function ($$resolve, $$reject) {
      if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
      resolve = $$resolve;
      reject = $$reject;
    });
    this.resolve = _aFunction(resolve);
    this.reject = _aFunction(reject);
  }

  var f$7 = function f$7(C) {
    return new PromiseCapability(C);
  };

  var _newPromiseCapability = {
    f: f$7
  };

  var _perform = function _perform(exec) {
    try {
      return {
        e: false,
        v: exec()
      };
    } catch (e) {
      return {
        e: true,
        v: e
      };
    }
  };

  var navigator = _global.navigator;

  var _userAgent = navigator && navigator.userAgent || '';

  var _promiseResolve = function _promiseResolve(C, x) {
    _anObject(C);

    if (_isObject(x) && x.constructor === C) return x;

    var promiseCapability = _newPromiseCapability.f(C);

    var resolve = promiseCapability.resolve;
    resolve(x);
    return promiseCapability.promise;
  };

  var _redefineAll = function _redefineAll(target, src, safe) {
    for (var key in src) {
      _redefine(target, key, src[key], safe);
    }

    return target;
  };

  var task = _task.set;

  var microtask = _microtask();

  var PROMISE = 'Promise';
  var TypeError$1 = _global.TypeError;
  var process$2 = _global.process;
  var versions = process$2 && process$2.versions;
  var v8 = versions && versions.v8 || '';
  var $Promise = _global[PROMISE];
  var isNode$1 = _classof(process$2) == 'process';

  var empty = function empty() {
    /* empty */
  };

  var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
  var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;
  var USE_NATIVE$1 = !!function () {
    try {
      // correct subclassing with @@species support
      var promise = $Promise.resolve(1);

      var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
        exec(empty, empty);
      }; // unhandled rejections tracking support, NodeJS Promise without it fails @@species test


      return (isNode$1 || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0 && _userAgent.indexOf('Chrome/66') === -1;
    } catch (e) {
      /* empty */
    }
  }(); // helpers

  var isThenable = function isThenable(it) {
    var then;
    return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
  };

  var notify = function notify(promise, isReject) {
    if (promise._n) return;
    promise._n = true;
    var chain = promise._c;
    microtask(function () {
      var value = promise._v;
      var ok = promise._s == 1;
      var i = 0;

      var run = function run(reaction) {
        var handler = ok ? reaction.ok : reaction.fail;
        var resolve = reaction.resolve;
        var reject = reaction.reject;
        var domain = reaction.domain;
        var result, then, exited;

        try {
          if (handler) {
            if (!ok) {
              if (promise._h == 2) onHandleUnhandled(promise);
              promise._h = 1;
            }

            if (handler === true) result = value;else {
              if (domain) domain.enter();
              result = handler(value); // may throw

              if (domain) {
                domain.exit();
                exited = true;
              }
            }

            if (result === reaction.promise) {
              reject(TypeError$1('Promise-chain cycle'));
            } else if (then = isThenable(result)) {
              then.call(result, resolve, reject);
            } else resolve(result);
          } else reject(value);
        } catch (e) {
          if (domain && !exited) domain.exit();
          reject(e);
        }
      };

      while (chain.length > i) {
        run(chain[i++]);
      } // variable length - can't use forEach


      promise._c = [];
      promise._n = false;
      if (isReject && !promise._h) onUnhandled(promise);
    });
  };

  var onUnhandled = function onUnhandled(promise) {
    task.call(_global, function () {
      var value = promise._v;
      var unhandled = isUnhandled(promise);
      var result, handler, console;

      if (unhandled) {
        result = _perform(function () {
          if (isNode$1) {
            process$2.emit('unhandledRejection', value, promise);
          } else if (handler = _global.onunhandledrejection) {
            handler({
              promise: promise,
              reason: value
            });
          } else if ((console = _global.console) && console.error) {
            console.error('Unhandled promise rejection', value);
          }
        }); // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should

        promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
      }

      promise._a = undefined;
      if (unhandled && result.e) throw result.v;
    });
  };

  var isUnhandled = function isUnhandled(promise) {
    return promise._h !== 1 && (promise._a || promise._c).length === 0;
  };

  var onHandleUnhandled = function onHandleUnhandled(promise) {
    task.call(_global, function () {
      var handler;

      if (isNode$1) {
        process$2.emit('rejectionHandled', promise);
      } else if (handler = _global.onrejectionhandled) {
        handler({
          promise: promise,
          reason: promise._v
        });
      }
    });
  };

  var $reject = function $reject(value) {
    var promise = this;
    if (promise._d) return;
    promise._d = true;
    promise = promise._w || promise; // unwrap

    promise._v = value;
    promise._s = 2;
    if (!promise._a) promise._a = promise._c.slice();
    notify(promise, true);
  };

  var $resolve = function $resolve(value) {
    var promise = this;
    var then;
    if (promise._d) return;
    promise._d = true;
    promise = promise._w || promise; // unwrap

    try {
      if (promise === value) throw TypeError$1("Promise can't be resolved itself");

      if (then = isThenable(value)) {
        microtask(function () {
          var wrapper = {
            _w: promise,
            _d: false
          }; // wrap

          try {
            then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
          } catch (e) {
            $reject.call(wrapper, e);
          }
        });
      } else {
        promise._v = value;
        promise._s = 1;
        notify(promise, false);
      }
    } catch (e) {
      $reject.call({
        _w: promise,
        _d: false
      }, e); // wrap
    }
  }; // constructor polyfill


  if (!USE_NATIVE$1) {
    // 25.4.3.1 Promise(executor)
    $Promise = function Promise(executor) {
      _anInstance(this, $Promise, PROMISE, '_h');

      _aFunction(executor);

      Internal.call(this);

      try {
        executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
      } catch (err) {
        $reject.call(this, err);
      }
    }; // eslint-disable-next-line no-unused-vars


    Internal = function Promise(executor) {
      this._c = []; // <- awaiting reactions

      this._a = undefined; // <- checked in isUnhandled reactions

      this._s = 0; // <- state

      this._d = false; // <- done

      this._v = undefined; // <- value

      this._h = 0; // <- rejection state, 0 - default, 1 - handled, 2 - unhandled

      this._n = false; // <- notify
    };

    Internal.prototype = _redefineAll($Promise.prototype, {
      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
      then: function then(onFulfilled, onRejected) {
        var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
        reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
        reaction.fail = typeof onRejected == 'function' && onRejected;
        reaction.domain = isNode$1 ? process$2.domain : undefined;

        this._c.push(reaction);

        if (this._a) this._a.push(reaction);
        if (this._s) notify(this, false);
        return reaction.promise;
      },
      // 25.4.5.1 Promise.prototype.catch(onRejected)
      'catch': function _catch(onRejected) {
        return this.then(undefined, onRejected);
      }
    });

    OwnPromiseCapability = function OwnPromiseCapability() {
      var promise = new Internal();
      this.promise = promise;
      this.resolve = _ctx($resolve, promise, 1);
      this.reject = _ctx($reject, promise, 1);
    };

    _newPromiseCapability.f = newPromiseCapability = function newPromiseCapability(C) {
      return C === $Promise || C === Wrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
    };
  }

  _export(_export.G + _export.W + _export.F * !USE_NATIVE$1, {
    Promise: $Promise
  });

  _setToStringTag($Promise, PROMISE);

  _setSpecies(PROMISE);

  Wrapper = _core[PROMISE]; // statics

  _export(_export.S + _export.F * !USE_NATIVE$1, PROMISE, {
    // 25.4.4.5 Promise.reject(r)
    reject: function reject(r) {
      var capability = newPromiseCapability(this);
      var $$reject = capability.reject;
      $$reject(r);
      return capability.promise;
    }
  });

  _export(_export.S + _export.F * !USE_NATIVE$1, PROMISE, {
    // 25.4.4.6 Promise.resolve(x)
    resolve: function resolve(x) {
      return _promiseResolve(this, x);
    }
  });

  _export(_export.S + _export.F * !(USE_NATIVE$1 && _iterDetect(function (iter) {
    $Promise.all(iter)['catch'](empty);
  })), PROMISE, {
    // 25.4.4.1 Promise.all(iterable)
    all: function all(iterable) {
      var C = this;
      var capability = newPromiseCapability(C);
      var resolve = capability.resolve;
      var reject = capability.reject;

      var result = _perform(function () {
        var values = [];
        var index = 0;
        var remaining = 1;

        _forOf(iterable, false, function (promise) {
          var $index = index++;
          var alreadyCalled = false;
          values.push(undefined);
          remaining++;
          C.resolve(promise).then(function (value) {
            if (alreadyCalled) return;
            alreadyCalled = true;
            values[$index] = value;
            --remaining || resolve(values);
          }, reject);
        });

        --remaining || resolve(values);
      });

      if (result.e) reject(result.v);
      return capability.promise;
    },
    // 25.4.4.4 Promise.race(iterable)
    race: function race(iterable) {
      var C = this;
      var capability = newPromiseCapability(C);
      var reject = capability.reject;

      var result = _perform(function () {
        _forOf(iterable, false, function (promise) {
          C.resolve(promise).then(capability.resolve, reject);
        });
      });

      if (result.e) reject(result.v);
      return capability.promise;
    }
  });

  var _validateCollection = function _validateCollection(it, TYPE) {
    if (!_isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
    return it;
  };

  var dP$5 = _objectDp.f;
  var fastKey = _meta.fastKey;
  var SIZE = _descriptors ? '_s' : 'size';

  var getEntry = function getEntry(that, key) {
    // fast case
    var index = fastKey(key);
    var entry;
    if (index !== 'F') return that._i[index]; // frozen object case

    for (entry = that._f; entry; entry = entry.n) {
      if (entry.k == key) return entry;
    }
  };

  var _collectionStrong = {
    getConstructor: function getConstructor(wrapper, NAME, IS_MAP, ADDER) {
      var C = wrapper(function (that, iterable) {
        _anInstance(that, C, NAME, '_i');

        that._t = NAME; // collection type

        that._i = _objectCreate(null); // index

        that._f = undefined; // first entry

        that._l = undefined; // last entry

        that[SIZE] = 0; // size

        if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
      });

      _redefineAll(C.prototype, {
        // 23.1.3.1 Map.prototype.clear()
        // 23.2.3.2 Set.prototype.clear()
        clear: function clear() {
          for (var that = _validateCollection(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
            entry.r = true;
            if (entry.p) entry.p = entry.p.n = undefined;
            delete data[entry.i];
          }

          that._f = that._l = undefined;
          that[SIZE] = 0;
        },
        // 23.1.3.3 Map.prototype.delete(key)
        // 23.2.3.4 Set.prototype.delete(value)
        'delete': function _delete(key) {
          var that = _validateCollection(this, NAME);

          var entry = getEntry(that, key);

          if (entry) {
            var next = entry.n;
            var prev = entry.p;
            delete that._i[entry.i];
            entry.r = true;
            if (prev) prev.n = next;
            if (next) next.p = prev;
            if (that._f == entry) that._f = next;
            if (that._l == entry) that._l = prev;
            that[SIZE]--;
          }

          return !!entry;
        },
        // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
        // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
        forEach: function forEach(callbackfn
        /* , that = undefined */
        ) {
          _validateCollection(this, NAME);

          var f = _ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);

          var entry;

          while (entry = entry ? entry.n : this._f) {
            f(entry.v, entry.k, this); // revert to the last existing entry

            while (entry && entry.r) {
              entry = entry.p;
            }
          }
        },
        // 23.1.3.7 Map.prototype.has(key)
        // 23.2.3.7 Set.prototype.has(value)
        has: function has(key) {
          return !!getEntry(_validateCollection(this, NAME), key);
        }
      });

      if (_descriptors) dP$5(C.prototype, 'size', {
        get: function get() {
          return _validateCollection(this, NAME)[SIZE];
        }
      });
      return C;
    },
    def: function def(that, key, value) {
      var entry = getEntry(that, key);
      var prev, index; // change existing entry

      if (entry) {
        entry.v = value; // create new entry
      } else {
        that._l = entry = {
          i: index = fastKey(key, true),
          // <- index
          k: key,
          // <- key
          v: value,
          // <- value
          p: prev = that._l,
          // <- previous entry
          n: undefined,
          // <- next entry
          r: false // <- removed

        };
        if (!that._f) that._f = entry;
        if (prev) prev.n = entry;
        that[SIZE]++; // add to index

        if (index !== 'F') that._i[index] = entry;
      }

      return that;
    },
    getEntry: getEntry,
    setStrong: function setStrong(C, NAME, IS_MAP) {
      // add .keys, .values, .entries, [@@iterator]
      // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
      _iterDefine(C, NAME, function (iterated, kind) {
        this._t = _validateCollection(iterated, NAME); // target

        this._k = kind; // kind

        this._l = undefined; // previous
      }, function () {
        var that = this;
        var kind = that._k;
        var entry = that._l; // revert to the last existing entry

        while (entry && entry.r) {
          entry = entry.p;
        } // get next entry


        if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
          // or finish the iteration
          that._t = undefined;
          return _iterStep(1);
        } // return step by kind


        if (kind == 'keys') return _iterStep(0, entry.k);
        if (kind == 'values') return _iterStep(0, entry.v);
        return _iterStep(0, [entry.k, entry.v]);
      }, IS_MAP ? 'entries' : 'values', !IS_MAP, true); // add [@@species], 23.1.2.2, 23.2.2.2


      _setSpecies(NAME);
    }
  };

  var _collection = function _collection(NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
    var Base = _global[NAME];
    var C = Base;
    var ADDER = IS_MAP ? 'set' : 'add';
    var proto = C && C.prototype;
    var O = {};

    var fixMethod = function fixMethod(KEY) {
      var fn = proto[KEY];

      _redefine(proto, KEY, KEY == 'delete' ? function (a) {
        return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a) {
        return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a) {
        return IS_WEAK && !_isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a) {
        fn.call(this, a === 0 ? 0 : a);
        return this;
      } : function set(a, b) {
        fn.call(this, a === 0 ? 0 : a, b);
        return this;
      });
    };

    if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !_fails(function () {
      new C().entries().next();
    }))) {
      // create collection constructor
      C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);

      _redefineAll(C.prototype, methods);

      _meta.NEED = true;
    } else {
      var instance = new C(); // early implementations not supports chaining

      var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance; // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false

      var THROWS_ON_PRIMITIVES = _fails(function () {
        instance.has(1);
      }); // most early implementations doesn't supports iterables, most modern - not close it correctly


      var ACCEPT_ITERABLES = _iterDetect(function (iter) {
        new C(iter);
      }); // eslint-disable-line no-new
      // for early implementations -0 and +0 not the same


      var BUGGY_ZERO = !IS_WEAK && _fails(function () {
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new C();
        var index = 5;

        while (index--) {
          $instance[ADDER](index, index);
        }

        return !$instance.has(-0);
      });

      if (!ACCEPT_ITERABLES) {
        C = wrapper(function (target, iterable) {
          _anInstance(target, C, NAME);

          var that = _inheritIfRequired(new Base(), target, C);

          if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
          return that;
        });
        C.prototype = proto;
        proto.constructor = C;
      }

      if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
        fixMethod('delete');
        fixMethod('has');
        IS_MAP && fixMethod('get');
      }

      if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER); // weak collections should not contains .clear method

      if (IS_WEAK && proto.clear) delete proto.clear;
    }

    _setToStringTag(C, NAME);

    O[NAME] = C;

    _export(_export.G + _export.W + _export.F * (C != Base), O);

    if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);
    return C;
  };

  var MAP = 'Map'; // 23.1 Map Objects

  var es6_map = _collection(MAP, function (get) {
    return function Map() {
      return get(this, arguments.length > 0 ? arguments[0] : undefined);
    };
  }, {
    // 23.1.3.6 Map.prototype.get(key)
    get: function get(key) {
      var entry = _collectionStrong.getEntry(_validateCollection(this, MAP), key);

      return entry && entry.v;
    },
    // 23.1.3.9 Map.prototype.set(key, value)
    set: function set(key, value) {
      return _collectionStrong.def(_validateCollection(this, MAP), key === 0 ? 0 : key, value);
    }
  }, _collectionStrong, true);

  var SET = 'Set'; // 23.2 Set Objects

  var es6_set = _collection(SET, function (get) {
    return function Set() {
      return get(this, arguments.length > 0 ? arguments[0] : undefined);
    };
  }, {
    // 23.2.3.1 Set.prototype.add(value)
    add: function add(value) {
      return _collectionStrong.def(_validateCollection(this, SET), value = value === 0 ? 0 : value, value);
    }
  }, _collectionStrong);

  var getWeak = _meta.getWeak;

  var arrayFind = _arrayMethods(5);

  var arrayFindIndex = _arrayMethods(6);

  var id$1 = 0; // fallback for uncaught frozen keys

  var uncaughtFrozenStore = function uncaughtFrozenStore(that) {
    return that._l || (that._l = new UncaughtFrozenStore());
  };

  var UncaughtFrozenStore = function UncaughtFrozenStore() {
    this.a = [];
  };

  var findUncaughtFrozen = function findUncaughtFrozen(store, key) {
    return arrayFind(store.a, function (it) {
      return it[0] === key;
    });
  };

  UncaughtFrozenStore.prototype = {
    get: function get(key) {
      var entry = findUncaughtFrozen(this, key);
      if (entry) return entry[1];
    },
    has: function has(key) {
      return !!findUncaughtFrozen(this, key);
    },
    set: function set(key, value) {
      var entry = findUncaughtFrozen(this, key);
      if (entry) entry[1] = value;else this.a.push([key, value]);
    },
    'delete': function _delete(key) {
      var index = arrayFindIndex(this.a, function (it) {
        return it[0] === key;
      });
      if (~index) this.a.splice(index, 1);
      return !!~index;
    }
  };
  var _collectionWeak = {
    getConstructor: function getConstructor(wrapper, NAME, IS_MAP, ADDER) {
      var C = wrapper(function (that, iterable) {
        _anInstance(that, C, NAME, '_i');

        that._t = NAME; // collection type

        that._i = id$1++; // collection id

        that._l = undefined; // leak store for uncaught frozen objects

        if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
      });

      _redefineAll(C.prototype, {
        // 23.3.3.2 WeakMap.prototype.delete(key)
        // 23.4.3.3 WeakSet.prototype.delete(value)
        'delete': function _delete(key) {
          if (!_isObject(key)) return false;
          var data = getWeak(key);
          if (data === true) return uncaughtFrozenStore(_validateCollection(this, NAME))['delete'](key);
          return data && _has(data, this._i) && delete data[this._i];
        },
        // 23.3.3.4 WeakMap.prototype.has(key)
        // 23.4.3.4 WeakSet.prototype.has(value)
        has: function has(key) {
          if (!_isObject(key)) return false;
          var data = getWeak(key);
          if (data === true) return uncaughtFrozenStore(_validateCollection(this, NAME)).has(key);
          return data && _has(data, this._i);
        }
      });

      return C;
    },
    def: function def(that, key, value) {
      var data = getWeak(_anObject(key), true);
      if (data === true) uncaughtFrozenStore(that).set(key, value);else data[that._i] = value;
      return that;
    },
    ufstore: uncaughtFrozenStore
  };
  var es6_weakMap = createCommonjsModule(function (module) {
    var each = _arrayMethods(0);

    var NATIVE_WEAK_MAP = _validateCollection;
    var IS_IE11 = !_global.ActiveXObject && 'ActiveXObject' in _global;
    var WEAK_MAP = 'WeakMap';
    var getWeak = _meta.getWeak;
    var isExtensible = Object.isExtensible;
    var uncaughtFrozenStore = _collectionWeak.ufstore;
    var InternalMap;

    var wrapper = function wrapper(get) {
      return function WeakMap() {
        return get(this, arguments.length > 0 ? arguments[0] : undefined);
      };
    };

    var methods = {
      // 23.3.3.3 WeakMap.prototype.get(key)
      get: function get(key) {
        if (_isObject(key)) {
          var data = getWeak(key);
          if (data === true) return uncaughtFrozenStore(_validateCollection(this, WEAK_MAP)).get(key);
          return data ? data[this._i] : undefined;
        }
      },
      // 23.3.3.5 WeakMap.prototype.set(key, value)
      set: function set(key, value) {
        return _collectionWeak.def(_validateCollection(this, WEAK_MAP), key, value);
      }
    }; // 23.3 WeakMap Objects

    var $WeakMap = module.exports = _collection(WEAK_MAP, wrapper, methods, _collectionWeak, true, true); // IE11 WeakMap frozen keys fix


    if (NATIVE_WEAK_MAP && IS_IE11) {
      InternalMap = _collectionWeak.getConstructor(wrapper, WEAK_MAP);

      _objectAssign(InternalMap.prototype, methods);

      _meta.NEED = true;
      each(['delete', 'has', 'get', 'set'], function (key) {
        var proto = $WeakMap.prototype;
        var method = proto[key];

        _redefine(proto, key, function (a, b) {
          // store frozen objects on internal weakmap shim
          if (_isObject(a) && !isExtensible(a)) {
            if (!this._f) this._f = new InternalMap();

            var result = this._f[key](a, b);

            return key == 'set' ? this : result; // store all the rest on native weakmap
          }

          return method.call(this, a, b);
        });
      });
    }
  });
  var WEAK_SET = 'WeakSet'; // 23.4 WeakSet Objects

  _collection(WEAK_SET, function (get) {
    return function WeakSet() {
      return get(this, arguments.length > 0 ? arguments[0] : undefined);
    };
  }, {
    // 23.4.3.1 WeakSet.prototype.add(value)
    add: function add(value) {
      return _collectionWeak.def(_validateCollection(this, WEAK_SET), value, true);
    }
  }, _collectionWeak, false, true);

  var TYPED = _uid('typed_array');

  var VIEW = _uid('view');

  var ABV = !!(_global.ArrayBuffer && _global.DataView);
  var CONSTR = ABV;
  var i$1 = 0;
  var l = 9;
  var Typed;
  var TypedArrayConstructors = 'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'.split(',');

  while (i$1 < l) {
    if (Typed = _global[TypedArrayConstructors[i$1++]]) {
      _hide(Typed.prototype, TYPED, true);

      _hide(Typed.prototype, VIEW, true);
    } else CONSTR = false;
  }

  var _typed = {
    ABV: ABV,
    CONSTR: CONSTR,
    TYPED: TYPED,
    VIEW: VIEW
  }; // https://tc39.github.io/ecma262/#sec-toindex

  var _toIndex = function _toIndex(it) {
    if (it === undefined) return 0;

    var number = _toInteger(it);

    var length = _toLength(number);

    if (number !== length) throw RangeError('Wrong length!');
    return length;
  };

  var _typedBuffer = createCommonjsModule(function (module, exports) {
    var gOPN = _objectGopn.f;
    var dP = _objectDp.f;
    var ARRAY_BUFFER = 'ArrayBuffer';
    var DATA_VIEW = 'DataView';
    var PROTOTYPE = 'prototype';
    var WRONG_LENGTH = 'Wrong length!';
    var WRONG_INDEX = 'Wrong index!';
    var $ArrayBuffer = _global[ARRAY_BUFFER];
    var $DataView = _global[DATA_VIEW];
    var Math = _global.Math;
    var RangeError = _global.RangeError; // eslint-disable-next-line no-shadow-restricted-names

    var Infinity = _global.Infinity;
    var BaseBuffer = $ArrayBuffer;
    var abs = Math.abs;
    var pow = Math.pow;
    var floor = Math.floor;
    var log = Math.log;
    var LN2 = Math.LN2;
    var BUFFER = 'buffer';
    var BYTE_LENGTH = 'byteLength';
    var BYTE_OFFSET = 'byteOffset';
    var $BUFFER = _descriptors ? '_b' : BUFFER;
    var $LENGTH = _descriptors ? '_l' : BYTE_LENGTH;
    var $OFFSET = _descriptors ? '_o' : BYTE_OFFSET; // IEEE754 conversions based on https://github.com/feross/ieee754

    function packIEEE754(value, mLen, nBytes) {
      var buffer = new Array(nBytes);
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
      var i = 0;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      var e, m, c;
      value = abs(value); // eslint-disable-next-line no-self-compare

      if (value != value || value === Infinity) {
        // eslint-disable-next-line no-self-compare
        m = value != value ? 1 : 0;
        e = eMax;
      } else {
        e = floor(log(value) / LN2);

        if (value * (c = pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }

        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * pow(2, 1 - eBias);
        }

        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * pow(2, eBias - 1) * pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8) {
        ;
      }

      e = e << mLen | m;
      eLen += mLen;

      for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8) {
        ;
      }

      buffer[--i] |= s * 128;
      return buffer;
    }

    function unpackIEEE754(buffer, mLen, nBytes) {
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = eLen - 7;
      var i = nBytes - 1;
      var s = buffer[i--];
      var e = s & 127;
      var m;
      s >>= 7;

      for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8) {
        ;
      }

      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;

      for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8) {
        ;
      }

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : s ? -Infinity : Infinity;
      } else {
        m = m + pow(2, mLen);
        e = e - eBias;
      }

      return (s ? -1 : 1) * m * pow(2, e - mLen);
    }

    function unpackI32(bytes) {
      return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
    }

    function packI8(it) {
      return [it & 0xff];
    }

    function packI16(it) {
      return [it & 0xff, it >> 8 & 0xff];
    }

    function packI32(it) {
      return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
    }

    function packF64(it) {
      return packIEEE754(it, 52, 8);
    }

    function packF32(it) {
      return packIEEE754(it, 23, 4);
    }

    function addGetter(C, key, internal) {
      dP(C[PROTOTYPE], key, {
        get: function get() {
          return this[internal];
        }
      });
    }

    function get(view, bytes, index, isLittleEndian) {
      var numIndex = +index;

      var intIndex = _toIndex(numIndex);

      if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
      var store = view[$BUFFER]._b;
      var start = intIndex + view[$OFFSET];
      var pack = store.slice(start, start + bytes);
      return isLittleEndian ? pack : pack.reverse();
    }

    function set(view, bytes, index, conversion, value, isLittleEndian) {
      var numIndex = +index;

      var intIndex = _toIndex(numIndex);

      if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
      var store = view[$BUFFER]._b;
      var start = intIndex + view[$OFFSET];
      var pack = conversion(+value);

      for (var i = 0; i < bytes; i++) {
        store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
      }
    }

    if (!_typed.ABV) {
      $ArrayBuffer = function ArrayBuffer(length) {
        _anInstance(this, $ArrayBuffer, ARRAY_BUFFER);

        var byteLength = _toIndex(length);

        this._b = _arrayFill.call(new Array(byteLength), 0);
        this[$LENGTH] = byteLength;
      };

      $DataView = function DataView(buffer, byteOffset, byteLength) {
        _anInstance(this, $DataView, DATA_VIEW);

        _anInstance(buffer, $ArrayBuffer, DATA_VIEW);

        var bufferLength = buffer[$LENGTH];

        var offset = _toInteger(byteOffset);

        if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
        byteLength = byteLength === undefined ? bufferLength - offset : _toLength(byteLength);
        if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
        this[$BUFFER] = buffer;
        this[$OFFSET] = offset;
        this[$LENGTH] = byteLength;
      };

      if (_descriptors) {
        addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
        addGetter($DataView, BUFFER, '_b');
        addGetter($DataView, BYTE_LENGTH, '_l');
        addGetter($DataView, BYTE_OFFSET, '_o');
      }

      _redefineAll($DataView[PROTOTYPE], {
        getInt8: function getInt8(byteOffset) {
          return get(this, 1, byteOffset)[0] << 24 >> 24;
        },
        getUint8: function getUint8(byteOffset) {
          return get(this, 1, byteOffset)[0];
        },
        getInt16: function getInt16(byteOffset
        /* , littleEndian */
        ) {
          var bytes = get(this, 2, byteOffset, arguments[1]);
          return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
        },
        getUint16: function getUint16(byteOffset
        /* , littleEndian */
        ) {
          var bytes = get(this, 2, byteOffset, arguments[1]);
          return bytes[1] << 8 | bytes[0];
        },
        getInt32: function getInt32(byteOffset
        /* , littleEndian */
        ) {
          return unpackI32(get(this, 4, byteOffset, arguments[1]));
        },
        getUint32: function getUint32(byteOffset
        /* , littleEndian */
        ) {
          return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
        },
        getFloat32: function getFloat32(byteOffset
        /* , littleEndian */
        ) {
          return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
        },
        getFloat64: function getFloat64(byteOffset
        /* , littleEndian */
        ) {
          return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
        },
        setInt8: function setInt8(byteOffset, value) {
          set(this, 1, byteOffset, packI8, value);
        },
        setUint8: function setUint8(byteOffset, value) {
          set(this, 1, byteOffset, packI8, value);
        },
        setInt16: function setInt16(byteOffset, value
        /* , littleEndian */
        ) {
          set(this, 2, byteOffset, packI16, value, arguments[2]);
        },
        setUint16: function setUint16(byteOffset, value
        /* , littleEndian */
        ) {
          set(this, 2, byteOffset, packI16, value, arguments[2]);
        },
        setInt32: function setInt32(byteOffset, value
        /* , littleEndian */
        ) {
          set(this, 4, byteOffset, packI32, value, arguments[2]);
        },
        setUint32: function setUint32(byteOffset, value
        /* , littleEndian */
        ) {
          set(this, 4, byteOffset, packI32, value, arguments[2]);
        },
        setFloat32: function setFloat32(byteOffset, value
        /* , littleEndian */
        ) {
          set(this, 4, byteOffset, packF32, value, arguments[2]);
        },
        setFloat64: function setFloat64(byteOffset, value
        /* , littleEndian */
        ) {
          set(this, 8, byteOffset, packF64, value, arguments[2]);
        }
      });
    } else {
      if (!_fails(function () {
        $ArrayBuffer(1);
      }) || !_fails(function () {
        new $ArrayBuffer(-1); // eslint-disable-line no-new
      }) || _fails(function () {
        new $ArrayBuffer(); // eslint-disable-line no-new

        new $ArrayBuffer(1.5); // eslint-disable-line no-new

        new $ArrayBuffer(NaN); // eslint-disable-line no-new

        return $ArrayBuffer.name != ARRAY_BUFFER;
      })) {
        $ArrayBuffer = function ArrayBuffer(length) {
          _anInstance(this, $ArrayBuffer);

          return new BaseBuffer(_toIndex(length));
        };

        var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];

        for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
          if (!((key = keys[j++]) in $ArrayBuffer)) _hide($ArrayBuffer, key, BaseBuffer[key]);
        }

        ArrayBufferProto.constructor = $ArrayBuffer;
      } // iOS Safari 7.x bug


      var view = new $DataView(new $ArrayBuffer(2));
      var $setInt8 = $DataView[PROTOTYPE].setInt8;
      view.setInt8(0, 2147483648);
      view.setInt8(1, 2147483649);
      if (view.getInt8(0) || !view.getInt8(1)) _redefineAll($DataView[PROTOTYPE], {
        setInt8: function setInt8(byteOffset, value) {
          $setInt8.call(this, byteOffset, value << 24 >> 24);
        },
        setUint8: function setUint8(byteOffset, value) {
          $setInt8.call(this, byteOffset, value << 24 >> 24);
        }
      }, true);
    }

    _setToStringTag($ArrayBuffer, ARRAY_BUFFER);

    _setToStringTag($DataView, DATA_VIEW);

    _hide($DataView[PROTOTYPE], _typed.VIEW, true);

    exports[ARRAY_BUFFER] = $ArrayBuffer;
    exports[DATA_VIEW] = $DataView;
  });

  var ArrayBuffer = _global.ArrayBuffer;
  var $ArrayBuffer = _typedBuffer.ArrayBuffer;
  var $DataView = _typedBuffer.DataView;
  var $isView = _typed.ABV && ArrayBuffer.isView;
  var $slice = $ArrayBuffer.prototype.slice;
  var VIEW$1 = _typed.VIEW;
  var ARRAY_BUFFER = 'ArrayBuffer';

  _export(_export.G + _export.W + _export.F * (ArrayBuffer !== $ArrayBuffer), {
    ArrayBuffer: $ArrayBuffer
  });

  _export(_export.S + _export.F * !_typed.CONSTR, ARRAY_BUFFER, {
    // 24.1.3.1 ArrayBuffer.isView(arg)
    isView: function isView(it) {
      return $isView && $isView(it) || _isObject(it) && VIEW$1 in it;
    }
  });

  _export(_export.P + _export.U + _export.F * _fails(function () {
    return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
  }), ARRAY_BUFFER, {
    // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
    slice: function slice(start, end) {
      if ($slice !== undefined && end === undefined) return $slice.call(_anObject(this), start); // FF fix

      var len = _anObject(this).byteLength;

      var first = _toAbsoluteIndex(start, len);

      var fin = _toAbsoluteIndex(end === undefined ? len : end, len);

      var result = new (_speciesConstructor(this, $ArrayBuffer))(_toLength(fin - first));
      var viewS = new $DataView(this);
      var viewT = new $DataView(result);
      var index = 0;

      while (first < fin) {
        viewT.setUint8(index++, viewS.getUint8(first++));
      }

      return result;
    }
  });

  _setSpecies(ARRAY_BUFFER);

  _export(_export.G + _export.W + _export.F * !_typed.ABV, {
    DataView: _typedBuffer.DataView
  });

  var _typedArray = createCommonjsModule(function (module) {
    if (_descriptors) {
      var LIBRARY = _library;
      var global = _global;
      var fails = _fails;
      var $export = _export;
      var $typed = _typed;
      var $buffer = _typedBuffer;
      var ctx = _ctx;
      var anInstance = _anInstance;
      var propertyDesc = _propertyDesc;
      var hide = _hide;
      var redefineAll = _redefineAll;
      var toInteger = _toInteger;
      var toLength = _toLength;
      var toIndex = _toIndex;
      var toAbsoluteIndex = _toAbsoluteIndex;
      var toPrimitive = _toPrimitive;
      var has = _has;
      var classof = _classof;
      var isObject = _isObject;
      var toObject = _toObject;
      var isArrayIter = _isArrayIter;
      var create = _objectCreate;
      var getPrototypeOf = _objectGpo;
      var gOPN = _objectGopn.f;
      var getIterFn = core_getIteratorMethod;
      var uid = _uid;
      var wks = _wks;
      var createArrayMethod = _arrayMethods;
      var createArrayIncludes = _arrayIncludes;
      var speciesConstructor = _speciesConstructor;
      var ArrayIterators = es6_array_iterator;
      var Iterators = _iterators;
      var $iterDetect = _iterDetect;
      var setSpecies = _setSpecies;
      var arrayFill = _arrayFill;
      var arrayCopyWithin = _arrayCopyWithin;
      var $DP = _objectDp;
      var $GOPD = _objectGopd;
      var dP = $DP.f;
      var gOPD = $GOPD.f;
      var RangeError = global.RangeError;
      var TypeError = global.TypeError;
      var Uint8Array = global.Uint8Array;
      var ARRAY_BUFFER = 'ArrayBuffer';
      var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
      var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
      var PROTOTYPE = 'prototype';
      var ArrayProto = Array[PROTOTYPE];
      var $ArrayBuffer = $buffer.ArrayBuffer;
      var $DataView = $buffer.DataView;
      var arrayForEach = createArrayMethod(0);
      var arrayFilter = createArrayMethod(2);
      var arraySome = createArrayMethod(3);
      var arrayEvery = createArrayMethod(4);
      var arrayFind = createArrayMethod(5);
      var arrayFindIndex = createArrayMethod(6);
      var arrayIncludes = createArrayIncludes(true);
      var arrayIndexOf = createArrayIncludes(false);
      var arrayValues = ArrayIterators.values;
      var arrayKeys = ArrayIterators.keys;
      var arrayEntries = ArrayIterators.entries;
      var arrayLastIndexOf = ArrayProto.lastIndexOf;
      var arrayReduce = ArrayProto.reduce;
      var arrayReduceRight = ArrayProto.reduceRight;
      var arrayJoin = ArrayProto.join;
      var arraySort = ArrayProto.sort;
      var arraySlice = ArrayProto.slice;
      var arrayToString = ArrayProto.toString;
      var arrayToLocaleString = ArrayProto.toLocaleString;
      var ITERATOR = wks('iterator');
      var TAG = wks('toStringTag');
      var TYPED_CONSTRUCTOR = uid('typed_constructor');
      var DEF_CONSTRUCTOR = uid('def_constructor');
      var ALL_CONSTRUCTORS = $typed.CONSTR;
      var TYPED_ARRAY = $typed.TYPED;
      var VIEW = $typed.VIEW;
      var WRONG_LENGTH = 'Wrong length!';
      var $map = createArrayMethod(1, function (O, length) {
        return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
      });
      var LITTLE_ENDIAN = fails(function () {
        // eslint-disable-next-line no-undef
        return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
      });
      var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
        new Uint8Array(1).set({});
      });

      var toOffset = function toOffset(it, BYTES) {
        var offset = toInteger(it);
        if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
        return offset;
      };

      var validate = function validate(it) {
        if (isObject(it) && TYPED_ARRAY in it) return it;
        throw TypeError(it + ' is not a typed array!');
      };

      var allocate = function allocate(C, length) {
        if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
          throw TypeError('It is not a typed array constructor!');
        }

        return new C(length);
      };

      var speciesFromList = function speciesFromList(O, list) {
        return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
      };

      var fromList = function fromList(C, list) {
        var index = 0;
        var length = list.length;
        var result = allocate(C, length);

        while (length > index) {
          result[index] = list[index++];
        }

        return result;
      };

      var addGetter = function addGetter(it, key, internal) {
        dP(it, key, {
          get: function get() {
            return this._d[internal];
          }
        });
      };

      var $from = function from(source
      /* , mapfn, thisArg */
      ) {
        var O = toObject(source);
        var aLen = arguments.length;
        var mapfn = aLen > 1 ? arguments[1] : undefined;
        var mapping = mapfn !== undefined;
        var iterFn = getIterFn(O);
        var i, length, values, result, step, iterator;

        if (iterFn != undefined && !isArrayIter(iterFn)) {
          for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
            values.push(step.value);
          }

          O = values;
        }

        if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);

        for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
          result[i] = mapping ? mapfn(O[i], i) : O[i];
        }

        return result;
      };

      var $of = function of()
      /* ...items */
      {
        var index = 0;
        var length = arguments.length;
        var result = allocate(this, length);

        while (length > index) {
          result[index] = arguments[index++];
        }

        return result;
      }; // iOS Safari 6.x fails here


      var TO_LOCALE_BUG = !!Uint8Array && fails(function () {
        arrayToLocaleString.call(new Uint8Array(1));
      });

      var $toLocaleString = function toLocaleString() {
        return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
      };

      var proto = {
        copyWithin: function copyWithin(target, start
        /* , end */
        ) {
          return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
        },
        every: function every(callbackfn
        /* , thisArg */
        ) {
          return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
        },
        fill: function fill(value
        /* , start, end */
        ) {
          // eslint-disable-line no-unused-vars
          return arrayFill.apply(validate(this), arguments);
        },
        filter: function filter(callbackfn
        /* , thisArg */
        ) {
          return speciesFromList(this, arrayFilter(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined));
        },
        find: function find(predicate
        /* , thisArg */
        ) {
          return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
        },
        findIndex: function findIndex(predicate
        /* , thisArg */
        ) {
          return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
        },
        forEach: function forEach(callbackfn
        /* , thisArg */
        ) {
          arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
        },
        indexOf: function indexOf(searchElement
        /* , fromIndex */
        ) {
          return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
        },
        includes: function includes(searchElement
        /* , fromIndex */
        ) {
          return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
        },
        join: function join(separator) {
          // eslint-disable-line no-unused-vars
          return arrayJoin.apply(validate(this), arguments);
        },
        lastIndexOf: function lastIndexOf(searchElement
        /* , fromIndex */
        ) {
          // eslint-disable-line no-unused-vars
          return arrayLastIndexOf.apply(validate(this), arguments);
        },
        map: function map(mapfn
        /* , thisArg */
        ) {
          return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
        },
        reduce: function reduce(callbackfn
        /* , initialValue */
        ) {
          // eslint-disable-line no-unused-vars
          return arrayReduce.apply(validate(this), arguments);
        },
        reduceRight: function reduceRight(callbackfn
        /* , initialValue */
        ) {
          // eslint-disable-line no-unused-vars
          return arrayReduceRight.apply(validate(this), arguments);
        },
        reverse: function reverse() {
          var that = this;
          var length = validate(that).length;
          var middle = Math.floor(length / 2);
          var index = 0;
          var value;

          while (index < middle) {
            value = that[index];
            that[index++] = that[--length];
            that[length] = value;
          }

          return that;
        },
        some: function some(callbackfn
        /* , thisArg */
        ) {
          return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
        },
        sort: function sort(comparefn) {
          return arraySort.call(validate(this), comparefn);
        },
        subarray: function subarray(begin, end) {
          var O = validate(this);
          var length = O.length;
          var $begin = toAbsoluteIndex(begin, length);
          return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(O.buffer, O.byteOffset + $begin * O.BYTES_PER_ELEMENT, toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin));
        }
      };

      var $slice = function slice(start, end) {
        return speciesFromList(this, arraySlice.call(validate(this), start, end));
      };

      var $set = function set(arrayLike
      /* , offset */
      ) {
        validate(this);
        var offset = toOffset(arguments[1], 1);
        var length = this.length;
        var src = toObject(arrayLike);
        var len = toLength(src.length);
        var index = 0;
        if (len + offset > length) throw RangeError(WRONG_LENGTH);

        while (index < len) {
          this[offset + index] = src[index++];
        }
      };

      var $iterators = {
        entries: function entries() {
          return arrayEntries.call(validate(this));
        },
        keys: function keys() {
          return arrayKeys.call(validate(this));
        },
        values: function values() {
          return arrayValues.call(validate(this));
        }
      };

      var isTAIndex = function isTAIndex(target, key) {
        return isObject(target) && target[TYPED_ARRAY] && _typeof2(key) != 'symbol' && key in target && String(+key) == String(key);
      };

      var $getDesc = function getOwnPropertyDescriptor(target, key) {
        return isTAIndex(target, key = toPrimitive(key, true)) ? propertyDesc(2, target[key]) : gOPD(target, key);
      };

      var $setDesc = function defineProperty(target, key, desc) {
        if (isTAIndex(target, key = toPrimitive(key, true)) && isObject(desc) && has(desc, 'value') && !has(desc, 'get') && !has(desc, 'set') // TODO: add validation descriptor w/o calling accessors
        && !desc.configurable && (!has(desc, 'writable') || desc.writable) && (!has(desc, 'enumerable') || desc.enumerable)) {
          target[key] = desc.value;
          return target;
        }

        return dP(target, key, desc);
      };

      if (!ALL_CONSTRUCTORS) {
        $GOPD.f = $getDesc;
        $DP.f = $setDesc;
      }

      $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
        getOwnPropertyDescriptor: $getDesc,
        defineProperty: $setDesc
      });

      if (fails(function () {
        arrayToString.call({});
      })) {
        arrayToString = arrayToLocaleString = function toString() {
          return arrayJoin.call(this);
        };
      }

      var $TypedArrayPrototype$ = redefineAll({}, proto);
      redefineAll($TypedArrayPrototype$, $iterators);
      hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
      redefineAll($TypedArrayPrototype$, {
        slice: $slice,
        set: $set,
        constructor: function constructor() {
          /* noop */
        },
        toString: arrayToString,
        toLocaleString: $toLocaleString
      });
      addGetter($TypedArrayPrototype$, 'buffer', 'b');
      addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
      addGetter($TypedArrayPrototype$, 'byteLength', 'l');
      addGetter($TypedArrayPrototype$, 'length', 'e');
      dP($TypedArrayPrototype$, TAG, {
        get: function get() {
          return this[TYPED_ARRAY];
        }
      }); // eslint-disable-next-line max-statements

      module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
        CLAMPED = !!CLAMPED;
        var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
        var GETTER = 'get' + KEY;
        var SETTER = 'set' + KEY;
        var TypedArray = global[NAME];
        var Base = TypedArray || {};
        var TAC = TypedArray && getPrototypeOf(TypedArray);
        var FORCED = !TypedArray || !$typed.ABV;
        var O = {};
        var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];

        var getter = function getter(that, index) {
          var data = that._d;
          return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
        };

        var setter = function setter(that, index, value) {
          var data = that._d;
          if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
          data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
        };

        var addElement = function addElement(that, index) {
          dP(that, index, {
            get: function get() {
              return getter(this, index);
            },
            set: function set(value) {
              return setter(this, index, value);
            },
            enumerable: true
          });
        };

        if (FORCED) {
          TypedArray = wrapper(function (that, data, $offset, $length) {
            anInstance(that, TypedArray, NAME, '_d');
            var index = 0;
            var offset = 0;
            var buffer, byteLength, length, klass;

            if (!isObject(data)) {
              length = toIndex(data);
              byteLength = length * BYTES;
              buffer = new $ArrayBuffer(byteLength);
            } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
              buffer = data;
              offset = toOffset($offset, BYTES);
              var $len = data.byteLength;

              if ($length === undefined) {
                if ($len % BYTES) throw RangeError(WRONG_LENGTH);
                byteLength = $len - offset;
                if (byteLength < 0) throw RangeError(WRONG_LENGTH);
              } else {
                byteLength = toLength($length) * BYTES;
                if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
              }

              length = byteLength / BYTES;
            } else if (TYPED_ARRAY in data) {
              return fromList(TypedArray, data);
            } else {
              return $from.call(TypedArray, data);
            }

            hide(that, '_d', {
              b: buffer,
              o: offset,
              l: byteLength,
              e: length,
              v: new $DataView(buffer)
            });

            while (index < length) {
              addElement(that, index++);
            }
          });
          TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
          hide(TypedArrayPrototype, 'constructor', TypedArray);
        } else if (!fails(function () {
          TypedArray(1);
        }) || !fails(function () {
          new TypedArray(-1); // eslint-disable-line no-new
        }) || !$iterDetect(function (iter) {
          new TypedArray(); // eslint-disable-line no-new

          new TypedArray(null); // eslint-disable-line no-new

          new TypedArray(1.5); // eslint-disable-line no-new

          new TypedArray(iter); // eslint-disable-line no-new
        }, true)) {
          TypedArray = wrapper(function (that, data, $offset, $length) {
            anInstance(that, TypedArray, NAME);
            var klass; // `ws` module bug, temporarily remove validation length for Uint8Array
            // https://github.com/websockets/ws/pull/645

            if (!isObject(data)) return new Base(toIndex(data));

            if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
              return $length !== undefined ? new Base(data, toOffset($offset, BYTES), $length) : $offset !== undefined ? new Base(data, toOffset($offset, BYTES)) : new Base(data);
            }

            if (TYPED_ARRAY in data) return fromList(TypedArray, data);
            return $from.call(TypedArray, data);
          });
          arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
            if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
          });
          TypedArray[PROTOTYPE] = TypedArrayPrototype;
          if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;
        }

        var $nativeIterator = TypedArrayPrototype[ITERATOR];
        var CORRECT_ITER_NAME = !!$nativeIterator && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
        var $iterator = $iterators.values;
        hide(TypedArray, TYPED_CONSTRUCTOR, true);
        hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
        hide(TypedArrayPrototype, VIEW, true);
        hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

        if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
          dP(TypedArrayPrototype, TAG, {
            get: function get() {
              return NAME;
            }
          });
        }

        O[NAME] = TypedArray;
        $export($export.G + $export.W + $export.F * (TypedArray != Base), O);
        $export($export.S, NAME, {
          BYTES_PER_ELEMENT: BYTES
        });
        $export($export.S + $export.F * fails(function () {
          Base.of.call(TypedArray, 1);
        }), NAME, {
          from: $from,
          of: $of
        });
        if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);
        $export($export.P, NAME, proto);
        setSpecies(NAME);
        $export($export.P + $export.F * FORCED_SET, NAME, {
          set: $set
        });
        $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);
        if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;
        $export($export.P + $export.F * fails(function () {
          new TypedArray(1).slice();
        }), NAME, {
          slice: $slice
        });
        $export($export.P + $export.F * (fails(function () {
          return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
        }) || !fails(function () {
          TypedArrayPrototype.toLocaleString.call([1, 2]);
        })), NAME, {
          toLocaleString: $toLocaleString
        });
        Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
        if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
      };
    } else module.exports = function () {
      /* empty */
    };
  });

  _typedArray('Int8', 1, function (init) {
    return function Int8Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Uint8', 1, function (init) {
    return function Uint8Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Uint8', 1, function (init) {
    return function Uint8ClampedArray(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  }, true);

  _typedArray('Int16', 2, function (init) {
    return function Int16Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Uint16', 2, function (init) {
    return function Uint16Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Int32', 4, function (init) {
    return function Int32Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Uint32', 4, function (init) {
    return function Uint32Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Float32', 4, function (init) {
    return function Float32Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Float64', 8, function (init) {
    return function Float64Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  }); // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)


  var rApply = (_global.Reflect || {}).apply;
  var fApply = Function.apply; // MS Edge argumentsList argument is optional

  _export(_export.S + _export.F * !_fails(function () {
    rApply(function () {
      /* empty */
    });
  }), 'Reflect', {
    apply: function apply(target, thisArgument, argumentsList) {
      var T = _aFunction(target);

      var L = _anObject(argumentsList);

      return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
    }
  }); // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])


  var rConstruct = (_global.Reflect || {}).construct; // MS Edge supports only 2 arguments and argumentsList argument is optional
  // FF Nightly sets third argument as `new.target`, but does not create `this` from it

  var NEW_TARGET_BUG = _fails(function () {
    function F() {
      /* empty */
    }

    return !(rConstruct(function () {
      /* empty */
    }, [], F) instanceof F);
  });

  var ARGS_BUG = !_fails(function () {
    rConstruct(function () {
      /* empty */
    });
  });

  _export(_export.S + _export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
    construct: function construct(Target, args
    /* , newTarget */
    ) {
      _aFunction(Target);

      _anObject(args);

      var newTarget = arguments.length < 3 ? Target : _aFunction(arguments[2]);
      if (ARGS_BUG && !NEW_TARGET_BUG) return rConstruct(Target, args, newTarget);

      if (Target == newTarget) {
        // w/o altered newTarget, optimization for 0-4 arguments
        switch (args.length) {
          case 0:
            return new Target();

          case 1:
            return new Target(args[0]);

          case 2:
            return new Target(args[0], args[1]);

          case 3:
            return new Target(args[0], args[1], args[2]);

          case 4:
            return new Target(args[0], args[1], args[2], args[3]);
        } // w/o altered newTarget, lot of arguments case


        var $args = [null];
        $args.push.apply($args, args);
        return new (_bind.apply(Target, $args))();
      } // with altered newTarget, not support built-in constructors


      var proto = newTarget.prototype;

      var instance = _objectCreate(_isObject(proto) ? proto : Object.prototype);

      var result = Function.apply.call(Target, instance, args);
      return _isObject(result) ? result : instance;
    }
  }); // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
  // MS Edge has broken Reflect.defineProperty - throwing instead of returning false


  _export(_export.S + _export.F * _fails(function () {
    // eslint-disable-next-line no-undef
    Reflect.defineProperty(_objectDp.f({}, 1, {
      value: 1
    }), 1, {
      value: 2
    });
  }), 'Reflect', {
    defineProperty: function defineProperty(target, propertyKey, attributes) {
      _anObject(target);

      propertyKey = _toPrimitive(propertyKey, true);

      _anObject(attributes);

      try {
        _objectDp.f(target, propertyKey, attributes);

        return true;
      } catch (e) {
        return false;
      }
    }
  }); // 26.1.4 Reflect.deleteProperty(target, propertyKey)


  var gOPD$3 = _objectGopd.f;

  _export(_export.S, 'Reflect', {
    deleteProperty: function deleteProperty(target, propertyKey) {
      var desc = gOPD$3(_anObject(target), propertyKey);
      return desc && !desc.configurable ? false : delete target[propertyKey];
    }
  }); // 26.1.5 Reflect.enumerate(target)


  var Enumerate = function Enumerate(iterated) {
    this._t = _anObject(iterated); // target

    this._i = 0; // next index

    var keys = this._k = []; // keys

    var key;

    for (key in iterated) {
      keys.push(key);
    }
  };

  _iterCreate(Enumerate, 'Object', function () {
    var that = this;
    var keys = that._k;
    var key;

    do {
      if (that._i >= keys.length) return {
        value: undefined,
        done: true
      };
    } while (!((key = keys[that._i++]) in that._t));

    return {
      value: key,
      done: false
    };
  });

  _export(_export.S, 'Reflect', {
    enumerate: function enumerate(target) {
      return new Enumerate(target);
    }
  }); // 26.1.6 Reflect.get(target, propertyKey [, receiver])


  function get(target, propertyKey
  /* , receiver */
  ) {
    var receiver = arguments.length < 3 ? target : arguments[2];
    var desc, proto;
    if (_anObject(target) === receiver) return target[propertyKey];
    if (desc = _objectGopd.f(target, propertyKey)) return _has(desc, 'value') ? desc.value : desc.get !== undefined ? desc.get.call(receiver) : undefined;
    if (_isObject(proto = _objectGpo(target))) return get(proto, propertyKey, receiver);
  }

  _export(_export.S, 'Reflect', {
    get: get
  }); // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)


  _export(_export.S, 'Reflect', {
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
      return _objectGopd.f(_anObject(target), propertyKey);
    }
  }); // 26.1.8 Reflect.getPrototypeOf(target)


  _export(_export.S, 'Reflect', {
    getPrototypeOf: function getPrototypeOf(target) {
      return _objectGpo(_anObject(target));
    }
  }); // 26.1.9 Reflect.has(target, propertyKey)


  _export(_export.S, 'Reflect', {
    has: function has(target, propertyKey) {
      return propertyKey in target;
    }
  }); // 26.1.10 Reflect.isExtensible(target)


  var $isExtensible = Object.isExtensible;

  _export(_export.S, 'Reflect', {
    isExtensible: function isExtensible(target) {
      _anObject(target);

      return $isExtensible ? $isExtensible(target) : true;
    }
  }); // all object keys, includes non-enumerable and symbols


  var Reflect$1 = _global.Reflect;

  var _ownKeys = Reflect$1 && Reflect$1.ownKeys || function ownKeys(it) {
    var keys = _objectGopn.f(_anObject(it));

    var getSymbols = _objectGops.f;
    return getSymbols ? keys.concat(getSymbols(it)) : keys;
  }; // 26.1.11 Reflect.ownKeys(target)


  _export(_export.S, 'Reflect', {
    ownKeys: _ownKeys
  }); // 26.1.12 Reflect.preventExtensions(target)


  var $preventExtensions = Object.preventExtensions;

  _export(_export.S, 'Reflect', {
    preventExtensions: function preventExtensions(target) {
      _anObject(target);

      try {
        if ($preventExtensions) $preventExtensions(target);
        return true;
      } catch (e) {
        return false;
      }
    }
  }); // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])


  function set(target, propertyKey, V
  /* , receiver */
  ) {
    var receiver = arguments.length < 4 ? target : arguments[3];

    var ownDesc = _objectGopd.f(_anObject(target), propertyKey);

    var existingDescriptor, proto;

    if (!ownDesc) {
      if (_isObject(proto = _objectGpo(target))) {
        return set(proto, propertyKey, V, receiver);
      }

      ownDesc = _propertyDesc(0);
    }

    if (_has(ownDesc, 'value')) {
      if (ownDesc.writable === false || !_isObject(receiver)) return false;

      if (existingDescriptor = _objectGopd.f(receiver, propertyKey)) {
        if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
        existingDescriptor.value = V;

        _objectDp.f(receiver, propertyKey, existingDescriptor);
      } else _objectDp.f(receiver, propertyKey, _propertyDesc(0, V));

      return true;
    }

    return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
  }

  _export(_export.S, 'Reflect', {
    set: set
  }); // 26.1.14 Reflect.setPrototypeOf(target, proto)


  if (_setProto) _export(_export.S, 'Reflect', {
    setPrototypeOf: function setPrototypeOf(target, proto) {
      _setProto.check(target, proto);

      try {
        _setProto.set(target, proto);

        return true;
      } catch (e) {
        return false;
      }
    }
  }); // https://github.com/tc39/Array.prototype.includes

  var $includes = _arrayIncludes(true);

  _export(_export.P, 'Array', {
    includes: function includes(el
    /* , fromIndex = 0 */
    ) {
      return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  _addToUnscopables('includes'); // https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray


  var IS_CONCAT_SPREADABLE = _wks('isConcatSpreadable');

  function flattenIntoArray(target, original, source, sourceLen, start, depth, mapper, thisArg) {
    var targetIndex = start;
    var sourceIndex = 0;
    var mapFn = mapper ? _ctx(mapper, thisArg, 3) : false;
    var element, spreadable;

    while (sourceIndex < sourceLen) {
      if (sourceIndex in source) {
        element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];
        spreadable = false;

        if (_isObject(element)) {
          spreadable = element[IS_CONCAT_SPREADABLE];
          spreadable = spreadable !== undefined ? !!spreadable : _isArray(element);
        }

        if (spreadable && depth > 0) {
          targetIndex = flattenIntoArray(target, original, element, _toLength(element.length), targetIndex, depth - 1) - 1;
        } else {
          if (targetIndex >= 0x1fffffffffffff) throw TypeError();
          target[targetIndex] = element;
        }

        targetIndex++;
      }

      sourceIndex++;
    }

    return targetIndex;
  }

  var _flattenIntoArray = flattenIntoArray; // https://tc39.github.io/proposal-flatMap/#sec-Array.prototype.flatMap

  _export(_export.P, 'Array', {
    flatMap: function flatMap(callbackfn
    /* , thisArg */
    ) {
      var O = _toObject(this);

      var sourceLen, A;

      _aFunction(callbackfn);

      sourceLen = _toLength(O.length);
      A = _arraySpeciesCreate(O, 0);

      _flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments[1]);

      return A;
    }
  });

  _addToUnscopables('flatMap'); // https://tc39.github.io/proposal-flatMap/#sec-Array.prototype.flatten


  _export(_export.P, 'Array', {
    flatten: function flatten()
    /* depthArg = 1 */
    {
      var depthArg = arguments[0];

      var O = _toObject(this);

      var sourceLen = _toLength(O.length);

      var A = _arraySpeciesCreate(O, 0);

      _flattenIntoArray(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : _toInteger(depthArg));

      return A;
    }
  });

  _addToUnscopables('flatten'); // https://github.com/mathiasbynens/String.prototype.at


  var $at$2 = _stringAt(true);

  var FORCED = _fails(function () {
    return '𠮷'.at(0) !== '𠮷';
  });

  _export(_export.P + _export.F * FORCED, 'String', {
    at: function at(pos) {
      return $at$2(this, pos);
    }
  }); // https://github.com/tc39/proposal-string-pad-start-end


  var _stringPad = function _stringPad(that, maxLength, fillString, left) {
    var S = String(_defined(that));
    var stringLength = S.length;
    var fillStr = fillString === undefined ? ' ' : String(fillString);

    var intMaxLength = _toLength(maxLength);

    if (intMaxLength <= stringLength || fillStr == '') return S;
    var fillLen = intMaxLength - stringLength;

    var stringFiller = _stringRepeat.call(fillStr, Math.ceil(fillLen / fillStr.length));

    if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
    return left ? stringFiller + S : S + stringFiller;
  }; // https://github.com/tc39/proposal-string-pad-start-end
  // https://github.com/zloirock/core-js/issues/280


  var WEBKIT_BUG = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(_userAgent);

  _export(_export.P + _export.F * WEBKIT_BUG, 'String', {
    padStart: function padStart(maxLength
    /* , fillString = ' ' */
    ) {
      return _stringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
    }
  }); // https://github.com/tc39/proposal-string-pad-start-end
  // https://github.com/zloirock/core-js/issues/280


  var WEBKIT_BUG$1 = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(_userAgent);

  _export(_export.P + _export.F * WEBKIT_BUG$1, 'String', {
    padEnd: function padEnd(maxLength
    /* , fillString = ' ' */
    ) {
      return _stringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
    }
  }); // https://github.com/sebmarkbage/ecmascript-string-left-right-trim


  _stringTrim('trimLeft', function ($trim) {
    return function trimLeft() {
      return $trim(this, 1);
    };
  }, 'trimStart'); // https://github.com/sebmarkbage/ecmascript-string-left-right-trim


  _stringTrim('trimRight', function ($trim) {
    return function trimRight() {
      return $trim(this, 2);
    };
  }, 'trimEnd'); // https://tc39.github.io/String.prototype.matchAll/


  var RegExpProto = RegExp.prototype;

  var $RegExpStringIterator = function $RegExpStringIterator(regexp, string) {
    this._r = regexp;
    this._s = string;
  };

  _iterCreate($RegExpStringIterator, 'RegExp String', function next() {
    var match = this._r.exec(this._s);

    return {
      value: match,
      done: match === null
    };
  });

  _export(_export.P, 'String', {
    matchAll: function matchAll(regexp) {
      _defined(this);

      if (!_isRegexp(regexp)) throw TypeError(regexp + ' is not a regexp!');
      var S = String(this);
      var flags = 'flags' in RegExpProto ? String(regexp.flags) : _flags.call(regexp);
      var rx = new RegExp(regexp.source, ~flags.indexOf('g') ? flags : 'g' + flags);
      rx.lastIndex = _toLength(regexp.lastIndex);
      return new $RegExpStringIterator(rx, S);
    }
  });

  _wksDefine('asyncIterator');

  _wksDefine('observable'); // https://github.com/tc39/proposal-object-getownpropertydescriptors


  _export(_export.S, 'Object', {
    getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
      var O = _toIobject(object);

      var getDesc = _objectGopd.f;

      var keys = _ownKeys(O);

      var result = {};
      var i = 0;
      var key, desc;

      while (keys.length > i) {
        desc = getDesc(O, key = keys[i++]);
        if (desc !== undefined) _createProperty(result, key, desc);
      }

      return result;
    }
  });

  var isEnum$1 = _objectPie.f;

  var _objectToArray = function _objectToArray(isEntries) {
    return function (it) {
      var O = _toIobject(it);

      var keys = _objectKeys(O);

      var length = keys.length;
      var i = 0;
      var result = [];
      var key;

      while (length > i) {
        key = keys[i++];

        if (!_descriptors || isEnum$1.call(O, key)) {
          result.push(isEntries ? [key, O[key]] : O[key]);
        }
      }

      return result;
    };
  }; // https://github.com/tc39/proposal-object-values-entries


  var $values = _objectToArray(false);

  _export(_export.S, 'Object', {
    values: function values(it) {
      return $values(it);
    }
  }); // https://github.com/tc39/proposal-object-values-entries


  var $entries = _objectToArray(true);

  _export(_export.S, 'Object', {
    entries: function entries(it) {
      return $entries(it);
    }
  }); // Forced replacement prototype accessors methods


  var _objectForcedPam = !_fails(function () {
    var K = Math.random(); // In FF throws only define methods
    // eslint-disable-next-line no-undef, no-useless-call

    __defineSetter__.call(null, K, function () {
      /* empty */
    });

    delete _global[K];
  }); // B.2.2.2 Object.prototype.__defineGetter__(P, getter)


  _descriptors && _export(_export.P + _objectForcedPam, 'Object', {
    __defineGetter__: function __defineGetter__(P, getter) {
      _objectDp.f(_toObject(this), P, {
        get: _aFunction(getter),
        enumerable: true,
        configurable: true
      });
    }
  }); // B.2.2.3 Object.prototype.__defineSetter__(P, setter)

  _descriptors && _export(_export.P + _objectForcedPam, 'Object', {
    __defineSetter__: function __defineSetter__(P, setter) {
      _objectDp.f(_toObject(this), P, {
        set: _aFunction(setter),
        enumerable: true,
        configurable: true
      });
    }
  });
  var getOwnPropertyDescriptor = _objectGopd.f; // B.2.2.4 Object.prototype.__lookupGetter__(P)

  _descriptors && _export(_export.P + _objectForcedPam, 'Object', {
    __lookupGetter__: function __lookupGetter__(P) {
      var O = _toObject(this);

      var K = _toPrimitive(P, true);

      var D;

      do {
        if (D = getOwnPropertyDescriptor(O, K)) return D.get;
      } while (O = _objectGpo(O));
    }
  });
  var getOwnPropertyDescriptor$1 = _objectGopd.f; // B.2.2.5 Object.prototype.__lookupSetter__(P)

  _descriptors && _export(_export.P + _objectForcedPam, 'Object', {
    __lookupSetter__: function __lookupSetter__(P) {
      var O = _toObject(this);

      var K = _toPrimitive(P, true);

      var D;

      do {
        if (D = getOwnPropertyDescriptor$1(O, K)) return D.set;
      } while (O = _objectGpo(O));
    }
  });

  var _arrayFromIterable = function _arrayFromIterable(iter, ITERATOR) {
    var result = [];

    _forOf(iter, false, result.push, result, ITERATOR);

    return result;
  }; // https://github.com/DavidBruant/Map-Set.prototype.toJSON


  var _collectionToJson = function _collectionToJson(NAME) {
    return function toJSON() {
      if (_classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
      return _arrayFromIterable(this);
    };
  }; // https://github.com/DavidBruant/Map-Set.prototype.toJSON


  _export(_export.P + _export.R, 'Map', {
    toJSON: _collectionToJson('Map')
  }); // https://github.com/DavidBruant/Map-Set.prototype.toJSON


  _export(_export.P + _export.R, 'Set', {
    toJSON: _collectionToJson('Set')
  }); // https://tc39.github.io/proposal-setmap-offrom/


  var _setCollectionOf = function _setCollectionOf(COLLECTION) {
    _export(_export.S, COLLECTION, {
      of: function of() {
        var length = arguments.length;
        var A = new Array(length);

        while (length--) {
          A[length] = arguments[length];
        }

        return new this(A);
      }
    });
  }; // https://tc39.github.io/proposal-setmap-offrom/#sec-map.of


  _setCollectionOf('Map'); // https://tc39.github.io/proposal-setmap-offrom/#sec-set.of


  _setCollectionOf('Set'); // https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.of


  _setCollectionOf('WeakMap'); // https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.of


  _setCollectionOf('WeakSet'); // https://tc39.github.io/proposal-setmap-offrom/


  var _setCollectionFrom = function _setCollectionFrom(COLLECTION) {
    _export(_export.S, COLLECTION, {
      from: function from(source
      /* , mapFn, thisArg */
      ) {
        var mapFn = arguments[1];
        var mapping, A, n, cb;

        _aFunction(this);

        mapping = mapFn !== undefined;
        if (mapping) _aFunction(mapFn);
        if (source == undefined) return new this();
        A = [];

        if (mapping) {
          n = 0;
          cb = _ctx(mapFn, arguments[2], 2);

          _forOf(source, false, function (nextItem) {
            A.push(cb(nextItem, n++));
          });
        } else {
          _forOf(source, false, A.push, A);
        }

        return new this(A);
      }
    });
  }; // https://tc39.github.io/proposal-setmap-offrom/#sec-map.from


  _setCollectionFrom('Map'); // https://tc39.github.io/proposal-setmap-offrom/#sec-set.from


  _setCollectionFrom('Set'); // https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.from


  _setCollectionFrom('WeakMap'); // https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.from


  _setCollectionFrom('WeakSet'); // https://github.com/tc39/proposal-global


  _export(_export.G, {
    global: _global
  }); // https://github.com/tc39/proposal-global


  _export(_export.S, 'System', {
    global: _global
  }); // https://github.com/ljharb/proposal-is-error


  _export(_export.S, 'Error', {
    isError: function isError(it) {
      return _cof(it) === 'Error';
    }
  }); // https://rwaldron.github.io/proposal-math-extensions/


  _export(_export.S, 'Math', {
    clamp: function clamp(x, lower, upper) {
      return Math.min(upper, Math.max(lower, x));
    }
  }); // https://rwaldron.github.io/proposal-math-extensions/


  _export(_export.S, 'Math', {
    DEG_PER_RAD: Math.PI / 180
  }); // https://rwaldron.github.io/proposal-math-extensions/


  var RAD_PER_DEG = 180 / Math.PI;

  _export(_export.S, 'Math', {
    degrees: function degrees(radians) {
      return radians * RAD_PER_DEG;
    }
  }); // https://rwaldron.github.io/proposal-math-extensions/


  var _mathScale = Math.scale || function scale(x, inLow, inHigh, outLow, outHigh) {
    if (arguments.length === 0 // eslint-disable-next-line no-self-compare
    || x != x // eslint-disable-next-line no-self-compare
    || inLow != inLow // eslint-disable-next-line no-self-compare
    || inHigh != inHigh // eslint-disable-next-line no-self-compare
    || outLow != outLow // eslint-disable-next-line no-self-compare
    || outHigh != outHigh) return NaN;
    if (x === Infinity || x === -Infinity) return x;
    return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
  }; // https://rwaldron.github.io/proposal-math-extensions/


  _export(_export.S, 'Math', {
    fscale: function fscale(x, inLow, inHigh, outLow, outHigh) {
      return _mathFround(_mathScale(x, inLow, inHigh, outLow, outHigh));
    }
  }); // https://gist.github.com/BrendanEich/4294d5c212a6d2254703


  _export(_export.S, 'Math', {
    iaddh: function iaddh(x0, x1, y0, y1) {
      var $x0 = x0 >>> 0;
      var $x1 = x1 >>> 0;
      var $y0 = y0 >>> 0;
      return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
    }
  }); // https://gist.github.com/BrendanEich/4294d5c212a6d2254703


  _export(_export.S, 'Math', {
    isubh: function isubh(x0, x1, y0, y1) {
      var $x0 = x0 >>> 0;
      var $x1 = x1 >>> 0;
      var $y0 = y0 >>> 0;
      return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
    }
  }); // https://gist.github.com/BrendanEich/4294d5c212a6d2254703


  _export(_export.S, 'Math', {
    imulh: function imulh(u, v) {
      var UINT16 = 0xffff;
      var $u = +u;
      var $v = +v;
      var u0 = $u & UINT16;
      var v0 = $v & UINT16;
      var u1 = $u >> 16;
      var v1 = $v >> 16;
      var t = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
      return u1 * v1 + (t >> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >> 16);
    }
  }); // https://rwaldron.github.io/proposal-math-extensions/


  _export(_export.S, 'Math', {
    RAD_PER_DEG: 180 / Math.PI
  }); // https://rwaldron.github.io/proposal-math-extensions/


  var DEG_PER_RAD = Math.PI / 180;

  _export(_export.S, 'Math', {
    radians: function radians(degrees) {
      return degrees * DEG_PER_RAD;
    }
  }); // https://rwaldron.github.io/proposal-math-extensions/


  _export(_export.S, 'Math', {
    scale: _mathScale
  }); // https://gist.github.com/BrendanEich/4294d5c212a6d2254703


  _export(_export.S, 'Math', {
    umulh: function umulh(u, v) {
      var UINT16 = 0xffff;
      var $u = +u;
      var $v = +v;
      var u0 = $u & UINT16;
      var v0 = $v & UINT16;
      var u1 = $u >>> 16;
      var v1 = $v >>> 16;
      var t = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
      return u1 * v1 + (t >>> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >>> 16);
    }
  }); // http://jfbastien.github.io/papers/Math.signbit.html


  _export(_export.S, 'Math', {
    signbit: function signbit(x) {
      // eslint-disable-next-line no-self-compare
      return (x = +x) != x ? x : x == 0 ? 1 / x == Infinity : x > 0;
    }
  });

  _export(_export.P + _export.R, 'Promise', {
    'finally': function _finally(onFinally) {
      var C = _speciesConstructor(this, _core.Promise || _global.Promise);

      var isFunction = typeof onFinally == 'function';
      return this.then(isFunction ? function (x) {
        return _promiseResolve(C, onFinally()).then(function () {
          return x;
        });
      } : onFinally, isFunction ? function (e) {
        return _promiseResolve(C, onFinally()).then(function () {
          throw e;
        });
      } : onFinally);
    }
  }); // https://github.com/tc39/proposal-promise-try


  _export(_export.S, 'Promise', {
    'try': function _try(callbackfn) {
      var promiseCapability = _newPromiseCapability.f(this);

      var result = _perform(callbackfn);

      (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
      return promiseCapability.promise;
    }
  });

  var shared$1 = _shared('metadata');

  var store = shared$1.store || (shared$1.store = new es6_weakMap());

  var getOrCreateMetadataMap = function getOrCreateMetadataMap(target, targetKey, create) {
    var targetMetadata = store.get(target);

    if (!targetMetadata) {
      if (!create) return undefined;
      store.set(target, targetMetadata = new es6_map());
    }

    var keyMetadata = targetMetadata.get(targetKey);

    if (!keyMetadata) {
      if (!create) return undefined;
      targetMetadata.set(targetKey, keyMetadata = new es6_map());
    }

    return keyMetadata;
  };

  var ordinaryHasOwnMetadata = function ordinaryHasOwnMetadata(MetadataKey, O, P) {
    var metadataMap = getOrCreateMetadataMap(O, P, false);
    return metadataMap === undefined ? false : metadataMap.has(MetadataKey);
  };

  var ordinaryGetOwnMetadata = function ordinaryGetOwnMetadata(MetadataKey, O, P) {
    var metadataMap = getOrCreateMetadataMap(O, P, false);
    return metadataMap === undefined ? undefined : metadataMap.get(MetadataKey);
  };

  var ordinaryDefineOwnMetadata = function ordinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
    getOrCreateMetadataMap(O, P, true).set(MetadataKey, MetadataValue);
  };

  var ordinaryOwnMetadataKeys = function ordinaryOwnMetadataKeys(target, targetKey) {
    var metadataMap = getOrCreateMetadataMap(target, targetKey, false);
    var keys = [];
    if (metadataMap) metadataMap.forEach(function (_, key) {
      keys.push(key);
    });
    return keys;
  };

  var toMetaKey = function toMetaKey(it) {
    return it === undefined || _typeof2(it) == 'symbol' ? it : String(it);
  };

  var exp$3 = function exp$3(O) {
    _export(_export.S, 'Reflect', O);
  };

  var _metadata = {
    store: store,
    map: getOrCreateMetadataMap,
    has: ordinaryHasOwnMetadata,
    get: ordinaryGetOwnMetadata,
    set: ordinaryDefineOwnMetadata,
    keys: ordinaryOwnMetadataKeys,
    key: toMetaKey,
    exp: exp$3
  };
  var toMetaKey$1 = _metadata.key;
  var ordinaryDefineOwnMetadata$1 = _metadata.set;

  _metadata.exp({
    defineMetadata: function defineMetadata(metadataKey, metadataValue, target, targetKey) {
      ordinaryDefineOwnMetadata$1(metadataKey, metadataValue, _anObject(target), toMetaKey$1(targetKey));
    }
  });

  var toMetaKey$2 = _metadata.key;
  var getOrCreateMetadataMap$1 = _metadata.map;
  var store$1 = _metadata.store;

  _metadata.exp({
    deleteMetadata: function deleteMetadata(metadataKey, target
    /* , targetKey */
    ) {
      var targetKey = arguments.length < 3 ? undefined : toMetaKey$2(arguments[2]);
      var metadataMap = getOrCreateMetadataMap$1(_anObject(target), targetKey, false);
      if (metadataMap === undefined || !metadataMap['delete'](metadataKey)) return false;
      if (metadataMap.size) return true;
      var targetMetadata = store$1.get(target);
      targetMetadata['delete'](targetKey);
      return !!targetMetadata.size || store$1['delete'](target);
    }
  });

  var ordinaryHasOwnMetadata$1 = _metadata.has;
  var ordinaryGetOwnMetadata$1 = _metadata.get;
  var toMetaKey$3 = _metadata.key;

  var ordinaryGetMetadata = function ordinaryGetMetadata(MetadataKey, O, P) {
    var hasOwn = ordinaryHasOwnMetadata$1(MetadataKey, O, P);
    if (hasOwn) return ordinaryGetOwnMetadata$1(MetadataKey, O, P);

    var parent = _objectGpo(O);

    return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
  };

  _metadata.exp({
    getMetadata: function getMetadata(metadataKey, target
    /* , targetKey */
    ) {
      return ordinaryGetMetadata(metadataKey, _anObject(target), arguments.length < 3 ? undefined : toMetaKey$3(arguments[2]));
    }
  });

  var ordinaryOwnMetadataKeys$1 = _metadata.keys;
  var toMetaKey$4 = _metadata.key;

  var ordinaryMetadataKeys = function ordinaryMetadataKeys(O, P) {
    var oKeys = ordinaryOwnMetadataKeys$1(O, P);

    var parent = _objectGpo(O);

    if (parent === null) return oKeys;
    var pKeys = ordinaryMetadataKeys(parent, P);
    return pKeys.length ? oKeys.length ? _arrayFromIterable(new es6_set(oKeys.concat(pKeys))) : pKeys : oKeys;
  };

  _metadata.exp({
    getMetadataKeys: function getMetadataKeys(target
    /* , targetKey */
    ) {
      return ordinaryMetadataKeys(_anObject(target), arguments.length < 2 ? undefined : toMetaKey$4(arguments[1]));
    }
  });

  var ordinaryGetOwnMetadata$2 = _metadata.get;
  var toMetaKey$5 = _metadata.key;

  _metadata.exp({
    getOwnMetadata: function getOwnMetadata(metadataKey, target
    /* , targetKey */
    ) {
      return ordinaryGetOwnMetadata$2(metadataKey, _anObject(target), arguments.length < 3 ? undefined : toMetaKey$5(arguments[2]));
    }
  });

  var ordinaryOwnMetadataKeys$2 = _metadata.keys;
  var toMetaKey$6 = _metadata.key;

  _metadata.exp({
    getOwnMetadataKeys: function getOwnMetadataKeys(target
    /* , targetKey */
    ) {
      return ordinaryOwnMetadataKeys$2(_anObject(target), arguments.length < 2 ? undefined : toMetaKey$6(arguments[1]));
    }
  });

  var ordinaryHasOwnMetadata$2 = _metadata.has;
  var toMetaKey$7 = _metadata.key;

  var ordinaryHasMetadata = function ordinaryHasMetadata(MetadataKey, O, P) {
    var hasOwn = ordinaryHasOwnMetadata$2(MetadataKey, O, P);
    if (hasOwn) return true;

    var parent = _objectGpo(O);

    return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
  };

  _metadata.exp({
    hasMetadata: function hasMetadata(metadataKey, target
    /* , targetKey */
    ) {
      return ordinaryHasMetadata(metadataKey, _anObject(target), arguments.length < 3 ? undefined : toMetaKey$7(arguments[2]));
    }
  });

  var ordinaryHasOwnMetadata$3 = _metadata.has;
  var toMetaKey$8 = _metadata.key;

  _metadata.exp({
    hasOwnMetadata: function hasOwnMetadata(metadataKey, target
    /* , targetKey */
    ) {
      return ordinaryHasOwnMetadata$3(metadataKey, _anObject(target), arguments.length < 3 ? undefined : toMetaKey$8(arguments[2]));
    }
  });

  var toMetaKey$9 = _metadata.key;
  var ordinaryDefineOwnMetadata$2 = _metadata.set;

  _metadata.exp({
    metadata: function metadata(metadataKey, metadataValue) {
      return function decorator(target, targetKey) {
        ordinaryDefineOwnMetadata$2(metadataKey, metadataValue, (targetKey !== undefined ? _anObject : _aFunction)(target), toMetaKey$9(targetKey));
      };
    }
  }); // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask


  var microtask$1 = _microtask();

  var process$3 = _global.process;
  var isNode$2 = _cof(process$3) == 'process';

  _export(_export.G, {
    asap: function asap(fn) {
      var domain = isNode$2 && process$3.domain;
      microtask$1(domain ? domain.bind(fn) : fn);
    }
  }); // https://github.com/zenparsing/es-observable


  var microtask$2 = _microtask();

  var OBSERVABLE = _wks('observable');

  var RETURN = _forOf.RETURN;

  var getMethod = function getMethod(fn) {
    return fn == null ? undefined : _aFunction(fn);
  };

  var cleanupSubscription = function cleanupSubscription(subscription) {
    var cleanup = subscription._c;

    if (cleanup) {
      subscription._c = undefined;
      cleanup();
    }
  };

  var subscriptionClosed = function subscriptionClosed(subscription) {
    return subscription._o === undefined;
  };

  var closeSubscription = function closeSubscription(subscription) {
    if (!subscriptionClosed(subscription)) {
      subscription._o = undefined;
      cleanupSubscription(subscription);
    }
  };

  var Subscription = function Subscription(observer, subscriber) {
    _anObject(observer);

    this._c = undefined;
    this._o = observer;
    observer = new SubscriptionObserver(this);

    try {
      var cleanup = subscriber(observer);
      var subscription = cleanup;

      if (cleanup != null) {
        if (typeof cleanup.unsubscribe === 'function') cleanup = function cleanup() {
          subscription.unsubscribe();
        };else _aFunction(cleanup);
        this._c = cleanup;
      }
    } catch (e) {
      observer.error(e);
      return;
    }

    if (subscriptionClosed(this)) cleanupSubscription(this);
  };

  Subscription.prototype = _redefineAll({}, {
    unsubscribe: function unsubscribe() {
      closeSubscription(this);
    }
  });

  var SubscriptionObserver = function SubscriptionObserver(subscription) {
    this._s = subscription;
  };

  SubscriptionObserver.prototype = _redefineAll({}, {
    next: function next(value) {
      var subscription = this._s;

      if (!subscriptionClosed(subscription)) {
        var observer = subscription._o;

        try {
          var m = getMethod(observer.next);
          if (m) return m.call(observer, value);
        } catch (e) {
          try {
            closeSubscription(subscription);
          } finally {
            throw e;
          }
        }
      }
    },
    error: function error(value) {
      var subscription = this._s;
      if (subscriptionClosed(subscription)) throw value;
      var observer = subscription._o;
      subscription._o = undefined;

      try {
        var m = getMethod(observer.error);
        if (!m) throw value;
        value = m.call(observer, value);
      } catch (e) {
        try {
          cleanupSubscription(subscription);
        } finally {
          throw e;
        }
      }

      cleanupSubscription(subscription);
      return value;
    },
    complete: function complete(value) {
      var subscription = this._s;

      if (!subscriptionClosed(subscription)) {
        var observer = subscription._o;
        subscription._o = undefined;

        try {
          var m = getMethod(observer.complete);
          value = m ? m.call(observer, value) : undefined;
        } catch (e) {
          try {
            cleanupSubscription(subscription);
          } finally {
            throw e;
          }
        }

        cleanupSubscription(subscription);
        return value;
      }
    }
  });

  var $Observable = function Observable(subscriber) {
    _anInstance(this, $Observable, 'Observable', '_f')._f = _aFunction(subscriber);
  };

  _redefineAll($Observable.prototype, {
    subscribe: function subscribe(observer) {
      return new Subscription(observer, this._f);
    },
    forEach: function forEach(fn) {
      var that = this;
      return new (_core.Promise || _global.Promise)(function (resolve, reject) {
        _aFunction(fn);

        var subscription = that.subscribe({
          next: function next(value) {
            try {
              return fn(value);
            } catch (e) {
              reject(e);
              subscription.unsubscribe();
            }
          },
          error: reject,
          complete: resolve
        });
      });
    }
  });

  _redefineAll($Observable, {
    from: function from(x) {
      var C = typeof this === 'function' ? this : $Observable;
      var method = getMethod(_anObject(x)[OBSERVABLE]);

      if (method) {
        var observable = _anObject(method.call(x));

        return observable.constructor === C ? observable : new C(function (observer) {
          return observable.subscribe(observer);
        });
      }

      return new C(function (observer) {
        var done = false;
        microtask$2(function () {
          if (!done) {
            try {
              if (_forOf(x, false, function (it) {
                observer.next(it);
                if (done) return RETURN;
              }) === RETURN) return;
            } catch (e) {
              if (done) throw e;
              observer.error(e);
              return;
            }

            observer.complete();
          }
        });
        return function () {
          done = true;
        };
      });
    },
    of: function of() {
      for (var i = 0, l = arguments.length, items = new Array(l); i < l;) {
        items[i] = arguments[i++];
      }

      return new (typeof this === 'function' ? this : $Observable)(function (observer) {
        var done = false;
        microtask$2(function () {
          if (!done) {
            for (var j = 0; j < items.length; ++j) {
              observer.next(items[j]);
              if (done) return;
            }

            observer.complete();
          }
        });
        return function () {
          done = true;
        };
      });
    }
  });

  _hide($Observable.prototype, OBSERVABLE, function () {
    return this;
  });

  _export(_export.G, {
    Observable: $Observable
  });

  _setSpecies('Observable'); // ie9- setTimeout & setInterval additional parameters fix


  var slice = [].slice;
  var MSIE = /MSIE .\./.test(_userAgent); // <- dirty ie9- check

  var wrap$1 = function wrap$1(set) {
    return function (fn, time
    /* , ...args */
    ) {
      var boundArgs = arguments.length > 2;
      var args = boundArgs ? slice.call(arguments, 2) : false;
      return set(boundArgs ? function () {
        // eslint-disable-next-line no-new-func
        (typeof fn == 'function' ? fn : Function(fn)).apply(this, args);
      } : fn, time);
    };
  };

  _export(_export.G + _export.B + _export.F * MSIE, {
    setTimeout: wrap$1(_global.setTimeout),
    setInterval: wrap$1(_global.setInterval)
  });

  _export(_export.G + _export.B, {
    setImmediate: _task.set,
    clearImmediate: _task.clear
  });

  var ITERATOR$4 = _wks('iterator');

  var TO_STRING_TAG = _wks('toStringTag');

  var ArrayValues = _iterators.Array;
  var DOMIterables = {
    CSSRuleList: true,
    // TODO: Not spec compliant, should be false.
    CSSStyleDeclaration: false,
    CSSValueList: false,
    ClientRectList: false,
    DOMRectList: false,
    DOMStringList: false,
    DOMTokenList: true,
    DataTransferItemList: false,
    FileList: false,
    HTMLAllCollection: false,
    HTMLCollection: false,
    HTMLFormElement: false,
    HTMLSelectElement: false,
    MediaList: true,
    // TODO: Not spec compliant, should be false.
    MimeTypeArray: false,
    NamedNodeMap: false,
    NodeList: true,
    PaintRequestList: false,
    Plugin: false,
    PluginArray: false,
    SVGLengthList: false,
    SVGNumberList: false,
    SVGPathSegList: false,
    SVGPointList: false,
    SVGStringList: false,
    SVGTransformList: false,
    SourceBufferList: false,
    StyleSheetList: true,
    // TODO: Not spec compliant, should be false.
    TextTrackCueList: false,
    TextTrackList: false,
    TouchList: false
  };

  for (var collections = _objectKeys(DOMIterables), i$2 = 0; i$2 < collections.length; i$2++) {
    var NAME$1 = collections[i$2];
    var explicit = DOMIterables[NAME$1];
    var Collection = _global[NAME$1];
    var proto$3 = Collection && Collection.prototype;
    var key$1;

    if (proto$3) {
      if (!proto$3[ITERATOR$4]) _hide(proto$3, ITERATOR$4, ArrayValues);
      if (!proto$3[TO_STRING_TAG]) _hide(proto$3, TO_STRING_TAG, NAME$1);
      _iterators[NAME$1] = ArrayValues;
      if (explicit) for (key$1 in es6_array_iterator) {
        if (!proto$3[key$1]) _redefine(proto$3, key$1, es6_array_iterator[key$1], true);
      }
    }
  }
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */


  createCommonjsModule(function (module) {
    var runtime = function (exports) {
      var Op = Object.prototype;
      var hasOwn = Op.hasOwnProperty;
      var undefined$1; // More compressible than void 0.

      var $Symbol = typeof Symbol === "function" ? Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

      function define(obj, key, value) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
        return obj[key];
      }

      try {
        // IE 8 has a broken Object.defineProperty that only works on DOM objects.
        define({}, "");
      } catch (err) {
        define = function define(obj, key, value) {
          return obj[key] = value;
        };
      }

      function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.

        generator._invoke = makeInvokeMethod(innerFn, self, context);
        return generator;
      }

      exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
      // record like context.tryEntries[i].completion. This interface could
      // have been (and was previously) designed to take a closure to be
      // invoked without arguments, but in all the cases we care about we
      // already have an existing method we want to call, so there's no need
      // to create a new function object. We can even get away with assuming
      // the method takes exactly one argument, since that happens to be true
      // in every case, so we don't have to touch the arguments object. The
      // only additional allocation required is the completion record, which
      // has a stable shape and so hopefully should be cheap to allocate.

      function tryCatch(fn, obj, arg) {
        try {
          return {
            type: "normal",
            arg: fn.call(obj, arg)
          };
        } catch (err) {
          return {
            type: "throw",
            arg: err
          };
        }
      }

      var GenStateSuspendedStart = "suspendedStart";
      var GenStateSuspendedYield = "suspendedYield";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
      // breaking out of the dispatch switch statement.

      var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
      // .constructor.prototype properties for functions that return Generator
      // objects. For full spec compliance, you may wish to configure your
      // minifier not to mangle the names of these two functions.

      function Generator() {}

      function GeneratorFunction() {}

      function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
      // don't natively support it.


      var IteratorPrototype = {};

      IteratorPrototype[iteratorSymbol] = function () {
        return this;
      };

      var getProto = Object.getPrototypeOf;
      var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

      if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
      }

      var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
      // Iterator interface in terms of a single ._invoke method.

      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function (method) {
          define(prototype, method, function (arg) {
            return this._invoke(method, arg);
          });
        });
      }

      exports.isGeneratorFunction = function (genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
      };

      exports.mark = function (genFun) {
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;
          define(genFun, toStringTagSymbol, "GeneratorFunction");
        }

        genFun.prototype = Object.create(Gp);
        return genFun;
      }; // Within the body of any async function, `await x` is transformed to
      // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
      // `hasOwn.call(value, "__await")` to determine if the yielded value is
      // meant to be awaited.


      exports.awrap = function (arg) {
        return {
          __await: arg
        };
      };

      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);

          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;

            if (value && _typeof2(value) === "object" && hasOwn.call(value, "__await")) {
              return PromiseImpl.resolve(value.__await).then(function (value) {
                invoke("next", value, resolve, reject);
              }, function (err) {
                invoke("throw", err, resolve, reject);
              });
            }

            return PromiseImpl.resolve(value).then(function (unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration.
              result.value = unwrapped;
              resolve(result);
            }, function (error) {
              // If a rejected Promise was yielded, throw the rejection back
              // into the async generator function so it can be handled there.
              return invoke("throw", error, resolve, reject);
            });
          }
        }

        var previousPromise;

        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }

          return previousPromise = // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        } // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).


        this._invoke = enqueue;
      }

      defineIteratorMethods(AsyncIterator.prototype);

      AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
      };

      exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
      // AsyncIterator objects; they just return a Promise for the value of
      // the final result produced by the iterator.

      exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
        if (PromiseImpl === void 0) PromiseImpl = Promise;
        var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
        return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function (result) {
          return result.done ? result.value : iter.next();
        });
      };

      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;
        return function invoke(method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }

          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            } // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


            return doneResult();
          }

          context.method = method;
          context.arg = arg;

          while (true) {
            var delegate = context.delegate;

            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);

              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }

            if (context.method === "next") {
              // Setting context._sent for legacy support of Babel's
              // function.sent implementation.
              context.sent = context._sent = context.arg;
            } else if (context.method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw context.arg;
              }

              context.dispatchException(context.arg);
            } else if (context.method === "return") {
              context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;
            var record = tryCatch(innerFn, self, context);

            if (record.type === "normal") {
              // If an exception is thrown from innerFn, we leave state ===
              // GenStateExecuting and loop back for another invocation.
              state = context.done ? GenStateCompleted : GenStateSuspendedYield;

              if (record.arg === ContinueSentinel) {
                continue;
              }

              return {
                value: record.arg,
                done: context.done
              };
            } else if (record.type === "throw") {
              state = GenStateCompleted; // Dispatch the exception by looping back around to the
              // context.dispatchException(context.arg) call above.

              context.method = "throw";
              context.arg = record.arg;
            }
          }
        };
      } // Call delegate.iterator[context.method](context.arg) and handle the
      // result, either by returning a { value, done } result from the
      // delegate iterator, or by modifying context.method and context.arg,
      // setting context.delegate to null, and returning the ContinueSentinel.


      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];

        if (method === undefined$1) {
          // A .throw or .return when the delegate iterator has no .throw
          // method always terminates the yield* loop.
          context.delegate = null;

          if (context.method === "throw") {
            // Note: ["return"] must be used for ES3 parsing compatibility.
            if (delegate.iterator["return"]) {
              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              context.method = "return";
              context.arg = undefined$1;
              maybeInvokeDelegate(delegate, context);

              if (context.method === "throw") {
                // If maybeInvokeDelegate(context) changed context.method from
                // "return" to "throw", let that override the TypeError below.
                return ContinueSentinel;
              }
            }

            context.method = "throw";
            context.arg = new TypeError("The iterator does not provide a 'throw' method");
          }

          return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
          context.method = "throw";
          context.arg = record.arg;
          context.delegate = null;
          return ContinueSentinel;
        }

        var info = record.arg;

        if (!info) {
          context.method = "throw";
          context.arg = new TypeError("iterator result is not an object");
          context.delegate = null;
          return ContinueSentinel;
        }

        if (info.done) {
          // Assign the result of the finished delegate to the temporary
          // variable specified by delegate.resultName (see delegateYield).
          context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

          context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
          // exception, let the outer generator proceed normally. If
          // context.method was "next", forget context.arg since it has been
          // "consumed" by the delegate iterator. If context.method was
          // "return", allow the original .return call to continue in the
          // outer generator.

          if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined$1;
          }
        } else {
          // Re-yield the result returned by the delegate method.
          return info;
        } // The delegate iterator is finished, so forget it and continue with
        // the outer generator.


        context.delegate = null;
        return ContinueSentinel;
      } // Define Generator.prototype.{next,throw,return} in terms of the
      // unified ._invoke helper method.


      defineIteratorMethods(Gp);
      define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
      // @@iterator function is called on it. Some browsers' implementations of the
      // iterator prototype chain incorrectly implement this, causing the Generator
      // object to not be returned from this call. This ensures that doesn't happen.
      // See https://github.com/facebook/regenerator/issues/274 for more details.

      Gp[iteratorSymbol] = function () {
        return this;
      };

      Gp.toString = function () {
        return "[object Generator]";
      };

      function pushTryEntry(locs) {
        var entry = {
          tryLoc: locs[0]
        };

        if (1 in locs) {
          entry.catchLoc = locs[1];
        }

        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
      }

      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }

      function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{
          tryLoc: "root"
        }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }

      exports.keys = function (object) {
        var keys = [];

        for (var key in object) {
          keys.push(key);
        }

        keys.reverse(); // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.

        return function next() {
          while (keys.length) {
            var key = keys.pop();

            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          } // To avoid creating an additional object, we just hang the .value
          // and .done properties off the next function object itself. This
          // also ensures that the minifier will not anonymize the function.


          next.done = true;
          return next;
        };
      };

      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];

          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }

          if (typeof iterable.next === "function") {
            return iterable;
          }

          if (!isNaN(iterable.length)) {
            var i = -1,
                next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined$1;
              next.done = true;
              return next;
            };

            return next.next = next;
          }
        } // Return an iterator with no values.


        return {
          next: doneResult
        };
      }

      exports.values = values;

      function doneResult() {
        return {
          value: undefined$1,
          done: true
        };
      }

      Context.prototype = {
        constructor: Context,
        reset: function reset(skipTempReset) {
          this.prev = 0;
          this.next = 0; // Resetting context._sent for legacy support of Babel's
          // function.sent implementation.

          this.sent = this._sent = undefined$1;
          this.done = false;
          this.delegate = null;
          this.method = "next";
          this.arg = undefined$1;
          this.tryEntries.forEach(resetTryEntry);

          if (!skipTempReset) {
            for (var name in this) {
              // Not sure about the optimal order of these conditions:
              if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                this[name] = undefined$1;
              }
            }
          }
        },
        stop: function stop() {
          this.done = true;
          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;

          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }

          return this.rval;
        },
        dispatchException: function dispatchException(exception) {
          if (this.done) {
            throw exception;
          }

          var context = this;

          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              context.method = "next";
              context.arg = undefined$1;
            }

            return !!caught;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
              // Exception thrown outside of any try block that could handle
              // it, so set the completion value of the entire function to
              // throw the exception.
              return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");

              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }
              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },
        abrupt: function abrupt(type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }

          if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
          }

          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;

          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }

          return this.complete(record);
        },
        complete: function complete(record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }

          if (record.type === "break" || record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }

          return ContinueSentinel;
        },
        finish: function finish(finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },
        "catch": function _catch(tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;

              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }

              return thrown;
            }
          } // The context.catch method must only be called with a location
          // argument that corresponds to a known catch block.


          throw new Error("illegal catch attempt");
        },
        delegateYield: function delegateYield(iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };

          if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined$1;
          }

          return ContinueSentinel;
        }
      }; // Regardless of whether this script is executing as a CommonJS module
      // or not, return the runtime object so that we can declare the variable
      // regeneratorRuntime in the outer scope, which allows this module to be
      // injected easily by `bin/regenerator --include-runtime script.js`.

      return exports;
    }( // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
    module.exports);

    try {
      regeneratorRuntime = runtime;
    } catch (accidentalStrictMode) {
      // This module should not be running in strict mode, so the above
      // assignment should always work unless something is misconfigured. Just
      // in case runtime.js accidentally runs in strict mode, we can escape
      // strict mode using a global Function call. This could conceivably fail
      // if a Content Security Policy forbids using Function, but in that case
      // the proper solution is to fix the accidental strict mode problem. If
      // you've misconfigured your bundler to force strict mode and applied a
      // CSP to forbid Function, and you're not willing to fix either of those
      // problems, please detail your unique predicament in a GitHub issue.
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  });

  if (typeof window !== "undefined") {
    (function () {
      try {
        if (typeof SVGElement === 'undefined' || Boolean(SVGElement.prototype.innerHTML)) {
          return;
        }
      } catch (e) {
        return;
      }

      function serializeNode(node) {
        switch (node.nodeType) {
          case 1:
            return serializeElementNode(node);

          case 3:
            return serializeTextNode(node);

          case 8:
            return serializeCommentNode(node);
        }
      }

      function serializeTextNode(node) {
        return node.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      function serializeCommentNode(node) {
        return '<!--' + node.nodeValue + '-->';
      }

      function serializeElementNode(node) {
        var output = '';
        output += '<' + node.tagName;

        if (node.hasAttributes()) {
          [].forEach.call(node.attributes, function (attrNode) {
            output += ' ' + attrNode.name + '="' + attrNode.value + '"';
          });
        }

        output += '>';

        if (node.hasChildNodes()) {
          [].forEach.call(node.childNodes, function (childNode) {
            output += serializeNode(childNode);
          });
        }

        output += '</' + node.tagName + '>';
        return output;
      }

      Object.defineProperty(SVGElement.prototype, 'innerHTML', {
        get: function get() {
          var output = '';
          [].forEach.call(this.childNodes, function (childNode) {
            output += serializeNode(childNode);
          });
          return output;
        },
        set: function set(markup) {
          while (this.firstChild) {
            this.removeChild(this.firstChild);
          }

          try {
            var dXML = new DOMParser();
            dXML.async = false;
            var sXML = '<svg xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\'>' + markup + '</svg>';
            var svgDocElement = dXML.parseFromString(sXML, 'text/xml').documentElement;
            [].forEach.call(svgDocElement.childNodes, function (childNode) {
              this.appendChild(this.ownerDocument.importNode(childNode, true));
            }.bind(this));
          } catch (e) {
            throw new Error('Error parsing markup string');
          }
        }
      });
      Object.defineProperty(SVGElement.prototype, 'innerSVG', {
        get: function get() {
          return this.innerHTML;
        },
        set: function set(markup) {
          this.innerHTML = markup;
        }
      });
    })();
  }
});

(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof2(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define('d3plus-text', ['exports'], factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.d3plus = {}));
})(this, function (exports) {
  var _marked = /*#__PURE__*/regeneratorRuntime.mark(selection_iterator),
      _marked2 = /*#__PURE__*/regeneratorRuntime.mark(flatten);

  /**
   * Strips HTML and "un-escapes" escape characters.
   * @param {String} input
   */
  function htmlDecode(input) {
    if (input.replace(/\s+/g, "") === "") return input;
    var doc = new DOMParser().parseFromString(input.replace(/<[^>]+>/g, ""), "text/html");
    return doc.documentElement ? doc.documentElement.textContent : input;
  }
  /**
      @function textWidth
      @desc Given a text string, returns the predicted pixel width of the string when placed into DOM.
      @param {String|Array} text Can be either a single string or an array of strings to analyze.
      @param {Object} [style] An object of CSS font styles to apply. Accepts any of the valid [CSS font property](http://www.w3schools.com/cssref/pr_font_font.asp) values.
  */


  function measure(text, style) {
    style = Object.assign({
      "font-size": 10,
      "font-family": "sans-serif",
      "font-style": "normal",
      "font-weight": 400,
      "font-variant": "normal"
    }, style);
    var context = document.createElement("canvas").getContext("2d");
    var font = [];
    font.push(style["font-style"]);
    font.push(style["font-variant"]);
    font.push(style["font-weight"]);
    font.push(typeof style["font-size"] === "string" ? style["font-size"] : "".concat(style["font-size"], "px"));
    font.push(style["font-family"]);
    context.font = font.join(" ");
    if (text instanceof Array) return text.map(function (t) {
      return context.measureText(htmlDecode(t)).width;
    });
    return context.measureText(htmlDecode(text)).width;
  }
  /**
      @function trim
      @desc Cross-browser implementation of [trim](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim).
      @param {String} str
  */


  function trim(str) {
    return str.toString().replace(/^\s+|\s+$/g, "");
  }
  /**
      @function trimLeft
      @desc Cross-browser implementation of [trimLeft](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/TrimLeft).
      @param {String} str
  */


  function trimLeft(str) {
    return str.toString().replace(/^\s+/, "");
  }
  /**
      @function trimRight
      @desc Cross-browser implementation of [trimRight](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/TrimRight).
      @param {String} str
  */


  function trimRight(str) {
    return str.toString().replace(/\s+$/, "");
  }

  var alpha = "abcdefghiABCDEFGHI_!@#$%^&*()_+1234567890",
      checked = {},
      height = 32;
  var dejavu, macos, monospace, proportional;
  /**
      @function fontExists
      @desc Given either a single font-family or a list of fonts, returns the name of the first font that can be rendered, or `false` if none are installed on the user's machine.
      @param {String|Array} font Can be either a valid CSS font-family string (single or comma-separated names) or an Array of string names.
  */

  var fontExists = function fontExists(font) {
    if (!dejavu) {
      dejavu = measure(alpha, {
        "font-family": "DejaVuSans",
        "font-size": height
      });
      macos = measure(alpha, {
        "font-family": "-apple-system",
        "font-size": height
      });
      monospace = measure(alpha, {
        "font-family": "monospace",
        "font-size": height
      });
      proportional = measure(alpha, {
        "font-family": "sans-serif",
        "font-size": height
      });
    }

    if (!(font instanceof Array)) font = font.split(",");
    font = font.map(function (f) {
      return trim(f);
    });

    for (var i = 0; i < font.length; i++) {
      var fam = font[i];
      if (checked[fam] || ["-apple-system", "monospace", "sans-serif", "DejaVuSans"].includes(fam)) return fam;else if (checked[fam] === false) continue;
      var width = measure(alpha, {
        "font-family": fam,
        "font-size": height
      });
      checked[fam] = width !== monospace;
      if (checked[fam]) checked[fam] = width !== proportional;
      if (macos && checked[fam]) checked[fam] = width !== macos;
      if (dejavu && checked[fam]) checked[fam] = width !== dejavu;
      if (checked[fam]) return fam;
    }

    return false;
  };

  var xhtml = "http://www.w3.org/1999/xhtml";
  var namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  function namespace(name) {
    var prefix = name += "",
        i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces.hasOwnProperty(prefix) ? {
      space: namespaces[prefix],
      local: name
    } : name; // eslint-disable-line no-prototype-builtins
  }

  function creatorInherit(name) {
    return function () {
      var document = this.ownerDocument,
          uri = this.namespaceURI;
      return uri === xhtml && document.documentElement.namespaceURI === xhtml ? document.createElement(name) : document.createElementNS(uri, name);
    };
  }

  function creatorFixed(fullname) {
    return function () {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }

  function creator(name) {
    var fullname = namespace(name);
    return (fullname.local ? creatorFixed : creatorInherit)(fullname);
  }

  function none() {}

  function selector(selector) {
    return selector == null ? none : function () {
      return this.querySelector(selector);
    };
  }

  function selection_select(select) {
    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function array(x) {
    return _typeof2(x) === "object" && "length" in x ? x // Array, TypedArray, NodeList, array-like
    : Array.from(x); // Map, Set, iterable, string, or anything else
  }

  function empty() {
    return [];
  }

  function selectorAll(selector) {
    return selector == null ? empty : function () {
      return this.querySelectorAll(selector);
    };
  }

  function arrayAll(select) {
    return function () {
      var group = select.apply(this, arguments);
      return group == null ? [] : array(group);
    };
  }

  function selection_selectAll(select) {
    if (typeof select === "function") select = arrayAll(select);else select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }

    return new Selection(subgroups, parents);
  }

  function matcher(selector) {
    return function () {
      return this.matches(selector);
    };
  }

  function childMatcher(selector) {
    return function (node) {
      return node.matches(selector);
    };
  }

  var find = Array.prototype.find;

  function childFind(match) {
    return function () {
      return find.call(this.children, match);
    };
  }

  function childFirst() {
    return this.firstElementChild;
  }

  function selection_selectChild(match) {
    return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  var filter = Array.prototype.filter;

  function children() {
    return this.children;
  }

  function childrenFilter(match) {
    return function () {
      return filter.call(this.children, match);
    };
  }

  function selection_selectChildren(match) {
    return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  function selection_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function sparse(update) {
    return new Array(update.length);
  }

  function selection_enter() {
    return new Selection(this._enter || this._groups.map(sparse), this._parents);
  }

  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }

  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function appendChild(child) {
      return this._parent.insertBefore(child, this._next);
    },
    insertBefore: function insertBefore(child, next) {
      return this._parent.insertBefore(child, next);
    },
    querySelector: function querySelector(selector) {
      return this._parent.querySelector(selector);
    },
    querySelectorAll: function querySelectorAll(selector) {
      return this._parent.querySelectorAll(selector);
    }
  };

  function constant(x) {
    return function () {
      return x;
    };
  }

  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0,
        node,
        groupLength = group.length,
        dataLength = data.length; // Put any non-null nodes that fit into update.
    // Put any null nodes into enter.
    // Put any remaining data into enter.

    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    } // Put any non-null nodes that don’t fit into exit.


    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }

  function bindKey(parent, group, enter, update, exit, data, key) {
    var i,
        node,
        nodeByKeyValue = new Map(),
        groupLength = group.length,
        dataLength = data.length,
        keyValues = new Array(groupLength),
        keyValue; // Compute the key for each node.
    // If multiple nodes have the same key, the duplicates are added to exit.

    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";

        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    } // Compute the key for each datum.
    // If there a node associated with this key, join and add it to update.
    // If there is not (or the key is a duplicate), add it to enter.


    for (i = 0; i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";

      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue["delete"](keyValue);
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    } // Add any remaining nodes that were not bound to data to exit.


    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
        exit[i] = node;
      }
    }
  }

  function datum(node) {
    return node.__data__;
  }

  function selection_data(value, key) {
    if (!arguments.length) return Array.from(this, datum);
    var bind = key ? bindKey : bindIndex,
        parents = this._parents,
        groups = this._groups;
    if (typeof value !== "function") value = constant(value);

    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j],
          group = groups[j],
          groupLength = group.length,
          data = array(value.call(parent, parent && parent.__data__, j, parents)),
          dataLength = data.length,
          enterGroup = enter[j] = new Array(dataLength),
          updateGroup = update[j] = new Array(dataLength),
          exitGroup = exit[j] = new Array(groupLength);
      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key); // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.

      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;

          while (!(next = updateGroup[i1]) && ++i1 < dataLength) {
            ;
          }

          previous._next = next || null;
        }
      }
    }

    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }

  function selection_exit() {
    return new Selection(this._exit || this._groups.map(sparse), this._parents);
  }

  function selection_join(onenter, onupdate, onexit) {
    var enter = this.enter(),
        update = this,
        exit = this.exit();
    enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
    if (onupdate != null) update = onupdate(update);
    if (onexit == null) exit.remove();else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  function selection_merge(selection) {
    if (!(selection instanceof Selection)) throw new Error("invalid merge");

    for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Selection(merges, this._parents);
  }

  function selection_order() {
    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }

    return this;
  }

  function selection_sort(compare) {
    if (!compare) compare = ascending;

    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }

    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }

      sortgroup.sort(compareNode);
    }

    return new Selection(sortgroups, this._parents).order();
  }

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function selection_call() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  function selection_nodes() {
    return Array.from(this);
  }

  function selection_node() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }

    return null;
  }

  function selection_size() {
    var size = 0;

    var _iterator = _createForOfIteratorHelper(this),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var node = _step.value;
        ++size;
      } // eslint-disable-line no-unused-vars

    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return size;
  }

  function selection_empty() {
    return !this.node();
  }

  function selection_each(callback) {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }

    return this;
  }

  function attrRemove(name) {
    return function () {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS(fullname) {
    return function () {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant(name, value) {
    return function () {
      this.setAttribute(name, value);
    };
  }

  function attrConstantNS(fullname, value) {
    return function () {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }

  function attrFunction(name, value) {
    return function () {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);else this.setAttribute(name, v);
    };
  }

  function attrFunctionNS(fullname, value) {
    return function () {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }

  function selection_attr(name, value) {
    var fullname = namespace(name);

    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
    }

    return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
  }

  function defaultView(node) {
    return node.ownerDocument && node.ownerDocument.defaultView || // node is a Node
    node.document && node // node is a Window
    || node.defaultView; // node is a Document
  }

  function styleRemove(name) {
    return function () {
      this.style.removeProperty(name);
    };
  }

  function styleConstant(name, value, priority) {
    return function () {
      this.style.setProperty(name, value, priority);
    };
  }

  function styleFunction(name, value, priority) {
    return function () {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);else this.style.setProperty(name, v, priority);
    };
  }

  function selection_style(name, value, priority) {
    return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
  }

  function styleValue(node, name) {
    return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  function propertyRemove(name) {
    return function () {
      delete this[name];
    };
  }

  function propertyConstant(name, value) {
    return function () {
      this[name] = value;
    };
  }

  function propertyFunction(name, value) {
    return function () {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];else this[name] = v;
    };
  }

  function selection_property(name, value) {
    return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
  }

  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }

  function classList(node) {
    return node.classList || new ClassList(node);
  }

  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }

  ClassList.prototype = {
    add: function add(name) {
      var i = this._names.indexOf(name);

      if (i < 0) {
        this._names.push(name);

        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function remove(name) {
      var i = this._names.indexOf(name);

      if (i >= 0) {
        this._names.splice(i, 1);

        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function contains(name) {
      return this._names.indexOf(name) >= 0;
    }
  };

  function classedAdd(node, names) {
    var list = classList(node),
        i = -1,
        n = names.length;

    while (++i < n) {
      list.add(names[i]);
    }
  }

  function classedRemove(node, names) {
    var list = classList(node),
        i = -1,
        n = names.length;

    while (++i < n) {
      list.remove(names[i]);
    }
  }

  function classedTrue(names) {
    return function () {
      classedAdd(this, names);
    };
  }

  function classedFalse(names) {
    return function () {
      classedRemove(this, names);
    };
  }

  function classedFunction(names, value) {
    return function () {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }

  function selection_classed(name, value) {
    var names = classArray(name + "");

    if (arguments.length < 2) {
      var list = classList(this.node()),
          i = -1,
          n = names.length;

      while (++i < n) {
        if (!list.contains(names[i])) return false;
      }

      return true;
    }

    return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
  }

  function textRemove() {
    this.textContent = "";
  }

  function textConstant(value) {
    return function () {
      this.textContent = value;
    };
  }

  function textFunction(value) {
    return function () {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }

  function selection_text(value) {
    return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
  }

  function htmlRemove() {
    this.innerHTML = "";
  }

  function htmlConstant(value) {
    return function () {
      this.innerHTML = value;
    };
  }

  function htmlFunction(value) {
    return function () {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }

  function selection_html(value) {
    return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
  }

  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }

  function selection_raise() {
    return this.each(raise);
  }

  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }

  function selection_lower() {
    return this.each(lower);
  }

  function selection_append(name) {
    var create = typeof name === "function" ? name : creator(name);
    return this.select(function () {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  function constantNull() {
    return null;
  }

  function selection_insert(name, before) {
    var create = typeof name === "function" ? name : creator(name),
        select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
    return this.select(function () {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }

  function selection_remove() {
    return this.each(remove);
  }

  function selection_cloneShallow() {
    var clone = this.cloneNode(false),
        parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_cloneDeep() {
    var clone = this.cloneNode(true),
        parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_clone(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  function selection_datum(value) {
    return arguments.length ? this.property("__data__", value) : this.node().__data__;
  }

  function contextListener(listener) {
    return function (event) {
      listener.call(this, event, this.__data__);
    };
  }

  function parseTypenames(typenames) {
    return typenames.trim().split(/^|\s+/).map(function (t) {
      var name = "",
          i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return {
        type: t,
        name: name
      };
    });
  }

  function onRemove(typename) {
    return function () {
      var on = this.__on;
      if (!on) return;

      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }

      if (++i) on.length = i;else delete this.__on;
    };
  }

  function onAdd(typename, value, options) {
    return function () {
      var on = this.__on,
          o,
          listener = contextListener(value);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, options);
      o = {
        type: typename.type,
        name: typename.name,
        value: value,
        listener: listener,
        options: options
      };
      if (!on) this.__on = [o];else on.push(o);
    };
  }

  function selection_on(typename, value, options) {
    var typenames = parseTypenames(typename + ""),
        i,
        n = typenames.length,
        t;

    if (arguments.length < 2) {
      var on = this.node().__on;

      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }

    on = value ? onAdd : onRemove;

    for (i = 0; i < n; ++i) {
      this.each(on(typenames[i], value, options));
    }

    return this;
  }

  function dispatchEvent(node, type, params) {
    var window = defaultView(node),
        event = window.CustomEvent;

    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;else event.initEvent(type, false, false);
    }

    node.dispatchEvent(event);
  }

  function dispatchConstant(type, params) {
    return function () {
      return dispatchEvent(this, type, params);
    };
  }

  function dispatchFunction(type, params) {
    return function () {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }

  function selection_dispatch(type, params) {
    return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
  }

  function selection_iterator() {
    var groups, j, m, group, i, n, node;
    return regeneratorRuntime.wrap(function selection_iterator$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            groups = this._groups, j = 0, m = groups.length;

          case 1:
            if (!(j < m)) {
              _context.next = 13;
              break;
            }

            group = groups[j], i = 0, n = group.length;

          case 3:
            if (!(i < n)) {
              _context.next = 10;
              break;
            }

            if (!(node = group[i])) {
              _context.next = 7;
              break;
            }

            _context.next = 7;
            return node;

          case 7:
            ++i;
            _context.next = 3;
            break;

          case 10:
            ++j;
            _context.next = 1;
            break;

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _marked, this);
  }

  var root = [null];

  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }

  function selection() {
    return new Selection([[document.documentElement]], root);
  }

  function selection_selection() {
    return this;
  }

  Selection.prototype = selection.prototype = _defineProperty2({
    constructor: Selection,
    select: selection_select,
    selectAll: selection_selectAll,
    selectChild: selection_selectChild,
    selectChildren: selection_selectChildren,
    filter: selection_filter,
    data: selection_data,
    enter: selection_enter,
    exit: selection_exit,
    join: selection_join,
    merge: selection_merge,
    selection: selection_selection,
    order: selection_order,
    sort: selection_sort,
    call: selection_call,
    nodes: selection_nodes,
    node: selection_node,
    size: selection_size,
    empty: selection_empty,
    each: selection_each,
    attr: selection_attr,
    style: selection_style,
    property: selection_property,
    classed: selection_classed,
    text: selection_text,
    html: selection_html,
    raise: selection_raise,
    lower: selection_lower,
    append: selection_append,
    insert: selection_insert,
    remove: selection_remove,
    clone: selection_clone,
    datum: selection_datum,
    on: selection_on,
    dispatch: selection_dispatch
  }, Symbol.iterator, selection_iterator);

  function _select(selector) {
    return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
  }
  /**
      @function rtl
      @desc Returns `true` if the HTML or body element has either the "dir" HTML attribute or the "direction" CSS property set to "rtl".
  */


  var detectRTL = function detectRTL() {
    return _select("html").attr("dir") === "rtl" || _select("body").attr("dir") === "rtl" || _select("html").style("direction") === "rtl" || _select("body").style("direction") === "rtl";
  };
  /**
      @function stringify
      @desc Coerces value into a String.
      @param {String} value
  */


  function stringify(value) {
    if (value === void 0) value = "undefined";else if (!(typeof value === "string" || value instanceof String)) value = JSON.stringify(value);
    return value;
  } // great unicode list: http://asecuritysite.com/coding/asc2


  var diacritics = [[/[\300-\305]/g, "A"], [/[\340-\345]/g, "a"], [/[\306]/g, "AE"], [/[\346]/g, "ae"], [/[\337]/g, "B"], [/[\307]/g, "C"], [/[\347]/g, "c"], [/[\320\336\376]/g, "D"], [/[\360]/g, "d"], [/[\310-\313]/g, "E"], [/[\350-\353]/g, "e"], [/[\314-\317]/g, "I"], [/[\354-\357]/g, "i"], [/[\321]/g, "N"], [/[\361]/g, "n"], [/[\u014c\322-\326\330]/g, "O"], [/[\u014d\362-\366\370]/g, "o"], [/[\u016a\331-\334]/g, "U"], [/[\u016b\371-\374]/g, "u"], [/[\327]/g, "x"], [/[\335]/g, "Y"], [/[\375\377]/g, "y"]];
  /**
      @function strip
      @desc Removes all non ASCII characters from a string.
      @param {String} value
  */

  function strip(value) {
    return "".concat(value).replace(/[^A-Za-z0-9\-_]/g, function (_char) {
      if (_char === " ") return "-";
      var ret = false;

      for (var d = 0; d < diacritics.length; d++) {
        if (new RegExp(diacritics[d][0]).test(_char)) {
          ret = diacritics[d][1];
          break;
        }
      }

      return ret || "";
    });
  }

  var noop = {
    value: function value() {}
  };

  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }

    return new Dispatch(_);
  }

  function Dispatch(_) {
    this._ = _;
  }

  function parseTypenames$1(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function (t) {
      var name = "",
          i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return {
        type: t,
        name: name
      };
    });
  }

  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function on(typename, callback) {
      var _ = this._,
          T = parseTypenames$1(typename + "", _),
          t,
          i = -1,
          n = T.length; // If no callback was specified, return the callback of the given type and name.

      if (arguments.length < 2) {
        while (++i < n) {
          if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        }

        return;
      } // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.


      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);

      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);else if (callback == null) for (t in _) {
          _[t] = set(_[t], typename.name, null);
        }
      }

      return this;
    },
    copy: function copy() {
      var copy = {},
          _ = this._;

      for (var t in _) {
        copy[t] = _[t].slice();
      }

      return new Dispatch(copy);
    },
    call: function call(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) {
        args[i] = arguments[i + 2];
      }
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);

      for (t = this._[type], i = 0, n = t.length; i < n; ++i) {
        t[i].value.apply(that, args);
      }
    },
    apply: function apply(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);

      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) {
        t[i].value.apply(that, args);
      }
    }
  };

  function get(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }

  function set(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }

    if (callback != null) type.push({
      name: name,
      value: callback
    });
    return type;
  }

  var frame = 0,
      // is an animation frame pending?
  timeout = 0,
      // is a timeout pending?
  interval = 0,
      // are any timers active?
  pokeDelay = 1000,
      // how frequently we check for clock skew
  taskHead,
      taskTail,
      clockLast = 0,
      clockNow = 0,
      clockSkew = 0,
      clock = (typeof performance === "undefined" ? "undefined" : _typeof2(performance)) === "object" && performance.now ? performance : Date,
      setFrame = (typeof window === "undefined" ? "undefined" : _typeof2(window)) === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function (f) {
    setTimeout(f, 17);
  };

  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }

  function clearNow() {
    clockNow = 0;
  }

  function Timer() {
    this._call = this._time = this._next = null;
  }

  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function restart(callback, delay, time) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);

      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;else taskHead = this;
        taskTail = this;
      }

      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function stop() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };

  function timer(callback, delay, time) {
    var t = new Timer();
    t.restart(callback, delay, time);
    return t;
  }

  function timerFlush() {
    now(); // Get the current time, if not already set.

    ++frame; // Pretend we’ve set an alarm, if we haven’t already.

    var t = taskHead,
        e;

    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
      t = t._next;
    }

    --frame;
  }

  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout = 0;

    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }

  function poke() {
    var now = clock.now(),
        delay = now - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
  }

  function nap() {
    var t0,
        t1 = taskHead,
        t2,
        time = Infinity;

    while (t1) {
      if (t1._call) {
        if (time > t1._time) time = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }

    taskTail = t0;
    sleep(time);
  }

  function sleep(time) {
    if (frame) return; // Soonest alarm already set, or will be.

    if (timeout) timeout = clearTimeout(timeout);
    var delay = time - clockNow; // Strictly less than if we recomputed clockNow.

    if (delay > 24) {
      if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  function timeout$1(callback, delay, time) {
    var t = new Timer();
    delay = delay == null ? 0 : +delay;
    t.restart(function (elapsed) {
      t.stop();
      callback(elapsed + delay);
    }, delay, time);
    return t;
  }

  var emptyOn = dispatch("start", "end", "cancel", "interrupt");
  var emptyTween = [];
  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;

  function schedule(node, name, id, index, group, timing) {
    var schedules = node.__transition;
    if (!schedules) node.__transition = {};else if (id in schedules) return;
    create(node, id, {
      name: name,
      index: index,
      // For context during callback.
      group: group,
      // For context during callback.
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }

  function init(node, id) {
    var schedule = get$1(node, id);
    if (schedule.state > CREATED) throw new Error("too late; already scheduled");
    return schedule;
  }

  function set$1(node, id) {
    var schedule = get$1(node, id);
    if (schedule.state > STARTED) throw new Error("too late; already running");
    return schedule;
  }

  function get$1(node, id) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
    return schedule;
  }

  function create(node, id, self) {
    var schedules = node.__transition,
        tween; // Initialize the self timer when the transition is created.
    // Note the actual delay is not known until the first callback!

    schedules[id] = self;
    self.timer = timer(schedule, 0, self.time);

    function schedule(elapsed) {
      self.state = SCHEDULED;
      self.timer.restart(start, self.delay, self.time); // If the elapsed delay is less than our first sleep, start immediately.

      if (self.delay <= elapsed) start(elapsed - self.delay);
    }

    function start(elapsed) {
      var i, j, n, o; // If the state is not SCHEDULED, then we previously errored on start.

      if (self.state !== SCHEDULED) return stop();

      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self.name) continue; // While this element already has a starting transition during this frame,
        // defer starting an interrupting transition until that transition has a
        // chance to tick (and possibly end); see d3/d3-transition#54!

        if (o.state === STARTED) return timeout$1(start); // Interrupt the active transition, if any.

        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        } // Cancel any pre-empted transitions.
        else if (+i < id) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("cancel", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }
      } // Defer the first tick to end of the current frame; see d3/d3#1576.
      // Note the transition may be canceled after start and before the first tick!
      // Note this must be scheduled before the start event; see d3/d3-transition#16!
      // Assuming this is successful, subsequent callbacks go straight to tick.


      timeout$1(function () {
        if (self.state === STARTED) {
          self.state = RUNNING;
          self.timer.restart(tick, self.delay, self.time);
          tick(elapsed);
        }
      }); // Dispatch the start event.
      // Note this must be done before the tween are initialized.

      self.state = STARTING;
      self.on.call("start", node, node.__data__, self.index, self.group);
      if (self.state !== STARTING) return; // interrupted

      self.state = STARTED; // Initialize the tween, deleting null tween.

      tween = new Array(n = self.tween.length);

      for (i = 0, j = -1; i < n; ++i) {
        if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
          tween[++j] = o;
        }
      }

      tween.length = j + 1;
    }

    function tick(elapsed) {
      var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
          i = -1,
          n = tween.length;

      while (++i < n) {
        tween[i].call(node, t);
      } // Dispatch the end event.


      if (self.state === ENDING) {
        self.on.call("end", node, node.__data__, self.index, self.group);
        stop();
      }
    }

    function stop() {
      self.state = ENDED;
      self.timer.stop();
      delete schedules[id];

      for (var i in schedules) {
        return;
      } // eslint-disable-line no-unused-vars


      delete node.__transition;
    }
  }

  function interrupt(node, name) {
    var schedules = node.__transition,
        schedule,
        active,
        empty = true,
        i;
    if (!schedules) return;
    name = name == null ? null : name + "";

    for (i in schedules) {
      if ((schedule = schedules[i]).name !== name) {
        empty = false;
        continue;
      }

      active = schedule.state > STARTING && schedule.state < ENDING;
      schedule.state = ENDED;
      schedule.timer.stop();
      schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
      delete schedules[i];
    }

    if (empty) delete node.__transition;
  }

  function selection_interrupt(name) {
    return this.each(function () {
      interrupt(this, name);
    });
  }

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);

    for (var key in definition) {
      prototype[key] = definition[key];
    }

    return prototype;
  }

  function Color() {}

  var _darker = 0.7;

  var _brighter = 1 / _darker;

  var reI = "\\s*([+-]?\\d+)\\s*",
      reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
      reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
      reHex = /^#([0-9a-f]{3,8})$/,
      reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
      reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
      reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
      reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
      reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
      reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");
  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };
  define(Color, color, {
    copy: function copy(channels) {
      return Object.assign(new this.constructor(), this, channels);
    },
    displayable: function displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });

  function color_formatHex() {
    return this.rgb().formatHex();
  }

  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }

  function color_formatRgb() {
    return this.rgb().formatRgb();
  }

  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
    : l === 3 ? new Rgb(m >> 8 & 0xf | m >> 4 & 0xf0, m >> 4 & 0xf | m & 0xf0, (m & 0xf) << 4 | m & 0xf, 1) // #f00
    : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
    : l === 4 ? rgba(m >> 12 & 0xf | m >> 8 & 0xf0, m >> 8 & 0xf | m >> 4 & 0xf0, m >> 4 & 0xf | m & 0xf0, ((m & 0xf) << 4 | m & 0xf) / 0xff) // #f000
    : null // invalid hex
    ) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
    : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
    : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
    : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
    : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
    : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
    : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
    : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
  }

  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb();
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Rgb, rgb, extend(Color, {
    brighter: function brighter(k) {
      k = k == null ? _brighter : Math.pow(_brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker: function darker(k) {
      k = k == null ? _darker : Math.pow(_darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb: function rgb() {
      return this;
    },
    displayable: function displayable() {
      return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
    },
    hex: rgb_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));

  function rgb_formatHex() {
    return "#" + hex(this.r) + hex(this.g) + hex(this.b);
  }

  function rgb_formatRgb() {
    var a = this.opacity;
    a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "rgb(" : "rgba(") + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", " + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", " + Math.max(0, Math.min(255, Math.round(this.b) || 0)) + (a === 1 ? ")" : ", " + a + ")");
  }

  function hex(value) {
    value = Math.max(0, Math.min(255, Math.round(value) || 0));
    return (value < 16 ? "0" : "") + value.toString(16);
  }

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;else if (l <= 0 || l >= 1) h = s = NaN;else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl();
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        h = NaN,
        s = max - min,
        l = (max + min) / 2;

    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;else if (g === max) h = (b - r) / s + 2;else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }

    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hsl, hsl, extend(Color, {
    brighter: function brighter(k) {
      k = k == null ? _brighter : Math.pow(_brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function darker(k) {
      k = k == null ? _darker : Math.pow(_darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function rgb() {
      var h = this.h % 360 + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
      return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
    },
    displayable: function displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
    },
    formatHsl: function formatHsl() {
      var a = this.opacity;
      a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "hsl(" : "hsla(") + (this.h || 0) + ", " + (this.s || 0) * 100 + "%, " + (this.l || 0) * 100 + "%" + (a === 1 ? ")" : ", " + a + ")");
    }
  }));
  /* From FvD 13.37, CSS Color Module Level 3 */

  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
  }

  var constant$1 = function constant$1(x) {
    return function () {
      return x;
    };
  };

  function linear(a, d) {
    return function (t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function (t) {
      return Math.pow(a + t * b, y);
    };
  }

  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function (a, b) {
      return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
    };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
  }

  var interpolateRgb = function rgbGamma(y) {
    var color = gamma(y);

    function rgb$1(start, end) {
      var r = color((start = rgb(start)).r, (end = rgb(end)).r),
          g = color(start.g, end.g),
          b = color(start.b, end.b),
          opacity = nogamma(start.opacity, end.opacity);
      return function (t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    rgb$1.gamma = rgbGamma;
    return rgb$1;
  }(1);

  function interpolateNumber(a, b) {
    return a = +a, b = +b, function (t) {
      return a * (1 - t) + b * t;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      reB = new RegExp(reA.source, "g");

  function zero(b) {
    return function () {
      return b;
    };
  }

  function one(b) {
    return function (t) {
      return b(t) + "";
    };
  }

  function interpolateString(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0,
        // scan index for next number in b
    am,
        // current match in a
    bm,
        // current match in b
    bs,
        // string preceding current number in b, if any
    i = -1,
        // index in s
    s = [],
        // string constants and placeholders
    q = []; // number interpolators
    // Coerce inputs to strings.

    a = a + "", b = b + ""; // Interpolate pairs of numbers in a & b.

    while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) {
        // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      if ((am = am[0]) === (bm = bm[0])) {
        // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else {
        // interpolate non-matching numbers
        s[++i] = null;
        q.push({
          i: i,
          x: interpolateNumber(am, bm)
        });
      }

      bi = reB.lastIndex;
    } // Add remains of b.


    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    } // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.


    return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function (t) {
      for (var i = 0, o; i < b; ++i) {
        s[(o = q[i]).i] = o.x(t);
      }

      return s.join("");
    });
  }

  var degrees = 180 / Math.PI;
  var identity = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };

  function decompose(a, b, c, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * degrees,
      skewX: Math.atan(skewX) * degrees,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }

  var svgNode;
  /* eslint-disable no-undef */

  function parseCss(value) {
    var m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
    return m.isIdentity ? identity : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
  }

  function parseSvg(value) {
    if (value == null) return identity;
    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
    value = value.matrix;
    return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  function interpolateTransform(parse, pxComma, pxParen, degParen) {
    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }

    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({
          i: i - 4,
          x: interpolateNumber(xa, xb)
        }, {
          i: i - 2,
          x: interpolateNumber(ya, yb)
        });
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }

    function rotate(a, b, s, q) {
      if (a !== b) {
        if (a - b > 180) b += 360;else if (b - a > 180) a += 360; // shortest path

        q.push({
          i: s.push(pop(s) + "rotate(", null, degParen) - 2,
          x: interpolateNumber(a, b)
        });
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }

    function skewX(a, b, s, q) {
      if (a !== b) {
        q.push({
          i: s.push(pop(s) + "skewX(", null, degParen) - 2,
          x: interpolateNumber(a, b)
        });
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }

    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({
          i: i - 4,
          x: interpolateNumber(xa, xb)
        }, {
          i: i - 2,
          x: interpolateNumber(ya, yb)
        });
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }

    return function (a, b) {
      var s = [],
          // string constants and placeholders
      q = []; // number interpolators

      a = parse(a), b = parse(b);
      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
      rotate(a.rotate, b.rotate, s, q);
      skewX(a.skewX, b.skewX, s, q);
      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
      a = b = null; // gc

      return function (t) {
        var i = -1,
            n = q.length,
            o;

        while (++i < n) {
          s[(o = q[i]).i] = o.x(t);
        }

        return s.join("");
      };
    };
  }

  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

  function tweenRemove(id, name) {
    var tween0, tween1;
    return function () {
      var schedule = set$1(this, id),
          tween = schedule.tween; // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.

      if (tween !== tween0) {
        tween1 = tween0 = tween;

        for (var i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }

      schedule.tween = tween1;
    };
  }

  function tweenFunction(id, name, value) {
    var tween0, tween1;
    if (typeof value !== "function") throw new Error();
    return function () {
      var schedule = set$1(this, id),
          tween = schedule.tween; // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.

      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();

        for (var t = {
          name: name,
          value: value
        }, i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t;
            break;
          }
        }

        if (i === n) tween1.push(t);
      }

      schedule.tween = tween1;
    };
  }

  function transition_tween(name, value) {
    var id = this._id;
    name += "";

    if (arguments.length < 2) {
      var tween = get$1(this.node(), id).tween;

      for (var i = 0, n = tween.length, t; i < n; ++i) {
        if ((t = tween[i]).name === name) {
          return t.value;
        }
      }

      return null;
    }

    return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
  }

  function tweenValue(transition, name, value) {
    var id = transition._id;
    transition.each(function () {
      var schedule = set$1(this, id);
      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    });
    return function (node) {
      return get$1(node, id).value[name];
    };
  }

  function interpolate(a, b) {
    var c;
    return (typeof b === "number" ? interpolateNumber : b instanceof color ? interpolateRgb : (c = color(b)) ? (b = c, interpolateRgb) : interpolateString)(a, b);
  }

  function attrRemove$1(name) {
    return function () {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS$1(fullname) {
    return function () {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant$1(name, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function () {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function attrConstantNS$1(fullname, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function () {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function attrFunction$1(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function () {
      var string0,
          value1 = value(this),
          string1;
      if (value1 == null) return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function attrFunctionNS$1(fullname, interpolate, value) {
    var string00, string10, interpolate0;
    return function () {
      var string0,
          value1 = value(this),
          string1;
      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function transition_attr(name, value) {
    var fullname = namespace(name),
        i = fullname === "transform" ? interpolateTransformSvg : interpolate;
    return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS$1 : attrRemove$1)(fullname) : (fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, i, value));
  }

  function attrInterpolate(name, i) {
    return function (t) {
      this.setAttribute(name, i.call(this, t));
    };
  }

  function attrInterpolateNS(fullname, i) {
    return function (t) {
      this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
    };
  }

  function attrTweenNS(fullname, value) {
    var t0, i0;

    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t0;
    }

    tween._value = value;
    return tween;
  }

  function attrTween(name, value) {
    var t0, i0;

    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
      return t0;
    }

    tween._value = value;
    return tween;
  }

  function transition_attrTween(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    var fullname = namespace(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  function delayFunction(id, value) {
    return function () {
      init(this, id).delay = +value.apply(this, arguments);
    };
  }

  function delayConstant(id, value) {
    return value = +value, function () {
      init(this, id).delay = value;
    };
  }

  function transition_delay(value) {
    var id = this._id;
    return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id, value)) : get$1(this.node(), id).delay;
  }

  function durationFunction(id, value) {
    return function () {
      set$1(this, id).duration = +value.apply(this, arguments);
    };
  }

  function durationConstant(id, value) {
    return value = +value, function () {
      set$1(this, id).duration = value;
    };
  }

  function transition_duration(value) {
    var id = this._id;
    return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id, value)) : get$1(this.node(), id).duration;
  }

  function easeConstant(id, value) {
    if (typeof value !== "function") throw new Error();
    return function () {
      set$1(this, id).ease = value;
    };
  }

  function transition_ease(value) {
    var id = this._id;
    return arguments.length ? this.each(easeConstant(id, value)) : get$1(this.node(), id).ease;
  }

  function easeVarying(id, value) {
    return function () {
      var v = value.apply(this, arguments);
      if (typeof v !== "function") throw new Error();
      set$1(this, id).ease = v;
    };
  }

  function transition_easeVarying(value) {
    if (typeof value !== "function") throw new Error();
    return this.each(easeVarying(this._id, value));
  }

  function transition_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  function transition_merge(transition) {
    if (transition._id !== this._id) throw new Error();

    for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Transition(merges, this._parents, this._name, this._id);
  }

  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function (t) {
      var i = t.indexOf(".");
      if (i >= 0) t = t.slice(0, i);
      return !t || t === "start";
    });
  }

  function onFunction(id, name, listener) {
    var on0,
        on1,
        sit = start(name) ? init : set$1;
    return function () {
      var schedule = sit(this, id),
          on = schedule.on; // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.

      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
      schedule.on = on1;
    };
  }

  function transition_on(name, listener) {
    var id = this._id;
    return arguments.length < 2 ? get$1(this.node(), id).on.on(name) : this.each(onFunction(id, name, listener));
  }

  function removeFunction(id) {
    return function () {
      var parent = this.parentNode;

      for (var i in this.__transition) {
        if (+i !== id) return;
      }

      if (parent) parent.removeChild(this);
    };
  }

  function transition_remove() {
    return this.on("end.remove", removeFunction(this._id));
  }

  function transition_select(select) {
    var name = this._name,
        id = this._id;
    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule(subgroup[i], name, id, i, subgroup, get$1(node, id));
        }
      }
    }

    return new Transition(subgroups, this._parents, name, id);
  }

  function transition_selectAll(select) {
    var name = this._name,
        id = this._id;
    if (typeof select !== "function") select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          for (var children = select.call(node, node.__data__, i, group), child, inherit = get$1(node, id), k = 0, l = children.length; k < l; ++k) {
            if (child = children[k]) {
              schedule(child, name, id, k, children, inherit);
            }
          }

          subgroups.push(children);
          parents.push(node);
        }
      }
    }

    return new Transition(subgroups, parents, name, id);
  }

  var Selection$1 = selection.prototype.constructor;

  function transition_selection() {
    return new Selection$1(this._groups, this._parents);
  }

  function styleNull(name, interpolate) {
    var string00, string10, interpolate0;
    return function () {
      var string0 = styleValue(this, name),
          string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
    };
  }

  function styleRemove$1(name) {
    return function () {
      this.style.removeProperty(name);
    };
  }

  function styleConstant$1(name, interpolate, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function () {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }

  function styleFunction$1(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function () {
      var string0 = styleValue(this, name),
          value1 = value(this),
          string1 = value1 + "";
      if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }

  function styleMaybeRemove(id, name) {
    var on0,
        on1,
        listener0,
        key = "style." + name,
        event = "end." + key,
        remove;
    return function () {
      var schedule = set$1(this, id),
          on = schedule.on,
          listener = schedule.value[key] == null ? remove || (remove = styleRemove$1(name)) : undefined; // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.

      if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
      schedule.on = on1;
    };
  }

  function transition_style(name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
    return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove$1(name)) : typeof value === "function" ? this.styleTween(name, styleFunction$1(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant$1(name, i, value), priority).on("end.style." + name, null);
  }

  function styleInterpolate(name, i, priority) {
    return function (t) {
      this.style.setProperty(name, i.call(this, t), priority);
    };
  }

  function styleTween(name, value, priority) {
    var t, i0;

    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
      return t;
    }

    tween._value = value;
    return tween;
  }

  function transition_styleTween(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  function textConstant$1(value) {
    return function () {
      this.textContent = value;
    };
  }

  function textFunction$1(value) {
    return function () {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }

  function transition_text(value) {
    return this.tween("text", typeof value === "function" ? textFunction$1(tweenValue(this, "text", value)) : textConstant$1(value == null ? "" : value + ""));
  }

  function textInterpolate(i) {
    return function (t) {
      this.textContent = i.call(this, t);
    };
  }

  function textTween(value) {
    var t0, i0;

    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
      return t0;
    }

    tween._value = value;
    return tween;
  }

  function transition_textTween(value) {
    var key = "text";
    if (arguments.length < 1) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    return this.tween(key, textTween(value));
  }

  function transition_transition() {
    var name = this._name,
        id0 = this._id,
        id1 = newId();

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          var inherit = get$1(node, id0);
          schedule(node, name, id1, i, group, {
            time: inherit.time + inherit.delay + inherit.duration,
            delay: 0,
            duration: inherit.duration,
            ease: inherit.ease
          });
        }
      }
    }

    return new Transition(groups, this._parents, name, id1);
  }

  function transition_end() {
    var on0,
        on1,
        that = this,
        id = that._id,
        size = that.size();
    return new Promise(function (resolve, reject) {
      var cancel = {
        value: reject
      },
          end = {
        value: function value() {
          if (--size === 0) resolve();
        }
      };
      that.each(function () {
        var schedule = set$1(this, id),
            on = schedule.on; // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.

        if (on !== on0) {
          on1 = (on0 = on).copy();

          on1._.cancel.push(cancel);

          on1._.interrupt.push(cancel);

          on1._.end.push(end);
        }

        schedule.on = on1;
      }); // The selection was empty, resolve end immediately

      if (size === 0) resolve();
    });
  }

  var id = 0;

  function Transition(groups, parents, name, id) {
    this._groups = groups;
    this._parents = parents;
    this._name = name;
    this._id = id;
  }

  function transition(name) {
    return selection().transition(name);
  }

  function newId() {
    return ++id;
  }

  var selection_prototype = selection.prototype;
  Transition.prototype = transition.prototype = _defineProperty2({
    constructor: Transition,
    select: transition_select,
    selectAll: transition_selectAll,
    filter: transition_filter,
    merge: transition_merge,
    selection: transition_selection,
    transition: transition_transition,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: transition_on,
    attr: transition_attr,
    attrTween: transition_attrTween,
    style: transition_style,
    styleTween: transition_styleTween,
    text: transition_text,
    textTween: transition_textTween,
    remove: transition_remove,
    tween: transition_tween,
    delay: transition_delay,
    duration: transition_duration,
    ease: transition_ease,
    easeVarying: transition_easeVarying,
    end: transition_end
  }, Symbol.iterator, selection_prototype[Symbol.iterator]);

  function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }

  var defaultTiming = {
    time: null,
    // Set on use.
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };

  function inherit(node, id) {
    var timing;

    while (!(timing = node.__transition) || !(timing = timing[id])) {
      if (!(node = node.parentNode)) {
        throw new Error("transition ".concat(id, " not found"));
      }
    }

    return timing;
  }

  function selection_transition(name) {
    var id, timing;

    if (name instanceof Transition) {
      id = name._id, name = name._name;
    } else {
      id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          schedule(node, name, id, i, group, timing || inherit(node, id));
        }
      }
    }

    return new Transition(groups, this._parents, name, id);
  }

  selection.prototype.interrupt = selection_interrupt;
  selection.prototype.transition = selection_transition;

  function max(values, valueof) {
    var max;

    if (valueof === undefined) {
      var _iterator2 = _createForOfIteratorHelper(values),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var value = _step2.value;

          if (value != null && (max < value || max === undefined && value >= value)) {
            max = value;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    } else {
      var index = -1;

      var _iterator3 = _createForOfIteratorHelper(values),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _value = _step3.value;

          if ((_value = valueof(_value, ++index, values)) != null && (max < _value || max === undefined && _value >= _value)) {
            max = _value;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }

    return max;
  }

  function min(values, valueof) {
    var min;

    if (valueof === undefined) {
      var _iterator4 = _createForOfIteratorHelper(values),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var value = _step4.value;

          if (value != null && (min > value || min === undefined && value >= value)) {
            min = value;
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    } else {
      var index = -1;

      var _iterator5 = _createForOfIteratorHelper(values),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _value2 = _step5.value;

          if ((_value2 = valueof(_value2, ++index, values)) != null && (min > _value2 || min === undefined && _value2 >= _value2)) {
            min = _value2;
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }

    return min;
  }

  function flatten(arrays) {
    var _iterator6, _step6, _array;

    return regeneratorRuntime.wrap(function flatten$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _iterator6 = _createForOfIteratorHelper(arrays);
            _context2.prev = 1;

            _iterator6.s();

          case 3:
            if ((_step6 = _iterator6.n()).done) {
              _context2.next = 8;
              break;
            }

            _array = _step6.value;
            return _context2.delegateYield(_array, "t0", 6);

          case 6:
            _context2.next = 3;
            break;

          case 8:
            _context2.next = 13;
            break;

          case 10:
            _context2.prev = 10;
            _context2.t1 = _context2["catch"](1);

            _iterator6.e(_context2.t1);

          case 13:
            _context2.prev = 13;

            _iterator6.f();

            return _context2.finish(13);

          case 16:
          case "end":
            return _context2.stop();
        }
      }
    }, _marked2, null, [[1, 10, 13, 16]]);
  }

  function merge(arrays) {
    return Array.from(flatten(arrays));
  }

  function sum(values, valueof) {
    var sum = 0;

    if (valueof === undefined) {
      var _iterator7 = _createForOfIteratorHelper(values),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var value = _step7.value;

          if (value = +value) {
            sum += value;
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    } else {
      var index = -1;

      var _iterator8 = _createForOfIteratorHelper(values),
          _step8;

      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var _value3 = _step8.value;

          if (_value3 = +valueof(_value3, ++index, values)) {
            sum += _value3;
          }
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
    }

    return sum;
  }
  /**
      @function accessor
      @desc Wraps an object key in a simple accessor function.
      @param {String} key The key to be returned from each Object passed to the function.
      @param {*} [def] A default value to be returned if the key is not present.
      @example <caption>this</caption>
  accessor("id");
      @example <caption>returns this</caption>
  function(d) {
    return d["id"];
  }
  */


  function accessor(key, def) {
    if (def === void 0) return function (d) {
      return d[key];
    };
    return function (d) {
      return d[key] === void 0 ? def : d[key];
    };
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }
  /**
      @function isObject
      @desc Detects if a variable is a javascript Object.
      @param {*} item
  */


  function isObject(item) {
    return item && _typeof(item) === "object" && (typeof window === "undefined" || item !== window && item !== window.document && !(item instanceof Element)) && !Array.isArray(item) ? true : false;
  }
  /**
      @function validObject
      @desc Determines if the object passed is the document or window.
      @param {Object} obj
      @private
  */


  function validObject(obj) {
    if (typeof window === "undefined") return true;else return obj !== window && obj !== document;
  }
  /**
      @function assign
      @desc A deeply recursive version of `Object.assign`.
      @param {...Object} objects
      @example <caption>this</caption>
  assign({id: "foo", deep: {group: "A"}}, {id: "bar", deep: {value: 20}}));
      @example <caption>returns this</caption>
  {id: "bar", deep: {group: "A", value: 20}}
  */


  function assign() {
    var _arguments = arguments;
    var target = arguments.length <= 0 ? undefined : arguments[0];

    var _loop = function _loop(i) {
      var source = i < 0 || _arguments.length <= i ? undefined : _arguments[i];
      Object.keys(source).forEach(function (prop) {
        var value = source[prop];

        if (isObject(value) && validObject(value)) {
          if (target.hasOwnProperty(prop) && isObject(target[prop])) target[prop] = assign({}, target[prop], value);else target[prop] = assign({}, value);
        } else if (Array.isArray(value)) target[prop] = value.slice();else target[prop] = value;
      });
    };

    for (var i = 1; i < arguments.length; i++) {
      _loop(i);
    }

    return target;
  }

  var aa = {
    language: "Afar",
    location: null,
    id: 4096,
    tag: "aa",
    version: "Release 10"
  };
  var af = {
    language: "Afrikaans",
    location: null,
    id: 54,
    tag: "af",
    version: "Release 7"
  };
  var agq = {
    language: "Aghem",
    location: null,
    id: 4096,
    tag: "agq",
    version: "Release 10"
  };
  var ak = {
    language: "Akan",
    location: null,
    id: 4096,
    tag: "ak",
    version: "Release 10"
  };
  var sq = {
    language: "Albanian",
    location: null,
    id: 28,
    tag: "sq",
    version: "Release 7"
  };
  var gsw = {
    language: "Alsatian",
    location: null,
    id: 132,
    tag: "gsw",
    version: "Release 7"
  };
  var am = {
    language: "Amharic",
    location: null,
    id: 94,
    tag: "am",
    version: "Release 7"
  };
  var ar = {
    language: "Arabic",
    location: null,
    id: 1,
    tag: "ar",
    version: "Release 7"
  };
  var hy = {
    language: "Armenian",
    location: null,
    id: 43,
    tag: "hy",
    version: "Release 7"
  };
  var as = {
    language: "Assamese",
    location: null,
    id: 77,
    tag: "as",
    version: "Release 7"
  };
  var ast = {
    language: "Asturian",
    location: null,
    id: 4096,
    tag: "ast",
    version: "Release 10"
  };
  var asa = {
    language: "Asu",
    location: null,
    id: 4096,
    tag: "asa",
    version: "Release 10"
  };
  var az = {
    language: "Azerbaijani (Latin)",
    location: null,
    id: 44,
    tag: "az",
    version: "Release 7"
  };
  var ksf = {
    language: "Bafia",
    location: null,
    id: 4096,
    tag: "ksf",
    version: "Release 10"
  };
  var bm = {
    language: "Bamanankan",
    location: null,
    id: 4096,
    tag: "bm",
    version: "Release 10"
  };
  var bn = {
    language: "Bangla",
    location: null,
    id: 69,
    tag: "bn",
    version: "Release 7"
  };
  var bas = {
    language: "Basaa",
    location: null,
    id: 4096,
    tag: "bas",
    version: "Release 10"
  };
  var ba = {
    language: "Bashkir",
    location: null,
    id: 109,
    tag: "ba",
    version: "Release 7"
  };
  var eu = {
    language: "Basque",
    location: null,
    id: 45,
    tag: "eu",
    version: "Release 7"
  };
  var be = {
    language: "Belarusian",
    location: null,
    id: 35,
    tag: "be",
    version: "Release 7"
  };
  var bem = {
    language: "Bemba",
    location: null,
    id: 4096,
    tag: "bem",
    version: "Release 10"
  };
  var bez = {
    language: "Bena",
    location: null,
    id: 4096,
    tag: "bez",
    version: "Release 10"
  };
  var byn = {
    language: "Blin",
    location: null,
    id: 4096,
    tag: "byn",
    version: "Release 10"
  };
  var brx = {
    language: "Bodo",
    location: null,
    id: 4096,
    tag: "brx",
    version: "Release 10"
  };
  var bs = {
    language: "Bosnian (Latin)",
    location: null,
    id: 30746,
    tag: "bs",
    version: "Release 7"
  };
  var br = {
    language: "Breton",
    location: null,
    id: 126,
    tag: "br",
    version: "Release 7"
  };
  var bg = {
    language: "Bulgarian",
    location: null,
    id: 2,
    tag: "bg",
    version: "Release 7"
  };
  var my = {
    language: "Burmese",
    location: null,
    id: 85,
    tag: "my",
    version: "Release 8.1"
  };
  var ca = {
    language: "Catalan",
    location: null,
    id: 3,
    tag: "ca",
    version: "Release 7"
  };
  var ceb = {
    language: "Cebuano",
    location: null,
    id: 4096,
    tag: "ceb",
    version: "Release 10.5"
  };
  var ku = {
    language: "Central Kurdish",
    location: null,
    id: 146,
    tag: "ku",
    version: "Release 8"
  };
  var ccp = {
    language: "Chakma",
    location: null,
    id: 4096,
    tag: "ccp",
    version: "Release 10.5"
  };
  var chr = {
    language: "Cherokee",
    location: null,
    id: 92,
    tag: "chr",
    version: "Release 8"
  };
  var cgg = {
    language: "Chiga",
    location: null,
    id: 4096,
    tag: "cgg",
    version: "Release 10"
  };
  var zh = {
    language: "Chinese (Simplified)",
    location: null,
    id: 30724,
    tag: "zh",
    version: "Windows 7"
  };
  var swc = {
    language: "Congo Swahili",
    location: null,
    id: 4096,
    tag: "swc",
    version: "Release 10"
  };
  var kw = {
    language: "Cornish",
    location: null,
    id: 4096,
    tag: "kw",
    version: "Release 10"
  };
  var co = {
    language: "Corsican",
    location: null,
    id: 131,
    tag: "co",
    version: "Release 7"
  };
  var cs = {
    language: "Czech",
    location: null,
    id: 5,
    tag: "cs",
    version: "Release 7"
  };
  var da = {
    language: "Danish",
    location: null,
    id: 6,
    tag: "da",
    version: "Release 7"
  };
  var prs = {
    language: "Dari",
    location: null,
    id: 140,
    tag: "prs",
    version: "Release 7"
  };
  var dv = {
    language: "Divehi",
    location: null,
    id: 101,
    tag: "dv",
    version: "Release 7"
  };
  var dua = {
    language: "Duala",
    location: null,
    id: 4096,
    tag: "dua",
    version: "Release 10"
  };
  var nl = {
    language: "Dutch",
    location: null,
    id: 19,
    tag: "nl",
    version: "Release 7"
  };
  var dz = {
    language: "Dzongkha",
    location: null,
    id: 4096,
    tag: "dz",
    version: "Release 10"
  };
  var ebu = {
    language: "Embu",
    location: null,
    id: 4096,
    tag: "ebu",
    version: "Release 10"
  };
  var en = {
    language: "English",
    location: null,
    id: 9,
    tag: "en",
    version: "Release 7"
  };
  var eo = {
    language: "Esperanto",
    location: null,
    id: 4096,
    tag: "eo",
    version: "Release 10"
  };
  var et = {
    language: "Estonian",
    location: null,
    id: 37,
    tag: "et",
    version: "Release 7"
  };
  var ee = {
    language: "Ewe",
    location: null,
    id: 4096,
    tag: "ee",
    version: "Release 10"
  };
  var ewo = {
    language: "Ewondo",
    location: null,
    id: 4096,
    tag: "ewo",
    version: "Release 10"
  };
  var fo = {
    language: "Faroese",
    location: null,
    id: 56,
    tag: "fo",
    version: "Release 7"
  };
  var fil = {
    language: "Filipino",
    location: null,
    id: 100,
    tag: "fil",
    version: "Release 7"
  };
  var fi = {
    language: "Finnish",
    location: null,
    id: 11,
    tag: "fi",
    version: "Release 7"
  };
  var fr = {
    language: "French",
    location: null,
    id: 12,
    tag: "fr",
    version: "Release 7"
  };
  var fy = {
    language: "Frisian",
    location: null,
    id: 98,
    tag: "fy",
    version: "Release 7"
  };
  var fur = {
    language: "Friulian",
    location: null,
    id: 4096,
    tag: "fur",
    version: "Release 10"
  };
  var ff = {
    language: "Fulah",
    location: null,
    id: 103,
    tag: "ff",
    version: "Release 8"
  };
  var gl = {
    language: "Galician",
    location: null,
    id: 86,
    tag: "gl",
    version: "Release 7"
  };
  var lg = {
    language: "Ganda",
    location: null,
    id: 4096,
    tag: "lg",
    version: "Release 10"
  };
  var ka = {
    language: "Georgian",
    location: null,
    id: 55,
    tag: "ka",
    version: "Release 7"
  };
  var de = {
    language: "German",
    location: null,
    id: 7,
    tag: "de",
    version: "Release 7"
  };
  var el = {
    language: "Greek",
    location: null,
    id: 8,
    tag: "el",
    version: "Release 7"
  };
  var kl = {
    language: "Greenlandic",
    location: null,
    id: 111,
    tag: "kl",
    version: "Release 7"
  };
  var gn = {
    language: "Guarani",
    location: null,
    id: 116,
    tag: "gn",
    version: "Release 8.1"
  };
  var gu = {
    language: "Gujarati",
    location: null,
    id: 71,
    tag: "gu",
    version: "Release 7"
  };
  var guz = {
    language: "Gusii",
    location: null,
    id: 4096,
    tag: "guz",
    version: "Release 10"
  };
  var ha = {
    language: "Hausa (Latin)",
    location: null,
    id: 104,
    tag: "ha",
    version: "Release 7"
  };
  var haw = {
    language: "Hawaiian",
    location: null,
    id: 117,
    tag: "haw",
    version: "Release 8"
  };
  var he = {
    language: "Hebrew",
    location: null,
    id: 13,
    tag: "he",
    version: "Release 7"
  };
  var hi = {
    language: "Hindi",
    location: null,
    id: 57,
    tag: "hi",
    version: "Release 7"
  };
  var hu = {
    language: "Hungarian",
    location: null,
    id: 14,
    tag: "hu",
    version: "Release 7"
  };
  var is = {
    language: "Icelandic",
    location: null,
    id: 15,
    tag: "is",
    version: "Release 7"
  };
  var ig = {
    language: "Igbo",
    location: null,
    id: 112,
    tag: "ig",
    version: "Release 7"
  };
  var id$1 = {
    language: "Indonesian",
    location: null,
    id: 33,
    tag: "id",
    version: "Release 7"
  };
  var ia = {
    language: "Interlingua",
    location: null,
    id: 4096,
    tag: "ia",
    version: "Release 10"
  };
  var iu = {
    language: "Inuktitut (Latin)",
    location: null,
    id: 93,
    tag: "iu",
    version: "Release 7"
  };
  var ga = {
    language: "Irish",
    location: null,
    id: 60,
    tag: "ga",
    version: "Windows 7"
  };
  var it = {
    language: "Italian",
    location: null,
    id: 16,
    tag: "it",
    version: "Release 7"
  };
  var ja = {
    language: "Japanese",
    location: null,
    id: 17,
    tag: "ja",
    version: "Release 7"
  };
  var jv = {
    language: "Javanese",
    location: null,
    id: 4096,
    tag: "jv",
    version: "Release 8.1"
  };
  var dyo = {
    language: "Jola-Fonyi",
    location: null,
    id: 4096,
    tag: "dyo",
    version: "Release 10"
  };
  var kea = {
    language: "Kabuverdianu",
    location: null,
    id: 4096,
    tag: "kea",
    version: "Release 10"
  };
  var kab = {
    language: "Kabyle",
    location: null,
    id: 4096,
    tag: "kab",
    version: "Release 10"
  };
  var kkj = {
    language: "Kako",
    location: null,
    id: 4096,
    tag: "kkj",
    version: "Release 10"
  };
  var kln = {
    language: "Kalenjin",
    location: null,
    id: 4096,
    tag: "kln",
    version: "Release 10"
  };
  var kam = {
    language: "Kamba",
    location: null,
    id: 4096,
    tag: "kam",
    version: "Release 10"
  };
  var kn = {
    language: "Kannada",
    location: null,
    id: 75,
    tag: "kn",
    version: "Release 7"
  };
  var ks = {
    language: "Kashmiri",
    location: null,
    id: 96,
    tag: "ks",
    version: "Release 10"
  };
  var kk = {
    language: "Kazakh",
    location: null,
    id: 63,
    tag: "kk",
    version: "Release 7"
  };
  var km = {
    language: "Khmer",
    location: null,
    id: 83,
    tag: "km",
    version: "Release 7"
  };
  var quc = {
    language: "K'iche",
    location: null,
    id: 134,
    tag: "quc",
    version: "Release 10"
  };
  var ki = {
    language: "Kikuyu",
    location: null,
    id: 4096,
    tag: "ki",
    version: "Release 10"
  };
  var rw = {
    language: "Kinyarwanda",
    location: null,
    id: 135,
    tag: "rw",
    version: "Release 7"
  };
  var sw = {
    language: "Kiswahili",
    location: null,
    id: 65,
    tag: "sw",
    version: "Release 7"
  };
  var kok = {
    language: "Konkani",
    location: null,
    id: 87,
    tag: "kok",
    version: "Release 7"
  };
  var ko = {
    language: "Korean",
    location: null,
    id: 18,
    tag: "ko",
    version: "Release 7"
  };
  var khq = {
    language: "Koyra Chiini",
    location: null,
    id: 4096,
    tag: "khq",
    version: "Release 10"
  };
  var ses = {
    language: "Koyraboro Senni",
    location: null,
    id: 4096,
    tag: "ses",
    version: "Release 10"
  };
  var nmg = {
    language: "Kwasio",
    location: null,
    id: 4096,
    tag: "nmg",
    version: "Release 10"
  };
  var ky = {
    language: "Kyrgyz",
    location: null,
    id: 64,
    tag: "ky",
    version: "Release 7"
  };
  var lkt = {
    language: "Lakota",
    location: null,
    id: 4096,
    tag: "lkt",
    version: "Release 10"
  };
  var lag = {
    language: "Langi",
    location: null,
    id: 4096,
    tag: "lag",
    version: "Release 10"
  };
  var lo = {
    language: "Lao",
    location: null,
    id: 84,
    tag: "lo",
    version: "Release 7"
  };
  var lv = {
    language: "Latvian",
    location: null,
    id: 38,
    tag: "lv",
    version: "Release 7"
  };
  var ln = {
    language: "Lingala",
    location: null,
    id: 4096,
    tag: "ln",
    version: "Release 10"
  };
  var lt = {
    language: "Lithuanian",
    location: null,
    id: 39,
    tag: "lt",
    version: "Release 7"
  };
  var nds = {
    language: "Low German",
    location: null,
    id: 4096,
    tag: "nds",
    version: "Release 10.2"
  };
  var dsb = {
    language: "Lower Sorbian",
    location: null,
    id: 31790,
    tag: "dsb",
    version: "Windows 7"
  };
  var lu = {
    language: "Luba-Katanga",
    location: null,
    id: 4096,
    tag: "lu",
    version: "Release 10"
  };
  var luo = {
    language: "Luo",
    location: null,
    id: 4096,
    tag: "luo",
    version: "Release 10"
  };
  var lb = {
    language: "Luxembourgish",
    location: null,
    id: 110,
    tag: "lb",
    version: "Release 7"
  };
  var luy = {
    language: "Luyia",
    location: null,
    id: 4096,
    tag: "luy",
    version: "Release 10"
  };
  var mk = {
    language: "Macedonian",
    location: null,
    id: 47,
    tag: "mk",
    version: "Release 7"
  };
  var jmc = {
    language: "Machame",
    location: null,
    id: 4096,
    tag: "jmc",
    version: "Release 10"
  };
  var mgh = {
    language: "Makhuwa-Meetto",
    location: null,
    id: 4096,
    tag: "mgh",
    version: "Release 10"
  };
  var kde = {
    language: "Makonde",
    location: null,
    id: 4096,
    tag: "kde",
    version: "Release 10"
  };
  var mg = {
    language: "Malagasy",
    location: null,
    id: 4096,
    tag: "mg",
    version: "Release 8.1"
  };
  var ms = {
    language: "Malay",
    location: null,
    id: 62,
    tag: "ms",
    version: "Release 7"
  };
  var ml = {
    language: "Malayalam",
    location: null,
    id: 76,
    tag: "ml",
    version: "Release 7"
  };
  var mt = {
    language: "Maltese",
    location: null,
    id: 58,
    tag: "mt",
    version: "Release 7"
  };
  var gv = {
    language: "Manx",
    location: null,
    id: 4096,
    tag: "gv",
    version: "Release 10"
  };
  var mi = {
    language: "Maori",
    location: null,
    id: 129,
    tag: "mi",
    version: "Release 7"
  };
  var arn = {
    language: "Mapudungun",
    location: null,
    id: 122,
    tag: "arn",
    version: "Release 7"
  };
  var mr = {
    language: "Marathi",
    location: null,
    id: 78,
    tag: "mr",
    version: "Release 7"
  };
  var mas = {
    language: "Masai",
    location: null,
    id: 4096,
    tag: "mas",
    version: "Release 10"
  };
  var mer = {
    language: "Meru",
    location: null,
    id: 4096,
    tag: "mer",
    version: "Release 10"
  };
  var mgo = {
    language: "Meta'",
    location: null,
    id: 4096,
    tag: "mgo",
    version: "Release 10"
  };
  var moh = {
    language: "Mohawk",
    location: null,
    id: 124,
    tag: "moh",
    version: "Release 7"
  };
  var mn = {
    language: "Mongolian (Cyrillic)",
    location: null,
    id: 80,
    tag: "mn",
    version: "Release 7"
  };
  var mfe = {
    language: "Morisyen",
    location: null,
    id: 4096,
    tag: "mfe",
    version: "Release 10"
  };
  var mua = {
    language: "Mundang",
    location: null,
    id: 4096,
    tag: "mua",
    version: "Release 10"
  };
  var nqo = {
    language: "N'ko",
    location: null,
    id: 4096,
    tag: "nqo",
    version: "Release 8.1"
  };
  var naq = {
    language: "Nama",
    location: null,
    id: 4096,
    tag: "naq",
    version: "Release 10"
  };
  var ne = {
    language: "Nepali",
    location: null,
    id: 97,
    tag: "ne",
    version: "Release 7"
  };
  var nnh = {
    language: "Ngiemboon",
    location: null,
    id: 4096,
    tag: "nnh",
    version: "Release 10"
  };
  var jgo = {
    language: "Ngomba",
    location: null,
    id: 4096,
    tag: "jgo",
    version: "Release 10"
  };
  var nd = {
    language: "North Ndebele",
    location: null,
    id: 4096,
    tag: "nd",
    version: "Release 10"
  };
  var no = {
    language: "Norwegian (Bokmal)",
    location: null,
    id: 20,
    tag: "no",
    version: "Release 7"
  };
  var nb = {
    language: "Norwegian (Bokmal)",
    location: null,
    id: 31764,
    tag: "nb",
    version: "Release 7"
  };
  var nn = {
    language: "Norwegian (Nynorsk)",
    location: null,
    id: 30740,
    tag: "nn",
    version: "Release 7"
  };
  var nus = {
    language: "Nuer",
    location: null,
    id: 4096,
    tag: "nus",
    version: "Release 10"
  };
  var nyn = {
    language: "Nyankole",
    location: null,
    id: 4096,
    tag: "nyn",
    version: "Release 10"
  };
  var oc = {
    language: "Occitan",
    location: null,
    id: 130,
    tag: "oc",
    version: "Release 7"
  };
  var or = {
    language: "Odia",
    location: null,
    id: 72,
    tag: "or",
    version: "Release 7"
  };
  var om = {
    language: "Oromo",
    location: null,
    id: 114,
    tag: "om",
    version: "Release 8.1"
  };
  var os = {
    language: "Ossetian",
    location: null,
    id: 4096,
    tag: "os",
    version: "Release 10"
  };
  var ps = {
    language: "Pashto",
    location: null,
    id: 99,
    tag: "ps",
    version: "Release 7"
  };
  var fa = {
    language: "Persian",
    location: null,
    id: 41,
    tag: "fa",
    version: "Release 7"
  };
  var pl = {
    language: "Polish",
    location: null,
    id: 21,
    tag: "pl",
    version: "Release 7"
  };
  var pt = {
    language: "Portuguese",
    location: null,
    id: 22,
    tag: "pt",
    version: "Release 7"
  };
  var pa = {
    language: "Punjabi",
    location: null,
    id: 70,
    tag: "pa",
    version: "Release 7"
  };
  var quz = {
    language: "Quechua",
    location: null,
    id: 107,
    tag: "quz",
    version: "Release 7"
  };
  var ksh = {
    language: "Ripuarian",
    location: null,
    id: 4096,
    tag: "ksh",
    version: "Release 10"
  };
  var ro = {
    language: "Romanian",
    location: null,
    id: 24,
    tag: "ro",
    version: "Release 7"
  };
  var rm = {
    language: "Romansh",
    location: null,
    id: 23,
    tag: "rm",
    version: "Release 7"
  };
  var rof = {
    language: "Rombo",
    location: null,
    id: 4096,
    tag: "rof",
    version: "Release 10"
  };
  var rn = {
    language: "Rundi",
    location: null,
    id: 4096,
    tag: "rn",
    version: "Release 10"
  };
  var ru = {
    language: "Russian",
    location: null,
    id: 25,
    tag: "ru",
    version: "Release 7"
  };
  var rwk = {
    language: "Rwa",
    location: null,
    id: 4096,
    tag: "rwk",
    version: "Release 10"
  };
  var ssy = {
    language: "Saho",
    location: null,
    id: 4096,
    tag: "ssy",
    version: "Release 10"
  };
  var sah = {
    language: "Sakha",
    location: null,
    id: 133,
    tag: "sah",
    version: "Release 7"
  };
  var saq = {
    language: "Samburu",
    location: null,
    id: 4096,
    tag: "saq",
    version: "Release 10"
  };
  var smn = {
    language: "Sami (Inari)",
    location: null,
    id: 28731,
    tag: "smn",
    version: "Windows 7"
  };
  var smj = {
    language: "Sami (Lule)",
    location: null,
    id: 31803,
    tag: "smj",
    version: "Windows 7"
  };
  var se = {
    language: "Sami (Northern)",
    location: null,
    id: 59,
    tag: "se",
    version: "Release 7"
  };
  var sms = {
    language: "Sami (Skolt)",
    location: null,
    id: 29755,
    tag: "sms",
    version: "Windows 7"
  };
  var sma = {
    language: "Sami (Southern)",
    location: null,
    id: 30779,
    tag: "sma",
    version: "Windows 7"
  };
  var sg = {
    language: "Sango",
    location: null,
    id: 4096,
    tag: "sg",
    version: "Release 10"
  };
  var sbp = {
    language: "Sangu",
    location: null,
    id: 4096,
    tag: "sbp",
    version: "Release 10"
  };
  var sa = {
    language: "Sanskrit",
    location: null,
    id: 79,
    tag: "sa",
    version: "Release 7"
  };
  var gd = {
    language: "Scottish Gaelic",
    location: null,
    id: 145,
    tag: "gd",
    version: "Windows 7"
  };
  var seh = {
    language: "Sena",
    location: null,
    id: 4096,
    tag: "seh",
    version: "Release 10"
  };
  var sr = {
    language: "Serbian (Latin)",
    location: null,
    id: 31770,
    tag: "sr",
    version: "Release 7"
  };
  var nso = {
    language: "Sesotho sa Leboa",
    location: null,
    id: 108,
    tag: "nso",
    version: "Release 7"
  };
  var tn = {
    language: "Setswana",
    location: null,
    id: 50,
    tag: "tn",
    version: "Release 7"
  };
  var ksb = {
    language: "Shambala",
    location: null,
    id: 4096,
    tag: "ksb",
    version: "Release 10"
  };
  var sn = {
    language: "Shona",
    location: null,
    id: 4096,
    tag: "sn",
    version: "Release 8.1"
  };
  var sd = {
    language: "Sindhi",
    location: null,
    id: 89,
    tag: "sd",
    version: "Release 8"
  };
  var si = {
    language: "Sinhala",
    location: null,
    id: 91,
    tag: "si",
    version: "Release 7"
  };
  var sk = {
    language: "Slovak",
    location: null,
    id: 27,
    tag: "sk",
    version: "Release 7"
  };
  var sl = {
    language: "Slovenian",
    location: null,
    id: 36,
    tag: "sl",
    version: "Release 7"
  };
  var xog = {
    language: "Soga",
    location: null,
    id: 4096,
    tag: "xog",
    version: "Release 10"
  };
  var so = {
    language: "Somali",
    location: null,
    id: 119,
    tag: "so",
    version: "Release 8.1"
  };
  var st = {
    language: "Sotho",
    location: null,
    id: 48,
    tag: "st",
    version: "Release 8.1"
  };
  var nr = {
    language: "South Ndebele",
    location: null,
    id: 4096,
    tag: "nr",
    version: "Release 10"
  };
  var es = {
    language: "Spanish",
    location: null,
    id: 10,
    tag: "es",
    version: "Release 7"
  };
  var zgh = {
    language: "Standard Moroccan Tamazight",
    location: null,
    id: 4096,
    tag: "zgh",
    version: "Release 8.1"
  };
  var ss = {
    language: "Swati",
    location: null,
    id: 4096,
    tag: "ss",
    version: "Release 10"
  };
  var sv = {
    language: "Swedish",
    location: null,
    id: 29,
    tag: "sv",
    version: "Release 7"
  };
  var syr = {
    language: "Syriac",
    location: null,
    id: 90,
    tag: "syr",
    version: "Release 7"
  };
  var shi = {
    language: "Tachelhit",
    location: null,
    id: 4096,
    tag: "shi",
    version: "Release 10"
  };
  var dav = {
    language: "Taita",
    location: null,
    id: 4096,
    tag: "dav",
    version: "Release 10"
  };
  var tg = {
    language: "Tajik (Cyrillic)",
    location: null,
    id: 40,
    tag: "tg",
    version: "Release 7"
  };
  var tzm = {
    language: "Tamazight (Latin)",
    location: null,
    id: 95,
    tag: "tzm",
    version: "Release 7"
  };
  var ta = {
    language: "Tamil",
    location: null,
    id: 73,
    tag: "ta",
    version: "Release 7"
  };
  var twq = {
    language: "Tasawaq",
    location: null,
    id: 4096,
    tag: "twq",
    version: "Release 10"
  };
  var tt = {
    language: "Tatar",
    location: null,
    id: 68,
    tag: "tt",
    version: "Release 7"
  };
  var te = {
    language: "Telugu",
    location: null,
    id: 74,
    tag: "te",
    version: "Release 7"
  };
  var teo = {
    language: "Teso",
    location: null,
    id: 4096,
    tag: "teo",
    version: "Release 10"
  };
  var th = {
    language: "Thai",
    location: null,
    id: 30,
    tag: "th",
    version: "Release 7"
  };
  var bo = {
    language: "Tibetan",
    location: null,
    id: 81,
    tag: "bo",
    version: "Release 7"
  };
  var tig = {
    language: "Tigre",
    location: null,
    id: 4096,
    tag: "tig",
    version: "Release 10"
  };
  var ti = {
    language: "Tigrinya",
    location: null,
    id: 115,
    tag: "ti",
    version: "Release 8"
  };
  var to = {
    language: "Tongan",
    location: null,
    id: 4096,
    tag: "to",
    version: "Release 10"
  };
  var ts = {
    language: "Tsonga",
    location: null,
    id: 49,
    tag: "ts",
    version: "Release 8.1"
  };
  var tr = {
    language: "Turkish",
    location: null,
    id: 31,
    tag: "tr",
    version: "Release 7"
  };
  var tk = {
    language: "Turkmen",
    location: null,
    id: 66,
    tag: "tk",
    version: "Release 7"
  };
  var uk = {
    language: "Ukrainian",
    location: null,
    id: 34,
    tag: "uk",
    version: "Release 7"
  };
  var hsb = {
    language: "Upper Sorbian",
    location: null,
    id: 46,
    tag: "hsb",
    version: "Release 7"
  };
  var ur = {
    language: "Urdu",
    location: null,
    id: 32,
    tag: "ur",
    version: "Release 7"
  };
  var ug = {
    language: "Uyghur",
    location: null,
    id: 128,
    tag: "ug",
    version: "Release 7"
  };
  var uz = {
    language: "Uzbek (Latin)",
    location: null,
    id: 67,
    tag: "uz",
    version: "Release 7"
  };
  var vai = {
    language: "Vai",
    location: null,
    id: 4096,
    tag: "vai",
    version: "Release 10"
  };
  var ve = {
    language: "Venda",
    location: null,
    id: 51,
    tag: "ve",
    version: "Release 10"
  };
  var vi = {
    language: "Vietnamese",
    location: null,
    id: 42,
    tag: "vi",
    version: "Release 7"
  };
  var vo = {
    language: "Volapük",
    location: null,
    id: 4096,
    tag: "vo",
    version: "Release 10"
  };
  var vun = {
    language: "Vunjo",
    location: null,
    id: 4096,
    tag: "vun",
    version: "Release 10"
  };
  var wae = {
    language: "Walser",
    location: null,
    id: 4096,
    tag: "wae",
    version: "Release 10"
  };
  var cy = {
    language: "Welsh",
    location: null,
    id: 82,
    tag: "cy",
    version: "Release 7"
  };
  var wal = {
    language: "Wolaytta",
    location: null,
    id: 4096,
    tag: "wal",
    version: "Release 10"
  };
  var wo = {
    language: "Wolof",
    location: null,
    id: 136,
    tag: "wo",
    version: "Release 7"
  };
  var xh = {
    language: "Xhosa",
    location: null,
    id: 52,
    tag: "xh",
    version: "Release 7"
  };
  var yav = {
    language: "Yangben",
    location: null,
    id: 4096,
    tag: "yav",
    version: "Release 10"
  };
  var ii = {
    language: "Yi",
    location: null,
    id: 120,
    tag: "ii",
    version: "Release 7"
  };
  var yo = {
    language: "Yoruba",
    location: null,
    id: 106,
    tag: "yo",
    version: "Release 7"
  };
  var dje = {
    language: "Zarma",
    location: null,
    id: 4096,
    tag: "dje",
    version: "Release 10"
  };
  var zu = {
    language: "Zulu",
    location: null,
    id: 53,
    tag: "zu",
    version: "Release 7"
  };
  var lcid = {
    aa: aa,
    "aa-dj": {
      language: "Afar",
      location: "Djibouti",
      id: 4096,
      tag: "aa-DJ",
      version: "Release 10"
    },
    "aa-er": {
      language: "Afar",
      location: "Eritrea",
      id: 4096,
      tag: "aa-ER",
      version: "Release 10"
    },
    "aa-et": {
      language: "Afar",
      location: "Ethiopia",
      id: 4096,
      tag: "aa-ET",
      version: "Release 10"
    },
    af: af,
    "af-na": {
      language: "Afrikaans",
      location: "Namibia",
      id: 4096,
      tag: "af-NA",
      version: "Release 10"
    },
    "af-za": {
      language: "Afrikaans",
      location: "South Africa",
      id: 1078,
      tag: "af-ZA",
      version: "Release B"
    },
    agq: agq,
    "agq-cm": {
      language: "Aghem",
      location: "Cameroon",
      id: 4096,
      tag: "agq-CM",
      version: "Release 10"
    },
    ak: ak,
    "ak-gh": {
      language: "Akan",
      location: "Ghana",
      id: 4096,
      tag: "ak-GH",
      version: "Release 10"
    },
    sq: sq,
    "sq-al": {
      language: "Albanian",
      location: "Albania",
      id: 1052,
      tag: "sq-AL",
      version: "Release B"
    },
    "sq-mk": {
      language: "Albanian",
      location: "North Macedonia",
      id: 4096,
      tag: "sq-MK",
      version: "Release 10"
    },
    gsw: gsw,
    "gsw-fr": {
      language: "Alsatian",
      location: "France",
      id: 1156,
      tag: "gsw-FR",
      version: "Release V"
    },
    "gsw-li": {
      language: "Alsatian",
      location: "Liechtenstein",
      id: 4096,
      tag: "gsw-LI",
      version: "Release 10"
    },
    "gsw-ch": {
      language: "Alsatian",
      location: "Switzerland",
      id: 4096,
      tag: "gsw-CH",
      version: "Release 10"
    },
    am: am,
    "am-et": {
      language: "Amharic",
      location: "Ethiopia",
      id: 1118,
      tag: "am-ET",
      version: "Release V"
    },
    ar: ar,
    "ar-dz": {
      language: "Arabic",
      location: "Algeria",
      id: 5121,
      tag: "ar-DZ",
      version: "Release B"
    },
    "ar-bh": {
      language: "Arabic",
      location: "Bahrain",
      id: 15361,
      tag: "ar-BH",
      version: "Release B"
    },
    "ar-td": {
      language: "Arabic",
      location: "Chad",
      id: 4096,
      tag: "ar-TD",
      version: "Release 10"
    },
    "ar-km": {
      language: "Arabic",
      location: "Comoros",
      id: 4096,
      tag: "ar-KM",
      version: "Release 10"
    },
    "ar-dj": {
      language: "Arabic",
      location: "Djibouti",
      id: 4096,
      tag: "ar-DJ",
      version: "Release 10"
    },
    "ar-eg": {
      language: "Arabic",
      location: "Egypt",
      id: 3073,
      tag: "ar-EG",
      version: "Release B"
    },
    "ar-er": {
      language: "Arabic",
      location: "Eritrea",
      id: 4096,
      tag: "ar-ER",
      version: "Release 10"
    },
    "ar-iq": {
      language: "Arabic",
      location: "Iraq",
      id: 2049,
      tag: "ar-IQ",
      version: "Release B"
    },
    "ar-il": {
      language: "Arabic",
      location: "Israel",
      id: 4096,
      tag: "ar-IL",
      version: "Release 10"
    },
    "ar-jo": {
      language: "Arabic",
      location: "Jordan",
      id: 11265,
      tag: "ar-JO",
      version: "Release B"
    },
    "ar-kw": {
      language: "Arabic",
      location: "Kuwait",
      id: 13313,
      tag: "ar-KW",
      version: "Release B"
    },
    "ar-lb": {
      language: "Arabic",
      location: "Lebanon",
      id: 12289,
      tag: "ar-LB",
      version: "Release B"
    },
    "ar-ly": {
      language: "Arabic",
      location: "Libya",
      id: 4097,
      tag: "ar-LY",
      version: "Release B"
    },
    "ar-mr": {
      language: "Arabic",
      location: "Mauritania",
      id: 4096,
      tag: "ar-MR",
      version: "Release 10"
    },
    "ar-ma": {
      language: "Arabic",
      location: "Morocco",
      id: 6145,
      tag: "ar-MA",
      version: "Release B"
    },
    "ar-om": {
      language: "Arabic",
      location: "Oman",
      id: 8193,
      tag: "ar-OM",
      version: "Release B"
    },
    "ar-ps": {
      language: "Arabic",
      location: "Palestinian Authority",
      id: 4096,
      tag: "ar-PS",
      version: "Release 10"
    },
    "ar-qa": {
      language: "Arabic",
      location: "Qatar",
      id: 16385,
      tag: "ar-QA",
      version: "Release B"
    },
    "ar-sa": {
      language: "Arabic",
      location: "Saudi Arabia",
      id: 1025,
      tag: "ar-SA",
      version: "Release B"
    },
    "ar-so": {
      language: "Arabic",
      location: "Somalia",
      id: 4096,
      tag: "ar-SO",
      version: "Release 10"
    },
    "ar-ss": {
      language: "Arabic",
      location: "South Sudan",
      id: 4096,
      tag: "ar-SS",
      version: "Release 10"
    },
    "ar-sd": {
      language: "Arabic",
      location: "Sudan",
      id: 4096,
      tag: "ar-SD",
      version: "Release 10"
    },
    "ar-sy": {
      language: "Arabic",
      location: "Syria",
      id: 10241,
      tag: "ar-SY",
      version: "Release B"
    },
    "ar-tn": {
      language: "Arabic",
      location: "Tunisia",
      id: 7169,
      tag: "ar-TN",
      version: "Release B"
    },
    "ar-ae": {
      language: "Arabic",
      location: "U.A.E.",
      id: 14337,
      tag: "ar-AE",
      version: "Release B"
    },
    "ar-001": {
      language: "Arabic",
      location: "World",
      id: 4096,
      tag: "ar-001",
      version: "Release 10"
    },
    "ar-ye": {
      language: "Arabic",
      location: "Yemen",
      id: 9217,
      tag: "ar-YE",
      version: "Release B"
    },
    hy: hy,
    "hy-am": {
      language: "Armenian",
      location: "Armenia",
      id: 1067,
      tag: "hy-AM",
      version: "Release C"
    },
    as: as,
    "as-in": {
      language: "Assamese",
      location: "India",
      id: 1101,
      tag: "as-IN",
      version: "Release V"
    },
    ast: ast,
    "ast-es": {
      language: "Asturian",
      location: "Spain",
      id: 4096,
      tag: "ast-ES",
      version: "Release 10"
    },
    asa: asa,
    "asa-tz": {
      language: "Asu",
      location: "Tanzania",
      id: 4096,
      tag: "asa-TZ",
      version: "Release 10"
    },
    "az-cyrl": {
      language: "Azerbaijani (Cyrillic)",
      location: null,
      id: 29740,
      tag: "az-Cyrl",
      version: "Windows 7"
    },
    "az-cyrl-az": {
      language: "Azerbaijani (Cyrillic)",
      location: "Azerbaijan",
      id: 2092,
      tag: "az-Cyrl-AZ",
      version: "Release C"
    },
    az: az,
    "az-latn": {
      language: "Azerbaijani (Latin)",
      location: null,
      id: 30764,
      tag: "az-Latn",
      version: "Windows 7"
    },
    "az-latn-az": {
      language: "Azerbaijani (Latin)",
      location: "Azerbaijan",
      id: 1068,
      tag: "az-Latn-AZ",
      version: "Release C"
    },
    ksf: ksf,
    "ksf-cm": {
      language: "Bafia",
      location: "Cameroon",
      id: 4096,
      tag: "ksf-CM",
      version: "Release 10"
    },
    bm: bm,
    "bm-latn-ml": {
      language: "Bamanankan (Latin)",
      location: "Mali",
      id: 4096,
      tag: "bm-Latn-ML",
      version: "Release 10"
    },
    bn: bn,
    "bn-bd": {
      language: "Bangla",
      location: "Bangladesh",
      id: 2117,
      tag: "bn-BD",
      version: "Release V"
    },
    "bn-in": {
      language: "Bangla",
      location: "India",
      id: 1093,
      tag: "bn-IN",
      version: "Release E1"
    },
    bas: bas,
    "bas-cm": {
      language: "Basaa",
      location: "Cameroon",
      id: 4096,
      tag: "bas-CM",
      version: "Release 10"
    },
    ba: ba,
    "ba-ru": {
      language: "Bashkir",
      location: "Russia",
      id: 1133,
      tag: "ba-RU",
      version: "Release V"
    },
    eu: eu,
    "eu-es": {
      language: "Basque",
      location: "Spain",
      id: 1069,
      tag: "eu-ES",
      version: "Release B"
    },
    be: be,
    "be-by": {
      language: "Belarusian",
      location: "Belarus",
      id: 1059,
      tag: "be-BY",
      version: "Release B"
    },
    bem: bem,
    "bem-zm": {
      language: "Bemba",
      location: "Zambia",
      id: 4096,
      tag: "bem-ZM",
      version: "Release 10"
    },
    bez: bez,
    "bez-tz": {
      language: "Bena",
      location: "Tanzania",
      id: 4096,
      tag: "bez-TZ",
      version: "Release 10"
    },
    byn: byn,
    "byn-er": {
      language: "Blin",
      location: "Eritrea",
      id: 4096,
      tag: "byn-ER",
      version: "Release 10"
    },
    brx: brx,
    "brx-in": {
      language: "Bodo",
      location: "India",
      id: 4096,
      tag: "brx-IN",
      version: "Release 10"
    },
    "bs-cyrl": {
      language: "Bosnian (Cyrillic)",
      location: null,
      id: 25626,
      tag: "bs-Cyrl",
      version: "Windows 7"
    },
    "bs-cyrl-ba": {
      language: "Bosnian (Cyrillic)",
      location: "Bosnia and Herzegovina",
      id: 8218,
      tag: "bs-Cyrl-BA",
      version: "Release E1"
    },
    "bs-latn": {
      language: "Bosnian (Latin)",
      location: null,
      id: 26650,
      tag: "bs-Latn",
      version: "Windows 7"
    },
    bs: bs,
    "bs-latn-ba": {
      language: "Bosnian (Latin)",
      location: "Bosnia and Herzegovina",
      id: 5146,
      tag: "bs-Latn-BA",
      version: "Release E1"
    },
    br: br,
    "br-fr": {
      language: "Breton",
      location: "France",
      id: 1150,
      tag: "br-FR",
      version: "Release V"
    },
    bg: bg,
    "bg-bg": {
      language: "Bulgarian",
      location: "Bulgaria",
      id: 1026,
      tag: "bg-BG",
      version: "Release B"
    },
    my: my,
    "my-mm": {
      language: "Burmese",
      location: "Myanmar",
      id: 1109,
      tag: "my-MM",
      version: "Release 8.1"
    },
    ca: ca,
    "ca-ad": {
      language: "Catalan",
      location: "Andorra",
      id: 4096,
      tag: "ca-AD",
      version: "Release 10"
    },
    "ca-fr": {
      language: "Catalan",
      location: "France",
      id: 4096,
      tag: "ca-FR",
      version: "Release 10"
    },
    "ca-it": {
      language: "Catalan",
      location: "Italy",
      id: 4096,
      tag: "ca-IT",
      version: "Release 10"
    },
    "ca-es": {
      language: "Catalan",
      location: "Spain",
      id: 1027,
      tag: "ca-ES",
      version: "Release B"
    },
    ceb: ceb,
    "ceb-latn": {
      language: "Cebuan (Latin)",
      location: null,
      id: 4096,
      tag: "ceb-Latn",
      version: "Release 10.5"
    },
    "ceb-latn-ph": {
      language: "Cebuan (Latin)",
      location: "Philippines",
      id: 4096,
      tag: "ceb-Latn-PH",
      version: "Release 10.5"
    },
    "tzm-latn-": {
      language: "Central Atlas Tamazight (Latin)",
      location: "Morocco",
      id: 4096,
      tag: "tzm-Latn-",
      version: "Release 10"
    },
    ku: ku,
    "ku-arab": {
      language: "Central Kurdish",
      location: null,
      id: 31890,
      tag: "ku-Arab",
      version: "Release 8"
    },
    "ku-arab-iq": {
      language: "Central Kurdish",
      location: "Iraq",
      id: 1170,
      tag: "ku-Arab-IQ",
      version: "Release 8"
    },
    ccp: ccp,
    "ccp-cakm": {
      language: "Chakma",
      location: "Chakma",
      id: 4096,
      tag: "ccp-Cakm",
      version: "Release 10.5"
    },
    "ccp-cakm-": {
      language: "Chakma",
      location: "India",
      id: 4096,
      tag: "ccp-Cakm-",
      version: "Release 10.5"
    },
    "cd-ru": {
      language: "Chechen",
      location: "Russia",
      id: 4096,
      tag: "cd-RU",
      version: "Release 10.1"
    },
    chr: chr,
    "chr-cher": {
      language: "Cherokee",
      location: null,
      id: 31836,
      tag: "chr-Cher",
      version: "Release 8"
    },
    "chr-cher-us": {
      language: "Cherokee",
      location: "United States",
      id: 1116,
      tag: "chr-Cher-US",
      version: "Release 8"
    },
    cgg: cgg,
    "cgg-ug": {
      language: "Chiga",
      location: "Uganda",
      id: 4096,
      tag: "cgg-UG",
      version: "Release 10"
    },
    "zh-hans": {
      language: "Chinese (Simplified)",
      location: null,
      id: 4,
      tag: "zh-Hans",
      version: "Release A"
    },
    zh: zh,
    "zh-cn": {
      language: "Chinese (Simplified)",
      location: "People's Republic of China",
      id: 2052,
      tag: "zh-CN",
      version: "Release A"
    },
    "zh-sg": {
      language: "Chinese (Simplified)",
      location: "Singapore",
      id: 4100,
      tag: "zh-SG",
      version: "Release A"
    },
    "zh-hant": {
      language: "Chinese (Traditional)",
      location: null,
      id: 31748,
      tag: "zh-Hant",
      version: "Release A"
    },
    "zh-hk": {
      language: "Chinese (Traditional)",
      location: "Hong Kong S.A.R.",
      id: 3076,
      tag: "zh-HK",
      version: "Release A"
    },
    "zh-mo": {
      language: "Chinese (Traditional)",
      location: "Macao S.A.R.",
      id: 5124,
      tag: "zh-MO",
      version: "Release D"
    },
    "zh-tw": {
      language: "Chinese (Traditional)",
      location: "Taiwan",
      id: 1028,
      tag: "zh-TW",
      version: "Release A"
    },
    "cu-ru": {
      language: "Church Slavic",
      location: "Russia",
      id: 4096,
      tag: "cu-RU",
      version: "Release 10.1"
    },
    swc: swc,
    "swc-cd": {
      language: "Congo Swahili",
      location: "Congo DRC",
      id: 4096,
      tag: "swc-CD",
      version: "Release 10"
    },
    kw: kw,
    "kw-gb": {
      language: "Cornish",
      location: "United Kingdom",
      id: 4096,
      tag: "kw-GB",
      version: "Release 10"
    },
    co: co,
    "co-fr": {
      language: "Corsican",
      location: "France",
      id: 1155,
      tag: "co-FR",
      version: "Release V"
    },
    "hr,": {
      language: "Croatian",
      location: null,
      id: 26,
      tag: "hr,",
      version: "Release 7"
    },
    "hr-hr": {
      language: "Croatian",
      location: "Croatia",
      id: 1050,
      tag: "hr-HR",
      version: "Release A"
    },
    "hr-ba": {
      language: "Croatian (Latin)",
      location: "Bosnia and Herzegovina",
      id: 4122,
      tag: "hr-BA",
      version: "Release E1"
    },
    cs: cs,
    "cs-cz": {
      language: "Czech",
      location: "Czech Republic",
      id: 1029,
      tag: "cs-CZ",
      version: "Release A"
    },
    da: da,
    "da-dk": {
      language: "Danish",
      location: "Denmark",
      id: 1030,
      tag: "da-DK",
      version: "Release A"
    },
    "da-gl": {
      language: "Danish",
      location: "Greenland",
      id: 4096,
      tag: "da-GL",
      version: "Release 10"
    },
    prs: prs,
    "prs-af": {
      language: "Dari",
      location: "Afghanistan",
      id: 1164,
      tag: "prs-AF",
      version: "Release V"
    },
    dv: dv,
    "dv-mv": {
      language: "Divehi",
      location: "Maldives",
      id: 1125,
      tag: "dv-MV",
      version: "Release D"
    },
    dua: dua,
    "dua-cm": {
      language: "Duala",
      location: "Cameroon",
      id: 4096,
      tag: "dua-CM",
      version: "Release 10"
    },
    nl: nl,
    "nl-aw": {
      language: "Dutch",
      location: "Aruba",
      id: 4096,
      tag: "nl-AW",
      version: "Release 10"
    },
    "nl-be": {
      language: "Dutch",
      location: "Belgium",
      id: 2067,
      tag: "nl-BE",
      version: "Release A"
    },
    "nl-bq": {
      language: "Dutch",
      location: "Bonaire, Sint Eustatius and Saba",
      id: 4096,
      tag: "nl-BQ",
      version: "Release 10"
    },
    "nl-cw": {
      language: "Dutch",
      location: "Curaçao",
      id: 4096,
      tag: "nl-CW",
      version: "Release 10"
    },
    "nl-nl": {
      language: "Dutch",
      location: "Netherlands",
      id: 1043,
      tag: "nl-NL",
      version: "Release A"
    },
    "nl-sx": {
      language: "Dutch",
      location: "Sint Maarten",
      id: 4096,
      tag: "nl-SX",
      version: "Release 10"
    },
    "nl-sr": {
      language: "Dutch",
      location: "Suriname",
      id: 4096,
      tag: "nl-SR",
      version: "Release 10"
    },
    dz: dz,
    "dz-bt": {
      language: "Dzongkha",
      location: "Bhutan",
      id: 3153,
      tag: "dz-BT",
      version: "Release 10"
    },
    ebu: ebu,
    "ebu-ke": {
      language: "Embu",
      location: "Kenya",
      id: 4096,
      tag: "ebu-KE",
      version: "Release 10"
    },
    en: en,
    "en-as": {
      language: "English",
      location: "American Samoa",
      id: 4096,
      tag: "en-AS",
      version: "Release 10"
    },
    "en-ai": {
      language: "English",
      location: "Anguilla",
      id: 4096,
      tag: "en-AI",
      version: "Release 10"
    },
    "en-ag": {
      language: "English",
      location: "Antigua and Barbuda",
      id: 4096,
      tag: "en-AG",
      version: "Release 10"
    },
    "en-au": {
      language: "English",
      location: "Australia",
      id: 3081,
      tag: "en-AU",
      version: "Release A"
    },
    "en-at": {
      language: "English",
      location: "Austria",
      id: 4096,
      tag: "en-AT",
      version: "Release 10.1"
    },
    "en-bs": {
      language: "English",
      location: "Bahamas",
      id: 4096,
      tag: "en-BS",
      version: "Release 10"
    },
    "en-bb": {
      language: "English",
      location: "Barbados",
      id: 4096,
      tag: "en-BB",
      version: "Release 10"
    },
    "en-be": {
      language: "English",
      location: "Belgium",
      id: 4096,
      tag: "en-BE",
      version: "Release 10"
    },
    "en-bz": {
      language: "English",
      location: "Belize",
      id: 10249,
      tag: "en-BZ",
      version: "Release B"
    },
    "en-bm": {
      language: "English",
      location: "Bermuda",
      id: 4096,
      tag: "en-BM",
      version: "Release 10"
    },
    "en-bw": {
      language: "English",
      location: "Botswana",
      id: 4096,
      tag: "en-BW",
      version: "Release 10"
    },
    "en-io": {
      language: "English",
      location: "British Indian Ocean Territory",
      id: 4096,
      tag: "en-IO",
      version: "Release 10"
    },
    "en-vg": {
      language: "English",
      location: "British Virgin Islands",
      id: 4096,
      tag: "en-VG",
      version: "Release 10"
    },
    "en-bi": {
      language: "English",
      location: "Burundi",
      id: 4096,
      tag: "en-BI",
      version: "Release 10.1"
    },
    "en-cm": {
      language: "English",
      location: "Cameroon",
      id: 4096,
      tag: "en-CM",
      version: "Release 10"
    },
    "en-ca": {
      language: "English",
      location: "Canada",
      id: 4105,
      tag: "en-CA",
      version: "Release A"
    },
    "en-029": {
      language: "English",
      location: "Caribbean",
      id: 9225,
      tag: "en-029",
      version: "Release B"
    },
    "en-ky": {
      language: "English",
      location: "Cayman Islands",
      id: 4096,
      tag: "en-KY",
      version: "Release 10"
    },
    "en-cx": {
      language: "English",
      location: "Christmas Island",
      id: 4096,
      tag: "en-CX",
      version: "Release 10"
    },
    "en-cc": {
      language: "English",
      location: "Cocos [Keeling] Islands",
      id: 4096,
      tag: "en-CC",
      version: "Release 10"
    },
    "en-ck": {
      language: "English",
      location: "Cook Islands",
      id: 4096,
      tag: "en-CK",
      version: "Release 10"
    },
    "en-cy": {
      language: "English",
      location: "Cyprus",
      id: 4096,
      tag: "en-CY",
      version: "Release 10.1"
    },
    "en-dk": {
      language: "English",
      location: "Denmark",
      id: 4096,
      tag: "en-DK",
      version: "Release 10.1"
    },
    "en-dm": {
      language: "English",
      location: "Dominica",
      id: 4096,
      tag: "en-DM",
      version: "Release 10"
    },
    "en-er": {
      language: "English",
      location: "Eritrea",
      id: 4096,
      tag: "en-ER",
      version: "Release 10"
    },
    "en-150": {
      language: "English",
      location: "Europe",
      id: 4096,
      tag: "en-150",
      version: "Release 10"
    },
    "en-fk": {
      language: "English",
      location: "Falkland Islands",
      id: 4096,
      tag: "en-FK",
      version: "Release 10"
    },
    "en-fi": {
      language: "English",
      location: "Finland",
      id: 4096,
      tag: "en-FI",
      version: "Release 10.1"
    },
    "en-fj": {
      language: "English",
      location: "Fiji",
      id: 4096,
      tag: "en-FJ",
      version: "Release 10"
    },
    "en-gm": {
      language: "English",
      location: "Gambia",
      id: 4096,
      tag: "en-GM",
      version: "Release 10"
    },
    "en-de": {
      language: "English",
      location: "Germany",
      id: 4096,
      tag: "en-DE",
      version: "Release 10.1"
    },
    "en-gh": {
      language: "English",
      location: "Ghana",
      id: 4096,
      tag: "en-GH",
      version: "Release 10"
    },
    "en-gi": {
      language: "English",
      location: "Gibraltar",
      id: 4096,
      tag: "en-GI",
      version: "Release 10"
    },
    "en-gd": {
      language: "English",
      location: "Grenada",
      id: 4096,
      tag: "en-GD",
      version: "Release 10"
    },
    "en-gu": {
      language: "English",
      location: "Guam",
      id: 4096,
      tag: "en-GU",
      version: "Release 10"
    },
    "en-gg": {
      language: "English",
      location: "Guernsey",
      id: 4096,
      tag: "en-GG",
      version: "Release 10"
    },
    "en-gy": {
      language: "English",
      location: "Guyana",
      id: 4096,
      tag: "en-GY",
      version: "Release 10"
    },
    "en-hk": {
      language: "English",
      location: "Hong Kong",
      id: 15369,
      tag: "en-HK",
      version: "Release 8.1"
    },
    "en-in": {
      language: "English",
      location: "India",
      id: 16393,
      tag: "en-IN",
      version: "Release V"
    },
    "en-ie": {
      language: "English",
      location: "Ireland",
      id: 6153,
      tag: "en-IE",
      version: "Release A"
    },
    "en-im": {
      language: "English",
      location: "Isle of Man",
      id: 4096,
      tag: "en-IM",
      version: "Release 10"
    },
    "en-il": {
      language: "English",
      location: "Israel",
      id: 4096,
      tag: "en-IL",
      version: "Release 10.1"
    },
    "en-jm": {
      language: "English",
      location: "Jamaica",
      id: 8201,
      tag: "en-JM",
      version: "Release B"
    },
    "en-je": {
      language: "English",
      location: "Jersey",
      id: 4096,
      tag: "en-JE",
      version: "Release 10"
    },
    "en-ke": {
      language: "English",
      location: "Kenya",
      id: 4096,
      tag: "en-KE",
      version: "Release 10"
    },
    "en-ki": {
      language: "English",
      location: "Kiribati",
      id: 4096,
      tag: "en-KI",
      version: "Release 10"
    },
    "en-ls": {
      language: "English",
      location: "Lesotho",
      id: 4096,
      tag: "en-LS",
      version: "Release 10"
    },
    "en-lr": {
      language: "English",
      location: "Liberia",
      id: 4096,
      tag: "en-LR",
      version: "Release 10"
    },
    "en-mo": {
      language: "English",
      location: "Macao SAR",
      id: 4096,
      tag: "en-MO",
      version: "Release 10"
    },
    "en-mg": {
      language: "English",
      location: "Madagascar",
      id: 4096,
      tag: "en-MG",
      version: "Release 10"
    },
    "en-mw": {
      language: "English",
      location: "Malawi",
      id: 4096,
      tag: "en-MW",
      version: "Release 10"
    },
    "en-my": {
      language: "English",
      location: "Malaysia",
      id: 17417,
      tag: "en-MY",
      version: "Release V"
    },
    "en-mt": {
      language: "English",
      location: "Malta",
      id: 4096,
      tag: "en-MT",
      version: "Release 10"
    },
    "en-mh": {
      language: "English",
      location: "Marshall Islands",
      id: 4096,
      tag: "en-MH",
      version: "Release 10"
    },
    "en-mu": {
      language: "English",
      location: "Mauritius",
      id: 4096,
      tag: "en-MU",
      version: "Release 10"
    },
    "en-fm": {
      language: "English",
      location: "Micronesia",
      id: 4096,
      tag: "en-FM",
      version: "Release 10"
    },
    "en-ms": {
      language: "English",
      location: "Montserrat",
      id: 4096,
      tag: "en-MS",
      version: "Release 10"
    },
    "en-na": {
      language: "English",
      location: "Namibia",
      id: 4096,
      tag: "en-NA",
      version: "Release 10"
    },
    "en-nr": {
      language: "English",
      location: "Nauru",
      id: 4096,
      tag: "en-NR",
      version: "Release 10"
    },
    "en-nl": {
      language: "English",
      location: "Netherlands",
      id: 4096,
      tag: "en-NL",
      version: "Release 10.1"
    },
    "en-nz": {
      language: "English",
      location: "New Zealand",
      id: 5129,
      tag: "en-NZ",
      version: "Release A"
    },
    "en-ng": {
      language: "English",
      location: "Nigeria",
      id: 4096,
      tag: "en-NG",
      version: "Release 10"
    },
    "en-nu": {
      language: "English",
      location: "Niue",
      id: 4096,
      tag: "en-NU",
      version: "Release 10"
    },
    "en-nf": {
      language: "English",
      location: "Norfolk Island",
      id: 4096,
      tag: "en-NF",
      version: "Release 10"
    },
    "en-mp": {
      language: "English",
      location: "Northern Mariana Islands",
      id: 4096,
      tag: "en-MP",
      version: "Release 10"
    },
    "en-pk": {
      language: "English",
      location: "Pakistan",
      id: 4096,
      tag: "en-PK",
      version: "Release 10"
    },
    "en-pw": {
      language: "English",
      location: "Palau",
      id: 4096,
      tag: "en-PW",
      version: "Release 10"
    },
    "en-pg": {
      language: "English",
      location: "Papua New Guinea",
      id: 4096,
      tag: "en-PG",
      version: "Release 10"
    },
    "en-pn": {
      language: "English",
      location: "Pitcairn Islands",
      id: 4096,
      tag: "en-PN",
      version: "Release 10"
    },
    "en-pr": {
      language: "English",
      location: "Puerto Rico",
      id: 4096,
      tag: "en-PR",
      version: "Release 10"
    },
    "en-ph": {
      language: "English",
      location: "Republic of the Philippines",
      id: 13321,
      tag: "en-PH",
      version: "Release C"
    },
    "en-rw": {
      language: "English",
      location: "Rwanda",
      id: 4096,
      tag: "en-RW",
      version: "Release 10"
    },
    "en-kn": {
      language: "English",
      location: "Saint Kitts and Nevis",
      id: 4096,
      tag: "en-KN",
      version: "Release 10"
    },
    "en-lc": {
      language: "English",
      location: "Saint Lucia",
      id: 4096,
      tag: "en-LC",
      version: "Release 10"
    },
    "en-vc": {
      language: "English",
      location: "Saint Vincent and the Grenadines",
      id: 4096,
      tag: "en-VC",
      version: "Release 10"
    },
    "en-ws": {
      language: "English",
      location: "Samoa",
      id: 4096,
      tag: "en-WS",
      version: "Release 10"
    },
    "en-sc": {
      language: "English",
      location: "Seychelles",
      id: 4096,
      tag: "en-SC",
      version: "Release 10"
    },
    "en-sl": {
      language: "English",
      location: "Sierra Leone",
      id: 4096,
      tag: "en-SL",
      version: "Release 10"
    },
    "en-sg": {
      language: "English",
      location: "Singapore",
      id: 18441,
      tag: "en-SG",
      version: "Release V"
    },
    "en-sx": {
      language: "English",
      location: "Sint Maarten",
      id: 4096,
      tag: "en-SX",
      version: "Release 10"
    },
    "en-si": {
      language: "English",
      location: "Slovenia",
      id: 4096,
      tag: "en-SI",
      version: "Release 10.1"
    },
    "en-sb": {
      language: "English",
      location: "Solomon Islands",
      id: 4096,
      tag: "en-SB",
      version: "Release 10"
    },
    "en-za": {
      language: "English",
      location: "South Africa",
      id: 7177,
      tag: "en-ZA",
      version: "Release B"
    },
    "en-ss": {
      language: "English",
      location: "South Sudan",
      id: 4096,
      tag: "en-SS",
      version: "Release 10"
    },
    "en-sh": {
      language: "English",
      location: "St Helena, Ascension,  Tristan da Cunha",
      id: 4096,
      tag: "en-SH",
      version: "Release 10"
    },
    "en-sd": {
      language: "English",
      location: "Sudan",
      id: 4096,
      tag: "en-SD",
      version: "Release 10"
    },
    "en-sz": {
      language: "English",
      location: "Swaziland",
      id: 4096,
      tag: "en-SZ",
      version: "Release 10"
    },
    "en-se": {
      language: "English",
      location: "Sweden",
      id: 4096,
      tag: "en-SE",
      version: "Release 10.1"
    },
    "en-ch": {
      language: "English",
      location: "Switzerland",
      id: 4096,
      tag: "en-CH",
      version: "Release 10.1"
    },
    "en-tz": {
      language: "English",
      location: "Tanzania",
      id: 4096,
      tag: "en-TZ",
      version: "Release 10"
    },
    "en-tk": {
      language: "English",
      location: "Tokelau",
      id: 4096,
      tag: "en-TK",
      version: "Release 10"
    },
    "en-to": {
      language: "English",
      location: "Tonga",
      id: 4096,
      tag: "en-TO",
      version: "Release 10"
    },
    "en-tt": {
      language: "English",
      location: "Trinidad and Tobago",
      id: 11273,
      tag: "en-TT",
      version: "Release B"
    },
    "en-tc": {
      language: "English",
      location: "Turks and Caicos Islands",
      id: 4096,
      tag: "en-TC",
      version: "Release 10"
    },
    "en-tv": {
      language: "English",
      location: "Tuvalu",
      id: 4096,
      tag: "en-TV",
      version: "Release 10"
    },
    "en-ug": {
      language: "English",
      location: "Uganda",
      id: 4096,
      tag: "en-UG",
      version: "Release 10"
    },
    "en-ae": {
      language: "English",
      location: "United Arab Emirates",
      id: 19465,
      tag: "en-AE",
      version: "Release 10.5"
    },
    "en-gb": {
      language: "English",
      location: "United Kingdom",
      id: 2057,
      tag: "en-GB",
      version: "Release A"
    },
    "en-us": {
      language: "English",
      location: "United States",
      id: 1033,
      tag: "en-US",
      version: "Release A"
    },
    "en-um": {
      language: "English",
      location: "US Minor Outlying Islands",
      id: 4096,
      tag: "en-UM",
      version: "Release 10"
    },
    "en-vi": {
      language: "English",
      location: "US Virgin Islands",
      id: 4096,
      tag: "en-VI",
      version: "Release 10"
    },
    "en-vu": {
      language: "English",
      location: "Vanuatu",
      id: 4096,
      tag: "en-VU",
      version: "Release 10"
    },
    "en-001": {
      language: "English",
      location: "World",
      id: 4096,
      tag: "en-001",
      version: "Release 10"
    },
    "en-zm": {
      language: "English",
      location: "Zambia",
      id: 4096,
      tag: "en-ZM",
      version: "Release 10"
    },
    "en-zw": {
      language: "English",
      location: "Zimbabwe",
      id: 12297,
      tag: "en-ZW",
      version: "Release C"
    },
    eo: eo,
    "eo-001": {
      language: "Esperanto",
      location: "World",
      id: 4096,
      tag: "eo-001",
      version: "Release 10"
    },
    et: et,
    "et-ee": {
      language: "Estonian",
      location: "Estonia",
      id: 1061,
      tag: "et-EE",
      version: "Release B"
    },
    ee: ee,
    "ee-gh": {
      language: "Ewe",
      location: "Ghana",
      id: 4096,
      tag: "ee-GH",
      version: "Release 10"
    },
    "ee-tg": {
      language: "Ewe",
      location: "Togo",
      id: 4096,
      tag: "ee-TG",
      version: "Release 10"
    },
    ewo: ewo,
    "ewo-cm": {
      language: "Ewondo",
      location: "Cameroon",
      id: 4096,
      tag: "ewo-CM",
      version: "Release 10"
    },
    fo: fo,
    "fo-dk": {
      language: "Faroese",
      location: "Denmark",
      id: 4096,
      tag: "fo-DK",
      version: "Release 10.1"
    },
    "fo-fo": {
      language: "Faroese",
      location: "Faroe Islands",
      id: 1080,
      tag: "fo-FO",
      version: "Release B"
    },
    fil: fil,
    "fil-ph": {
      language: "Filipino",
      location: "Philippines",
      id: 1124,
      tag: "fil-PH",
      version: "Release E2"
    },
    fi: fi,
    "fi-fi": {
      language: "Finnish",
      location: "Finland",
      id: 1035,
      tag: "fi-FI",
      version: "Release A"
    },
    fr: fr,
    "fr-dz": {
      language: "French",
      location: "Algeria",
      id: 4096,
      tag: "fr-DZ",
      version: "Release 10"
    },
    "fr-be": {
      language: "French",
      location: "Belgium",
      id: 2060,
      tag: "fr-BE",
      version: "Release A"
    },
    "fr-bj": {
      language: "French",
      location: "Benin",
      id: 4096,
      tag: "fr-BJ",
      version: "Release 10"
    },
    "fr-bf": {
      language: "French",
      location: "Burkina Faso",
      id: 4096,
      tag: "fr-BF",
      version: "Release 10"
    },
    "fr-bi": {
      language: "French",
      location: "Burundi",
      id: 4096,
      tag: "fr-BI",
      version: "Release 10"
    },
    "fr-cm": {
      language: "French",
      location: "Cameroon",
      id: 11276,
      tag: "fr-CM",
      version: "Release 8.1"
    },
    "fr-ca": {
      language: "French",
      location: "Canada",
      id: 3084,
      tag: "fr-CA",
      version: "Release A"
    },
    "fr-cf": {
      language: "French",
      location: "Central African Republic",
      id: 4096,
      tag: "fr-CF",
      version: "Release10"
    },
    "fr-td": {
      language: "French",
      location: "Chad",
      id: 4096,
      tag: "fr-TD",
      version: "Release 10"
    },
    "fr-km": {
      language: "French",
      location: "Comoros",
      id: 4096,
      tag: "fr-KM",
      version: "Release 10"
    },
    "fr-cg": {
      language: "French",
      location: "Congo",
      id: 4096,
      tag: "fr-CG",
      version: "Release 10"
    },
    "fr-cd": {
      language: "French",
      location: "Congo, DRC",
      id: 9228,
      tag: "fr-CD",
      version: "Release 8.1"
    },
    "fr-ci": {
      language: "French",
      location: "Côte d'Ivoire",
      id: 12300,
      tag: "fr-CI",
      version: "Release 8.1"
    },
    "fr-dj": {
      language: "French",
      location: "Djibouti",
      id: 4096,
      tag: "fr-DJ",
      version: "Release 10"
    },
    "fr-gq": {
      language: "French",
      location: "Equatorial Guinea",
      id: 4096,
      tag: "fr-GQ",
      version: "Release 10"
    },
    "fr-fr": {
      language: "French",
      location: "France",
      id: 1036,
      tag: "fr-FR",
      version: "Release A"
    },
    "fr-gf": {
      language: "French",
      location: "French Guiana",
      id: 4096,
      tag: "fr-GF",
      version: "Release 10"
    },
    "fr-pf": {
      language: "French",
      location: "French Polynesia",
      id: 4096,
      tag: "fr-PF",
      version: "Release 10"
    },
    "fr-ga": {
      language: "French",
      location: "Gabon",
      id: 4096,
      tag: "fr-GA",
      version: "Release 10"
    },
    "fr-gp": {
      language: "French",
      location: "Guadeloupe",
      id: 4096,
      tag: "fr-GP",
      version: "Release 10"
    },
    "fr-gn": {
      language: "French",
      location: "Guinea",
      id: 4096,
      tag: "fr-GN",
      version: "Release 10"
    },
    "fr-ht": {
      language: "French",
      location: "Haiti",
      id: 15372,
      tag: "fr-HT",
      version: "Release 8.1"
    },
    "fr-lu": {
      language: "French",
      location: "Luxembourg",
      id: 5132,
      tag: "fr-LU",
      version: "Release A"
    },
    "fr-mg": {
      language: "French",
      location: "Madagascar",
      id: 4096,
      tag: "fr-MG",
      version: "Release 10"
    },
    "fr-ml": {
      language: "French",
      location: "Mali",
      id: 13324,
      tag: "fr-ML",
      version: "Release 8.1"
    },
    "fr-mq": {
      language: "French",
      location: "Martinique",
      id: 4096,
      tag: "fr-MQ",
      version: "Release 10"
    },
    "fr-mr": {
      language: "French",
      location: "Mauritania",
      id: 4096,
      tag: "fr-MR",
      version: "Release 10"
    },
    "fr-mu": {
      language: "French",
      location: "Mauritius",
      id: 4096,
      tag: "fr-MU",
      version: "Release 10"
    },
    "fr-yt": {
      language: "French",
      location: "Mayotte",
      id: 4096,
      tag: "fr-YT",
      version: "Release 10"
    },
    "fr-ma": {
      language: "French",
      location: "Morocco",
      id: 14348,
      tag: "fr-MA",
      version: "Release 8.1"
    },
    "fr-nc": {
      language: "French",
      location: "New Caledonia",
      id: 4096,
      tag: "fr-NC",
      version: "Release 10"
    },
    "fr-ne": {
      language: "French",
      location: "Niger",
      id: 4096,
      tag: "fr-NE",
      version: "Release 10"
    },
    "fr-mc": {
      language: "French",
      location: "Principality of Monaco",
      id: 6156,
      tag: "fr-MC",
      version: "Release A"
    },
    "fr-re": {
      language: "French",
      location: "Reunion",
      id: 8204,
      tag: "fr-RE",
      version: "Release 8.1"
    },
    "fr-rw": {
      language: "French",
      location: "Rwanda",
      id: 4096,
      tag: "fr-RW",
      version: "Release 10"
    },
    "fr-bl": {
      language: "French",
      location: "Saint Barthélemy",
      id: 4096,
      tag: "fr-BL",
      version: "Release 10"
    },
    "fr-mf": {
      language: "French",
      location: "Saint Martin",
      id: 4096,
      tag: "fr-MF",
      version: "Release 10"
    },
    "fr-pm": {
      language: "French",
      location: "Saint Pierre and Miquelon",
      id: 4096,
      tag: "fr-PM",
      version: "Release 10"
    },
    "fr-sn": {
      language: "French",
      location: "Senegal",
      id: 10252,
      tag: "fr-SN",
      version: "Release 8.1"
    },
    "fr-sc": {
      language: "French",
      location: "Seychelles",
      id: 4096,
      tag: "fr-SC",
      version: "Release 10"
    },
    "fr-ch": {
      language: "French",
      location: "Switzerland",
      id: 4108,
      tag: "fr-CH",
      version: "Release A"
    },
    "fr-sy": {
      language: "French",
      location: "Syria",
      id: 4096,
      tag: "fr-SY",
      version: "Release 10"
    },
    "fr-tg": {
      language: "French",
      location: "Togo",
      id: 4096,
      tag: "fr-TG",
      version: "Release 10"
    },
    "fr-tn": {
      language: "French",
      location: "Tunisia",
      id: 4096,
      tag: "fr-TN",
      version: "Release 10"
    },
    "fr-vu": {
      language: "French",
      location: "Vanuatu",
      id: 4096,
      tag: "fr-VU",
      version: "Release 10"
    },
    "fr-wf": {
      language: "French",
      location: "Wallis and Futuna",
      id: 4096,
      tag: "fr-WF",
      version: "Release 10"
    },
    fy: fy,
    "fy-nl": {
      language: "Frisian",
      location: "Netherlands",
      id: 1122,
      tag: "fy-NL",
      version: "Release E2"
    },
    fur: fur,
    "fur-it": {
      language: "Friulian",
      location: "Italy",
      id: 4096,
      tag: "fur-IT",
      version: "Release 10"
    },
    ff: ff,
    "ff-latn": {
      language: "Fulah (Latin)",
      location: null,
      id: 31847,
      tag: "ff-Latn",
      version: "Release 8"
    },
    "ff-latn-bf": {
      language: "Fulah (Latin)",
      location: "Burkina Faso",
      id: 4096,
      tag: "ff-Latn-BF",
      version: "Release 10.4"
    },
    "ff-cm": {
      language: "Fulah",
      location: "Cameroon",
      id: 4096,
      tag: "ff-CM",
      version: "Release 10"
    },
    "ff-latn-cm": {
      language: "Fulah (Latin)",
      location: "Cameroon",
      id: 4096,
      tag: "ff-Latn-CM",
      version: "Release 10.4"
    },
    "ff-latn-gm": {
      language: "Fulah (Latin)",
      location: "Gambia",
      id: 4096,
      tag: "ff-Latn-GM",
      version: "Release 10.4"
    },
    "ff-latn-gh": {
      language: "Fulah (Latin)",
      location: "Ghana",
      id: 4096,
      tag: "ff-Latn-GH",
      version: "Release 10.4"
    },
    "ff-gn": {
      language: "Fulah",
      location: "Guinea",
      id: 4096,
      tag: "ff-GN",
      version: "Release 10"
    },
    "ff-latn-gn": {
      language: "Fulah (Latin)",
      location: "Guinea",
      id: 4096,
      tag: "ff-Latn-GN",
      version: "Release 10.4"
    },
    "ff-latn-gw": {
      language: "Fulah (Latin)",
      location: "Guinea-Bissau",
      id: 4096,
      tag: "ff-Latn-GW",
      version: "Release 10.4"
    },
    "ff-latn-lr": {
      language: "Fulah (Latin)",
      location: "Liberia",
      id: 4096,
      tag: "ff-Latn-LR",
      version: "Release 10.4"
    },
    "ff-mr": {
      language: "Fulah",
      location: "Mauritania",
      id: 4096,
      tag: "ff-MR",
      version: "Release 10"
    },
    "ff-latn-mr": {
      language: "Fulah (Latin)",
      location: "Mauritania",
      id: 4096,
      tag: "ff-Latn-MR",
      version: "Release 10.4"
    },
    "ff-latn-ne": {
      language: "Fulah (Latin)",
      location: "Niger",
      id: 4096,
      tag: "ff-Latn-NE",
      version: "Release 10.4"
    },
    "ff-ng": {
      language: "Fulah",
      location: "Nigeria",
      id: 4096,
      tag: "ff-NG",
      version: "Release 10"
    },
    "ff-latn-ng": {
      language: "Fulah (Latin)",
      location: "Nigeria",
      id: 4096,
      tag: "ff-Latn-NG",
      version: "Release 10.4"
    },
    "ff-latn-sn": {
      language: "Fulah",
      location: "Senegal",
      id: 2151,
      tag: "ff-Latn-SN",
      version: "Release 8"
    },
    "ff-latn-sl": {
      language: "Fulah (Latin)",
      location: "Sierra Leone",
      id: 4096,
      tag: "ff-Latn-SL",
      version: "Release 10.4"
    },
    gl: gl,
    "gl-es": {
      language: "Galician",
      location: "Spain",
      id: 1110,
      tag: "gl-ES",
      version: "Release D"
    },
    lg: lg,
    "lg-ug": {
      language: "Ganda",
      location: "Uganda",
      id: 4096,
      tag: "lg-UG",
      version: "Release 10"
    },
    ka: ka,
    "ka-ge": {
      language: "Georgian",
      location: "Georgia",
      id: 1079,
      tag: "ka-GE",
      version: "Release C"
    },
    de: de,
    "de-at": {
      language: "German",
      location: "Austria",
      id: 3079,
      tag: "de-AT",
      version: "Release A"
    },
    "de-be": {
      language: "German",
      location: "Belgium",
      id: 4096,
      tag: "de-BE",
      version: "Release 10"
    },
    "de-de": {
      language: "German",
      location: "Germany",
      id: 1031,
      tag: "de-DE",
      version: "Release A"
    },
    "de-it": {
      language: "German",
      location: "Italy",
      id: 4096,
      tag: "de-IT",
      version: "Release 10.2"
    },
    "de-li": {
      language: "German",
      location: "Liechtenstein",
      id: 5127,
      tag: "de-LI",
      version: "Release B"
    },
    "de-lu": {
      language: "German",
      location: "Luxembourg",
      id: 4103,
      tag: "de-LU",
      version: "Release B"
    },
    "de-ch": {
      language: "German",
      location: "Switzerland",
      id: 2055,
      tag: "de-CH",
      version: "Release A"
    },
    el: el,
    "el-cy": {
      language: "Greek",
      location: "Cyprus",
      id: 4096,
      tag: "el-CY",
      version: "Release 10"
    },
    "el-gr": {
      language: "Greek",
      location: "Greece",
      id: 1032,
      tag: "el-GR",
      version: "Release A"
    },
    kl: kl,
    "kl-gl": {
      language: "Greenlandic",
      location: "Greenland",
      id: 1135,
      tag: "kl-GL",
      version: "Release V"
    },
    gn: gn,
    "gn-py": {
      language: "Guarani",
      location: "Paraguay",
      id: 1140,
      tag: "gn-PY",
      version: "Release 8.1"
    },
    gu: gu,
    "gu-in": {
      language: "Gujarati",
      location: "India",
      id: 1095,
      tag: "gu-IN",
      version: "Release D"
    },
    guz: guz,
    "guz-ke": {
      language: "Gusii",
      location: "Kenya",
      id: 4096,
      tag: "guz-KE",
      version: "Release 10"
    },
    ha: ha,
    "ha-latn": {
      language: "Hausa (Latin)",
      location: null,
      id: 31848,
      tag: "ha-Latn",
      version: "Windows 7"
    },
    "ha-latn-gh": {
      language: "Hausa (Latin)",
      location: "Ghana",
      id: 4096,
      tag: "ha-Latn-GH",
      version: "Release 10"
    },
    "ha-latn-ne": {
      language: "Hausa (Latin)",
      location: "Niger",
      id: 4096,
      tag: "ha-Latn-NE",
      version: "Release 10"
    },
    "ha-latn-ng": {
      language: "Hausa (Latin)",
      location: "Nigeria",
      id: 1128,
      tag: "ha-Latn-NG",
      version: "Release V"
    },
    haw: haw,
    "haw-us": {
      language: "Hawaiian",
      location: "United States",
      id: 1141,
      tag: "haw-US",
      version: "Release 8"
    },
    he: he,
    "he-il": {
      language: "Hebrew",
      location: "Israel",
      id: 1037,
      tag: "he-IL",
      version: "Release B"
    },
    hi: hi,
    "hi-in": {
      language: "Hindi",
      location: "India",
      id: 1081,
      tag: "hi-IN",
      version: "Release C"
    },
    hu: hu,
    "hu-hu": {
      language: "Hungarian",
      location: "Hungary",
      id: 1038,
      tag: "hu-HU",
      version: "Release A"
    },
    is: is,
    "is-is": {
      language: "Icelandic",
      location: "Iceland",
      id: 1039,
      tag: "is-IS",
      version: "Release A"
    },
    ig: ig,
    "ig-ng": {
      language: "Igbo",
      location: "Nigeria",
      id: 1136,
      tag: "ig-NG",
      version: "Release V"
    },
    id: id$1,
    "id-id": {
      language: "Indonesian",
      location: "Indonesia",
      id: 1057,
      tag: "id-ID",
      version: "Release B"
    },
    ia: ia,
    "ia-fr": {
      language: "Interlingua",
      location: "France",
      id: 4096,
      tag: "ia-FR",
      version: "Release 10"
    },
    "ia-001": {
      language: "Interlingua",
      location: "World",
      id: 4096,
      tag: "ia-001",
      version: "Release 10"
    },
    iu: iu,
    "iu-latn": {
      language: "Inuktitut (Latin)",
      location: null,
      id: 31837,
      tag: "iu-Latn",
      version: "Windows 7"
    },
    "iu-latn-ca": {
      language: "Inuktitut (Latin)",
      location: "Canada",
      id: 2141,
      tag: "iu-Latn-CA",
      version: "Release E2"
    },
    "iu-cans": {
      language: "Inuktitut (Syllabics)",
      location: null,
      id: 30813,
      tag: "iu-Cans",
      version: "Windows 7"
    },
    "iu-cans-ca": {
      language: "Inuktitut (Syllabics)",
      location: "Canada",
      id: 1117,
      tag: "iu-Cans-CA",
      version: "Release V"
    },
    ga: ga,
    "ga-ie": {
      language: "Irish",
      location: "Ireland",
      id: 2108,
      tag: "ga-IE",
      version: "Release E2"
    },
    it: it,
    "it-it": {
      language: "Italian",
      location: "Italy",
      id: 1040,
      tag: "it-IT",
      version: "Release A"
    },
    "it-sm": {
      language: "Italian",
      location: "San Marino",
      id: 4096,
      tag: "it-SM",
      version: "Release 10"
    },
    "it-ch": {
      language: "Italian",
      location: "Switzerland",
      id: 2064,
      tag: "it-CH",
      version: "Release A"
    },
    "it-va": {
      language: "Italian",
      location: "Vatican City",
      id: 4096,
      tag: "it-VA",
      version: "Release 10.3"
    },
    ja: ja,
    "ja-jp": {
      language: "Japanese",
      location: "Japan",
      id: 1041,
      tag: "ja-JP",
      version: "Release A"
    },
    jv: jv,
    "jv-latn": {
      language: "Javanese",
      location: "Latin",
      id: 4096,
      tag: "jv-Latn",
      version: "Release 8.1"
    },
    "jv-latn-id": {
      language: "Javanese",
      location: "Latin, Indonesia",
      id: 4096,
      tag: "jv-Latn-ID",
      version: "Release 8.1"
    },
    dyo: dyo,
    "dyo-sn": {
      language: "Jola-Fonyi",
      location: "Senegal",
      id: 4096,
      tag: "dyo-SN",
      version: "Release 10"
    },
    kea: kea,
    "kea-cv": {
      language: "Kabuverdianu",
      location: "Cabo Verde",
      id: 4096,
      tag: "kea-CV",
      version: "Release 10"
    },
    kab: kab,
    "kab-dz": {
      language: "Kabyle",
      location: "Algeria",
      id: 4096,
      tag: "kab-DZ",
      version: "Release 10"
    },
    kkj: kkj,
    "kkj-cm": {
      language: "Kako",
      location: "Cameroon",
      id: 4096,
      tag: "kkj-CM",
      version: "Release 10"
    },
    kln: kln,
    "kln-ke": {
      language: "Kalenjin",
      location: "Kenya",
      id: 4096,
      tag: "kln-KE",
      version: "Release 10"
    },
    kam: kam,
    "kam-ke": {
      language: "Kamba",
      location: "Kenya",
      id: 4096,
      tag: "kam-KE",
      version: "Release 10"
    },
    kn: kn,
    "kn-in": {
      language: "Kannada",
      location: "India",
      id: 1099,
      tag: "kn-IN",
      version: "Release D"
    },
    ks: ks,
    "ks-arab": {
      language: "Kashmiri",
      location: "Perso-Arabic",
      id: 1120,
      tag: "ks-Arab",
      version: "Release 10"
    },
    "ks-arab-in": {
      language: "Kashmiri",
      location: "Perso-Arabic",
      id: 4096,
      tag: "ks-Arab-IN",
      version: "Release 10"
    },
    kk: kk,
    "kk-kz": {
      language: "Kazakh",
      location: "Kazakhstan",
      id: 1087,
      tag: "kk-KZ",
      version: "Release C"
    },
    km: km,
    "km-kh": {
      language: "Khmer",
      location: "Cambodia",
      id: 1107,
      tag: "km-KH",
      version: "Release V"
    },
    quc: quc,
    "quc-latn-gt": {
      language: "K'iche",
      location: "Guatemala",
      id: 1158,
      tag: "quc-Latn-GT",
      version: "Release 10"
    },
    ki: ki,
    "ki-ke": {
      language: "Kikuyu",
      location: "Kenya",
      id: 4096,
      tag: "ki-KE",
      version: "Release 10"
    },
    rw: rw,
    "rw-rw": {
      language: "Kinyarwanda",
      location: "Rwanda",
      id: 1159,
      tag: "rw-RW",
      version: "Release V"
    },
    sw: sw,
    "sw-ke": {
      language: "Kiswahili",
      location: "Kenya",
      id: 1089,
      tag: "sw-KE",
      version: "Release C"
    },
    "sw-tz": {
      language: "Kiswahili",
      location: "Tanzania",
      id: 4096,
      tag: "sw-TZ",
      version: "Release 10"
    },
    "sw-ug": {
      language: "Kiswahili",
      location: "Uganda",
      id: 4096,
      tag: "sw-UG",
      version: "Release 10"
    },
    kok: kok,
    "kok-in": {
      language: "Konkani",
      location: "India",
      id: 1111,
      tag: "kok-IN",
      version: "Release C"
    },
    ko: ko,
    "ko-kr": {
      language: "Korean",
      location: "Korea",
      id: 1042,
      tag: "ko-KR",
      version: "Release A"
    },
    "ko-kp": {
      language: "Korean",
      location: "North Korea",
      id: 4096,
      tag: "ko-KP",
      version: "Release 10.1"
    },
    khq: khq,
    "khq-ml": {
      language: "Koyra Chiini",
      location: "Mali",
      id: 4096,
      tag: "khq-ML",
      version: "Release 10"
    },
    ses: ses,
    "ses-ml": {
      language: "Koyraboro Senni",
      location: "Mali",
      id: 4096,
      tag: "ses-ML",
      version: "Release 10"
    },
    nmg: nmg,
    "nmg-cm": {
      language: "Kwasio",
      location: "Cameroon",
      id: 4096,
      tag: "nmg-CM",
      version: "Release 10"
    },
    ky: ky,
    "ky-kg": {
      language: "Kyrgyz",
      location: "Kyrgyzstan",
      id: 1088,
      tag: "ky-KG",
      version: "Release D"
    },
    "ku-arab-ir": {
      language: "Kurdish",
      location: "Perso-Arabic, Iran",
      id: 4096,
      tag: "ku-Arab-IR",
      version: "Release 10.1"
    },
    lkt: lkt,
    "lkt-us": {
      language: "Lakota",
      location: "United States",
      id: 4096,
      tag: "lkt-US",
      version: "Release 10"
    },
    lag: lag,
    "lag-tz": {
      language: "Langi",
      location: "Tanzania",
      id: 4096,
      tag: "lag-TZ",
      version: "Release 10"
    },
    lo: lo,
    "lo-la": {
      language: "Lao",
      location: "Lao P.D.R.",
      id: 1108,
      tag: "lo-LA",
      version: "Release V"
    },
    lv: lv,
    "lv-lv": {
      language: "Latvian",
      location: "Latvia",
      id: 1062,
      tag: "lv-LV",
      version: "Release B"
    },
    ln: ln,
    "ln-ao": {
      language: "Lingala",
      location: "Angola",
      id: 4096,
      tag: "ln-AO",
      version: "Release 10"
    },
    "ln-cf": {
      language: "Lingala",
      location: "Central African Republic",
      id: 4096,
      tag: "ln-CF",
      version: "Release 10"
    },
    "ln-cg": {
      language: "Lingala",
      location: "Congo",
      id: 4096,
      tag: "ln-CG",
      version: "Release 10"
    },
    "ln-cd": {
      language: "Lingala",
      location: "Congo DRC",
      id: 4096,
      tag: "ln-CD",
      version: "Release 10"
    },
    lt: lt,
    "lt-lt": {
      language: "Lithuanian",
      location: "Lithuania",
      id: 1063,
      tag: "lt-LT",
      version: "Release B"
    },
    nds: nds,
    "nds-de": {
      language: "Low German",
      location: "Germany",
      id: 4096,
      tag: "nds-DE",
      version: "Release 10.2"
    },
    "nds-nl": {
      language: "Low German",
      location: "Netherlands",
      id: 4096,
      tag: "nds-NL",
      version: "Release 10.2"
    },
    dsb: dsb,
    "dsb-de": {
      language: "Lower Sorbian",
      location: "Germany",
      id: 2094,
      tag: "dsb-DE",
      version: "Release V"
    },
    lu: lu,
    "lu-cd": {
      language: "Luba-Katanga",
      location: "Congo DRC",
      id: 4096,
      tag: "lu-CD",
      version: "Release 10"
    },
    luo: luo,
    "luo-ke": {
      language: "Luo",
      location: "Kenya",
      id: 4096,
      tag: "luo-KE",
      version: "Release 10"
    },
    lb: lb,
    "lb-lu": {
      language: "Luxembourgish",
      location: "Luxembourg",
      id: 1134,
      tag: "lb-LU",
      version: "Release E2"
    },
    luy: luy,
    "luy-ke": {
      language: "Luyia",
      location: "Kenya",
      id: 4096,
      tag: "luy-KE",
      version: "Release 10"
    },
    mk: mk,
    "mk-mk": {
      language: "Macedonian",
      location: "North Macedonia",
      id: 1071,
      tag: "mk-MK",
      version: "Release C"
    },
    jmc: jmc,
    "jmc-tz": {
      language: "Machame",
      location: "Tanzania",
      id: 4096,
      tag: "jmc-TZ",
      version: "Release 10"
    },
    mgh: mgh,
    "mgh-mz": {
      language: "Makhuwa-Meetto",
      location: "Mozambique",
      id: 4096,
      tag: "mgh-MZ",
      version: "Release 10"
    },
    kde: kde,
    "kde-tz": {
      language: "Makonde",
      location: "Tanzania",
      id: 4096,
      tag: "kde-TZ",
      version: "Release 10"
    },
    mg: mg,
    "mg-mg": {
      language: "Malagasy",
      location: "Madagascar",
      id: 4096,
      tag: "mg-MG",
      version: "Release 8.1"
    },
    ms: ms,
    "ms-bn": {
      language: "Malay",
      location: "Brunei Darussalam",
      id: 2110,
      tag: "ms-BN",
      version: "Release C"
    },
    "ms-my": {
      language: "Malay",
      location: "Malaysia",
      id: 1086,
      tag: "ms-MY",
      version: "Release C"
    },
    ml: ml,
    "ml-in": {
      language: "Malayalam",
      location: "India",
      id: 1100,
      tag: "ml-IN",
      version: "Release E1"
    },
    mt: mt,
    "mt-mt": {
      language: "Maltese",
      location: "Malta",
      id: 1082,
      tag: "mt-MT",
      version: "Release E1"
    },
    gv: gv,
    "gv-im": {
      language: "Manx",
      location: "Isle of Man",
      id: 4096,
      tag: "gv-IM",
      version: "Release 10"
    },
    mi: mi,
    "mi-nz": {
      language: "Maori",
      location: "New Zealand",
      id: 1153,
      tag: "mi-NZ",
      version: "Release E1"
    },
    arn: arn,
    "arn-cl": {
      language: "Mapudungun",
      location: "Chile",
      id: 1146,
      tag: "arn-CL",
      version: "Release E2"
    },
    mr: mr,
    "mr-in": {
      language: "Marathi",
      location: "India",
      id: 1102,
      tag: "mr-IN",
      version: "Release C"
    },
    mas: mas,
    "mas-ke": {
      language: "Masai",
      location: "Kenya",
      id: 4096,
      tag: "mas-KE",
      version: "Release 10"
    },
    "mas-tz": {
      language: "Masai",
      location: "Tanzania",
      id: 4096,
      tag: "mas-TZ",
      version: "Release 10"
    },
    "mzn-ir": {
      language: "Mazanderani",
      location: "Iran",
      id: 4096,
      tag: "mzn-IR",
      version: "Release 10.1"
    },
    mer: mer,
    "mer-ke": {
      language: "Meru",
      location: "Kenya",
      id: 4096,
      tag: "mer-KE",
      version: "Release 10"
    },
    mgo: mgo,
    "mgo-cm": {
      language: "Meta'",
      location: "Cameroon",
      id: 4096,
      tag: "mgo-CM",
      version: "Release 10"
    },
    moh: moh,
    "moh-ca": {
      language: "Mohawk",
      location: "Canada",
      id: 1148,
      tag: "moh-CA",
      version: "Release E2"
    },
    mn: mn,
    "mn-cyrl": {
      language: "Mongolian (Cyrillic)",
      location: null,
      id: 30800,
      tag: "mn-Cyrl",
      version: "Windows 7"
    },
    "mn-mn": {
      language: "Mongolian (Cyrillic)",
      location: "Mongolia",
      id: 1104,
      tag: "mn-MN",
      version: "Release D"
    },
    "mn-mong": {
      language: "Mongolian (Traditional Mongolian)",
      location: null,
      id: 31824,
      tag: "mn-Mong",
      version: "Windows 7"
    },
    "mn-mong-cn": {
      language: "Mongolian (Traditional Mongolian)",
      location: "People's Republic of China",
      id: 2128,
      tag: "mn-Mong-CN",
      version: "Windows V"
    },
    "mn-mong-mn": {
      language: "Mongolian (Traditional Mongolian)",
      location: "Mongolia",
      id: 3152,
      tag: "mn-Mong-MN",
      version: "Windows 7"
    },
    mfe: mfe,
    "mfe-mu": {
      language: "Morisyen",
      location: "Mauritius",
      id: 4096,
      tag: "mfe-MU",
      version: "Release 10"
    },
    mua: mua,
    "mua-cm": {
      language: "Mundang",
      location: "Cameroon",
      id: 4096,
      tag: "mua-CM",
      version: "Release 10"
    },
    nqo: nqo,
    "nqo-gn": {
      language: "N'ko",
      location: "Guinea",
      id: 4096,
      tag: "nqo-GN",
      version: "Release 8.1"
    },
    naq: naq,
    "naq-na": {
      language: "Nama",
      location: "Namibia",
      id: 4096,
      tag: "naq-NA",
      version: "Release 10"
    },
    ne: ne,
    "ne-in": {
      language: "Nepali",
      location: "India",
      id: 2145,
      tag: "ne-IN",
      version: "Release 8.1"
    },
    "ne-np": {
      language: "Nepali",
      location: "Nepal",
      id: 1121,
      tag: "ne-NP",
      version: "Release E2"
    },
    nnh: nnh,
    "nnh-cm": {
      language: "Ngiemboon",
      location: "Cameroon",
      id: 4096,
      tag: "nnh-CM",
      version: "Release 10"
    },
    jgo: jgo,
    "jgo-cm": {
      language: "Ngomba",
      location: "Cameroon",
      id: 4096,
      tag: "jgo-CM",
      version: "Release 10"
    },
    "lrc-iq": {
      language: "Northern Luri",
      location: "Iraq",
      id: 4096,
      tag: "lrc-IQ",
      version: "Release 10.1"
    },
    "lrc-ir": {
      language: "Northern Luri",
      location: "Iran",
      id: 4096,
      tag: "lrc-IR",
      version: "Release 10.1"
    },
    nd: nd,
    "nd-zw": {
      language: "North Ndebele",
      location: "Zimbabwe",
      id: 4096,
      tag: "nd-ZW",
      version: "Release 10"
    },
    no: no,
    nb: nb,
    "nb-no": {
      language: "Norwegian (Bokmal)",
      location: "Norway",
      id: 1044,
      tag: "nb-NO",
      version: "Release A"
    },
    nn: nn,
    "nn-no": {
      language: "Norwegian (Nynorsk)",
      location: "Norway",
      id: 2068,
      tag: "nn-NO",
      version: "Release A"
    },
    "nb-sj": {
      language: "Norwegian Bokmål",
      location: "Svalbard and Jan Mayen",
      id: 4096,
      tag: "nb-SJ",
      version: "Release 10"
    },
    nus: nus,
    "nus-sd": {
      language: "Nuer",
      location: "Sudan",
      id: 4096,
      tag: "nus-SD",
      version: "Release 10"
    },
    "nus-ss": {
      language: "Nuer",
      location: "South Sudan",
      id: 4096,
      tag: "nus-SS",
      version: "Release 10.1"
    },
    nyn: nyn,
    "nyn-ug": {
      language: "Nyankole",
      location: "Uganda",
      id: 4096,
      tag: "nyn-UG",
      version: "Release 10"
    },
    oc: oc,
    "oc-fr": {
      language: "Occitan",
      location: "France",
      id: 1154,
      tag: "oc-FR",
      version: "Release V"
    },
    or: or,
    "or-in": {
      language: "Odia",
      location: "India",
      id: 1096,
      tag: "or-IN",
      version: "Release V"
    },
    om: om,
    "om-et": {
      language: "Oromo",
      location: "Ethiopia",
      id: 1138,
      tag: "om-ET",
      version: "Release 8.1"
    },
    "om-ke": {
      language: "Oromo",
      location: "Kenya",
      id: 4096,
      tag: "om-KE",
      version: "Release 10"
    },
    os: os,
    "os-ge": {
      language: "Ossetian",
      location: "Cyrillic, Georgia",
      id: 4096,
      tag: "os-GE",
      version: "Release 10"
    },
    "os-ru": {
      language: "Ossetian",
      location: "Cyrillic, Russia",
      id: 4096,
      tag: "os-RU",
      version: "Release 10"
    },
    ps: ps,
    "ps-af": {
      language: "Pashto",
      location: "Afghanistan",
      id: 1123,
      tag: "ps-AF",
      version: "Release E2"
    },
    "ps-pk": {
      language: "Pashto",
      location: "Pakistan",
      id: 4096,
      tag: "ps-PK",
      version: "Release 10.5"
    },
    fa: fa,
    "fa-af": {
      language: "Persian",
      location: "Afghanistan",
      id: 4096,
      tag: "fa-AF",
      version: "Release 10"
    },
    "fa-ir": {
      language: "Persian",
      location: "Iran",
      id: 1065,
      tag: "fa-IR",
      version: "Release B"
    },
    pl: pl,
    "pl-pl": {
      language: "Polish",
      location: "Poland",
      id: 1045,
      tag: "pl-PL",
      version: "Release A"
    },
    pt: pt,
    "pt-ao": {
      language: "Portuguese",
      location: "Angola",
      id: 4096,
      tag: "pt-AO",
      version: "Release 8.1"
    },
    "pt-br": {
      language: "Portuguese",
      location: "Brazil",
      id: 1046,
      tag: "pt-BR",
      version: "Release A"
    },
    "pt-cv": {
      language: "Portuguese",
      location: "Cabo Verde",
      id: 4096,
      tag: "pt-CV",
      version: "Release 10"
    },
    "pt-gq": {
      language: "Portuguese",
      location: "Equatorial Guinea",
      id: 4096,
      tag: "pt-GQ",
      version: "Release 10.2"
    },
    "pt-gw": {
      language: "Portuguese",
      location: "Guinea-Bissau",
      id: 4096,
      tag: "pt-GW",
      version: "Release 10"
    },
    "pt-lu": {
      language: "Portuguese",
      location: "Luxembourg",
      id: 4096,
      tag: "pt-LU",
      version: "Release 10.2"
    },
    "pt-mo": {
      language: "Portuguese",
      location: "Macao SAR",
      id: 4096,
      tag: "pt-MO",
      version: "Release 10"
    },
    "pt-mz": {
      language: "Portuguese",
      location: "Mozambique",
      id: 4096,
      tag: "pt-MZ",
      version: "Release 10"
    },
    "pt-pt": {
      language: "Portuguese",
      location: "Portugal",
      id: 2070,
      tag: "pt-PT",
      version: "Release A"
    },
    "pt-st": {
      language: "Portuguese",
      location: "São Tomé and Príncipe",
      id: 4096,
      tag: "pt-ST",
      version: "Release 10"
    },
    "pt-ch": {
      language: "Portuguese",
      location: "Switzerland",
      id: 4096,
      tag: "pt-CH",
      version: "Release 10.2"
    },
    "pt-tl": {
      language: "Portuguese",
      location: "Timor-Leste",
      id: 4096,
      tag: "pt-TL",
      version: "Release 10"
    },
    "prg-001": {
      language: "Prussian",
      location: null,
      id: 4096,
      tag: "prg-001",
      version: "Release 10.1"
    },
    "qps-ploca": {
      language: "Pseudo Language",
      location: "Pseudo locale for east Asian/complex script localization testing",
      id: 1534,
      tag: "qps-ploca",
      version: "Release 7"
    },
    "qps-ploc": {
      language: "Pseudo Language",
      location: "Pseudo locale used for localization testing",
      id: 1281,
      tag: "qps-ploc",
      version: "Release 7"
    },
    "qps-plocm": {
      language: "Pseudo Language",
      location: "Pseudo locale used for localization testing of mirrored locales",
      id: 2559,
      tag: "qps-plocm",
      version: "Release 7"
    },
    pa: pa,
    "pa-arab": {
      language: "Punjabi",
      location: null,
      id: 31814,
      tag: "pa-Arab",
      version: "Release 8"
    },
    "pa-in": {
      language: "Punjabi",
      location: "India",
      id: 1094,
      tag: "pa-IN",
      version: "Release D"
    },
    "pa-arab-pk": {
      language: "Punjabi",
      location: "Islamic Republic of Pakistan",
      id: 2118,
      tag: "pa-Arab-PK",
      version: "Release 8"
    },
    quz: quz,
    "quz-bo": {
      language: "Quechua",
      location: "Bolivia",
      id: 1131,
      tag: "quz-BO",
      version: "Release E1"
    },
    "quz-ec": {
      language: "Quechua",
      location: "Ecuador",
      id: 2155,
      tag: "quz-EC",
      version: "Release E1"
    },
    "quz-pe": {
      language: "Quechua",
      location: "Peru",
      id: 3179,
      tag: "quz-PE",
      version: "Release E1"
    },
    ksh: ksh,
    "ksh-de": {
      language: "Ripuarian",
      location: "Germany",
      id: 4096,
      tag: "ksh-DE",
      version: "Release 10"
    },
    ro: ro,
    "ro-md": {
      language: "Romanian",
      location: "Moldova",
      id: 2072,
      tag: "ro-MD",
      version: "Release 8.1"
    },
    "ro-ro": {
      language: "Romanian",
      location: "Romania",
      id: 1048,
      tag: "ro-RO",
      version: "Release A"
    },
    rm: rm,
    "rm-ch": {
      language: "Romansh",
      location: "Switzerland",
      id: 1047,
      tag: "rm-CH",
      version: "Release E2"
    },
    rof: rof,
    "rof-tz": {
      language: "Rombo",
      location: "Tanzania",
      id: 4096,
      tag: "rof-TZ",
      version: "Release 10"
    },
    rn: rn,
    "rn-bi": {
      language: "Rundi",
      location: "Burundi",
      id: 4096,
      tag: "rn-BI",
      version: "Release 10"
    },
    ru: ru,
    "ru-by": {
      language: "Russian",
      location: "Belarus",
      id: 4096,
      tag: "ru-BY",
      version: "Release 10"
    },
    "ru-kz": {
      language: "Russian",
      location: "Kazakhstan",
      id: 4096,
      tag: "ru-KZ",
      version: "Release 10"
    },
    "ru-kg": {
      language: "Russian",
      location: "Kyrgyzstan",
      id: 4096,
      tag: "ru-KG",
      version: "Release 10"
    },
    "ru-md": {
      language: "Russian",
      location: "Moldova",
      id: 2073,
      tag: "ru-MD",
      version: "Release 10"
    },
    "ru-ru": {
      language: "Russian",
      location: "Russia",
      id: 1049,
      tag: "ru-RU",
      version: "Release A"
    },
    "ru-ua": {
      language: "Russian",
      location: "Ukraine",
      id: 4096,
      tag: "ru-UA",
      version: "Release 10"
    },
    rwk: rwk,
    "rwk-tz": {
      language: "Rwa",
      location: "Tanzania",
      id: 4096,
      tag: "rwk-TZ",
      version: "Release 10"
    },
    ssy: ssy,
    "ssy-er": {
      language: "Saho",
      location: "Eritrea",
      id: 4096,
      tag: "ssy-ER",
      version: "Release 10"
    },
    sah: sah,
    "sah-ru": {
      language: "Sakha",
      location: "Russia",
      id: 1157,
      tag: "sah-RU",
      version: "Release V"
    },
    saq: saq,
    "saq-ke": {
      language: "Samburu",
      location: "Kenya",
      id: 4096,
      tag: "saq-KE",
      version: "Release 10"
    },
    smn: smn,
    "smn-fi": {
      language: "Sami (Inari)",
      location: "Finland",
      id: 9275,
      tag: "smn-FI",
      version: "Release E1"
    },
    smj: smj,
    "smj-no": {
      language: "Sami (Lule)",
      location: "Norway",
      id: 4155,
      tag: "smj-NO",
      version: "Release E1"
    },
    "smj-se": {
      language: "Sami (Lule)",
      location: "Sweden",
      id: 5179,
      tag: "smj-SE",
      version: "Release E1"
    },
    se: se,
    "se-fi": {
      language: "Sami (Northern)",
      location: "Finland",
      id: 3131,
      tag: "se-FI",
      version: "Release E1"
    },
    "se-no": {
      language: "Sami (Northern)",
      location: "Norway",
      id: 1083,
      tag: "se-NO",
      version: "Release E1"
    },
    "se-se": {
      language: "Sami (Northern)",
      location: "Sweden",
      id: 2107,
      tag: "se-SE",
      version: "Release E1"
    },
    sms: sms,
    "sms-fi": {
      language: "Sami (Skolt)",
      location: "Finland",
      id: 8251,
      tag: "sms-FI",
      version: "Release E1"
    },
    sma: sma,
    "sma-no": {
      language: "Sami (Southern)",
      location: "Norway",
      id: 6203,
      tag: "sma-NO",
      version: "Release E1"
    },
    "sma-se": {
      language: "Sami (Southern)",
      location: "Sweden",
      id: 7227,
      tag: "sma-SE",
      version: "Release E1"
    },
    sg: sg,
    "sg-cf": {
      language: "Sango",
      location: "Central African Republic",
      id: 4096,
      tag: "sg-CF",
      version: "Release 10"
    },
    sbp: sbp,
    "sbp-tz": {
      language: "Sangu",
      location: "Tanzania",
      id: 4096,
      tag: "sbp-TZ",
      version: "Release 10"
    },
    sa: sa,
    "sa-in": {
      language: "Sanskrit",
      location: "India",
      id: 1103,
      tag: "sa-IN",
      version: "Release C"
    },
    gd: gd,
    "gd-gb": {
      language: "Scottish Gaelic",
      location: "United Kingdom",
      id: 1169,
      tag: "gd-GB",
      version: "Release 7"
    },
    seh: seh,
    "seh-mz": {
      language: "Sena",
      location: "Mozambique",
      id: 4096,
      tag: "seh-MZ",
      version: "Release 10"
    },
    "sr-cyrl": {
      language: "Serbian (Cyrillic)",
      location: null,
      id: 27674,
      tag: "sr-Cyrl",
      version: "Windows 7"
    },
    "sr-cyrl-ba": {
      language: "Serbian (Cyrillic)",
      location: "Bosnia and Herzegovina",
      id: 7194,
      tag: "sr-Cyrl-BA",
      version: "Release E1"
    },
    "sr-cyrl-me": {
      language: "Serbian (Cyrillic)",
      location: "Montenegro",
      id: 12314,
      tag: "sr-Cyrl-ME",
      version: "Release 7"
    },
    "sr-cyrl-rs": {
      language: "Serbian (Cyrillic)",
      location: "Serbia",
      id: 10266,
      tag: "sr-Cyrl-RS",
      version: "Release 7"
    },
    "sr-cyrl-cs": {
      language: "Serbian (Cyrillic)",
      location: "Serbia and Montenegro (Former)",
      id: 3098,
      tag: "sr-Cyrl-CS",
      version: "Release B"
    },
    "sr-latn": {
      language: "Serbian (Latin)",
      location: null,
      id: 28698,
      tag: "sr-Latn",
      version: "Windows 7"
    },
    sr: sr,
    "sr-latn-ba": {
      language: "Serbian (Latin)",
      location: "Bosnia and Herzegovina",
      id: 6170,
      tag: "sr-Latn-BA",
      version: "Release E1"
    },
    "sr-latn-me": {
      language: "Serbian (Latin)",
      location: "Montenegro",
      id: 11290,
      tag: "sr-Latn-ME",
      version: "Release 7"
    },
    "sr-latn-rs": {
      language: "Serbian (Latin)",
      location: "Serbia",
      id: 9242,
      tag: "sr-Latn-RS",
      version: "Release 7"
    },
    "sr-latn-cs": {
      language: "Serbian (Latin)",
      location: "Serbia and Montenegro (Former)",
      id: 2074,
      tag: "sr-Latn-CS",
      version: "Release B"
    },
    nso: nso,
    "nso-za": {
      language: "Sesotho sa Leboa",
      location: "South Africa",
      id: 1132,
      tag: "nso-ZA",
      version: "Release E1"
    },
    tn: tn,
    "tn-bw": {
      language: "Setswana",
      location: "Botswana",
      id: 2098,
      tag: "tn-BW",
      version: "Release 8"
    },
    "tn-za": {
      language: "Setswana",
      location: "South Africa",
      id: 1074,
      tag: "tn-ZA",
      version: "Release E1"
    },
    ksb: ksb,
    "ksb-tz": {
      language: "Shambala",
      location: "Tanzania",
      id: 4096,
      tag: "ksb-TZ",
      version: "Release 10"
    },
    sn: sn,
    "sn-latn": {
      language: "Shona",
      location: "Latin",
      id: 4096,
      tag: "sn-Latn",
      version: "Release 8.1"
    },
    "sn-latn-zw": {
      language: "Shona",
      location: "Zimbabwe",
      id: 4096,
      tag: "sn-Latn-ZW",
      version: "Release 8.1"
    },
    sd: sd,
    "sd-arab": {
      language: "Sindhi",
      location: null,
      id: 31833,
      tag: "sd-Arab",
      version: "Release 8"
    },
    "sd-arab-pk": {
      language: "Sindhi",
      location: "Islamic Republic of Pakistan",
      id: 2137,
      tag: "sd-Arab-PK",
      version: "Release 8"
    },
    si: si,
    "si-lk": {
      language: "Sinhala",
      location: "Sri Lanka",
      id: 1115,
      tag: "si-LK",
      version: "Release V"
    },
    sk: sk,
    "sk-sk": {
      language: "Slovak",
      location: "Slovakia",
      id: 1051,
      tag: "sk-SK",
      version: "Release A"
    },
    sl: sl,
    "sl-si": {
      language: "Slovenian",
      location: "Slovenia",
      id: 1060,
      tag: "sl-SI",
      version: "Release A"
    },
    xog: xog,
    "xog-ug": {
      language: "Soga",
      location: "Uganda",
      id: 4096,
      tag: "xog-UG",
      version: "Release 10"
    },
    so: so,
    "so-dj": {
      language: "Somali",
      location: "Djibouti",
      id: 4096,
      tag: "so-DJ",
      version: "Release 10"
    },
    "so-et": {
      language: "Somali",
      location: "Ethiopia",
      id: 4096,
      tag: "so-ET",
      version: "Release 10"
    },
    "so-ke": {
      language: "Somali",
      location: "Kenya",
      id: 4096,
      tag: "so-KE",
      version: "Release 10"
    },
    "so-so": {
      language: "Somali",
      location: "Somalia",
      id: 1143,
      tag: "so-SO",
      version: "Release 8.1"
    },
    st: st,
    "st-za": {
      language: "Sotho",
      location: "South Africa",
      id: 1072,
      tag: "st-ZA",
      version: "Release 8.1"
    },
    nr: nr,
    "nr-za": {
      language: "South Ndebele",
      location: "South Africa",
      id: 4096,
      tag: "nr-ZA",
      version: "Release 10"
    },
    "st-ls": {
      language: "Southern Sotho",
      location: "Lesotho",
      id: 4096,
      tag: "st-LS",
      version: "Release 10"
    },
    es: es,
    "es-ar": {
      language: "Spanish",
      location: "Argentina",
      id: 11274,
      tag: "es-AR",
      version: "Release B"
    },
    "es-bz": {
      language: "Spanish",
      location: "Belize",
      id: 4096,
      tag: "es-BZ",
      version: "Release 10.3"
    },
    "es-ve": {
      language: "Spanish",
      location: "Bolivarian Republic of Venezuela",
      id: 8202,
      tag: "es-VE",
      version: "Release B"
    },
    "es-bo": {
      language: "Spanish",
      location: "Bolivia",
      id: 16394,
      tag: "es-BO",
      version: "Release B"
    },
    "es-br": {
      language: "Spanish",
      location: "Brazil",
      id: 4096,
      tag: "es-BR",
      version: "Release 10.2"
    },
    "es-cl": {
      language: "Spanish",
      location: "Chile",
      id: 13322,
      tag: "es-CL",
      version: "Release B"
    },
    "es-co": {
      language: "Spanish",
      location: "Colombia",
      id: 9226,
      tag: "es-CO",
      version: "Release B"
    },
    "es-cr": {
      language: "Spanish",
      location: "Costa Rica",
      id: 5130,
      tag: "es-CR",
      version: "Release B"
    },
    "es-cu": {
      language: "Spanish",
      location: "Cuba",
      id: 23562,
      tag: "es-CU",
      version: "Release 10"
    },
    "es-do": {
      language: "Spanish",
      location: "Dominican Republic",
      id: 7178,
      tag: "es-DO",
      version: "Release B"
    },
    "es-ec": {
      language: "Spanish",
      location: "Ecuador",
      id: 12298,
      tag: "es-EC",
      version: "Release B"
    },
    "es-sv": {
      language: "Spanish",
      location: "El Salvador",
      id: 17418,
      tag: "es-SV",
      version: "Release B"
    },
    "es-gq": {
      language: "Spanish",
      location: "Equatorial Guinea",
      id: 4096,
      tag: "es-GQ",
      version: "Release 10"
    },
    "es-gt": {
      language: "Spanish",
      location: "Guatemala",
      id: 4106,
      tag: "es-GT",
      version: "Release B"
    },
    "es-hn": {
      language: "Spanish",
      location: "Honduras",
      id: 18442,
      tag: "es-HN",
      version: "Release B"
    },
    "es-419": {
      language: "Spanish",
      location: "Latin America",
      id: 22538,
      tag: "es-419",
      version: "Release 8.1"
    },
    "es-mx": {
      language: "Spanish",
      location: "Mexico",
      id: 2058,
      tag: "es-MX",
      version: "Release A"
    },
    "es-ni": {
      language: "Spanish",
      location: "Nicaragua",
      id: 19466,
      tag: "es-NI",
      version: "Release B"
    },
    "es-pa": {
      language: "Spanish",
      location: "Panama",
      id: 6154,
      tag: "es-PA",
      version: "Release B"
    },
    "es-py": {
      language: "Spanish",
      location: "Paraguay",
      id: 15370,
      tag: "es-PY",
      version: "Release B"
    },
    "es-pe": {
      language: "Spanish",
      location: "Peru",
      id: 10250,
      tag: "es-PE",
      version: "Release B"
    },
    "es-ph": {
      language: "Spanish",
      location: "Philippines",
      id: 4096,
      tag: "es-PH",
      version: "Release 10"
    },
    "es-pr": {
      language: "Spanish",
      location: "Puerto Rico",
      id: 20490,
      tag: "es-PR",
      version: "Release B"
    },
    "es-es_tradnl": {
      language: "Spanish",
      location: "Spain",
      id: 1034,
      tag: "es-ES_tradnl",
      version: "Release A"
    },
    "es-es": {
      language: "Spanish",
      location: "Spain",
      id: 3082,
      tag: "es-ES",
      version: "Release A"
    },
    "es-us": {
      language: "Spanish",
      location: "UnitedStates",
      id: 21514,
      tag: "es-US",
      version: "Release V"
    },
    "es-uy": {
      language: "Spanish",
      location: "Uruguay",
      id: 14346,
      tag: "es-UY",
      version: "Release B"
    },
    zgh: zgh,
    "zgh-tfng-ma": {
      language: "Standard Moroccan Tamazight",
      location: "Morocco",
      id: 4096,
      tag: "zgh-Tfng-MA",
      version: "Release 8.1"
    },
    "zgh-tfng": {
      language: "Standard Moroccan Tamazight",
      location: "Tifinagh",
      id: 4096,
      tag: "zgh-Tfng",
      version: "Release 8.1"
    },
    ss: ss,
    "ss-za": {
      language: "Swati",
      location: "South Africa",
      id: 4096,
      tag: "ss-ZA",
      version: "Release 10"
    },
    "ss-sz": {
      language: "Swati",
      location: "Swaziland",
      id: 4096,
      tag: "ss-SZ",
      version: "Release 10"
    },
    sv: sv,
    "sv-ax": {
      language: "Swedish",
      location: "Åland Islands",
      id: 4096,
      tag: "sv-AX",
      version: "Release 10"
    },
    "sv-fi": {
      language: "Swedish",
      location: "Finland",
      id: 2077,
      tag: "sv-FI",
      version: "Release B"
    },
    "sv-se": {
      language: "Swedish",
      location: "Sweden",
      id: 1053,
      tag: "sv-SE",
      version: "Release A"
    },
    syr: syr,
    "syr-sy": {
      language: "Syriac",
      location: "Syria",
      id: 1114,
      tag: "syr-SY",
      version: "Release D"
    },
    shi: shi,
    "shi-tfng": {
      language: "Tachelhit",
      location: "Tifinagh",
      id: 4096,
      tag: "shi-Tfng",
      version: "Release 10"
    },
    "shi-tfng-ma": {
      language: "Tachelhit",
      location: "Tifinagh, Morocco",
      id: 4096,
      tag: "shi-Tfng-MA",
      version: "Release 10"
    },
    "shi-latn": {
      language: "Tachelhit (Latin)",
      location: null,
      id: 4096,
      tag: "shi-Latn",
      version: "Release 10"
    },
    "shi-latn-ma": {
      language: "Tachelhit (Latin)",
      location: "Morocco",
      id: 4096,
      tag: "shi-Latn-MA",
      version: "Release 10"
    },
    dav: dav,
    "dav-ke": {
      language: "Taita",
      location: "Kenya",
      id: 4096,
      tag: "dav-KE",
      version: "Release 10"
    },
    tg: tg,
    "tg-cyrl": {
      language: "Tajik (Cyrillic)",
      location: null,
      id: 31784,
      tag: "tg-Cyrl",
      version: "Windows 7"
    },
    "tg-cyrl-tj": {
      language: "Tajik (Cyrillic)",
      location: "Tajikistan",
      id: 1064,
      tag: "tg-Cyrl-TJ",
      version: "Release V"
    },
    tzm: tzm,
    "tzm-latn": {
      language: "Tamazight (Latin)",
      location: null,
      id: 31839,
      tag: "tzm-Latn",
      version: "Windows 7"
    },
    "tzm-latn-dz": {
      language: "Tamazight (Latin)",
      location: "Algeria",
      id: 2143,
      tag: "tzm-Latn-DZ",
      version: "Release V"
    },
    ta: ta,
    "ta-in": {
      language: "Tamil",
      location: "India",
      id: 1097,
      tag: "ta-IN",
      version: "Release C"
    },
    "ta-my": {
      language: "Tamil",
      location: "Malaysia",
      id: 4096,
      tag: "ta-MY",
      version: "Release 10"
    },
    "ta-sg": {
      language: "Tamil",
      location: "Singapore",
      id: 4096,
      tag: "ta-SG",
      version: "Release 10"
    },
    "ta-lk": {
      language: "Tamil",
      location: "Sri Lanka",
      id: 2121,
      tag: "ta-LK",
      version: "Release 8"
    },
    twq: twq,
    "twq-ne": {
      language: "Tasawaq",
      location: "Niger",
      id: 4096,
      tag: "twq-NE",
      version: "Release 10"
    },
    tt: tt,
    "tt-ru": {
      language: "Tatar",
      location: "Russia",
      id: 1092,
      tag: "tt-RU",
      version: "Release D"
    },
    te: te,
    "te-in": {
      language: "Telugu",
      location: "India",
      id: 1098,
      tag: "te-IN",
      version: "Release D"
    },
    teo: teo,
    "teo-ke": {
      language: "Teso",
      location: "Kenya",
      id: 4096,
      tag: "teo-KE",
      version: "Release 10"
    },
    "teo-ug": {
      language: "Teso",
      location: "Uganda",
      id: 4096,
      tag: "teo-UG",
      version: "Release 10"
    },
    th: th,
    "th-th": {
      language: "Thai",
      location: "Thailand",
      id: 1054,
      tag: "th-TH",
      version: "Release B"
    },
    bo: bo,
    "bo-in": {
      language: "Tibetan",
      location: "India",
      id: 4096,
      tag: "bo-IN",
      version: "Release 10"
    },
    "bo-cn": {
      language: "Tibetan",
      location: "People's Republic of China",
      id: 1105,
      tag: "bo-CN",
      version: "Release V"
    },
    tig: tig,
    "tig-er": {
      language: "Tigre",
      location: "Eritrea",
      id: 4096,
      tag: "tig-ER",
      version: "Release 10"
    },
    ti: ti,
    "ti-er": {
      language: "Tigrinya",
      location: "Eritrea",
      id: 2163,
      tag: "ti-ER",
      version: "Release 8"
    },
    "ti-et": {
      language: "Tigrinya",
      location: "Ethiopia",
      id: 1139,
      tag: "ti-ET",
      version: "Release 8"
    },
    to: to,
    "to-to": {
      language: "Tongan",
      location: "Tonga",
      id: 4096,
      tag: "to-TO",
      version: "Release 10"
    },
    ts: ts,
    "ts-za": {
      language: "Tsonga",
      location: "South Africa",
      id: 1073,
      tag: "ts-ZA",
      version: "Release 8.1"
    },
    tr: tr,
    "tr-cy": {
      language: "Turkish",
      location: "Cyprus",
      id: 4096,
      tag: "tr-CY",
      version: "Release 10"
    },
    "tr-tr": {
      language: "Turkish",
      location: "Turkey",
      id: 1055,
      tag: "tr-TR",
      version: "Release A"
    },
    tk: tk,
    "tk-tm": {
      language: "Turkmen",
      location: "Turkmenistan",
      id: 1090,
      tag: "tk-TM",
      version: "Release V"
    },
    uk: uk,
    "uk-ua": {
      language: "Ukrainian",
      location: "Ukraine",
      id: 1058,
      tag: "uk-UA",
      version: "Release B"
    },
    hsb: hsb,
    "hsb-de": {
      language: "Upper Sorbian",
      location: "Germany",
      id: 1070,
      tag: "hsb-DE",
      version: "Release V"
    },
    ur: ur,
    "ur-in": {
      language: "Urdu",
      location: "India",
      id: 2080,
      tag: "ur-IN",
      version: "Release 8.1"
    },
    "ur-pk": {
      language: "Urdu",
      location: "Islamic Republic of Pakistan",
      id: 1056,
      tag: "ur-PK",
      version: "Release C"
    },
    ug: ug,
    "ug-cn": {
      language: "Uyghur",
      location: "People's Republic of China",
      id: 1152,
      tag: "ug-CN",
      version: "Release V"
    },
    "uz-arab": {
      language: "Uzbek",
      location: "Perso-Arabic",
      id: 4096,
      tag: "uz-Arab",
      version: "Release 10"
    },
    "uz-arab-af": {
      language: "Uzbek",
      location: "Perso-Arabic, Afghanistan",
      id: 4096,
      tag: "uz-Arab-AF",
      version: "Release 10"
    },
    "uz-cyrl": {
      language: "Uzbek (Cyrillic)",
      location: null,
      id: 30787,
      tag: "uz-Cyrl",
      version: "Windows 7"
    },
    "uz-cyrl-uz": {
      language: "Uzbek (Cyrillic)",
      location: "Uzbekistan",
      id: 2115,
      tag: "uz-Cyrl-UZ",
      version: "Release C"
    },
    uz: uz,
    "uz-latn": {
      language: "Uzbek (Latin)",
      location: null,
      id: 31811,
      tag: "uz-Latn",
      version: "Windows7"
    },
    "uz-latn-uz": {
      language: "Uzbek (Latin)",
      location: "Uzbekistan",
      id: 1091,
      tag: "uz-Latn-UZ",
      version: "Release C"
    },
    vai: vai,
    "vai-vaii": {
      language: "Vai",
      location: null,
      id: 4096,
      tag: "vai-Vaii",
      version: "Release 10"
    },
    "vai-vaii-lr": {
      language: "Vai",
      location: "Liberia",
      id: 4096,
      tag: "vai-Vaii-LR",
      version: "Release 10"
    },
    "vai-latn-lr": {
      language: "Vai (Latin)",
      location: "Liberia",
      id: 4096,
      tag: "vai-Latn-LR",
      version: "Release 10"
    },
    "vai-latn": {
      language: "Vai (Latin)",
      location: null,
      id: 4096,
      tag: "vai-Latn",
      version: "Release 10"
    },
    "ca-es-": {
      language: "Valencian",
      location: "Spain",
      id: 2051,
      tag: "ca-ES-",
      version: "Release 8"
    },
    ve: ve,
    "ve-za": {
      language: "Venda",
      location: "South Africa",
      id: 1075,
      tag: "ve-ZA",
      version: "Release 10"
    },
    vi: vi,
    "vi-vn": {
      language: "Vietnamese",
      location: "Vietnam",
      id: 1066,
      tag: "vi-VN",
      version: "Release B"
    },
    vo: vo,
    "vo-001": {
      language: "Volapük",
      location: "World",
      id: 4096,
      tag: "vo-001",
      version: "Release 10"
    },
    vun: vun,
    "vun-tz": {
      language: "Vunjo",
      location: "Tanzania",
      id: 4096,
      tag: "vun-TZ",
      version: "Release 10"
    },
    wae: wae,
    "wae-ch": {
      language: "Walser",
      location: "Switzerland",
      id: 4096,
      tag: "wae-CH",
      version: "Release 10"
    },
    cy: cy,
    "cy-gb": {
      language: "Welsh",
      location: "United Kingdom",
      id: 1106,
      tag: "cy-GB",
      version: "ReleaseE1"
    },
    wal: wal,
    "wal-et": {
      language: "Wolaytta",
      location: "Ethiopia",
      id: 4096,
      tag: "wal-ET",
      version: "Release 10"
    },
    wo: wo,
    "wo-sn": {
      language: "Wolof",
      location: "Senegal",
      id: 1160,
      tag: "wo-SN",
      version: "Release V"
    },
    xh: xh,
    "xh-za": {
      language: "Xhosa",
      location: "South Africa",
      id: 1076,
      tag: "xh-ZA",
      version: "Release E1"
    },
    yav: yav,
    "yav-cm": {
      language: "Yangben",
      location: "Cameroon",
      id: 4096,
      tag: "yav-CM",
      version: "Release 10"
    },
    ii: ii,
    "ii-cn": {
      language: "Yi",
      location: "People's Republic of China",
      id: 1144,
      tag: "ii-CN",
      version: "Release V"
    },
    yo: yo,
    "yo-bj": {
      language: "Yoruba",
      location: "Benin",
      id: 4096,
      tag: "yo-BJ",
      version: "Release 10"
    },
    "yo-ng": {
      language: "Yoruba",
      location: "Nigeria",
      id: 1130,
      tag: "yo-NG",
      version: "Release V"
    },
    dje: dje,
    "dje-ne": {
      language: "Zarma",
      location: "Niger",
      id: 4096,
      tag: "dje-NE",
      version: "Release 10"
    },
    zu: zu,
    "zu-za": {
      language: "Zulu",
      location: "South Africa",
      id: 1077,
      tag: "zu-ZA",
      version: "Release E1"
    }
  };
  var Abkhazian = {
    name: "Abkhazian",
    names: ["Abkhazian"],
    "iso639-2": "abk",
    "iso639-1": "ab"
  };
  var Achinese = {
    name: "Achinese",
    names: ["Achinese"],
    "iso639-2": "ace",
    "iso639-1": null
  };
  var Acoli = {
    name: "Acoli",
    names: ["Acoli"],
    "iso639-2": "ach",
    "iso639-1": null
  };
  var Adangme = {
    name: "Adangme",
    names: ["Adangme"],
    "iso639-2": "ada",
    "iso639-1": null
  };
  var Adygei = {
    name: "Adygei",
    names: ["Adyghe", "Adygei"],
    "iso639-2": "ady",
    "iso639-1": null
  };
  var Adyghe = {
    name: "Adyghe",
    names: ["Adyghe", "Adygei"],
    "iso639-2": "ady",
    "iso639-1": null
  };
  var Afar = {
    name: "Afar",
    names: ["Afar"],
    "iso639-2": "aar",
    "iso639-1": "aa"
  };
  var Afrihili = {
    name: "Afrihili",
    names: ["Afrihili"],
    "iso639-2": "afh",
    "iso639-1": null
  };
  var Afrikaans = {
    name: "Afrikaans",
    names: ["Afrikaans"],
    "iso639-2": "afr",
    "iso639-1": "af"
  };
  var Ainu = {
    name: "Ainu",
    names: ["Ainu"],
    "iso639-2": "ain",
    "iso639-1": null
  };
  var Akan = {
    name: "Akan",
    names: ["Akan"],
    "iso639-2": "aka",
    "iso639-1": "ak"
  };
  var Akkadian = {
    name: "Akkadian",
    names: ["Akkadian"],
    "iso639-2": "akk",
    "iso639-1": null
  };
  var Albanian = {
    name: "Albanian",
    names: ["Albanian"],
    "iso639-2": "alb/sqi",
    "iso639-1": "sq"
  };
  var Alemannic = {
    name: "Alemannic",
    names: ["Swiss German", "Alemannic", "Alsatian"],
    "iso639-2": "gsw",
    "iso639-1": null
  };
  var Aleut = {
    name: "Aleut",
    names: ["Aleut"],
    "iso639-2": "ale",
    "iso639-1": null
  };
  var Alsatian = {
    name: "Alsatian",
    names: ["Swiss German", "Alemannic", "Alsatian"],
    "iso639-2": "gsw",
    "iso639-1": null
  };
  var Amharic = {
    name: "Amharic",
    names: ["Amharic"],
    "iso639-2": "amh",
    "iso639-1": "am"
  };
  var Angika = {
    name: "Angika",
    names: ["Angika"],
    "iso639-2": "anp",
    "iso639-1": null
  };
  var Arabic = {
    name: "Arabic",
    names: ["Arabic"],
    "iso639-2": "ara",
    "iso639-1": "ar"
  };
  var Aragonese = {
    name: "Aragonese",
    names: ["Aragonese"],
    "iso639-2": "arg",
    "iso639-1": "an"
  };
  var Arapaho = {
    name: "Arapaho",
    names: ["Arapaho"],
    "iso639-2": "arp",
    "iso639-1": null
  };
  var Arawak = {
    name: "Arawak",
    names: ["Arawak"],
    "iso639-2": "arw",
    "iso639-1": null
  };
  var Armenian = {
    name: "Armenian",
    names: ["Armenian"],
    "iso639-2": "arm/hye",
    "iso639-1": "hy"
  };
  var Aromanian = {
    name: "Aromanian",
    names: ["Aromanian", "Arumanian", "Macedo-Romanian"],
    "iso639-2": "rup",
    "iso639-1": null
  };
  var Arumanian = {
    name: "Arumanian",
    names: ["Aromanian", "Arumanian", "Macedo-Romanian"],
    "iso639-2": "rup",
    "iso639-1": null
  };
  var Assamese = {
    name: "Assamese",
    names: ["Assamese"],
    "iso639-2": "asm",
    "iso639-1": "as"
  };
  var Asturian = {
    name: "Asturian",
    names: ["Asturian", "Bable", "Leonese", "Asturleonese"],
    "iso639-2": "ast",
    "iso639-1": null
  };
  var Asturleonese = {
    name: "Asturleonese",
    names: ["Asturian", "Bable", "Leonese", "Asturleonese"],
    "iso639-2": "ast",
    "iso639-1": null
  };
  var Avaric = {
    name: "Avaric",
    names: ["Avaric"],
    "iso639-2": "ava",
    "iso639-1": "av"
  };
  var Avestan = {
    name: "Avestan",
    names: ["Avestan"],
    "iso639-2": "ave",
    "iso639-1": "ae"
  };
  var Awadhi = {
    name: "Awadhi",
    names: ["Awadhi"],
    "iso639-2": "awa",
    "iso639-1": null
  };
  var Aymara = {
    name: "Aymara",
    names: ["Aymara"],
    "iso639-2": "aym",
    "iso639-1": "ay"
  };
  var Azerbaijani = {
    name: "Azerbaijani",
    names: ["Azerbaijani"],
    "iso639-2": "aze",
    "iso639-1": "az"
  };
  var Bable = {
    name: "Bable",
    names: ["Asturian", "Bable", "Leonese", "Asturleonese"],
    "iso639-2": "ast",
    "iso639-1": null
  };
  var Balinese = {
    name: "Balinese",
    names: ["Balinese"],
    "iso639-2": "ban",
    "iso639-1": null
  };
  var Baluchi = {
    name: "Baluchi",
    names: ["Baluchi"],
    "iso639-2": "bal",
    "iso639-1": null
  };
  var Bambara = {
    name: "Bambara",
    names: ["Bambara"],
    "iso639-2": "bam",
    "iso639-1": "bm"
  };
  var Basa = {
    name: "Basa",
    names: ["Basa"],
    "iso639-2": "bas",
    "iso639-1": null
  };
  var Bashkir = {
    name: "Bashkir",
    names: ["Bashkir"],
    "iso639-2": "bak",
    "iso639-1": "ba"
  };
  var Basque = {
    name: "Basque",
    names: ["Basque"],
    "iso639-2": "baq/eus",
    "iso639-1": "eu"
  };
  var Bedawiyet = {
    name: "Bedawiyet",
    names: ["Beja", "Bedawiyet"],
    "iso639-2": "bej",
    "iso639-1": null
  };
  var Beja = {
    name: "Beja",
    names: ["Beja", "Bedawiyet"],
    "iso639-2": "bej",
    "iso639-1": null
  };
  var Belarusian = {
    name: "Belarusian",
    names: ["Belarusian"],
    "iso639-2": "bel",
    "iso639-1": "be"
  };
  var Bemba = {
    name: "Bemba",
    names: ["Bemba"],
    "iso639-2": "bem",
    "iso639-1": null
  };
  var Bengali = {
    name: "Bengali",
    names: ["Bengali"],
    "iso639-2": "ben",
    "iso639-1": "bn"
  };
  var Bhojpuri = {
    name: "Bhojpuri",
    names: ["Bhojpuri"],
    "iso639-2": "bho",
    "iso639-1": null
  };
  var Bikol = {
    name: "Bikol",
    names: ["Bikol"],
    "iso639-2": "bik",
    "iso639-1": null
  };
  var Bilin = {
    name: "Bilin",
    names: ["Blin", "Bilin"],
    "iso639-2": "byn",
    "iso639-1": null
  };
  var Bini = {
    name: "Bini",
    names: ["Bini", "Edo"],
    "iso639-2": "bin",
    "iso639-1": null
  };
  var Bislama = {
    name: "Bislama",
    names: ["Bislama"],
    "iso639-2": "bis",
    "iso639-1": "bi"
  };
  var Blin = {
    name: "Blin",
    names: ["Blin", "Bilin"],
    "iso639-2": "byn",
    "iso639-1": null
  };
  var Bliss = {
    name: "Bliss",
    names: ["Blissymbols", "Blissymbolics", "Bliss"],
    "iso639-2": "zbl",
    "iso639-1": null
  };
  var Blissymbolics = {
    name: "Blissymbolics",
    names: ["Blissymbols", "Blissymbolics", "Bliss"],
    "iso639-2": "zbl",
    "iso639-1": null
  };
  var Blissymbols = {
    name: "Blissymbols",
    names: ["Blissymbols", "Blissymbolics", "Bliss"],
    "iso639-2": "zbl",
    "iso639-1": null
  };
  var Bosnian = {
    name: "Bosnian",
    names: ["Bosnian"],
    "iso639-2": "bos",
    "iso639-1": "bs"
  };
  var Braj = {
    name: "Braj",
    names: ["Braj"],
    "iso639-2": "bra",
    "iso639-1": null
  };
  var Breton = {
    name: "Breton",
    names: ["Breton"],
    "iso639-2": "bre",
    "iso639-1": "br"
  };
  var Buginese = {
    name: "Buginese",
    names: ["Buginese"],
    "iso639-2": "bug",
    "iso639-1": null
  };
  var Bulgarian = {
    name: "Bulgarian",
    names: ["Bulgarian"],
    "iso639-2": "bul",
    "iso639-1": "bg"
  };
  var Buriat = {
    name: "Buriat",
    names: ["Buriat"],
    "iso639-2": "bua",
    "iso639-1": null
  };
  var Burmese = {
    name: "Burmese",
    names: ["Burmese"],
    "iso639-2": "bur/mya",
    "iso639-1": "my"
  };
  var Caddo = {
    name: "Caddo",
    names: ["Caddo"],
    "iso639-2": "cad",
    "iso639-1": null
  };
  var Castilian = {
    name: "Castilian",
    names: ["Spanish", "Castilian"],
    "iso639-2": "spa",
    "iso639-1": "es"
  };
  var Catalan = {
    name: "Catalan",
    names: ["Catalan", "Valencian"],
    "iso639-2": "cat",
    "iso639-1": "ca"
  };
  var Cebuano = {
    name: "Cebuano",
    names: ["Cebuano"],
    "iso639-2": "ceb",
    "iso639-1": null
  };
  var Chagatai = {
    name: "Chagatai",
    names: ["Chagatai"],
    "iso639-2": "chg",
    "iso639-1": null
  };
  var Chamorro = {
    name: "Chamorro",
    names: ["Chamorro"],
    "iso639-2": "cha",
    "iso639-1": "ch"
  };
  var Chechen = {
    name: "Chechen",
    names: ["Chechen"],
    "iso639-2": "che",
    "iso639-1": "ce"
  };
  var Cherokee = {
    name: "Cherokee",
    names: ["Cherokee"],
    "iso639-2": "chr",
    "iso639-1": null
  };
  var Chewa = {
    name: "Chewa",
    names: ["Chichewa", "Chewa", "Nyanja"],
    "iso639-2": "nya",
    "iso639-1": "ny"
  };
  var Cheyenne = {
    name: "Cheyenne",
    names: ["Cheyenne"],
    "iso639-2": "chy",
    "iso639-1": null
  };
  var Chibcha = {
    name: "Chibcha",
    names: ["Chibcha"],
    "iso639-2": "chb",
    "iso639-1": null
  };
  var Chichewa = {
    name: "Chichewa",
    names: ["Chichewa", "Chewa", "Nyanja"],
    "iso639-2": "nya",
    "iso639-1": "ny"
  };
  var Chinese = {
    name: "Chinese",
    names: ["Chinese"],
    "iso639-2": "chi/zho",
    "iso639-1": "zh"
  };
  var Chipewyan = {
    name: "Chipewyan",
    names: ["Chipewyan", "Dene Suline"],
    "iso639-2": "chp",
    "iso639-1": null
  };
  var Choctaw = {
    name: "Choctaw",
    names: ["Choctaw"],
    "iso639-2": "cho",
    "iso639-1": null
  };
  var Chuang = {
    name: "Chuang",
    names: ["Zhuang", "Chuang"],
    "iso639-2": "zha",
    "iso639-1": "za"
  };
  var Chuukese = {
    name: "Chuukese",
    names: ["Chuukese"],
    "iso639-2": "chk",
    "iso639-1": null
  };
  var Chuvash = {
    name: "Chuvash",
    names: ["Chuvash"],
    "iso639-2": "chv",
    "iso639-1": "cv"
  };
  var Coptic = {
    name: "Coptic",
    names: ["Coptic"],
    "iso639-2": "cop",
    "iso639-1": null
  };
  var Cornish = {
    name: "Cornish",
    names: ["Cornish"],
    "iso639-2": "cor",
    "iso639-1": "kw"
  };
  var Corsican = {
    name: "Corsican",
    names: ["Corsican"],
    "iso639-2": "cos",
    "iso639-1": "co"
  };
  var Cree = {
    name: "Cree",
    names: ["Cree"],
    "iso639-2": "cre",
    "iso639-1": "cr"
  };
  var Creek = {
    name: "Creek",
    names: ["Creek"],
    "iso639-2": "mus",
    "iso639-1": null
  };
  var Croatian = {
    name: "Croatian",
    names: ["Croatian"],
    "iso639-2": "hrv",
    "iso639-1": "hr"
  };
  var Czech = {
    name: "Czech",
    names: ["Czech"],
    "iso639-2": "cze/ces",
    "iso639-1": "cs"
  };
  var Dakota = {
    name: "Dakota",
    names: ["Dakota"],
    "iso639-2": "dak",
    "iso639-1": null
  };
  var Danish = {
    name: "Danish",
    names: ["Danish"],
    "iso639-2": "dan",
    "iso639-1": "da"
  };
  var Dargwa = {
    name: "Dargwa",
    names: ["Dargwa"],
    "iso639-2": "dar",
    "iso639-1": null
  };
  var Delaware = {
    name: "Delaware",
    names: ["Delaware"],
    "iso639-2": "del",
    "iso639-1": null
  };
  var Dhivehi = {
    name: "Dhivehi",
    names: ["Divehi", "Dhivehi", "Maldivian"],
    "iso639-2": "div",
    "iso639-1": "dv"
  };
  var Dimili = {
    name: "Dimili",
    names: ["Zaza", "Dimili", "Dimli", "Kirdki", "Kirmanjki", "Zazaki"],
    "iso639-2": "zza",
    "iso639-1": null
  };
  var Dimli = {
    name: "Dimli",
    names: ["Zaza", "Dimili", "Dimli", "Kirdki", "Kirmanjki", "Zazaki"],
    "iso639-2": "zza",
    "iso639-1": null
  };
  var Dinka = {
    name: "Dinka",
    names: ["Dinka"],
    "iso639-2": "din",
    "iso639-1": null
  };
  var Divehi = {
    name: "Divehi",
    names: ["Divehi", "Dhivehi", "Maldivian"],
    "iso639-2": "div",
    "iso639-1": "dv"
  };
  var Dogri = {
    name: "Dogri",
    names: ["Dogri"],
    "iso639-2": "doi",
    "iso639-1": null
  };
  var Dogrib = {
    name: "Dogrib",
    names: ["Dogrib"],
    "iso639-2": "dgr",
    "iso639-1": null
  };
  var Duala = {
    name: "Duala",
    names: ["Duala"],
    "iso639-2": "dua",
    "iso639-1": null
  };
  var Dutch = {
    name: "Dutch",
    names: ["Dutch", "Flemish"],
    "iso639-2": "dut/nld",
    "iso639-1": "nl"
  };
  var Dyula = {
    name: "Dyula",
    names: ["Dyula"],
    "iso639-2": "dyu",
    "iso639-1": null
  };
  var Dzongkha = {
    name: "Dzongkha",
    names: ["Dzongkha"],
    "iso639-2": "dzo",
    "iso639-1": "dz"
  };
  var Edo = {
    name: "Edo",
    names: ["Bini", "Edo"],
    "iso639-2": "bin",
    "iso639-1": null
  };
  var Efik = {
    name: "Efik",
    names: ["Efik"],
    "iso639-2": "efi",
    "iso639-1": null
  };
  var Ekajuk = {
    name: "Ekajuk",
    names: ["Ekajuk"],
    "iso639-2": "eka",
    "iso639-1": null
  };
  var Elamite = {
    name: "Elamite",
    names: ["Elamite"],
    "iso639-2": "elx",
    "iso639-1": null
  };
  var English = {
    name: "English",
    names: ["English"],
    "iso639-2": "eng",
    "iso639-1": "en"
  };
  var Erzya = {
    name: "Erzya",
    names: ["Erzya"],
    "iso639-2": "myv",
    "iso639-1": null
  };
  var Esperanto = {
    name: "Esperanto",
    names: ["Esperanto"],
    "iso639-2": "epo",
    "iso639-1": "eo"
  };
  var Estonian = {
    name: "Estonian",
    names: ["Estonian"],
    "iso639-2": "est",
    "iso639-1": "et"
  };
  var Ewe = {
    name: "Ewe",
    names: ["Ewe"],
    "iso639-2": "ewe",
    "iso639-1": "ee"
  };
  var Ewondo = {
    name: "Ewondo",
    names: ["Ewondo"],
    "iso639-2": "ewo",
    "iso639-1": null
  };
  var Fang = {
    name: "Fang",
    names: ["Fang"],
    "iso639-2": "fan",
    "iso639-1": null
  };
  var Fanti = {
    name: "Fanti",
    names: ["Fanti"],
    "iso639-2": "fat",
    "iso639-1": null
  };
  var Faroese = {
    name: "Faroese",
    names: ["Faroese"],
    "iso639-2": "fao",
    "iso639-1": "fo"
  };
  var Fijian = {
    name: "Fijian",
    names: ["Fijian"],
    "iso639-2": "fij",
    "iso639-1": "fj"
  };
  var Filipino = {
    name: "Filipino",
    names: ["Filipino", "Pilipino"],
    "iso639-2": "fil",
    "iso639-1": null
  };
  var Finnish = {
    name: "Finnish",
    names: ["Finnish"],
    "iso639-2": "fin",
    "iso639-1": "fi"
  };
  var Flemish = {
    name: "Flemish",
    names: ["Dutch", "Flemish"],
    "iso639-2": "dut/nld",
    "iso639-1": "nl"
  };
  var Fon = {
    name: "Fon",
    names: ["Fon"],
    "iso639-2": "fon",
    "iso639-1": null
  };
  var French = {
    name: "French",
    names: ["French"],
    "iso639-2": "fre/fra",
    "iso639-1": "fr"
  };
  var Friulian = {
    name: "Friulian",
    names: ["Friulian"],
    "iso639-2": "fur",
    "iso639-1": null
  };
  var Fulah = {
    name: "Fulah",
    names: ["Fulah"],
    "iso639-2": "ful",
    "iso639-1": "ff"
  };
  var Ga = {
    name: "Ga",
    names: ["Ga"],
    "iso639-2": "gaa",
    "iso639-1": null
  };
  var Gaelic = {
    name: "Gaelic",
    names: ["Gaelic", "Scottish Gaelic"],
    "iso639-2": "gla",
    "iso639-1": "gd"
  };
  var Galician = {
    name: "Galician",
    names: ["Galician"],
    "iso639-2": "glg",
    "iso639-1": "gl"
  };
  var Ganda = {
    name: "Ganda",
    names: ["Ganda"],
    "iso639-2": "lug",
    "iso639-1": "lg"
  };
  var Gayo = {
    name: "Gayo",
    names: ["Gayo"],
    "iso639-2": "gay",
    "iso639-1": null
  };
  var Gbaya = {
    name: "Gbaya",
    names: ["Gbaya"],
    "iso639-2": "gba",
    "iso639-1": null
  };
  var Geez = {
    name: "Geez",
    names: ["Geez"],
    "iso639-2": "gez",
    "iso639-1": null
  };
  var Georgian = {
    name: "Georgian",
    names: ["Georgian"],
    "iso639-2": "geo/kat",
    "iso639-1": "ka"
  };
  var German = {
    name: "German",
    names: ["German"],
    "iso639-2": "ger/deu",
    "iso639-1": "de"
  };
  var Gikuyu = {
    name: "Gikuyu",
    names: ["Kikuyu", "Gikuyu"],
    "iso639-2": "kik",
    "iso639-1": "ki"
  };
  var Gilbertese = {
    name: "Gilbertese",
    names: ["Gilbertese"],
    "iso639-2": "gil",
    "iso639-1": null
  };
  var Gondi = {
    name: "Gondi",
    names: ["Gondi"],
    "iso639-2": "gon",
    "iso639-1": null
  };
  var Gorontalo = {
    name: "Gorontalo",
    names: ["Gorontalo"],
    "iso639-2": "gor",
    "iso639-1": null
  };
  var Gothic = {
    name: "Gothic",
    names: ["Gothic"],
    "iso639-2": "got",
    "iso639-1": null
  };
  var Grebo = {
    name: "Grebo",
    names: ["Grebo"],
    "iso639-2": "grb",
    "iso639-1": null
  };
  var Greenlandic = {
    name: "Greenlandic",
    names: ["Kalaallisut", "Greenlandic"],
    "iso639-2": "kal",
    "iso639-1": "kl"
  };
  var Guarani = {
    name: "Guarani",
    names: ["Guarani"],
    "iso639-2": "grn",
    "iso639-1": "gn"
  };
  var Gujarati = {
    name: "Gujarati",
    names: ["Gujarati"],
    "iso639-2": "guj",
    "iso639-1": "gu"
  };
  var Haida = {
    name: "Haida",
    names: ["Haida"],
    "iso639-2": "hai",
    "iso639-1": null
  };
  var Haitian = {
    name: "Haitian",
    names: ["Haitian", "Haitian Creole"],
    "iso639-2": "hat",
    "iso639-1": "ht"
  };
  var Hausa = {
    name: "Hausa",
    names: ["Hausa"],
    "iso639-2": "hau",
    "iso639-1": "ha"
  };
  var Hawaiian = {
    name: "Hawaiian",
    names: ["Hawaiian"],
    "iso639-2": "haw",
    "iso639-1": null
  };
  var Hebrew = {
    name: "Hebrew",
    names: ["Hebrew"],
    "iso639-2": "heb",
    "iso639-1": "he"
  };
  var Herero = {
    name: "Herero",
    names: ["Herero"],
    "iso639-2": "her",
    "iso639-1": "hz"
  };
  var Hiligaynon = {
    name: "Hiligaynon",
    names: ["Hiligaynon"],
    "iso639-2": "hil",
    "iso639-1": null
  };
  var Hindi = {
    name: "Hindi",
    names: ["Hindi"],
    "iso639-2": "hin",
    "iso639-1": "hi"
  };
  var Hittite = {
    name: "Hittite",
    names: ["Hittite"],
    "iso639-2": "hit",
    "iso639-1": null
  };
  var Hmong = {
    name: "Hmong",
    names: ["Hmong", "Mong"],
    "iso639-2": "hmn",
    "iso639-1": null
  };
  var Hungarian = {
    name: "Hungarian",
    names: ["Hungarian"],
    "iso639-2": "hun",
    "iso639-1": "hu"
  };
  var Hupa = {
    name: "Hupa",
    names: ["Hupa"],
    "iso639-2": "hup",
    "iso639-1": null
  };
  var Iban = {
    name: "Iban",
    names: ["Iban"],
    "iso639-2": "iba",
    "iso639-1": null
  };
  var Icelandic = {
    name: "Icelandic",
    names: ["Icelandic"],
    "iso639-2": "ice/isl",
    "iso639-1": "is"
  };
  var Ido = {
    name: "Ido",
    names: ["Ido"],
    "iso639-2": "ido",
    "iso639-1": "io"
  };
  var Igbo = {
    name: "Igbo",
    names: ["Igbo"],
    "iso639-2": "ibo",
    "iso639-1": "ig"
  };
  var Iloko = {
    name: "Iloko",
    names: ["Iloko"],
    "iso639-2": "ilo",
    "iso639-1": null
  };
  var Indonesian = {
    name: "Indonesian",
    names: ["Indonesian"],
    "iso639-2": "ind",
    "iso639-1": "id"
  };
  var Ingush = {
    name: "Ingush",
    names: ["Ingush"],
    "iso639-2": "inh",
    "iso639-1": null
  };
  var Interlingue = {
    name: "Interlingue",
    names: ["Interlingue", "Occidental"],
    "iso639-2": "ile",
    "iso639-1": "ie"
  };
  var Inuktitut = {
    name: "Inuktitut",
    names: ["Inuktitut"],
    "iso639-2": "iku",
    "iso639-1": "iu"
  };
  var Inupiaq = {
    name: "Inupiaq",
    names: ["Inupiaq"],
    "iso639-2": "ipk",
    "iso639-1": "ik"
  };
  var Irish = {
    name: "Irish",
    names: ["Irish"],
    "iso639-2": "gle",
    "iso639-1": "ga"
  };
  var Italian = {
    name: "Italian",
    names: ["Italian"],
    "iso639-2": "ita",
    "iso639-1": "it"
  };
  var Japanese = {
    name: "Japanese",
    names: ["Japanese"],
    "iso639-2": "jpn",
    "iso639-1": "ja"
  };
  var Javanese = {
    name: "Javanese",
    names: ["Javanese"],
    "iso639-2": "jav",
    "iso639-1": "jv"
  };
  var Jingpho = {
    name: "Jingpho",
    names: ["Kachin", "Jingpho"],
    "iso639-2": "kac",
    "iso639-1": null
  };
  var Kabardian = {
    name: "Kabardian",
    names: ["Kabardian"],
    "iso639-2": "kbd",
    "iso639-1": null
  };
  var Kabyle = {
    name: "Kabyle",
    names: ["Kabyle"],
    "iso639-2": "kab",
    "iso639-1": null
  };
  var Kachin = {
    name: "Kachin",
    names: ["Kachin", "Jingpho"],
    "iso639-2": "kac",
    "iso639-1": null
  };
  var Kalaallisut = {
    name: "Kalaallisut",
    names: ["Kalaallisut", "Greenlandic"],
    "iso639-2": "kal",
    "iso639-1": "kl"
  };
  var Kalmyk = {
    name: "Kalmyk",
    names: ["Kalmyk", "Oirat"],
    "iso639-2": "xal",
    "iso639-1": null
  };
  var Kamba = {
    name: "Kamba",
    names: ["Kamba"],
    "iso639-2": "kam",
    "iso639-1": null
  };
  var Kannada = {
    name: "Kannada",
    names: ["Kannada"],
    "iso639-2": "kan",
    "iso639-1": "kn"
  };
  var Kanuri = {
    name: "Kanuri",
    names: ["Kanuri"],
    "iso639-2": "kau",
    "iso639-1": "kr"
  };
  var Kapampangan = {
    name: "Kapampangan",
    names: ["Pampanga", "Kapampangan"],
    "iso639-2": "pam",
    "iso639-1": null
  };
  var Karelian = {
    name: "Karelian",
    names: ["Karelian"],
    "iso639-2": "krl",
    "iso639-1": null
  };
  var Kashmiri = {
    name: "Kashmiri",
    names: ["Kashmiri"],
    "iso639-2": "kas",
    "iso639-1": "ks"
  };
  var Kashubian = {
    name: "Kashubian",
    names: ["Kashubian"],
    "iso639-2": "csb",
    "iso639-1": null
  };
  var Kawi = {
    name: "Kawi",
    names: ["Kawi"],
    "iso639-2": "kaw",
    "iso639-1": null
  };
  var Kazakh = {
    name: "Kazakh",
    names: ["Kazakh"],
    "iso639-2": "kaz",
    "iso639-1": "kk"
  };
  var Khasi = {
    name: "Khasi",
    names: ["Khasi"],
    "iso639-2": "kha",
    "iso639-1": null
  };
  var Khotanese = {
    name: "Khotanese",
    names: ["Khotanese", "Sakan"],
    "iso639-2": "kho",
    "iso639-1": null
  };
  var Kikuyu = {
    name: "Kikuyu",
    names: ["Kikuyu", "Gikuyu"],
    "iso639-2": "kik",
    "iso639-1": "ki"
  };
  var Kimbundu = {
    name: "Kimbundu",
    names: ["Kimbundu"],
    "iso639-2": "kmb",
    "iso639-1": null
  };
  var Kinyarwanda = {
    name: "Kinyarwanda",
    names: ["Kinyarwanda"],
    "iso639-2": "kin",
    "iso639-1": "rw"
  };
  var Kirdki = {
    name: "Kirdki",
    names: ["Zaza", "Dimili", "Dimli", "Kirdki", "Kirmanjki", "Zazaki"],
    "iso639-2": "zza",
    "iso639-1": null
  };
  var Kirghiz = {
    name: "Kirghiz",
    names: ["Kirghiz", "Kyrgyz"],
    "iso639-2": "kir",
    "iso639-1": "ky"
  };
  var Kirmanjki = {
    name: "Kirmanjki",
    names: ["Zaza", "Dimili", "Dimli", "Kirdki", "Kirmanjki", "Zazaki"],
    "iso639-2": "zza",
    "iso639-1": null
  };
  var Klingon = {
    name: "Klingon",
    names: ["Klingon", "tlhIngan-Hol"],
    "iso639-2": "tlh",
    "iso639-1": null
  };
  var Komi = {
    name: "Komi",
    names: ["Komi"],
    "iso639-2": "kom",
    "iso639-1": "kv"
  };
  var Kongo = {
    name: "Kongo",
    names: ["Kongo"],
    "iso639-2": "kon",
    "iso639-1": "kg"
  };
  var Konkani = {
    name: "Konkani",
    names: ["Konkani"],
    "iso639-2": "kok",
    "iso639-1": null
  };
  var Korean = {
    name: "Korean",
    names: ["Korean"],
    "iso639-2": "kor",
    "iso639-1": "ko"
  };
  var Kosraean = {
    name: "Kosraean",
    names: ["Kosraean"],
    "iso639-2": "kos",
    "iso639-1": null
  };
  var Kpelle = {
    name: "Kpelle",
    names: ["Kpelle"],
    "iso639-2": "kpe",
    "iso639-1": null
  };
  var Kuanyama = {
    name: "Kuanyama",
    names: ["Kuanyama", "Kwanyama"],
    "iso639-2": "kua",
    "iso639-1": "kj"
  };
  var Kumyk = {
    name: "Kumyk",
    names: ["Kumyk"],
    "iso639-2": "kum",
    "iso639-1": null
  };
  var Kurdish = {
    name: "Kurdish",
    names: ["Kurdish"],
    "iso639-2": "kur",
    "iso639-1": "ku"
  };
  var Kurukh = {
    name: "Kurukh",
    names: ["Kurukh"],
    "iso639-2": "kru",
    "iso639-1": null
  };
  var Kutenai = {
    name: "Kutenai",
    names: ["Kutenai"],
    "iso639-2": "kut",
    "iso639-1": null
  };
  var Kwanyama = {
    name: "Kwanyama",
    names: ["Kuanyama", "Kwanyama"],
    "iso639-2": "kua",
    "iso639-1": "kj"
  };
  var Kyrgyz = {
    name: "Kyrgyz",
    names: ["Kirghiz", "Kyrgyz"],
    "iso639-2": "kir",
    "iso639-1": "ky"
  };
  var Ladino = {
    name: "Ladino",
    names: ["Ladino"],
    "iso639-2": "lad",
    "iso639-1": null
  };
  var Lahnda = {
    name: "Lahnda",
    names: ["Lahnda"],
    "iso639-2": "lah",
    "iso639-1": null
  };
  var Lamba = {
    name: "Lamba",
    names: ["Lamba"],
    "iso639-2": "lam",
    "iso639-1": null
  };
  var Lao = {
    name: "Lao",
    names: ["Lao"],
    "iso639-2": "lao",
    "iso639-1": "lo"
  };
  var Latin = {
    name: "Latin",
    names: ["Latin"],
    "iso639-2": "lat",
    "iso639-1": "la"
  };
  var Latvian = {
    name: "Latvian",
    names: ["Latvian"],
    "iso639-2": "lav",
    "iso639-1": "lv"
  };
  var Leonese = {
    name: "Leonese",
    names: ["Asturian", "Bable", "Leonese", "Asturleonese"],
    "iso639-2": "ast",
    "iso639-1": null
  };
  var Letzeburgesch = {
    name: "Letzeburgesch",
    names: ["Luxembourgish", "Letzeburgesch"],
    "iso639-2": "ltz",
    "iso639-1": "lb"
  };
  var Lezghian = {
    name: "Lezghian",
    names: ["Lezghian"],
    "iso639-2": "lez",
    "iso639-1": null
  };
  var Limburgan = {
    name: "Limburgan",
    names: ["Limburgan", "Limburger", "Limburgish"],
    "iso639-2": "lim",
    "iso639-1": "li"
  };
  var Limburger = {
    name: "Limburger",
    names: ["Limburgan", "Limburger", "Limburgish"],
    "iso639-2": "lim",
    "iso639-1": "li"
  };
  var Limburgish = {
    name: "Limburgish",
    names: ["Limburgan", "Limburger", "Limburgish"],
    "iso639-2": "lim",
    "iso639-1": "li"
  };
  var Lingala = {
    name: "Lingala",
    names: ["Lingala"],
    "iso639-2": "lin",
    "iso639-1": "ln"
  };
  var Lithuanian = {
    name: "Lithuanian",
    names: ["Lithuanian"],
    "iso639-2": "lit",
    "iso639-1": "lt"
  };
  var Lojban = {
    name: "Lojban",
    names: ["Lojban"],
    "iso639-2": "jbo",
    "iso639-1": null
  };
  var Lozi = {
    name: "Lozi",
    names: ["Lozi"],
    "iso639-2": "loz",
    "iso639-1": null
  };
  var Luiseno = {
    name: "Luiseno",
    names: ["Luiseno"],
    "iso639-2": "lui",
    "iso639-1": null
  };
  var Lunda = {
    name: "Lunda",
    names: ["Lunda"],
    "iso639-2": "lun",
    "iso639-1": null
  };
  var Lushai = {
    name: "Lushai",
    names: ["Lushai"],
    "iso639-2": "lus",
    "iso639-1": null
  };
  var Luxembourgish = {
    name: "Luxembourgish",
    names: ["Luxembourgish", "Letzeburgesch"],
    "iso639-2": "ltz",
    "iso639-1": "lb"
  };
  var Macedonian = {
    name: "Macedonian",
    names: ["Macedonian"],
    "iso639-2": "mac/mkd",
    "iso639-1": "mk"
  };
  var Madurese = {
    name: "Madurese",
    names: ["Madurese"],
    "iso639-2": "mad",
    "iso639-1": null
  };
  var Magahi = {
    name: "Magahi",
    names: ["Magahi"],
    "iso639-2": "mag",
    "iso639-1": null
  };
  var Maithili = {
    name: "Maithili",
    names: ["Maithili"],
    "iso639-2": "mai",
    "iso639-1": null
  };
  var Makasar = {
    name: "Makasar",
    names: ["Makasar"],
    "iso639-2": "mak",
    "iso639-1": null
  };
  var Malagasy = {
    name: "Malagasy",
    names: ["Malagasy"],
    "iso639-2": "mlg",
    "iso639-1": "mg"
  };
  var Malay = {
    name: "Malay",
    names: ["Malay"],
    "iso639-2": "may/msa",
    "iso639-1": "ms"
  };
  var Malayalam = {
    name: "Malayalam",
    names: ["Malayalam"],
    "iso639-2": "mal",
    "iso639-1": "ml"
  };
  var Maldivian = {
    name: "Maldivian",
    names: ["Divehi", "Dhivehi", "Maldivian"],
    "iso639-2": "div",
    "iso639-1": "dv"
  };
  var Maltese = {
    name: "Maltese",
    names: ["Maltese"],
    "iso639-2": "mlt",
    "iso639-1": "mt"
  };
  var Manchu = {
    name: "Manchu",
    names: ["Manchu"],
    "iso639-2": "mnc",
    "iso639-1": null
  };
  var Mandar = {
    name: "Mandar",
    names: ["Mandar"],
    "iso639-2": "mdr",
    "iso639-1": null
  };
  var Mandingo = {
    name: "Mandingo",
    names: ["Mandingo"],
    "iso639-2": "man",
    "iso639-1": null
  };
  var Manipuri = {
    name: "Manipuri",
    names: ["Manipuri"],
    "iso639-2": "mni",
    "iso639-1": null
  };
  var Manx = {
    name: "Manx",
    names: ["Manx"],
    "iso639-2": "glv",
    "iso639-1": "gv"
  };
  var Maori = {
    name: "Maori",
    names: ["Maori"],
    "iso639-2": "mao/mri",
    "iso639-1": "mi"
  };
  var Mapuche = {
    name: "Mapuche",
    names: ["Mapudungun", "Mapuche"],
    "iso639-2": "arn",
    "iso639-1": null
  };
  var Mapudungun = {
    name: "Mapudungun",
    names: ["Mapudungun", "Mapuche"],
    "iso639-2": "arn",
    "iso639-1": null
  };
  var Marathi = {
    name: "Marathi",
    names: ["Marathi"],
    "iso639-2": "mar",
    "iso639-1": "mr"
  };
  var Mari = {
    name: "Mari",
    names: ["Mari"],
    "iso639-2": "chm",
    "iso639-1": null
  };
  var Marshallese = {
    name: "Marshallese",
    names: ["Marshallese"],
    "iso639-2": "mah",
    "iso639-1": "mh"
  };
  var Marwari = {
    name: "Marwari",
    names: ["Marwari"],
    "iso639-2": "mwr",
    "iso639-1": null
  };
  var Masai = {
    name: "Masai",
    names: ["Masai"],
    "iso639-2": "mas",
    "iso639-1": null
  };
  var Mende = {
    name: "Mende",
    names: ["Mende"],
    "iso639-2": "men",
    "iso639-1": null
  };
  var Micmac = {
    name: "Micmac",
    names: ["Mi'kmaq", "Micmac"],
    "iso639-2": "mic",
    "iso639-1": null
  };
  var Minangkabau = {
    name: "Minangkabau",
    names: ["Minangkabau"],
    "iso639-2": "min",
    "iso639-1": null
  };
  var Mirandese = {
    name: "Mirandese",
    names: ["Mirandese"],
    "iso639-2": "mwl",
    "iso639-1": null
  };
  var Mohawk = {
    name: "Mohawk",
    names: ["Mohawk"],
    "iso639-2": "moh",
    "iso639-1": null
  };
  var Moksha = {
    name: "Moksha",
    names: ["Moksha"],
    "iso639-2": "mdf",
    "iso639-1": null
  };
  var Moldavian = {
    name: "Moldavian",
    names: ["Romanian", "Moldavian", "Moldovan"],
    "iso639-2": "rum/ron",
    "iso639-1": "ro"
  };
  var Moldovan = {
    name: "Moldovan",
    names: ["Romanian", "Moldavian", "Moldovan"],
    "iso639-2": "rum/ron",
    "iso639-1": "ro"
  };
  var Mong = {
    name: "Mong",
    names: ["Hmong", "Mong"],
    "iso639-2": "hmn",
    "iso639-1": null
  };
  var Mongo = {
    name: "Mongo",
    names: ["Mongo"],
    "iso639-2": "lol",
    "iso639-1": null
  };
  var Mongolian = {
    name: "Mongolian",
    names: ["Mongolian"],
    "iso639-2": "mon",
    "iso639-1": "mn"
  };
  var Montenegrin = {
    name: "Montenegrin",
    names: ["Montenegrin"],
    "iso639-2": "cnr",
    "iso639-1": null
  };
  var Mossi = {
    name: "Mossi",
    names: ["Mossi"],
    "iso639-2": "mos",
    "iso639-1": null
  };
  var Nauru = {
    name: "Nauru",
    names: ["Nauru"],
    "iso639-2": "nau",
    "iso639-1": "na"
  };
  var Navaho = {
    name: "Navaho",
    names: ["Navajo", "Navaho"],
    "iso639-2": "nav",
    "iso639-1": "nv"
  };
  var Navajo = {
    name: "Navajo",
    names: ["Navajo", "Navaho"],
    "iso639-2": "nav",
    "iso639-1": "nv"
  };
  var Ndonga = {
    name: "Ndonga",
    names: ["Ndonga"],
    "iso639-2": "ndo",
    "iso639-1": "ng"
  };
  var Neapolitan = {
    name: "Neapolitan",
    names: ["Neapolitan"],
    "iso639-2": "nap",
    "iso639-1": null
  };
  var Nepali = {
    name: "Nepali",
    names: ["Nepali"],
    "iso639-2": "nep",
    "iso639-1": "ne"
  };
  var Newari = {
    name: "Newari",
    names: ["Nepal Bhasa", "Newari"],
    "iso639-2": "new",
    "iso639-1": null
  };
  var Nias = {
    name: "Nias",
    names: ["Nias"],
    "iso639-2": "nia",
    "iso639-1": null
  };
  var Niuean = {
    name: "Niuean",
    names: ["Niuean"],
    "iso639-2": "niu",
    "iso639-1": null
  };
  var Nogai = {
    name: "Nogai",
    names: ["Nogai"],
    "iso639-2": "nog",
    "iso639-1": null
  };
  var Norwegian = {
    name: "Norwegian",
    names: ["Norwegian"],
    "iso639-2": "nor",
    "iso639-1": "no"
  };
  var Nuosu = {
    name: "Nuosu",
    names: ["Sichuan Yi", "Nuosu"],
    "iso639-2": "iii",
    "iso639-1": "ii"
  };
  var Nyamwezi = {
    name: "Nyamwezi",
    names: ["Nyamwezi"],
    "iso639-2": "nym",
    "iso639-1": null
  };
  var Nyanja = {
    name: "Nyanja",
    names: ["Chichewa", "Chewa", "Nyanja"],
    "iso639-2": "nya",
    "iso639-1": "ny"
  };
  var Nyankole = {
    name: "Nyankole",
    names: ["Nyankole"],
    "iso639-2": "nyn",
    "iso639-1": null
  };
  var Nyoro = {
    name: "Nyoro",
    names: ["Nyoro"],
    "iso639-2": "nyo",
    "iso639-1": null
  };
  var Nzima = {
    name: "Nzima",
    names: ["Nzima"],
    "iso639-2": "nzi",
    "iso639-1": null
  };
  var Occidental = {
    name: "Occidental",
    names: ["Interlingue", "Occidental"],
    "iso639-2": "ile",
    "iso639-1": "ie"
  };
  var Oirat = {
    name: "Oirat",
    names: ["Kalmyk", "Oirat"],
    "iso639-2": "xal",
    "iso639-1": null
  };
  var Ojibwa = {
    name: "Ojibwa",
    names: ["Ojibwa"],
    "iso639-2": "oji",
    "iso639-1": "oj"
  };
  var Oriya = {
    name: "Oriya",
    names: ["Oriya"],
    "iso639-2": "ori",
    "iso639-1": "or"
  };
  var Oromo = {
    name: "Oromo",
    names: ["Oromo"],
    "iso639-2": "orm",
    "iso639-1": "om"
  };
  var Osage = {
    name: "Osage",
    names: ["Osage"],
    "iso639-2": "osa",
    "iso639-1": null
  };
  var Ossetian = {
    name: "Ossetian",
    names: ["Ossetian", "Ossetic"],
    "iso639-2": "oss",
    "iso639-1": "os"
  };
  var Ossetic = {
    name: "Ossetic",
    names: ["Ossetian", "Ossetic"],
    "iso639-2": "oss",
    "iso639-1": "os"
  };
  var Pahlavi = {
    name: "Pahlavi",
    names: ["Pahlavi"],
    "iso639-2": "pal",
    "iso639-1": null
  };
  var Palauan = {
    name: "Palauan",
    names: ["Palauan"],
    "iso639-2": "pau",
    "iso639-1": null
  };
  var Pali = {
    name: "Pali",
    names: ["Pali"],
    "iso639-2": "pli",
    "iso639-1": "pi"
  };
  var Pampanga = {
    name: "Pampanga",
    names: ["Pampanga", "Kapampangan"],
    "iso639-2": "pam",
    "iso639-1": null
  };
  var Pangasinan = {
    name: "Pangasinan",
    names: ["Pangasinan"],
    "iso639-2": "pag",
    "iso639-1": null
  };
  var Panjabi = {
    name: "Panjabi",
    names: ["Panjabi", "Punjabi"],
    "iso639-2": "pan",
    "iso639-1": "pa"
  };
  var Papiamento = {
    name: "Papiamento",
    names: ["Papiamento"],
    "iso639-2": "pap",
    "iso639-1": null
  };
  var Pashto = {
    name: "Pashto",
    names: ["Pushto", "Pashto"],
    "iso639-2": "pus",
    "iso639-1": "ps"
  };
  var Pedi = {
    name: "Pedi",
    names: ["Pedi", "Sepedi", "Northern Sotho"],
    "iso639-2": "nso",
    "iso639-1": null
  };
  var Persian = {
    name: "Persian",
    names: ["Persian"],
    "iso639-2": "per/fas",
    "iso639-1": "fa"
  };
  var Phoenician = {
    name: "Phoenician",
    names: ["Phoenician"],
    "iso639-2": "phn",
    "iso639-1": null
  };
  var Pilipino = {
    name: "Pilipino",
    names: ["Filipino", "Pilipino"],
    "iso639-2": "fil",
    "iso639-1": null
  };
  var Pohnpeian = {
    name: "Pohnpeian",
    names: ["Pohnpeian"],
    "iso639-2": "pon",
    "iso639-1": null
  };
  var Polish = {
    name: "Polish",
    names: ["Polish"],
    "iso639-2": "pol",
    "iso639-1": "pl"
  };
  var Portuguese = {
    name: "Portuguese",
    names: ["Portuguese"],
    "iso639-2": "por",
    "iso639-1": "pt"
  };
  var Punjabi = {
    name: "Punjabi",
    names: ["Panjabi", "Punjabi"],
    "iso639-2": "pan",
    "iso639-1": "pa"
  };
  var Pushto = {
    name: "Pushto",
    names: ["Pushto", "Pashto"],
    "iso639-2": "pus",
    "iso639-1": "ps"
  };
  var Quechua = {
    name: "Quechua",
    names: ["Quechua"],
    "iso639-2": "que",
    "iso639-1": "qu"
  };
  var Rajasthani = {
    name: "Rajasthani",
    names: ["Rajasthani"],
    "iso639-2": "raj",
    "iso639-1": null
  };
  var Rapanui = {
    name: "Rapanui",
    names: ["Rapanui"],
    "iso639-2": "rap",
    "iso639-1": null
  };
  var Rarotongan = {
    name: "Rarotongan",
    names: ["Rarotongan", "Cook Islands Maori"],
    "iso639-2": "rar",
    "iso639-1": null
  };
  var Romanian = {
    name: "Romanian",
    names: ["Romanian", "Moldavian", "Moldovan"],
    "iso639-2": "rum/ron",
    "iso639-1": "ro"
  };
  var Romansh = {
    name: "Romansh",
    names: ["Romansh"],
    "iso639-2": "roh",
    "iso639-1": "rm"
  };
  var Romany = {
    name: "Romany",
    names: ["Romany"],
    "iso639-2": "rom",
    "iso639-1": null
  };
  var Rundi = {
    name: "Rundi",
    names: ["Rundi"],
    "iso639-2": "run",
    "iso639-1": "rn"
  };
  var Russian = {
    name: "Russian",
    names: ["Russian"],
    "iso639-2": "rus",
    "iso639-1": "ru"
  };
  var Sakan = {
    name: "Sakan",
    names: ["Khotanese", "Sakan"],
    "iso639-2": "kho",
    "iso639-1": null
  };
  var Samoan = {
    name: "Samoan",
    names: ["Samoan"],
    "iso639-2": "smo",
    "iso639-1": "sm"
  };
  var Sandawe = {
    name: "Sandawe",
    names: ["Sandawe"],
    "iso639-2": "sad",
    "iso639-1": null
  };
  var Sango = {
    name: "Sango",
    names: ["Sango"],
    "iso639-2": "sag",
    "iso639-1": "sg"
  };
  var Sanskrit = {
    name: "Sanskrit",
    names: ["Sanskrit"],
    "iso639-2": "san",
    "iso639-1": "sa"
  };
  var Santali = {
    name: "Santali",
    names: ["Santali"],
    "iso639-2": "sat",
    "iso639-1": null
  };
  var Sardinian = {
    name: "Sardinian",
    names: ["Sardinian"],
    "iso639-2": "srd",
    "iso639-1": "sc"
  };
  var Sasak = {
    name: "Sasak",
    names: ["Sasak"],
    "iso639-2": "sas",
    "iso639-1": null
  };
  var Scots = {
    name: "Scots",
    names: ["Scots"],
    "iso639-2": "sco",
    "iso639-1": null
  };
  var Selkup = {
    name: "Selkup",
    names: ["Selkup"],
    "iso639-2": "sel",
    "iso639-1": null
  };
  var Sepedi = {
    name: "Sepedi",
    names: ["Pedi", "Sepedi", "Northern Sotho"],
    "iso639-2": "nso",
    "iso639-1": null
  };
  var Serbian = {
    name: "Serbian",
    names: ["Serbian"],
    "iso639-2": "srp",
    "iso639-1": "sr"
  };
  var Serer = {
    name: "Serer",
    names: ["Serer"],
    "iso639-2": "srr",
    "iso639-1": null
  };
  var Shan = {
    name: "Shan",
    names: ["Shan"],
    "iso639-2": "shn",
    "iso639-1": null
  };
  var Shona = {
    name: "Shona",
    names: ["Shona"],
    "iso639-2": "sna",
    "iso639-1": "sn"
  };
  var Sicilian = {
    name: "Sicilian",
    names: ["Sicilian"],
    "iso639-2": "scn",
    "iso639-1": null
  };
  var Sidamo = {
    name: "Sidamo",
    names: ["Sidamo"],
    "iso639-2": "sid",
    "iso639-1": null
  };
  var Siksika = {
    name: "Siksika",
    names: ["Siksika"],
    "iso639-2": "bla",
    "iso639-1": null
  };
  var Sindhi = {
    name: "Sindhi",
    names: ["Sindhi"],
    "iso639-2": "snd",
    "iso639-1": "sd"
  };
  var Sinhala = {
    name: "Sinhala",
    names: ["Sinhala", "Sinhalese"],
    "iso639-2": "sin",
    "iso639-1": "si"
  };
  var Sinhalese = {
    name: "Sinhalese",
    names: ["Sinhala", "Sinhalese"],
    "iso639-2": "sin",
    "iso639-1": "si"
  };
  var Slovak = {
    name: "Slovak",
    names: ["Slovak"],
    "iso639-2": "slo/slk",
    "iso639-1": "sk"
  };
  var Slovenian = {
    name: "Slovenian",
    names: ["Slovenian"],
    "iso639-2": "slv",
    "iso639-1": "sl"
  };
  var Sogdian = {
    name: "Sogdian",
    names: ["Sogdian"],
    "iso639-2": "sog",
    "iso639-1": null
  };
  var Somali = {
    name: "Somali",
    names: ["Somali"],
    "iso639-2": "som",
    "iso639-1": "so"
  };
  var Soninke = {
    name: "Soninke",
    names: ["Soninke"],
    "iso639-2": "snk",
    "iso639-1": null
  };
  var Spanish = {
    name: "Spanish",
    names: ["Spanish", "Castilian"],
    "iso639-2": "spa",
    "iso639-1": "es"
  };
  var Sukuma = {
    name: "Sukuma",
    names: ["Sukuma"],
    "iso639-2": "suk",
    "iso639-1": null
  };
  var Sumerian = {
    name: "Sumerian",
    names: ["Sumerian"],
    "iso639-2": "sux",
    "iso639-1": null
  };
  var Sundanese = {
    name: "Sundanese",
    names: ["Sundanese"],
    "iso639-2": "sun",
    "iso639-1": "su"
  };
  var Susu = {
    name: "Susu",
    names: ["Susu"],
    "iso639-2": "sus",
    "iso639-1": null
  };
  var Swahili = {
    name: "Swahili",
    names: ["Swahili"],
    "iso639-2": "swa",
    "iso639-1": "sw"
  };
  var Swati = {
    name: "Swati",
    names: ["Swati"],
    "iso639-2": "ssw",
    "iso639-1": "ss"
  };
  var Swedish = {
    name: "Swedish",
    names: ["Swedish"],
    "iso639-2": "swe",
    "iso639-1": "sv"
  };
  var Syriac = {
    name: "Syriac",
    names: ["Syriac"],
    "iso639-2": "syr",
    "iso639-1": null
  };
  var Tagalog = {
    name: "Tagalog",
    names: ["Tagalog"],
    "iso639-2": "tgl",
    "iso639-1": "tl"
  };
  var Tahitian = {
    name: "Tahitian",
    names: ["Tahitian"],
    "iso639-2": "tah",
    "iso639-1": "ty"
  };
  var Tajik = {
    name: "Tajik",
    names: ["Tajik"],
    "iso639-2": "tgk",
    "iso639-1": "tg"
  };
  var Tamashek = {
    name: "Tamashek",
    names: ["Tamashek"],
    "iso639-2": "tmh",
    "iso639-1": null
  };
  var Tamil = {
    name: "Tamil",
    names: ["Tamil"],
    "iso639-2": "tam",
    "iso639-1": "ta"
  };
  var Tatar = {
    name: "Tatar",
    names: ["Tatar"],
    "iso639-2": "tat",
    "iso639-1": "tt"
  };
  var Telugu = {
    name: "Telugu",
    names: ["Telugu"],
    "iso639-2": "tel",
    "iso639-1": "te"
  };
  var Tereno = {
    name: "Tereno",
    names: ["Tereno"],
    "iso639-2": "ter",
    "iso639-1": null
  };
  var Tetum = {
    name: "Tetum",
    names: ["Tetum"],
    "iso639-2": "tet",
    "iso639-1": null
  };
  var Thai = {
    name: "Thai",
    names: ["Thai"],
    "iso639-2": "tha",
    "iso639-1": "th"
  };
  var Tibetan = {
    name: "Tibetan",
    names: ["Tibetan"],
    "iso639-2": "tib/bod",
    "iso639-1": "bo"
  };
  var Tigre = {
    name: "Tigre",
    names: ["Tigre"],
    "iso639-2": "tig",
    "iso639-1": null
  };
  var Tigrinya = {
    name: "Tigrinya",
    names: ["Tigrinya"],
    "iso639-2": "tir",
    "iso639-1": "ti"
  };
  var Timne = {
    name: "Timne",
    names: ["Timne"],
    "iso639-2": "tem",
    "iso639-1": null
  };
  var Tiv = {
    name: "Tiv",
    names: ["Tiv"],
    "iso639-2": "tiv",
    "iso639-1": null
  };
  var Tlingit = {
    name: "Tlingit",
    names: ["Tlingit"],
    "iso639-2": "tli",
    "iso639-1": null
  };
  var Tokelau = {
    name: "Tokelau",
    names: ["Tokelau"],
    "iso639-2": "tkl",
    "iso639-1": null
  };
  var Tsimshian = {
    name: "Tsimshian",
    names: ["Tsimshian"],
    "iso639-2": "tsi",
    "iso639-1": null
  };
  var Tsonga = {
    name: "Tsonga",
    names: ["Tsonga"],
    "iso639-2": "tso",
    "iso639-1": "ts"
  };
  var Tswana = {
    name: "Tswana",
    names: ["Tswana"],
    "iso639-2": "tsn",
    "iso639-1": "tn"
  };
  var Tumbuka = {
    name: "Tumbuka",
    names: ["Tumbuka"],
    "iso639-2": "tum",
    "iso639-1": null
  };
  var Turkish = {
    name: "Turkish",
    names: ["Turkish"],
    "iso639-2": "tur",
    "iso639-1": "tr"
  };
  var Turkmen = {
    name: "Turkmen",
    names: ["Turkmen"],
    "iso639-2": "tuk",
    "iso639-1": "tk"
  };
  var Tuvalu = {
    name: "Tuvalu",
    names: ["Tuvalu"],
    "iso639-2": "tvl",
    "iso639-1": null
  };
  var Tuvinian = {
    name: "Tuvinian",
    names: ["Tuvinian"],
    "iso639-2": "tyv",
    "iso639-1": null
  };
  var Twi = {
    name: "Twi",
    names: ["Twi"],
    "iso639-2": "twi",
    "iso639-1": "tw"
  };
  var Udmurt = {
    name: "Udmurt",
    names: ["Udmurt"],
    "iso639-2": "udm",
    "iso639-1": null
  };
  var Ugaritic = {
    name: "Ugaritic",
    names: ["Ugaritic"],
    "iso639-2": "uga",
    "iso639-1": null
  };
  var Uighur = {
    name: "Uighur",
    names: ["Uighur", "Uyghur"],
    "iso639-2": "uig",
    "iso639-1": "ug"
  };
  var Ukrainian = {
    name: "Ukrainian",
    names: ["Ukrainian"],
    "iso639-2": "ukr",
    "iso639-1": "uk"
  };
  var Umbundu = {
    name: "Umbundu",
    names: ["Umbundu"],
    "iso639-2": "umb",
    "iso639-1": null
  };
  var Undetermined = {
    name: "Undetermined",
    names: ["Undetermined"],
    "iso639-2": "und",
    "iso639-1": null
  };
  var Urdu = {
    name: "Urdu",
    names: ["Urdu"],
    "iso639-2": "urd",
    "iso639-1": "ur"
  };
  var Uyghur = {
    name: "Uyghur",
    names: ["Uighur", "Uyghur"],
    "iso639-2": "uig",
    "iso639-1": "ug"
  };
  var Uzbek = {
    name: "Uzbek",
    names: ["Uzbek"],
    "iso639-2": "uzb",
    "iso639-1": "uz"
  };
  var Vai = {
    name: "Vai",
    names: ["Vai"],
    "iso639-2": "vai",
    "iso639-1": null
  };
  var Valencian = {
    name: "Valencian",
    names: ["Catalan", "Valencian"],
    "iso639-2": "cat",
    "iso639-1": "ca"
  };
  var Venda = {
    name: "Venda",
    names: ["Venda"],
    "iso639-2": "ven",
    "iso639-1": "ve"
  };
  var Vietnamese = {
    name: "Vietnamese",
    names: ["Vietnamese"],
    "iso639-2": "vie",
    "iso639-1": "vi"
  };
  var Votic = {
    name: "Votic",
    names: ["Votic"],
    "iso639-2": "vot",
    "iso639-1": null
  };
  var Walloon = {
    name: "Walloon",
    names: ["Walloon"],
    "iso639-2": "wln",
    "iso639-1": "wa"
  };
  var Waray = {
    name: "Waray",
    names: ["Waray"],
    "iso639-2": "war",
    "iso639-1": null
  };
  var Washo = {
    name: "Washo",
    names: ["Washo"],
    "iso639-2": "was",
    "iso639-1": null
  };
  var Welsh = {
    name: "Welsh",
    names: ["Welsh"],
    "iso639-2": "wel/cym",
    "iso639-1": "cy"
  };
  var Wolaitta = {
    name: "Wolaitta",
    names: ["Wolaitta", "Wolaytta"],
    "iso639-2": "wal",
    "iso639-1": null
  };
  var Wolaytta = {
    name: "Wolaytta",
    names: ["Wolaitta", "Wolaytta"],
    "iso639-2": "wal",
    "iso639-1": null
  };
  var Wolof = {
    name: "Wolof",
    names: ["Wolof"],
    "iso639-2": "wol",
    "iso639-1": "wo"
  };
  var Xhosa = {
    name: "Xhosa",
    names: ["Xhosa"],
    "iso639-2": "xho",
    "iso639-1": "xh"
  };
  var Yakut = {
    name: "Yakut",
    names: ["Yakut"],
    "iso639-2": "sah",
    "iso639-1": null
  };
  var Yao = {
    name: "Yao",
    names: ["Yao"],
    "iso639-2": "yao",
    "iso639-1": null
  };
  var Yapese = {
    name: "Yapese",
    names: ["Yapese"],
    "iso639-2": "yap",
    "iso639-1": null
  };
  var Yiddish = {
    name: "Yiddish",
    names: ["Yiddish"],
    "iso639-2": "yid",
    "iso639-1": "yi"
  };
  var Yoruba = {
    name: "Yoruba",
    names: ["Yoruba"],
    "iso639-2": "yor",
    "iso639-1": "yo"
  };
  var Zapotec = {
    name: "Zapotec",
    names: ["Zapotec"],
    "iso639-2": "zap",
    "iso639-1": null
  };
  var Zaza = {
    name: "Zaza",
    names: ["Zaza", "Dimili", "Dimli", "Kirdki", "Kirmanjki", "Zazaki"],
    "iso639-2": "zza",
    "iso639-1": null
  };
  var Zazaki = {
    name: "Zazaki",
    names: ["Zaza", "Dimili", "Dimli", "Kirdki", "Kirmanjki", "Zazaki"],
    "iso639-2": "zza",
    "iso639-1": null
  };
  var Zenaga = {
    name: "Zenaga",
    names: ["Zenaga"],
    "iso639-2": "zen",
    "iso639-1": null
  };
  var Zhuang = {
    name: "Zhuang",
    names: ["Zhuang", "Chuang"],
    "iso639-2": "zha",
    "iso639-1": "za"
  };
  var Zulu = {
    name: "Zulu",
    names: ["Zulu"],
    "iso639-2": "zul",
    "iso639-1": "zu"
  };
  var Zuni = {
    name: "Zuni",
    names: ["Zuni"],
    "iso639-2": "zun",
    "iso639-1": null
  };
  var iso = {
    Abkhazian: Abkhazian,
    Achinese: Achinese,
    Acoli: Acoli,
    Adangme: Adangme,
    Adygei: Adygei,
    Adyghe: Adyghe,
    Afar: Afar,
    Afrihili: Afrihili,
    Afrikaans: Afrikaans,
    "Afro-Asiatic languages": {
      name: "Afro-Asiatic languages",
      names: ["Afro-Asiatic languages"],
      "iso639-2": "afa",
      "iso639-1": null
    },
    Ainu: Ainu,
    Akan: Akan,
    Akkadian: Akkadian,
    Albanian: Albanian,
    Alemannic: Alemannic,
    Aleut: Aleut,
    "Algonquian languages": {
      name: "Algonquian languages",
      names: ["Algonquian languages"],
      "iso639-2": "alg",
      "iso639-1": null
    },
    Alsatian: Alsatian,
    "Altaic languages": {
      name: "Altaic languages",
      names: ["Altaic languages"],
      "iso639-2": "tut",
      "iso639-1": null
    },
    Amharic: Amharic,
    Angika: Angika,
    "Apache languages": {
      name: "Apache languages",
      names: ["Apache languages"],
      "iso639-2": "apa",
      "iso639-1": null
    },
    Arabic: Arabic,
    Aragonese: Aragonese,
    Arapaho: Arapaho,
    Arawak: Arawak,
    Armenian: Armenian,
    Aromanian: Aromanian,
    "Artificial languages": {
      name: "Artificial languages",
      names: ["Artificial languages"],
      "iso639-2": "art",
      "iso639-1": null
    },
    Arumanian: Arumanian,
    Assamese: Assamese,
    Asturian: Asturian,
    Asturleonese: Asturleonese,
    "Athapascan languages": {
      name: "Athapascan languages",
      names: ["Athapascan languages"],
      "iso639-2": "ath",
      "iso639-1": null
    },
    "Australian languages": {
      name: "Australian languages",
      names: ["Australian languages"],
      "iso639-2": "aus",
      "iso639-1": null
    },
    "Austronesian languages": {
      name: "Austronesian languages",
      names: ["Austronesian languages"],
      "iso639-2": "map",
      "iso639-1": null
    },
    Avaric: Avaric,
    Avestan: Avestan,
    Awadhi: Awadhi,
    Aymara: Aymara,
    Azerbaijani: Azerbaijani,
    Bable: Bable,
    Balinese: Balinese,
    "Baltic languages": {
      name: "Baltic languages",
      names: ["Baltic languages"],
      "iso639-2": "bat",
      "iso639-1": null
    },
    Baluchi: Baluchi,
    Bambara: Bambara,
    "Bamileke languages": {
      name: "Bamileke languages",
      names: ["Bamileke languages"],
      "iso639-2": "bai",
      "iso639-1": null
    },
    "Banda languages": {
      name: "Banda languages",
      names: ["Banda languages"],
      "iso639-2": "bad",
      "iso639-1": null
    },
    "Bantu languages": {
      name: "Bantu languages",
      names: ["Bantu languages"],
      "iso639-2": "bnt",
      "iso639-1": null
    },
    Basa: Basa,
    Bashkir: Bashkir,
    Basque: Basque,
    "Batak languages": {
      name: "Batak languages",
      names: ["Batak languages"],
      "iso639-2": "btk",
      "iso639-1": null
    },
    Bedawiyet: Bedawiyet,
    Beja: Beja,
    Belarusian: Belarusian,
    Bemba: Bemba,
    Bengali: Bengali,
    "Berber languages": {
      name: "Berber languages",
      names: ["Berber languages"],
      "iso639-2": "ber",
      "iso639-1": null
    },
    Bhojpuri: Bhojpuri,
    "Bihari languages": {
      name: "Bihari languages",
      names: ["Bihari languages"],
      "iso639-2": "bih",
      "iso639-1": "bh"
    },
    Bikol: Bikol,
    Bilin: Bilin,
    Bini: Bini,
    Bislama: Bislama,
    Blin: Blin,
    Bliss: Bliss,
    Blissymbolics: Blissymbolics,
    Blissymbols: Blissymbols,
    "Bokmål, Norwegian": {
      name: "Bokmål, Norwegian",
      names: ["Bokmål, Norwegian", "Norwegian Bokmål"],
      "iso639-2": "nob",
      "iso639-1": "nb"
    },
    Bosnian: Bosnian,
    Braj: Braj,
    Breton: Breton,
    Buginese: Buginese,
    Bulgarian: Bulgarian,
    Buriat: Buriat,
    Burmese: Burmese,
    Caddo: Caddo,
    Castilian: Castilian,
    Catalan: Catalan,
    "Caucasian languages": {
      name: "Caucasian languages",
      names: ["Caucasian languages"],
      "iso639-2": "cau",
      "iso639-1": null
    },
    Cebuano: Cebuano,
    "Celtic languages": {
      name: "Celtic languages",
      names: ["Celtic languages"],
      "iso639-2": "cel",
      "iso639-1": null
    },
    "Central American Indian languages": {
      name: "Central American Indian languages",
      names: ["Central American Indian languages"],
      "iso639-2": "cai",
      "iso639-1": null
    },
    "Central Khmer": {
      name: "Central Khmer",
      names: ["Central Khmer"],
      "iso639-2": "khm",
      "iso639-1": "km"
    },
    Chagatai: Chagatai,
    "Chamic languages": {
      name: "Chamic languages",
      names: ["Chamic languages"],
      "iso639-2": "cmc",
      "iso639-1": null
    },
    Chamorro: Chamorro,
    Chechen: Chechen,
    Cherokee: Cherokee,
    Chewa: Chewa,
    Cheyenne: Cheyenne,
    Chibcha: Chibcha,
    Chichewa: Chichewa,
    Chinese: Chinese,
    "Chinook jargon": {
      name: "Chinook jargon",
      names: ["Chinook jargon"],
      "iso639-2": "chn",
      "iso639-1": null
    },
    Chipewyan: Chipewyan,
    Choctaw: Choctaw,
    Chuang: Chuang,
    "Church Slavic": {
      name: "Church Slavic",
      names: ["Church Slavic", "Old Slavonic", "Church Slavonic", "Old Bulgarian", "Old Church Slavonic"],
      "iso639-2": "chu",
      "iso639-1": "cu"
    },
    "Church Slavonic": {
      name: "Church Slavonic",
      names: ["Church Slavic", "Old Slavonic", "Church Slavonic", "Old Bulgarian", "Old Church Slavonic"],
      "iso639-2": "chu",
      "iso639-1": "cu"
    },
    Chuukese: Chuukese,
    Chuvash: Chuvash,
    "Classical Nepal Bhasa": {
      name: "Classical Nepal Bhasa",
      names: ["Classical Newari", "Old Newari", "Classical Nepal Bhasa"],
      "iso639-2": "nwc",
      "iso639-1": null
    },
    "Classical Newari": {
      name: "Classical Newari",
      names: ["Classical Newari", "Old Newari", "Classical Nepal Bhasa"],
      "iso639-2": "nwc",
      "iso639-1": null
    },
    "Classical Syriac": {
      name: "Classical Syriac",
      names: ["Classical Syriac"],
      "iso639-2": "syc",
      "iso639-1": null
    },
    "Cook Islands Maori": {
      name: "Cook Islands Maori",
      names: ["Rarotongan", "Cook Islands Maori"],
      "iso639-2": "rar",
      "iso639-1": null
    },
    Coptic: Coptic,
    Cornish: Cornish,
    Corsican: Corsican,
    Cree: Cree,
    Creek: Creek,
    "Creoles and pidgins": {
      name: "Creoles and pidgins",
      names: ["Creoles and pidgins"],
      "iso639-2": "crp",
      "iso639-1": null
    },
    "Creoles and pidgins, English based": {
      name: "Creoles and pidgins, English based",
      names: ["Creoles and pidgins, English based"],
      "iso639-2": "cpe",
      "iso639-1": null
    },
    "Creoles and pidgins, French-based": {
      name: "Creoles and pidgins, French-based",
      names: ["Creoles and pidgins, French-based"],
      "iso639-2": "cpf",
      "iso639-1": null
    },
    "Creoles and pidgins, Portuguese-based": {
      name: "Creoles and pidgins, Portuguese-based",
      names: ["Creoles and pidgins, Portuguese-based"],
      "iso639-2": "cpp",
      "iso639-1": null
    },
    "Crimean Tatar": {
      name: "Crimean Tatar",
      names: ["Crimean Tatar", "Crimean Turkish"],
      "iso639-2": "crh",
      "iso639-1": null
    },
    "Crimean Turkish": {
      name: "Crimean Turkish",
      names: ["Crimean Tatar", "Crimean Turkish"],
      "iso639-2": "crh",
      "iso639-1": null
    },
    Croatian: Croatian,
    "Cushitic languages": {
      name: "Cushitic languages",
      names: ["Cushitic languages"],
      "iso639-2": "cus",
      "iso639-1": null
    },
    Czech: Czech,
    Dakota: Dakota,
    Danish: Danish,
    Dargwa: Dargwa,
    Delaware: Delaware,
    "Dene Suline": {
      name: "Dene Suline",
      names: ["Chipewyan", "Dene Suline"],
      "iso639-2": "chp",
      "iso639-1": null
    },
    Dhivehi: Dhivehi,
    Dimili: Dimili,
    Dimli: Dimli,
    Dinka: Dinka,
    Divehi: Divehi,
    Dogri: Dogri,
    Dogrib: Dogrib,
    "Dravidian languages": {
      name: "Dravidian languages",
      names: ["Dravidian languages"],
      "iso639-2": "dra",
      "iso639-1": null
    },
    Duala: Duala,
    Dutch: Dutch,
    "Dutch, Middle (ca.1050-1350)": {
      name: "Dutch, Middle (ca.1050-1350)",
      names: ["Dutch, Middle (ca.1050-1350)"],
      "iso639-2": "dum",
      "iso639-1": null
    },
    Dyula: Dyula,
    Dzongkha: Dzongkha,
    "Eastern Frisian": {
      name: "Eastern Frisian",
      names: ["Eastern Frisian"],
      "iso639-2": "frs",
      "iso639-1": null
    },
    Edo: Edo,
    Efik: Efik,
    "Egyptian (Ancient)": {
      name: "Egyptian (Ancient)",
      names: ["Egyptian (Ancient)"],
      "iso639-2": "egy",
      "iso639-1": null
    },
    Ekajuk: Ekajuk,
    Elamite: Elamite,
    English: English,
    "English, Middle (1100-1500)": {
      name: "English, Middle (1100-1500)",
      names: ["English, Middle (1100-1500)"],
      "iso639-2": "enm",
      "iso639-1": null
    },
    "English, Old (ca.450-1100)": {
      name: "English, Old (ca.450-1100)",
      names: ["English, Old (ca.450-1100)"],
      "iso639-2": "ang",
      "iso639-1": null
    },
    Erzya: Erzya,
    Esperanto: Esperanto,
    Estonian: Estonian,
    Ewe: Ewe,
    Ewondo: Ewondo,
    Fang: Fang,
    Fanti: Fanti,
    Faroese: Faroese,
    Fijian: Fijian,
    Filipino: Filipino,
    Finnish: Finnish,
    "Finno-Ugrian languages": {
      name: "Finno-Ugrian languages",
      names: ["Finno-Ugrian languages"],
      "iso639-2": "fiu",
      "iso639-1": null
    },
    Flemish: Flemish,
    Fon: Fon,
    French: French,
    "French, Middle (ca.1400-1600)": {
      name: "French, Middle (ca.1400-1600)",
      names: ["French, Middle (ca.1400-1600)"],
      "iso639-2": "frm",
      "iso639-1": null
    },
    "French, Old (842-ca.1400)": {
      name: "French, Old (842-ca.1400)",
      names: ["French, Old (842-ca.1400)"],
      "iso639-2": "fro",
      "iso639-1": null
    },
    Friulian: Friulian,
    Fulah: Fulah,
    Ga: Ga,
    Gaelic: Gaelic,
    "Galibi Carib": {
      name: "Galibi Carib",
      names: ["Galibi Carib"],
      "iso639-2": "car",
      "iso639-1": null
    },
    Galician: Galician,
    Ganda: Ganda,
    Gayo: Gayo,
    Gbaya: Gbaya,
    Geez: Geez,
    Georgian: Georgian,
    German: German,
    "German, Low": {
      name: "German, Low",
      names: ["Low German", "Low Saxon", "German, Low", "Saxon, Low"],
      "iso639-2": "nds",
      "iso639-1": null
    },
    "German, Middle High (ca.1050-1500)": {
      name: "German, Middle High (ca.1050-1500)",
      names: ["German, Middle High (ca.1050-1500)"],
      "iso639-2": "gmh",
      "iso639-1": null
    },
    "German, Old High (ca.750-1050)": {
      name: "German, Old High (ca.750-1050)",
      names: ["German, Old High (ca.750-1050)"],
      "iso639-2": "goh",
      "iso639-1": null
    },
    "Germanic languages": {
      name: "Germanic languages",
      names: ["Germanic languages"],
      "iso639-2": "gem",
      "iso639-1": null
    },
    Gikuyu: Gikuyu,
    Gilbertese: Gilbertese,
    Gondi: Gondi,
    Gorontalo: Gorontalo,
    Gothic: Gothic,
    Grebo: Grebo,
    "Greek, Ancient (to 1453)": {
      name: "Greek, Ancient (to 1453)",
      names: ["Greek, Ancient (to 1453)"],
      "iso639-2": "grc",
      "iso639-1": null
    },
    "Greek, Modern (1453-)": {
      name: "Greek, Modern (1453-)",
      names: ["Greek, Modern (1453-)"],
      "iso639-2": "gre/ell",
      "iso639-1": "el"
    },
    Greenlandic: Greenlandic,
    Guarani: Guarani,
    Gujarati: Gujarati,
    "Gwich'in": {
      name: "Gwich'in",
      names: ["Gwich'in"],
      "iso639-2": "gwi",
      "iso639-1": null
    },
    Haida: Haida,
    Haitian: Haitian,
    "Haitian Creole": {
      name: "Haitian Creole",
      names: ["Haitian", "Haitian Creole"],
      "iso639-2": "hat",
      "iso639-1": "ht"
    },
    Hausa: Hausa,
    Hawaiian: Hawaiian,
    Hebrew: Hebrew,
    Herero: Herero,
    Hiligaynon: Hiligaynon,
    "Himachali languages": {
      name: "Himachali languages",
      names: ["Himachali languages", "Western Pahari languages"],
      "iso639-2": "him",
      "iso639-1": null
    },
    Hindi: Hindi,
    "Hiri Motu": {
      name: "Hiri Motu",
      names: ["Hiri Motu"],
      "iso639-2": "hmo",
      "iso639-1": "ho"
    },
    Hittite: Hittite,
    Hmong: Hmong,
    Hungarian: Hungarian,
    Hupa: Hupa,
    Iban: Iban,
    Icelandic: Icelandic,
    Ido: Ido,
    Igbo: Igbo,
    "Ijo languages": {
      name: "Ijo languages",
      names: ["Ijo languages"],
      "iso639-2": "ijo",
      "iso639-1": null
    },
    Iloko: Iloko,
    "Imperial Aramaic (700-300 BCE)": {
      name: "Imperial Aramaic (700-300 BCE)",
      names: ["Official Aramaic (700-300 BCE)", "Imperial Aramaic (700-300 BCE)"],
      "iso639-2": "arc",
      "iso639-1": null
    },
    "Inari Sami": {
      name: "Inari Sami",
      names: ["Inari Sami"],
      "iso639-2": "smn",
      "iso639-1": null
    },
    "Indic languages": {
      name: "Indic languages",
      names: ["Indic languages"],
      "iso639-2": "inc",
      "iso639-1": null
    },
    "Indo-European languages": {
      name: "Indo-European languages",
      names: ["Indo-European languages"],
      "iso639-2": "ine",
      "iso639-1": null
    },
    Indonesian: Indonesian,
    Ingush: Ingush,
    "Interlingua (International Auxiliary Language Association)": {
      name: "Interlingua (International Auxiliary Language Association)",
      names: ["Interlingua (International Auxiliary Language Association)"],
      "iso639-2": "ina",
      "iso639-1": "ia"
    },
    Interlingue: Interlingue,
    Inuktitut: Inuktitut,
    Inupiaq: Inupiaq,
    "Iranian languages": {
      name: "Iranian languages",
      names: ["Iranian languages"],
      "iso639-2": "ira",
      "iso639-1": null
    },
    Irish: Irish,
    "Irish, Middle (900-1200)": {
      name: "Irish, Middle (900-1200)",
      names: ["Irish, Middle (900-1200)"],
      "iso639-2": "mga",
      "iso639-1": null
    },
    "Irish, Old (to 900)": {
      name: "Irish, Old (to 900)",
      names: ["Irish, Old (to 900)"],
      "iso639-2": "sga",
      "iso639-1": null
    },
    "Iroquoian languages": {
      name: "Iroquoian languages",
      names: ["Iroquoian languages"],
      "iso639-2": "iro",
      "iso639-1": null
    },
    Italian: Italian,
    Japanese: Japanese,
    Javanese: Javanese,
    Jingpho: Jingpho,
    "Judeo-Arabic": {
      name: "Judeo-Arabic",
      names: ["Judeo-Arabic"],
      "iso639-2": "jrb",
      "iso639-1": null
    },
    "Judeo-Persian": {
      name: "Judeo-Persian",
      names: ["Judeo-Persian"],
      "iso639-2": "jpr",
      "iso639-1": null
    },
    Kabardian: Kabardian,
    Kabyle: Kabyle,
    Kachin: Kachin,
    Kalaallisut: Kalaallisut,
    Kalmyk: Kalmyk,
    Kamba: Kamba,
    Kannada: Kannada,
    Kanuri: Kanuri,
    Kapampangan: Kapampangan,
    "Kara-Kalpak": {
      name: "Kara-Kalpak",
      names: ["Kara-Kalpak"],
      "iso639-2": "kaa",
      "iso639-1": null
    },
    "Karachay-Balkar": {
      name: "Karachay-Balkar",
      names: ["Karachay-Balkar"],
      "iso639-2": "krc",
      "iso639-1": null
    },
    Karelian: Karelian,
    "Karen languages": {
      name: "Karen languages",
      names: ["Karen languages"],
      "iso639-2": "kar",
      "iso639-1": null
    },
    Kashmiri: Kashmiri,
    Kashubian: Kashubian,
    Kawi: Kawi,
    Kazakh: Kazakh,
    Khasi: Khasi,
    "Khoisan languages": {
      name: "Khoisan languages",
      names: ["Khoisan languages"],
      "iso639-2": "khi",
      "iso639-1": null
    },
    Khotanese: Khotanese,
    Kikuyu: Kikuyu,
    Kimbundu: Kimbundu,
    Kinyarwanda: Kinyarwanda,
    Kirdki: Kirdki,
    Kirghiz: Kirghiz,
    Kirmanjki: Kirmanjki,
    Klingon: Klingon,
    Komi: Komi,
    Kongo: Kongo,
    Konkani: Konkani,
    Korean: Korean,
    Kosraean: Kosraean,
    Kpelle: Kpelle,
    "Kru languages": {
      name: "Kru languages",
      names: ["Kru languages"],
      "iso639-2": "kro",
      "iso639-1": null
    },
    Kuanyama: Kuanyama,
    Kumyk: Kumyk,
    Kurdish: Kurdish,
    Kurukh: Kurukh,
    Kutenai: Kutenai,
    Kwanyama: Kwanyama,
    Kyrgyz: Kyrgyz,
    Ladino: Ladino,
    Lahnda: Lahnda,
    Lamba: Lamba,
    "Land Dayak languages": {
      name: "Land Dayak languages",
      names: ["Land Dayak languages"],
      "iso639-2": "day",
      "iso639-1": null
    },
    Lao: Lao,
    Latin: Latin,
    Latvian: Latvian,
    Leonese: Leonese,
    Letzeburgesch: Letzeburgesch,
    Lezghian: Lezghian,
    Limburgan: Limburgan,
    Limburger: Limburger,
    Limburgish: Limburgish,
    Lingala: Lingala,
    Lithuanian: Lithuanian,
    Lojban: Lojban,
    "Low German": {
      name: "Low German",
      names: ["Low German", "Low Saxon", "German, Low", "Saxon, Low"],
      "iso639-2": "nds",
      "iso639-1": null
    },
    "Low Saxon": {
      name: "Low Saxon",
      names: ["Low German", "Low Saxon", "German, Low", "Saxon, Low"],
      "iso639-2": "nds",
      "iso639-1": null
    },
    "Lower Sorbian": {
      name: "Lower Sorbian",
      names: ["Lower Sorbian"],
      "iso639-2": "dsb",
      "iso639-1": null
    },
    Lozi: Lozi,
    "Luba-Katanga": {
      name: "Luba-Katanga",
      names: ["Luba-Katanga"],
      "iso639-2": "lub",
      "iso639-1": "lu"
    },
    "Luba-Lulua": {
      name: "Luba-Lulua",
      names: ["Luba-Lulua"],
      "iso639-2": "lua",
      "iso639-1": null
    },
    Luiseno: Luiseno,
    "Lule Sami": {
      name: "Lule Sami",
      names: ["Lule Sami"],
      "iso639-2": "smj",
      "iso639-1": null
    },
    Lunda: Lunda,
    "Luo (Kenya and Tanzania)": {
      name: "Luo (Kenya and Tanzania)",
      names: ["Luo (Kenya and Tanzania)"],
      "iso639-2": "luo",
      "iso639-1": null
    },
    Lushai: Lushai,
    Luxembourgish: Luxembourgish,
    "Macedo-Romanian": {
      name: "Macedo-Romanian",
      names: ["Aromanian", "Arumanian", "Macedo-Romanian"],
      "iso639-2": "rup",
      "iso639-1": null
    },
    Macedonian: Macedonian,
    Madurese: Madurese,
    Magahi: Magahi,
    Maithili: Maithili,
    Makasar: Makasar,
    Malagasy: Malagasy,
    Malay: Malay,
    Malayalam: Malayalam,
    Maldivian: Maldivian,
    Maltese: Maltese,
    Manchu: Manchu,
    Mandar: Mandar,
    Mandingo: Mandingo,
    Manipuri: Manipuri,
    "Manobo languages": {
      name: "Manobo languages",
      names: ["Manobo languages"],
      "iso639-2": "mno",
      "iso639-1": null
    },
    Manx: Manx,
    Maori: Maori,
    Mapuche: Mapuche,
    Mapudungun: Mapudungun,
    Marathi: Marathi,
    Mari: Mari,
    Marshallese: Marshallese,
    Marwari: Marwari,
    Masai: Masai,
    "Mayan languages": {
      name: "Mayan languages",
      names: ["Mayan languages"],
      "iso639-2": "myn",
      "iso639-1": null
    },
    Mende: Mende,
    "Mi'kmaq": {
      name: "Mi'kmaq",
      names: ["Mi'kmaq", "Micmac"],
      "iso639-2": "mic",
      "iso639-1": null
    },
    Micmac: Micmac,
    Minangkabau: Minangkabau,
    Mirandese: Mirandese,
    Mohawk: Mohawk,
    Moksha: Moksha,
    Moldavian: Moldavian,
    Moldovan: Moldovan,
    "Mon-Khmer languages": {
      name: "Mon-Khmer languages",
      names: ["Mon-Khmer languages"],
      "iso639-2": "mkh",
      "iso639-1": null
    },
    Mong: Mong,
    Mongo: Mongo,
    Mongolian: Mongolian,
    Montenegrin: Montenegrin,
    Mossi: Mossi,
    "Multiple languages": {
      name: "Multiple languages",
      names: ["Multiple languages"],
      "iso639-2": "mul",
      "iso639-1": null
    },
    "Munda languages": {
      name: "Munda languages",
      names: ["Munda languages"],
      "iso639-2": "mun",
      "iso639-1": null
    },
    "N'Ko": {
      name: "N'Ko",
      names: ["N'Ko"],
      "iso639-2": "nqo",
      "iso639-1": null
    },
    "Nahuatl languages": {
      name: "Nahuatl languages",
      names: ["Nahuatl languages"],
      "iso639-2": "nah",
      "iso639-1": null
    },
    Nauru: Nauru,
    Navaho: Navaho,
    Navajo: Navajo,
    "Ndebele, North": {
      name: "Ndebele, North",
      names: ["Ndebele, North", "North Ndebele"],
      "iso639-2": "nde",
      "iso639-1": "nd"
    },
    "Ndebele, South": {
      name: "Ndebele, South",
      names: ["Ndebele, South", "South Ndebele"],
      "iso639-2": "nbl",
      "iso639-1": "nr"
    },
    Ndonga: Ndonga,
    Neapolitan: Neapolitan,
    "Nepal Bhasa": {
      name: "Nepal Bhasa",
      names: ["Nepal Bhasa", "Newari"],
      "iso639-2": "new",
      "iso639-1": null
    },
    Nepali: Nepali,
    Newari: Newari,
    Nias: Nias,
    "Niger-Kordofanian languages": {
      name: "Niger-Kordofanian languages",
      names: ["Niger-Kordofanian languages"],
      "iso639-2": "nic",
      "iso639-1": null
    },
    "Nilo-Saharan languages": {
      name: "Nilo-Saharan languages",
      names: ["Nilo-Saharan languages"],
      "iso639-2": "ssa",
      "iso639-1": null
    },
    Niuean: Niuean,
    "No linguistic content": {
      name: "No linguistic content",
      names: ["No linguistic content", "Not applicable"],
      "iso639-2": "zxx",
      "iso639-1": null
    },
    Nogai: Nogai,
    "Norse, Old": {
      name: "Norse, Old",
      names: ["Norse, Old"],
      "iso639-2": "non",
      "iso639-1": null
    },
    "North American Indian languages": {
      name: "North American Indian languages",
      names: ["North American Indian languages"],
      "iso639-2": "nai",
      "iso639-1": null
    },
    "North Ndebele": {
      name: "North Ndebele",
      names: ["Ndebele, North", "North Ndebele"],
      "iso639-2": "nde",
      "iso639-1": "nd"
    },
    "Northern Frisian": {
      name: "Northern Frisian",
      names: ["Northern Frisian"],
      "iso639-2": "frr",
      "iso639-1": null
    },
    "Northern Sami": {
      name: "Northern Sami",
      names: ["Northern Sami"],
      "iso639-2": "sme",
      "iso639-1": "se"
    },
    "Northern Sotho": {
      name: "Northern Sotho",
      names: ["Pedi", "Sepedi", "Northern Sotho"],
      "iso639-2": "nso",
      "iso639-1": null
    },
    Norwegian: Norwegian,
    "Norwegian Bokmål": {
      name: "Norwegian Bokmål",
      names: ["Bokmål, Norwegian", "Norwegian Bokmål"],
      "iso639-2": "nob",
      "iso639-1": "nb"
    },
    "Norwegian Nynorsk": {
      name: "Norwegian Nynorsk",
      names: ["Norwegian Nynorsk", "Nynorsk, Norwegian"],
      "iso639-2": "nno",
      "iso639-1": "nn"
    },
    "Not applicable": {
      name: "Not applicable",
      names: ["No linguistic content", "Not applicable"],
      "iso639-2": "zxx",
      "iso639-1": null
    },
    "Nubian languages": {
      name: "Nubian languages",
      names: ["Nubian languages"],
      "iso639-2": "nub",
      "iso639-1": null
    },
    Nuosu: Nuosu,
    Nyamwezi: Nyamwezi,
    Nyanja: Nyanja,
    Nyankole: Nyankole,
    "Nynorsk, Norwegian": {
      name: "Nynorsk, Norwegian",
      names: ["Norwegian Nynorsk", "Nynorsk, Norwegian"],
      "iso639-2": "nno",
      "iso639-1": "nn"
    },
    Nyoro: Nyoro,
    Nzima: Nzima,
    Occidental: Occidental,
    "Occitan (post 1500)": {
      name: "Occitan (post 1500)",
      names: ["Occitan (post 1500)"],
      "iso639-2": "oci",
      "iso639-1": "oc"
    },
    "Occitan, Old (to 1500)": {
      name: "Occitan, Old (to 1500)",
      names: ["Provençal, Old (to 1500)", "Occitan, Old (to 1500)"],
      "iso639-2": "pro",
      "iso639-1": null
    },
    "Official Aramaic (700-300 BCE)": {
      name: "Official Aramaic (700-300 BCE)",
      names: ["Official Aramaic (700-300 BCE)", "Imperial Aramaic (700-300 BCE)"],
      "iso639-2": "arc",
      "iso639-1": null
    },
    Oirat: Oirat,
    Ojibwa: Ojibwa,
    "Old Bulgarian": {
      name: "Old Bulgarian",
      names: ["Church Slavic", "Old Slavonic", "Church Slavonic", "Old Bulgarian", "Old Church Slavonic"],
      "iso639-2": "chu",
      "iso639-1": "cu"
    },
    "Old Church Slavonic": {
      name: "Old Church Slavonic",
      names: ["Church Slavic", "Old Slavonic", "Church Slavonic", "Old Bulgarian", "Old Church Slavonic"],
      "iso639-2": "chu",
      "iso639-1": "cu"
    },
    "Old Newari": {
      name: "Old Newari",
      names: ["Classical Newari", "Old Newari", "Classical Nepal Bhasa"],
      "iso639-2": "nwc",
      "iso639-1": null
    },
    "Old Slavonic": {
      name: "Old Slavonic",
      names: ["Church Slavic", "Old Slavonic", "Church Slavonic", "Old Bulgarian", "Old Church Slavonic"],
      "iso639-2": "chu",
      "iso639-1": "cu"
    },
    Oriya: Oriya,
    Oromo: Oromo,
    Osage: Osage,
    Ossetian: Ossetian,
    Ossetic: Ossetic,
    "Otomian languages": {
      name: "Otomian languages",
      names: ["Otomian languages"],
      "iso639-2": "oto",
      "iso639-1": null
    },
    Pahlavi: Pahlavi,
    Palauan: Palauan,
    Pali: Pali,
    Pampanga: Pampanga,
    Pangasinan: Pangasinan,
    Panjabi: Panjabi,
    Papiamento: Papiamento,
    "Papuan languages": {
      name: "Papuan languages",
      names: ["Papuan languages"],
      "iso639-2": "paa",
      "iso639-1": null
    },
    Pashto: Pashto,
    Pedi: Pedi,
    Persian: Persian,
    "Persian, Old (ca.600-400 B.C.)": {
      name: "Persian, Old (ca.600-400 B.C.)",
      names: ["Persian, Old (ca.600-400 B.C.)"],
      "iso639-2": "peo",
      "iso639-1": null
    },
    "Philippine languages": {
      name: "Philippine languages",
      names: ["Philippine languages"],
      "iso639-2": "phi",
      "iso639-1": null
    },
    Phoenician: Phoenician,
    Pilipino: Pilipino,
    Pohnpeian: Pohnpeian,
    Polish: Polish,
    Portuguese: Portuguese,
    "Prakrit languages": {
      name: "Prakrit languages",
      names: ["Prakrit languages"],
      "iso639-2": "pra",
      "iso639-1": null
    },
    "Provençal, Old (to 1500)": {
      name: "Provençal, Old (to 1500)",
      names: ["Provençal, Old (to 1500)", "Occitan, Old (to 1500)"],
      "iso639-2": "pro",
      "iso639-1": null
    },
    Punjabi: Punjabi,
    Pushto: Pushto,
    Quechua: Quechua,
    Rajasthani: Rajasthani,
    Rapanui: Rapanui,
    Rarotongan: Rarotongan,
    "Reserved for local use": {
      name: "Reserved for local use",
      names: ["Reserved for local use"],
      "iso639-2": "qaa-qtz",
      "iso639-1": null
    },
    "Romance languages": {
      name: "Romance languages",
      names: ["Romance languages"],
      "iso639-2": "roa",
      "iso639-1": null
    },
    Romanian: Romanian,
    Romansh: Romansh,
    Romany: Romany,
    Rundi: Rundi,
    Russian: Russian,
    Sakan: Sakan,
    "Salishan languages": {
      name: "Salishan languages",
      names: ["Salishan languages"],
      "iso639-2": "sal",
      "iso639-1": null
    },
    "Samaritan Aramaic": {
      name: "Samaritan Aramaic",
      names: ["Samaritan Aramaic"],
      "iso639-2": "sam",
      "iso639-1": null
    },
    "Sami languages": {
      name: "Sami languages",
      names: ["Sami languages"],
      "iso639-2": "smi",
      "iso639-1": null
    },
    Samoan: Samoan,
    Sandawe: Sandawe,
    Sango: Sango,
    Sanskrit: Sanskrit,
    Santali: Santali,
    Sardinian: Sardinian,
    Sasak: Sasak,
    "Saxon, Low": {
      name: "Saxon, Low",
      names: ["Low German", "Low Saxon", "German, Low", "Saxon, Low"],
      "iso639-2": "nds",
      "iso639-1": null
    },
    Scots: Scots,
    "Scottish Gaelic": {
      name: "Scottish Gaelic",
      names: ["Gaelic", "Scottish Gaelic"],
      "iso639-2": "gla",
      "iso639-1": "gd"
    },
    Selkup: Selkup,
    "Semitic languages": {
      name: "Semitic languages",
      names: ["Semitic languages"],
      "iso639-2": "sem",
      "iso639-1": null
    },
    Sepedi: Sepedi,
    Serbian: Serbian,
    Serer: Serer,
    Shan: Shan,
    Shona: Shona,
    "Sichuan Yi": {
      name: "Sichuan Yi",
      names: ["Sichuan Yi", "Nuosu"],
      "iso639-2": "iii",
      "iso639-1": "ii"
    },
    Sicilian: Sicilian,
    Sidamo: Sidamo,
    "Sign Languages": {
      name: "Sign Languages",
      names: ["Sign Languages"],
      "iso639-2": "sgn",
      "iso639-1": null
    },
    Siksika: Siksika,
    Sindhi: Sindhi,
    Sinhala: Sinhala,
    Sinhalese: Sinhalese,
    "Sino-Tibetan languages": {
      name: "Sino-Tibetan languages",
      names: ["Sino-Tibetan languages"],
      "iso639-2": "sit",
      "iso639-1": null
    },
    "Siouan languages": {
      name: "Siouan languages",
      names: ["Siouan languages"],
      "iso639-2": "sio",
      "iso639-1": null
    },
    "Skolt Sami": {
      name: "Skolt Sami",
      names: ["Skolt Sami"],
      "iso639-2": "sms",
      "iso639-1": null
    },
    "Slave (Athapascan)": {
      name: "Slave (Athapascan)",
      names: ["Slave (Athapascan)"],
      "iso639-2": "den",
      "iso639-1": null
    },
    "Slavic languages": {
      name: "Slavic languages",
      names: ["Slavic languages"],
      "iso639-2": "sla",
      "iso639-1": null
    },
    Slovak: Slovak,
    Slovenian: Slovenian,
    Sogdian: Sogdian,
    Somali: Somali,
    "Songhai languages": {
      name: "Songhai languages",
      names: ["Songhai languages"],
      "iso639-2": "son",
      "iso639-1": null
    },
    Soninke: Soninke,
    "Sorbian languages": {
      name: "Sorbian languages",
      names: ["Sorbian languages"],
      "iso639-2": "wen",
      "iso639-1": null
    },
    "Sotho, Northern": {
      name: "Sotho, Northern",
      names: ["Pedi", "Sepedi", "Northern Sotho"],
      "iso639-2": "nso",
      "iso639-1": null
    },
    "Sotho, Southern": {
      name: "Sotho, Southern",
      names: ["Sotho, Southern"],
      "iso639-2": "sot",
      "iso639-1": "st"
    },
    "South American Indian languages": {
      name: "South American Indian languages",
      names: ["South American Indian languages"],
      "iso639-2": "sai",
      "iso639-1": null
    },
    "South Ndebele": {
      name: "South Ndebele",
      names: ["Ndebele, South", "South Ndebele"],
      "iso639-2": "nbl",
      "iso639-1": "nr"
    },
    "Southern Altai": {
      name: "Southern Altai",
      names: ["Southern Altai"],
      "iso639-2": "alt",
      "iso639-1": null
    },
    "Southern Sami": {
      name: "Southern Sami",
      names: ["Southern Sami"],
      "iso639-2": "sma",
      "iso639-1": null
    },
    Spanish: Spanish,
    "Sranan Tongo": {
      name: "Sranan Tongo",
      names: ["Sranan Tongo"],
      "iso639-2": "srn",
      "iso639-1": null
    },
    "Standard Moroccan Tamazight": {
      name: "Standard Moroccan Tamazight",
      names: ["Standard Moroccan Tamazight"],
      "iso639-2": "zgh",
      "iso639-1": null
    },
    Sukuma: Sukuma,
    Sumerian: Sumerian,
    Sundanese: Sundanese,
    Susu: Susu,
    Swahili: Swahili,
    Swati: Swati,
    Swedish: Swedish,
    "Swiss German": {
      name: "Swiss German",
      names: ["Swiss German", "Alemannic", "Alsatian"],
      "iso639-2": "gsw",
      "iso639-1": null
    },
    Syriac: Syriac,
    Tagalog: Tagalog,
    Tahitian: Tahitian,
    "Tai languages": {
      name: "Tai languages",
      names: ["Tai languages"],
      "iso639-2": "tai",
      "iso639-1": null
    },
    Tajik: Tajik,
    Tamashek: Tamashek,
    Tamil: Tamil,
    Tatar: Tatar,
    Telugu: Telugu,
    Tereno: Tereno,
    Tetum: Tetum,
    Thai: Thai,
    Tibetan: Tibetan,
    Tigre: Tigre,
    Tigrinya: Tigrinya,
    Timne: Timne,
    Tiv: Tiv,
    "tlhIngan-Hol": {
      name: "tlhIngan-Hol",
      names: ["Klingon", "tlhIngan-Hol"],
      "iso639-2": "tlh",
      "iso639-1": null
    },
    Tlingit: Tlingit,
    "Tok Pisin": {
      name: "Tok Pisin",
      names: ["Tok Pisin"],
      "iso639-2": "tpi",
      "iso639-1": null
    },
    Tokelau: Tokelau,
    "Tonga (Nyasa)": {
      name: "Tonga (Nyasa)",
      names: ["Tonga (Nyasa)"],
      "iso639-2": "tog",
      "iso639-1": null
    },
    "Tonga (Tonga Islands)": {
      name: "Tonga (Tonga Islands)",
      names: ["Tonga (Tonga Islands)"],
      "iso639-2": "ton",
      "iso639-1": "to"
    },
    Tsimshian: Tsimshian,
    Tsonga: Tsonga,
    Tswana: Tswana,
    Tumbuka: Tumbuka,
    "Tupi languages": {
      name: "Tupi languages",
      names: ["Tupi languages"],
      "iso639-2": "tup",
      "iso639-1": null
    },
    Turkish: Turkish,
    "Turkish, Ottoman (1500-1928)": {
      name: "Turkish, Ottoman (1500-1928)",
      names: ["Turkish, Ottoman (1500-1928)"],
      "iso639-2": "ota",
      "iso639-1": null
    },
    Turkmen: Turkmen,
    Tuvalu: Tuvalu,
    Tuvinian: Tuvinian,
    Twi: Twi,
    Udmurt: Udmurt,
    Ugaritic: Ugaritic,
    Uighur: Uighur,
    Ukrainian: Ukrainian,
    Umbundu: Umbundu,
    "Uncoded languages": {
      name: "Uncoded languages",
      names: ["Uncoded languages"],
      "iso639-2": "mis",
      "iso639-1": null
    },
    Undetermined: Undetermined,
    "Upper Sorbian": {
      name: "Upper Sorbian",
      names: ["Upper Sorbian"],
      "iso639-2": "hsb",
      "iso639-1": null
    },
    Urdu: Urdu,
    Uyghur: Uyghur,
    Uzbek: Uzbek,
    Vai: Vai,
    Valencian: Valencian,
    Venda: Venda,
    Vietnamese: Vietnamese,
    "Volapük": {
      name: "Volapük",
      names: ["Volapük"],
      "iso639-2": "vol",
      "iso639-1": "vo"
    },
    Votic: Votic,
    "Wakashan languages": {
      name: "Wakashan languages",
      names: ["Wakashan languages"],
      "iso639-2": "wak",
      "iso639-1": null
    },
    Walloon: Walloon,
    Waray: Waray,
    Washo: Washo,
    Welsh: Welsh,
    "Western Frisian": {
      name: "Western Frisian",
      names: ["Western Frisian"],
      "iso639-2": "fry",
      "iso639-1": "fy"
    },
    "Western Pahari languages": {
      name: "Western Pahari languages",
      names: ["Himachali languages", "Western Pahari languages"],
      "iso639-2": "him",
      "iso639-1": null
    },
    Wolaitta: Wolaitta,
    Wolaytta: Wolaytta,
    Wolof: Wolof,
    Xhosa: Xhosa,
    Yakut: Yakut,
    Yao: Yao,
    Yapese: Yapese,
    Yiddish: Yiddish,
    Yoruba: Yoruba,
    "Yupik languages": {
      name: "Yupik languages",
      names: ["Yupik languages"],
      "iso639-2": "ypk",
      "iso639-1": null
    },
    "Zande languages": {
      name: "Zande languages",
      names: ["Zande languages"],
      "iso639-2": "znd",
      "iso639-1": null
    },
    Zapotec: Zapotec,
    Zaza: Zaza,
    Zazaki: Zazaki,
    Zenaga: Zenaga,
    Zhuang: Zhuang,
    Zulu: Zulu,
    Zuni: Zuni
  };

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var locales = [];
  var isoKeys = Object.keys(iso);
  Object.keys(lcid).map(function (id) {
    var locale = lcid[id];
    var isoLanguage = isoKeys.find(function (name) {
      return name.toLowerCase() === locale.language.toLowerCase();
    });

    if (locale.location && isoLanguage) {
      var _locales$push;

      locales.push((_locales$push = {}, _defineProperty(_locales$push, "name", locale.language), _defineProperty(_locales$push, "location", locale.location), _defineProperty(_locales$push, "tag", locale.tag), _defineProperty(_locales$push, "lcid", locale.id), _defineProperty(_locales$push, "iso639-2", iso[isoLanguage]["iso639-2"]), _defineProperty(_locales$push, "iso639-1", iso[isoLanguage]["iso639-1"]), _locales$push));
    }
  });
  var defaultLocales = {
    ar: "ar-SA",
    ca: "ca-ES",
    da: "da-DK",
    en: "en-US",
    ko: "ko-KR",
    pa: "pa-IN",
    pt: "pt-BR",
    sv: "sv-SE"
  };
  /**
   * Converts a 2-digit language into a full language-LOCATION locale.
   * @param {String} locale
   */

  function findLocale(locale) {
    if (typeof locale !== "string" || locale.length === 5) return locale;
    if (defaultLocales[locale]) return defaultLocales[locale];
    var list = locales.filter(function (d) {
      return d["iso639-1"] === locale;
    });
    if (!list.length) return locale;else if (list.length === 1) return list[0].tag;else if (list.find(function (d) {
      return d.tag === "".concat(locale, "-").concat(locale.toUpperCase());
    })) return "".concat(locale, "-").concat(locale.toUpperCase());else return list[0].tag;
  }
  /**
      @function s
      @desc Returns 4 random characters, used for constructing unique identifiers.
      @private
  */


  function s() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  /**
      @function uuid
      @summary Returns a unique identifier.
  */


  function uuid() {
    return "".concat(s()).concat(s(), "-").concat(s(), "-").concat(s(), "-").concat(s(), "-").concat(s()).concat(s()).concat(s());
  }
  /**
      @constant RESET
      @desc String constant used to reset an individual config property.
  */


  var RESET = "D3PLUS-COMMON-RESET";
  var esES = {
    "and": "y",
    "Back": "Atrás",
    "Click to Expand": "Clic para Ampliar",
    "Click to Hide": "Clic para Ocultar",
    "Click to Highlight": "Clic para Resaltar",
    "Click to Reset": "Clic para Restablecer",
    "Download": "Descargar",
    "Loading Visualization": "Cargando Visualización",
    "No Data Available": "Datos No Disponibles",
    "Powered by D3plus": "Funciona con D3plus",
    "Share": "Porcentaje",
    "Shift+Click to Hide": "Mayús+Clic para Ocultar",
    "Total": "Total",
    "Values": "Valores"
  };
  var dictionaries = {
    "es-ES": esES
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }
  /**
      @desc Recursive function that resets nested Object configs.
      @param {Object} obj
      @param {Object} defaults
      @private
  */


  function nestedReset(obj, defaults) {
    if (isObject(obj)) {
      for (var nestedKey in obj) {
        if ({}.hasOwnProperty.call(obj, nestedKey) && !nestedKey.startsWith("_")) {
          var defaultValue = defaults && isObject(defaults) ? defaults[nestedKey] : undefined;

          if (obj[nestedKey] === RESET) {
            if (defaultValue) obj[nestedKey] = defaultValue;else delete obj[nestedKey];
          } else if (isObject(obj[nestedKey])) {
            nestedReset(obj[nestedKey], defaultValue);
          }
        }
      }
    }
  }
  /**
   * @desc finds all prototype methods of a class and it's parent classes
   * @param {*} obj
   * @private
   */


  function getAllMethods(obj) {
    var props = [];

    do {
      props = props.concat(Object.getOwnPropertyNames(obj));
      obj = Object.getPrototypeOf(obj);
    } while (obj && obj !== Object.prototype);

    return props.filter(function (e) {
      return e.indexOf("_") !== 0 && !["config", "constructor", "parent", "render"].includes(e);
    });
  }
  /**
      @class BaseClass
      @summary An abstract class that contains some global methods and functionality.
  */


  var BaseClass = /*#__PURE__*/function () {
    /**
        @memberof BaseClass
        @desc Invoked when creating a new class instance, and sets any default parameters.
        @private
    */
    function BaseClass() {
      var _this = this;

      _classCallCheck(this, BaseClass);

      this._locale = "en-US";
      this._on = {};
      this._parent = {};

      this._translate = function (d) {
        var locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _this._locale;
        var dictionary = dictionaries[locale];
        return dictionary && dictionary[d] ? dictionary[d] : d;
      };

      this._uuid = uuid();
    }
    /**
        @memberof BaseClass
        @desc If *value* is specified, sets the methods that correspond to the key/value pairs and returns this class. If *value* is not specified, returns the current configuration.
        @param {Object} [*value*]
        @chainable
    */


    _createClass(BaseClass, [{
      key: "config",
      value: function config(_) {
        var _this2 = this;

        if (!this._configDefault) {
          var config = {};
          getAllMethods(this.__proto__).forEach(function (k) {
            var v = _this2[k]();

            if (v !== _this2) config[k] = isObject(v) ? assign({}, v) : v;
          });
          this._configDefault = config;
        }

        if (arguments.length) {
          for (var k in _) {
            if ({}.hasOwnProperty.call(_, k) && k in this) {
              var v = _[k];

              if (v === RESET) {
                if (k === "on") this._on = this._configDefault[k];else this[k](this._configDefault[k]);
              } else {
                nestedReset(v, this._configDefault[k]);
                this[k](v);
              }
            }
          }

          return this;
        } else {
          var _config = {};
          getAllMethods(this.__proto__).forEach(function (k) {
            _config[k] = _this2[k]();
          });
          return _config;
        }
      }
      /**
          @memberof BaseClass
          @desc Sets the locale used for all text and number formatting. This method supports the locales defined in [d3plus-format](https://github.com/d3plus/d3plus-format/blob/master/src/locale.js). The locale can be defined as a complex Object (like in d3plus-format), a locale code (like "en-US"), or a 2-digit language code (like "en"). If a 2-digit code is provided, the "findLocale" function is used to identify the most approximate locale from d3plus-format.
          @param {Object|String} [*value* = "en-US"]
          @chainable
          @example
          {
            separator: "",
            suffixes: ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "B", "t", "q", "Q", "Z", "Y"],
            grouping: [3],
            delimiters: {
              thousands: ",",
              decimal: "."
            },
            currency: ["$", ""]
          }
      */

    }, {
      key: "locale",
      value: function locale(_) {
        return arguments.length ? (this._locale = findLocale(_), this) : this._locale;
      }
      /**
          @memberof BaseClass
          @desc Adds or removes a *listener* to each object for the specified event *typenames*. If a *listener* is not specified, returns the currently assigned listener for the specified event *typename*. Mirrors the core [d3-selection](https://github.com/d3/d3-selection#selection_on) behavior.
          @param {String} [*typenames*]
          @param {Function} [*listener*]
          @chainable
          @example <caption>By default, listeners apply globally to all objects, however, passing a namespace with the class name gives control over specific elements:</caption>
      new Plot
      .on("click.Shape", function(d) {
        console.log("data for shape clicked:", d);
      })
      .on("click.Legend", function(d) {
        console.log("data for legend clicked:", d);
      })
      */

    }, {
      key: "on",
      value: function on(_, f) {
        return arguments.length === 2 ? (this._on[_] = f, this) : arguments.length ? typeof _ === "string" ? this._on[_] : (this._on = Object.assign({}, this._on, _), this) : this._on;
      }
      /**
          @memberof Viz
          @desc If *value* is specified, sets the parent config used by the wrapper and returns the current class instance.
          @param {Object} [*value*]
          @chainable
      */

    }, {
      key: "parent",
      value: function parent(_) {
        return arguments.length ? (this._parent = _, this) : this._parent;
      }
      /**
          @memberof BaseClass
          @desc Defines how informational text strings should be displayed. By default, this function will try to find the string in question (which is the first argument provided to this function) inside of an internally managed translation Object. If you'd like to override to use custom text, simply pass this method your own custom formatting function.
          @param {Function} [*value*]
          @chainable
          @example <caption>For example, if we wanted to only change the string "Back" and allow all other string to return in English:</caption>
      .translate(function(d) {
      return d === "Back" ? "Get outta here" : d;
      })
      */

    }, {
      key: "translate",
      value: function translate(_) {
        return arguments.length ? (this._translate = _, this) : this._translate;
      }
      /**
          @memberof Viz
          @desc If *value* is specified, sets the config method for each shape and returns the current class instance.
          @param {Object} [*value*]
          @chainable
      */

    }, {
      key: "shapeConfig",
      value: function shapeConfig(_) {
        return arguments.length ? (this._shapeConfig = assign(this._shapeConfig, _), this) : this._shapeConfig;
      }
    }]);

    return BaseClass;
  }();
  /**
      @function constant
      @desc Wraps non-function variables in a simple return function.
      @param {Array|Number|Object|String} value The value to be returned from the function.
      @example <caption>this</caption>
  constant(42);
      @example <caption>returns this</caption>
  function() {
    return 42;
  }
  */


  function constant$2(value) {
    return function constant() {
      return value;
    };
  }
  /**
   @function parseSides
   @desc Converts a string of directional CSS shorthand values into an object with the values expanded.
   @param {String|Number} sides The CSS shorthand string to expand.
   */


  function parseSides(sides) {
    var values;
    if (typeof sides === "number") values = [sides];else values = sides.split(/\s+/);
    if (values.length === 1) values = [values[0], values[0], values[0], values[0]];else if (values.length === 2) values = values.concat(values);else if (values.length === 3) values.push(values[1]);
    return ["top", "right", "bottom", "left"].reduce(function (acc, direction, i) {
      var value = parseFloat(values[i]);
      acc[direction] = value || 0;
      return acc;
    }, {});
  } // scraped from http://www.fileformat.info/info/unicode/category/Mc/list.htm
  // and http://www.fileformat.info/info/unicode/category/Mn/list.htm
  // JSON.stringify([].slice.call(document.getElementsByClassName("table-list")[0].getElementsByTagName("tr")).filter(function(d){ return d.getElementsByTagName("a").length && d.getElementsByTagName("a")[0].innerHTML.length === 6; }).map(function(d){ return d.getElementsByTagName("a")[0].innerHTML.replace("U", "u").replace("+", ""); }).sort());
  // The following unicode characters combine to form new characters and should never be split from surrounding characters.


  var a = ["u0903", "u093B", "u093E", "u093F", "u0940", "u0949", "u094A", "u094B", "u094C", "u094E", "u094F", "u0982", "u0983", "u09BE", "u09BF", "u09C0", "u09C7", "u09C8", "u09CB", "u09CC", "u09D7", "u0A03", "u0A3E", "u0A3F", "u0A40", "u0A83", "u0ABE", "u0ABF", "u0AC0", "u0AC9", "u0ACB", "u0ACC", "u0B02", "u0B03", "u0B3E", "u0B40", "u0B47", "u0B48", "u0B4B", "u0B4C", "u0B57", "u0BBE", "u0BBF", "u0BC1", "u0BC2", "u0BC6", "u0BC7", "u0BC8", "u0BCA", "u0BCB", "u0BCC", "u0BD7", "u0C01", "u0C02", "u0C03", "u0C41", "u0C42", "u0C43", "u0C44", "u0C82", "u0C83", "u0CBE", "u0CC0", "u0CC1", "u0CC2", "u0CC3", "u0CC4", "u0CC7", "u0CC8", "u0CCA", "u0CCB", "u0CD5", "u0CD6", "u0D02", "u0D03", "u0D3E", "u0D3F", "u0D40", "u0D46", "u0D47", "u0D48", "u0D4A", "u0D4B", "u0D4C", "u0D57", "u0D82", "u0D83", "u0DCF", "u0DD0", "u0DD1", "u0DD8", "u0DD9", "u0DDA", "u0DDB", "u0DDC", "u0DDD", "u0DDE", "u0DDF", "u0DF2", "u0DF3", "u0F3E", "u0F3F", "u0F7F", "u102B", "u102C", "u1031", "u1038", "u103B", "u103C", "u1056", "u1057", "u1062", "u1063", "u1064", "u1067", "u1068", "u1069", "u106A", "u106B", "u106C", "u106D", "u1083", "u1084", "u1087", "u1088", "u1089", "u108A", "u108B", "u108C", "u108F", "u109A", "u109B", "u109C", "u17B6", "u17BE", "u17BF", "u17C0", "u17C1", "u17C2", "u17C3", "u17C4", "u17C5", "u17C7", "u17C8", "u1923", "u1924", "u1925", "u1926", "u1929", "u192A", "u192B", "u1930", "u1931", "u1933", "u1934", "u1935", "u1936", "u1937", "u1938", "u1A19", "u1A1A", "u1A55", "u1A57", "u1A61", "u1A63", "u1A64", "u1A6D", "u1A6E", "u1A6F", "u1A70", "u1A71", "u1A72", "u1B04", "u1B35", "u1B3B", "u1B3D", "u1B3E", "u1B3F", "u1B40", "u1B41", "u1B43", "u1B44", "u1B82", "u1BA1", "u1BA6", "u1BA7", "u1BAA", "u1BE7", "u1BEA", "u1BEB", "u1BEC", "u1BEE", "u1BF2", "u1BF3", "u1C24", "u1C25", "u1C26", "u1C27", "u1C28", "u1C29", "u1C2A", "u1C2B", "u1C34", "u1C35", "u1CE1", "u1CF2", "u1CF3", "u302E", "u302F", "uA823", "uA824", "uA827", "uA880", "uA881", "uA8B4", "uA8B5", "uA8B6", "uA8B7", "uA8B8", "uA8B9", "uA8BA", "uA8BB", "uA8BC", "uA8BD", "uA8BE", "uA8BF", "uA8C0", "uA8C1", "uA8C2", "uA8C3", "uA952", "uA953", "uA983", "uA9B4", "uA9B5", "uA9BA", "uA9BB", "uA9BD", "uA9BE", "uA9BF", "uA9C0", "uAA2F", "uAA30", "uAA33", "uAA34", "uAA4D", "uAA7B", "uAA7D", "uAAEB", "uAAEE", "uAAEF", "uAAF5", "uABE3", "uABE4", "uABE6", "uABE7", "uABE9", "uABEA", "uABEC"];
  var b = ["u0300", "u0301", "u0302", "u0303", "u0304", "u0305", "u0306", "u0307", "u0308", "u0309", "u030A", "u030B", "u030C", "u030D", "u030E", "u030F", "u0310", "u0311", "u0312", "u0313", "u0314", "u0315", "u0316", "u0317", "u0318", "u0319", "u031A", "u031B", "u031C", "u031D", "u031E", "u031F", "u0320", "u0321", "u0322", "u0323", "u0324", "u0325", "u0326", "u0327", "u0328", "u0329", "u032A", "u032B", "u032C", "u032D", "u032E", "u032F", "u0330", "u0331", "u0332", "u0333", "u0334", "u0335", "u0336", "u0337", "u0338", "u0339", "u033A", "u033B", "u033C", "u033D", "u033E", "u033F", "u0340", "u0341", "u0342", "u0343", "u0344", "u0345", "u0346", "u0347", "u0348", "u0349", "u034A", "u034B", "u034C", "u034D", "u034E", "u034F", "u0350", "u0351", "u0352", "u0353", "u0354", "u0355", "u0356", "u0357", "u0358", "u0359", "u035A", "u035B", "u035C", "u035D", "u035E", "u035F", "u0360", "u0361", "u0362", "u0363", "u0364", "u0365", "u0366", "u0367", "u0368", "u0369", "u036A", "u036B", "u036C", "u036D", "u036E", "u036F", "u0483", "u0484", "u0485", "u0486", "u0487", "u0591", "u0592", "u0593", "u0594", "u0595", "u0596", "u0597", "u0598", "u0599", "u059A", "u059B", "u059C", "u059D", "u059E", "u059F", "u05A0", "u05A1", "u05A2", "u05A3", "u05A4", "u05A5", "u05A6", "u05A7", "u05A8", "u05A9", "u05AA", "u05AB", "u05AC", "u05AD", "u05AE", "u05AF", "u05B0", "u05B1", "u05B2", "u05B3", "u05B4", "u05B5", "u05B6", "u05B7", "u05B8", "u05B9", "u05BA", "u05BB", "u05BC", "u05BD", "u05BF", "u05C1", "u05C2", "u05C4", "u05C5", "u05C7", "u0610", "u0611", "u0612", "u0613", "u0614", "u0615", "u0616", "u0617", "u0618", "u0619", "u061A", "u064B", "u064C", "u064D", "u064E", "u064F", "u0650", "u0651", "u0652", "u0653", "u0654", "u0655", "u0656", "u0657", "u0658", "u0659", "u065A", "u065B", "u065C", "u065D", "u065E", "u065F", "u0670", "u06D6", "u06D7", "u06D8", "u06D9", "u06DA", "u06DB", "u06DC", "u06DF", "u06E0", "u06E1", "u06E2", "u06E3", "u06E4", "u06E7", "u06E8", "u06EA", "u06EB", "u06EC", "u06ED", "u0711", "u0730", "u0731", "u0732", "u0733", "u0734", "u0735", "u0736", "u0737", "u0738", "u0739", "u073A", "u073B", "u073C", "u073D", "u073E", "u073F", "u0740", "u0741", "u0742", "u0743", "u0744", "u0745", "u0746", "u0747", "u0748", "u0749", "u074A", "u07A6", "u07A7", "u07A8", "u07A9", "u07AA", "u07AB", "u07AC", "u07AD", "u07AE", "u07AF", "u07B0", "u07EB", "u07EC", "u07ED", "u07EE", "u07EF", "u07F0", "u07F1", "u07F2", "u07F3", "u0816", "u0817", "u0818", "u0819", "u081B", "u081C", "u081D", "u081E", "u081F", "u0820", "u0821", "u0822", "u0823", "u0825", "u0826", "u0827", "u0829", "u082A", "u082B", "u082C", "u082D", "u0859", "u085A", "u085B", "u08E3", "u08E4", "u08E5", "u08E6", "u08E7", "u08E8", "u08E9", "u08EA", "u08EB", "u08EC", "u08ED", "u08EE", "u08EF", "u08F0", "u08F1", "u08F2", "u08F3", "u08F4", "u08F5", "u08F6", "u08F7", "u08F8", "u08F9", "u08FA", "u08FB", "u08FC", "u08FD", "u08FE", "u08FF", "u0900", "u0901", "u0902", "u093A", "u093C", "u0941", "u0942", "u0943", "u0944", "u0945", "u0946", "u0947", "u0948", "u094D", "u0951", "u0952", "u0953", "u0954", "u0955", "u0956", "u0957", "u0962", "u0963", "u0981", "u09BC", "u09C1", "u09C2", "u09C3", "u09C4", "u09CD", "u09E2", "u09E3", "u0A01", "u0A02", "u0A3C", "u0A41", "u0A42", "u0A47", "u0A48", "u0A4B", "u0A4C", "u0A4D", "u0A51", "u0A70", "u0A71", "u0A75", "u0A81", "u0A82", "u0ABC", "u0AC1", "u0AC2", "u0AC3", "u0AC4", "u0AC5", "u0AC7", "u0AC8", "u0ACD", "u0AE2", "u0AE3", "u0B01", "u0B3C", "u0B3F", "u0B41", "u0B42", "u0B43", "u0B44", "u0B4D", "u0B56", "u0B62", "u0B63", "u0B82", "u0BC0", "u0BCD", "u0C00", "u0C3E", "u0C3F", "u0C40", "u0C46", "u0C47", "u0C48", "u0C4A", "u0C4B", "u0C4C", "u0C4D", "u0C55", "u0C56", "u0C62", "u0C63", "u0C81", "u0CBC", "u0CBF", "u0CC6", "u0CCC", "u0CCD", "u0CE2", "u0CE3", "u0D01", "u0D41", "u0D42", "u0D43", "u0D44", "u0D4D", "u0D62", "u0D63", "u0DCA", "u0DD2", "u0DD3", "u0DD4", "u0DD6", "u0E31", "u0E34", "u0E35", "u0E36", "u0E37", "u0E38", "u0E39", "u0E3A", "u0E47", "u0E48", "u0E49", "u0E4A", "u0E4B", "u0E4C", "u0E4D", "u0E4E", "u0EB1", "u0EB4", "u0EB5", "u0EB6", "u0EB7", "u0EB8", "u0EB9", "u0EBB", "u0EBC", "u0EC8", "u0EC9", "u0ECA", "u0ECB", "u0ECC", "u0ECD", "u0F18", "u0F19", "u0F35", "u0F37", "u0F39", "u0F71", "u0F72", "u0F73", "u0F74", "u0F75", "u0F76", "u0F77", "u0F78", "u0F79", "u0F7A", "u0F7B", "u0F7C", "u0F7D", "u0F7E", "u0F80", "u0F81", "u0F82", "u0F83", "u0F84", "u0F86", "u0F87", "u0F8D", "u0F8E", "u0F8F", "u0F90", "u0F91", "u0F92", "u0F93", "u0F94", "u0F95", "u0F96", "u0F97", "u0F99", "u0F9A", "u0F9B", "u0F9C", "u0F9D", "u0F9E", "u0F9F", "u0FA0", "u0FA1", "u0FA2", "u0FA3", "u0FA4", "u0FA5", "u0FA6", "u0FA7", "u0FA8", "u0FA9", "u0FAA", "u0FAB", "u0FAC", "u0FAD", "u0FAE", "u0FAF", "u0FB0", "u0FB1", "u0FB2", "u0FB3", "u0FB4", "u0FB5", "u0FB6", "u0FB7", "u0FB8", "u0FB9", "u0FBA", "u0FBB", "u0FBC", "u0FC6", "u102D", "u102E", "u102F", "u1030", "u1032", "u1033", "u1034", "u1035", "u1036", "u1037", "u1039", "u103A", "u103D", "u103E", "u1058", "u1059", "u105E", "u105F", "u1060", "u1071", "u1072", "u1073", "u1074", "u1082", "u1085", "u1086", "u108D", "u109D", "u135D", "u135E", "u135F", "u1712", "u1713", "u1714", "u1732", "u1733", "u1734", "u1752", "u1753", "u1772", "u1773", "u17B4", "u17B5", "u17B7", "u17B8", "u17B9", "u17BA", "u17BB", "u17BC", "u17BD", "u17C6", "u17C9", "u17CA", "u17CB", "u17CC", "u17CD", "u17CE", "u17CF", "u17D0", "u17D1", "u17D2", "u17D3", "u17DD", "u180B", "u180C", "u180D", "u18A9", "u1920", "u1921", "u1922", "u1927", "u1928", "u1932", "u1939", "u193A", "u193B", "u1A17", "u1A18", "u1A1B", "u1A56", "u1A58", "u1A59", "u1A5A", "u1A5B", "u1A5C", "u1A5D", "u1A5E", "u1A60", "u1A62", "u1A65", "u1A66", "u1A67", "u1A68", "u1A69", "u1A6A", "u1A6B", "u1A6C", "u1A73", "u1A74", "u1A75", "u1A76", "u1A77", "u1A78", "u1A79", "u1A7A", "u1A7B", "u1A7C", "u1A7F", "u1AB0", "u1AB1", "u1AB2", "u1AB3", "u1AB4", "u1AB5", "u1AB6", "u1AB7", "u1AB8", "u1AB9", "u1ABA", "u1ABB", "u1ABC", "u1ABD", "u1B00", "u1B01", "u1B02", "u1B03", "u1B34", "u1B36", "u1B37", "u1B38", "u1B39", "u1B3A", "u1B3C", "u1B42", "u1B6B", "u1B6C", "u1B6D", "u1B6E", "u1B6F", "u1B70", "u1B71", "u1B72", "u1B73", "u1B80", "u1B81", "u1BA2", "u1BA3", "u1BA4", "u1BA5", "u1BA8", "u1BA9", "u1BAB", "u1BAC", "u1BAD", "u1BE6", "u1BE8", "u1BE9", "u1BED", "u1BEF", "u1BF0", "u1BF1", "u1C2C", "u1C2D", "u1C2E", "u1C2F", "u1C30", "u1C31", "u1C32", "u1C33", "u1C36", "u1C37", "u1CD0", "u1CD1", "u1CD2", "u1CD4", "u1CD5", "u1CD6", "u1CD7", "u1CD8", "u1CD9", "u1CDA", "u1CDB", "u1CDC", "u1CDD", "u1CDE", "u1CDF", "u1CE0", "u1CE2", "u1CE3", "u1CE4", "u1CE5", "u1CE6", "u1CE7", "u1CE8", "u1CED", "u1CF4", "u1CF8", "u1CF9", "u1DC0", "u1DC1", "u1DC2", "u1DC3", "u1DC4", "u1DC5", "u1DC6", "u1DC7", "u1DC8", "u1DC9", "u1DCA", "u1DCB", "u1DCC", "u1DCD", "u1DCE", "u1DCF", "u1DD0", "u1DD1", "u1DD2", "u1DD3", "u1DD4", "u1DD5", "u1DD6", "u1DD7", "u1DD8", "u1DD9", "u1DDA", "u1DDB", "u1DDC", "u1DDD", "u1DDE", "u1DDF", "u1DE0", "u1DE1", "u1DE2", "u1DE3", "u1DE4", "u1DE5", "u1DE6", "u1DE7", "u1DE8", "u1DE9", "u1DEA", "u1DEB", "u1DEC", "u1DED", "u1DEE", "u1DEF", "u1DF0", "u1DF1", "u1DF2", "u1DF3", "u1DF4", "u1DF5", "u1DFC", "u1DFD", "u1DFE", "u1DFF", "u20D0", "u20D1", "u20D2", "u20D3", "u20D4", "u20D5", "u20D6", "u20D7", "u20D8", "u20D9", "u20DA", "u20DB", "u20DC", "u20E1", "u20E5", "u20E6", "u20E7", "u20E8", "u20E9", "u20EA", "u20EB", "u20EC", "u20ED", "u20EE", "u20EF", "u20F0", "u2CEF", "u2CF0", "u2CF1", "u2D7F", "u2DE0", "u2DE1", "u2DE2", "u2DE3", "u2DE4", "u2DE5", "u2DE6", "u2DE7", "u2DE8", "u2DE9", "u2DEA", "u2DEB", "u2DEC", "u2DED", "u2DEE", "u2DEF", "u2DF0", "u2DF1", "u2DF2", "u2DF3", "u2DF4", "u2DF5", "u2DF6", "u2DF7", "u2DF8", "u2DF9", "u2DFA", "u2DFB", "u2DFC", "u2DFD", "u2DFE", "u2DFF", "u302A", "u302B", "u302C", "u302D", "u3099", "u309A", "uA66F", "uA674", "uA675", "uA676", "uA677", "uA678", "uA679", "uA67A", "uA67B", "uA67C", "uA67D", "uA69E", "uA69F", "uA6F0", "uA6F1", "uA802", "uA806", "uA80B", "uA825", "uA826", "uA8C4", "uA8E0", "uA8E1", "uA8E2", "uA8E3", "uA8E4", "uA8E5", "uA8E6", "uA8E7", "uA8E8", "uA8E9", "uA8EA", "uA8EB", "uA8EC", "uA8ED", "uA8EE", "uA8EF", "uA8F0", "uA8F1", "uA926", "uA927", "uA928", "uA929", "uA92A", "uA92B", "uA92C", "uA92D", "uA947", "uA948", "uA949", "uA94A", "uA94B", "uA94C", "uA94D", "uA94E", "uA94F", "uA950", "uA951", "uA980", "uA981", "uA982", "uA9B3", "uA9B6", "uA9B7", "uA9B8", "uA9B9", "uA9BC", "uA9E5", "uAA29", "uAA2A", "uAA2B", "uAA2C", "uAA2D", "uAA2E", "uAA31", "uAA32", "uAA35", "uAA36", "uAA43", "uAA4C", "uAA7C", "uAAB0", "uAAB2", "uAAB3", "uAAB4", "uAAB7", "uAAB8", "uAABE", "uAABF", "uAAC1", "uAAEC", "uAAED", "uAAF6", "uABE5", "uABE8", "uABED", "uFB1E", "uFE00", "uFE01", "uFE02", "uFE03", "uFE04", "uFE05", "uFE06", "uFE07", "uFE08", "uFE09", "uFE0A", "uFE0B", "uFE0C", "uFE0D", "uFE0E", "uFE0F", "uFE20", "uFE21", "uFE22", "uFE23", "uFE24", "uFE25", "uFE26", "uFE27", "uFE28", "uFE29", "uFE2A", "uFE2B", "uFE2C", "uFE2D", "uFE2E", "uFE2F"];
  var combiningMarks = a.concat(b);
  var splitChars = ["-", ";", ":", "&", "|", "u0E2F", // thai character pairannoi
  "u0EAF", // lao ellipsis
  "u0EC6", // lao ko la (word repetition)
  "u0ECC", // lao cancellation mark
  "u104A", // myanmar sign little section
  "u104B", // myanmar sign section
  "u104C", // myanmar symbol locative
  "u104D", // myanmar symbol completed
  "u104E", // myanmar symbol aforementioned
  "u104F", // myanmar symbol genitive
  "u2013", // en dash
  "u2014", // em dash
  "u2027", // simplified chinese hyphenation point
  "u3000", // simplified chinese ideographic space
  "u3001", // simplified chinese ideographic comma
  "u3002", // simplified chinese ideographic full stop
  "uFF0C", // full-width comma
  "uFF5E" // wave dash
  ];
  var prefixChars = ["'", "<", "(", "{", "[", "u00AB", // left-pointing double angle quotation mark
  "u300A", // left double angle bracket
  "u3008" // left angle bracket
  ];
  var suffixChars = ["'", ">", ")", "}", "]", ".", "!", "?", "/", "u00BB", // right-pointing double angle quotation mark
  "u300B", // right double angle bracket
  "u3009" // right angle bracket
  ].concat(splitChars);
  var burmeseRange = "\u1000-\u102A\u103F-\u1049\u1050-\u1055";
  var japaneseRange = "\u3040-\u309F\u30A0-\u30FF\uFF00-\uFF0B\uFF0D-\uFF5D\uFF5F-\uFF9F\u3400-\u4DBF";
  var chineseRange = "\u3400-\u9FBF";
  var laoRange = "\u0E81-\u0EAE\u0EB0-\u0EC4\u0EC8-\u0ECB\u0ECD-\u0EDD";
  var noSpaceRange = burmeseRange + chineseRange + japaneseRange + laoRange;
  var splitWords = new RegExp("(\\".concat(splitChars.join("|\\"), ")*[^\\s|\\").concat(splitChars.join("|\\"), "]*(\\").concat(splitChars.join("|\\"), ")*"), "g");
  var noSpaceLanguage = new RegExp("[".concat(noSpaceRange, "]"));
  var splitAllChars = new RegExp("(\\".concat(prefixChars.join("|\\"), ")*[").concat(noSpaceRange, "](\\").concat(suffixChars.join("|\\"), "|\\").concat(combiningMarks.join("|\\"), ")*|[a-z0-9]+"), "gi");
  /**
      @function textSplit
      @desc Splits a given sentence into an array of words.
      @param {String} sentence
  */

  function textSplit(sentence) {
    if (!noSpaceLanguage.test(sentence)) return stringify(sentence).match(splitWords).filter(function (w) {
      return w.length;
    });
    return merge(stringify(sentence).match(splitWords).map(function (d) {
      if (noSpaceLanguage.test(d)) return d.match(splitAllChars);
      return [d];
    }));
  }
  /**
      @function textWrap
      @desc Based on the defined styles and dimensions, breaks a string into an array of strings for each line of text.
  */


  function wrap() {
    var fontFamily = "sans-serif",
        fontSize = 10,
        fontWeight = 400,
        height = 200,
        lineHeight,
        maxLines = null,
        overflow = false,
        split = textSplit,
        width = 200;
    /**
        The inner return object and wraps the text and returns the line data array.
        @private
    */

    function textWrap(sentence) {
      sentence = stringify(sentence);
      if (lineHeight === void 0) lineHeight = Math.ceil(fontSize * 1.4);
      var words = split(sentence);
      var style = {
        "font-family": fontFamily,
        "font-size": fontSize,
        "font-weight": fontWeight,
        "line-height": lineHeight
      };
      var line = 1,
          textProg = "",
          truncated = false,
          widthProg = 0;
      var lineData = [],
          sizes = measure(words, style),
          space = measure(" ", style);

      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        var wordWidth = sizes[words.indexOf(word)];
        word += sentence.slice(textProg.length + word.length).match("^( |\n)*", "g")[0];

        if (textProg.slice(-1) === "\n" || widthProg + wordWidth > width) {
          if (!i && !overflow) {
            truncated = true;
            break;
          }

          if (lineData.length >= line) lineData[line - 1] = trimRight(lineData[line - 1]);
          line++;

          if (lineHeight * line > height || wordWidth > width && !overflow || maxLines && line > maxLines) {
            truncated = true;
            break;
          }

          widthProg = 0;
          lineData.push(word);
        } else if (!i) lineData[0] = word;else lineData[line - 1] += word;

        textProg += word;
        widthProg += wordWidth;
        widthProg += word.match(/[\s]*$/g)[0].length * space;
      }

      return {
        lines: lineData,
        sentence: sentence,
        truncated: truncated,
        widths: measure(lineData, style),
        words: words
      };
    }
    /**
        @memberof textWrap
        @desc If *value* is specified, sets the font family accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font family.
        @param {Function|String} [*value* = "sans-serif"]
    */


    textWrap.fontFamily = function (_) {
      return arguments.length ? (fontFamily = _, textWrap) : fontFamily;
    };
    /**
        @memberof textWrap
        @desc If *value* is specified, sets the font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current font size.
        @param {Function|Number} [*value* = 10]
    */


    textWrap.fontSize = function (_) {
      return arguments.length ? (fontSize = _, textWrap) : fontSize;
    };
    /**
        @memberof textWrap
        @desc If *value* is specified, sets the font weight accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current font weight.
        @param {Function|Number|String} [*value* = 400]
    */


    textWrap.fontWeight = function (_) {
      return arguments.length ? (fontWeight = _, textWrap) : fontWeight;
    };
    /**
        @memberof textWrap
        @desc If *value* is specified, sets height limit to the specified value and returns this generator. If *value* is not specified, returns the current value.
        @param {Number} [*value* = 200]
    */


    textWrap.height = function (_) {
      return arguments.length ? (height = _, textWrap) : height;
    };
    /**
        @memberof textWrap
        @desc If *value* is specified, sets the line height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current line height accessor, which is 1.1 times the [font size](#textWrap.fontSize) by default.
        @param {Function|Number} [*value*]
    */


    textWrap.lineHeight = function (_) {
      return arguments.length ? (lineHeight = _, textWrap) : lineHeight;
    };
    /**
        @memberof textWrap
        @desc If *value* is specified, sets the maximum number of lines allowed when wrapping.
        @param {Function|Number} [*value*]
    */


    textWrap.maxLines = function (_) {
      return arguments.length ? (maxLines = _, textWrap) : maxLines;
    };
    /**
        @memberof textWrap
        @desc If *value* is specified, sets the overflow to the specified boolean and returns this generator. If *value* is not specified, returns the current overflow value.
        @param {Boolean} [*value* = false]
    */


    textWrap.overflow = function (_) {
      return arguments.length ? (overflow = _, textWrap) : overflow;
    };
    /**
        @memberof textWrap
        @desc If *value* is specified, sets the word split function to the specified function and returns this generator. If *value* is not specified, returns the current word split function.
        @param {Function} [*value*] A function that, when passed a string, is expected to return that string split into an array of words to textWrap. The default split function splits strings on the following characters: `-`, `/`, `;`, `:`, `&`
    */


    textWrap.split = function (_) {
      return arguments.length ? (split = _, textWrap) : split;
    };
    /**
        @memberof textWrap
        @desc If *value* is specified, sets width limit to the specified value and returns this generator. If *value* is not specified, returns the current value.
        @param {Number} [*value* = 200]
    */


    textWrap.width = function (_) {
      return arguments.length ? (width = _, textWrap) : width;
    };

    return textWrap;
  }
  /**
      @external BaseClass
      @see https://github.com/d3plus/d3plus-common#BaseClass
  */


  var defaultHtmlLookup = {
    i: "font-style: italic;",
    em: "font-style: italic;",
    b: "font-weight: bold;",
    strong: "font-weight: bold;"
  };
  /**
      @class TextBox
      @extends external:BaseClass
      @desc Creates a wrapped text box for each point in an array of data. See [this example](https://d3plus.org/examples/d3plus-text/getting-started/) for help getting started using the TextBox class.
  */

  var TextBox = /*#__PURE__*/function (_BaseClass) {
    "use strict";

    _inherits(TextBox, _BaseClass);

    var _super = _createSuper(TextBox);

    /**
        @memberof TextBox
        @desc Invoked when creating a new class instance, and sets any default parameters.
        @private
    */
    function TextBox() {
      var _this3;

      _classCallCheck2(this, TextBox);

      _this3 = _super.call(this);
      _this3._ariaHidden = constant$2("false");
      _this3._delay = 0;
      _this3._duration = 0;

      _this3._ellipsis = function (text, line) {
        return line ? "".concat(text.replace(/\.|,$/g, ""), "...") : "";
      };

      _this3._fontColor = constant$2("black");
      _this3._fontFamily = constant$2(["Roboto", "Helvetica Neue", "HelveticaNeue", "Helvetica", "Arial", "sans-serif"]);
      _this3._fontMax = constant$2(50);
      _this3._fontMin = constant$2(8);
      _this3._fontOpacity = constant$2(1);
      _this3._fontResize = constant$2(false);
      _this3._fontSize = constant$2(10);
      _this3._fontStroke = constant$2("transparent");
      _this3._fontStrokeWidth = constant$2(0);
      _this3._fontWeight = constant$2(400);
      _this3._height = accessor("height", 200);
      _this3._html = defaultHtmlLookup;

      _this3._id = function (d, i) {
        return d.id || "".concat(i);
      };

      _this3._lineHeight = function (d, i) {
        return _this3._fontSize(d, i) * 1.2;
      };

      _this3._maxLines = constant$2(null);
      _this3._on = {};
      _this3._overflow = constant$2(false);
      _this3._padding = constant$2(0);
      _this3._pointerEvents = constant$2("auto");
      _this3._rotate = constant$2(0);

      _this3._rotateAnchor = function (d) {
        return [d.w / 2, d.h / 2];
      };

      _this3._split = textSplit;
      _this3._text = accessor("text");
      _this3._textAnchor = constant$2("start");
      _this3._verticalAlign = constant$2("top");
      _this3._width = accessor("width", 200);
      _this3._x = accessor("x", 0);
      _this3._y = accessor("y", 0);
      return _this3;
    }
    /**
        @memberof TextBox
        @desc Renders the text boxes. If a *callback* is specified, it will be called once the shapes are done drawing.
        @param {Function} [*callback* = undefined]
    */


    _createClass2(TextBox, [{
      key: "render",
      value: function render(callback) {
        var _this4 = this;

        if (this._select === void 0) this.select(_select("body").append("svg").style("width", "".concat(window.innerWidth, "px")).style("height", "".concat(window.innerHeight, "px")).node());
        var that = this;

        var boxes = this._select.selectAll(".d3plus-textBox").data(this._data.reduce(function (arr, d, i) {
          var t = _this4._text(d, i);

          if (t === void 0) return arr;
          t = trim(t);

          var resize = _this4._fontResize(d, i);

          var lHRatio = _this4._lineHeight(d, i) / _this4._fontSize(d, i);

          var fS = resize ? _this4._fontMax(d, i) : _this4._fontSize(d, i),
              lH = resize ? fS * lHRatio : _this4._lineHeight(d, i),
              line = 1,
              lineData = [],
              sizes,
              wrapResults;
          var style = {
            "font-family": fontExists(_this4._fontFamily(d, i)),
            "font-size": fS,
            "font-weight": _this4._fontWeight(d, i),
            "line-height": lH
          };
          var padding = parseSides(_this4._padding(d, i));
          var h = _this4._height(d, i) - (padding.top + padding.bottom),
              w = _this4._width(d, i) - (padding.left + padding.right);
          var wrapper = wrap().fontFamily(style["font-family"]).fontSize(fS).fontWeight(style["font-weight"]).lineHeight(lH).maxLines(_this4._maxLines(d, i)).height(h).overflow(_this4._overflow(d, i)).width(w).split(_this4._split);

          var fMax = _this4._fontMax(d, i),
              fMin = _this4._fontMin(d, i),
              vA = _this4._verticalAlign(d, i),
              words = _this4._split(t, i);
          /**
              Figures out the lineData to be used for wrapping.
              @private
          */


          function checkSize() {
            var truncate = function truncate() {
              if (line < 1) lineData = [that._ellipsis("", line)];else lineData[line - 1] = that._ellipsis(lineData[line - 1], line);
            }; // Constraint the font size


            fS = max([fS, fMin]);
            fS = min([fS, fMax]);

            if (resize) {
              lH = fS * lHRatio;
              wrapper.fontSize(fS).lineHeight(lH);
              style["font-size"] = fS;
              style["line-height"] = lH;
            }

            wrapResults = wrapper(t);
            lineData = wrapResults.lines.filter(function (l) {
              return l !== "";
            });
            line = lineData.length;

            if (wrapResults.truncated) {
              if (resize) {
                fS--;

                if (fS < fMin) {
                  fS = fMin;
                  truncate();
                  return;
                } else checkSize();
              } else truncate();
            }
          }

          if (w > fMin && (h > lH || resize && h > fMin * lHRatio)) {
            if (resize) {
              sizes = measure(words, style);
              var areaMod = 1.165 + w / h * 0.1,
                  boxArea = w * h,
                  maxWidth = max(sizes),
                  textArea = sum(sizes, function (d) {
                return d * lH;
              }) * areaMod;

              if (maxWidth > w || textArea > boxArea) {
                var areaRatio = Math.sqrt(boxArea / textArea),
                    widthRatio = w / maxWidth;
                var sizeRatio = min([areaRatio, widthRatio]);
                fS = Math.floor(fS * sizeRatio);
              }

              var heightMax = Math.floor(h * 0.8);
              if (fS > heightMax) fS = heightMax;
            }

            checkSize();
          }

          if (lineData.length) {
            var tH = line * lH;

            var r = _this4._rotate(d, i);

            var yP = r === 0 ? vA === "top" ? 0 : vA === "middle" ? h / 2 - tH / 2 : h - tH : 0;
            yP -= lH * 0.1;
            arr.push({
              aH: _this4._ariaHidden(d, i),
              data: d,
              i: i,
              lines: lineData,
              fC: _this4._fontColor(d, i),
              fStroke: _this4._fontStroke(d, i),
              fSW: _this4._fontStrokeWidth(d, i),
              fF: style["font-family"],
              fO: _this4._fontOpacity(d, i),
              fW: style["font-weight"],
              id: _this4._id(d, i),
              tA: _this4._textAnchor(d, i),
              vA: _this4._verticalAlign(d, i),
              widths: wrapResults.widths,
              fS: fS,
              lH: lH,
              w: w,
              h: h,
              r: r,
              x: _this4._x(d, i) + padding.left,
              y: _this4._y(d, i) + yP + padding.top
            });
          }

          return arr;
        }, []), function (d) {
          return _this4._id(d.data, d.i);
        });

        var t = transition().duration(this._duration);

        if (this._duration === 0) {
          boxes.exit().remove();
        } else {
          boxes.exit().transition().delay(this._duration).remove();
          boxes.exit().selectAll("text").transition(t).attr("opacity", 0).style("opacity", 0);
        }
        /**
         * Applies translate and rotate to a text element.
         * @param {D3Selection} text
         * @private
         */


        function rotate(text) {
          text.attr("transform", function (d, i) {
            var rotateAnchor = that._rotateAnchor(d, i);

            return "translate(".concat(d.x, ", ").concat(d.y, ") rotate(").concat(d.r, ", ").concat(rotateAnchor[0], ", ").concat(rotateAnchor[1], ")");
          });
        }

        var update = boxes.enter().append("g").attr("class", "d3plus-textBox").attr("id", function (d) {
          return "d3plus-textBox-".concat(strip(d.id));
        }).call(rotate).merge(boxes);
        var rtl = detectRTL();
        update.order().style("pointer-events", function (d) {
          return _this4._pointerEvents(d.data, d.i);
        }).each(function (d) {
          /**
              Sets the inner text content of each <text> element.
              @private
          */
          function textContent(text) {
            var tag = false;
            text[that._html ? "html" : "text"](function (t) {
              var cleaned = trimRight(t).replace(/&([^\;&]*)/g, function (str, a) {
                return a === "amp" ? str : "&amp;".concat(a);
              }) // replaces all non-HTML ampersands with escaped entity
              .replace(/<([^A-z^/]+)/g, function (str, a) {
                return "&lt;".concat(a);
              }).replace(/<$/g, "&lt;") // replaces all non-HTML left angle brackets with escaped entity
              .replace(/(<[^>^\/]+>)([^<^>]+)$/g, function (str, a, b) {
                return "".concat(a).concat(b).concat(a.replace("<", "</"));
              }) // ands end tag to lines before mid-HTML break
              .replace(/^([^<^>]+)(<\/[^>]+>)/g, function (str, a, b) {
                return "".concat(b.replace("</", "<")).concat(a).concat(b);
              }); // ands start tag to lines after mid-HTML break

              var tagRegex = new RegExp(/<([A-z]+)[^>]*>([^<^>]+)<\/[^>]+>/g);

              if (cleaned.match(tagRegex)) {
                cleaned = cleaned.replace(tagRegex, function (str, a, b) {
                  tag = that._html[a] ? a : false;

                  if (tag) {
                    var style = that._html[tag];
                    if (t.includes("</".concat(tag, ">"))) tag = false;
                    return "<tspan style=\"".concat(style, "\">").concat(b, "</tspan>");
                  }

                  return b;
                });
              } else if (tag.length) {
                cleaned = "<tspan style=\"".concat(that._html[tag], "\">").concat(cleaned, "</tspan>");
              }

              return cleaned;
            });
          }
          /**
              Styles to apply to each <text> element.
              @private
          */


          function textStyle(text) {
            text.attr("aria-hidden", d.aH).attr("dir", rtl ? "rtl" : "ltr").attr("fill", d.fC).attr("stroke", d.fStroke).attr("stroke-width", d.fSW).attr("text-anchor", d.tA).attr("font-family", d.fF).style("font-family", d.fF).attr("font-size", "".concat(d.fS, "px")).style("font-size", "".concat(d.fS, "px")).attr("font-weight", d.fW).style("font-weight", d.fW).attr("x", "".concat(d.tA === "middle" ? d.w / 2 : rtl ? d.tA === "start" ? d.w : 0 : d.tA === "end" ? d.w : 2 * Math.sin(Math.PI * d.r / 180), "px")).attr("y", function (t, i) {
              return d.r === 0 || d.vA === "top" ? "".concat((i + 1) * d.lH - (d.lH - d.fS), "px") : d.vA === "middle" ? "".concat((d.h + d.fS) / 2 - (d.lH - d.fS) + (i - d.lines.length / 2 + 0.5) * d.lH, "px") : "".concat(d.h - 2 * (d.lH - d.fS) - (d.lines.length - (i + 1)) * d.lH + 2 * Math.cos(Math.PI * d.r / 180), "px");
            });
          }

          var texts = _select(this).selectAll("text").data(d.lines);

          if (that._duration === 0) {
            texts.call(textContent).call(textStyle);
            texts.exit().remove();
            texts.enter().append("text").attr("dominant-baseline", "alphabetic").style("baseline-shift", "0%").attr("unicode-bidi", "bidi-override").call(textContent).call(textStyle).attr("opacity", d.fO).style("opacity", d.fO);
          } else {
            texts.call(textContent).transition(t).call(textStyle);
            texts.exit().transition(t).attr("opacity", 0).remove();
            texts.enter().append("text").attr("dominant-baseline", "alphabetic").style("baseline-shift", "0%").attr("opacity", 0).style("opacity", 0).call(textContent).call(textStyle).merge(texts).transition(t).delay(that._delay).call(textStyle).attr("opacity", d.fO).style("opacity", d.fO);
          }
        }).transition(t).call(rotate);
        var events = Object.keys(this._on),
            on = events.reduce(function (obj, e) {
          obj[e] = function (d, i) {
            return _this4._on[e](d.data, i);
          };

          return obj;
        }, {});

        for (var e = 0; e < events.length; e++) {
          update.on(events[e], on[events[e]]);
        }

        if (callback) setTimeout(callback, this._duration + 100);
        return this;
      }
      /**
          @memberof TextBox
          @desc If *value* is specified, sets the aria-hidden attribute to the specified function or string and returns the current class instance.
          @param {Function|String} *value*
          @chainable
      */

    }, {
      key: "ariaHidden",
      value: function ariaHidden(_) {
        return _ !== undefined ? (this._ariaHidden = typeof _ === "function" ? _ : constant$2(_), this) : this._ariaHidden;
      }
      /**
          @memberof TextBox
          @desc Sets the data array to the specified array. A text box will be drawn for each object in the array.
          @param {Array} [*data* = []]
          @chainable
      */

    }, {
      key: "data",
      value: function data(_) {
        return arguments.length ? (this._data = _, this) : this._data;
      }
      /**
          @memberof TextBox
          @desc Sets the animation delay to the specified number in milliseconds.
          @param {Number} [*value* = 0]
          @chainable
      */

    }, {
      key: "delay",
      value: function delay(_) {
        return arguments.length ? (this._delay = _, this) : this._delay;
      }
      /**
          @memberof TextBox
          @desc Sets the animation duration to the specified number in milliseconds.
          @param {Number} [*value* = 0]
          @chainable
      */

    }, {
      key: "duration",
      value: function duration(_) {
        return arguments.length ? (this._duration = _, this) : this._duration;
      }
      /**
          @memberof TextBox
          @desc Sets the function that handles what to do when a line is truncated. It should return the new value for the line, and is passed 2 arguments: the String of text for the line in question, and the number of the line. By default, an ellipsis is added to the end of any line except if it is the first word that cannot fit (in that case, an empty string is returned).
          @param {Function|String} [*value*]
          @chainable
          @example <caption>default accessor</caption>
      function(text, line) {
      return line ? text.replace(/\.|,$/g, "") + "..." : "";
      }
      */

    }, {
      key: "ellipsis",
      value: function ellipsis(_) {
        return arguments.length ? (this._ellipsis = typeof _ === "function" ? _ : constant$2(_), this) : this._ellipsis;
      }
      /**
          @memberof TextBox
          @desc Sets the font color to the specified accessor function or static string, which is inferred from the [DOM selection](#textBox.select) by default.
          @param {Function|String} [*value* = "black"]
          @chainable
      */

    }, {
      key: "fontColor",
      value: function fontColor(_) {
        return arguments.length ? (this._fontColor = typeof _ === "function" ? _ : constant$2(_), this) : this._fontColor;
      }
      /**
          @memberof TextBox
          @desc Defines the font-family to be used. The value passed can be either a *String* name of a font, a comma-separated list of font-family fallbacks, an *Array* of fallbacks, or a *Function* that returns either a *String* or an *Array*. If supplying multiple fallback fonts, the [fontExists](#fontExists) function will be used to determine the first available font on the client's machine.
          @param {Array|Function|String} [*value* = ["Roboto", "Helvetica Neue", "HelveticaNeue", "Helvetica", "Arial", "sans-serif"]]
          @chainable
      */

    }, {
      key: "fontFamily",
      value: function fontFamily(_) {
        return arguments.length ? (this._fontFamily = typeof _ === "function" ? _ : constant$2(_), this) : this._fontFamily;
      }
      /**
          @memberof TextBox
          @desc Sets the maximum font size to the specified accessor function or static number (which corresponds to pixel units), which is used when [dynamically resizing fonts](#textBox.fontResize).
          @param {Function|Number} [*value* = 50]
          @chainable
      */

    }, {
      key: "fontMax",
      value: function fontMax(_) {
        return arguments.length ? (this._fontMax = typeof _ === "function" ? _ : constant$2(_), this) : this._fontMax;
      }
      /**
          @memberof TextBox
          @desc Sets the minimum font size to the specified accessor function or static number (which corresponds to pixel units), which is used when [dynamically resizing fonts](#textBox.fontResize).
          @param {Function|Number} [*value* = 8]
          @chainable
      */

    }, {
      key: "fontMin",
      value: function fontMin(_) {
        return arguments.length ? (this._fontMin = typeof _ === "function" ? _ : constant$2(_), this) : this._fontMin;
      }
      /**
          @memberof TextBox
          @desc Sets the font opacity to the specified accessor function or static number between 0 and 1.
          @param {Function|Number} [*value* = 1]
          @chainable
       */

    }, {
      key: "fontOpacity",
      value: function fontOpacity(_) {
        return arguments.length ? (this._fontOpacity = typeof _ === "function" ? _ : constant$2(_), this) : this._fontOpacity;
      }
      /**
          @memberof TextBox
          @desc Toggles font resizing, which can either be defined as a static boolean for all data points, or an accessor function that returns a boolean. See [this example](http://d3plus.org/examples/d3plus-text/resizing-text/) for a side-by-side comparison.
          @param {Function|Boolean} [*value* = false]
          @chainable
      */

    }, {
      key: "fontResize",
      value: function fontResize(_) {
        return arguments.length ? (this._fontResize = typeof _ === "function" ? _ : constant$2(_), this) : this._fontResize;
      }
      /**
          @memberof TextBox
          @desc Sets the font size to the specified accessor function or static number (which corresponds to pixel units), which is inferred from the [DOM selection](#textBox.select) by default.
          @param {Function|Number} [*value* = 10]
          @chainable
      */

    }, {
      key: "fontSize",
      value: function fontSize(_) {
        return arguments.length ? (this._fontSize = typeof _ === "function" ? _ : constant$2(_), this) : this._fontSize;
      }
      /**
          @memberof TextBox
          @desc Sets the font stroke color for the rendered text.
          @param {Function|String} [*value* = "transparent"]
          @chainable
      */

    }, {
      key: "fontStroke",
      value: function fontStroke(_) {
        return arguments.length ? (this._fontStroke = typeof _ === "function" ? _ : constant$2(_), this) : this._fontStroke;
      }
      /**
          @memberof TextBox
          @desc Sets the font stroke width for the rendered text.
          @param {Function|Number} [*value* = 0]
          @chainable
      */

    }, {
      key: "fontStrokeWidth",
      value: function fontStrokeWidth(_) {
        return arguments.length ? (this._fontStrokeWidth = typeof _ === "function" ? _ : constant$2(_), this) : this._fontStrokeWidth;
      }
      /**
          @memberof TextBox
          @desc Sets the font weight to the specified accessor function or static number, which is inferred from the [DOM selection](#textBox.select) by default.
          @param {Function|Number|String} [*value* = 400]
          @chainable
      */

    }, {
      key: "fontWeight",
      value: function fontWeight(_) {
        return arguments.length ? (this._fontWeight = typeof _ === "function" ? _ : constant$2(_), this) : this._fontWeight;
      }
      /**
          @memberof TextBox
          @desc Sets the height for each box to the specified accessor function or static number.
          @param {Function|Number} [*value*]
          @chainable
          @example <caption>default accessor</caption>
      function(d) {
      return d.height || 200;
      }
      */

    }, {
      key: "height",
      value: function height(_) {
        return arguments.length ? (this._height = typeof _ === "function" ? _ : constant$2(_), this) : this._height;
      }
      /**
          @memberof TextBox
          @desc Configures the ability to render simple HTML tags. Defaults to supporting `<b>`, `<strong>`, `<i>`, and `<em>`, set to false to disable or provide a mapping of tags to svg styles
          @param {Object|Boolean} [*value* = {
                    i: 'font-style: italic;',
                    em: 'font-style: italic;',
                    b: 'font-weight: bold;',
                    strong: 'font-weight: bold;'
                }]
          @chainable
      */

    }, {
      key: "html",
      value: function html(_) {
        return arguments.length ? (this._html = typeof _ === "boolean" ? _ ? defaultHtmlLookup : false : _, this) : this._html;
      }
      /**
          @memberof TextBox
          @desc Defines the unique id for each box to the specified accessor function or static number.
          @param {Function|Number} [*value*]
          @chainable
          @example <caption>default accessor</caption>
      function(d, i) {
      return d.id || i + "";
      }
      */

    }, {
      key: "id",
      value: function id(_) {
        return arguments.length ? (this._id = typeof _ === "function" ? _ : constant$2(_), this) : this._id;
      }
      /**
          @memberof TextBox
          @desc Sets the line height to the specified accessor function or static number, which is 1.2 times the [font size](#textBox.fontSize) by default.
          @param {Function|Number} [*value*]
          @chainable
      */

    }, {
      key: "lineHeight",
      value: function lineHeight(_) {
        return arguments.length ? (this._lineHeight = typeof _ === "function" ? _ : constant$2(_), this) : this._lineHeight;
      }
      /**
          @memberof TextBox
          @desc Restricts the maximum number of lines to wrap onto, which is null (unlimited) by default.
          @param {Function|Number} [*value*]
          @chainable
      */

    }, {
      key: "maxLines",
      value: function maxLines(_) {
        return arguments.length ? (this._maxLines = typeof _ === "function" ? _ : constant$2(_), this) : this._maxLines;
      }
      /**
          @memberof TextBox
          @desc Sets the text overflow to the specified accessor function or static boolean.
          @param {Function|Boolean} [*value* = false]
          @chainable
      */

    }, {
      key: "overflow",
      value: function overflow(_) {
        return arguments.length ? (this._overflow = typeof _ === "function" ? _ : constant$2(_), this) : this._overflow;
      }
      /**
          @memberof TextBox
          @desc Sets the padding to the specified accessor function, CSS shorthand string, or static number, which is 0 by default.
          @param {Function|Number|String} [*value*]
          @chainable
      */

    }, {
      key: "padding",
      value: function padding(_) {
        return arguments.length ? (this._padding = typeof _ === "function" ? _ : constant$2(_), this) : this._padding;
      }
      /**
          @memberof TextBox
          @desc Sets the pointer-events to the specified accessor function or static string.
          @param {Function|String} [*value* = "auto"]
          @chainable
      */

    }, {
      key: "pointerEvents",
      value: function pointerEvents(_) {
        return arguments.length ? (this._pointerEvents = typeof _ === "function" ? _ : constant$2(_), this) : this._pointerEvents;
      }
      /**
          @memberof TextBox
          @desc Sets the rotate percentage for each box to the specified accessor function or static string.
          @param {Function|Number} [*value* = 0]
          @chainable
      */

    }, {
      key: "rotate",
      value: function rotate(_) {
        return arguments.length ? (this._rotate = typeof _ === "function" ? _ : constant$2(_), this) : this._rotate;
      }
      /**
          @memberof TextBox
          @desc Sets the anchor point around which to rotate the text box.
          @param {Function|Number[]}
          @chainable
       */

    }, {
      key: "rotateAnchor",
      value: function rotateAnchor(_) {
        return arguments.length ? (this._rotateAnchor = typeof _ === "function" ? _ : constant$2(_), this) : this._rotateAnchor;
      }
      /**
          @memberof TextBox
          @desc Sets the SVG container element to the specified d3 selector or DOM element. If not explicitly specified, an SVG element will be added to the page for use.
          @param {String|HTMLElement} [*selector*]
          @chainable
      */

    }, {
      key: "select",
      value: function select(_) {
        return arguments.length ? (this._select = _select(_), this) : this._select;
      }
      /**
          @memberof TextBox
          @desc Sets the word split behavior to the specified function, which when passed a string is expected to return that string split into an array of words.
          @param {Function} [*value*]
          @chainable
      */

    }, {
      key: "split",
      value: function split(_) {
        return arguments.length ? (this._split = _, this) : this._split;
      }
      /**
          @memberof TextBox
          @desc Sets the text for each box to the specified accessor function or static string.
          @param {Function|String} [*value*]
          @chainable
          @example <caption>default accessor</caption>
      function(d) {
      return d.text;
      }
      */

    }, {
      key: "text",
      value: function text(_) {
        return arguments.length ? (this._text = typeof _ === "function" ? _ : constant$2(_), this) : this._text;
      }
      /**
          @memberof TextBox
          @desc Sets the horizontal text anchor to the specified accessor function or static string, whose values are analagous to the SVG [text-anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) property.
          @param {Function|String} [*value* = "start"]
          @chainable
      */

    }, {
      key: "textAnchor",
      value: function textAnchor(_) {
        return arguments.length ? (this._textAnchor = typeof _ === "function" ? _ : constant$2(_), this) : this._textAnchor;
      }
      /**
          @memberof TextBox
          @desc Sets the vertical alignment to the specified accessor function or static string. Accepts `"top"`, `"middle"`, and `"bottom"`.
          @param {Function|String} [*value* = "top"]
          @chainable
      */

    }, {
      key: "verticalAlign",
      value: function verticalAlign(_) {
        return arguments.length ? (this._verticalAlign = typeof _ === "function" ? _ : constant$2(_), this) : this._verticalAlign;
      }
      /**
          @memberof TextBox
          @desc Sets the width for each box to the specified accessor function or static number.
          @param {Function|Number} [*value*]
          @chainable
          @example <caption>default accessor</caption>
      function(d) {
      return d.width || 200;
      }
      */

    }, {
      key: "width",
      value: function width(_) {
        return arguments.length ? (this._width = typeof _ === "function" ? _ : constant$2(_), this) : this._width;
      }
      /**
          @memberof TextBox
          @desc Sets the x position for each box to the specified accessor function or static number. The number given should correspond to the left side of the textBox.
          @param {Function|Number} [*value*]
          @chainable
          @example <caption>default accessor</caption>
      function(d) {
      return d.x || 0;
      }
      */

    }, {
      key: "x",
      value: function x(_) {
        return arguments.length ? (this._x = typeof _ === "function" ? _ : constant$2(_), this) : this._x;
      }
      /**
          @memberof TextBox
          @desc Sets the y position for each box to the specified accessor function or static number. The number given should correspond to the top side of the textBox.
          @param {Function|Number} [*value*]
          @chainable
          @example <caption>default accessor</caption>
      function(d) {
      return d.y || 0;
      }
      */

    }, {
      key: "y",
      value: function y(_) {
        return arguments.length ? (this._y = typeof _ === "function" ? _ : constant$2(_), this) : this._y;
      }
    }]);

    return TextBox;
  }(BaseClass);

  var lowercase = ["a", "an", "and", "as", "at", "but", "by", "for", "from", "if", "in", "into", "near", "nor", "of", "on", "onto", "or", "per", "that", "the", "to", "with", "via", "vs", "vs."];
  var uppercase = ["CEO", "CFO", "CNC", "COO", "CPU", "GDP", "HVAC", "ID", "IT", "R&D", "TV", "UI"];
  /**
      @function titleCase
      @desc Capitalizes the first letter of each word in a phrase/sentence.
      @param {String} str The string to apply the title case logic.
  */

  function titleCase(str) {
    if (str === void 0) return "";
    var smalls = lowercase.map(function (s) {
      return s.toLowerCase();
    });
    var bigs = uppercase.slice();
    bigs = bigs.concat(bigs.map(function (b) {
      return "".concat(b, "s");
    }));
    var biglow = bigs.map(function (b) {
      return b.toLowerCase();
    });
    var split = textSplit(str);
    return split.map(function (s, i) {
      if (s) {
        var _lower = s.toLowerCase();

        var stripped = suffixChars.includes(_lower.charAt(_lower.length - 1)) ? _lower.slice(0, -1) : _lower;
        var bigindex = biglow.indexOf(stripped);
        if (bigindex >= 0) return bigs[bigindex];else if (smalls.includes(stripped) && i !== 0 && i !== split.length - 1) return _lower;else return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
      } else return "";
    }).reduce(function (ret, s, i) {
      if (i && str.charAt(ret.length) === " ") ret += " ";
      ret += s;
      return ret;
    }, "");
  }

  exports.TextBox = TextBox;
  exports.fontExists = fontExists;
  exports.rtl = detectRTL;
  exports.stringify = stringify;
  exports.strip = strip;
  exports.textSplit = textSplit;
  exports.textWidth = measure;
  exports.textWrap = wrap;
  exports.titleCase = titleCase;
  exports.trim = trim;
  exports.trimLeft = trimLeft;
  exports.trimRight = trimRight;
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
});


},{}],"/home/robson/projetos/rd3/src/ChartContext.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = window.React;

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var ChartContext = _react2.default.createContext();

exports.default = ChartContext;

},{}],"/home/robson/projetos/rd3/src/ChartProvider.js":[function(require,module,exports){
'use strict';

var _ChartContext = require('./ChartContext');

var _ChartContext2 = _interopRequireDefault(_ChartContext);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var React = window.React;

module.exports = createReactClass({
    displayName: 'ChartProvider',

    getInitialState: function getInitialState() {
        return {
            chartStyle: ''
        };
    },
    render: function render() {
        var _this = this;

        return React.createElement(_ChartContext2.default.Provider, {
            value: {
                chartStyle: this.state.chartStyle,
                setChartStyle: function setChartStyle(style) {
                    _this.setState({
                        chartStyle: style
                    });
                }
            }
        }, this.props.children);
    }
});

},{"./ChartContext":"/home/robson/projetos/rd3/src/ChartContext.js"}],"/home/robson/projetos/rd3/src/SetStyle.js":[function(require,module,exports){
'use strict';

var _ChartContext = require('./ChartContext');

var _ChartContext2 = _interopRequireDefault(_ChartContext);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var React = window.React;

/*
    This components sets context variables.
    It will be outside of this application after migrate to React function components.
*/

module.exports = createReactClass({
    displayName: 'SetStyle',

    render: function render() {

        this.contextType = _ChartContext2.default;
        var context = this.contextType._currentValue;
        context.setChartStyle(this.props.style);

        return null;
    }
});

},{"./ChartContext":"/home/robson/projetos/rd3/src/ChartContext.js"}],"/home/robson/projetos/rd3/src/areachart/Area.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'Area',

  propTypes: {
    path: PropTypes.string,
    fill: PropTypes.string,
    handleMouseOver: PropTypes.func,
    handleMouseLeave: PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: '#3182bd'
    };
  },
  render: function render() {
    return React.createElement('path', {
      className: 'rd3-areachart-area',
      d: this.props.path,
      fill: this.props.fill,
      onMouseOver: this.props.handleMouseOver,
      onMouseLeave: this.props.handleMouseLeave
    });
  }
});

},{}],"/home/robson/projetos/rd3/src/areachart/AreaChart.jsx":[function(require,module,exports){
'use strict';

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;
var utils = require('../utils');

var d3 = window.d3;
var DataSeries = require('./DataSeries');

var _require = require('../common'),
    Chart = _require.Chart,
    XAxis = _require.XAxis,
    YAxis = _require.YAxis,
    XGrid = _require.XGrid,
    YGrid = _require.YGrid;

var _require2 = require('../mixins'),
    CartesianChartPropsMixin = _require2.CartesianChartPropsMixin,
    DefaultAccessorsMixin = _require2.DefaultAccessorsMixin,
    ViewBoxMixin = _require2.ViewBoxMixin;

module.exports = createReactClass({

  displayName: 'AreaChart',

  propTypes: {
    margins: PropTypes.object,
    interpolate: PropTypes.bool,
    interpolationType: PropTypes.string,
    hoverAnimation: PropTypes.bool,
    data: PropTypes.array.isRequired,
    normalize: PropTypes.bool,
    displayYAxis: PropTypes.bool
  },

  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      colors: d3.scaleOrdinal(d3.schemeBlues[3].reverse()),
      // colors: d3.scaleOrdinal(d3.schemePastel2),

      margins: { top: 10, right: 20, bottom: 40, left: 45 },
      yAxisTickCount: 4,
      interpolate: false,
      interpolationType: null,
      className: 'rd3-areachart',
      hoverAnimation: true,
      data: [],
      color: {
        accessor: 'Sequential',
        colors: d3.scaleSequential(d3.schemeTableau10)
      },
      normalize: false,
      displayYAxis: true
    };
  },

  _rd3FormatInputData: utils.rd3FormatInputData,

  render: function render() {
    var props = this.props;
    var data = props.data;
    var interpolationType = props.interpolationType || (props.interpolate ? 'cardinal' : 'linear');

    if (this.props.data && this.props.data.length < 1) {
      return null;
    }

    var series = void 0;

    var _rd3FormatInputData = this._rd3FormatInputData('areachart', props.inputDataLayout, props.data, props.xIsDate, props.strokeWidth);

    var _rd3FormatInputData2 = _slicedToArray(_rd3FormatInputData, 2);

    data = _rd3FormatInputData2[0];
    series = _rd3FormatInputData2[1];

    var _getDimensions = this.getDimensions(),
        innerWidth = _getDimensions.innerWidth,
        innerHeight = _getDimensions.innerHeight,
        trans = _getDimensions.trans,
        svgMargins = _getDimensions.svgMargins;

    var yOrient = this.getYOrient();

    if (!Array.isArray(data)) {
      data = [data];
    }

    var yScale = d3.scaleLinear().range([innerHeight, 0]);

    var xValues = [];
    var yValues = [];
    // const seriesNames = [];
    // const yMaxValues = [];
    var domain = props.domain || {};
    var xDomain = domain.x || [];
    var yDomain = domain.y || [];
    var seriesNames = series;

    // let yMaxValues = d3.max(data.map( d => {
    //   return d3.sum(seriesNames.map( n => { return d[n]}))
    // }))

    var seriesMaxValues = data.map(function (d) {
      return d3.sum(seriesNames.map(function (n) {
        return d[n];
      }));
    });

    var yMaxValues = d3.max(seriesMaxValues);

    if (props.normalize === true) {
      // if ( 1===1 ){
      var seriesNormalizeFactor = seriesMaxValues.map(function (s) {
        return yMaxValues / s;
      });
      var dataNormalized = [];
      data = data.map(function (d, idx) {
        var factor = seriesNormalizeFactor[idx];
        var dataAux = {};
        Object.entries(d).map(function (key, index) {
          if (key[0] === 'date') {
            dataAux[key[0]] = key[1];
          } else {
            dataAux[key[0]] = key[1] *= factor;
          }
        });
        dataNormalized.push(dataAux);
      });
      data = dataNormalized;
    }

    /* TODO - generalize. Only acceptint field date for x axis*/
    data.map(function (d) {
      xValues.push(d.date);
    });

    var xScale = void 0;

    if (xValues.length > 0 && Object.prototype.toString.call(xValues[0]) === '[object Date]' && props.xAxisTickInterval) {
      xScale = d3.scaleTime().range([0, innerWidth]);
    } else {
      xScale = d3.scaleLinear().range([0, innerWidth]);
    }

    var xdomain = d3.extent(xValues);
    if (xDomain[0] !== undefined && xDomain[0] !== null) xdomain[0] = xDomain[0];
    if (xDomain[1] !== undefined && xDomain[1] !== null) xdomain[1] = xDomain[1];
    xScale.domain(xdomain);
    var ydomain = [0, yMaxValues];
    if (yDomain[0] !== undefined && yDomain[0] !== null) ydomain[0] = yDomain[0];
    if (yDomain[1] !== undefined && yDomain[1] !== null) ydomain[1] = yDomain[1];
    yScale.domain(ydomain);

    // const colorsDomain = Array.from(Array(seriesNames.length).keys())
    // props.colors.domain(colorsDomain);

    var stack = d3.stack();
    stack.keys(seriesNames);

    var layers = stack(data);

    var colorsDomain = void 0;
    var colorsAccessor = void 0;
    var origArray = Array.from(series.keys());

    if (this.props.color.accessor === 'Sequential') {
      colorsDomain = origArray.map(function (x) {
        return x / series.length;
      });
      colorsAccessor = this.props.colorAccessorSequential;
    } else {
      colorsDomain = series;
      colorsAccessor = this.props.colorAccessorOrdinal;
    }

    var dataSeries = layers.map(function (d, idx) {
      return React.createElement(DataSeries, {
        key: idx,
        fill: props.color.colors(colorsAccessor(colorsDomain, idx)),
        index: idx,
        xScale: xScale,
        yScale: yScale,
        data: d,
        xAccessor: props.xAccessor,
        yAccessor: props.yAccessor,
        interpolationType: interpolationType,
        hoverAnimation: props.hoverAnimation
      });
    });

    return React.createElement(Chart, {
      viewBox: this.getViewBox(),
      legend: props.legend,
      data: data,
      margins: props.margins,

      color: this.props.color,
      colorsDomain: colorsDomain,
      colorsAccessor: colorsAccessor,

      width: props.width,
      height: props.height,
      title: props.title,

      series: series,
      svgLegend: props.svgLegend,
      svgChart: props.svgChart,
      legendStyle: props.legendStyle,
      background: props.background,
      svgTitle: props.svgTitle
    }, React.createElement('g', { transform: trans, className: props.className }, React.createElement(XGrid, {
      xAxisClassName: 'rd3-areachart-xaxis',
      xScale: xScale,
      xAxisTickValues: props.xAxisTickValues,
      xAxisTickInterval: props.xAxisTickInterval,
      xAxisTickCount: props.xAxisTickCount,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeWidth: props.gridVerticalStrokeWidth,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash,

      xTickFormat: props.xTickFormat,
      gridText: props.gridText,
      translateTickLabel_Y_X: props.translateTickLabel_Y_X,
      translateTickLabel_Y_Y: props.translateTickLabel_Y_Y,
      translateTickLabel_X_X: props.translateTickLabel_X_X,
      translateTickLabel_X_Y: props.translateTickLabel_X_Y,
      xIsDate: props.xIsDate
    }), props.displayYAxis && React.createElement(YGrid, {
      yAxisClassName: 'rd3-areachart-yaxis',
      yScale: yScale,
      yAxisTickValues: props.yAxisTickValues,
      yAxisTickInterval: props.yAxisTickInterval,
      yAxisTickCount: props.yAxisTickCount,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash,
      xTickFormat: props.xTickFormat,
      gridText: props.gridText,
      translateTickLabel_Y_X: props.translateTickLabel_Y_X,
      translateTickLabel_Y_Y: props.translateTickLabel_Y_Y,
      translateTickLabel_X_X: props.translateTickLabel_X_X,
      translateTickLabel_X_Y: props.translateTickLabel_X_Y,
      xIsDate: props.xIsDate

    }), dataSeries, React.createElement(XAxis, {
      xAxisClassName: 'rd3-areachart-xaxis',
      xScale: xScale,
      xAxisTickValues: props.xAxisTickValues,
      xAxisTickInterval: props.xAxisTickInterval,
      xAxisTickCount: props.xAxisTickCount,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeWidth: props.gridVerticalStrokeWidth,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash
    }), props.displayYAxis && React.createElement(YAxis, {
      yAxisClassName: 'rd3-areachart-yaxis',
      yScale: yScale,
      yAxisTickValues: props.yAxisTickValues,
      yAxisTickInterval: props.yAxisTickInterval,
      yAxisTickCount: props.yAxisTickCount,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
    })));
  }
});

},{"../common":"/home/robson/projetos/rd3/src/common/index.js","../mixins":"/home/robson/projetos/rd3/src/mixins/index.js","../utils":"/home/robson/projetos/rd3/src/utils/index.js","./DataSeries":"/home/robson/projetos/rd3/src/areachart/DataSeries.jsx"}],"/home/robson/projetos/rd3/src/areachart/AreaContainer.jsx":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var shade = require('../utils').shade;
var Area = require('./Area');

module.exports = createReactClass({

  displayName: 'AreaContainer',

  propTypes: {
    fill: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: '#3182bd'
    };
  },
  getInitialState: function getInitialState() {
    return {
      fill: this.props.fill,
      fillCtl: this.props.fill
    };
  },

  statics: {
    getDerivedStateFromProps: function getDerivedStateFromProps(props, current_state) {
      if (current_state.fillCtl !== props.fill) {
        return {
          fillCtl: props.fill,
          fill: props.fill
        };
      }
      return null;
    }
  },

  _animateArea: function _animateArea() {
    this.setState({
      fill: shade(this.props.fill, 0.1)
    });
  },
  _restoreArea: function _restoreArea() {
    this.setState({
      fill: this.props.fill
    });
  },
  render: function render() {
    var props = this.props;

    // animation controller
    var handleMouseOver = void 0;
    var handleMouseLeave = void 0;
    if (props.hoverAnimation) {
      handleMouseOver = this._animateArea;
      handleMouseLeave = this._restoreArea;
    } else {
      handleMouseOver = handleMouseLeave = null;
    }

    return React.createElement(Area, _extends({
      handleMouseOver: handleMouseOver,
      handleMouseLeave: handleMouseLeave
    }, props, {
      fill: this.state.fill
    }));
  }
});

},{"../utils":"/home/robson/projetos/rd3/src/utils/index.js","./Area":"/home/robson/projetos/rd3/src/areachart/Area.jsx"}],"/home/robson/projetos/rd3/src/areachart/DataSeries.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var AreaContainer = require('./AreaContainer');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    fill: PropTypes.string,
    interpolationType: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      interpolationType: 'linear'
    };
  },
  render: function render() {
    var props = this.props;

    var area = d3.area().x(function (d) {
      return props.xScale(d.data.date);
    }).y0(function (d) {
      return props.yScale(d[0]);
    }).y1(function (d) {
      return props.yScale(d[1]);
    }).curve(d3.curveCatmullRom.alpha(0.5));

    var path = area(props.data);

    return React.createElement(AreaContainer, {
      fill: props.fill,
      hoverAnimation: props.hoverAnimation,
      path: path
    });
  }
});

},{"./AreaContainer":"/home/robson/projetos/rd3/src/areachart/AreaContainer.jsx"}],"/home/robson/projetos/rd3/src/areachart/index.js":[function(require,module,exports){
'use strict';

exports.AreaChart = require('./AreaChart');

},{"./AreaChart":"/home/robson/projetos/rd3/src/areachart/AreaChart.jsx"}],"/home/robson/projetos/rd3/src/barchart/Bar.jsx":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({
  displayName: 'exports',

  propTypes: {
    fill: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number,
    className: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      offset: 0,
      className: 'rd3-barchart-bar'
    };
  },
  render: function render() {
    return React.createElement('rect', _extends({
      className: 'rd3-barchart-bar'
    }, this.props));
  }
});

},{}],"/home/robson/projetos/rd3/src/barchart/BarChart.jsx":[function(require,module,exports){
'use strict';

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }return arr2;
  } else {
    return Array.from(arr);
  }
}

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;
var utils = require('../utils');

var d3 = window.d3;
var DataSeries = require('./DataSeries');

var _require = require('../common'),
    Chart = _require.Chart,
    XAxis = _require.XAxis,
    XGrid = _require.XGrid,
    YGrid = _require.YGrid,
    YAxis = _require.YAxis,
    Tooltip = _require.Tooltip;

var _require2 = require('../mixins'),
    CartesianChartPropsMixin = _require2.CartesianChartPropsMixin,
    DefaultAccessorsMixin = _require2.DefaultAccessorsMixin,
    ViewBoxMixin = _require2.ViewBoxMixin,
    TooltipMixin = _require2.TooltipMixin;

module.exports = createReactClass({

  displayName: 'BarChart',

  propTypes: {
    chartClassName: PropTypes.string,
    data: PropTypes.array.isRequired,
    hoverAnimation: PropTypes.bool,
    margins: PropTypes.object,
    rangeRoundBandsPadding: PropTypes.number,
    // https://github.com/mbostock/d3/wiki/Stack-Layout#offset
    stackOffset: PropTypes.oneOf(['silhouette', 'expand', 'wigget', 'zero']),
    grouped: PropTypes.bool,
    valuesAccessor: PropTypes.func,
    xAccessorBar: PropTypes.func,
    yAccessorBar: PropTypes.func,
    y0Accessor: PropTypes.func,
    title: PropTypes.string,
    xAxisClassName: PropTypes.string,
    yAxisClassName: PropTypes.string,
    yAxisTickCount: PropTypes.number,
    xIsDate: PropTypes.bool,
    color: PropTypes.object,
    inputDataLayout: PropTypes.string.isRequired
  },

  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin, TooltipMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      chartClassName: 'rd3-barchart',
      hoverAnimation: true,
      margins: { top: 10, right: 20, bottom: 40, left: 45 },
      rangeRoundBandsPadding: 0.25,
      stackOffset: 'zero',
      grouped: false,
      valuesAccessor: function valuesAccessor(d) {
        return d;
      },
      y0Accessor: function y0Accessor(d) {
        return d[0];
      },
      xAxisClassName: 'rd3-barchart-xaxis',
      yAxisClassName: 'rd3-barchart-yaxis',
      yAxisTickCount: 4,
      xIsDate: false,
      color: {
        accessor: 'Sequential',
        colors: d3.scaleOrdinal(d3.schemeBlues[9].reverse())
      }
    };
  },

  _formatInputData: utils.formatInputData,

  _getLabels: function _getLabels(firstSeries) {
    // we only need first series to get all the labels
    var _props = this.props,
        valuesAccessor = _props.valuesAccessor,
        xAccessorBar = _props.xAccessorBar;

    return valuesAccessor(firstSeries).map(xAccessorBar);
  },
  _stack: function _stack(seriesNames) {
    // Only support columns with all positive or all negative values
    // https://github.com/mbostock/d3/issues/2265
    var _props2 = this.props,
        stackOffset = _props2.stackOffset,
        xAccessorBar = _props2.xAccessorBar,
        yAccessorBar = _props2.yAccessorBar,
        valuesAccessor = _props2.valuesAccessor;

    return d3.stack().keys(seriesNames).order(d3.stackOrderNone).offset(d3.stackOffsetNone);
  },
  render: function render() {
    var props = this.props;
    var yOrient = this.getYOrient();

    var domain = props.domain || {};

    if (props.data.length === 0) {
      return null;
    }

    var data = props.data;
    var series = void 0;

    /* d3 */
    var _formatInputData = this._formatInputData(props.inputDataLayout, data);

    var _formatInputData2 = _slicedToArray(_formatInputData, 2);

    data = _formatInputData2[0];
    series = _formatInputData2[1];
    var _data = this._stack(series)(data);

    var _getDimensions = this.getDimensions(),
        innerHeight = _getDimensions.innerHeight,
        innerWidth = _getDimensions.innerWidth,
        trans = _getDimensions.trans,
        svgMargins = _getDimensions.svgMargins;

    var xScale = d3.scaleBand().domain(data.map(function (d) {
      return d.x;
    })).paddingInner(0.1).paddingOuter(0.1).range([0, innerWidth]);

    var minYDomain = Math.min(0, d3.min(_data, function (d) {
      return d[1];
    }));
    var maxYDomain = d3.max(_data, function (d) {
      return d[1];
    });
    var yDomain = [d3.min(_data, function (d) {
      return d3.min(d, function (d) {
        return d[1];
      });
    }), d3.max(_data, function (d) {
      return d3.max(d, function (d) {
        return d[1];
      });
    })];
    var yScale = d3.scaleLinear().range([innerHeight, 0]).domain(yDomain);
    var maxYObjects = d3.max(data.map(function (d) {
      return Object.keys(d).length;
    }));
    var origArray = [].concat(_toConsumableArray(Array(maxYObjects).keys()));

    var colorsDomain = void 0;
    var colorsAccessor = void 0;

    if (this.props.color.accessor === 'Sequential') {
      colorsDomain = origArray.map(function (x) {
        return x / maxYObjects;
      });
      colorsAccessor = this.props.colorAccessorSequential;
    } else {
      colorsDomain = series;
      colorsAccessor = this.props.colorAccessorOrdinal;
    }

    return React.createElement('span', null, React.createElement(Chart, {
      viewBox: this.getViewBox(),
      legend: props.legend,
      data: props.data,
      margins: props.margins,
      color: this.props.color,
      colorsDomain: colorsDomain,
      colorsAccessor: colorsAccessor,
      width: props.width,
      height: props.height,
      title: props.title,
      shouldUpdate: !this.state.changeState,
      series: series,
      svgLegend: props.svgLegend,
      svgChart: props.svgChart,
      legendStyle: props.legendStyle,
      background: props.background,
      svgTitle: props.svgTitle
    }, React.createElement('g', { transform: trans, className: props.chartClassName }, React.createElement(XGrid, {
      xAxisClassName: props.xAxisClassName,
      xAxisTickValues: props.xAxisTickValues,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      xScale: xScale,
      margins: svgMargins,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      xOrient: props.xOrient,
      yOrient: yOrient,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeWidth: props.gridVerticalStrokeWidth,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash,
      gridText: props.gridText,
      translateTickLabel_Y_X: props.translateTickLabel_Y_X,
      translateTickLabel_Y_Y: props.translateTickLabel_Y_Y,
      translateTickLabel_X_X: props.translateTickLabel_X_X,
      translateTickLabel_X_Y: props.translateTickLabel_X_Y,
      xIsDate: props.xIsDate
    }), React.createElement(YGrid, {
      yAxisClassName: props.yAxisClassName,
      yAxisTickValues: props.yAxisTickValues,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      yScale: yScale,
      margins: svgMargins,
      yAxisTickCount: props.yAxisTickCount,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      xOrient: props.xOrient,
      yOrient: yOrient,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash,
      gridText: props.gridText,
      translateTickLabel_Y_X: props.translateTickLabel_Y_X,
      translateTickLabel_Y_Y: props.translateTickLabel_Y_Y,
      translateTickLabel_X_X: props.translateTickLabel_X_X,
      translateTickLabel_X_Y: props.translateTickLabel_X_Y
    }), React.createElement(DataSeries, {
      yScale: yScale,
      xScale: xScale,
      margins: svgMargins,
      _data: _data,
      series: series,
      width: innerWidth,
      height: innerHeight,
      grouped: props.grouped,
      color: this.props.color,
      colorsDomain: colorsDomain,
      colorsAccessor: colorsAccessor,
      hoverAnimation: props.hoverAnimation,
      valuesAccessor: props.valuesAccessor,
      xAccessorBar: props.xAccessorBar,
      yAccessorBar: props.yAccessorBar,
      y0Accessor: props.y0Accessor,
      onMouseOver: this.onMouseOver,
      onMouseLeave: this.onMouseLeave
    }), React.createElement(YAxis, {
      yAxisClassName: props.yAxisClassName,
      yAxisTickValues: props.yAxisTickValues,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      yScale: yScale,
      margins: svgMargins,
      yAxisTickCount: props.yAxisTickCount,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      xOrient: props.xOrient,
      yOrient: yOrient
    }), React.createElement(XAxis, {
      xAxisClassName: props.xAxisClassName,
      xAxisTickValues: props.xAxisTickValues,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      xScale: xScale,
      margins: svgMargins,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      xOrient: props.xOrient,
      yOrient: yOrient
    }))), props.showTooltip ? React.createElement(Tooltip, this.state.tooltip) : null);
  }
});

},{"../common":"/home/robson/projetos/rd3/src/common/index.js","../mixins":"/home/robson/projetos/rd3/src/mixins/index.js","../utils":"/home/robson/projetos/rd3/src/utils/index.js","./DataSeries":"/home/robson/projetos/rd3/src/barchart/DataSeries.jsx"}],"/home/robson/projetos/rd3/src/barchart/BarContainer.jsx":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _reactDom = window.ReactDOM;

var ReactDOM = _interopRequireWildcard(_reactDom);

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }newObj.default = obj;return newObj;
  }
}

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;
var Bar = require('./Bar');
var shade = require('../utils').shade;

module.exports = createReactClass({
  displayName: 'exports',

  propTypes: {
    fill: PropTypes.string,
    onMouseOver: PropTypes.func,
    onMouseLeave: PropTypes.func
  },

  getInitialState: function getInitialState() {
    return {
      // fill is named as fill instead of initialFill to avoid
      // confusion when passing down props from top parent
      fill: this.props.fill,
      fillCtl: this.props.fill
    };
  },

  statics: {
    getDerivedStateFromProps: function getDerivedStateFromProps(props, current_state) {
      if (current_state.fillCtl !== props.fill) {
        return {
          fillCtl: props.fill,
          fill: props.fill
        };
      }
      return null;
    }
  },

  _animateBar: function _animateBar() {
    var rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    this.props.onMouseOver.call(this, rect.right, rect.top, this.props.datapoint);
    this.setState({
      fill: shade(this.props.fill, 0.2)
    });
  },
  _restoreBar: function _restoreBar() {
    this.props.onMouseLeave.call(this);
    this.setState({
      fill: this.props.fill
    });
  },
  render: function render() {
    var props = this.props;

    // animation controller
    var handleMouseOver = void 0;
    var handleMouseLeave = void 0;
    if (props.hoverAnimation) {
      handleMouseOver = this._animateArea;
      handleMouseLeave = this._restoreArea;
    } else {
      handleMouseOver = handleMouseLeave = null;
    }

    // Remove props
    var newProps = Object.assign({}, this.props);
    delete newProps.hoverAnimation;

    return React.createElement(Bar, _extends({}, newProps, {
      fill: this.state.fill,
      onMouseOver: props.hoverAnimation ? this._animateBar : null,
      onMouseLeave: props.hoverAnimation ? this._restoreBar : null
    }));
  }
});

},{"../utils":"/home/robson/projetos/rd3/src/utils/index.js","./Bar":"/home/robson/projetos/rd3/src/barchart/Bar.jsx"}],"/home/robson/projetos/rd3/src/barchart/DataSeries.jsx":[function(require,module,exports){
'use strict';

var _createReactClass;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
}

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var BarContainer = require('./BarContainer');

var _require = require('../mixins'),
    CartesianChartPropsMixin = _require.CartesianChartPropsMixin;

module.exports = createReactClass((_createReactClass = {

  displayName: 'DataSeries',
  mixins: [CartesianChartPropsMixin],
  propTypes: {
    _data: PropTypes.array,
    series: PropTypes.array,
    grouped: PropTypes.bool,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    height: PropTypes.number,
    width: PropTypes.number,
    valuesAccessor: PropTypes.func,
    xAccessorBar: PropTypes.func,
    yAccessorBar: PropTypes.func,
    y0Accessor: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseLeave: PropTypes.func,
    hoverAnimation: PropTypes.bool, // TODO: prop types?
    xScale: PropTypes.any,
    yScale: PropTypes.any
  }

}, _defineProperty(_createReactClass, 'mixins', [CartesianChartPropsMixin]), _defineProperty(_createReactClass, '_renderBarSeries', function _renderBarSeries() {
  var _this = this;

  var _props = this.props,
      _data = _props._data,
      valuesAccessor = _props.valuesAccessor;

  return _data.map(function (layer, seriesIdx) {
    return valuesAccessor(layer).map(function (segment) {
      return _this._renderBarContainer(segment, seriesIdx);
    });
  });
}), _defineProperty(_createReactClass, '_renderBarContainer', function _renderBarContainer(segment, seriesIdx) {
  var _props2 = this.props,
      color = _props2.color,
      colorsAccessor = _props2.colorsAccessor,
      colorsDomain = _props2.colorsDomain,
      grouped = _props2.grouped,
      series = _props2.series,
      xScale = _props2.xScale,
      yScale = _props2.yScale;

  var barHeight = Math.abs(yScale(this.props.y0Accessor(segment)) - yScale(this.props.yAccessorBar(segment)));
  var yWidth = yScale(this.props.y0Accessor(segment) + this.props.yAccessorBar(segment));
  var y = grouped ? yScale(this.props.yAccessorBar(segment)) : yWidth;
  var key = this.props.series[seriesIdx] + segment.data.x + segment[1];
  var height = Math.abs(this.props.y0Accessor(segment) - this.props.yAccessorBar(segment));

  y = this.props.yAccessorBar(segment) >= 0 ? y : y - barHeight;
  y = y || 0;

  return React.createElement(BarContainer, {
    key: key,
    height: barHeight || 0,
    width: xScale.bandwidth(),
    x: xScale(this.props.xAccessorBar(segment)),
    y: y,
    fill: this.props.color.colors(colorsAccessor(colorsDomain, seriesIdx)),
    hoverAnimation: this.props.hoverAnimation,
    onMouseOver: this.props.onMouseOver,
    onMouseLeave: this.props.onMouseLeave,
    datapoint: {
      xValue: this.props.xAccessorBar(segment),
      yValue: this.props.yAccessorBar(segment),
      seriesName: this.props.series[seriesIdx],
      height: height || 0
    }
  });
}), _defineProperty(_createReactClass, 'render', function render() {
  return React.createElement('g', null, this._renderBarSeries());
}), _createReactClass));

},{"../mixins":"/home/robson/projetos/rd3/src/mixins/index.js","./BarContainer":"/home/robson/projetos/rd3/src/barchart/BarContainer.jsx"}],"/home/robson/projetos/rd3/src/barchart/index.js":[function(require,module,exports){
'use strict';

exports.BarChart = require('./BarChart');

},{"./BarChart":"/home/robson/projetos/rd3/src/barchart/BarChart.jsx"}],"/home/robson/projetos/rd3/src/candlestick/Candle.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'Candle',

  propTypes: {
    className: PropTypes.string,
    shapeRendering: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-candlestick-candle',
      shapeRendering: 'crispEdges',
      stroke: '#000',
      strokeWidth: 1
    };
  },
  render: function render() {
    var props = this.props;

    return React.createElement('rect', {
      className: props.className,
      fill: props.candleFill,
      x: props.candleX,
      y: props.candleY,
      stroke: props.candleFill,
      strokeWidth: props.strokeWidth,
      style: { shapeRendering: props.shapeRendering },
      width: props.candleWidth,
      height: props.candleHeight,
      onMouseOver: props.handleMouseOver,
      onMouseLeave: props.handleMouseLeave
    });
  }
});

},{}],"/home/robson/projetos/rd3/src/candlestick/CandlestickChart.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var utils = require('../utils');
var DataSeries = require('./DataSeries');

var _require = require('../common'),
    Chart = _require.Chart,
    XAxis = _require.XAxis,
    YAxis = _require.YAxis,
    XGrid = _require.XGrid,
    YGrid = _require.YGrid;

var _require2 = require('../mixins'),
    ViewBoxMixin = _require2.ViewBoxMixin,
    CartesianChartPropsMixin = _require2.CartesianChartPropsMixin;

module.exports = createReactClass({

  displayName: 'CandleStickChart',

  propTypes: {
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    fillUp: PropTypes.func,
    fillUpAccessor: PropTypes.func,
    fillDown: PropTypes.func,
    fillDownAccessor: PropTypes.func,
    hoverAnimation: PropTypes.bool,
    xAxisFormatter: PropTypes.func,
    xAxisTickInterval: PropTypes.object,
    xAxisTickValues: PropTypes.array,
    yAxisFormatter: PropTypes.func,
    yAxisTickCount: PropTypes.number,
    yAxisTickValues: PropTypes.array
  },

  mixins: [CartesianChartPropsMixin, ViewBoxMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-candlestick',
      xAxisClassName: 'rd3-candlestick-xaxis',
      yAxisClassName: 'rd3-candlestick-yaxis',
      data: [],
      fillUp: function fillUp() {
        return '#009900';
      },
      fillUpAccessor: function fillUpAccessor(d, idx) {
        return idx;
      },
      // fillDown: d3.scaleOrdinal(d3.schemeCategory10),
      fillDown: function fillDown() {
        return '#FF3300';
      },
      fillDownAccessor: function fillDownAccessor(d, idx) {
        return idx;
      },
      hoverAnimation: true,
      margins: { top: 10, right: 20, bottom: 30, left: 45 },
      xAccessor: function xAccessor(d) {
        return d.x;
      },
      yAccessor: function yAccessor(d) {
        return { open: d.open, high: d.high, low: d.low, close: d.close };
      }
    };
  },
  render: function render() {
    var props = this.props;

    var _getDimensions = this.getDimensions(),
        innerWidth = _getDimensions.innerWidth,
        innerHeight = _getDimensions.innerHeight,
        trans = _getDimensions.trans,
        svgMargins = _getDimensions.svgMargins;

    var yOrient = this.getYOrient();
    var domain = props.domain || {};

    if (!Array.isArray(props.data)) {
      props.data = [props.data];
    }
    if (this.props.data && this.props.data.length < 1) {
      return null;
    }
    var flattenedData = utils.flattenData(props.data, props.xAccessor, props.yAccessor);

    var xValues = flattenedData.xValues;
    var yValues = flattenedData.yValues;
    var scales = utils.calculateScales(innerWidth, innerHeight, xValues, yValues, domain.x, domain.y);

    var dataSeries = props.data.map(function (series, idx) {
      return React.createElement(DataSeries, {
        key: idx,
        seriesName: series.name,
        index: idx,
        xScale: scales.xScale,
        yScale: scales.yScale,
        data: series.values,
        fillUp: props.fillUp(props.fillUpAccessor(series, idx)),
        fillDown: props.fillDown(props.fillDownAccessor(series, idx)),
        xAccessor: props.xAccessor,
        yAccessor: props.yAccessor,
        hoverAnimation: props.hoverAnimation
      });
    });

    return React.createElement(Chart, {
      viewBox: this.getViewBox(),
      width: props.width,
      height: props.height,
      margins: props.margins,
      title: props.title
    }, React.createElement('g', { transform: trans, className: props.className }, React.createElement(XGrid, {
      xAxisClassName: props.xAxisClassName,
      xAxisTickValues: props.xAxisTickValues,
      xAxisTickCount: props.xAxisTickCount,
      xAxisTickInterval: props.xAxisTickInterval,
      xAxisOffset: props.xAxisOffset,
      xScale: scales.xScale,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      data: props.data,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      stroke: props.axesColor,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash,
      xIsDate: props.xIsDate,
      xTickFormat: props.xTickFormat,
      gridText: props.gridText

    }), React.createElement(YGrid, {
      yAxisClassName: props.yAxisClassName,
      yScale: scales.yScale,
      yAxisTickValues: props.yAxisTickValues,
      yAxisTickCount: props.yAxisTickCount,
      yAxisOffset: props.yAxisOffset,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      stroke: props.axesColor,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridVerticalStrokeDash,
      gridText: props.gridText

    }), dataSeries, React.createElement(XAxis, {
      xAxisClassName: props.xAxisClassName,
      xScale: scales.xScale,
      xAxisTickValues: props.xAxisTickValues,
      xAxisTickInterval: props.xAxisTickInterval,
      xAxisOffset: props.xAxisOffset,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal
    }), React.createElement(YAxis, {
      yAxisClassName: props.yAxisClassName,
      yScale: scales.yScale,
      yAxisTickValues: props.yAxisTickValues,
      yAxisOffset: props.yAxisOffset,
      yAxisTickCount: props.yAxisTickCount,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: props.height,
      horizontalChart: props.horizontal
    })));
  }
});

},{"../common":"/home/robson/projetos/rd3/src/common/index.js","../mixins":"/home/robson/projetos/rd3/src/mixins/index.js","../utils":"/home/robson/projetos/rd3/src/utils/index.js","./DataSeries":"/home/robson/projetos/rd3/src/candlestick/DataSeries.jsx"}],"/home/robson/projetos/rd3/src/candlestick/CandlestickContainer.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var utils = require('../utils');
var Candle = require('./Candle');
var Wick = require('./Wick');

module.exports = createReactClass({

  displayName: 'CandleStickContainer',

  propTypes: {
    candleX: PropTypes.number,
    candleY: PropTypes.number,
    className: PropTypes.string,
    candleFill: PropTypes.string,
    candleHeight: PropTypes.number,
    candleWidth: PropTypes.number,
    wickX1: PropTypes.number,
    wickX2: PropTypes.number,
    wickY1: PropTypes.number,
    wickY2: PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-candlestick-container'
    };
  },
  getInitialState: function getInitialState() {
    // state for animation usage
    return {
      candleWidth: this.props.candleWidth,
      candleFill: this.props.candleFill
    };
  },
  _animateCandle: function _animateCandle() {
    this.setState({
      candleWidth: this.props.candleWidth * 1.5,
      candleFill: utils.shade(this.props.candleFill, -0.2)
    });
  },
  _restoreCandle: function _restoreCandle() {
    this.setState({
      candleWidth: this.props.candleWidth,
      candleFill: this.props.candleFill
    });
  },
  render: function render() {
    var props = this.props;
    var state = this.state;

    // animation controller
    var handleMouseOver = void 0;
    var handleMouseLeave = void 0;
    if (props.hoverAnimation) {
      handleMouseOver = this._animateCandle;
      handleMouseLeave = this._restoreCandle;
    } else {
      handleMouseOver = handleMouseLeave = null;
    }

    return React.createElement('g', { className: props.className }, React.createElement(Wick, {
      wickX1: props.wickX1,
      wickX2: props.wickX2,
      wickY1: props.wickY1,
      wickY2: props.wickY2
    }), React.createElement(Candle, {
      candleFill: state.candleFill,
      candleWidth: state.candleWidth,
      candleX: props.candleX - (state.candleWidth - props.candleWidth) / 2,
      candleY: props.candleY,
      candleHeight: props.candleHeight,
      handleMouseOver: handleMouseOver,
      handleMouseLeave: handleMouseLeave
    }));
  }
});

},{"../utils":"/home/robson/projetos/rd3/src/utils/index.js","./Candle":"/home/robson/projetos/rd3/src/candlestick/Candle.jsx","./Wick":"/home/robson/projetos/rd3/src/candlestick/Wick.jsx"}],"/home/robson/projetos/rd3/src/candlestick/DataSeries.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var CandlestickContainer = require('./CandlestickContainer');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    fillUp: PropTypes.string.isRequired,
    fillDown: PropTypes.string.isRequired
  },

  render: function render() {
    var props = this.props;

    var xRange = props.xScale.range();
    var width = Math.abs(xRange[0] - xRange[1]);
    var candleWidth = width / (props.data.length + 2) * 0.5;

    var dataSeriesArray = props.data.map(function (d, idx) {
      // Candles
      var ohlc = props.yAccessor(d);
      var candleX = props.xScale(props.xAccessor(d)) - 0.5 * candleWidth;
      var candleY = props.yScale(Math.max(ohlc.open, ohlc.close));
      var candleHeight = Math.abs(props.yScale(ohlc.open) - props.yScale(ohlc.close));
      var wickY2 = props.yScale(ohlc.low);
      var candleFill = ohlc.open <= ohlc.close ? props.fillUp : props.fillDown;

      // Wicks
      var wickX1 = props.xScale(props.xAccessor(d));
      var wickY1 = props.yScale(ohlc.high);
      var wickX2 = wickX1;

      return React.createElement(CandlestickContainer, {
        key: idx,
        candleFill: candleFill,
        candleHeight: candleHeight,
        candleWidth: candleWidth,
        candleX: candleX,
        candleY: candleY,
        wickX1: wickX1,
        wickX2: wickX2,
        wickY1: wickY1,
        wickY2: wickY2,
        hoverAnimation: props.hoverAnimation
      });
    }, this);

    return React.createElement('g', null, dataSeriesArray);
  }
});

},{"./CandlestickContainer":"/home/robson/projetos/rd3/src/candlestick/CandlestickContainer.jsx"}],"/home/robson/projetos/rd3/src/candlestick/Wick.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'Wick',

  propTypes: {
    className: PropTypes.string,
    shapeRendering: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-candlestick-wick',
      stroke: '#666666',
      strokeWidth: 1,
      shapeRendering: 'crispEdges'
    };
  },
  render: function render() {
    var props = this.props;
    return React.createElement('line', {
      stroke: props.stroke,
      strokeWidth: props.strokeWidth
      // style={{ shapeRendering: props.shapeRendering }}
      , className: props.className,
      x1: props.wickX1,
      y1: props.wickY1,
      x2: props.wickX2,
      y2: props.wickY2
    });
  }
});

},{}],"/home/robson/projetos/rd3/src/candlestick/index.js":[function(require,module,exports){
'use strict';

exports.CandlestickChart = require('./CandlestickChart');

},{"./CandlestickChart":"/home/robson/projetos/rd3/src/candlestick/CandlestickChart.jsx"}],"/home/robson/projetos/rd3/src/common/BreadCrumb.jsx":[function(require,module,exports){
'use strict';

var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({
    displayName: 'BreadCrumb',
    render: function render() {
        var breadcrumb = [];
        this.props.breadcrumb.reverse().map(function (bc, i, _ref) {
            var length = _ref.length;

            if (i + 1 === length) {
                breadcrumb.push(React.createElement('div', { key: bc.label, onClick: function onClick() {
                        return bc.ev(bc.label, 'up');
                    }, style: { "paddingLeft": "4px" } }, ' ', bc.label, ' '));
            } else {
                breadcrumb.push(React.createElement('div', { key: bc.label, onClick: function onClick() {
                        return bc.ev(bc.label, 'up');
                    }, style: { "paddingLeft": "4px" } }, ' ', bc.label + " > ", '  '));
            }
        });
        return React.createElement('div', { style: { display: "flex", "flexDirection": "row" } }, breadcrumb);
    }
});

},{}],"/home/robson/projetos/rd3/src/common/Legend.jsx":[function(require,module,exports){
'use strict';

var _ChartContext = require('../ChartContext');

var _ChartContext2 = _interopRequireDefault(_ChartContext);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;

module.exports = createReactClass({

  displayName: 'Legend',

  propTypes: {
    className: PropTypes.string,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    data: PropTypes.array.isRequired,
    itemClassName: PropTypes.string,
    margins: PropTypes.object,
    text: PropTypes.string
    // width: PropTypes.number.isRequired,
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-legend',
      itemClassName: 'rd3-legend-item',
      text: '#000',
      legendStyle: {
        textStyle: {
          fontSize: '50%',
          verticalAlign: 'top'
        },
        bulletStyle: {
          lineHeight: '60%',
          fontSize: '200%'
        }
      }
    };
  },
  render: function render() {

    /* Context */
    this.contextType = _ChartContext2.default;
    var chartStyle = this.contextType._currentValue.chartStyle;

    var props = this.props;
    var textStyle = props.legendStyle.textStyle;
    var legendItems = [];

    var fontSize = props.legendStyle.textStyle.fontSize;
    var fontWeight = props.legendStyle.textStyle.fontWeight;

    /* TODO - Legado !!!
      Deixar a entrada de dados flat para todos os graficos.
    */
    if (props.series !== undefined) {
      props.series.map(function (serie, idx) {
        var itemStyle = Object.assign({}, props.legendStyle.bulletStyle);
        itemStyle.color = props.color.colors(props.colorsAccessor(props.colorsDomain, idx));

        var rev_idx = props.series.length - idx;
        legendItems.push(React.createElement('g', { key: 'series_circle:' + idx }, React.createElement('circle', { cx: '30', cy: 10 + 15 * rev_idx, r: '4', fill: itemStyle.color, id: 'circle' }), React.createElement('text', {
          className: 'rd3-legend-text ' + (chartStyle && chartStyle),
          x: '42',
          y: 14 + 15 * rev_idx
        }, serie)));
      });
    } else {
      if (!props.color) {
        return [];
      }
      props.data.forEach(function (series, idx) {
        var itemStyle = Object.assign({}, props.legendStyle.bulletStyle);
        itemStyle.color = props.color.colors(props.colorsAccessor(series, idx));

        var rev_idx = props.series.length - idx;
        legendItems.push(React.createElement('g', { key: 'circle:' + idx }, React.createElement('circle', { cx: '30', cy: 10 + 15 * rev_idx, r: '4', fill: itemStyle.color, id: 'circle' }), React.createElement('text', {
          className: 'rd3-legend-text ' + (chartStyle && chartStyle),
          x: '50',
          y: 14 + 15 * rev_idx
          // style={{'font-size':'0.8em'}}
        }, series.name)));
      });
    }
    return legendItems;
  }
});

},{"../ChartContext":"/home/robson/projetos/rd3/src/ChartContext.js"}],"/home/robson/projetos/rd3/src/common/Polygon.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({
  displayName: 'exports',

  // TODO: PropTypes.any
  propTypes: {
    structure: PropTypes.any,
    id: PropTypes.any,
    vnode: PropTypes.any
  },

  _animateCircle: function _animateCircle() {
    this.props.structure.cursor('voronoi').cursor(this.props.id).update(function () {
      return 'active';
    });
    // this.props.pubsub.emit('animate', this.props.id);
  },
  _restoreCircle: function _restoreCircle() {
    this.props.structure.cursor('voronoi').cursor(this.props.id).update(function () {
      return 'inactive';
    });
    // this.props.pubsub.emit('restore', this.props.id);
  },
  _drawPath: function _drawPath(d) {
    if (d === undefined) {
      return '';
    }
    return 'M' + d.join(',') + 'Z';
  },
  render: function render() {
    return React.createElement('path', {
      onMouseOver: this._animateCircle,
      onMouseOut: this._restoreCircle,
      fill: 'white',
      opacity: '0',
      d: this._drawPath(this.props.vnode)
    });
  }
});

},{}],"/home/robson/projetos/rd3/src/common/Tooltip.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({
  displayName: 'exports',

  propTypes: {
    x: PropTypes.number,
    y: PropTypes.number,
    child: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.element]),
    show: PropTypes.bool
  },

  render: function render() {
    var props = this.props;
    var display = this.props.show ? 'inherit' : 'none';
    var containerStyles = {
      position: 'fixed',
      top: props.y,
      left: props.x,
      display: display,
      opacity: 0.8,
      width: '100px'
    };

    // TODO: add 'right: 0px' style when tooltip is off the chart
    var tooltipStyles = {
      position: 'absolute',
      backgroundColor: 'white',
      border: '1px solid',
      borderColor: '#ddd',
      borderRadius: '4px',
      padding: '5px',
      marginLeft: '10px',
      marginRight: '10px',
      marginTop: '-15px',
      width: '100px'
    };
    return React.createElement('div', { style: containerStyles }, React.createElement('div', { style: tooltipStyles, className: 'rd3-legend-text' }, props.child));
  }
});

},{}],"/home/robson/projetos/rd3/src/common/Voronoi.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;
var d3 = window.d3;
var Polygon = require('./Polygon');

module.exports = createReactClass({

  displayName: 'Voronoi',

  // TODO: PropTypes.any
  propTypes: {
    xScale: PropTypes.any,
    yScale: PropTypes.any,
    width: PropTypes.any,
    height: PropTypes.any,
    structure: PropTypes.any,
    data: PropTypes.any
  },

  render: function render() {
    var _this = this;

    var xScale = this.props.xScale;
    var yScale = this.props.yScale;

    var voronoi = d3.geom.voronoi().x(function (d) {
      return xScale(d.coord.x);
    }).y(function (d) {
      return yScale(d.coord.y);
    }).clipExtent([[0, 0], [this.props.width, this.props.height]]);

    var regions = voronoi(this.props.data).map(function (vnode, idx) {
      return React.createElement(Polygon, { structure: _this.props.structure, key: idx, id: vnode.point.id, vnode: vnode });
    });

    return React.createElement('g', null, regions);
  }
});

},{"./Polygon":"/home/robson/projetos/rd3/src/common/Polygon.jsx"}],"/home/robson/projetos/rd3/src/common/axes/AxisLine.jsx":[function(require,module,exports){
'use strict';

var _ChartContext = require('../../ChartContext');

var _ChartContext2 = _interopRequireDefault(_ChartContext);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'AxisLine',

  propTypes: {
    scale: PropTypes.func.isRequired,
    innerTickSize: PropTypes.number,
    outerTickSize: PropTypes.number,
    tickPadding: PropTypes.number,
    tickArguments: PropTypes.array,
    fill: PropTypes.string,
    stroke: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      innerTickSize: 6,
      outerTickSize: 6,
      tickPadding: 3,
      fill: 'none',
      tickArguments: [10],
      tickValues: null,
      tickFormat: null
    };
  },
  _d3_scaleExtent: function _d3_scaleExtent(domain) {
    var start = domain[0];
    var stop = domain[domain.length - 1];
    return start < stop ? [start, stop] : [stop, start];
  },
  _d3_scaleRange: function _d3_scaleRange(scale) {
    return scale.rangeExtent ? scale.rangeExtent() : this._d3_scaleExtent(scale.range());
  },
  render: function render() {
    var props = this.props;
    var sign = props.orient === 'top' || props.orient === 'left' ? -1 : 1;

    /* Context */
    this.contextType = _ChartContext2.default;
    var chartStyle = this.contextType._currentValue.chartStyle;

    var range = this._d3_scaleRange(props.scale);

    var d = void 0;
    if (props.orient === 'bottom' || props.orient === 'top') {
      d = 'M' + range[0] + ',' + sign * props.outerTickSize + 'V0H' + range[1] + 'V' + sign * props.outerTickSize;
    } else {
      d = 'M' + sign * props.outerTickSize + ',' + range[0] + 'H0V' + range[1] + 'H' + sign * props.outerTickSize;
    }

    return React.createElement('path', {
      // className="domain"
      className: 'rd3-axis-domain ' + (chartStyle && chartStyle),
      d: d,
      style: { shapeRendering: 'crispEdges'
        // fill={props.fill}
      }, fill: 'none',
      stroke: '#000000',
      strokeWidth: '0.5'

      // stroke={props.stroke}
      // strokeWidth={props.strokeWidth}
    });
  }
});

},{"../../ChartContext":"/home/robson/projetos/rd3/src/ChartContext.js"}],"/home/robson/projetos/rd3/src/common/axes/AxisTicks.jsx":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _ChartContext = require('../../ChartContext');

var _ChartContext2 = _interopRequireDefault(_ChartContext);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var utils = require('../../utils');

var React = window.React;
var PropTypes = window.PropTypes;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'AxisTick',

  propTypes: {
    scale: PropTypes.func.isRequired,
    orient: PropTypes.oneOf(['top', 'bottom', 'left', 'right']).isRequired,
    orient2nd: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    horizontal: PropTypes.bool,
    tickArguments: PropTypes.array,
    tickValues: PropTypes.array,
    innerTickSize: PropTypes.number,
    outerTickSize: PropTypes.number,
    tickPadding: PropTypes.number,
    tickFormat: PropTypes.func,
    tickStroke: PropTypes.string,
    tickTextStroke: PropTypes.string,
    gridHorizontal: PropTypes.bool,
    gridVertical: PropTypes.bool,
    gridHorizontalStroke: PropTypes.string,
    gridVerticalStroke: PropTypes.string,
    gridHorizontalStrokeWidth: PropTypes.number,
    gridVerticalStrokeWidth: PropTypes.number,
    gridHorizontalStrokeDash: PropTypes.string,
    gridVerticalStrokeDash: PropTypes.string,
    gridText: PropTypes.object
  },
  getDefaultProps: function getDefaultProps() {
    return {
      // translateTickLabel: 'translate("10px",0)',
      translateTickLabel_Y_X: 0,
      translateTickLabel_Y_Y: 0,
      translateTickLabel_X_X: 0,
      translateTickLabel_X_Y: 0,

      innerTickSize: 6,
      outerTickSize: 6,
      tickStroke: '#000',
      tickPadding: 6,
      tickArguments: [10],
      tickValues: null,
      gridHorizontal: false,
      gridVertical: false,
      gridHorizontalStroke: '#D8D7D7',
      gridVerticalStroke: '#D8D7D7',
      gridHorizontalStrokeWidth: 0.4,
      gridVerticalStrokeWidth: 0.4,
      gridHorizontalStrokeDash: '5, 5',
      gridVerticalStrokeDash: '5, 5',
      gridText: { rotate: {
          top: null,
          right: null,
          bottom: null,
          left: null
        },
        translate: {
          text: { x: 0, y: 0 },
          line: { x: 0, y: 0 }
        },
        font: {
          size: '1.0em',
          weight: '.01'
        }
      },
      xGridLabelOffset: 50,
      yGridLabelOffset: 10

    };
  },
  render: function render() {
    // debugger
    var props = this.props;

    /* Context */
    this.contextType = _ChartContext2.default;
    var chartStyle = this.contextType._currentValue.chartStyle;

    var tr = void 0;
    var trText = void 0;
    var gridTextRotate = void 0;
    var gridTextFontSize = void 0;
    var gridTextFontWeight = void 0;
    var textAnchor = void 0;
    var textTransform = void 0;
    var tickFormat = void 0;
    var y1 = void 0;
    var y2 = void 0;
    var dy = void 0;
    var x1 = void 0;
    var x2 = void 0;

    var gridStrokeWidth = void 0;
    var gridStroke = void 0;
    var gridStrokeDashArray = void 0;
    var x2grid = void 0;
    var y2grid = void 0;
    var gridOn = false;
    var translateTickLabel = void 0;
    var formatDate = void 0;
    var maxTicksXAxis = void 0;

    var sign = props.orient === 'top' || props.orient === 'right' ? -1 : 1;
    var tickSpacing = Math.max(props.innerTickSize, 0) + props.tickPadding;

    var scale = props.scale;

    var ticks = void 0;
    if (props.tickValues) {
      ticks = props.tickValues;
    } else if (scale.ticks) {
      ticks = scale.ticks.apply(scale, props.tickArguments);
    } else {
      ticks = scale.domain();
    }

    if (props.tickFormatting) {
      tickFormat = props.tickFormatting;
    } else if (scale.tickFormat) {
      tickFormat = function tickFormat(d) {
        return d;
      };
      /* TODO: implement props.tickArguments */
      // tickFormat = d3.timeFormat("%b %y");
      // tickFormat = scale.tickFormat.apply(scale, props.tickArguments);
    } else {
      tickFormat = function tickFormat(d) {
        return d;
      };
    }

    var adjustedScale = scale.bandwidth ? function (d) {
      return scale(d) + scale.bandwidth() / 2;
    } : scale;

    // Still working on this
    // Ticks and lines are not fully aligned
    // in some orientations
    var adjustedScaleTransTxtX = function adjustedScaleTransTxtX(tick) {
      return adjustedScale(tick) + props.gridText.translate.text.x;
    };

    switch (props.orient) {
      case 'top':
        tr = function tr(tick) {
          return 'translate(' + adjustedScale(tick) + ',0)';
        };
        trText = function trText(tick) {
          return 'translate(' + adjustedScale(tick) + ',0)';
        };
        textAnchor = 'middle';
        y2 = props.innerTickSize * sign;
        y1 = tickSpacing * sign;
        dy = sign < 0 ? '0em' : '.71em';
        x2grid = 0;
        y2grid = -props.height;
        gridTextRotate = props.gridText.rotate.top;
        break;
      case 'bottom':
        tr = function tr(tick) {
          return 'translate(' + adjustedScale(tick) + ',0)';
        };
        trText = function trText(tick) {
          return 'translate(' + adjustedScaleTransTxtX(tick) + ',' + props.gridText.translate.text.y + ')';
        };
        textAnchor = 'middle';
        y2 = props.innerTickSize * sign;
        y1 = tickSpacing * sign;
        dy = sign < 0 ? '0em' : '.51em';
        x2grid = 0;
        y2grid = -props.height;
        gridTextRotate = props.gridText.rotate.bottom;
        translateTickLabel = 'translate(' + props.translateTickLabel_X_X + ',' + props.translateTickLabel_X_Y + ')';
        formatDate = props.xIsDate === true ? function (d) {
          return d3.timeFormat(props.xTickFormat)(d);
        } : function (d) {
          return d;
        };

        // tickFormat = d3.timeFormat("%b %y");
        // formatDate = (d) => d;
        ticks.length > 40 ? maxTicksXAxis = 5 : maxTicksXAxis = 1;
        break;
      case 'left':
        tr = function tr(tick) {
          return 'translate(0,' + adjustedScale(tick) + ')';
        };
        trText = function trText(tick) {
          return 'translate(0,' + adjustedScale(tick) + ')';
        };
        textAnchor = 'end';
        x2 = props.innerTickSize * -sign;
        x1 = tickSpacing * -sign;
        dy = '.32em';
        x2grid = props.width;
        y2grid = 0;
        gridTextRotate = props.gridText.rotate.left;
        translateTickLabel = 'translate(' + props.translateTickLabel_Y_X + ',' + props.translateTickLabel_Y_Y + ')';
        formatDate = function formatDate(d) {
          return utils.nFormatter(d, 2);
        };
        // formatDate = (d) => d;
        maxTicksXAxis = 1;
        break;
      case 'right':
        tr = function tr(tick) {
          return 'translate(0,' + adjustedScale(tick) + ')';
        };
        trText = function trText(tick) {
          return 'translate(0,' + adjustedScale(tick) + ')';
        };
        textAnchor = 'start';
        x2 = props.innerTickSize * -sign;
        x1 = tickSpacing * -sign;
        dy = '.32em';
        x2grid = -props.width;
        y2grid = 0;
        gridTextRotate = props.gridText.rotate.right;
        break;
      default:
        break;
    }

    if (props.horizontalChart) {
      textTransform = 'rotate(-90)';
      var _ref = [x1, -y1 || 0];
      y1 = _ref[0];
      x1 = _ref[1];

      switch (props.orient) {
        case 'top':
          textAnchor = 'start';
          dy = '.32em';
          break;
        case 'bottom':
          textAnchor = 'end';
          dy = '.32em';
          break;
        case 'left':
          textAnchor = 'middle';
          dy = sign < 0 ? '.71em' : '0em';
          break;
        case 'right':
          textAnchor = 'middle';
          dy = sign < 0 ? '.71em' : '0em';
          break;
        default:
          break;
      }
    }

    if (props.gridHorizontal) {
      gridOn = true;
      gridStrokeWidth = props.gridHorizontalStrokeWidth;
      gridStroke = props.gridHorizontalStroke;
      gridStrokeDashArray = props.gridHorizontalStrokeDash;
    } else if (props.gridVertical) {
      gridOn = true;
      gridStrokeWidth = props.gridVerticalStrokeWidth;
      gridStroke = props.gridVerticalStroke;
      gridStrokeDashArray = props.gridVerticalStrokeDash;
    }

    // return grid line if grid is enabled and grid line is not on at same position as other axis.
    var gridLine = function gridLine(pos) {
      if (gridOn && !(props.orient2nd === 'left' && pos === 0) && !(props.orient2nd === 'right' && pos === props.width) && !((props.orient === 'left' || props.orient === 'right') && pos === props.height)) {
        return React.createElement('line', {
          className: 'rd3-svg-grid-lines ' + (chartStyle && chartStyle),
          x2: x2grid, y2: y2grid
        });
      }
      return null;
    };

    var optionalTextProps = textTransform ? {
      transform: textTransform
    } : {};

    gridTextFontSize = props.gridText.font.size;
    gridTextFontWeight = props.gridText.font.weight;

    // debugger;

    return React.createElement('g', null, React.createElement('g', null, ticks.map(function (tick, idx) {
      return React.createElement('g', { key: idx, className: 'tick', transform: tr(tick) }, gridLine(adjustedScale(tick)), React.createElement('line', {
        className: 'rd3-svg-grid-ticks ' + (chartStyle && chartStyle),
        x2: x2,
        y2: y2
      }));
    })), '/* Move all tick labels at once */', React.createElement('g', { transform: translateTickLabel, className: 'rd3-axis-text-group ' + (chartStyle && chartStyle) }, ticks.filter(function (tick, idx) {
      return idx % [maxTicksXAxis] === 0;
    }).map(function (tick, idx) {
      return React.createElement('g', { className: 'tickText', transform: trText(tick), key: idx }, React.createElement('text', _extends({
        strokeWidth: gridTextFontWeight,
        dy: dy, x: x1, y: y1,
        style: { stroke: props.tickTextStroke, fill: props.tickTextStroke, fontSize: gridTextFontSize },
        textAnchor: textAnchor
      }, optionalTextProps, {
        transform: gridTextRotate
      }), ('' + tickFormat(tick)).split('\n').map(function (tickLabel, index) {
        {/* debugger; */}
        return React.createElement('tspan', {
          className: 'rd3-axis-text ' + (chartStyle && chartStyle),
          x: x1,
          dy: dy,
          key: index
        }, formatDate(tick));
      })));
    })));
  }
});

},{"../../ChartContext":"/home/robson/projetos/rd3/src/ChartContext.js","../../utils":"/home/robson/projetos/rd3/src/utils/index.js"}],"/home/robson/projetos/rd3/src/common/axes/Label.jsx":[function(require,module,exports){
'use strict';

var _ChartContext = require('../../ChartContext');

var _ChartContext2 = _interopRequireDefault(_ChartContext);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'Label',

  propTypes: {
    height: PropTypes.number,
    horizontalChart: PropTypes.bool,
    horizontalTransform: PropTypes.string,
    label: PropTypes.string.isRequired,
    width: PropTypes.number,
    strokeWidth: PropTypes.number,
    textAnchor: PropTypes.string,
    verticalTransform: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      horizontalTransform: 'rotate(270)',
      strokeWidth: 0.01,
      textAnchor: 'middle',
      verticalTransform: 'rotate(0)'
    };
  },
  render: function render() {
    var props = this.props;

    if (!props.label) {
      return React.createElement('text', null);
    }

    var transform = void 0;
    var x = void 0;
    var y = void 0;
    if (props.orient === 'top' || props.orient === 'bottom') {
      transform = props.verticalTransform;
      x = props.width / 2;
      y = props.offset;

      if (props.horizontalChart) {
        transform = 'rotate(180 ' + x + ' ' + y + ') ' + transform;
      }
    } else {
      // left, right
      transform = props.horizontalTransform;
      x = -props.height / 2;
      if (props.orient === 'left') {
        y = -props.offset;
      } else {
        y = props.offset;
      }
    }

    return React.createElement(_ChartContext2.default.Consumer, null, function (context) {
      return React.createElement('text', {
        className: 'rd3-axis-labels ' + (context && context.chartStyle),
        strokeWidth: props.strokeWidth.toString(),
        textAnchor: props.textAnchor,
        transform: transform,
        y: y,
        x: x
        // style={{'font-size':'1.4em'}}

      }, props.label);
    });
  }
});

},{"../../ChartContext":"/home/robson/projetos/rd3/src/ChartContext.js"}],"/home/robson/projetos/rd3/src/common/axes/XAxis.jsx":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;
var d3 = window.d3;
var AxisTicks = require('./AxisTicks');
var AxisLine = require('./AxisLine');
var Label = require('./Label');

module.exports = createReactClass({

  displayName: 'XAxis',

  propTypes: {
    fill: PropTypes.string,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    horizontalChart: PropTypes.bool,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.string,
    tickStroke: PropTypes.string,
    tickTextStroke: PropTypes.string,
    xAxisClassName: PropTypes.string,
    xAxisLabel: PropTypes.string,
    xAxisTickValues: PropTypes.array,
    xAxisOffset: PropTypes.number,
    xScale: PropTypes.func.isRequired,
    xOrient: PropTypes.oneOf(['top', 'bottom']),
    yOrient: PropTypes.oneOf(['left', 'right']),
    gridVertical: PropTypes.bool,
    gridVerticalStroke: PropTypes.string,
    gridVerticalStrokeWidth: PropTypes.number,
    gridVerticalStrokeDash: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: 'none',
      stroke: 'none',
      strokeWidth: '1',
      tickStroke: '#000',
      xAxisClassName: 'rd3-x-axis',
      xAxisLabel: '',
      xAxisLabelOffset: 10,
      xAxisOffset: 0,
      xOrient: 'bottom',
      yOrient: 'left'
    };
  },
  render: function render() {
    var props = this.props;

    var t = 'translate(0 ,' + (props.xAxisOffset + props.height) + ')';

    var tickArguments = void 0;
    if (typeof props.xAxisTickCount !== 'undefined') {
      tickArguments = [props.xAxisTickCount];
    }

    if (typeof props.xAxisTickInterval !== 'undefined') {
      // tickArguments = [d3.time[props.xAxisTickInterval.unit], props.xAxisTickInterval.interval];
    }

    return React.createElement('g', {
      className: props.xAxisClassName,
      transform: t
    }, React.createElement(AxisLine, _extends({
      scale: props.xScale,
      stroke: props.stroke,
      orient: props.xOrient,
      outerTickSize: props.tickSize
    }, props)), React.createElement(Label, {
      horizontalChart: props.horizontalChart,
      label: props.xAxisLabel,
      offset: props.xAxisLabelOffset,
      orient: props.xOrient,
      margins: props.margins,
      width: props.width
    }));
  }
});

},{"./AxisLine":"/home/robson/projetos/rd3/src/common/axes/AxisLine.jsx","./AxisTicks":"/home/robson/projetos/rd3/src/common/axes/AxisTicks.jsx","./Label":"/home/robson/projetos/rd3/src/common/axes/Label.jsx"}],"/home/robson/projetos/rd3/src/common/axes/XGrid.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;
var d3 = window.d3;
var AxisTicks = require('./AxisTicks');
var AxisLine = require('./AxisLine');
var Label = require('./Label');

module.exports = createReactClass({

  displayName: 'XGrid',

  propTypes: {
    fill: PropTypes.string,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    horizontalChart: PropTypes.bool,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.string,
    tickStroke: PropTypes.string,
    tickTextStroke: PropTypes.string,
    xAxisClassName: PropTypes.string,
    xAxisLabel: PropTypes.string,
    xAxisTickValues: PropTypes.array,
    xAxisOffset: PropTypes.number,
    xScale: PropTypes.func.isRequired,
    xOrient: PropTypes.oneOf(['top', 'bottom']),
    yOrient: PropTypes.oneOf(['left', 'right']),
    gridVertical: PropTypes.bool,
    gridVerticalStroke: PropTypes.string,
    gridVerticalStrokeWidth: PropTypes.number,
    gridVerticalStrokeDash: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: 'none',
      stroke: 'none',
      strokeWidth: '1',
      tickStroke: '#000',
      xAxisClassName: 'rd3-x-axis',
      xAxisLabel: '',
      xAxisLabelOffset: 10,
      xAxisOffset: 0,
      xOrient: 'bottom',
      yOrient: 'left'
    };
  },
  render: function render() {
    var props = this.props;

    var t = 'translate(0 ,' + (props.xAxisOffset + props.height) + ')';

    var tickArguments = void 0;
    if (typeof props.xAxisTickCount !== 'undefined') {
      tickArguments = [props.xAxisTickCount];
    }

    if (typeof props.xAxisTickInterval !== 'undefined') {
      // tickArguments = [d3.time[props.xAxisTickInterval.unit], props.xAxisTickInterval.interval];
    }

    return React.createElement('g', {
      className: props.xAxisClassName,
      transform: t
    }, React.createElement(AxisTicks, {
      tickValues: props.xAxisTickValues,
      tickFormatting: props.tickFormatting,
      tickArguments: tickArguments,
      tickStroke: props.tickStroke,
      tickTextStroke: props.tickTextStroke,
      innerTickSize: props.tickSize,
      scale: props.xScale,
      orient: props.xOrient,
      orient2nd: props.yOrient,
      height: props.height,
      width: props.width,
      horizontalChart: props.horizontalChart,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeWidth: props.gridVerticalStrokeWidth,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash,
      gridText: props.gridText,

      translateTickLabel_X_X: props.translateTickLabel_X_X,
      translateTickLabel_X_Y: props.translateTickLabel_X_Y,
      xIsDate: props.xIsDate,
      xTickFormat: props.xTickFormat

    }));
  }
});

},{"./AxisLine":"/home/robson/projetos/rd3/src/common/axes/AxisLine.jsx","./AxisTicks":"/home/robson/projetos/rd3/src/common/axes/AxisTicks.jsx","./Label":"/home/robson/projetos/rd3/src/common/axes/Label.jsx"}],"/home/robson/projetos/rd3/src/common/axes/YAxis.jsx":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var createReactClass = window.createReactClass;
var React = window.React;
var d3 = window.d3;
var AxisLine = require('./AxisLine');
var Label = require('./Label');

module.exports = createReactClass({

  displayName: 'YAxis',

  propTypes: {
    fill: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.string,
    tickStroke: PropTypes.string,
    tickTextStroke: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    horizontalChart: PropTypes.bool,
    yAxisClassName: PropTypes.string,
    yAxisLabel: PropTypes.string,
    yAxisOffset: PropTypes.number,
    yAxisTickValues: PropTypes.array,
    xOrient: PropTypes.oneOf(['top', 'bottom']),
    yOrient: PropTypes.oneOf(['left', 'right']),
    yScale: PropTypes.func.isRequired,
    gridVertical: PropTypes.bool,
    gridVerticalStroke: PropTypes.string,
    gridVerticalStrokeWidth: PropTypes.number,
    gridVerticalStrokeDash: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: 'none',
      stroke: '#000',
      strokeWidth: '1',
      tickStroke: '#000',
      yAxisClassName: 'rd3-y-axis',
      yAxisLabel: '',
      yAxisOffset: 0,
      xOrient: 'bottom',
      yOrient: 'left'
    };
  },
  render: function render() {
    var props = this.props;

    var t = void 0;
    if (props.yOrient === 'right') {
      t = 'translate(' + (props.yAxisOffset + props.width) + ', 0)';
    } else {
      t = 'translate(' + props.yAxisOffset + ', 0)';
    }

    var tickArguments = void 0;
    if (props.yAxisTickCount) {
      tickArguments = [props.yAxisTickCount];
    }

    if (props.yAxisTickInterval) {
      tickArguments = [d3.time[props.yAxisTickInterval.unit], props.yAxisTickInterval.interval];
    }

    return React.createElement('g', {
      className: props.yAxisClassName,
      transform: t
    }, React.createElement(AxisLine, _extends({
      orient: props.yOrient,
      outerTickSize: props.tickSize,
      scale: props.yScale,
      stroke: props.stroke
    }, props)), React.createElement(Label, {
      height: props.height,
      horizontalChart: props.horizontalChart,
      label: props.yAxisLabel,
      margins: props.margins,
      offset: props.yAxisLabelOffset,
      orient: props.yOrient
    }));
  }
});

},{"./AxisLine":"/home/robson/projetos/rd3/src/common/axes/AxisLine.jsx","./Label":"/home/robson/projetos/rd3/src/common/axes/Label.jsx"}],"/home/robson/projetos/rd3/src/common/axes/YGrid.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var createReactClass = window.createReactClass;
var React = window.React;
var d3 = window.d3;
var AxisTicks = require('./AxisTicks');
var AxisLine = require('./AxisLine');
var Label = require('./Label');

module.exports = createReactClass({

  displayName: 'YGrid',

  propTypes: {
    fill: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.string,
    tickStroke: PropTypes.string,
    tickTextStroke: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    horizontalChart: PropTypes.bool,
    yAxisClassName: PropTypes.string,
    yAxisLabel: PropTypes.string,
    yAxisOffset: PropTypes.number,
    yAxisTickValues: PropTypes.array,
    xOrient: PropTypes.oneOf(['top', 'bottom']),
    yOrient: PropTypes.oneOf(['left', 'right']),
    yScale: PropTypes.func.isRequired,
    gridVertical: PropTypes.bool,
    gridVerticalStroke: PropTypes.string,
    gridVerticalStrokeWidth: PropTypes.number,
    gridVerticalStrokeDash: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: 'none',
      stroke: '#000',
      strokeWidth: '1',
      tickStroke: '#000',
      yAxisClassName: 'rd3-y-axis',
      yAxisLabel: '',
      yAxisOffset: 0,
      xOrient: 'bottom',
      yOrient: 'left'
    };
  },
  render: function render() {
    var props = this.props;

    var t = void 0;
    if (props.yOrient === 'right') {
      t = 'translate(' + (props.yAxisOffset + props.width) + ', 0)';
    } else {
      t = 'translate(' + props.yAxisOffset + ', 0)';
    }

    var tickArguments = void 0;
    if (props.yAxisTickCount) {
      tickArguments = [props.yAxisTickCount];
    }

    if (props.yAxisTickInterval) {
      tickArguments = [d3.time[props.yAxisTickInterval.unit], props.yAxisTickInterval.interval];
    }

    return React.createElement('g', {
      className: props.yAxisClassName,
      transform: t
    }, React.createElement(AxisTicks, {
      innerTickSize: props.tickSize,
      orient: props.yOrient,
      orient2nd: props.xOrient,
      tickArguments: tickArguments,
      tickFormatting: props.tickFormatting,
      tickStroke: props.tickStroke,
      tickTextStroke: props.tickTextStroke,
      tickValues: props.yAxisTickValues,
      scale: props.yScale,
      height: props.height,
      width: props.width,
      horizontalChart: props.horizontalChart,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash,
      gridText: props.gridText,

      translateTickLabel_Y_X: props.translateTickLabel_Y_X,
      translateTickLabel_Y_Y: props.translateTickLabel_Y_Y

    }));
  }
});

},{"./AxisLine":"/home/robson/projetos/rd3/src/common/axes/AxisLine.jsx","./AxisTicks":"/home/robson/projetos/rd3/src/common/axes/AxisTicks.jsx","./Label":"/home/robson/projetos/rd3/src/common/axes/Label.jsx"}],"/home/robson/projetos/rd3/src/common/axes/index.js":[function(require,module,exports){
'use strict';

exports.XAxis = require('./XAxis');
exports.YAxis = require('./YAxis');
exports.XGrid = require('./XGrid');
exports.YGrid = require('./YGrid');

},{"./XAxis":"/home/robson/projetos/rd3/src/common/axes/XAxis.jsx","./XGrid":"/home/robson/projetos/rd3/src/common/axes/XGrid.jsx","./YAxis":"/home/robson/projetos/rd3/src/common/axes/YAxis.jsx","./YGrid":"/home/robson/projetos/rd3/src/common/axes/YGrid.jsx"}],"/home/robson/projetos/rd3/src/common/charts/BasicChart.jsx":[function(require,module,exports){
'use strict';

var _ChartContext = require('../../ChartContext');

var _ChartContext2 = _interopRequireDefault(_ChartContext);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'BasicChart',

  propTypes: {
    children: PropTypes.node,
    className: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    svgClassName: PropTypes.string,
    title: PropTypes.node,
    titleClassName: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-basic-chart',
      svgClassName: 'rd3-chart',
      titleClassName: 'rd3-chart-title',
      title: '',
      svgChart: { width: "100%", height: "100%" }
    };
  },
  _renderTitle: function _renderTitle() {
    var props = this.props;

    if (props.title !== '') {
      return React.createElement('h4', {
        className: props.titleClassName
      }, props.title);
    }
    return null;
  },
  _renderChart: function _renderChart() {
    var props = this.props;

    return React.createElement('svg', {
      className: props.svgClassName,
      height: props.height,
      viewBox: props.viewBox,
      width: props.width
    }, props.children);
  },
  render: function render() {
    var props = this.props;

    /* Context */
    this.contextType = _ChartContext2.default;
    var chartStyle = this.contextType._currentValue.chartStyle;

    return (
      // <div
      //   className={props.className}
      // >
      //   {this._renderTitle()}
      //   {this._renderChart()}
      // </div>


      React.createElement('svg', {
        className: props.svgClassName + ' ' + chartStyle,
        height: props.height,
        viewBox: props.viewBox,
        width: '100%'
      }, React.createElement('svg', { viewBox: props.viewBox, width: props.svgChart.width, height: props.svgChart.height }, this._renderTitle(), this._renderChart()))
    );
  }
});

},{"../../ChartContext":"/home/robson/projetos/rd3/src/ChartContext.js"}],"/home/robson/projetos/rd3/src/common/charts/Chart.jsx":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var LegendChart = require('./LegendChart');
var BasicChart = require('./BasicChart');

module.exports = createReactClass({

  displayName: 'Chart',

  propTypes: {
    legend: PropTypes.bool,
    svgClassName: PropTypes.string,
    titleClassName: PropTypes.string,
    shouldUpdate: PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      legend: false,
      svgClassName: 'rd3-chart',
      titleClassName: 'rd3-chart-title',
      shouldUpdate: true,
      background: null
    };
  },
  shouldComponentUpdate: function shouldComponentUpdate(nextProps) {
    return nextProps.shouldUpdate;
  },
  render: function render() {
    var props = this.props;

    if (props.legend) {
      return React.createElement(LegendChart, _extends({
        svgClassName: props.svgClassName,
        titleClassName: props.titleClassName
      }, this.props));
    }
    return React.createElement(BasicChart, _extends({
      svgClassName: props.svgClassName,
      titleClassName: props.titleClassName
    }, this.props));
  }
});

},{"./BasicChart":"/home/robson/projetos/rd3/src/common/charts/BasicChart.jsx","./LegendChart":"/home/robson/projetos/rd3/src/common/charts/LegendChart.jsx"}],"/home/robson/projetos/rd3/src/common/charts/LegendChart.jsx":[function(require,module,exports){
'use strict';

var _ChartContext = require('../../ChartContext');

var _ChartContext2 = _interopRequireDefault(_ChartContext);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var Legend = require('../Legend');
var d3 = window.d3;

module.exports = createReactClass({

  displayName: 'LegendChart',

  propTypes: {
    children: PropTypes.node,
    createClass: PropTypes.string,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    data: PropTypes.array,
    height: PropTypes.node,
    legend: PropTypes.bool,
    legendPosition: PropTypes.string,
    margins: PropTypes.object,
    sideOffset: PropTypes.number,
    svgClassName: PropTypes.string,
    title: PropTypes.node,
    titleClassName: PropTypes.string,
    viewBox: PropTypes.string,
    width: PropTypes.node
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-legend-chart',
      colors: d3.scaleOrdinal(d3.schemeCategory10),
      colorAccessor: function colorAccessor(d, idx) {
        return idx;
      },
      data: [],
      legend: false,
      legendPosition: 'right',
      sideOffset: 90,
      svgClassName: 'rd3-chart',
      titleClassName: 'rd3-chart-title',
      title: '',
      svgTitle: {
        title: 'Title',
        x: 50,
        y: 50,
        fontSize: '1.5em'
      },
      svgLegend: {
        position: {
          x: '85%',
          y: '20%'
        } },
      svgChart: {
        width: '95%'
      }
    };
  },
  _renderLegend: function _renderLegend() {
    var props = this.props;

    if (props.legend) {
      return React.createElement(Legend
      // colors={props.colors}
      // colorAccessor={props.colorAccessor}
      // data={props.data}
      // colorsDomain={props.colorsDomain}
      // legendPosition={props.legendPosition}
      // margins={props.margins}
      // width={props.sideOffset}
      // series={props.series}
      // legendStyle={props.legendStyle}
      // svgLegend={props.svgLegend}
      , this.props);
    }

    return null;
  },
  _renderTitle: function _renderTitle() {
    var props = this.props;

    var fontSize = props.svgTitle.fontSize;

    /* Context */
    this.contextType = _ChartContext2.default;
    var chartStyle = this.contextType._currentValue.chartStyle;

    if (props.title !== '') {
      return React.createElement('text', {
        className: 'rd3-svg-title ' + (chartStyle && chartStyle),
        textAnchor: 'middle',
        y: props.svgTitle.y,
        x: props.svgTitle.x
        // style={{'font-size':fontSize}}
      }, props.title);
    }
    return null;
  },
  _renderChart: function _renderChart() {
    var props = this.props;

    /* Context */
    this.contextType = _ChartContext2.default;
    var chartStyle = this.contextType._currentValue.chartStyle;

    return React.createElement('svg', {
      className: props.svgClassName + ' ' + chartStyle,
      height: '100%',
      viewBox: props.viewBox,
      width: '100%'
    }, React.createElement('svg', { viewBox: props.viewBox, width: props.svgChart.width, height: props.svgChart.height }, this._renderTitle(), props.children), React.createElement('svg', { x: props.svgLegend.position.x, y: props.svgLegend.position.y }, this._renderLegend()));
  },
  render: function render() {
    var props = this.props;
    /* Context */
    this.contextType = _ChartContext2.default;
    var chartStyle = this.contextType._currentValue.chartStyle;

    return React.createElement('div', {
      className: props.className + ' ' + chartStyle
      // className={props.className}

      , style: { display: 'grid', width: props.width, height: props.height, background: props.background }

    }, React.createElement('div', { style: { display: 'flex', width: props.width, height: props.height } }, this._renderChart()));
  }
});

},{"../../ChartContext":"/home/robson/projetos/rd3/src/ChartContext.js","../Legend":"/home/robson/projetos/rd3/src/common/Legend.jsx"}],"/home/robson/projetos/rd3/src/common/charts/index.js":[function(require,module,exports){
'use strict';

exports.Chart = require('./Chart');

},{"./Chart":"/home/robson/projetos/rd3/src/common/charts/Chart.jsx"}],"/home/robson/projetos/rd3/src/common/index.js":[function(require,module,exports){
'use strict';

exports.XAxis = require('./axes').XAxis;
exports.YAxis = require('./axes').YAxis;
exports.XGrid = require('./axes').XGrid;
exports.YGrid = require('./axes').YGrid;

exports.Chart = require('./charts').Chart;

exports.Legend = require('./Legend');
exports.Tooltip = require('./Tooltip');
exports.Voronoi = require('./Voronoi');

exports.BreadCrumb = require('./BreadCrumb');

},{"./BreadCrumb":"/home/robson/projetos/rd3/src/common/BreadCrumb.jsx","./Legend":"/home/robson/projetos/rd3/src/common/Legend.jsx","./Tooltip":"/home/robson/projetos/rd3/src/common/Tooltip.jsx","./Voronoi":"/home/robson/projetos/rd3/src/common/Voronoi.jsx","./axes":"/home/robson/projetos/rd3/src/common/axes/index.js","./charts":"/home/robson/projetos/rd3/src/common/charts/index.js"}],"/home/robson/projetos/rd3/src/index.js":[function(require,module,exports){
'use strict';

exports.BarChart = require('./barchart').BarChart;
exports.LineChart = require('./linechart').LineChart;
exports.PieChart = require('./piechart').PieChart;
exports.AreaChart = require('./areachart').AreaChart;
exports.Treemap = require('./treemap').Treemap;
exports.ScatterChart = require('./scatterchart').ScatterChart;
exports.CandlestickChart = require('./candlestick').CandlestickChart;

exports.SetStyle = require('./SetStyle');
exports.ChartContext = require('./ChartContext');
exports.ChartProvider = require('./ChartProvider');

},{"./ChartContext":"/home/robson/projetos/rd3/src/ChartContext.js","./ChartProvider":"/home/robson/projetos/rd3/src/ChartProvider.js","./SetStyle":"/home/robson/projetos/rd3/src/SetStyle.js","./areachart":"/home/robson/projetos/rd3/src/areachart/index.js","./barchart":"/home/robson/projetos/rd3/src/barchart/index.js","./candlestick":"/home/robson/projetos/rd3/src/candlestick/index.js","./linechart":"/home/robson/projetos/rd3/src/linechart/index.js","./piechart":"/home/robson/projetos/rd3/src/piechart/index.js","./scatterchart":"/home/robson/projetos/rd3/src/scatterchart/index.js","./treemap":"/home/robson/projetos/rd3/src/treemap/index.js"}],"/home/robson/projetos/rd3/src/linechart/DataSeries.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var VoronoiCircleContainer = require('./VoronoiCircleContainer');
var Line = require('./Line');
var voronoi = require('d3-voronoi');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    color: PropTypes.object,
    colorAccessor: PropTypes.func,
    data: PropTypes.array,
    interpolationType: PropTypes.string,
    xAccessor: PropTypes.func,
    yAccessor: PropTypes.func,
    hoverAnimation: PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      data: [],
      xAccessor: function xAccessor(d) {
        return d.x;
      },
      yAccessor: function yAccessor(d) {
        return d.y;
      },
      interpolationType: 'linear',
      hoverAnimation: false
    };
  },
  _isDate: function _isDate(d, accessor) {
    return Object.prototype.toString.call(accessor(d)) === '[object Date]';
  },
  render: function render() {
    var props = this.props;
    var xScale = props.xScale;
    var yScale = props.yScale;
    var xAccessor = props.xAccessor;
    var yAccessor = props.yAccessor;

    var interpolatePath = d3.line().x(function (d) {
      return props.xScale(xAccessor(d));
    }).y(function (d) {
      return props.yScale(yAccessor(d));
    }).curve(d3.curveMonotoneX);

    if (this._isDate(props.data[0].values[0], xAccessor)) {
      interpolatePath.x(function (d) {
        return props.xScale(props.xAccessor(d).getTime());
      });
    } else {
      interpolatePath.x(function (d) {
        return props.xScale(props.xAccessor(d));
      });
    }

    var lines = props.data.map(function (series, idx) {
      // debugger;
      return React.createElement(Line, {
        path: interpolatePath(series.values),
        stroke: props.color.colors(props.colorsAccessor(props.colorsDomain, idx)),
        strokeWidth: series.strokeWidth,
        strokeDashArray: series.strokeDashArray,
        seriesName: series.name,
        key: idx
      });
    });
    var voronoi = d3.voronoi().x(function (d) {
      return xScale(d.coord.x);
    }).y(function (d) {
      return yScale(d.coord.y);
    }).extent([[0, 0], [props.width, props.height]]);

    var cx = void 0;
    var cy = void 0;
    var circleFill = void 0;

    var regions = voronoi(props.value).polygons().map(function (polygon, idx) {
      // debugger;
      var point = polygon.data;
      delete polygon.data;
      var vnode = polygon;

      cx = props.xScale(point.coord.x);
      cy = props.yScale(point.coord.y);

      circleFill = props.color.colors(props.colorsAccessor(props.colorsDomain, point.seriesIndex));

      return React.createElement(VoronoiCircleContainer, {
        key: idx,
        voronoiStroke: props.voronoiStroke,
        circleFill: circleFill,
        vnode: vnode,
        hoverAnimation: props.hoverAnimation,
        cx: cx, cy: cy,
        circleRadius: props.circleRadius,
        onMouseOver: props.onMouseOver,
        dataPoint: {
          xValue: point.coord.x,
          yValue: point.coord.y,
          seriesName: point.series.name
        }
      });
    });

    return React.createElement('g', null, React.createElement('g', null, regions), React.createElement('g', null, lines));
  }
});

},{"./Line":"/home/robson/projetos/rd3/src/linechart/Line.jsx","./VoronoiCircleContainer":"/home/robson/projetos/rd3/src/linechart/VoronoiCircleContainer.jsx","d3-voronoi":"/home/robson/projetos/rd3/node_modules/d3-voronoi/dist/d3-voronoi.js"}],"/home/robson/projetos/rd3/src/linechart/Line.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'Line',

  propTypes: {
    fill: PropTypes.string,
    path: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number,
    strokeDashArray: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      stroke: '#3182bd',
      fill: 'none',
      strokeWidth: 1,
      className: 'rd3-linechart-path'
    };
  },
  render: function render() {
    var props = this.props;
    return React.createElement('path', {
      d: props.path,
      stroke: props.stroke,
      strokeWidth: props.strokeWidth,
      strokeDasharray: props.strokeDashArray,
      fill: props.fill,
      className: props.className
    });
  }
});

},{}],"/home/robson/projetos/rd3/src/linechart/LineChart.jsx":[function(require,module,exports){
'use strict';

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var PropTypes = window.PropTypes;
var React = window.React;
var d3 = window.d3;
var createReactClass = window.createReactClass;
var utils = require('../utils');

var _require = require('../common'),
    Chart = _require.Chart,
    XAxis = _require.XAxis,
    YAxis = _require.YAxis,
    XGrid = _require.XGrid,
    YGrid = _require.YGrid,
    Tooltip = _require.Tooltip;

var DataSeries = require('./DataSeries');

var _require2 = require('../mixins'),
    CartesianChartPropsMixin = _require2.CartesianChartPropsMixin,
    DefaultAccessorsMixin = _require2.DefaultAccessorsMixin,
    ViewBoxMixin = _require2.ViewBoxMixin,
    TooltipMixin = _require2.TooltipMixin;

module.exports = createReactClass({

  displayName: 'LineChart',

  propTypes: {
    circleRadius: PropTypes.number,
    hoverAnimation: PropTypes.bool,
    margins: PropTypes.object,
    data: PropTypes.array.isRequired
  },

  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin, TooltipMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      circleRadius: 4,
      className: 'rd3-linechart',
      hoverAnimation: true,
      margins: { top: 70, right: 20, bottom: 60, left: 60 },
      xAxisClassName: 'rd3-linechart-xaxis',
      yAxisClassName: 'rd3-linechart-yaxis',
      data: [],
      color: {
        accessor: 'Sequential',
        colors: d3.scaleSequential(d3.schemeTableau10)
      }
    };
  },

  _calculateScales: utils.calculateScales,
  _rd3FormatInputData: utils.rd3FormatInputData,

  render: function render() {
    var props = this.props;

    if (this.props.data && this.props.data.length < 1) {
      return null;
    }

    var data = void 0;
    var series = void 0;

    var _rd3FormatInputData = this._rd3FormatInputData('linechart', props.inputDataLayout, props.data, props.xIsDate, props.strokeWidth);

    var _rd3FormatInputData2 = _slicedToArray(_rd3FormatInputData, 2);

    data = _rd3FormatInputData2[0];
    series = _rd3FormatInputData2[1];

    var _getDimensions = this.getDimensions(),
        innerWidth = _getDimensions.innerWidth,
        innerHeight = _getDimensions.innerHeight,
        trans = _getDimensions.trans,
        svgMargins = _getDimensions.svgMargins;

    var yOrient = this.getYOrient();
    var domain = props.domain || {};

    if (!Array.isArray(data)) {
      data = [data];
    }

    // Returns an object of flattened allValues, xValues, and yValues
    var flattenedData = utils.flattenData(data, props.xAccessor, props.yAccessor);

    var allValues = flattenedData.allValues;
    var xValues = flattenedData.xValues;
    var yValues = flattenedData.yValues;
    var scales = this._calculateScales(innerWidth, innerHeight, xValues, yValues, domain.x, domain.y);

    var colorsDomain = void 0;
    var colorsAccessor = void 0;
    var origArray = Array.from(series.keys());

    if (this.props.color.accessor === 'Sequential') {
      colorsDomain = origArray.map(function (x) {
        return x / series.length;
      });
      colorsAccessor = this.props.colorAccessorSequential;
    } else {
      colorsDomain = series;
      colorsAccessor = this.props.colorAccessorOrdinal;
    }

    return React.createElement('span', { onMouseLeave: this.onMouseLeave }, React.createElement(Chart, {
      viewBox: this.getViewBox(),
      legend: props.legend,
      sideOffset: props.sideOffset,
      data: data,
      margins: props.margins,
      color: this.props.color,
      colorsDomain: colorsDomain,
      colorsAccessor: colorsAccessor,
      width: props.width,
      height: props.height,
      title: props.title,
      shouldUpdate: !this.state.changeState,
      series: series,
      svgLegend: props.svgLegend,
      svgChart: props.svgChart,
      legendStyle: props.legendStyle,
      background: props.background,
      svgTitle: props.svgTitle
    }, React.createElement('g', { transform: trans, className: props.className }, React.createElement(XGrid, {
      xAxisClassName: props.xAxisClassName,
      xAxisTickValues: props.xAxisTickValues,
      xAxisTickCount: props.xAxisTickCount,
      xAxisTickInterval: props.xAxisTickInterval,
      xAxisOffset: props.xAxisOffset,
      xScale: scales.xScale,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      xTickFormat: props.xTickFormat,
      data: data,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      stroke: props.axesColor,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash,

      gridText: props.gridText,
      translateTickLabel_Y_X: props.translateTickLabel_Y_X,
      translateTickLabel_Y_Y: props.translateTickLabel_Y_Y,
      translateTickLabel_X_X: props.translateTickLabel_X_X,
      translateTickLabel_X_Y: props.translateTickLabel_X_Y,
      xIsDate: props.xIsDate
    }), React.createElement(YGrid, {
      yAxisClassName: props.yAxisClassName,
      yScale: scales.yScale,
      yAxisTickValues: props.yAxisTickValues,
      yAxisTickCount: props.yAxisTickCount,
      yAxisOffset: props.yAxisOffset,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      stroke: props.axesColor,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash,

      gridText: props.gridText,
      translateTickLabel_Y_X: props.translateTickLabel_Y_X,
      translateTickLabel_Y_Y: props.translateTickLabel_Y_Y,
      translateTickLabel_X_X: props.translateTickLabel_X_X,
      translateTickLabel_X_Y: props.translateTickLabel_X_Y
    }), React.createElement(DataSeries, {
      xScale: scales.xScale,
      yScale: scales.yScale,
      xAccessor: props.xAccessor,
      yAccessor: props.yAccessor,
      hoverAnimation: props.hoverAnimation,
      circleRadius: props.circleRadius,
      data: data,
      value: allValues,
      interpolationType: props.interpolationType
      // colors={props.colors}
      // colorAccessor={props.colorAccessorOrdinal}
      , color: props.color,
      colorsDomain: colorsDomain,
      colorsAccessor: colorsAccessor,
      width: innerWidth,
      height: innerHeight,
      onMouseOver: this.onMouseOver,
      voronoiStroke: props.voronoiStroke
    }), React.createElement(XAxis, {
      xAxisClassName: props.xAxisClassName,
      xAxisTickValues: props.xAxisTickValues,
      xAxisTickCount: props.xAxisTickCount,
      xAxisTickInterval: props.xAxisTickInterval,
      xAxisOffset: props.xAxisOffset,
      xScale: scales.xScale,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      data: data,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      stroke: props.axesColor,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash
    }), React.createElement(YAxis, {
      yAxisClassName: props.yAxisClassName,
      yScale: scales.yScale,
      yAxisTickValues: props.yAxisTickValues,
      yAxisTickCount: props.yAxisTickCount,
      yAxisOffset: props.yAxisOffset,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      stroke: props.axesColor,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
    }))), props.showTooltip ? React.createElement(Tooltip, this.state.tooltip) : null);
  }
});

},{"../common":"/home/robson/projetos/rd3/src/common/index.js","../mixins":"/home/robson/projetos/rd3/src/mixins/index.js","../utils":"/home/robson/projetos/rd3/src/utils/index.js","./DataSeries":"/home/robson/projetos/rd3/src/linechart/DataSeries.jsx"}],"/home/robson/projetos/rd3/src/linechart/VoronoiCircle.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'VoronoiCircle',

  // TODO: Check prop types
  propTypes: {
    handleMouseOver: PropTypes.any,
    handleMouseLeave: PropTypes.any,
    voronoiPath: PropTypes.any,
    voronoiStroke: PropTypes.string,
    cx: PropTypes.any,
    cy: PropTypes.any,
    circleRadius: PropTypes.any,
    circleFill: PropTypes.any
  },
  getDefaultProps: function getDefaultProps() {
    return {
      circleRadius: 3,
      circleFill: '#1f77b4',
      voronoiStroke: ''
    };
  },
  render: function render() {
    return React.createElement('g', null, React.createElement('path', {
      onMouseOver: this.props.handleMouseOver,
      onMouseLeave: this.props.handleMouseLeave,
      fill: 'transparent',
      stroke: this.props.voronoiStroke,
      d: this.props.voronoiPath
    }), React.createElement('circle', {
      onMouseOver: this.props.handleMouseOver,
      onMouseLeave: this.props.handleMouseLeave,
      cx: this.props.cx,
      cy: this.props.cy,
      r: this.props.circleRadius,
      fill: this.props.circleFill,
      className: 'rd3-linechart-circle'
    }));
  }
});

},{}],"/home/robson/projetos/rd3/src/linechart/VoronoiCircleContainer.jsx":[function(require,module,exports){
'use strict';

var _reactDom = window.ReactDOM;

var ReactDOM = _interopRequireWildcard(_reactDom);

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }newObj.default = obj;return newObj;
  }
}

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;
var shade = require('../utils').shade;
var VoronoiCircle = require('./VoronoiCircle');

module.exports = createReactClass({

  displayName: 'VornoiCircleContainer',

  propTypes: {
    circleRadius: PropTypes.any,
    circleFill: PropTypes.any,
    onMouseOver: PropTypes.any,
    dataPoint: PropTypes.any
  },

  getDefaultProps: function getDefaultProps() {
    return {
      circleRadius: 3,
      circleFill: '#1f77b4',
      hoverAnimation: true
    };
  },
  getInitialState: function getInitialState() {
    return {
      circleRadius: this.props.circleRadius,
      circleFill: this.props.circleFill,
      circleFillCtl: this.props.fill
    };
  },

  statics: {
    getDerivedStateFromProps: function getDerivedStateFromProps(props, current_state) {
      if (current_state.circleFillCtl !== props.fill) {
        return {
          circleFillCtl: props.fill,
          circleFill: props.fill
        };
      }
      return null;
    }
  },

  _animateCircle: function _animateCircle() {
    var rect = ReactDOM.findDOMNode(this).getElementsByTagName('circle')[0].getBoundingClientRect();
    this.props.onMouseOver.call(this, rect.right, rect.top, this.props.dataPoint);
    this.setState({
      circleRadius: this.props.circleRadius * (5 / 4),
      circleFill: shade(this.props.circleFill, 0.2)
    });
  },
  _restoreCircle: function _restoreCircle() {
    this.setState({
      circleRadius: this.props.circleRadius,
      circleFill: this.props.circleFill
    });
  },
  _drawPath: function _drawPath(d) {
    if (d === undefined) {
      return 'M Z';
    }
    return 'M' + d.join(',') + 'Z';
  },
  render: function render() {
    var props = this.props;

    // animation controller
    var handleMouseOver = void 0;
    var handleMouseLeave = void 0;
    if (props.hoverAnimation) {
      handleMouseOver = this._animateCircle;
      handleMouseLeave = this._restoreCircle;
    } else {
      handleMouseOver = handleMouseLeave = null;
    }

    return React.createElement('g', null, React.createElement(VoronoiCircle, {
      handleMouseOver: handleMouseOver,
      handleMouseLeave: handleMouseLeave,
      voronoiPath: this._drawPath(props.vnode),
      cx: props.cx,
      cy: props.cy,
      circleRadius: this.state.circleRadius
      /* state.circleFill changes on MouseOver/Leave.
      state.props, changes on styling property change  */
      , circleFill: this.props.circleFill,
      voronoiStroke: props.voronoiStroke

    }));
  }
});

},{"../utils":"/home/robson/projetos/rd3/src/utils/index.js","./VoronoiCircle":"/home/robson/projetos/rd3/src/linechart/VoronoiCircle.jsx"}],"/home/robson/projetos/rd3/src/linechart/index.js":[function(require,module,exports){
'use strict';

exports.LineChart = require('./LineChart');

},{"./LineChart":"/home/robson/projetos/rd3/src/linechart/LineChart.jsx"}],"/home/robson/projetos/rd3/src/mixins/CartesianChartPropsMixin.js":[function(require,module,exports){
'use strict';

var d3 = window.d3;
var PropTypes = window.PropTypes;

module.exports = {

  propTypes: {
    axesColor: PropTypes.string,
    colors: PropTypes.func,
    colorAccessorSequential: PropTypes.func,
    colorAccessorOrdinal: PropTypes.func,
    data: PropTypes.array.isRequired,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    horizontal: PropTypes.bool,
    legend: PropTypes.bool,
    legendOffset: PropTypes.number,
    title: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    xAccessor: PropTypes.func,
    xAxisFormatter: PropTypes.func,
    xAxisLabel: PropTypes.string,
    xAxisLabelOffset: PropTypes.number,
    xAxisTickCount: PropTypes.number,
    xAxisTickInterval: PropTypes.object,
    xAxisTickValues: PropTypes.array,
    xAxisTickStroke: PropTypes.string,
    xAxisTickTextStroke: PropTypes.string,
    xAxisOffset: PropTypes.number,
    xOrient: PropTypes.oneOf(['top', 'bottom']),
    xScale: PropTypes.func,
    yAccessor: PropTypes.func,
    yAxisFormatter: PropTypes.func,
    yAxisLabel: PropTypes.string,
    yAxisLabelOffset: PropTypes.number,
    yAxisTickCount: PropTypes.number,
    yAxisTickInterval: PropTypes.object,
    yAxisTickValues: PropTypes.array,
    yAxisTickStroke: PropTypes.string,
    yAxisTickTextStroke: PropTypes.string,
    yAxisOffset: PropTypes.number,
    yOrient: PropTypes.oneOf(['default', 'left', 'right']),
    yScale: PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      axesColor: '#000',
      colorAccessorSequential: function colorAccessorSequential(d, idx) {
        return d[idx];
      },
      colorAccessorOrdinal: function colorAccessorOrdinal(d, idx) {
        return idx;
      },
      height: 200,
      horizontal: false,
      legend: false,
      legendOffset: 120,
      title: '',
      width: 400,
      // xAxisFormatter: no predefined value right now
      xAxisLabel: '',
      xAxisLabelOffset: 38,
      xAxisOffset: 0,
      // xAxisTickCount: no predefined value right now
      // xAxisTickInterval: no predefined value right now
      // xAxisTickValues: no predefined value right now
      xAxisTickStroke: '#000',
      xAxisTickTextStroke: '#000',
      xOrient: 'bottom',
      // xScale: no predefined value right now
      // yAxisFormatter: no predefined value right now
      yAxisLabel: '',
      yAxisLabelOffset: 35,
      yAxisOffset: 0,
      // yAxisTickCount: no predefined value right now
      // yAxisTickInterval: no predefined value right now
      // yAxisTickValues: no predefined value right now
      yAxisTickStroke: '#000',
      yAxisTickTextStroke: '#000',
      yOrient: 'default'
      // yScale: no predefined value right now
    };
  },
  getYOrient: function getYOrient() {
    var yOrient = this.props.yOrient;

    if (yOrient === 'default') {
      return this.props.horizontal ? 'right' : 'left';
    }

    return yOrient;
  }
};

},{}],"/home/robson/projetos/rd3/src/mixins/DefaultAccessorsMixin.js":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;

module.exports = {
  propTypes: {
    xAccessor: PropTypes.func,
    yAccessor: PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      xAccessorBar: function xAccessorBar(d) {
        return d.data.x;
      },
      yAccessorBar: function yAccessorBar(d) {
        return d[1];
      },

      xAccessor: function xAccessor(d) {
        return d.x;
      },
      yAccessor: function yAccessor(d) {
        return d.y;
      }
    };
  }
};

},{}],"/home/robson/projetos/rd3/src/mixins/TooltipMixin.js":[function(require,module,exports){
'use strict';

var utils = require('../utils');

var PropTypes = window.PropTypes;

module.exports = {

  propTypes: {
    showTooltip: PropTypes.bool,
    tooltipFormat: PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      showTooltip: true,
      /* Sum */
      tooltipFormat: function tooltipFormat(d, chart) {
        return chart === 'barchart' ? String(d.seriesName) + ':\n' + String(utils.nFormatter(d.height, 2)) : String(d.seriesName) + ':\n' + String(utils.nFormatter(d.yValue, 2));
      }
    };
  },
  getInitialState: function getInitialState() {
    return {
      tooltip: {
        x: 0,
        y: 0,
        child: '',
        show: false
      },
      changeState: false
    };
  },
  UNSAFE_componentWillReceiveProps: function UNSAFE_componentWillReceiveProps() {
    this.setState({
      changeState: false
    });
  },
  onMouseOver: function onMouseOver(x, y, dataPoint) {
    if (!this.props.showTooltip) {
      return;
    }
    this.setState({
      tooltip: {
        x: x,
        y: y,
        child: this.props.tooltipFormat.call(this, dataPoint, this.props.chart),
        show: true
      },
      changeState: true
    });
  },
  onMouseLeave: function onMouseLeave() {
    if (!this.props.showTooltip) {
      return;
    }
    this.setState({
      tooltip: {
        x: 0,
        y: 0,
        child: '',
        show: false
      },
      changeState: true
    });
  }
};

},{"../utils":"/home/robson/projetos/rd3/src/utils/index.js"}],"/home/robson/projetos/rd3/src/mixins/ViewBoxMixin.js":[function(require,module,exports){

'use strict';

var PropTypes = window.PropTypes;

module.exports = {

  propTypes: {
    viewBox: PropTypes.string,
    viewBoxObject: PropTypes.object
  },

  getViewBox: function getViewBox() {
    if (this.props.viewBoxObject) {
      var v = this.props.viewBoxObject;
      return [v.x, v.y, v.width, v.height].join(' ');
    } else if (this.props.viewBox) {
      return this.props.viewBox;
    }
    return null;
  },
  getDimensions: function getDimensions() {
    var props = this.props;
    var horizontal = props.horizontal,
        margins = props.margins,
        viewBoxObject = props.viewBoxObject,
        xOrient = props.xOrient;

    var yOrient = this.getYOrient();

    var width = void 0;
    var height = void 0;
    if (viewBoxObject) {
      width = viewBoxObject.width;
      height = viewBoxObject.height;
    } else {
      width = props.width;
      height = props.height;
    }

    var svgWidth = void 0;
    var svgHeight = void 0;
    var svgMargins = void 0;
    var trans = void 0;
    if (horizontal) {
      var center = width / 2;
      trans = 'rotate(90 ' + center + ' ' + center + ') ';
      svgWidth = height;
      svgHeight = width;
      svgMargins = {
        left: margins.top,
        top: margins.right,
        right: margins.bottom,
        bottom: margins.left
      };
    } else {
      trans = '';
      svgWidth = width;
      svgHeight = height;
      svgMargins = margins;
    }

    var xAxisOffset = Math.abs(props.xAxisOffset || 0);
    var yAxisOffset = Math.abs(props.yAxisOffset || 0);

    var xOffset = svgMargins.left + (yOrient === 'left' ? yAxisOffset : 0);
    var yOffset = svgMargins.top + (xOrient === 'top' ? xAxisOffset : 0);
    trans += 'translate(' + xOffset + ', ' + yOffset + ')';

    return {
      innerHeight: svgHeight - svgMargins.top - svgMargins.bottom - xAxisOffset,
      innerWidth: svgWidth - svgMargins.left - svgMargins.right - yAxisOffset,
      trans: trans,
      svgMargins: svgMargins
    };
  }
};

},{}],"/home/robson/projetos/rd3/src/mixins/index.js":[function(require,module,exports){
'use strict';

exports.CartesianChartPropsMixin = require('./CartesianChartPropsMixin');
exports.DefaultAccessorsMixin = require('./DefaultAccessorsMixin');
exports.ViewBoxMixin = require('./ViewBoxMixin');
exports.TooltipMixin = require('./TooltipMixin');

},{"./CartesianChartPropsMixin":"/home/robson/projetos/rd3/src/mixins/CartesianChartPropsMixin.js","./DefaultAccessorsMixin":"/home/robson/projetos/rd3/src/mixins/DefaultAccessorsMixin.js","./TooltipMixin":"/home/robson/projetos/rd3/src/mixins/TooltipMixin.js","./ViewBoxMixin":"/home/robson/projetos/rd3/src/mixins/ViewBoxMixin.js"}],"/home/robson/projetos/rd3/src/piechart/Arc.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;

module.exports = createReactClass({

  displayName: 'Arc',

  propTypes: {
    fill: PropTypes.string,
    d: PropTypes.string,
    startAngle: PropTypes.number,
    endAngle: PropTypes.number,
    innerRadius: PropTypes.number,
    outerRadius: PropTypes.number,
    labelTextFill: PropTypes.string,
    valueTextFill: PropTypes.string,
    sectorBorderColor: PropTypes.string,
    showInnerLabels: PropTypes.bool,
    showOuterLabels: PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      labelTextFill: 'black',
      valueTextFill: 'white',
      showInnerLabels: true,
      showOuterLabels: true
    };
  },
  renderInnerLabel: function renderInnerLabel(props, arc) {
    // make value text can be formatted
    var formattedValue = props.valueTextFormatter(props.value);
    return React.createElement('text', {
      className: 'rd3-piechart-value',
      transform: 'translate(' + arc.centroid() + ')',
      dy: '.35em',
      style: {
        shapeRendering: 'crispEdges',
        textAnchor: 'middle',
        fill: props.valueTextFill
      }
    }, formattedValue);
  },
  renderOuterLabel: function renderOuterLabel(props) {
    var rotate = 'rotate(' + (props.startAngle + props.endAngle) / 2 * (180 / Math.PI) + ')';
    var radius = props.outerRadius;
    var dist = radius + 35;
    var angle = (props.startAngle + props.endAngle) / 2;
    var x = dist * (1.2 * Math.sin(angle));
    var y = -dist * Math.cos(angle);
    var t = 'translate(' + x + ',' + y + ')';

    return React.createElement('g', null, React.createElement('line', {
      x1: '0',
      x2: '0',
      y1: -radius - 2,
      y2: -radius - 26,
      stroke: props.labelTextFill,
      transform: rotate,
      style: {
        fill: props.labelTextFill,
        strokeWidth: 2
      }
    }), React.createElement('text', {
      className: 'rd3-piechart-label',
      transform: t,
      dy: '.35em',
      style: {
        textAnchor: 'middle',
        fill: props.labelTextFill,
        shapeRendering: 'crispEdges'
      }
    }, props.label));
  },
  render: function render() {
    var props = this.props;

    var arc = d3.arc().innerRadius(props.innerRadius).outerRadius(props.outerRadius).startAngle(props.startAngle).endAngle(props.endAngle);

    return React.createElement('g', { className: 'rd3-piechart-arc' }, React.createElement('path', {
      d: arc(),
      fill: props.fill,
      stroke: props.sectorBorderColor,
      onMouseOver: props.handleMouseOver,
      onMouseLeave: props.handleMouseLeave
    }), props.showOuterLabels ? this.renderOuterLabel(props, arc) : null, props.showInnerLabels ? this.renderInnerLabel(props, arc) : null);
  }
});

},{}],"/home/robson/projetos/rd3/src/piechart/ArcContainer.jsx":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _reactDom = window.ReactDOM;

var ReactDOM = _interopRequireWildcard(_reactDom);

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }newObj.default = obj;return newObj;
  }
}

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;
var shade = require('../utils').shade;
var Arc = require('./Arc');

module.exports = createReactClass({

  displayName: 'ArcContainer',

  propTypes: {
    fill: PropTypes.string,
    onMouseOver: PropTypes.func,
    onMouseLeave: PropTypes.func,
    dataPoint: PropTypes.any // TODO prop type?
  },

  getInitialState: function getInitialState() {
    return {
      // fill is named as fill instead of initialFill to avoid
      // confusion when passing down props from top parent
      fill: this.props.fill
    };
  },
  _animateArc: function _animateArc() {
    var rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    this.props.onMouseOver.call(this, rect.right, rect.top, this.props.dataPoint);
    this.setState({
      fill: shade(this.props.fill, 0.2)
    });
  },
  _restoreArc: function _restoreArc() {
    this.props.onMouseLeave.call(this);
    this.setState({
      fill: this.props.fill
    });
  },
  render: function render() {
    var props = this.props;

    return React.createElement(Arc, _extends({}, this.props, {
      fill: this.state.fill,
      handleMouseOver: props.hoverAnimation ? this._animateArc : null,
      handleMouseLeave: props.hoverAnimation ? this._restoreArc : null
    }));
  }
});

},{"../utils":"/home/robson/projetos/rd3/src/utils/index.js","./Arc":"/home/robson/projetos/rd3/src/piechart/Arc.jsx"}],"/home/robson/projetos/rd3/src/piechart/DataSeries.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var ArcContainer = require('./ArcContainer');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    data: PropTypes.array,
    values: PropTypes.array,
    labels: PropTypes.array,
    transform: PropTypes.string,
    innerRadius: PropTypes.number,
    radius: PropTypes.number,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    showInnerLabels: PropTypes.bool,
    showOuterLabels: PropTypes.bool,
    sectorBorderColor: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      data: [],
      innerRadius: 0,
      colors: d3.scaleOrdinal(d3.schemeCategory10),
      colorAccessor: function colorAccessor(d, idx) {
        return idx;
      }
    };
  },
  render: function render() {
    var props = this.props;

    var pie = d3.pie().sort(null);

    var arcData = pie(props.values);

    var arcs = arcData.map(function (arc, idx) {
      return React.createElement(ArcContainer, {
        key: idx,
        startAngle: arc.startAngle,
        endAngle: arc.endAngle,
        outerRadius: props.radius,
        innerRadius: props.innerRadius,
        labelTextFill: props.labelTextFill,
        valueTextFill: props.valueTextFill,
        valueTextFormatter: props.valueTextFormatter,
        fill: props.colors(props.colorAccessor(props.data[idx], idx)),
        value: props.values[idx],
        label: props.labels[idx],
        width: props.width,
        showInnerLabels: props.showInnerLabels,
        showOuterLabels: props.showOuterLabels,
        sectorBorderColor: props.sectorBorderColor,
        hoverAnimation: props.hoverAnimation,
        onMouseOver: props.onMouseOver,
        onMouseLeave: props.onMouseLeave,
        dataPoint: { yValue: props.values[idx], seriesName: props.labels[idx] }
      });
    });
    return React.createElement('g', { className: 'rd3-piechart-pie', transform: props.transform }, arcs);
  }
});

},{"./ArcContainer":"/home/robson/projetos/rd3/src/piechart/ArcContainer.jsx"}],"/home/robson/projetos/rd3/src/piechart/PieChart.jsx":[function(require,module,exports){
'use strict';

var d3 = window.d3;
var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var DataSeries = require('./DataSeries');

var _require = require('../common'),
    Chart = _require.Chart,
    Tooltip = _require.Tooltip;

var TooltipMixin = require('../mixins').TooltipMixin;

module.exports = createReactClass({

  displayName: 'PieChart',

  propTypes: {
    data: PropTypes.array,
    radius: PropTypes.number,
    cx: PropTypes.number,
    cy: PropTypes.number,
    labelTextFill: PropTypes.string,
    valueTextFill: PropTypes.string,
    valueTextFormatter: PropTypes.func,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    title: PropTypes.string,
    showInnerLabels: PropTypes.bool,
    showOuterLabels: PropTypes.bool,
    sectorBorderColor: PropTypes.string,
    hoverAnimation: PropTypes.bool
  },

  mixins: [TooltipMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      data: [],
      title: '',
      colors: d3.scaleOrdinal(d3.schemeCategory10),
      colorAccessor: function colorAccessor(d, idx) {
        return idx;
      },
      valueTextFormatter: function valueTextFormatter(val) {
        return val + '%';
      },
      hoverAnimation: true
    };
  },
  render: function render() {
    var props = this.props;

    if (props.data && props.data.length < 1) {
      return null;
    }
    var transform = 'translate(' + (props.cx || props.width / 2) + ',' + (props.cy || props.height / 2) + ')';

    var values = props.data.map(function (item) {
      return item.value;
    });
    var labels = props.data.map(function (item) {
      return item.label;
    });

    return React.createElement('span', null, React.createElement(Chart, {
      width: props.width,
      height: props.height,
      title: props.title,
      shouldUpdate: !this.state.changeState
    }, React.createElement('g', { className: 'rd3-piechart' }, React.createElement(DataSeries, {
      labelTextFill: props.labelTextFill,
      valueTextFill: props.valueTextFill,
      valueTextFormatter: props.valueTextFormatter,
      data: props.data,
      values: values,
      labels: labels,
      colors: props.colors,
      colorAccessor: props.colorAccessor,
      transform: transform,
      width: props.width,
      height: props.height,
      radius: props.radius,
      innerRadius: props.innerRadius,
      showInnerLabels: props.showInnerLabels,
      showOuterLabels: props.showOuterLabels,
      sectorBorderColor: props.sectorBorderColor,
      hoverAnimation: props.hoverAnimation,
      onMouseOver: this.onMouseOver,
      onMouseLeave: this.onMouseLeave
    }))), props.showTooltip ? React.createElement(Tooltip, this.state.tooltip) : null);
  }
});

},{"../common":"/home/robson/projetos/rd3/src/common/index.js","../mixins":"/home/robson/projetos/rd3/src/mixins/index.js","./DataSeries":"/home/robson/projetos/rd3/src/piechart/DataSeries.jsx"}],"/home/robson/projetos/rd3/src/piechart/index.js":[function(require,module,exports){
'use strict';

exports.PieChart = require('./PieChart');

},{"./PieChart":"/home/robson/projetos/rd3/src/piechart/PieChart.jsx"}],"/home/robson/projetos/rd3/src/scatterchart/DataSeries.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var VoronoiCircleContainer = require('./VoronoiCircleContainer');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    circleRadius: PropTypes.number.isRequired,
    className: PropTypes.string,
    colors: PropTypes.func.isRequired,
    colorAccessor: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    xAccessor: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yAccessor: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-scatterchart-dataseries'
    };
  },
  render: function render() {
    var props = this.props;
    var xScale = props.xScale;
    var yScale = props.yScale;
    var xAccessor = props.xAccessor;
    var yAccessor = props.yAccessor;

    var voronoi = d3.voronoi().x(function (d) {
      return xScale(d.coord.x);
    }).y(function (d) {
      return yScale(d.coord.y);
    }).extent([[0, 0], [props.width, props.height]]);

    var regions = voronoi(props.data).polygons().map(function (polygon, idx) {
      var point = polygon.data;
      delete polygon.data;

      var vnode = polygon;
      var coord = point.coord;

      var x = xAccessor(coord);
      var y = yAccessor(coord);

      // The circle coordinates
      var cx = void 0;
      var cy = void 0;

      if (Object.prototype.toString.call(x) === '[object Date]') {
        cx = xScale(x.getTime());
      } else {
        cx = xScale(x);
      }

      if (Object.prototype.toString.call(y) === '[object Date]') {
        cy = yScale(y.getTime());
      } else {
        cy = yScale(y);
      }

      return React.createElement(VoronoiCircleContainer, {
        key: idx,
        circleFill: props.colors(props.colorAccessor(point.d, point.seriesIndex)),
        circleRadius: props.circleRadius,
        cx: cx,
        cy: cy,
        vnode: vnode,
        onMouseOver: props.onMouseOver,
        dataPoint: { xValue: x, yValue: y, seriesName: point.series.name }
      });
    });

    return React.createElement('g', {
      className: props.className
    }, regions);
  }
});

},{"./VoronoiCircleContainer":"/home/robson/projetos/rd3/src/scatterchart/VoronoiCircleContainer.jsx"}],"/home/robson/projetos/rd3/src/scatterchart/ScatterChart.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var d3 = window.d3;
var createReactClass = window.createReactClass;

var _require = require('../common'),
    Chart = _require.Chart,
    XAxis = _require.XAxis,
    YAxis = _require.YAxis,
    XGrid = _require.XGrid,
    YGrid = _require.YGrid,
    Tooltip = _require.Tooltip;

var DataSeries = require('./DataSeries');
var utils = require('../utils');

var _require2 = require('../mixins'),
    CartesianChartPropsMixin = _require2.CartesianChartPropsMixin,
    DefaultAccessorsMixin = _require2.DefaultAccessorsMixin,
    ViewBoxMixin = _require2.ViewBoxMixin,
    TooltipMixin = _require2.TooltipMixin;

module.exports = createReactClass({

  displayName: 'ScatterChart',

  propTypes: {
    circleRadius: PropTypes.number,
    className: PropTypes.string,
    hoverAnimation: PropTypes.bool,
    margins: PropTypes.object,
    xAxisClassName: PropTypes.string,
    yAxisClassName: PropTypes.string
  },

  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin, TooltipMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      colors: d3.scaleOrdinal(d3.schemeBlues[6].reverse()),
      circleRadius: 3,
      className: 'rd3-scatterchart',
      hoverAnimation: true,
      margins: { top: 10, right: 20, bottom: 50, left: 45 },
      xAxisClassName: 'rd3-scatterchart-xaxis',
      yAxisClassName: 'rd3-scatterchart-yaxis'
    };
  },

  _calculateScales: utils.calculateScales,

  render: function render() {
    var props = this.props;
    var data = props.data;

    if (!data || data.length < 1) {
      return null;
    }

    var _getDimensions = this.getDimensions(),
        innerWidth = _getDimensions.innerWidth,
        innerHeight = _getDimensions.innerHeight,
        trans = _getDimensions.trans,
        svgMargins = _getDimensions.svgMargins;

    var yOrient = this.getYOrient();
    var domain = props.domain || {};

    // Returns an object of flattened allValues, xValues, and yValues
    var flattenedData = utils.flattenData(data, props.xAccessor, props.yAccessor);

    var allValues = flattenedData.allValues;
    var xValues = flattenedData.xValues;
    var yValues = flattenedData.yValues;

    var scales = this._calculateScales(innerWidth, innerHeight, xValues, yValues, domain.x, domain.y);
    var xScale = scales.xScale;
    var yScale = scales.yScale;

    return React.createElement('span', { onMouseLeave: this.onMouseLeave }, React.createElement(Chart, {
      colors: props.colors,
      colorAccessor: props.colorAccessorOrdinal,
      data: data,
      height: props.height,
      legend: props.legend,
      sideOffset: props.sideOffset,
      margins: props.margins,
      title: props.title,
      viewBox: this.getViewBox(),
      width: props.width,
      shouldUpdate: !this.state.changeState
    }, React.createElement('g', {
      className: props.className,
      transform: trans
    }, React.createElement(XGrid, {
      xAxisClassName: props.xAxisClassName,
      xAxisTickValues: props.xAxisTickValues,
      xAxisTickCount: props.xAxisTickCount,
      xAxisTickInterval: props.xAxisTickInterval,
      xAxisOffset: props.xAxisOffset,
      xScale: scales.xScale,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      data: props.data,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      stroke: props.axesColor,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash
    }), React.createElement(YGrid, {
      yAxisClassName: props.yAxisClassName,
      yScale: scales.yScale,
      yAxisTickValues: props.yAxisTickValues,
      yAxisTickCount: props.yAxisTickCount,
      yAxisOffset: props.yAxisOffset,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      stroke: props.axesColor,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
    }), React.createElement(DataSeries, {
      circleRadius: props.circleRadius,
      colors: props.colors,
      colorAccessor: props.colorAccessorOrdinal,
      data: allValues,
      height: innerHeight,
      hoverAnimation: props.hoverAnimation,
      width: innerWidth,
      xAccessor: function xAccessor(coord) {
        return coord.x;
      },
      xScale: xScale,
      yAccessor: function yAccessor(coord) {
        return coord.y;
      },
      yScale: yScale,
      onMouseOver: this.onMouseOver
    }), React.createElement(XAxis, {
      data: data,
      height: innerHeight,
      horizontalChart: props.horizontal,
      margins: svgMargins,
      stroke: props.axesColor,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      width: innerWidth,
      xAxisClassName: props.xAxisClassName,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      xAxisOffset: props.xAxisOffset,
      xAxisTickInterval: props.xAxisTickInterval,
      xAxisTickValues: props.xAxisTickValues,
      xOrient: props.xOrient,
      yOrient: yOrient,
      xScale: xScale,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash
    }), React.createElement(YAxis, {
      data: data,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      margins: svgMargins,
      stroke: props.axesColor,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      yAxisClassName: props.yAxisClassName,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      yAxisOffset: props.yAxisOffset,
      yAxisTickValues: props.yAxisTickValues,
      yAxisTickCount: props.yAxisTickCount,
      yScale: yScale,
      xOrient: props.xOrient,
      yOrient: yOrient,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
    }))), props.showTooltip ? React.createElement(Tooltip, this.state.tooltip) : null);
  }
});

},{"../common":"/home/robson/projetos/rd3/src/common/index.js","../mixins":"/home/robson/projetos/rd3/src/mixins/index.js","../utils":"/home/robson/projetos/rd3/src/utils/index.js","./DataSeries":"/home/robson/projetos/rd3/src/scatterchart/DataSeries.jsx"}],"/home/robson/projetos/rd3/src/scatterchart/VoronoiCircle.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'VoronoiCircle',

  propTypes: {
    circleFill: PropTypes.string.isRequired,
    circleRadius: PropTypes.number.isRequired,
    className: PropTypes.string,
    cx: PropTypes.number.isRequired,
    cy: PropTypes.number.isRequired,
    handleMouseLeave: PropTypes.func.isRequired,
    handleMouseOver: PropTypes.func.isRequired,
    pathFill: PropTypes.string,
    voronoiPath: PropTypes.string.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-scatterchart-voronoi-circle',
      pathFill: 'transparent'
    };
  },
  render: function render() {
    var props = this.props;

    return React.createElement('g', null, React.createElement('path', {
      d: props.voronoiPath,
      fill: props.pathFill,
      stroke: '#DCDCDC',
      onMouseLeave: props.handleMouseLeave,
      onMouseOver: props.handleMouseOver
    }), React.createElement('circle', {
      cx: props.cx,
      cy: props.cy,
      className: props.className,
      fill: props.circleFill,
      onMouseLeave: props.handleMouseLeave,
      onMouseOver: props.handleMouseOver,
      r: props.circleRadius
    }));
  }
});

},{}],"/home/robson/projetos/rd3/src/scatterchart/VoronoiCircleContainer.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var _require = window.ReactDOM,
    findDOMNode = _require.findDOMNode;

var shade = require('../utils').shade;
var VoronoiCircle = require('./VoronoiCircle');

module.exports = createReactClass({

  displayName: 'VornoiCircleContainer',

  propTypes: {
    circleFill: PropTypes.string,
    circleRadius: PropTypes.number,
    circleRadiusMultiplier: PropTypes.number,
    className: PropTypes.string,
    hoverAnimation: PropTypes.bool,
    shadeMultiplier: PropTypes.number,
    vnode: PropTypes.array.isRequired,
    onMouseOver: PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      circleFill: '#1f77b4',
      circleRadius: 3,
      circleRadiusMultiplier: 1.25,
      className: 'rd3-scatterchart-voronoi-circle-container',
      hoverAnimation: true,
      shadeMultiplier: 0.2
    };
  },
  getInitialState: function getInitialState() {
    return {
      circleFill: this.props.circleFill,
      circleRadius: this.props.circleRadius
    };
  },
  _animateCircle: function _animateCircle() {
    var props = this.props;

    if (props.hoverAnimation) {
      var rect = findDOMNode(this).getElementsByTagName('circle')[0].getBoundingClientRect();
      this.props.onMouseOver.call(this, rect.right, rect.top, props.dataPoint);
      this.setState({
        circleFill: shade(props.circleFill, props.shadeMultiplier),
        circleRadius: props.circleRadius * props.circleRadiusMultiplier
      });
    }
  },
  _restoreCircle: function _restoreCircle() {
    var props = this.props;
    if (props.hoverAnimation) {
      this.setState({
        circleFill: props.circleFill,
        circleRadius: props.circleRadius
      });
    }
  },
  _drawPath: function _drawPath(d) {
    if (typeof d === 'undefined') {
      return 'M Z';
    }

    return 'M' + d.join(',') + 'Z';
  },
  render: function render() {
    var props = this.props;
    var state = this.state;

    return React.createElement('g', {
      className: props.className
    }, React.createElement(VoronoiCircle, {
      circleFill: state.circleFill,
      circleRadius: state.circleRadius,
      cx: props.cx,
      cy: props.cy,
      handleMouseLeave: this._restoreCircle,
      handleMouseOver: this._animateCircle,
      voronoiPath: this._drawPath(props.vnode)
    }));
  }
});

},{"../utils":"/home/robson/projetos/rd3/src/utils/index.js","./VoronoiCircle":"/home/robson/projetos/rd3/src/scatterchart/VoronoiCircle.jsx"}],"/home/robson/projetos/rd3/src/scatterchart/index.js":[function(require,module,exports){
'use strict';

exports.ScatterChart = require('./ScatterChart');

},{"./ScatterChart":"/home/robson/projetos/rd3/src/scatterchart/ScatterChart.jsx"}],"/home/robson/projetos/rd3/src/treemap/Cell.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;
var d3plus = require('d3plus-text');

module.exports = createReactClass({
  displayName: 'Cell',
  propTypes: {
    fill: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    label: PropTypes.string
  },

  render: function render() {
    var _this = this;

    var props = this.props;

    var textStyle = {
      textAnchor: 'middle',
      fontSize: props.fontSize
    };

    var t = 'translate(' + props.x + ', ' + props.y + '  )';
    var label = [{ text: props.label }];
    var id = 'treemap-cel-' + this.props.label.replace(/\s/g, '').replace(/[^\x00-\x7F]/g, "").replace(/\,/g, '');

    /*
    TODO: await on handleClick / _drillData to remove this settimeout
    */
    var delayLabel = function delayLabel(props) {
      setTimeout(function () {
        new d3plus.TextBox().data(label).fontResize(true).fontMax(36)
        // .fontMin(12)
        .fontWeight(800).padding(function (d) {
          return props.width * .05;
        }).fontColor('#FFFFFF').width(function (d) {
          return props.width * .9;
        }).height(function (d) {
          return props.height * 1;
        })
        // .x((d)=> {return props.width * .05})
        .y(function () {
          return 0;
        }).textAnchor('left').select('#' + id).overflow('visible').verticalAlign('top').render();
      }, 10);
    };

    return React.createElement('g', { transform: t, label: delayLabel(this.props), id: id, onClick: function onClick() {
        return props.handleClick(_this.props.label, 'down');
      } }, React.createElement('rect', {
      className: 'rd3-treemap-cell',
      width: props.width,
      height: props.height,
      fill: props.fill,
      onMouseOver: props.handleMouseOver,
      onMouseLeave: props.handleMouseLeave,
      strokeWidth: '3',
      stroke: '#FFFFFF'
    }));
  }
});

},{"d3plus-text":"/home/robson/projetos/rd3/node_modules/d3plus-text/build/d3plus-text.full.js"}],"/home/robson/projetos/rd3/src/treemap/CellContainer.jsx":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var shade = require('../utils').shade;
var Cell = require('./Cell');

module.exports = createReactClass({

  displayName: 'CellContainer',

  propTypes: {
    fill: PropTypes.string
  },

  getInitialState: function getInitialState() {
    return {
      // fill is named as fill instead of initialFill to avoid
      // confusion when passing down props from top parent
      fill: this.props.fill,
      fillCtl: this.props.fill
    };
  },

  statics: {
    getDerivedStateFromProps: function getDerivedStateFromProps(props, current_state) {
      if (current_state.fillCtl !== props.fill) {
        return {
          fillCtl: props.fill,
          fill: props.fill
        };
      }
      return null;
    }
  },

  _animateCell: function _animateCell() {
    this.setState({
      fill: shade(this.props.fill, 0.2)
    });
  },
  _restoreCell: function _restoreCell() {
    this.setState({
      fill: this.props.fill
    });
  },
  render: function render() {

    var props = this.props;
    // console.log(props.label)

    return React.createElement(Cell, _extends({}, props, {
      fill: this.state.fill,
      handleMouseOver: props.hoverAnimation ? this._animateCell : null,
      handleMouseLeave: props.hoverAnimation ? this._restoreCell : null,
      handleClick: props.drillData
    }));
  }
});

},{"../utils":"/home/robson/projetos/rd3/src/utils/index.js","./Cell":"/home/robson/projetos/rd3/src/treemap/Cell.jsx"}],"/home/robson/projetos/rd3/src/treemap/DataSeries.jsx":[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var CellContainer = require('./CellContainer');

/* color accessors */

var _require = require('../mixins'),
    CartesianChartPropsMixin = _require.CartesianChartPropsMixin;

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    data: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      data: []
    };
  },

  mixins: [CartesianChartPropsMixin],

  render: function render() {
    var _this = this;

    var props = this.props;

    var treemap = d3.treemap().size([props.width, props.height]);

    // stratify the data: reformatting for d3.js
    var root = d3.stratify().id(function (d) {
      return d.label;
    }).parentId(function (d) {
      return d.parent;
    })(props.data);

    root.sum(function (d) {
      return +d.value;
    });

    var tree = treemap(root);

    var series = [];
    root.children.map(function (d) {
      series.push(d.id);
    });

    var colorsDomain = void 0;
    var colorsAccessor = void 0;
    var origArray = Array.from(series.keys());

    if (this.props.color.accessor === 'Sequential') {
      colorsDomain = origArray.map(function (x) {
        return x / series.length;
      });
      colorsAccessor = this.props.colorAccessorSequential;
    } else {
      colorsDomain = series;
      colorsAccessor = this.props.colorAccessorOrdinal;
    }

    var cells = tree.children.map(function (node, idx) {
      return React.createElement(CellContainer, {
        key: idx,
        x: node.x0,
        y: node.y0,
        width: node.x1 - node.x0,
        height: node.y1 - node.y0,
        fill: _this.props.color.colors(colorsAccessor(colorsDomain, idx)),

        label: node.data.label,
        fontSize: props.fontSize,
        textColor: props.textColor,
        hoverAnimation: props.hoverAnimation,
        drillData: props.drillData
      });
    }, this);

    return React.createElement('g', { transform: props.transform, className: 'treemap' }, cells);
  }
});

},{"../mixins":"/home/robson/projetos/rd3/src/mixins/index.js","./CellContainer":"/home/robson/projetos/rd3/src/treemap/CellContainer.jsx"}],"/home/robson/projetos/rd3/src/treemap/Treemap.jsx":[function(require,module,exports){
'use strict';

var d3 = window.d3;
var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var Chart = require('../common').Chart;
var DataSeries = require('./DataSeries');
var BreadCrumb = require('../common/BreadCrumb');

module.exports = createReactClass({

  displayName: 'Treemap',

  propTypes: {
    data: PropTypes.array,
    margins: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    title: PropTypes.string,
    textColor: PropTypes.string,
    fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    hoverAnimation: PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      hoverAnimation: true,
      data: [],
      width: 400,
      heigth: 200,
      title: '',
      textColor: '#f7f7f7',
      fontSize: '0.85em',
      color: {
        accessor: 'Ordinal',
        colors: d3.scaleOrdinal(d3.schemeCategory10)
      }
    };
  },
  getInitialState: function getInitialState() {
    return {
      data: this.props.data,
      dataInitial: this.props.data,
      bc: []
    };
  },
  _recBreadCrumb: function _recBreadCrumb(label, bc) {
    var elem = this.state.dataInitial.filter(function (f) {
      return f.label === label;
    });
    if (elem.length > 0 && this.state.dataInitial.filter(function (f) {
      return f.parent === label;
    }).length > 0) {
      bc.push({ ev: this._drillData, label: label });
      this._recBreadCrumb(elem[0].parent, bc);
    }
    return bc.length > 0 ? bc : this.state.bc;
  },
  _drillData: function _drillData(label, upDown) {
    var _this = this;

    /* state not initialized at the first time due to api lag */
    if (this.state.dataInitial && this.state.dataInitial.length < 1) {
      this.setState({
        data: this.props.data,
        dataInitial: this.props.data
      }, function () {
        _this._drillData(label, upDown);
      });
    } else {
      var bc = [];
      var breadcrumb = this._recBreadCrumb(label, bc);
      var fData = this.state;

      if (upDown === 'down') {
        fData = this.props.data.filter(function (d) {
          return d.parent === label;
        }).map(function (d) {
          return Object.assign({}, d, {
            parent: 'Origin'
          });
        });
      } else if (upDown === 'up') {
        fData = this.state.dataInitial.filter(function (d) {
          return d.parent === label;
        }).map(function (d) {
          return Object.assign({}, d, {
            parent: 'Origin'
          });
        });
      }
      if (fData.length === 0) {
        return;
      }

      /* Add filtered origin */
      fData.push({
        "label": "Origin",
        "value": "",
        "parent": ""
      });

      this.setState({
        data: fData,
        bc: breadcrumb
        // dataLabel:label,
      });
    }
  },
  render: function render() {

    // debugger;
    var props = this.props;
    if (this.props.data && this.props.data.length < 1) {
      return null;
    }

    return React.createElement('div', null, React.createElement(Chart, {
      title: props.title,
      width: props.width,
      height: props.height,
      svgChart: props.svgChart,
      background: props.background,
      svgTitle: props.svgTitle,
      color: this.props.color
    }, React.createElement('g', { className: 'rd3-treemap' }, React.createElement(DataSeries, {
      data: this.state.data.length > 0 ? this.state.data : this.props.data,
      width: props.width,
      height: props.height,
      color: props.color,
      colorAccessor: props.colorAccessor,
      textColor: props.textColor,
      fontSize: props.fontSize,
      hoverAnimation: props.hoverAnimation,
      drillData: this._drillData
    }))), React.createElement(BreadCrumb, { breadcrumb: this.state.bc }));
  }
});

},{"../common":"/home/robson/projetos/rd3/src/common/index.js","../common/BreadCrumb":"/home/robson/projetos/rd3/src/common/BreadCrumb.jsx","./DataSeries":"/home/robson/projetos/rd3/src/treemap/DataSeries.jsx"}],"/home/robson/projetos/rd3/src/treemap/index.js":[function(require,module,exports){
'use strict';

exports.Treemap = require('./Treemap');

},{"./Treemap":"/home/robson/projetos/rd3/src/treemap/Treemap.jsx"}],"/home/robson/projetos/rd3/src/utils/index.js":[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var d3 = window.d3;

var _require = window.PropTypes,
    number = _require.number;

exports.calculateScales = function (width, height, xValues, yValues) {
  var xDomain = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
  var yDomain = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];

  var xScale = void 0;
  if (xValues.length > 0 && Object.prototype.toString.call(xValues[0]) === '[object Date]') {
    xScale = d3.scaleTime().range([0, width]);
  } else {
    /*
    TODO: allow select scale num, str, date
    xScale = d3.scaleBand()
    xScale.domain(xValues);
    */

    xScale = d3.scaleLinear()
    // xScale = d3.scaleBand()
    .range([0, width]);
  }
  var xdomain = d3.extent(xValues);
  if (xDomain[0] !== undefined && xDomain[0] !== null) xdomain[0] = xDomain[0];
  if (xDomain[1] !== undefined && xDomain[1] !== null) xdomain[1] = xDomain[1];
  xScale.domain(xdomain);

  // xScale.domain(xValues.sort());


  var yScale = void 0;
  if (yValues.length > 0 && Object.prototype.toString.call(yValues[0]) === '[object Date]') {
    yScale = d3.scaleTime().range([height, 0]);
  } else {
    /* TODO: Allow scaleLog */
    yScale = d3.scaleLinear().range([height, 0]);
  }

  yValues = yValues.map(function (y) {
    return parseInt(y);
  });
  var ydomain = d3.extent(yValues);
  if (yDomain[0] !== undefined && yDomain[0] !== null) ydomain[0] = yDomain[0];
  if (yDomain[1] !== undefined && yDomain[1] !== null) ydomain[1] = yDomain[1];
  yScale.domain(ydomain);

  return {
    xScale: xScale,
    yScale: yScale
  };
};

// debounce from Underscore.js
// MIT License: https://raw.githubusercontent.com/jashkenas/underscore/master/LICENSE
// Copyright (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative
// Reporters & Editors
exports.debounce = function (func, wait, immediate) {
  var timeout = void 0;
  return function debounce() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var context = this;
    var later = function later() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

exports.flattenData = function (data, xAccessor, yAccessor) {
  var allValues = [];
  var xValues = [];
  var yValues = [];
  var coincidentCoordinateCheck = {};

  data.forEach(function (series, i) {
    series.values.forEach(function (item, j) {
      var x = xAccessor(item);

      // Check for NaN since d3's Voronoi cannot handle NaN values
      // Go ahead and Proceed to next iteration since we don't want NaN
      // in allValues or in xValues or yValues
      // if (isNaN(x)) {
      //   return;
      // }
      xValues.push(x);

      var y = yAccessor(item);
      // when yAccessor returns an object (as in the case of candlestick)
      // iterate over the keys and push all the values to yValues array
      var yNode = void 0;
      if ((typeof y === 'undefined' ? 'undefined' : _typeof(y)) === 'object' && Object.keys(y).length > 0) {
        Object.keys(y).forEach(function (key) {
          // Check for NaN since d3's Voronoi cannot handle NaN values
          // Go ahead and Proceed to next iteration since we don't want NaN
          // in allValues or in xValues or yValues
          if (isNaN(y[key])) {
            return;
          }
          yValues.push(y[key]);
          // if multiple y points are to be plotted for a single x
          // as in the case of candlestick, default to y value of 0
          yNode = 0;
        });
      } else {
        // Check for NaN since d3's Voronoi cannot handle NaN values
        // Go ahead and Proceed to next iteration since we don't want NaN
        // in allValues or in xValues or yValues
        if (isNaN(y)) {
          return;
        }
        yValues.push(y);
        yNode = y;
      }

      var xyCoords = x + '-' + yNode;
      if (coincidentCoordinateCheck.hasOwnProperty(xyCoords)) {
        // Proceed to next iteration if the x y pair already exists
        // d3's Voronoi cannot handle NaN values or coincident coords
        // But we push them into xValues and yValues above because
        // we still may handle them there (labels, etc.)
        return;
      }
      coincidentCoordinateCheck[xyCoords] = '';

      var pointItem = {
        coord: {
          x: x,
          y: yNode
        },
        d: item,
        id: series.name + j,
        series: series,
        seriesIndex: i
      };
      allValues.push(pointItem);
    });
  });

  return { allValues: allValues, xValues: xValues, yValues: yValues };
};

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb) {
  return "#" + componentToHex(parseInt(rgb[0])) + componentToHex(parseInt(rgb[1])) + componentToHex(parseInt(rgb[2]));
}

exports.shade = function (hex, percent) {
  var red = void 0;
  var green = void 0;
  var blue = void 0;
  var min = Math.min;
  var round = Math.round;

  if (hex.length !== 7) {
    var rgb = hex.substring(4, hex.length - 1).replace(/ /g, '').split(',');
    hex = rgbToHex(rgb);
  }
  if (hex.length > 10) {
    return hex;
  }

  var number = parseInt(hex.slice(1), 16);
  var R = number >> 16;
  var G = number >> 8 & 0xFF;
  var B = number & 0xFF;
  red = min(255, round((1 + percent) * R)).toString(16);
  if (red.length === 1) red = '0' + red;
  green = min(255, round((1 + percent) * G)).toString(16);
  if (green.length === 1) green = '0' + green;
  blue = min(255, round((1 + percent) * B)).toString(16);
  if (blue.length === 1) blue = '0' + blue;
  return '#' + red + green + blue;
};

exports.nFormatter = function (num, digits) {
  var lookup = [{ value: 1, symbol: "" }, { value: 1e3, symbol: "k" }, { value: 1e6, symbol: "M" }, { value: 1e9, symbol: "G" }, { value: 1e12, symbol: "T" }, { value: 1e15, symbol: "P" }, { value: 1e18, symbol: "E" }];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function (item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
};

exports.formatInputData = require('./input').formatInputData;
exports.rd3FormatInputData = require('./input').rd3FormatInputData;

},{"./input":"/home/robson/projetos/rd3/src/utils/input.js"}],"/home/robson/projetos/rd3/src/utils/input.js":[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
    } else {
        obj[key] = value;
    }return obj;
}

/*
    Different format for input data are allowed.
    Converts each one for rd3 internal format.
*/

var csvRows = function csvRows(data) {
    var dataDict = {};
    data.map(function (elem, idxE) {
        var bar = elem.x;
        if (typeof dataDict[bar] === 'undefined') {
            dataDict[bar] = _defineProperty({ 'x': bar }, elem.name, +elem.y);
        } else {
            dataDict[bar][elem.name] = +elem.y;
        }
    });

    var series = new Set(data.map(function (item) {
        return item.name;
    }));
    series = Array.from(series);

    data = Object.keys(dataDict).map(function (key) {
        return dataDict[key];
    });

    return [data, series];
};

/* FOR BARCHART ONLY. HAVE TO READAPT BARCHART TO RD3 STANDARD */
exports.formatInputData = function (inputDataLayout, data) {
    if (inputDataLayout === 'csvRows') {
        return csvRows(data);
    } else if (inputDataLayout === 'csvStandard') {
        var series = Object.keys(data[0]).filter(function (f) {
            return f !== 'x';
        });
        return [data, series];
    }
};

var csvStandard2rd3 = function csvStandard2rd3(chartType, data, xIsDate, strokeWidth) {

    var dataObj = [];
    data.map(function (d) {
        var _loop = function _loop(prop) {
            if (prop === 'x') {
                return 'continue';
            }
            var curObj = dataObj.filter(function (obj) {
                return obj.name === prop;
            });
            curObj = curObj[0];
            if (curObj === undefined) {
                curObj = { 'name': prop, 'strokeWidth': parseInt(strokeWidth), 'values': [] };
                dataObj.push(curObj);
            }
            if (chartType === 'linechart') {
                try {
                    var _x = xIsDate === true ? new Date(Date.parse(d.x)) : d.x;
                    curObj['values'].push({ x: _x, y: +d[prop] });
                } catch (e) {
                    debugger;
                }
            }
        };

        for (var prop in d) {
            var _ret = _loop(prop);

            if (_ret === 'continue') continue;
        }
        if (chartType === 'areachart') {
            var x = xIsDate === true ? new Date(Date.parse(d.x)) : d.x;
            d['date'] = x;
            delete d[x];
        }
    });
    if (chartType === 'areachart') {
        dataObj = data;
    }

    var series = Object.keys(data[0]).filter(function (f) {
        return f !== 'x' && f !== 'date';
    });
    return [dataObj, series];
};

var csvRows2rd3 = function csvRows2rd3(chartType, data, xIsDate, strokeWidth) {
    var dataObj = [];
    data.map(function (d) {
        var curObj = dataObj.filter(function (obj) {
            return obj.name === d.name;
        });
        curObj = curObj[0];
        if (curObj === undefined) {
            curObj = { 'name': d.name, 'strokeWidth': strokeWidth, 'values': [] };
            dataObj.push(curObj);
        }

        if (chartType === 'linechart') {
            try {
                var x = xIsDate === true ? new Date(Date.parse(d.x)) : d.x;
                curObj['values'].push({ x: x, y: +d.y });
            } catch (e) {
                debugger;
            }
        } else if (chartType === 'areachart') {
            var _x2 = xIsDate === true ? new Date(Date.parse(d.x)) : d.x;
            curObj['values'].push([_x2, +d.y]);
        }
    });

    var series = new Set(data.map(function (item) {
        return item.name;
    }));
    series = Array.from(series);

    return [dataObj, series];
};

exports.rd3FormatInputData = function (chartType, inputDataLayout, data, xIsDate, strokeWidth) {
    if (inputDataLayout === 'rd3') {
        if (chartType === 'areachart') {
            var series = Object.keys(data[0]).filter(function (f) {
                return f !== 'date';
            }) || [];
            return [data, series];
        }
        return [data, data.map(function (d) {
            return d.name;
        })];
    }
    if (inputDataLayout === 'csvRows') {
        return csvRows2rd3(chartType, data, xIsDate, strokeWidth);
    } else if (inputDataLayout === 'csvStandard') {
        return csvStandard2rd3(chartType, data, xIsDate, strokeWidth);
    }
};

/* CONVERT EXTERNAL INPUT TO RD3 API FORMAT */

/* CSV Standard
0:
Lib 1: "74.0"
Lib 2: "0.0"
Lib 3: "5.0"
Lib 4: "14.0"
Lib 5: "10.0"
Lib 6: "197.0"
Lib 7: "160.0"
x: "202044"
*/

/* RD3 FORMAT FOR LINECHART
[{
    name: 'series1',
    values: [{ x: 0, y: 20 }, { x: 1, y: 30 }, { x: 2, y: 10 }, { x: 3, y: 5 }, { x: 4, y: 8 }, { x: 5, y: 15 }, { x: 6, y: 10 }],
    strokeWidth: 3,
    strokeDashArray: '5,5'
}]
*/

/* RD3 FORMAT FOR AREACHART
[
    {
      "name" : "North America" ,
      "values" : [ [ 1025409600000 , 23.041422681023] , [ 1028088000000 , 19.854291255832] , [ 1030766400000 , 21.02286281168] , [ 1033358400000 , 22.093608385173] , [ 1036040400000 , 25.108079299458] , [ 1038632400000 , 26.982389242348] , [ 1041310800000 , 19.828984957662] , [ 1043989200000 , 19.914055036294] , [ 1046408400000 , 19.436150539916] , [ 1049086800000 , 21.558650338602] , [ 1051675200000 , 24.395594061773] , [ 1054353600000 , 24.747089309384] , [ 1056945600000 , 23.491755498807] , [ 1059624000000 , 23.376634878164] , [ 1062302400000 , 24.581223154533] , [ 1064894400000 , 24.922476843538] , [ 1067576400000 , 27.357712939042] , [ 1070168400000 , 26.503020572593] , [ 1072846800000 , 26.658901244878] , [ 1075525200000 , 27.065704156445] , [ 1078030800000 , 28.735320452588] , [ 1080709200000 , 31.572277846319] , [ 1083297600000 , 30.932161503638] , [ 1085976000000 , 31.627029785554] , [ 1088568000000 , 28.728743674232] , [ 1091246400000 , 26.858365172675] , [ 1093924800000 , 27.279922830032] , [ 1096516800000 , 34.408301211324] , [ 1099195200000 , 34.794362930439] , [ 1101790800000 , 35.609978198951] , [ 1104469200000 , 33.574394968037] , [ 1107147600000 , 31.979405070598] , [ 1109566800000 , 31.19009040297] , [ 1112245200000 , 31.083933968994] , [ 1114833600000 , 29.668971113185] , [ 1117512000000 , 31.490638014379] , [ 1120104000000 , 31.818617451128] , [ 1122782400000 , 32.960314008183] , [ 1125460800000 , 31.313383196209] , [ 1128052800000 , 33.125486081852] , [ 1130734800000 , 32.791805509149] , [ 1133326800000 , 33.506038030366] , [ 1136005200000 , 26.96501697216] , [ 1138683600000 , 27.38478809681] , [ 1141102800000 , 27.371377218209] , [ 1143781200000 , 26.309915460827] , [ 1146369600000 , 26.425199957518] , [ 1149048000000 , 26.823411519396] , [ 1151640000000 , 23.850443591587] , [ 1154318400000 , 23.158355444054] , [ 1156996800000 , 22.998689393695] , [ 1159588800000 , 27.9771285113] , [ 1162270800000 , 29.073672469719] , [ 1164862800000 , 28.587640408904] , [ 1167541200000 , 22.788453687637] , [ 1170219600000 , 22.429199073597] , [ 1172638800000 , 22.324103271052] , [ 1175313600000 , 17.558388444187] , [ 1177905600000 , 16.769518096208] , [ 1180584000000 , 16.214738201301] , [ 1183176000000 , 18.729632971229] , [ 1185854400000 , 18.814523318847] , [ 1188532800000 , 19.789986451358] , [ 1191124800000 , 17.070049054933] , [ 1193803200000 , 16.121349575716] , [ 1196398800000 , 15.141659430091] , [ 1199077200000 , 17.175388025297] , [ 1201755600000 , 17.286592443522] , [ 1204261200000 , 16.323141626568] , [ 1206936000000 , 19.231263773952] , [ 1209528000000 , 18.446256391095] , [ 1212206400000 , 17.822632399764] , [ 1214798400000 , 15.53936647598] , [ 1217476800000 , 15.255131790217] , [ 1220155200000 , 15.660963922592] , [ 1222747200000 , 13.254482273698] , [ 1225425600000 , 11.920796202299] , [ 1228021200000 , 12.122809090924] , [ 1230699600000 , 15.691026271393] , [ 1233378000000 , 14.720881635107] , [ 1235797200000 , 15.387939360044] , [ 1238472000000 , 13.765436672228] , [ 1241064000000 , 14.631445864799] , [ 1243742400000 , 14.292446536221] , [ 1246334400000 , 16.170071367017] , [ 1249012800000 , 15.948135554337] , [ 1251691200000 , 16.612872685134] , [ 1254283200000 , 18.778338719091] , [ 1256961600000 , 16.756026065421] , [ 1259557200000 , 19.385804443146] , [ 1262235600000 , 22.950590240168] , [ 1264914000000 , 23.61159018141] , [ 1267333200000 , 25.708586989581] , [ 1270008000000 , 26.883915999885] , [ 1272600000000 , 25.893486687065] , [ 1275278400000 , 24.678914263176] , [ 1277870400000 , 25.937275793024] , [ 1280548800000 , 29.461381693838] , [ 1283227200000 , 27.357322961861] , [ 1285819200000 , 29.057235285673] , [ 1288497600000 , 28.549434189386] , [ 1291093200000 , 28.506352379724] , [ 1293771600000 , 29.449241421598] , [ 1296450000000 , 25.796838168807] , [ 1298869200000 , 28.740145449188] , [ 1301544000000 , 22.091744141872] , [ 1304136000000 , 25.07966254541] , [ 1306814400000 , 23.674906973064] , [ 1309406400000 , 23.418002742929] , [ 1312084800000 , 23.24364413887] , [ 1314763200000 , 31.591854066817] , [ 1317355200000 , 31.497112374114] , [ 1320033600000 , 26.67238082043] , [ 1322629200000 , 27.297080015495] , [ 1325307600000 , 20.174315530051] , [ 1327986000000 , 19.631084213898] , [ 1330491600000 , 20.366462219461] , [ 1333166400000 , 19.284784434185] , [ 1335758400000 , 19.157810257624]]
    },

    {
      "name" : "Africa" ,
      "values" : [ [ 1025409600000 , 7.9356392949025] , [ 1028088000000 , 7.4514668527298] , [ 1030766400000 , 7.9085410566608] , [ 1033358400000 , 5.8996782364764] , [ 1036040400000 , 6.0591869346923] , [ 1038632400000 , 5.9667815800451] , [ 1041310800000 , 8.65528925664] , [ 1043989200000 , 8.7690763386254] , [ 1046408400000 , 8.6386160387453] , [ 1049086800000 , 5.9895557449743] , [ 1051675200000 , 6.3840324338159] , [ 1054353600000 , 6.5196511461441] , [ 1056945600000 , 7.0738618553114] , [ 1059624000000 , 6.5745957367133] , [ 1062302400000 , 6.4658359184444] , [ 1064894400000 , 2.7622758754954] , [ 1067576400000 , 2.9794782986241] , [ 1070168400000 , 2.8735432712019] , [ 1072846800000 , 1.6344817513645] , [ 1075525200000 , 1.5869248754883] , [ 1078030800000 , 1.7172279157246] , [ 1080709200000 , 1.9649927409867] , [ 1083297600000 , 2.0261695079196] , [ 1085976000000 , 2.0541261923929] , [ 1088568000000 , 3.9466318927569] , [ 1091246400000 , 3.7826770946089] , [ 1093924800000 , 3.9543021004028] , [ 1096516800000 , 3.8309891064711] , [ 1099195200000 , 3.6340958946166] , [ 1101790800000 , 3.5289755762525] , [ 1104469200000 , 5.702378559857] , [ 1107147600000 , 5.6539569019223] , [ 1109566800000 , 5.5449506370392] , [ 1112245200000 , 4.7579993280677] , [ 1114833600000 , 4.4816139372906] , [ 1117512000000 , 4.5965558568606] , [ 1120104000000 , 4.3747066116976] , [ 1122782400000 , 4.4588822917087] , [ 1125460800000 , 4.4460351848286] , [ 1128052800000 , 3.7989113035136] , [ 1130734800000 , 3.7743883140088] , [ 1133326800000 , 3.7727852823828] , [ 1136005200000 , 7.2968111448895] , [ 1138683600000 , 7.2800122043237] , [ 1141102800000 , 7.1187787503354] , [ 1143781200000 , 8.351887016482] , [ 1146369600000 , 8.4156698763993] , [ 1149048000000 , 8.1673298604231] , [ 1151640000000 , 5.5132447126042] , [ 1154318400000 , 6.1152537710599] , [ 1156996800000 , 6.076765091942] , [ 1159588800000 , 4.6304473798646] , [ 1162270800000 , 4.6301068469402] , [ 1164862800000 , 4.3466656309389] , [ 1167541200000 , 6.830104897003] , [ 1170219600000 , 7.241633040029] , [ 1172638800000 , 7.1432372054153] , [ 1175313600000 , 10.608942063374] , [ 1177905600000 , 10.914964549494] , [ 1180584000000 , 10.933223880565] , [ 1183176000000 , 8.3457524851265] , [ 1185854400000 , 8.1078413081882] , [ 1188532800000 , 8.2697185922474] , [ 1191124800000 , 8.4742436475968] , [ 1193803200000 , 8.4994601179319] , [ 1196398800000 , 8.7387319683243] , [ 1199077200000 , 6.8829183612895] , [ 1201755600000 , 6.984133637885] , [ 1204261200000 , 7.0860136043287] , [ 1206936000000 , 4.3961787956053] , [ 1209528000000 , 3.8699674365231] , [ 1212206400000 , 3.6928925238305] , [ 1214798400000 , 6.7571718894253] , [ 1217476800000 , 6.4367313362344] , [ 1220155200000 , 6.4048441521454] , [ 1222747200000 , 5.4643833239669] , [ 1225425600000 , 5.3150786833374] , [ 1228021200000 , 5.3011272612576] , [ 1230699600000 , 4.1203601430809] , [ 1233378000000 , 4.0881783200525] , [ 1235797200000 , 4.1928665957189] , [ 1238472000000 , 7.0249415663205] , [ 1241064000000 , 7.006530880769] , [ 1243742400000 , 6.994835633224] , [ 1246334400000 , 6.1220222336254] , [ 1249012800000 , 6.1177436137653] , [ 1251691200000 , 6.1413396231981] , [ 1254283200000 , 4.8046006145874] , [ 1256961600000 , 4.6647600660544] , [ 1259557200000 , 4.544865006255] , [ 1262235600000 , 6.0488249316539] , [ 1264914000000 , 6.3188669540206] , [ 1267333200000 , 6.5873958262306] , [ 1270008000000 , 6.2281189839578] , [ 1272600000000 , 5.8948915746059] , [ 1275278400000 , 5.5967320482214] , [ 1277870400000 , 0.99784432084837] , [ 1280548800000 , 1.0950794175359] , [ 1283227200000 , 0.94479734407491] , [ 1285819200000 , 1.222093988688] , [ 1288497600000 , 1.335093106856] , [ 1291093200000 , 1.3302565104985] , [ 1293771600000 , 1.340824670897] , [ 1296450000000 , 0] , [ 1298869200000 , 0] , [ 1301544000000 , 0] , [ 1304136000000 , 0] , [ 1306814400000 , 0] , [ 1309406400000 , 0] , [ 1312084800000 , 0] , [ 1314763200000 , 0] , [ 1317355200000 , 4.4583692315] , [ 1320033600000 , 3.6493043348059] , [ 1322629200000 , 3.8610064091761] , [ 1325307600000 , 5.5144800685202] , [ 1327986000000 , 5.1750695220791] , [ 1330491600000 , 5.6710066952691] , [ 1333166400000 , 5.5611890039181] , [ 1335758400000 , 5.5979368839939]]
    }
]
*/

},{}]},{},["/home/robson/projetos/rd3/src/index.js"])("/home/robson/projetos/rd3/src/index.js")
});

//# sourceMappingURL=react-d3.js.map
