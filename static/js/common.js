// コンテンツの表示・非表示切替 
$("#toggle-btn-con").click(function() {
  $("#con-field").toggle();
});

const settingDbParam = () => {
  document.getElementById("host").value = document.getElementById('hostText').value;
  document.getElementById("port").value = document.getElementById('portText').value;
  document.getElementById("db").value = document.getElementById('dbText').value;
  document.getElementById("user").value = document.getElementById('userText').value;
  document.getElementById("password").value = document.getElementById('passwordText').value;
}


const resetSelectElements = (option_delete_flg_1, option_delete_flg_2) => {

  if (option_delete_flg_1){
    $('#schema-select option').not('.front-title').remove();
  }

  if (option_delete_flg_2){
    // 結合条件選択リストの値を削除
    $('[id^=col1-select-] option').not('.front-title').remove();
    $('[id^=col2-select-] option').not('.front-title').remove();
    // 項目選択リストの値を削除
    $('[id^=collist] option').remove();
    // 条件項目選択DDの値を削除
    $('.where-cdnitem option').not('.front-title').remove();
    // ソート条件削除
    $('#sort-item option').not('.front-title').remove();
  }

  // 条件ボックス内初期化
  var cdnDispElement = document.querySelectorAll('[id^="additional-cdn-content-"]');
   
  for (var i = 1; i <= cdnDispElement.length; i++){
    // 比較演算子リセット
    document.getElementById('cdn-compairs-' + i + '').options[0].selected = true;
    // ラジオボタンをチェック状態にする
    document.getElementById('compair-radio-' + i + '').checked = true;
    // 曖昧検索の方法のチェックを解除する
    document.getElementById('forward-' + i + '').checked = false;
    document.getElementById('backward-' + i + '').checked = false;
    document.getElementById('partof-' + i + '').checked = false;
    // DDの項目と比較する値を削除
    $('#cdn-values-'+ i).remove();
    // カレンダー日付の自動ボタンが表示されている場合削除
    $('#auto-btn-field-'+ i).remove();
    // 値のテキストボックスを初期化して復活
    $('#val-'+ i).append($('<input id="cdn-values-'+ i +'" class="cdnvalues">').attr('placeholder', '値を入力してください').attr('type', 'text'));
  }  
  
  // ソート方法リセット
  document.getElementById('sort-method').options[0].selected = true;
  // 取得上限リセット
  document.getElementById('limitText').value = '';
  // 開始取得位置リセット
  document.getElementById('offsetText').value = '';
}


// 参照obj：「nspname」「obj_description」
var setSchemaJsonVal =  null
// DB接続関数
$(function () {
  $('#con-button').click(function () {
    // 入力情報を取り直し
    settingDbParam()

    $.ajax({
        data : {
          host: document.getElementById('host').value,
          port: document.getElementById('port').value,
          db: document.getElementById('db').value,
          user: document.getElementById('user').value,
          password: document.getElementById('password').value,
        },
        type : 'GET',
        url : '/db_con',
        dataType: 'json',
        success: function(data){
          // JSON文字列をJSONオブジェクトに変換
          const json_data = JSON.parse(data);
          // データ参照用にセット
          setSchemaJsonVal = json_data;
          if('message' in json_data){
            alert(json_data.message);
          }else{
            alert('接続成功')
            
            // 条件に設定した情報をリセット
            resetSelectElements(true, true);

            if ($('#logical-name-cols').prop('checked')){
              for (var i = 0; i < json_data.schema.length; i++) {
                json_data.schema[i].obj_description != null ? disp_name = json_data.schema[i].obj_description : disp_name = json_data.schema[i].nspname;
                $('#schema-select').append($('<option>').text(disp_name).attr({'value': json_data.schema[i].nspname , 'logical-scm-name':json_data.schema[i].obj_description}));
              }
            }
            else{
              for (var i = 0; i < json_data.schema.length; i++) {
                $('#schema-select').append($('<option>').text(json_data.schema[i].nspname).attr({'value': json_data.schema[i].nspname , 'logical-scm-name':json_data.schema[i].obj_description}));
              }
            }
          }
        },
        error: function() {
          alert("request failed");
        }
    })
  });
});



// テーブル名選択監視
var beforeTableValues = new Array();
// 表示テーブル監視（論理コメント取得）
var setTableJsonVal = null;
// スキーマ選択イベント➡テーブル１表示
$(document).ready(function(){
  $('[name=schemas]').on('change', function(){

    // スキーマ取得
    var schema_val = $(this).val();
    
    $.ajax({
        data : {
          schema: schema_val,
          host: document.getElementById('host').value,
          port: document.getElementById('port').value,
          db: document.getElementById('db').value,
          user: document.getElementById('user').value,
          password: document.getElementById('password').value,
        },
        type : 'GET',
        url : '/tables_disp',
        dataType: 'json',
        success: function(data){
          const json_data = JSON.parse(data);
          // 結合のために表示されているテーブルの数を知りたい
          let li_count = $("#table-add-list .tables").length;
          
          // 参照用にテーブルデータをセットする
          setTableJsonVal = json_data;
          // 参照用のカラムデータをリセットする
          setColumnJsonArry.length = 0;
      
          if('message' in json_data){
            alert(json_data.message);
          }else{
            alert('テーブル取得成功');

            // テーブル名がリセットされるので、常時監視用のデータもリセットする
            beforeTableValues.length = 0;

            // 条件に設定した情報をリセット
            resetSelectElements(false, true);

            for (let i = 1; i <= li_count; i++) {
              // 表示されたテーブルの数に合わせて、nullを詰める
              beforeTableValues.push('null');

              // テーブル名プルダウンリストのタイトル以外のオプション要素を削除する            
              $('#table-select-' + i + ' option').not('.front-title').remove();
              // スキーマ内のテーブル名をプルダウンに追加
              if ($('#logical-name-cols').prop('checked')){
                // 論理名チェックがある場合
                for (var j = 0; j < json_data.table.length; j++) {
                  json_data.table[j].table_comment != null ? disp_name = json_data.table[j].table_comment : disp_name = json_data.table[j].table_name;
                  $('#table-select-' + i).append($('<option>').text(disp_name).attr({'value': json_data.table[j].table_name , 'logical-tb-name':json_data.table[j].table_comment}));                
                }
              }
              else{
                // 論理名チェックがない場合
                for (var j = 0; j < json_data.table.length; j++) {
                  $('#table-select-' + i).append($('<option>').text(json_data.table[j].table_name).attr({'value': json_data.table[j].table_name, 'logical-tb-name':json_data.table[j].table_comment}));
                }
              }            
            }         
          }
        },
        error: function() {
          alert("request failed");
        }
      })
  })
})




// 結合配列
const catArry = ['内部結合' , '左結合' , '右結合' , '完全結合'];
// 論理演算子配列
const logiArry = ['AND' , 'OR'];
// 比較演算子配列
const compairArry = ['<' , '>' , '=>' , '<=' , '==' , '!='];

// 論理演算子配列
const sortArry = ['昇順' , '降順'];


// 「検索条件」初期設定
$(function () {
  $.each(logiArry, function(index, val) {
    $('.where-logi').append($('<option>').text(val).attr('value', val));
  })

  $.each(compairArry, function(index, val) {
    $('.where-compair').append($('<option>').text(val).attr('value', val));
  })

  $.each(sortArry, function(index, val) {
    $('.where-sort').append($('<option>').text(val).attr('value', val));
  })
})



// var countChkArry = [...Array(4)];
var countChkArry = new Array();


const removeConNode = (button) => {
  var grandparent = button.parentNode.parentNode;
  // ノード番号を取得
  var del_con_nun = parseInt(grandparent.id.replace(/[^0-9]/g, ""));
  let item_index = countChkArry.indexOf(del_con_nun)
  if (item_index > -1) {
    // 要素番号を0で埋める
    countChkArry[item_index] = 0;
  }
  grandparent.remove();
}


// テーブル追加（結合追加）関数
const setNumbers = [1,2,3,4,5];

$(function () {
  $('#add-table-btn').click(function () {

    // スキーマ選択チェックチェック
    var selectedVal = document.getElementById("schema-select").value;
    if (selectedVal == 'null'){
      return alert('スキーマを選択して下さい。');
    }

    var conTableElements = document.getElementsByClassName('table-list');
    var add_table_length = conTableElements.length;

    // 結合テーブル上限より表示されていないかチェックする
    if (5 <= add_table_length) {
      return alert('結合数が最大です。');
    }
    
    // 配列に結合テーブルの番号を格納する
    for (var i = 0; i < conTableElements.length; i++){
      // 配列に追加されていない場合
      if (countChkArry.includes(parseInt(conTableElements[i].id.replace(/[^0-9]/g, ""))) === false){
        // 0番目から番号順に並べたかった
        countChkArry[conTableElements[i].id.replace(/[^0-9]/g, "") - 1] = parseInt(conTableElements[i].id.replace(/[^0-9]/g, ""));
      }
    }
    
    // ループ停止フラグ
    var break_flg = 1;
    var i_table_number = 0;
    for (var i = 0; i < setNumbers.length; i++){
      for (var j = 0;j < countChkArry.length; j++){
        if (setNumbers[i] == countChkArry[j]){
          break_flg = 0;
        }
      }
      // フラグが１のままだったら
      if (break_flg == 1){
        // 使用する番号をセット
        i_table_number = setNumbers[i];
        break;
      }
      // フラグをリセット
      break_flg = 1;
    }

    // i_table_numberよりも小さい番号の要素がappendされている場合は下に追加
    var smallerArray = new Array();
    for (var i = 0; i < countChkArry.length; i++){
      if (countChkArry[i] < i_table_number){
        smallerArray.push(countChkArry[i]);
      }
    }
    // 最も大きい値を取り出す
    var afterAppendNum = Math.max(...smallerArray);

    // これから結合するテーブルの番号を追加
    countChkArry[i_table_number -1] = i_table_number;

    var schemaOption = document.getElementById('schema-select');

    // 選択されているテーブル1の要素を取得
    var selectElement = document.getElementById('table-select-1');

    // テーブル選択監視用（未選択なので、nullセット）
    beforeTableValues.push('null');

    $.ajax({
          data : {
            schema: schemaOption.value,
            host: document.getElementById('host').value,
            port: document.getElementById('port').value,
            db: document.getElementById('db').value,
            user: document.getElementById('user').value,
            password: document.getElementById('password').value,
          },
          type : 'GET',
          url : '/tables_disp',
          dataType: 'json',
          success: function(data){
            // テーブル一覧取得
            var json_data = JSON.parse(data);
            // 参照用テーブルリストにデータを追加
            setTableJsonVal = json_data;

            if('message' in json_data){
              alert(json_data.message);
            }else{
              
              var logical_table_name = null;
            
              // テーブルの論理名をチェック（テーブル1の論理名表示用）
              for (var index = 0; index < setTableJsonVal.table.length; index++){
                if (selectElement.value == setTableJsonVal.table[index].table_name){
                  if(setTableJsonVal.table[index].table_comment != null){
                    logical_table_name = setTableJsonVal.table[index].table_comment;
                    table_disp_name = setTableJsonVal.table[index].table_comment;
                  }else{
                    table_disp_name = setTableJsonVal.table[index].table_name;
                  }
                }
              }
              
              // $('#table-add-list').append('<li id=talbe-cdn-block-' + i_table_number + ' class="table-list"></li>');

              $('#talbe-cdn-block-'+ afterAppendNum).after('<li id=talbe-cdn-block-' + i_table_number + ' class="table-list"></li>');

              // 結合条件ボタン
              $('#talbe-cdn-block-'+ i_table_number).append('<div><button class=table-cdn-btn name=table-add-btn' + i_table_number +' onClick="ckAddCdnBtn('+ i_table_number +')">結合条件追加</button></div>');
              // // 結合方法
              $('#talbe-cdn-block-'+ i_table_number).append('<div class="cat-select-field"><span class="cat-label">結合方式：</span><select id=cat-select-' + i_table_number +' class=cats></select></div>');  
              $.each(catArry, function() {
                $('#cat-select-' + i_table_number).append($('<option>').text(this).attr('value', this));
              })
              // テーブル名
              $('#talbe-cdn-block-'+ i_table_number).append('<div class="cat-select-field"><span class="cat-label">結合先テーブル：</span><select id=table-select-' + i_table_number +' class=tables onchange="tbValChange(' + i_table_number + ')"></select><button class="con-tb-remove" onclick="removeConNode(this)"><img src="./static/img/x-circle.svg" style="vertical-align: middle"></button></div>');  
              $('#table-select-' + i_table_number).append($('<option class="front-title">').text('テーブル' + i_table_number).attr('value', 'null'));
              var logical_table_name = null;
              // テーブルの論理名をチェック
              for (var index = 0; index < setTableJsonVal.table.length; index++){
                // テーブル1の論理名表示用
                if (selectElement.value == setTableJsonVal.table[index].table_name){
                  if(setTableJsonVal.table[index].table_comment != null){
                    logical_table_name = setTableJsonVal.table[index].table_comment;
                    table_disp_name = setTableJsonVal.table[index].table_comment;
                  }else{
                    table_disp_name = setTableJsonVal.table[index].table_name;
                  }
                }     
                // 論理名チェックがある場合
                if ($('#logical-name-cols').prop('checked')){
                    setTableJsonVal.table[index].table_comment != null ? disp_name = setTableJsonVal.table[index].table_comment : disp_name = setTableJsonVal.table[index].table_name;
                    $('#table-select-' + i_table_number).append($('<option>').text(disp_name).attr('value', setTableJsonVal.table[index].table_name));
                }
                // 論理名チェックがない場合
                else{
                    $('#table-select-' + i_table_number).append($('<option>').text(setTableJsonVal.table[index].table_name).attr('value', setTableJsonVal.table[index].table_name));
                }
              }              

              $('#talbe-cdn-block-'+ i_table_number).append('<div id="additional-block-'+ i_table_number + '-1" class="additional-cat"></div>');

              $('#additional-block-'+ i_table_number + '-1').append('<div>結合条件式</div>');
              
              // 結合する項目１（左）
              $('#additional-block-'+ i_table_number + '-1').append('<div class="cat-select-cols"><select id=col1-select-' + i_table_number +'-1 class=col1s></select></div>');
              // テーブル名が選択されている場合
              $('#col1-select-' + i_table_number + '-1').append($('<option class="front-title">').text('テーブル名.項目名').attr('value', 'null'));
              if(selectElement.value != 'null'){
                // カラム論理名チェック
                for (var i = 0; i < setColumnJsonArry[0].column.length; i++){
                  // 属性用の論理名変数を初期化
                  var logical_column_name = null;

                  if (setColumnJsonArry[0].column[i].description != null){
                    column_disp_name = setColumnJsonArry[0].column[i].description;
                    logical_column_name = setColumnJsonArry[0].column[i].description;
                  }else{
                    column_disp_name = setColumnJsonArry[0].column[i].column_name;
                  }
                  // テーブル1の項目を結合する項目1に設定
                  if ($('#logical-name-cols').prop('checked')){
                    $('#col1-select-' + i_table_number + '-1').append($('<option>').text(table_disp_name + '.' + column_disp_name).attr({'value': setColumnJsonArry[0].column[i].column_name,'tb-name' : selectElement.value,'logical-tb-name':logical_table_name,'logical-col-name':logical_column_name,'full-name':selectElement.value + '.' + setColumnJsonArry[0].column[i].column_name}));
                  }else{
                    $('#col1-select-' + i_table_number + '-1').append($('<option>').text(selectElement.value + '.' + setColumnJsonArry[0].column[i].column_name).attr({'value': setColumnJsonArry[0].column[i].column_name,'tb-name' : selectElement.value,'logical-tb-name':logical_table_name,'logical-col-name':logical_column_name,'full-name':selectElement.value + '.' + setColumnJsonArry[0].column[i].column_name}));
                  }
                }
              }
                // 比較演算子
              $('#additional-block-'+ i_table_number + '-1').append('<div class="cat-select-cols"><select id=compair-select-' + i_table_number +'-1 class=compairs></select></div>');  
              $.each(compairArry, function() {
                $('#compair-select-' + i_table_number + '-1').append($('<option>').text(this).attr('value', this));
              })
              
              // 結合する項目２
              $('#additional-block-'+ i_table_number + '-1').append('<div class="cat-select-cols"><select id=col2-select-' + i_table_number +'-1 class=col2s></select></div>');
              $('#col2-select-' + i_table_number + '-1').append($('<option class="front-title">').text('テーブル名.項目名').attr('value', 'null'));
            }

// 試し
            $('#additional-block-'+ i_table_number + '-1').append('<div class="cat-select-field"><select id=logi-select-' + i_table_number  + '-1 class=logis></select></div><br>');  
            
            $.each(logiArry, function() {
              $('#logi-select-' + i_table_number  + '-1').append($('<option>').text(this).attr('value', this));
            })




          },
          error: function() {
            alert("request failed");
          }
    })
  });
});

// こっちを使うかも
var setColumnJsonArry = new Array(); 

var setColumnJsonVal = null; 

// テーブル名選択➡項目名表示
function tbValChange(number){

  // テーブルセレクトボックスの要素を取得
  var selectElement = document.getElementById('table-select-'+ number);

  $.ajax({
      data : {
        table: selectElement.value,
        host: document.getElementById('host').value,
        port: document.getElementById('port').value,
        db: document.getElementById('db').value,
        user: document.getElementById('user').value,
        password: document.getElementById('password').value,
      },
      type : 'GET',
      url : '/columns_disp',
      dataType: 'json',
      success: function(data){

        // JSON文字列をJSONオブジェクトに変換
        const json_data = JSON.parse(data);
        // 参照用にデータをセット（削除するかも）
        setColumnJsonVal = json_data;
        // 選択されているテーブルごとにカラム名は切り替わるので
        setColumnJsonArry[number -1] = json_data;

        // APIサーバー側でエラーが発生した場合はエラーメッセージを表示
        if('message' in json_data){
          alert(json_data.message);
        }else{

          // 条件に設定した情報をリセット
          resetSelectElements(false, false);

          // 前回使用した値
          var alteredVal = beforeTableValues[number -1];

          var totalTableNames = document.getElementById('collist1');
          for (var i = 0; i < totalTableNames.length; i++){
            if (totalTableNames[i].getAttribute('tb-name') == selectElement.value){
              alert('既に選択されたテーブル名です。')
              // 元の値に戻す
              selectElement.value = alteredVal;
              return
            }
          }

          //*** 各種重複を削除する処理 ***/
          if(alteredVal != 'null'){
            // alertedValの値のテーブルの項目を項目選択リストから削除する
            $('#collist1 [tb-name=' + alteredVal + ']').remove();
            $('#collist2 [tb-name=' + alteredVal + ']').remove();
            // 検索条件削除
            $('[id^=cdn-items-] [tb-name=' + alteredVal + ']').remove();
            // ソート条件削除
            $('#sort-item [tb-name=' + alteredVal + ']').remove();
          }

          // 結合する項目が切り替わるので、リスト内を全て削除する
          if(number == 1){
            // 結合項目リスト用（左側）
            $('[id^=col1-select-] option').not('.front-title').remove()
          }else{
            // 結合項目リスト用（右側）
            $('[id^=col2-select-' + number + '] option').not('.front-title').remove()
          }

          // 監視配列に選択された値を追加（nullから置き換える）
          beforeTableValues[number -1] = selectElement.value;          


          //*** 論理名を表示またプロパティに設定する ***/
          var logical_table_name = null;
            
          // テーブルの論理名をチェック（テーブルの論理名表示用）
          for (var index = 0; index < setTableJsonVal.table.length; index++){
            if (selectElement.value == setTableJsonVal.table[index].table_name){
              if(setTableJsonVal.table[index].table_comment != null){
                logical_table_name = setTableJsonVal.table[index].table_comment;
                table_disp_name = setTableJsonVal.table[index].table_comment;
              }else{
                table_disp_name = setTableJsonVal.table[index].table_name;
              }
            }
          }

          for (var i = 0; i < json_data.column.length; i++) {
            
            var logical_column_name = null;

            // カラム論理名チェック
            if (json_data.column[i].description != null){
              column_disp_name = json_data.column[i].description;
              logical_column_name = json_data.column[i].description;
            }else{
              column_disp_name = json_data.column[i].column_name;
            }

            if(number == 1){
              // JOINプルダウンリスト用
              if ($('#logical-name-cols').prop('checked')){  
                $('[id^=col1-select-]').append($('<option>').text(table_disp_name + '.' + column_disp_name).attr({'value':json_data.column[i].column_name,'tb-name':selectElement.value,'logical-tb-name':logical_table_name,'logical-col-name':logical_column_name,'full-name':selectElement.value + '.' + json_data.column[i].column_name}));
              }else{                
                $('[id^=col1-select-]').append($('<option>').text(selectElement.value + '.' + json_data.column[i].column_name).attr({'value':json_data.column[i].column_name,'tb-name':selectElement.value,'logical-tb-name':logical_table_name,'logical-col-name':logical_column_name,'full-name':selectElement.value + '.' + json_data.column[i].column_name}));
              }
            }else{  
              // JOINプルダウンリスト用
              if ($('#logical-name-cols').prop('checked')){                
                $('[id^=col2-select-' + number + ']').append($('<option>').text(table_disp_name + '.' + column_disp_name).attr({'value':json_data.column[i].column_name,'tb-name':selectElement.value,'logical-tb-name':logical_table_name,'logical-col-name':logical_column_name,'full-name':selectElement.value + '.' + json_data.column[i].column_name}));
              }else{              
                $('[id^=col2-select-' + number + ']').append($('<option>').text(selectElement.value + '.' + json_data.column[i].column_name).attr({'value':json_data.column[i].column_name,'tb-name':selectElement.value,'logical-tb-name':logical_table_name,'logical-col-name':logical_column_name,'full-name':selectElement.value + '.' + json_data.column[i].column_name}));              
              }
            }   
            if ($('#logical-name-cols').prop('checked')){
              // 項目選択リスト用              
              $('#collist1').append($('<option ondblclick="renameModalFunc()">').text(table_disp_name + '.' + column_disp_name).attr({'name':json_data.column[i].column_name,'value':json_data.column[i].column_name,'tb-name':selectElement.value,'logical-tb-name':logical_table_name,'logical-col-name':logical_column_name,'full-name':selectElement.value + '.' + json_data.column[i].column_name, 'data-type':json_data.column[i].data_type}));
              // 条件選択リスト用              
              $('[id^=cdn-items-]').append($('<option>').text(table_disp_name + '.' + column_disp_name).attr({'data-type':json_data.column[i].data_type,'name':json_data.column[i].column_name,'value':json_data.column[i].column_name,'tb-name':selectElement.value,'logical-tb-name':logical_table_name,'logical-col-name':logical_column_name,'full-name':selectElement.value + '.' + json_data.column[i].column_name}));
            
              // ソート条件              
              $('#sort-item').append($('<option>').text(table_disp_name + '.' + column_disp_name).attr({'full-name': selectElement.value + '.' + json_data.column[i].column_name,'name':json_data.column[i].column_name,'value':json_data.column[i].column_name,'tb-name':selectElement.value,'logical-tb-name':logical_table_name,'logical-col-name':logical_column_name,'full-name':selectElement.value + '.' + json_data.column[i].column_name}));
            
            }else{
              // 項目選択リスト用              
              $('#collist1').append($('<option ondblclick="renameModalFunc()">').text(selectElement.value + '.' + json_data.column[i].column_name).attr({'full-name': selectElement.value + '.' + json_data.column[i].column_name,'name':json_data.column[i].column_name,'value':json_data.column[i].column_name,'tb-name':selectElement.value,'logical-tb-name':logical_table_name,'logical-col-name':logical_column_name,'full-name':selectElement.value + '.' + json_data.column[i].column_name, 'data-type':json_data.column[i].data_type}));
              // 条件選択リスト用              
              $('[id^=cdn-items-]').append($('<option>').text(selectElement.value + '.' + json_data.column[i].column_name).attr({'data-type':json_data.column[i].data_type,'full-name': selectElement.value + '.' + json_data.column[i].column_name,'name':json_data.column[i].column_name,'value':json_data.column[i].column_name,'tb-name':selectElement.value,'logical-tb-name':logical_table_name,'logical-col-name':logical_column_name,'full-name':selectElement.value + '.' + json_data.column[i].column_name}));
              
              // ソート条件              
              $('#sort-item').append($('<option>').text(selectElement.value + '.' + json_data.column[i].column_name).attr({'full-name': selectElement.value + '.' + json_data.column[i].column_name,'name':json_data.column[i].column_name,'value':json_data.column[i].column_name,'tb-name':selectElement.value,'logical-tb-name':logical_table_name,'logical-col-name':logical_column_name,'full-name':selectElement.value + '.' + json_data.column[i].column_name}));
            
            }
          };
        }          
      },
      error: function() {
        alert("request failed");
      }
          
  })
}



//  LIKE検索のチェックボックス変更検知
function likeMethodChange(element){

  var checkedElementId = element.id;
  // チェックボックス要素に振られているID属性のNoだけが知りたい
  var chkIdNumber = parseInt(checkedElementId.replace(/[^0-9]/g, ""));

  // 一旦、全てチェックを解除する
  $('[name=likes-'+ chkIdNumber +']').prop('checked', false);

  // 比較演算子をnullに戻す
  var parentElement = document.querySelector('[name=likes-'+ chkIdNumber +']').parentElement;
  var id = parentElement.id;
  var idNumber = parseInt(id.replace(/[^0-9]/g, ""));
  var selectElement = document.getElementById('cdn-compairs-' + idNumber +'')
  selectElement.selectedIndex = 0;
  // 曖昧検索が指定されているので、null→LIKEに変更
  selectElement.options[0].value = 'LIKE';

  // 選択されているIDのチェックボックスだけチェック状態に戻す
  document.getElementById(''+ checkedElementId +'').checked = true;

}


// WHERE句の比較演算子を変更した際のリセット処理
function compairValChange(number){
  var thisSelectVal = document.getElementById('cdn-compairs-' + number + '').value;
  if (thisSelectVal != 'null'){
    // チェックボックスを全て取得する
    var likesSelectElement = document.querySelectorAll('#cdn-likes-'+ number + ' [name=likes]');
    // 取得したチェックボックスのチェックを解除する
    for (var i = 0; i < likesSelectElement.length; i++){
      likesSelectElement[i].checked = false;
    }
  }
}

function radioCdnChange(number){
  // ラジオボタンの要素を取得して、チェックされている方がどちらか調べたい
  var likeRadioElement = document.getElementById('like-radio-' + number + '');
   
  var likeMethodElements = document.querySelectorAll('[name=likes-'+ number +']');

  if (likeRadioElement.checked){
    // 比較する値の型が数値型の場合は不正なクリにになるのでチェックを元に戻す
    if ($('#cdn-values-'+ number).prop('type') == 'number'){
      alert('数値型を曖昧検索で使用することは出来ません。')
      document.getElementById('compair-radio-' + number + '').checked = true;
    }
  }
  
  for (var i = 0; i < likeMethodElements.length; i++){
    if (likeRadioElement.checked){
      // LIKE演算子ラジオボタンがチェックされた場合チェックボックス有効化
      likeMethodElements[i].disabled = false;
      
    }else{
      // LIKE演算子ラジオボタンが解除された場合チェックボックス無効化
      likeMethodElements[i].disabled = true;
    }
  }
}

// 論理名で表示する関数
const logicalChangeFunc = (check) =>{

  var selectSchemaElement = document.getElementById('schema-select');
  var selectTableElements = document.getElementsByClassName('tables');
  var cols1TableJoinElements = document.querySelectorAll('[id^=col1-select-]');
  var cols2TableJoinElements = document.querySelectorAll('[id^=col2-select-]');
  var selectElement1 = document.getElementById('collist1');
  var selectElement2 = document.getElementById('collist2');
  var cdnItemElements = document.getElementsByClassName('where-cdnitem');
  var sortItemElement = document.getElementById('sort-item');

  var typeCheckElement = document.getElementById(`item-type`);

  if (check){

    // DB接続までが実行されているかチェックする
    if (selectSchemaElement.length > 0){
      var selectSchemaElement = document.getElementById('schema-select');
      // 見出しの長さは含めない為、-1する必要がある
      for(var i = 0; i < selectSchemaElement.length; i++){
        if (selectSchemaElement[i].value != 'null'){    
          // 論理コメントが存在する場合は差し替える
          selectSchemaElement[i].getAttribute('logical-scm-name') != null ? schema_name = selectSchemaElement[i].getAttribute('logical-scm-name') : schema_name = selectSchemaElement[i].value;          
          selectSchemaElement[i].innerText = schema_name;
        }
      }
    }

    // スキーマ選択までが実行されているかチェックする
    if (selectTableElements[0].length > 0){
      for (var i = 0; i < selectTableElements.length; i++){
        for (var j = 0; j < selectTableElements[i].length; j++){
          if (selectTableElements[i][j].value != 'null'){
            // 論理コメントが存在する場合
            selectTableElements[i][j].getAttribute('logical-tb-name') != null ? table_name = selectTableElements[i][j].getAttribute('logical-tb-name') : table_name = selectTableElements[i][j].value; 
            selectTableElements[i][j].innerText = table_name;          
          }
        }
      }
    }   

    // テーブル選択までが実行されているかチェックする
    if (setColumnJsonArry != null){
      for (var i = 0; i < cols1TableJoinElements.length; i++){
        for (var j = 0; j < cols1TableJoinElements[i].length; j++){
          if (cols1TableJoinElements[i][j].value != 'null'){
            // 論理テーブル名をチェックする
            cols1TableJoinElements[i][j].getAttribute('logical-tb-name') != null ? table_name = cols1TableJoinElements[i][j].getAttribute('logical-tb-name') : table_name = cols1TableJoinElements[i][j].getAttribute('tb-name');
            // 論理カラム名をチェックする
            cols1TableJoinElements[i][j].getAttribute('logical-col-name') != null ? column_name = cols1TableJoinElements[i][j].getAttribute('logical-col-name') : column_name = cols1TableJoinElements[i][j].value; 
            cols1TableJoinElements[i][j].innerText = table_name + '.' +  column_name
          }
        }
      }

      for (var i = 0; i < cols2TableJoinElements.length; i++){
        for (var j = 0; j < cols2TableJoinElements[i].length; j++){
          if (cols2TableJoinElements[i][j].value != 'null'){
            // 論理テーブル名をチェックする
            cols2TableJoinElements[i][j].getAttribute('logical-tb-name') != null ? table_name = cols2TableJoinElements[i][j].getAttribute('logical-tb-name') : table_name = cols2TableJoinElements[i][j].getAttribute('tb-name');
            // 論理カラム名をチェックする
            cols2TableJoinElements[i][j].getAttribute('logical-col-name') != null ? column_name = cols2TableJoinElements[i][j].getAttribute('logical-col-name') : column_name = cols2TableJoinElements[i][j].value; 
            cols2TableJoinElements[i][j].innerText = table_name + '.' +  column_name
          }
        }
      }
    }

    // テーブル選択までが実行されているか
    if (setColumnJsonArry != null){
      for(var i = 0; i < selectElement1.length; i++){
        // 論理テーブル名をチェックする
        selectElement1[i].getAttribute('logical-tb-name') != null ? table_name = selectElement1[i].getAttribute('logical-tb-name') : table_name = selectElement1[i].getAttribute('tb-name');
        // 論理カラム名をチェックする
        selectElement1[i].getAttribute('logical-col-name') != null ? column_name = selectElement1[i].getAttribute('logical-col-name') : column_name = selectElement1[i].value; 
        typeCheckElement.checked == true ? selectElement1[i].innerText = table_name + '.' +  column_name + '(' + selectElement1[i].getAttribute('data-type') + ')': selectElement1[i].innerText = table_name + '.' +  column_name;
      }

      for(var i = 0; i < selectElement2.length; i++){
        // 論理テーブル名をチェックする
        selectElement2[i].getAttribute('logical-tb-name') != null ? table_name = selectElement2[i].getAttribute('logical-tb-name') : table_name = selectElement2[i].getAttribute('tb-name');
        // 論理カラム名をチェックする
        selectElement2[i].getAttribute('logical-col-name') != null ? column_name = selectElement2[i].getAttribute('logical-col-name') : column_name = selectElement2[i].value; 
        typeCheckElement.checked == true ? selectElement2[i].innerText = table_name + '.' +  column_name + '(' + selectElement2[i].getAttribute('data-type') + ')': selectElement2[i].innerText = table_name + '.' +  column_name;
      }
    }

    // 検索条件項目
    for (var i = 0; i < cdnItemElements.length; i++){
      for (var j = 0; j < cdnItemElements[i].length; j++){
        if (cdnItemElements[i][j].value != 'null'){
          cdnItemElements[i][j].getAttribute('logical-tb-name') != null ? table_name = cdnItemElements[i][j].getAttribute('logical-tb-name') : table_name = cdnItemElements[i][j].getAttribute('tb-name');
          cdnItemElements[i][j].getAttribute('logical-col-name') != null ? column_name = cdnItemElements[i][j].getAttribute('logical-col-name') : column_name = cdnItemElements[i][j].value; 
          cdnItemElements[i][j].innerText = table_name + '.' +  column_name;
        }
      }
    }
  
    // ソート条件項目
    for (var i = 0; i < sortItemElement.length; i++){
      if (sortItemElement[i].value != 'null'){
        sortItemElement[i].getAttribute('logical-tb-name') != null ? table_name = sortItemElement[i].getAttribute('logical-tb-name') : table_name = sortItemElement[i].getAttribute('tb-name');
        sortItemElement[i].getAttribute('logical-col-name') != null ? column_name = sortItemElement[i].getAttribute('logical-col-name') : column_name = sortItemElement[i].value; 
        sortItemElement[i].innerText = table_name + '.' +  column_name;
      }
    }

    alert('論理名に変更しました。')
  }else{
    // チェックがない場合の処理

    // DB接続までが実行されているかチェックする
    if (selectSchemaElement.length > 0){
      for(var i = 0; i < selectSchemaElement.length; i++){
        if (selectSchemaElement[i].value != 'null'){
          selectSchemaElement[i].innerText = selectSchemaElement[i].value;
        }
      }
    }


    // スキーマ選択までが実行されているかチェックする
    if (selectTableElements[0].length > 0){
      for (var i = 0; i < selectTableElements.length; i++){
        for (var j = 0; j < selectTableElements[i].length; j++){
          if (selectTableElements[i][j].value != 'null'){
            selectTableElements[i][j].innerText = selectTableElements[i][j].value;
          }
        }
      }
    }

    // テーブル選択までが実行されているかチェックする
    if (setColumnJsonArry != null){
      // 結合項目左
      var cols1TableJoinElements = document.querySelectorAll('[id^=col1-select-]');
      for (var i = 0; i < cols1TableJoinElements.length; i++){
        for (var j = 0; j < cols1TableJoinElements[i].length; j++){
          if (cols1TableJoinElements[i][j].value != 'null'){
            cols1TableJoinElements[i][j].innerText = cols1TableJoinElements[i][j].getAttribute('tb-name') + '.' +  cols1TableJoinElements[i][j].value;
          }
        }
      }

      // 結合項目右
      var cols2TableJoinElements = document.querySelectorAll('[id^=col2-select-]');
      for (var i = 0; i < cols2TableJoinElements.length; i++){
        for (var j = 0; j < cols2TableJoinElements[i].length; j++){
          if (cols2TableJoinElements[i][j].value != 'null'){
            cols2TableJoinElements[i][j].innerText = cols2TableJoinElements[i][j].getAttribute('tb-name') + '.' +  cols2TableJoinElements[i][j].value;
          }
        }
      }

      // 項目選択リスト左
      for(var i = 0; i < selectElement1.length; i++){
        //selectElement1[i].innerText = selectElement1[i].getAttribute('tb-name') + '.' + selectElement1[i].value;
        typeCheckElement.checked == true ?  selectElement1[i].innerText = selectElement1[i].getAttribute('tb-name') + '.' + selectElement1[i].value + '(' + selectElement1[i].getAttribute('data-type') + ')' : selectElement1[i].innerText = selectElement1[i].getAttribute('tb-name') + '.' + selectElement1[i].value;;
      }
      // 項目選択リスト右
      for(var i = 0; i < selectElement2.length; i++){
        //selectElement2[i].innerText = selectElement2[i].getAttribute('tb-name') + '.' + selectElement2[i].value;
        typeCheckElement.checked == true ?  selectElement2[i].innerText = selectElement2[i].getAttribute('tb-name') + '.' + selectElement2[i].value + '(' + selectElement2[i].getAttribute('data-type') + ')' : selectElement2[i].innerText = selectElement2[i].getAttribute('tb-name') + '.' + selectElement2[i].value;;
      }
    
    
      // 検索条件項目
      for (var i = 0; i < cdnItemElements.length; i++){
        for (var j = 0; j < cdnItemElements[i].length; j++){
          if (cdnItemElements[i][j].value != 'null'){
            cdnItemElements[i][j].innerText = cdnItemElements[i][j].getAttribute('tb-name') + '.' + cdnItemElements[i][j].value;
          }
        }
      }
    
      // ソート条件項目
      for (var i = 0; i < sortItemElement.length; i++){
        if (sortItemElement[i].value != 'null'){
          sortItemElement[i].innerText = sortItemElement[i].getAttribute('tb-name') + '.' + sortItemElement[i].value;
        }
      }
      
    }
  }
}


const typeChangeFunc = (check) =>{

  var selectElement1 = document.getElementById('collist1');
  var selectElement2 = document.getElementById('collist2');

  var logicalCheckElement = document.getElementById(`logical-name-cols`);

  if (check){

    for(var i = 0; i < selectElement1.length; i++){
      if (logicalCheckElement.checked == true){
        // 論理名がTrueの場合
        selectElement1[i].getAttribute('logical-tb-name') ? disp_table_name = selectElement1[i].getAttribute('logical-tb-name'): disp_table_name = selectElement1[i].getAttribute('tb-name');
        selectElement1[i].getAttribute('logical-col-name') ? disp_column_name = selectElement1[i].getAttribute('logical-col-name'): disp_column_name = selectElement1[i].value;        
      }else{
        disp_table_name = selectElement1[i].getAttribute('tb-name');
        disp_column_name = selectElement1[i].value;
      }
      selectElement1[i].getAttribute('another') != null ? disp_full_name = selectElement1[i].getAttribute('another'): disp_full_name = disp_table_name + disp_column_name;
      selectElement1[i].innerText = disp_full_name + '(' + selectElement1[i].getAttribute('data-type') + ')';
    }

    for(var i = 0; i < selectElement2.length; i++){
      if (logicalCheckElement.checked == true){
        // 論理名がTrueの場合
        selectElement2[i].getAttribute('logical-tb-name') ? disp_table_name = selectElement2[i].getAttribute('logical-tb-name'): disp_table_name = selectElement2[i].getAttribute('tb-name');
        selectElement2[i].getAttribute('logical-col-name') ? disp_column_name = selectElement2[i].getAttribute('logical-col-name'): disp_column_name = selectElement2[i].value;        
      }else{
        disp_table_name = selectElement2[i].getAttribute('tb-name');
        disp_column_name = selectElement2[i].value;
      }
      selectElement2[i].getAttribute('another') != null ? disp_full_name = selectElement2[i].getAttribute('another'): disp_full_name = disp_table_name + disp_column_name;
      selectElement2[i].innerText = disp_full_name + '(' + selectElement2[i].getAttribute('data-type') + ')';
    }

    alert('データ型を表示しました。')
  }else{

    for(var i = 0; i < selectElement1.length; i++){
      if (logicalCheckElement.checked == true){
        // 論理名がTrueの場合
        selectElement1[i].getAttribute('logical-tb-name') ? disp_table_name = selectElement1[i].getAttribute('logical-tb-name'): disp_table_name = selectElement1[i].getAttribute('tb-name');
        selectElement1[i].getAttribute('logical-col-name') ? disp_column_name = selectElement1[i].getAttribute('logical-col-name'): disp_column_name = selectElement1[i].value;        
      }else{
        disp_table_name = selectElement1[i].getAttribute('tb-name');
        disp_column_name = selectElement1[i].value;
      }
      selectElement1[i].getAttribute('another') != null ? disp_full_name = selectElement1[i].getAttribute('another'): disp_full_name = disp_table_name + disp_column_name;
      selectElement1[i].innerText = disp_full_name;
    }


    for(var i = 0; i < selectElement2.length; i++){
      if (logicalCheckElement.checked == true){
        // 論理名がTrueの場合
        selectElement2[i].getAttribute('logical-tb-name') ? disp_table_name = selectElement2[i].getAttribute('logical-tb-name'): disp_table_name = selectElement2[i].getAttribute('tb-name');
        selectElement2[i].getAttribute('logical-col-name') ? disp_column_name = selectElement2[i].getAttribute('logical-col-name'): disp_column_name = selectElement2[i].value;        
      }else{
        disp_table_name = selectElement2[i].getAttribute('tb-name');
        disp_column_name = selectElement2[i].value;
      }
      selectElement2[i].getAttribute('another') != null ? disp_full_name = selectElement2[i].getAttribute('another'): disp_full_name = disp_table_name + disp_column_name;
      selectElement2[i].innerText = disp_full_name;
    }


  }
}



// 表示情報変更チェックボックス関連
$(function(){
  // アスターチェックボックス変更検知
  $('#all-aster').change(function(){
    if($(this).prop('checked')){
      // チェックがある場合の処理
      var selectElement1 = document.getElementById('collist1');
      var selectElement2 = document.getElementById('collist2');
      if(selectElement1.length != selectElement2.length){
        alert('全ての項目が表示リストに追加されていません。\n項目を全て追加してからチェックボックスにチェックを入れて下さい。')
        // チェックを解除する
        $(this).removeAttr('checked').prop('checked', false).change();
      }else{
        alert('SQLの項目を＊で表示します。')
      }
    }
  });

  // 論理名で表示チェックボックス変更検知
  $('#logical-name-cols').change(function(){
      logicalChangeFunc($(this).prop('checked'));
  });

  // データ型チェックボックス変更検知
  $('#item-type').change(function(){
    typeChangeFunc($(this).prop('checked'));
  })

})

// 曖昧検索で数値型が選択された時に元に戻す変数
var setItemVal = null;

// 値の型から入力ボックスの種類を切り替える
function resetInputBox(number){

  // セレクトボックスの要素を取得
  var selectElements = document.getElementById('cdn-items-'+ number);

  // 選択されている番号を取得
  var selectedNum = selectElements.selectedIndex;

  // データ型を取得
  var type = selectElements[selectedNum].getAttribute('data-type');

  if (type != null){

    if((~type.indexOf('int')) || (~type.indexOf('serial'))) {
      // 数値型の場合はチェックが曖昧検索指定になっていないかを確認する
      if ($('#like-radio-' + number).prop('checked')){
        alert('数値型を曖昧検索で使用することは出来ません。')
        // 曖昧検索のラジオボタンを解除して、比較演算子のラジオボタンに選択状態を移す
        document.getElementById('compair-radio-' + number + '').checked = true;
        // 一致方法のチェックボックスを解除
        document.getElementById('forward-' + number).checked = false;
        document.getElementById('backward-' + number).checked = false;
        document.getElementById('partof-' + number).checked = false;
        // 選択前に戻す
        document.getElementById('cdn-items-'+ number).value = setItemVal;
        return
      }
      $('#cdn-values-'+ number).remove();
      $('#auto-btn-field-'+ number).remove();
      $('#val-'+ number).append($('<input id="cdn-values-'+ number +'" class="cdnvalues">').attr({'placeholder': '数値を入力してください','type': 'number','min': '0'}));
    }else if((~type.indexOf('time')) || (~type.indexOf('date'))){
      $('#cdn-values-'+ number).remove();
      $('#auto-btn-field-'+ number).remove();
      
      $('#val-'+ number).append($('<input id="cdn-values-'+ number +'" class="cdnvalues">').attr('type', 'datetime-local'));
      
      // 自動生成ボタン
      $('#val-'+ number).append($('<div id="auto-btn-field-'+ number +'" class="date-btn-row"></div>'));
      // 先週初
      $('#auto-btn-field-'+ number).append($('<input id="lws-btn-'+ number +'" class="auto-date" onclick="setLwsTime('+ number +')">').attr({'type': 'button','value': '先週初'}));
      // 先週末
      $('#auto-btn-field-'+ number).append($('<input id="lwe-btn-'+ number +'" class="auto-date" onclick="setLweTime('+ number +')">').attr({'type': 'button','value': '先週末'}));
      // 先月初
      $('#auto-btn-field-'+ number).append($('<input id="lms-btn-'+ number +'" class="auto-date" onclick="setLmsTime('+ number +')">').attr({'type': 'button','value': '先月初'}));
      // 先月末
      $('#auto-btn-field-'+ number).append($('<input id="lme-btn-'+ number +'" class="auto-date" onclick="setLmeTime('+ number +')">').attr({'type': 'button','value': '先月末'}));
    }else{
      $('#cdn-values-'+ number).remove();
      $('#auto-btn-field-'+ number).remove();
      $('#val-'+ number).append($('<input id="cdn-values-'+ number +'" class="cdnvalues">').attr({'placeholder': '値を入力してください','type': 'text'}));  
    }
  }else{
    $('#cdn-values-'+ number).remove();
    $('#auto-btn-field-'+ number).remove();
    $('#val-'+ number).append($('<input id="cdn-values-'+ number +'" class="cdnvalues">').attr({'placeholder': '値を入力してください','type': 'text'}));  
  }
  // 選ばれた項目の値をセットする
  setItemVal = document.getElementById('cdn-items-'+ number).value;
}




const yyyyMMddHHmmssfff_delimitate = (year , month , day , hour , min , sec , msec) => {
  const date =
      year +
      "/" +
      String(month).padStart(2, "0") +
      "/" +
      String(day).padStart(2, "0") +
      " " +
      String(hour).padStart(2, "0") +
      ":" +
      String(min).padStart(2, "0") +
      ":" +
      String(sec).padStart(2, "0") +
      "." + String(msec).padStart(3, "0");
      return date;
};

const yyyyMMddHHmm_delimitate = (year , month , day , hour , min) => {
  const date =
      year +
      "-" +
      String(month).padStart(2, "0") +
      "-" +
      String(day).padStart(2, "0") +
      " " +
      String(hour).padStart(2, "0") +
      ":" +
      String(min).padStart(2, "0");
      return date;
};

// 先週初
function setLwsTime(number) {
  var dt = new Date();
  var day = dt.getDay();
  var date = dt.getDate();
  var year = dt.getFullYear();
  var month = dt.getMonth();
  var hour = dt.getHours();
  var minute = dt.getMinutes();
  var second = dt.getSeconds();
  var milisecond = dt.getMilliseconds();
  var subtract = 7
  // subtractが-7になるまで繰り返す(週初めが月曜日の場合は-6)
  while (day - subtract != -7){
      subtract++;
  }
  resultTime = new Date(year, month, date - subtract)
  resultTime.setHours(hour);
  resultTime.setMinutes(minute);
  resultTime.setSeconds(second);
  resultTime.setMilliseconds(milisecond);
  
  // 値を整形
  outPutTime = yyyyMMddHHmm_delimitate(resultTime.getFullYear() , resultTime.getMonth() + 1 , resultTime.getDate() , resultTime.getHours() , resultTime.getMinutes());
  outPutTime = yyyyMMddHHmm_delimitate(resultTime.getFullYear() , resultTime.getMonth() + 1 , resultTime.getDate() , 0 , 0);
  
  // 表示
  document.getElementById('cdn-values-' + number + '').value = outPutTime;
};

// 先週末
function setLweTime(number) {
  var dt = new Date();
  var day = dt.getDay();
  var date = dt.getDate();
  var year = dt.getFullYear();
  var month = dt.getMonth();
  var hour = dt.getHours();
  var minute = dt.getMinutes();
  var second = dt.getSeconds();
  var milisecond = dt.getMilliseconds();
  var subtract = 1
  // subtractが-7になるまで繰り返す(週末が金曜日の場合は-2)
  while (day - subtract != -1){
      subtract++;
  }
  resultTime = new Date(year, month, date - subtract)
  resultTime.setHours(hour);
  resultTime.setMinutes(minute);
  resultTime.setSeconds(second);
  resultTime.setMilliseconds(milisecond);

  // 値を整形
  outPutTime = yyyyMMddHHmm_delimitate(resultTime.getFullYear() , resultTime.getMonth() + 1 , resultTime.getDate() , resultTime.getHours() , resultTime.getMinutes());
  outPutTime = yyyyMMddHHmm_delimitate(resultTime.getFullYear() , resultTime.getMonth() + 1 , resultTime.getDate() , 0 , 0);
  // 表示
  document.getElementById('cdn-values-' + number + '').value = outPutTime;
};

// 先月初
function setLmsTime(number) {
  var dt = new Date();
  var date = dt.getDate();
  var year = dt.getFullYear();
  var month = dt.getMonth();
  var hour = dt.getHours();
  var minute = dt.getMinutes();
  var second = dt.getSeconds();
  var milisecond = dt.getMilliseconds();
  // 先月末
  var resultTime = new Date(year, month, 0);
  resultTime.setDate(1);
  resultTime.setHours(hour);
  resultTime.setMinutes(minute);
  resultTime.setSeconds(second);
  resultTime.setMilliseconds(milisecond);

  // 値を整形
  outPutTime = yyyyMMddHHmm_delimitate(resultTime.getFullYear() , resultTime.getMonth() + 1 , resultTime.getDate() , resultTime.getHours() , resultTime.getMinutes());
  outPutTime = yyyyMMddHHmm_delimitate(resultTime.getFullYear() , resultTime.getMonth() + 1 , resultTime.getDate() , 0 , 0);

  // 表示
  document.getElementById('cdn-values-' + number + '').value = outPutTime;
};

// 先月末
function setLmeTime(number) {
  var dt = new Date();
  var date = dt.getDate();
  var year = dt.getFullYear();
  var month = dt.getMonth();
  var hour = dt.getHours();
  var minute = dt.getMinutes();
  var second = dt.getSeconds();
  var milisecond = dt.getMilliseconds();

  // 先月末
  var resultTime = new Date(year, month, 0);
  // 現在の日時をセット
  resultTime.setHours(hour);
  resultTime.setMinutes(minute);
  resultTime.setSeconds(second);
  resultTime.setMilliseconds(milisecond);

  // 値を整形
  outPutTime = yyyyMMddHHmm_delimitate(resultTime.getFullYear() , resultTime.getMonth() + 1 , resultTime.getDate() , resultTime.getHours() , resultTime.getMinutes());
  outPutTime = yyyyMMddHHmm_delimitate(resultTime.getFullYear() , resultTime.getMonth() + 1 , resultTime.getDate() , 0 , 0);

  // 表示
  document.getElementById('cdn-values-' + number + '').value = outPutTime;

};



// 検索条件追加関数
var cdn_index_count = 1;
var logiSelectArray = new Array();
const addCdnBox = (number) => {
  
  var value = $('#cdn-logis-' + number + ' option:selected').val();

  // 条件追加の必要があるかチェックする
  if (value != 'AND' && value != 'OR'){
    // nullに切り替えたのであれば、appendされた条件を減らしてリターンする    
    var additionalElements = document.querySelectorAll('[id^=additional-cdn-content-]');
    // 選択されたボックスより多く表示されている要素を全て削除する
    for (var i = number + 1; i <= additionalElements.length; i++){
      $('#additional-cdn-content-'+ i + '').remove();
    }
    var delItemsArry = new Array();
    for (var i = 0; i < logiSelectArray.length; i++){  
      if (number <= logiSelectArray[i]){
        delItemsArry.push(logiSelectArray[i])
      }
    }
    logiSelectArray = logiSelectArray.filter(i => delItemsArry.indexOf(i) == -1)
    //後続処理は行う必要がないので、リターンする
    return 
  }else{
    if (logiSelectArray.length){
      for (var i = 0; i < logiSelectArray.length; i++){
        if (number == logiSelectArray[i]){
          // 既に追加されている場合は条件を増やす必要がないので、処理を行わない
          return 
        }
      }
      logiSelectArray.push(number);
    }else{
      // 初回選択時なので、後続処理を行う
      logiSelectArray.push(number);
    }
  }

  maxNum = Math.max.apply(null, logiSelectArray);
  cdn_index_count = maxNum + 1;

  
  // テーブル取得
  var tableArray = new Array();
  var tableElement = document.getElementsByClassName('tables');
  for (var i = 0 ; i < tableElement.length; i++){
    tableArray[i] = tableElement[i].value;
  }

  $.ajax({
        data : {
          tables: tableArray,
          host: document.getElementById('host').value,
          port: document.getElementById('port').value,
          db: document.getElementById('db').value,
          user: document.getElementById('user').value,
          password: document.getElementById('password').value,
        },
        type : 'GET',
        url : '/columns_disp',
        // contentType: 'application/json',
        dataType: 'json',
        traditional: true,
        success: function(data){
          // JSON文字列をJSONオブジェクトに変換
          const json_data = JSON.parse(data);
          if('message' in json_data){
            if (Array.isArray(json_data.message)){
              for (var i = 0; i < json_data.message.length; i++){
                alert(json_data.message[i]);  
              }
            }else{
              alert(json_data.message);
            }
          }else{

            // ★初期設定★//                
            $('#basic-cdn').append('<div id="additional-cdn-content-'+ cdn_index_count + '"><div id="cdn-row-' + cdn_index_count + '" class="cdn-class"></div></div>');
          
            // 比較項目
            $('#cdn-row-' + cdn_index_count).append('<div class="cdnitem-box"><select id=cdn-items-' + cdn_index_count  + ' class="where-cdnitem" onchange="resetInputBox('+ cdn_index_count +');"></select></div>');
            $('#cdn-items-' + cdn_index_count).append($('<option class="front-title">').text('テーブル名.項目名').attr('value' , 'null'));
            for (var i = 0; i < json_data.column.length; i++){
              for (var j = 0; j < json_data.column[i].length; j++){
                $('#cdn-items-' + cdn_index_count).append($('<option>').text(tableArray[i] + '.' + json_data.column[i][j].column_name).attr({'value':json_data.column[i][j].column_name,'name': json_data.column[i][j].column_name,'data-type': json_data.column[i][j].data_type,'full-name': tableArray[i] + '.' + json_data.column[i][j].column_name}));
              }  
            }      
            
            // 比較演算子
            $('#cdn-row-' + cdn_index_count).append('<div class="compair-box"><select id=cdn-compairs-' + cdn_index_count  + ' class="where-compair" name="compairs" onchange="compairValChange('+ cdn_index_count +')"><option value="null" selected>----</option></select></div>');
            $('#cdn-row-' + cdn_index_count +' .compair-box').append('<input id="compair-radio-'+ cdn_index_count +'" type="radio" class="cdn-radio" name="or-checks-'+ cdn_index_count +'" checked onchange="radioCdnChange('+ cdn_index_count +')"">');
            $.each(compairArry, function() {
              $('#cdn-compairs-' + cdn_index_count).append($('<option>').text(this).attr('value', this));
            })

            // LIKE演算子
            $('#cdn-row-' + cdn_index_count).append('<div id="cdn-likes-'+ cdn_index_count +'" class="like-box"></div>');
            $('#cdn-likes-' + cdn_index_count).append('<input id="like-radio-'+ cdn_index_count +'" type="radio" class="cdn-radio" name="or-checks-'+ cdn_index_count +'" onchange="radioCdnChange('+ cdn_index_count +')"">');
            $('#cdn-likes-' + cdn_index_count).append('<input id="forward-' + cdn_index_count + '" type="checkbox" name="likes-'+ cdn_index_count +'" disabled onchange="likeMethodChange(this)" value="forward" /><label class="like-label" for="forward-' + cdn_index_count + '">前方一致</label>&nbsp;');              
            $('#cdn-likes-' + cdn_index_count).append('<input id="backward-' + cdn_index_count + '" type="checkbox" name="likes-'+ cdn_index_count +'" disabled onchange="likeMethodChange(this)" value="backward"/><label class="like-label" for="backward-' + cdn_index_count + '">後方一致</label>&nbsp;');              
            $('#cdn-likes-' + cdn_index_count).append('<input id="partof-' + cdn_index_count + '" type="checkbox" name="likes-'+ cdn_index_count +'" disabled onchange="likeMethodChange(this)" value="partof"/><label class="like-label" for="partof-' + cdn_index_count + '">部分一致</label>&nbsp;');

            // 比較値
            $('#cdn-row-' + cdn_index_count).append('<div id="val-'+ cdn_index_count + '" class="cdnvalue-box"><input id=cdn-values-' + cdn_index_count  + ' class="cndvalueText" placeholder="値を入力して下さい" required /></div>');
            
            // 論理演算子
            if(!logiSelectArray.includes(4)){
              $('#cdn-row-' + cdn_index_count).append('<div class="logi-box"><select id=cdn-logis-' + cdn_index_count  + ' class=where-logi onchange="addCdnBox(' + cdn_index_count + ')"><option value="null" selected>----</option></select></div>');
              $.each(logiArry, function() {
                $('#cdn-logis-' + cdn_index_count).append($('<option>').text(this).attr('value', this));
             })
            }
          }
        },
        error: function() {
          alert("request failed");
        }
    })
  };


// テーブル結合条件追加
function ckAddCdnBtn(number){
  
  // 追加上限で止めるためのカウントアップ変数
  var ck_count = 0;

  var additionalElement = document.querySelectorAll('[id^="additional-block-' + number + '-"]');
  if (additionalElement.length >= 5){
    return alert('結合条件数が最大です。')
  }else{
    ck_count = additionalElement.length + 1;
  }

  $('#talbe-cdn-block-'+ number).append('<div id="additional-block-'+ number + '-' + ck_count +'"></div>');

  // 論理演算子
  $('#additional-block-'+ number + '-' + ck_count).append('<div class="cat-select-field"><select id=logi-select-' + number  + '-' + ck_count + ' class=logis></select></div><br>');  
  $.each(logiArry, function() {
    $('#logi-select-' + number  + '-' + ck_count).append($('<option>').text(this).attr('value', this));
  })

  // 結合する項目１
  $('#additional-block-'+ number + '-' + ck_count).append('<div class="cat-select-field"><select id=col1-select-' + number  + '-' + ck_count + ' class=col1s></select></div>');
  $('#col1-select-' + number + '-' + ck_count).append($('<option>').text('テーブル名.項目名').attr('value', 'null'));

  // 比較演算子
  $('#additional-block-'+ number + '-' + ck_count).append('<div class="cat-select-field"><select id=compair-select-' + number + '-' + ck_count + ' class=compairs></select></div>');  
  $.each(compairArry, function() {
    $('#compair-select-' + number + '-' + ck_count).append($('<option>').text(this).attr('value', this));
  })
  
  // 結合する項目２
  $('#additional-block-'+ number + '-' + ck_count).append('<div class="cat-select-field"><select id=col2-select-' + number + '-' + ck_count + ' class=col2s></select></div>');
  $('#col2-select-' + number + '-' + ck_count).append($('<option>').text('テーブル名.項目名').attr('value', 'null'));

}



// 結合条件追加パターン２
// var value = $('#cdn-logis-' + number + ' option:selected').val();

// 条件追加の必要があるかチェックする
// if (value != 'AND' && value != 'OR'){
//   // nullに切り替えたのであれば、appendされた条件を減らしてリターンする    
//   var additionalElements = document.querySelectorAll('[id^=additional-cdn-content-]');
//   // 選択されたボックスより多く表示されている要素を全て削除する
//   for (var i = number + 1; i <= additionalElements.length; i++){
//     $('#additional-cdn-content-'+ i + '').remove();
//   }
//   var delItemsArry = new Array();
//   for (var i = 0; i < logiSelectArray.length; i++){  
//     if (number <= logiSelectArray[i]){
//       delItemsArry.push(logiSelectArray[i])
//     }
//   }
//   logiSelectArray = logiSelectArray.filter(i => delItemsArry.indexOf(i) == -1)
//   //後続処理は行う必要がないので、リターンする
//   return 
// }else{
//   if (logiSelectArray.length){
//     for (var i = 0; i < logiSelectArray.length; i++){
//       if (number == logiSelectArray[i]){
//         // 既に追加されている場合は条件を増やす必要がないので、処理を行わない
//         return 
//       }
//     }
//     logiSelectArray.push(number);
//   }else{
//     // 初回選択時なので、後続処理を行う
//     logiSelectArray.push(number);
//   }
// }

// maxNum = Math.max.apply(null, logiSelectArray);
// cdn_index_count = maxNum + 1;


// // 論理演算子
// if(!logiSelectArray.includes(4)){
//   $('#cdn-row-' + cdn_index_count).append('<div class="logi-box"><select id=cdn-logis-' + cdn_index_count  + ' class=where-logi onchange="addCdnBox(' + cdn_index_count + ')"><option value="null" selected>----</option></select></div>');
//   $.each(logiArry, function() {
//     $('#cdn-logis-' + cdn_index_count).append($('<option>').text(this).attr('value', this));
//  })























// 項目設定関連操作
$(function () {

  // 項目追加ボタン押下時
  $('#item-add-btn').click(function () {
    var selectElement = document.getElementById('collist1');
    var selectOptions = selectElement.selectedOptions;
    // セットアップリストに追加していく
    for (var i = 0 ; i < selectOptions.length; i++){
      if (selectOptions[i].getAttribute('full-name') != $('#collist2 [name='+ selectOptions[i].value +']').attr('full-name')){
        $('#collist2').append($('<option ondblclick="renameModalFunc()">').text(selectOptions[i].textContent).attr({'value':selectOptions[i].value,'name':selectOptions[i].value,'tb-name': selectOptions[i].getAttribute('tb-name'),'full-name': selectOptions[i].getAttribute('full-name'),'logical-tb-name':selectOptions[i].getAttribute('logical-tb-name'),'logical-col-name':selectOptions[i].getAttribute('logical-col-name'), 'data-type':selectOptions[i].getAttribute('data-type')}));
        // 別名が使われている場合は文字の色を赤にする
        if (selectOptions[i].getAttribute('another') != null){
          $('#collist2 option[full-name="'+ selectOptions[i].getAttribute('full-name') +'"]').attr('another', selectOptions[i].getAttribute('another')).css('color', '#f00')
        }
      }
    }
  })

  // 項目削除ボタン押下時
  $('#item-remov-btn').click(function () {

    var selectElement = document.getElementById('collist2');
    var selectOptions = selectElement.selectedOptions;
    // 削除項目を一時的に追加する配列
    var removeArray = new Array(); 
    // 削除リストに追加していく
    for (var i = 0 ; i < selectOptions.length; i++){
      removeArray[i] = selectOptions[i].getAttribute('full-name');
    }
    // セットアップリストから選択されている項目を全て削除
    removeArray.forEach(elem => document.querySelector('#collist2 [full-name="'+elem+'"]').remove())

    // 「＊」選択確認
    var asterCheckElement = document.getElementById('all-aster');
    if(asterCheckElement.checked){
      alert('全ての項目が表示リストに追加されていません。\n「＊」チェックを解除します。')
      // チェックを解除する
      $('#all-aster').removeAttr('checked').prop('checked', false).change();
    }

  })

  // 項目追加ALLボタン押下時
  $('#item-all-btn').click(function () {
    var selectElement = document.getElementById('collist1');
    // セットアップリストに追加していく
    for (var i = 0 ; i < selectElement.length; i++){
      // 既に追加されている項目はスキップ
      if(selectElement[i].getAttribute('full-name') != $('#collist2 [name='+ selectElement[i].value +']').attr('full-name')){
        $('#collist2').append($('<option ondblclick="renameModalFunc()">').text(selectElement[i].textContent).attr({'value': selectElement[i].value,'name': selectElement[i].value,'tb-name': selectElement[i].getAttribute('tb-name'),'full-name': selectElement[i].getAttribute('full-name'),'logical-tb-name':selectElement[i].getAttribute('logical-tb-name'),'logical-col-name':selectElement[i].getAttribute('logical-col-name'), 'data-type':selectElement[i].getAttribute('data-type')}));
        // 別名が使われている場合は文字の色を赤にする
        if (selectElement[i].getAttribute('another') != null){
          $('#collist2 option[full-name="'+ selectElement[i].getAttribute('full-name') +'"]').attr('another', selectElement[i].getAttribute('another')).css('color', '#f00')
        }
      }
    }
  })

})

// SQL-Ajax関連操作
$(function () {
  // SQL生成関数
  $('#genarate-btn').click(function () {

    // スキーマ取得
    var schemaOption = document.getElementById('schema-select');
    // テーブル取得
    var tableArray = new Array();
    var tableElement = document.getElementsByClassName('tables');
    for (var i = 0 ; i < tableElement.length; i++){
      tableArray[i] = tableElement[i].value;
    }

    // セレクト項目取得
    var columnArray = new Array();
    // セットアップリストに追加されている項目を全て取得
    var selectElement = document.getElementById('collist2');
    // JOINしている場合はテーブル名も表示 
    if (tableArray.length > 1){
      for (var i = 0 ; i < selectElement.length; i ++){
        // 別名チェック
        if (selectElement[i].getAttribute('another') != null){
          columnArray[i] = selectElement[i].getAttribute('full-name') + '\u0020AS\u0020' + selectElement[i].getAttribute('another');
        }
        else{
          columnArray[i] = selectElement[i].getAttribute('full-name');
        }
      }
    }
    // 1テーブルだけの場合
    else{
      for (var i = 0 ; i < selectElement.length; i++){
        // 別名チェック
        if (selectElement[i].getAttribute('another') != null){
          columnArray[i] = selectElement[i].value + '\u0020AS\u0020' + selectElement[i].getAttribute('another');
        }
        else{
          columnArray[i] = selectElement[i].value;
        }
      }
    } 

    // 条件項目取得
    var whereItemArray = new Array();
    var itemElements = document.querySelectorAll('[id^="cdn-items-"]')
    // JOINしている場合はテーブル名も表示
    if (tableArray.length > 1){
      for ( var i = 0; i < itemElements.length; i++){
        var index = itemElements[i].selectedIndex;
        whereItemArray[i] = itemElements[i].options[index].getAttribute('full-name');
      }
    }else{
      for ( var i = 0; i < itemElements.length; i++){
        whereItemArray[i] = itemElements[i].value;
      }
    }

    // 条件論理式取得
    var whereLogiArray = new Array();
    var logiElements = document.querySelectorAll('[id^="cdn-logis-"]')
    for ( var i = 0; i < logiElements.length; i++){
      whereLogiArray[i] = logiElements[i].value;
      // 最後の処理(使用されてない論理演算子＝'null'を削除する)※最大表示の場合は論理演算子のボックスが表示されないのでスキップ
      if (logiElements.length != 5 && i == logiElements.length - 1){
        whereLogiArray.pop();
      }
    }

    // 条件比較式取得
    var whereCompairArray = new Array();
    var compairElements = document.querySelectorAll('[id^="cdn-compairs-"]')
    for (var i = 0; i < compairElements.length; i++){
      // 表示している「＝＝」は演算子として使用できない為「＝」に変換
      if (compairElements[i].value == '=='){
        whereCompairArray[i] = '='  
      }else{
        whereCompairArray[i] = compairElements[i].value;
      }
    }

    // LIKE検索一致方式取得
    var whereLikeArray = new Array();
    // チェックボックスとラジオボタンを含む要素を全て取得
    var likeListElements = document.querySelectorAll('[id^="cdn-likes-"]');
    // テーブル結合の可能性があるので、チェックボックスを一塊ずつ取り出す
    for (var i = 0; i < likeListElements.length; i++){
      var boxSizeNum = i + 1;
      // 一列のチェックボックス要素（3つの選択肢）取得する
      var likesSelectElement = document.querySelectorAll('#cdn-likes-'+ boxSizeNum + ' [name=likes-'+ boxSizeNum +']');
      for (var j = 0; j < likesSelectElement.length; j++){
        // チェックされている検索方式の値を追加
        if (likesSelectElement[j].checked == true){
          whereLikeArray[i] = likesSelectElement[j].value;
        }  
      }
    }

    // 条件比較値取得
    var whereValueArray = new Array();
    var valueElements = document.querySelectorAll('[id^="cdn-values-"]')
    for ( var i = 0; i < valueElements.length; i++){
      if (valueElements[i].value == ''){
        whereValueArray[i] = 'null' 
      }else{
        whereValueArray[i] = valueElements[i].value;
      }
    }

    // ソート項目
    var sortItemOption = document.getElementById('sort-item');
    var sortItemValue = null;
    // JOINしている場合はテーブル名も表示
    if (tableArray.length > 1){
      var index = sortItemOption.selectedIndex;
      sortItemValue = sortItemOption.options[index].text;
    }else{
      sortItemValue = sortItemOption.value;
    }

    // ソート方式
    var sortMethodOption = document.getElementById('sort-method');

    // 取得上限
    var limit = document.getElementById('limitText');

    // 取得上限
    var offset = document.getElementById('offsetText');

    // 選択チェックをした方がいいかも

    // 結合方式取得
    var catArray = new Array();
    var catElement = document.getElementsByClassName('cats');
    for (var i = 0 ; i < catElement.length; i++){
      catArray[i] = catElement[i].value;
    }

    // 結合項目1取得
    var col1Array = new Array();
    var col1Element = document.getElementsByClassName('col1s');
    if (tableArray.length > 1){
      for (var i = 0 ; i < col1Element.length; i ++){
        col1Array[i] = col1Element[i].options[col1Element[i].selectedIndex].getAttribute('full-name');
      }
    }else{
      for (var i = 0 ; i < col1Element.length; i++){
        col1Array[i] = col1Element[i].value;
      }
    }

    // 結合項目2取得
    var col2Array = new Array();
    var col2Element = document.getElementsByClassName('col2s');
    if (tableArray.length > 1){
      for (var i = 0 ; i < col2Element.length; i ++){ 
        col2Array[i] = col2Element[i].options[col2Element[i].selectedIndex].getAttribute('full-name');
      }
    }else{
      for (var i = 0 ; i < col2Element.length; i++){
        col2Array[i] = col2Element[i].value;
      }
    }

    // 結合項目比較演算子取得
    var catCompairArray = new Array();
    var catCompairElement = document.getElementsByClassName('compairs');
    // var catCompairElement = document.querySelectorAll('[id^="cdn-compairs-"]')
    for (var i = 0 ; i < catCompairElement.length; i++){
      // 表示している「＝＝」は演算子として使用できない為「＝」に変換
      if (catCompairElement[i].value == '=='){
        catCompairArray[i] = '='  
      }else{
        catCompairArray[i] = catCompairElement[i].value;
      }
    }

    // 「*」選択チェック
    var asterCheckElement = document.getElementById('all-aster');
    // 判定フラグ
    var asterDispConfirm = 'OFF';
    if(asterCheckElement.checked){
      asterDispConfirm = 'ON';
    }

    $.ajax({
        data : {
          schema: schemaOption.value,
          tables: tableArray,
          columns: columnArray,
          where_items: whereItemArray,
          where_logis: whereLogiArray,
          where_compairs: whereCompairArray,
          where_likes: whereLikeArray,
          where_values: whereValueArray,
          sortitem: sortItemValue,
          sortmethod: sortMethodOption.value,
          limit: limit.value,
          offset: offset.value,
          cats: catArray,
          col1s: col1Array,
          col2s: col2Array,
          cat_compairs: catCompairArray,
          aster_flag: asterDispConfirm
          //cat_compairs: catCompairArray
        },
        type : 'GET',
        url : '/query_generate',
        dataType: 'json',
        traditional: true,
        success: function(data){
          // JSON文字列をJSONオブジェクトに変換
          const json_data = JSON.parse(data);
          if('message' in json_data){
            alert(json_data.message);
          }else{
            alert('正常');
            // テキストフィールドに表示する接続情報の文字列を作成する    
            var host =  document.getElementById('host').value;
            var port =  document.getElementById('port').value;
            var db =  document.getElementById('db').value;
            var user =  document.getElementById('user').value;
            var password =  document.getElementById('password').value;
            var dispItemList = ['-- host: ' + host, 'port: ' + port, 'db: ' + db, 'user: ' + user, 'password: ' + password + '\n']
            var conInfoText = dispItemList.join(" , ");

            // SQLをtextareaに表示する
            document.getElementById('text-box').value = conInfoText + json_data.sql
          }
        },
        error: function() {
          alert("request failed");
        }
    })
  });

  // SQL実行関数
  $('#action-btn').click(function () {
    // SQL取得
    var sqlText = document.getElementById('text-box');

    $.ajax({
        data : {
          sql: sqlText.value,
          host: document.getElementById('host').value,
          port: document.getElementById('port').value,
          db: document.getElementById('db').value,
          user: document.getElementById('user').value,
          password: document.getElementById('password').value,
        },
        type : 'GET',
        url : '/query_action',
        dataType: 'json',
        success: function(data){
          // JSON文字列をJSONオブジェクトに変換
          const json_data = JSON.parse(data);
          if('message' in json_data){
            alert(json_data.message);
          }else{
            alert('正常')
            $('#result-field').html(json_data.record);
          }
        },
        error: function() {
          alert("request failed");
        }
    })
  });
});


// 項目移動関数
const moveUpDown = (list, btnUp, btnDown) => {
  var opts = $(list + ' option:selected');
  // セットアップリストに選択されているオプションがない場合
  if (opts.length == 0) {
      alert("移動する項目を選択して下さい。");
  }
  // 上に移動する
  if (btnUp) {
      opts.first().prev().before(opts);
  } 
  // 下に移動する
  else if (btnDown) {
      opts.last().next().after(opts);
  }
};

// 別名設定関連操作
$(function () {
  // 別名リセット（項目を右クリック）
  $('#name-reset-btn').click(function () {
    
    // セレクトボックスの要素を取得
    var col1ListElement = document.getElementById('collist1');
    var col2ListElement = document.getElementById('collist2');
    
    // セレクトボックス左をリセット
    for (var i = 0; i < col1ListElement.length; i++){
      col1ListElement[i].textContent = col1ListElement[i].getAttribute('full-name');
      col1ListElement[i].style.color = 'initial';
    }
    // セレクトボックス右をリセット
    for (var i = 0; i < col2ListElement.length; i++){
      col2ListElement[i].textContent = col2ListElement[i].getAttribute('full-name');
      col2ListElement[i].style.color = 'initial';
    }

    var cdnItemElements = document.getElementsByClassName('where-cdnitem');
    for (var i = 0; i < cdnItemElements.length; i++){
        for (var j = 0; j < cdnItemElements[i].length; j++){
          if (cdnItemElements[i][j].textContent == cdnItemElements[i][j].getAttribute('another')){
            cdnItemElements[i][j].textContent = cdnItemElements[i][j].getAttribute('full-name');
            cdnItemElements[i].style.color = 'initial';
          }
        }
    }

    var sortItemElement = document.getElementById('sort-item');
    for (var i = 0; i < sortItemElement.length; i++){
      if (sortItemElement[i].textContent == sortItemElement[i].getAttribute('another')){
        sortItemElement[i].textContent = sortItemElement[i].getAttribute('full-name');
        sortItemElement[i].style.color = 'initial';
      }
    }

  });

  // 項目の移動（UP）
  $('#btnAvengerUp').click(function () {
    moveUpDown('#collist2', true, false);
  });
  // 項目の移動（DOWN）
  $('#btnAvengerDown').click(function () {
    moveUpDown('#collist2', false, true);
  });


  // 個別に別名をリセット
  $('[id^=collist]').contextmenu(function (e) {
    e.preventDefault();

    var col1ListElement = document.getElementById('collist1')
    var col2ListElement = document.getElementById('collist2')
    
    var numIndex1 = document.getElementById('collist1').selectedIndex;
    var numIndex2 = document.getElementById('collist2').selectedIndex;
    
    var selectedOptions = Array.from(this.selectedOptions);
    // 条件のリセットに使用する為コピーしておく
    var resetItemList = new Array();
    
    if (numIndex1 != -1){
        // 左リストを元に戻す
        for (var i = 0; i < selectedOptions.length; i++){
          resetItemList.push(selectedOptions[i].textContent);
          selectedOptions[i].removeAttribute('another');
          selectedOptions[i].textContent = selectedOptions[i].getAttribute('full-name');
          selectedOptions[i].style.color = 'initial';
        }
        // 右リストを元に戻す
        if (col2ListElement.length > 0) {
          for (var i = 0; i < col2ListElement.length; i++){
            for (var j = 0; j < resetItemList.length; j++){
              if (resetItemList[j] == col2ListElement[i].textContent){
                col2ListElement[i].removeAttribute('another');
                col2ListElement[i].textContent = col2ListElement[i].getAttribute('full-name');
                col2ListElement[i].style.color = 'initial';
              }
            }
          }
        }
    }
    else if (numIndex2 != -1){
        // 右リストを元に戻す
        for (var i = 0; i < selectedOptions.length; i++){
          resetItemList.push(selectedOptions[i].textContent);
          selectedOptions[i].removeAttribute('another');
          selectedOptions[i].textContent = selectedOptions[i].getAttribute('full-name');
          selectedOptions[i].style.color = 'initial';
        }
        // 左リストを元に戻す
        for (var i = 0; i < col1ListElement.length; i++){
          for (var j = 0; j < resetItemList.length; j++){
            if (resetItemList[j] == col1ListElement[i].textContent){
              col1ListElement[i].removeAttribute('another');
              col1ListElement[i].textContent = col1ListElement[i].getAttribute('full-name');
              col1ListElement[i].style.color = 'initial';
            }
          }
        }      
    }

    // 条件DDの項目名をリセット
    var cdnItemElements = document.getElementsByClassName('where-cdnitem');
    for (var i = 0; i < resetItemList.length; i++){
      for (var j = 0; j < cdnItemElements.length; j++){
        for (var k = 0; k < cdnItemElements[j].length; k++){
          if (resetItemList[i] == cdnItemElements[j][k].textContent){
            cdnItemElements[j][k].removeAttribute('another');
            cdnItemElements[j][k].textContent = cdnItemElements[j][k].getAttribute('full-name');
            cdnItemElements[j][k].style.color = 'initial';
          }
        }
      }
    }
    // ソードDDの項目名をリセット
    var sortItemElement = document.getElementById('sort-item');
    for (var i = 0; i < resetItemList.length; i++){
      for (var j = 0; j < sortItemElement.length; j++){
        if (resetItemList[i] == sortItemElement[j].textContent){
          sortItemElement[j].removeAttribute('another');
          sortItemElement[j].textContent = sortItemElement[j].getAttribute('full-name');
          sortItemElement[j].style.color = 'initial';
        }
      }
    }
  });

  // マルチセレクトボックス要素を取得
  var col1ListElement = document.getElementById("collist1");
  var col2ListElement = document.getElementById("collist2");

  // Shiftキーが押されたときの処理
  function handleShiftPress1(event) {
    event.preventDefault();
    if (event.shiftKey) {
      // 選択されていなければ-1になる
      var numIndex1 = document.getElementById('collist1').selectedIndex;
      // list1が選択されている場合
      if (col1ListElement[numIndex1].getAttribute('another') != null && numIndex1 != -1) {
        col1ListElement[numIndex1].textContent = col1ListElement[numIndex1].getAttribute('full-name');
      }
    }
  }

  // Shiftキーが離されたときの処理
  function handleShiftRelease1(event) {
    event.preventDefault();
    if (!event.shiftKey) {
      // 選択されていなければ-1になる
      var numIndex1 = document.getElementById('collist1').selectedIndex;
      // list1が選択されている場合
      if (col1ListElement[numIndex1].getAttribute('another') != null && numIndex1 != -1) {
        col1ListElement[numIndex1].textContent = col1ListElement[numIndex1].getAttribute('another');
      }
    }
  }

  // Shiftキーが押されたときの処理
  function handleShiftPress2(event) {
    event.preventDefault();
    if (event.shiftKey) {
      var numIndex2 = document.getElementById('collist2').selectedIndex;
      // list2が選択されている場合
      if (col2ListElement[numIndex2].getAttribute('another') != null && numIndex2 != -1) {
        col2ListElement[numIndex2].textContent = col2ListElement[numIndex2].getAttribute('full-name');
      }
    }
  }

  // Shiftキーが離されたときの処理
  function handleShiftRelease2(event) {
    event.preventDefault();
    if (!event.shiftKey) {  
      // 選択されていなければ-1になる
      var numIndex2 = document.getElementById('collist2').selectedIndex;
      // list2が選択されている場合
      if (col2ListElement[numIndex2].getAttribute('another') != null && numIndex2 != -1) {
        col2ListElement[numIndex2].textContent = col2ListElement[numIndex2].getAttribute('another');
      }
    }
  }
  // 項目選択リスト左
  col1ListElement.addEventListener("keydown", handleShiftPress1, {passive: false});
  col1ListElement.addEventListener("keyup", handleShiftRelease1, {passive: false});
  // 項目選択リスト右  
  col2ListElement.addEventListener("keydown", handleShiftPress2, {passive: false});
  col2ListElement.addEventListener("keyup", handleShiftRelease2, {passive: false});
})

