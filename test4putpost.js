
//ポスト用のレコード達を保存するJSON
var records4post = {
  "app": 84,
  "records": [
    {
      "西暦": {
        "value": 2020
      },
      "今月問い合わせ数": {
        "value": 999
      }
    },
  ]
};
//プット用のレコード達を保存するJSON
var records4put  = {
  "app": 84,
  "records": [
    {
      "id": 187,
      "record": {
        "今月問い合わせ数": {
          "value": 4321
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

(function() {
    "use strict";
    var boolIsAlreadyExist = false;
    var handler4get  = function(resp) {
      for (var i = 0; i < resp["records"].length; i++) {
        if (resp["records"][i]["作成日時"]["value"].substr(0,7) == "2020-02") {
          boolIsAlreadyExist = true;
          break;
        }
      }
    };
    var handler4post = function(resp) {
      if (boolIsAlreadyExist) alert("post");
    };
    var handler4put  = function(resp) {
      if (boolIsAlreadyExist) alert("put");
    };


    //ここで同期処理を行う。
    var handler = function(event) {
      kintone.api(kintone.api.url('/k/v1/records', true), 'GET',  records4get , handler4get , function(error) {});

      if (boolIsAlreadyExist) {
        kintone.api(kintone.api.url('/k/v1/records', true), 'PUT' , records4put , handler4put , function(error) {});
      }else {
        kintone.api(kintone.api.url('/k/v1/records', true), 'POST', records4post, handler4post, function(error) {});
      }
    };



    kintone.events.on('app.record.index.show', handler);

})();
