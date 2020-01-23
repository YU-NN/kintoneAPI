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
          //存在する店舗すべてを取得し、sotre_recordsに保存
          store_records = store_resp["records"];

          //日報アプリから、特定の店舗についてのレコードを取得するクエリ(今回はstore_recordsの一番最初の店舗についてのレコードを取得)
          //ここについてfor文で回す。
          var nippou_query = "店舗ID = "+ store_records[0]["id"]["value"];
          //日報アプリから、特定の店舗の"店舗ID","リード合計","来店数","販売台数”を取得するJSON
          var nippou_body = {
            "app": 83,
            "fields": ["店舗ID","店舗名","リード合計","来店数","販売台数"],
            "query": nippou_query
          };



          var nippou_records = {};
          kintone.api(kintone.api.url('/k/v1/records', true), 'GET', nippou_body, function(nippou_resp) {
              // success
              nippou_records = nippou_resp["records"];
              alert(nippou_records[0]["店舗ID"]["value"] +":"+ nippou_records[0]["店舗名"]["value"] +"のリード合計："+ nippou_records[0]["リード合計"]["value"]);
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
