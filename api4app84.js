var new_record = {
  "店舗名": {
      "value": ""
  },
  "今月問い合わせ数": {
      "value": 0
  },
  "先月問い合わせ数": {
      "value": 0
  },
  "成約数合計": {
      "value": 0
  }
};
var new_records_body = {
    "app": 84,
    "records": []
};


(function() {
    "use strict";

    var handler = function(event) {
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
          var nippou_this_month_query = "作成日時 = THIS_MONTH() and 店舗ID = "+ store_records[0]["id"]["value"];
          //var nippou_this_month_query = "作成日時 = TODAY() and 店舗ID = "+ store_records[0]["id"]["value"];
          //日報アプリから、特定の店舗の"店舗ID","リード合計","来店数","販売台数”を取得するJSON
          //加えてやること：今月分のレコードを取得、先月分のレコードを取得
          var nippou_body = {
            "app": 83,
            "fields": ["店舗ID","店舗名","リード合計","来店数","販売台数"],
            "query": nippou_this_month_query
          };



          var nippou_records = {};
          kintone.api(kintone.api.url('/k/v1/records', true), 'GET', nippou_body, function(nippou_resp) {
              // success
              //この中でnippou_recordsのサイズ分のforループを回す。
              nippou_records = nippou_resp["records"];

              var lead_sum      = 0;
              var guest_sum     = 0;
              var saled_car_sum = 0;

              for (var i = 0; i < nippou_records.length; i++) {
                lead_sum      += Number(nippou_records[i]["リード合計"]["value"]);
                guest_sum     += Number(nippou_records[i]["来店数"]["value"]);
                saled_car_sum += Number(nippou_records[i]["販売台数"]["value"]);
                //alert(nippou_records[i]["店舗ID"]["value"] +":"+ nippou_records[i]["店舗名"]["value"] +"のリード合計："+ nippou_records[i]["リード合計"]["value"]);
              }

              //その店舗のレコードを登録する部分
              //登録するデータのJSON

              new_record["店舗名"]["value"]         = store_records[0]["name"]["value"]
              new_record["今月問い合わせ数"]["value"] = lead_sum
              new_record["先月問い合わせ数"]["value"] = 100
              new_record["成約数合計"]["value"]      = saled_car_sum

              new_records_body["records"].push(new_record);

            //登録
            kintone.api(kintone.api.url('/k/v1/records', true), 'POST', new_records_body, function(resp) {}, function(error) {});




          }, function(error) {});






      }, function(error) {});


    };

    kintone.events.on('app.record.index.show', handler);

})();
