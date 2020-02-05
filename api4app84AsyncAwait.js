//現在の西暦と月を取得する。
var now   = new Date();
var year  = now.getFullYear();
var month = now.getMonth()+1;
if(month < 10) var strmonth = "0"+String(month);
else var strmonth = String(month);
var stryear_month = String(year)+"-"+strmonth;


var store_body = {
    "app": 57,
    "fields": ["id","name"]
};
var query = "作成日時 = THIS_MONTH() or 作成日時 = LAST_MONTH()";
var monthly_records_body  = {
    "app": 84,
    "query": query,
    "fields": ["レコード番号", "作成日時", "今月問い合わせ数","店舗名"]
};

var monthly_records4put  = {
  "app": 84,
  "records": []
};
var monthly_records4post = {
  "app": 84,
  "records": []
};



(function() {
  'use strict';
  var handler = async function(event) {

    var store_resp           = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', store_body);
    var monthly_records_resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET',  monthly_records_body);

    var store_records   = store_resp["records"];
    var monthly_records = monthly_records_resp["records"];


    for (var i = 0; i < store_records.length; i++) {
      var monthly_record4put   = {
        "id": 159,
        "record": {
          "今月問い合わせ数": {
            "value": 1009
          }
        }
      };
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
          "value": ""
        }
      };
      //この店舗の月間レコードは無いと仮定。
      var boolIsAlreadyExist = false;
      for (var j = 0; j < monthly_records.length; j++) {
        //もしもすでに月間レコードがあったら、更新する処理を行う
        if (monthly_records[j]["作成日時"]["value"].substr(0,7) == stryear_month && monthly_records[j]["店舗名"]["value"] == store_records[i]["name"]["value"]) {
          boolIsAlreadyExist = true;
          monthly_record4put["id"] = Number(monthly_records[j]["レコード番号"]["value"]);
          //更新作業
        }
      }
      //すでにあったら、更新。そうでなければ作成
      if (boolIsAlreadyExist) {
        //更新用のJSONにPUSH
        monthly_records4put["records"].push(monthly_record4put);
      }else {
        //monthly_record4putとmonthly_record4postをiの店に合うように変更。
        monthly_record4post["店舗名"]["value"] = store_records[i]["name"]["value"];
        //作成用のJSONにPUSH
        monthly_records4post["records"].push(monthly_record4post);
      }
    }

    alert(JSON.stringify(monthly_records4post));

    await kintone.api(kintone.api.url('/k/v1/records', true), 'PUT' , monthly_records4put );
    await kintone.api(kintone.api.url('/k/v1/records', true), 'POST', monthly_records4post);


    return event;
  };



  kintone.events.on('app.record.index.show', handler);
})();
