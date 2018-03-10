define(function() {

  return this.enqueue({

    name: 'title',

    deps: {

      core: [ 'pure', 'dom' ],

      templates: [ 'tmpl' ],

      components: [ 'view' ]

    }

  }, function() {

    return {

      ext: {
        render: function(str) {
          return this.$fn('render').run('text').map(function(result) {
            return result;
          }).run({
            text: str.split('')
          });
        }
      },
      control: {
        main: {
          anim: function() {
            return this.make();
          },
          make: function() {
            var data = this.root('data');
            var anim = sys.eff('dom.elements.animate').run();
            var base = anim.run({
              duration: 40, easing: 'swing', toggle: true
            });
            return this.run().chain(function(a) {
              var cntrl = sys.klass('Control');
              var anim1 = cntrl.of(base(a.shift())).delay(500).then(
                cntrl.of(base(a.shift()), base(a.shift())).times(3) 
              );
              var anim2 = cntrl.of(base(a.shift())).times(2);
              var anim3 = cntrl.of(base(a.shift())).times(10);
              var anim4 = cntrl.of(base(a.shift()));
              return data.set('anim', anim1.delay(500).then(anim2.mv, anim3.mv, anim4.times(3).mv).delay(1500).then(anim4.times(2)));
            });
          },
          run: function() {
            var root = this.root();
            return root.$el().map(function(el) {
              var list = [];
              var xtnd = sys.get('utils.extend');

              list.push({ prop: 'top', from: -100, to: 300, stagger: 100, duration: '400%', toggle: false, fn: 'px' });
              list.push({ prop: 'color', from: 100, to: 255, stagger: 40, delay: 100, duration: '500%', fn: { tmpl: 'rgb(10,%,100)', dec: 1 } });
              list.push({ prop: 'backgroundColor', from: 0, to: 1, stagger: 40, delay: 100, times: 2, duration: '200%', fn: { tmpl: 'rgba(100,10,100,%)', dec: 1 } });
              list.push({ prop: 'color', from: 255, to: 100, stagger: 120, fn: { tmpl: 'rgb(10,%,100)', dec: 1 } });
              list.push({ prop: 'backgroundColor', from: 100, to: 255, stagger: 80, fn: { tmpl: 'rgb(%,10,100)', dec: 1 } });
              list.push({ prop: 'opacity', from: 0, to: 1, stagger: 120, duration: '400%' });

              var items = sys.eff('dom.elements.query').just('li span', el).map(function(item) {
                item.setAttribute('style', '');
                return item;
              });
              return list.map(function(val) {
                return items.map(function(elem, index) {
                  var res   = xtnd({ elem: elem }, val);
                  res.delay = ((val.delay || 0) + (index*val.stagger))+'%';
                  return res;
                });
              });
            }).runMaybe();
          },
          click: function(evt) {
            this.root().emit('change', 'run', 'click');
            return evt;
          }
        }
      },
      events: {
        dom: {
          'click:ul' : 'data.control.main.click',
          'keypress:*':'data.control.main.click'
        }
      }
    };

  });

});
