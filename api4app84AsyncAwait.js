//日付関連の処理、変数準備
var now   = new Date();
var year  = now.getFullYear();
var month = now.getMonth()+1;
if(month < 10) var strmonth = "0"+String(month);
else var strmonth = String(month);
var stryear_month = String(year)+"-"+strmonth;

//店舗情報を取得するためのJSON
var store_body  = {
    "app": 57,
    "fields": ["id","name"]
};

//日報レコードを取得するためのJSON
var nippou_body = {
    "app": 83,
    "fields": ["店舗ID","リード合計","来店数","販売台数","作成日時"],
    "query": "",//for文の中で各店舗ごとのクエリを作成して挿入
};

//月間報告レコードを取得するためのクエリとJSON
var monthly_records_query = "作成日時 = THIS_MONTH() or 作成日時 = LAST_MONTH()";
var monthly_records_body  = {
    "app": 84,
    "query": monthly_records_query,
    "fields": ["レコード番号", "作成日時","店舗名","今月問い合わせ数","先月問い合わせ数","成約数合計","仮契約合計","当月着地予想","目標成約台数","ローン付帯値"]
};

//月間報告レコードのPUT用、POST用JSON
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

    //店舗情報と、月間報告レコードを取得
    var store_resp           = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', store_body);
    var monthly_records_resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET',  monthly_records_body);

    //店舗情報と、月間報告レコードから中身を取得
    var store_records   = store_resp["records"];
    var monthly_records = monthly_records_resp["records"];



    for (var i = 0; i < store_records.length; i++)  {



      //この店舗の今月と先月の日報を取得
      nippou_body["query"] = "作成日時 = THIS_MONTH() or 作成日時 = LAST_MONTH() and 店舗ID = " + store_records[i]["id"]["value"];
      var nippou_resp    = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', nippou_body);
      var nippou_records = nippou_resp["records"];
      //alert(store_records[i]["name"]["value"]+":"+JSON.stringify(nippou_records));

      //ある店舗の日報達の値の和などを一時保存しておくJSON
      var nippous4store_value = {
        "今月問い合わせ数":0,
        "先月問い合わせ数":0,
        "成約数合計":0,
        "仮契約合計":0,
        "当月着地予想":0,
        "目標成約台数":0,
        "ローン付帯値":0,
      };
      //この店舗の日報たちの値の和とかを取る。
      for (var j = 0; j < nippou_records.length; j++) {
        nippous4store_value["今月問い合わせ数"] += Number(nippou_records[j]["リード合計"]["value"]);
      }

      alert(store_records[i]["name"]["value"] + ":今月:" + nippous4store_value["今月問い合わせ数"]+"先月:"+ nippous4store_value["先月問い合わせ数"]);



      var monthly_record4put   = {
        "id": 0,
        "record": {
          "今月問い合わせ数": {
            "value": 1
          },
          "先月問い合わせ数": {
            "value": 1
          },
          "成約数合計": {
            "value": 1
          },
          "仮契約合計": {
            "value": 1
          },
          "当月着地予想": {
            "value": 1
          },
          "目標成約台数": {
            "value": 1
          },
          "ローン付帯値": {
            "value": 1
          },
        }
      };
      var monthly_record4post  = {
        "西暦": {
          "value": year
        },
        "月": {
          "value": month
        },
        "店舗名":{
          "value": ""
        },
        "今月問い合わせ数": {
          "value": 2
        },
        "先月問い合わせ数": {
          "value": 2
        },
        "成約数合計": {
          "value": 2
        },
        "仮契約数合計": {
          "value": 2
        },
        "当月着地予想": {
          "value": 2
        },
        "目標成約台数": {
          "value": 2
        },
        "ローン付帯値": {
          "value": 2
        },
      };

      //この店舗の月間レコードは無いと仮定。
      var boolIsAlreadyExist = false;
      for (var j = 0; j < monthly_records.length; j++)  {
        //もしもすでに月間レコードがあったら、更新する処理を行う
        if (monthly_records[j]["作成日時"]["value"].substr(0,7) == stryear_month && monthly_records[j]["店舗名"]["value"] == store_records[i]["name"]["value"]) {
          boolIsAlreadyExist = true;
          monthly_record4put["id"] = Number(monthly_records[j]["レコード番号"]["value"]);
          //更新作業
        }
      }


      //すでにあったら、更新。そうでなければ作成
      if (boolIsAlreadyExist) {
        monthly_records4put["records"].push(monthly_record4put);
      }else {
        //monthly_record4putとmonthly_record4postをiの店に合うように変更。
        monthly_record4post["店舗名"]["value"] = store_records[i]["name"]["value"];
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
