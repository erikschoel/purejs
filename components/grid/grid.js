define(function() {

  return this.enqueue({

    name: 'grid',

    deps: {

      core: [ 'pure', 'dom' ],

      templates: [ 'tmpl' ],

      components: [ 'view' ]

    }

  }, function() {

    return {
      ext: {
        render: (function($wrap, $make, $bind, $grid) {
          return $wrap($make($grid, $bind));
        })(
          (function $wrap($run) {
            return function render(x, y, e, z) {
              return $run(this.view(), x, y, e, z);
            }
          }),
          (function $make($grid, $bind) {
            return function(v, x, y, e, z) {
              return $bind($grid(v, e, z))(x)(y);
            }
          }),
          (function $bind($grid) {
            return function $mapX(x) {
              return function $mapY(y) {
                return (x instanceof Array ? x.map(function(xx) {

                  return y instanceof Array ? y.map($mapX(xx)) : $mapX(xx)(y);

                }) : (y instanceof Array ? y.map(function(yy, ii) {

                  return yy instanceof Array ? yy.map($mapX(ii)) : $grid(Array.range(ii, ii + x - 1), yy);

                }) : $grid(Array.range(0, x - 1), y)));
              }
            }
          }),
          (function $grid(view, e, z) {
            var cell  = view.parent('$fn.render').run('item');
            var attrs = view.eff('attrs');
            return function grid(x, y) {
              return x.combine(function(a, b) {
                var attr = { id: 'r' + a + (b || z ? ('c' + b) : ''), row: a, col: b };
                var elem = e && e.length ? attrs.run(e.shift())(attr).unit() : cell.run(attr).unit();
                if ((attr.row || x == 1) && !attr.col) elem.classList.add('clear');
                else if (elem.classList.contains('clear')) elem.classList.remove('clear');
                return elem;
              }, Array.range(0, y - 1));
            }
          })
        ),
        chop: function(e, l) {
          while (e.childElementCount > l) {
            e.removeChild(e.children.item(e.childElementCount-1));
          }
        },
        elems: function(x, y, z) {
          var g = this;
          return this.render(x, y, this.get('elems'), z, this.chop(this.view().$el().run(), x * y)).flatten().chain(function(elems) {
            return g.set('elems', elems);
          });
        },
        vals: function(x, y, z) {
          return this.state('vals', this.view().$el().toMaybe().run().lift(function(el, vals) {
            var ch  = vals.clientHeight = el.clientHeight, cw = vals.clientWidth = el.clientWidth;
            var css = vals.css.run(el);
            var ph  = css('paddingTop') + css('paddingBottom'), pw = css('paddingLeft') + css('paddingRight');
            vals.marginHGHT = z*(vals.rows); vals.marginWDTH = z*(vals.cols);
            vals.cellHeight = (ch - vals.marginHGHT - ph) / vals.rows;
            vals.cellWidth  = (cw - vals.marginWDTH - pw) / vals.cols;
            return vals;
          }).ap({ css: this.view().eff('css'), row: 0, delay: 0, rows: parseInt(x), cols: parseInt(y) })).unit();
        },
        each: function(f) {
          return this.view().eff('children').run(this.$fn('el'))(f);
        },
        show: function() {
          this.view().eff('children').run(this.$fn('el'))(function(elem) {
            elem.style.opacity = 1;
            return elem;
          }).run(unit).run();
        }
      }
    };

  });

});