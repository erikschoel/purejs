define(function() {
  return this.enqueue({

    name: 'system.test.inst',

    deps: {

      core: [ 'pure', 'instance' ]

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

          inst: function() {
            var args = [].slice.call(arguments);
            var type = args.shift();
            var inst = this.call('deps.core.instance').of(type);

            while (args.length) inst.arg(args.shift());

            return inst;

          },
          cont: function() {
            var args = [].slice.call(arguments);
            if (!args.length) args.push('value');

            var inst = this.inst.apply(this, [ 'cont' ].concat(args));

            inst.map(function(x) {
              return '!'+x+'!';
            });

            inst.bind(function(x) {
              return [x,x];
            });

            inst.bind(function(x) {
              console.log(x);
            });

            return inst;
          }
        }

      }
    };

  });
});
