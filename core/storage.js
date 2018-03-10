define(function() {

  return this.enqueue({

    name: 'core.storage',

    deps: {

      core: [ 'pure' ]

    }

  }, function() {

    return {

      init: function(deps) {
        return deps('core.pure')(function(sys) {
          return function(app) {
            return app.make(sys.get('utils'));
          }
        })(this);
      },

      make: function(utils) {
        var ts = self.now(), result;
        try {
          if (self.localStorage && self.localStorage.getItem) {
            self.localStorage.setItem('ls-test', ts);
            if (self.localStorage.getItem('ls-test') == ts) {
              result = utils.set('localStorage', self.localStorage);
            }
          }
          if (!result) {
            result = utils.set('localStorage', this.storage());
          }
        }catch(e) {
          result = utils.set('localStorage', this.storage());
        }
        return result;
      },

      storage: function() {
        return {
          getItem: function (sKey) {
            if (!sKey) { return null; }
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
          },
          setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
            var sExpires = "";
            if (vEnd) {
              switch (vEnd.constructor) {
                case Number:
                  sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                  break;
                case String:
                  sExpires = "; expires=" + vEnd;
                  break;
                case Date:
                  sExpires = "; expires=" + vEnd.toUTCString();
                  break;
              }
            }
            document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            return true;
          },
          removeItem: function (sKey, sPath, sDomain) {
            if (!this.hasItem(sKey)) { return false; }
            document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
            return true;
          },
          hasItem: function (sKey) {
            if (!sKey) { return false; }
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
          },
          keys: function () {
            var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
            return aKeys;
          }
        };
      }
    };

  });

});
