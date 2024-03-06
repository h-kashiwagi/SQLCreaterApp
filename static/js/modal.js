// modal起動
function renameModalFunc(){
    // 選択情報パラメータをセット
    // setSelectedParam()

    var col1ListElement = document.getElementById('collist1')
    var col2ListElement = document.getElementById('collist2')
    
    // 選択されていなければ-1になる
    var numIndex1 = document.getElementById('collist1').selectedIndex;
    var numIndex2 = document.getElementById('collist2').selectedIndex;

    // list1が選択されている場合
    if (numIndex1 != -1 && numIndex2 == -1) {
        // 元の値をセットする
        document.getElementById('before-name').value = col1ListElement[numIndex1].getAttribute('full-name');
    }
    // list2が選択されている場合
    else if (numIndex2 != -1 && numIndex1 == -1) {
        // 元の値をセットする
        document.getElementById('before-name').value = col2ListElement[numIndex2].getAttribute('full-name');
    } 
    // 両方選択されている場合
    else {
        col1ListElement.selectedIndex = -1;
        col2ListElement.selectedIndex = -1;
        return
    }
    // 起動
    $('.modal-container').addClass('active');
}



// 変更
$(function(){
    $('#decide-btn').on('click',function(){

        var alterNameElement = document.getElementById('after-name');

        var col1ListElement = document.getElementById('collist1');
        var col2ListElement = document.getElementById('collist2');

        for (var i = 0; i < col1ListElement.length; i++){
            if (col1ListElement[i].textContent == alterNameElement.value) return alert('すでに使用されている別名です。');
        }        

        // 選択されていなければ-1になる
        var numIndex1 = document.getElementById('collist1').selectedIndex;
        var numIndex2 = document.getElementById('collist2').selectedIndex;

        // 1が選択されている場合
        if (numIndex1 != -1 && numIndex2 == -1){
            // numIndex1は-1じゃない
            var element1Text = col1ListElement[numIndex1].textContent;
            
            // list1を入れ替え
            col1ListElement[numIndex1].textContent = alterNameElement.value;
            // カラーを適用
            col1ListElement[numIndex1].style.color = '#f00';
            // 別名属性追加
            col1ListElement[numIndex1].setAttribute('another', alterNameElement.value);

            // list2に同一カラムが存在する場合はその値も入れ替える
            for (var i = 0; i < col2ListElement.length; i++){
                if (col2ListElement[i].textContent ==  element1Text){
                    col2ListElement[i].textContent = alterNameElement.value;
                    col2ListElement[i].style.color = '#f00';
                    // 別名属性追加
                    col2ListElement[i].setAttribute('another', alterNameElement.value);        
                }
            }


            var cdnItemElements = document.getElementsByClassName('where-cdnitem');
            for (var i = 0; i < cdnItemElements.length; i++){
                for (var j = 0; j < cdnItemElements[i].length; j++){
                    if (cdnItemElements[i][j].textContent == element1Text){
                        cdnItemElements[i][j].textContent = alterNameElement.value;
                        cdnItemElements[i][j].style.color = '#f00';
                        cdnItemElements[i][j].setAttribute('another', alterNameElement.value);
                    }
                }
            }
    
            var sortItemElement = document.getElementById('sort-item');
            for (var i = 0; i < sortItemElement.length; i++){ 
                if (sortItemElement[i].textContent == element1Text){
                    sortItemElement[i].textContent = alterNameElement.value;
                    sortItemElement[i].style.color = '#f00';
                    sortItemElement[i].setAttribute('another', alterNameElement.value);
                }                
            }
            
        }
        // 2が選択されている場合
        else if (numIndex2 != -1 && numIndex1 == -1){

            // numIndex2は-1じゃない
            var element2Text = col2ListElement[numIndex2].textContent;

            // list2を入れ替え
            col2ListElement[numIndex2].textContent = alterNameElement.value;
            // カラーを適用
            col2ListElement[numIndex2].style.color = '#f00';
            // 別名属性追加
            col2ListElement[numIndex2].setAttribute('another', alterNameElement.value);
            
            // list1に同じカラムは必ずあるので入れ替える
            for (var i = 0; i < col1ListElement.length; i++){
                if (col1ListElement[i].textContent ==  element2Text){
                    col1ListElement[i].textContent = alterNameElement.value;
                    col1ListElement[i].style.color = '#f00';
                    // 別名属性追加
                    col1ListElement[i].setAttribute('another', alterNameElement.value);
                }
            }

            var cdnItemElements = document.getElementsByClassName('where-cdnitem');
            for (var i = 0; i < cdnItemElements.length; i++){
                for (var j = 0; j < cdnItemElements[i].length; j++){
                    if (cdnItemElements[i][j].textContent == element2Text){
                        cdnItemElements[i][j].textContent = alterNameElement.value;
                        cdnItemElements[i][j].style.color = '#f00';
                        cdnItemElements[i][j].setAttribute('another', alterNameElement.value);
                    }
                }
            }
    
            var sortItemElement = document.getElementById('sort-item');
            for (var i = 0; i < sortItemElement.length; i++){
                if (sortItemElement[i].textContent == element2Text){
                    sortItemElement[i].textContent = alterNameElement.value;
                    sortItemElement[i].style.color = '#f00';
                    sortItemElement[i].setAttribute('another', alterNameElement.value);
                }                
            }   
        }

        // modalを閉じる
        $('.modal-container').removeClass('active');
    });

    //closeボタンをクリックしたらモーダルウィンドウを閉じる
    $('.modal-close').on('click',function(){
        $('.modal-container').removeClass('active');
    });

    // キャンセルボタンをクリック
    $('#cancel-btn').on('click',function(){
        $('.modal-container').removeClass('active');
    });
});


// // modalを閉じる 
