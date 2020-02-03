//現在の西暦と月を取得する。
var now   = new Date();
var year  = now.getFullYear();
var month = now.getMonth()+1;

var boolIsAlreadyExist = false;
var storeMonthlyRecordId = 0;

//ポスト用のレコード達を保存するJSON
var records4post = {
  "app": 84,
  "records": [
    {
      "西暦": {
        "value": year
      },
      "月": {
        "value": month
      },
      "今月問い合わせ数": {
        "value": 999
      },
      "店舗名":{
        "value": "杉並"
      }
    },
  ]
};
//プット用のレコード達を保存するJSON
var records4put  = {
  "app": 84,
  "records": [
    {
      "id": 0,
      "record": {
        "今月問い合わせ数": {
          "value": 1009
        }
      }
    },
  ]
};
//ゲット用のレコード達を保存するJSON
var query = "作成日時 = THIS_MONTH() or 作成日時 = LAST_MONTH()";
var records4get  = {
    "app": 84,
    "query": query,
    "fields": ["レコード番号", "作成日時", "今月問い合わせ数","店舗名"]
};

var store_body = {
    "app": 57,
    "fields": ["id","name"]
};
var store_data = {};




(function() {
    "use strict";







    //ここで同期処理を行う。
    var handler = function(event) {

      return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', store_body).then(function(get_store_resp){
        store_data = get_store_resp["records"];
        return kintone.api(kintone.api.url('/k/v1/records', true), 'GET',  records4get);
      }).then(function(get_nippou_resp){
        //処理
        for (var i = 0; i < get_nippou_resp["records"].length; i++) {
          if (get_nippou_resp["records"][i]["作成日時"]["value"].substr(0,7) == "2020-02" && get_nippou_resp["records"][i]["店舗名"]["value"] == "杉並") {
            boolIsAlreadyExist = true;
            records4put["records"][0]["id"] = Number(get_nippou_resp["records"][i]["レコード番号"]["value"]);
            break;
          }
        }

        if (boolIsAlreadyExist) {
          return kintone.api(kintone.api.url('/k/v1/records', true), 'PUT' , records4put).then(function(put_nippou_resp){
            return event;
          });
        } else {
          return kintone.api(kintone.api.url('/k/v1/records', true), 'POST', records4post).then(function(post_nippou_resp){
            return event;
          });
        }
      });
    };
















    kintone.events.on('app.record.index.show', handler);

})();
