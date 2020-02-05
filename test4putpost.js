//現在の西暦と月を取得する。
var now   = new Date();
var year  = now.getFullYear();
var month = now.getMonth()+1;


var storeMonthlyRecordId = 0;




//ポスト用のレコード達を保存するJSON
var monthly_record4post  = {
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
};
var monthly_records4post = {
  "app": 84,
  "records": []
};
//プット用のレコード達を保存するJSON
var monthly_record4put   = {
  "id": 0,
  "record": {
    "今月問い合わせ数": {
      "value": 1009
    }
  }
};
var monthly_records4put  = {
  "app": 84,
  "records": []
};
//ゲット用のレコード達を保存するJSON
var query = "作成日時 = THIS_MONTH() or 作成日時 = LAST_MONTH()";
var monthly_records4get  = {
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
        return kintone.api(kintone.api.url('/k/v1/records', true), 'GET',  monthly_records4get);
      }).then(function(get_monthly_resp){






        //処理
        for (var i = 0; i < store_data.length; i++) {
          //この店舗の月間レコードは無いと仮定。
          var boolIsAlreadyExist = false;
          //monthly_record4putとmonthly_record4postをiの店に合うように変更。
          monthly_record4post["店舗名"]["value"] = store_data[i]["name"]["value"];


          for (var j = 0; j < get_monthly_resp["records"].length; j++) {


            if (get_monthly_resp["records"][j]["作成日時"]["value"].substr(0,7) == "2020-02" && get_monthly_resp["records"][j]["店舗名"]["value"] == store_data[i]["name"]["value"]) {
              boolIsAlreadyExist = true;
              monthly_record4put["id"] = Number(get_monthly_resp["records"][j]["レコード番号"]["value"]);
              break;
            }
          }

          if (boolIsAlreadyExist) {
            //更新用のJSONにPUS
            monthly_records4put["records"].push(monthly_record4put);
          }else {
            //作成用のJSONにPUSH
            monthly_records4post["records"].push(monthly_record4post);
          }
        }











        return kintone.api(kintone.api.url('/k/v1/records', true), 'PUT' , monthly_records4put);
      }).then(function(put_nippou_resp){
        return kintone.api(kintone.api.url('/k/v1/records', true), 'POST', monthly_records4post);
      }).then(function(post_nippou_resp){
        return event;
      });





    };
















    kintone.events.on('app.record.index.show', handler);

})();
