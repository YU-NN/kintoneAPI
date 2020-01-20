
(function() {
    "use strict";




    kintone.events.on('app.record.index.show', function(event) {

      //全店舗のIDと店舗名を取得するJSON
      var store_body = {
          "app": 57,
          "fields": ["id","name"]
      };

      var store_records = {};
      kintone.api(kintone.api.url('/k/v1/records', true), 'GET', store_body, function(store_resp) {
          // success
          store_records = store_resp["records"];







          var str = "店舗ID = "+ store_records[0]["id"]["value"];

          var nippou_body = {
            "app": 83,
            "fields": ["店舗ID","リード合計","来店数","販売台数"],
            "query": str
          };

          var nippou_records = {};
          kintone.api(kintone.api.url('/k/v1/records', true), 'GET', nippou_body, function(nippou_resp) {
              // success
              alert(nippou_resp["records"][0]["店舗ID"]["value"]);
          }, function(error) {
              // error
              alert("error");
          });







      }, function(error) {
          // error
          alert("error");
      });







    });


})();
