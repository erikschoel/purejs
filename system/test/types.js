define(function() {
  return this.enqueue({

    name: 'system.test.types',

    deps: {

      core: [ 'pure' ]

    }

  }, function() {

    return {
      ext: {
        origin: function(plural) {

          return 'system';
        }
      },
      control: {

        main: {
          run: function() {

          }
        },

        test: {

          base: function() {

            var tst1 = sys.get('types.type').find('Cont').of('erik')

            var tst2 = tst1.map(function(x) {
              var y = [x,x];
              console.log('tst1.map.tst2', y);
              return y;
            });

            var tst3 = tst1.bind(function(x) {
              var y = [x,x];
              console.log('tst1.bind.tst3', y);
              return y;
            });

            var tst4 = tst2.bind(function(x) {
              var y = [x,x];
              console.log('tst2.bind.tst4', y);
              return y;
            });

            var tst5 = tst4.map(function(x) {
              var y = [x,x];
              console.log('tst4.map.tst5', y);
              return y;
            });

            var tst6 = tst4.bind(function(x) {
              var y = [x,x];
              console.log('tst4.bind.tst6', y);
              return y;
            });

            return {

              tst4: tst4,

              tst6: tst6

            };

          },

          thread: function() {
            var test = sys.klass('Thread').fromConstructor('arr',[1,2,3,4,5], function(x) {
              console.log(x);
              return x;
            });
            var test2 = test.bind(function(y) {
              var x = y.shift();
              console.log('bind', x);
              if (x < 5) {
                return this.next(y);
              }else {
                return this.done('DONE');
              }
            });
            return test2;
          },

          link: function() {
            var show = sys.get('components.home.slideshow');

            var bind = show.deps('templates').bind(function(o, v) {
              if (v && v.isStore) {
                return v.keys().filter(function(x) {
                  return (!o[x] && (o[x] = 1)) || !o[x]++;
                });
              }else {
                return v;
              }
            }).flatten().chain(function(x) {
              console.log(x);
              return x;
            });

            return bind;
          }

        }
      }

    };

  });
});
