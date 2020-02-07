(function() {
    "use strict";
    var body = {
        "app": 84,
        "ids": [],
    };
    for (var i = 1288; i < 1325; i++) {
      body["ids"].push(i);
    }

    var handler = async function(event) {
      //全店舗のIDと店舗名を取得するJSON
      await kintone.api(kintone.api.url('/k/v1/records', true), 'DELETE', body, function(resp) {}, function(error) {});
    };

    kintone.events.on('app.record.index.show', handler);

})();
