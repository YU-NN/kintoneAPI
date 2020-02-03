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

//ポスト用のレコード達を保存するJSON
var records4post = {
  "app": 84,
  "records": []
};
//プット用のレコード達を保存するJSON
var records4put  = {
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

          //日報アプリから、今月分と先月分のレコードを取得
          var nippou_this_month_query = "作成日時 = THIS_MONTH() or 作成日時 = LAST_MONTH()";
          var nippou_body = {
            "app": 83,
            "fields": ["店舗ID","店舗名","リード合計","来店数","販売台数","作成日時"],
            "query": nippou_this_month_query
          };

          kintone.api(kintone.api.url('/k/v1/records', true), 'GET', nippou_body, function(nippou_resp) {
            for (var i = 0; i < store_resp["records"].length; i++) {
              store_resp["records"][i]
            }






          }, function(error) {});
      }, function(error) {});


    };

    kintone.events.on('app.record.index.show', handler);

})();
