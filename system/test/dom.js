define(function() {
  return this.enqueue({

    name: 'system.test.dom',

    deps: {

      core: [ 'pure', 'dom' ],

      components: [ 'view' ]

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

            var make = sys.eff('dom.elements.make').init();
            var div  = make.run('div').run();
            var mkid = sys.klass('IO').pure(sys.kid);
            var xtid = mkid.lift(sys.get('utils.extend'));
            var elem = div.ap(sys.klass('IO').pure(function(id) {
              return { id: 'E'+id };
            }).ap(xtid));

            var load = sys.eff('sys.loader.component').map(function(c) {
              return c.bind(function(x) {
                return x.get('IO') || x.set('IO', x.klass('IO').of(x.store()).map(function(node) {
                  return function(key) {
                    return node.get(key);
                  }
                }).to('io').run());
              });
            });
            var tmpl = sys.eff('dom.elements.template').init().flip().run({});
            var html = sys.eff('dom.elements.html').init().ap(elem);
            var rndr = html.ap({test:'test'}).pure();
            var attr = sys.eff('sys.loader.component').init();
            var data = sys.klass('data').of({
              ref: 'templates/base.tmpl',
              cont: load,
              load: 'main',
              tmpl: tmpl,
              attr: attr.liftIO(),
              comp: 'config/test.json',
              rndr: rndr
            }).unit();
            var kont = data.cont();

            var item = {
              mkid: mkid,
              xtid: xtid,
              attr: attr,
              elem: elem,
              data: data,
              load: load,
              tmpl: tmpl,
              html: html,
              rndr: rndr,
              kont: kont
            };
            return item;
          },

          comp: function() {
            var comp = sys.klass('IO').of(sys('components')).lift(function(comps, path) {
              return comps.lookup(path);
            });

            var test = sys.eff('dom.calc.size').ap(comp.map(function(cmp) {
              return cmp.chain(function(c) {
                return c.$el ? c.$el().run() : null;
              });
            }));

            return {
              getCompSize: test
            };
          },

          drag: function() {
            return sys.eff('sys.loader.component').run('components/drag-and-drop/drag-and-drop').bind(function(x) {

              return x.create({ name: 'drag', parent: sys.get('components.app') }).pure();

            }).bind(function(drag) {
              var home = drag.mixin({ opts: { draggable: '.draggable tr a' } }).run(sys.get('components.app'));
              var enbl = home.enable('.accordion', '.panel .panel-collapse tbody');
              enbl.run();
              return drag;
            });
          },

          modal: function(name) {
            var modal = sys.eff('sys.loader.component').run('components/modal/modal').bind(function(x) {

              return x.create({ name: name || 'test-modal' }).pure();

            }).bind(function(mdl) {

              mdl.read = mdl.view().read().run('main', { title: 'T123' });

              mdl.addButton('close', 'Close');
              mdl.addButton('test', 'Test');

              mdl.addForm({
                method: { elem: 'dropdown',  label: 'Method',      options: [ 'Of', 'Pure', 'Lift' ] },
                arg1:   { elem: 'input',     label: 'Argument 1',  type: 'text',  placeholder: 'argument 1'  },
                arg2:   { elem: 'input',     label: 'Argument 2',  type: 'text',  placeholder: 'argument 2'  },
                run:    { elem: 'button',    label: 'Run',         type: 'button' }
              }, 'test-form');

              mdl.read.attach.run();
              mdl.toggle();
              return mdl;
            });

            return modal;
          },

          slideshow: function() {
            var show = sys.eff('sys.loader.component').run('components/slide-show/slide-show').bind(function(x) {

              return x.create({ name: 'slideshow', parent: sys.get('components.home') }).pure();

            }).run(function(mdl) {

              mdl.read = mdl.view().read().run('main', { title: 'T123', full: true });
              mdl.read.attach.run();
              mdl.renderBody('test-body', {});
              mdl.createControls();
              mdl.toggle();
              return mdl;
            });

            return show;
          }
        }
      }

    };

  });
});
