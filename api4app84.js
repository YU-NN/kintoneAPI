
(function() {
    "use strict";




    kintone.events.on('app.record.index.show', function(event) {






      //全店舗のIDと店舗名を取得するJSON
      var store_body = {
          "app": 57,
          "fields": ["id","name"]
      };
      kintone.api(kintone.api.url('/k/v1/records', true), 'GET', store_body, function(resp) {
          // success
          var records = resp["records"];
          var ans = "";
          for (var i = 0; i < records.length; i++) {
            ans += records[i]["name"]["value"];
          }
          alert(ans);
      }, function(error) {
          // error
          alert("error");
      });















    });


})();
