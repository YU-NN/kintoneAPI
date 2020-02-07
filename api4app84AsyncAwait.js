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
    "fields": ["レコード番号", "作成日時","店舗名","今月問い合わせ数","先月問い合わせ数","今月成約数合計","先月成約数合計","仮契約合計","当月着地予想","目標成約台数","ローン付帯値","成約率対問い合わせ数","成約数前月比"]
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

var thismonth_total_leadsum = 0;
var lastmonth_total_leadsum = 0;
var thismonth_total_carsum = 0;
var lastmonth_total_carsum = 0;



(function() {
  'use strict';
  var handler = async function(event) {

    //店舗情報と、月間報告レコードを取得
    var store_resp           = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', store_body);
    var monthly_records_resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', monthly_records_body);

    //店舗情報と、月間報告レコードから中身を取得
    var store_records   = store_resp["records"];
    var monthly_records = monthly_records_resp["records"];





    var monthly_sum_record4put   = {
      "id": 0,
      "record": {
        "今月問い合わせ数": {
          "value": 0
        },
        "先月問い合わせ数": {
          "value": 0
        },
        "今月成約数合計": {
          "value": 0
        },
        "先月成約数合計": {
          "value": 0
        },
        "成約率対問い合わせ数": {
          "value": 0
        },
        "成約数前月比": {
          "value": 0
        },
        "仮契約合計": {
          "value": 0
        },
        "当月着地予想": {
          "value": 0
        },
        "目標成約台数": {
          "value": 0
        },
        "ローン付帯値": {
          "value": 0
        },
      }
    };
    var monthly_sum_record4post  = {
      "西暦": {
        "value": year
      },
      "月": {
        "value": month
      },
      "店舗名":{
        "value": "合計"
      },
      "今月問い合わせ数": {
        "value": 0
      },
      "先月問い合わせ数": {
        "value": 0
      },
      "今月成約数合計": {
        "value": 0
      },
      "先月成約数合計": {
        "value": 0
      },
      "成約率対問い合わせ数": {
        "value": 0
      },
      "成約数前月比": {
        "value": 0
      },
      "仮契約数合計": {
        "value": 0
      },
      "当月着地予想": {
        "value": 0
      },
      "目標成約台数": {
        "value": 0
      },
      "ローン付帯値": {
        "value": 0
      },
    };
    var boolIsSumRowExist = false;
    for (var i = 0; i < monthly_records.length; i++) {
      if(monthly_records[i]["作成日時"]["value"].substr(0,7) == stryear_month && monthly_records[i]["店舗名"]["value"] == "合計"){
        boolIsSumRowExist = true;
        monthly_sum_record4put["id"] = Number(monthly_records[i]["レコード番号"]["value"]);
      }
    }
    if(boolIsSumRowExist) monthly_records4put["records"].push(monthly_sum_record4put);
    else monthly_records4post["records"].push(monthly_sum_record4post);










    for (var i = 0; i < store_records.length; i++)  {

      nippou_body["query"] = "作成日時 = LAST_MONTH() and 店舗ID = " + store_records[i]["id"]["value"];
      var lastmonth_nippou_resp    = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', nippou_body);
      var lastmonth_nippou_records = lastmonth_nippou_resp["records"];



      //この店舗の今月と先月の日報を取得
      nippou_body["query"] = "作成日時 = THIS_MONTH() and 店舗ID = " + store_records[i]["id"]["value"];
      var thismonth_nippou_resp    = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', nippou_body);
      var thismonth_nippou_records = thismonth_nippou_resp["records"];

      //リード合計の合計の変数
      var last_leadsum = 0;
      var this_leadsum = 0;
      //今月成約数合計の変数
      var last_carsum = 0;
      var this_carsum = 0;

      //先月のレコードを計算
      for (var j = 0; j < lastmonth_nippou_records.length; j++) {
        last_leadsum += Number(lastmonth_nippou_records[j]["リード合計"]["value"]);
        last_carsum  += Number(lastmonth_nippou_records[j]["販売台数"]["value"]);
      }
      //今月のレコードを計算
      for (var j = 0; j < thismonth_nippou_records.length; j++) {
        this_leadsum += Number(thismonth_nippou_records[j]["リード合計"]["value"]);
        this_carsum  += Number(thismonth_nippou_records[j]["販売台数"]["value"]);
      }

      //合計レコードに入れるための全店舗の合計を計算
      thismonth_total_leadsum += this_leadsum;
      lastmonth_total_leadsum += last_leadsum;
      thismonth_total_carsum  += this_carsum;
      lastmonth_total_carsum  += last_carsum;






      var monthly_record4put   = {
        "id": 0,
        "record": {
          "今月問い合わせ数": {
            "value": 0
          },
          "先月問い合わせ数": {
            "value": 0
          },
          "今月成約数合計": {
            "value": 0
          },
          "先月成約数合計": {
            "value": 0
          },
          "成約率対問い合わせ数": {
            "value": 0
          },
          "成約数前月比": {
            "value": 0
          },
          "仮契約合計": {
            "value": 0
          },
          "当月着地予想": {
            "value": 0
          },
          "目標成約台数": {
            "value": 0
          },
          "ローン付帯値": {
            "value": 0
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
          "value": 0
        },
        "先月問い合わせ数": {
          "value": 0
        },
        "今月成約数合計": {
          "value": 0
        },
        "先月成約数合計": {
          "value": 0
        },
        "成約率対問い合わせ数": {
          "value": 0
        },
        "成約数前月比": {
          "value": 0
        },
        "仮契約数合計": {
          "value": 0
        },
        "当月着地予想": {
          "value": 0
        },
        "目標成約台数": {
          "value": 0
        },
        "ローン付帯値": {
          "value": 0
        },
      };

      //問い合わせ数
      monthly_record4put["record"]["今月問い合わせ数"]["value"] = this_leadsum;
      monthly_record4put["record"]["先月問い合わせ数"]["value"] = last_leadsum;
      monthly_record4post["今月問い合わせ数"]["value"] = this_leadsum;
      monthly_record4post["先月問い合わせ数"]["value"] = last_leadsum;

      //成約数
      monthly_record4put["record"]["今月成約数合計"]["value"] = this_carsum;
      monthly_record4put["record"]["先月成約数合計"]["value"] = last_carsum;
      monthly_record4post["今月成約数合計"]["value"] = this_carsum;
      monthly_record4post["先月成約数合計"]["value"] = last_carsum;

      //成約率対問い合わせ数
      monthly_record4post["成約率対問い合わせ数"]["value"] = (this_carsum/this_leadsum)*100;
      monthly_record4put["record"]["成約率対問い合わせ数"]["value"] = (this_carsum/this_leadsum)*100;

      //成約数前月比
      monthly_record4post["成約数前月比"]["value"] = (this_carsum/last_carsum)*100;
      monthly_record4put["record"]["成約数前月比"]["value"] = (this_carsum/last_carsum)*100;

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

    //合計レコードに値を代入するが、すでに合計レコードがあった場合は、PUT用のところの値を更新、なかった場合は、POST用のところの値を更新する。
    if (boolIsSumRowExist) {
      monthly_records4put["records"][0]["record"]["今月問い合わせ数"]["value"]     = thismonth_total_leadsum;
      monthly_records4put["records"][0]["record"]["先月問い合わせ数"]["value"]     = lastmonth_total_leadsum;
      monthly_records4put["records"][0]["record"]["今月成約数合計"]["value"]     　= thismonth_total_carsum;
      monthly_records4put["records"][0]["record"]["先月成約数合計"]["value"]     　= lastmonth_total_carsum;
      monthly_records4put["records"][0]["record"]["成約率対問い合わせ数"]["value"] = (thismonth_total_carsum/thismonth_total_leadsum)*100;
      monthly_records4put["records"][0]["record"]["成約数前月比"]["value"]        = (thismonth_total_carsum/lastmonth_total_carsum)*100;
    }else{
      monthly_records4post["records"][0]["今月問い合わせ数"]["value"] = thismonth_total_leadsum;
      monthly_records4post["records"][0]["先月問い合わせ数"]["value"] = lastmonth_total_leadsum;
      monthly_records4post["records"][0]["今月成約数合計"]["value"] 　= thismonth_total_carsum;
      monthly_records4post["records"][0]["先月成約数合計"]["value"] 　= lastmonth_total_carsum;
    }


    alert(JSON.stringify(monthly_records4post));
    alert(JSON.stringify(monthly_records4put));

    await kintone.api(kintone.api.url('/k/v1/records', true), 'PUT' , monthly_records4put );
    await kintone.api(kintone.api.url('/k/v1/records', true), 'POST', monthly_records4post);





    return event;
  };

  kintone.events.on('app.record.index.show', handler);
})();
