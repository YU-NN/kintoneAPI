(function() {
    "use strict";
    kintone.events.on('app.record.index.show', function(event) {
        if (document.getElementById('my_index_button') !== null) {
            return;
        }

        var myIndexButton = document.createElement('button');
        myIndexButton.id = 'my_index_button';
        myIndexButton.innerText = '一覧のボタン';

        // ボタンクリック時の処理
        myIndexButton.onclick = function() {
            window.confirm('いま押しましたね？');
        };

        kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
    });
})();
