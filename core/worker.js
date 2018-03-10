(function(klass, worker) {
  var isWorker = self.isWorker = (function() {
    var self = this; return (self.document === undefined);
  })();

  if (isWorker) {
    importScripts('../libs/sim/sim.js', '../core/pure.js');
    
    sys.run(worker);

  }else {

    define(function() {

      return this.klass('Cont').of(this, function(sys) {
        return function $_pure(k) {
          var type = sys.klass('Node').parse(klass());
          if (sys.get('config.worker')) {
            var wrkr = sys.get().child('workers').child('main', type.$ctor);
            sys.get('async').set('request', wrkr.xhr.bind(wrkr));
            wrkr.start(); k(wrkr);
          }else {
            k({});
          }
        }
      }).attr('name', 'core.worker');

    });
  }
})(

  (function() {
    return {
      klass: function Worker(x) {
        this.$super(x);
        this._worker = this.worker();

        this._events = (this.parent('events') || sys.get('events')).child({ name: 'events', parent: this });
        this.ctor.prop('dispatcher', this.listener.run(this));

        this.observe('change', 'result', this.result.bind(this));
      },
      ext: [
        (function worker() {
          var comp = this;
          var path = self.location.origin+self.location.pathname+'core/worker.js';
          var wrkr = new Worker(path);
          var logr = sys.run().log;
          var queu = comp._queue = [];

          wrkr.addEventListener('error', function(evt) {
            try {
              logr('Worker.MESSAGE: ' + evt.data);
            }catch(e) {
              logr('Worker.ERROR: ' + e.message);
            }
          }, false);
          wrkr.addEventListener('message', function(evt) {
            try {
              if (typeof evt.data == 'string') {
                if (evt.data === 'worker.started') {
                  wrkr.postMessage({
                    'task'     : 'initialize',
                    'settings' : comp.stringify(sys.get('config.worker').values())
                  });
                  logr('Worker.MESSAGE: ' + evt.data);
                }else if (evt.data && evt.data.slice(0, 7) == 'worker.') {
                  logr('Worker.MESSAGE: ' + evt.data);
                }
              }else if (queu.length) {
                comp.emit('change', 'result', 'event', evt.data);
              }else {
                logr('Worker.MESSAGE: ' + evt.data);
              }
            }catch(e) {
              logr('Worker.ERROR: ' + e.message);
            }
          }, false);

          return wrkr;
        }),
        (function post(msg) {
          this._worker.postMessage(msg);
        }),
        (function parseJSON(json) {
          return this._parse ? JSON.parse(json) : json;
        }),
        (function stringify(obj) {
          return this._parse ? JSON.stringify(obj) : obj;
        }),
        (function result(evt) {
          var data = this.parseJSON(evt.value), index = 0, item;
          while (index < this._queue.length && (item = this._queue[index])) {
            if (item.id != data.id && ++index) continue;
            item.fn(data); this._queue.splice(index, 1); break;
          }
        }),
        (function wrap(succ) {
          return function(data) {
            succ(data.result);
          }
        }),
        (function once(id, fn) {
          this._queue.push({ id: id, fn: fn });
        }),
        (function _runAsync(id, request) {
          var that = this;
          return function $_pure(succ, fail) {
            that.once(id, that.wrap(succ));
            that.post(request);
          };
        }),
        (function _xhr(func, options) {
          var id = this.tid();
          return func.call(this, id, {
            'task'    : 'xhr',
            'id'      : id,
            'request' : this.stringify(this._request(options))
          });
        }),
        (function pick() {
          var args = [].slice.call(arguments);
          var opts = args.shift();
          return Object.keys(opts).reduce(function(r, v) {
            if (args.indexOf(v) >= 0) r[v] = opts[v];
            return r;
          }, {});
        }),
        (function _request(options) {
          if (!options.type) options.type = 'GET';
          var req = this.pick(options, 'type', 'ref', 'url', 'dataType', 'contentType', 'accept', 'parse');
          if (!req.url) req.url = window.location.href;
          if (options.data && options.type != 'GET') {
            var data = options.contentType ? $.param(options.data) : options.data;
            req.data = typeof data === 'object' ? JSON.stringify(data) : data;
          }else if (options.data) {
            var url = Object.keys(options.data).reduce(function(r, k) {
              r.push(k + '=' + options.data[k]);
              return r;
            }, []);
            req.url += '?' + url.join('&');
          }
          return req;
        }),
        (function templateAsync(action, request) {
          return this._template(this._runAsync, action, request);
        }),
        (function _template(func, action, request) {
          var id = this.tid();
          return func.call(this, id, {
            'task'    : 'template.' + action,
            'action'  : action,
            'id'      : id,
            'request' : this.stringify(request)
          });
        }),
        (function xhr(options) {
          return this._xhr(this._runAsync, options);
        })
      ],
      init: function(type, klass, sys) {
        //if (!sys.get('config.worker')) return;
        klass.prop('tid', this.makeID('task'));
        var lstr = sys.klass('Listener').$ctor;
        klass.prop('listener', lstr.init('workers', 'store'));
        var node = sys.root.child('workers');
      }
    };
  }),
  (function(sys) {

    var Evt = {
      opts: sys.get().child('config'),
      request: sys.get('async.request'),
      parseJSON: function(json) {
        return this.parse ? JSON.parse(json) : json;
      },
      stringify: function(obj) {
        return this.parse ? JSON.stringify(obj) : obj;
      },
      initialize: function(task) {
        var settings = this.parseJSON(task.settings);
        this.opts.parse(settings);
        this.post('worker.ready');
      },
      post: function(data) {
        if (data && !(data instanceof Array)) data = [ data ];
        while(data.length) self.postMessage(data.shift());
        return this;
      },
      task: function(data) {
        var msg  = data.value;
        var task = msg.task;
        if (task) Evt[task](msg);
        return this;
      },
      handler: function(base, task, parser) {
        return function(r) {
          if (parser) task.result = base.parseJSON(r);
          else task.result = r;
          base.post(base.stringify(task));        
        }
      },
      xhr: function(task) {
        var request = this.parseJSON(task.request);
        var parser  = request.parse;
        return this.request(request)(this.handler(this, task, parser));
      },
      run: function(data) {
        var task = data.task;
        if (task) this[task](data);
        return this;
      }
    };

    self.addEventListener('message', function(e) {
      if (e.data.task) Evt.run(e.data);
      else self.postMessage('worker.error');
    }, false);

    Evt.post('worker.started');

    return Evt;
  })

);
