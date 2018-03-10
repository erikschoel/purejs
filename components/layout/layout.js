define(function() {

  return this.enqueue({

    name: 'layout',

    deps: {

      core: [ 'pure', 'dom' ],

      components: [ 'view', 'grid' ]

    }

  }, function() {

    return {

      ext: [
        (function grid(x, y, f) {
          var grid = this.child('grid', this.deps('components.grid'));
          var each = grid.render(x, y).bind(function(elem) {
            var row = parseInt(elem.getAttribute('data-row'));
            var col = parseInt(elem.getAttribute('data-col'));

            if (!col) elem.classList.add('row');
            else elem.classList.add('col');

            return f ? f(elem, row, col) : elem;
          }).each(function(y) {
            /* Collapse the array(s) of elements into their DOM structure */
            var idx = 0, item, arr = [], ref;
            while (idx < y.length && (item = y.shift())) {
              if (item.classList.contains('row')) {
                arr.push([ item, (ref = []) ]);
              }else {
                ref.push(item);
              }
            }
            return arr.map(function(v) {
              var x = v.pop(), y = v.first();
              if (x.length) x.map(y.appendChild.bind(y));
              return y;
            });
          });
          return each.flatten();
        })
      ]

    };

  });

});