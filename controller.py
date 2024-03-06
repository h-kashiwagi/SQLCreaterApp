from flask import Flask , render_template , request, jsonify
import items
import traceback
from logging import getLogger , INFO , Formatter , DEBUG
from logging.handlers import TimedRotatingFileHandler
import sys
import pg_dao
import json
import os

bilder_app = Flask(__name__, template_folder='templates' ,static_folder='./static')


import os
from flask import send_from_directory

# 必要ないので後で削除する
@bilder_app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(bilder_app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')


# logger変数
logger = None

# ログの初期化
def init_log(module , path):

    try:
        logger = getLogger(module)
        handler = TimedRotatingFileHandler(path, when='D',backupCount=10, interval=10, encoding='utf-8')
        handler.setLevel(DEBUG)
        handler.setFormatter(Formatter('%(asctime)s--%(levelname)s-%(message)s'))
        logger.setLevel(DEBUG)
        logger.addHandler(handler)
        logger.propagate = False
    except Exception as ex:
        print("ロガーの設定中にエラーが発生しました。{0}".format(ex))
        print(traceback.format_exc())
        return None
    else:
        print(logger)
        return logger

# loggerセットアップ
try:
    logger = init_log(__name__ , items.log_path)
except Exception as ex:
    print("ロガーの作成時にエラーが発生しました。")
    print(traceback.format_exc())
    sys.exit()


# loggerセットアップ完了確認
if logger != None:      
    logger.info("起動しました。")
else:
    print("ロガーの作成に失敗しました。")
    sys.exit()


# 初回画面表示
@bilder_app.route('/', methods=['GET'])
def init_view():
    return render_template('operation_page.html')


# DB接続実行処理
@bilder_app.route('/db_con', methods=['GET'])
def get_db_con():
    
    try:
        message = ''
        return_json = None
        err_flg = 0
        
        try:
            # パラメータ取得
            host = request.args.get('host' , type=str)
            port = request.args.get('port' , type=int)
            db = request.args.get('db' , type=str)
            user = request.args.get('user' , type=str)
            password = request.args.get('password' , type=str)
        except Exception as ex:
            logger.error(f'パラメータ取得中にエラーが発生しました。{ex}')
            message = 'パラメータ取得中にエラーが発生しました。'
            
        else:
            # スキーマ取得
            schema_result , err_flg , message = pg_dao.get_schema_list(items , host , port , db , user , password)

        if err_flg == 0:  
            return_json = { "schema": schema_result }
        else:
            return_json = { "message": message }    

    except Exception as ex:
        logger.error('想定外のエラーが発生しました。')
        return_json = { "message": "想定外のエラーが発生しました。" }
    finally:
        return jsonify(json.dumps(return_json))

    


# スキーマ選択時テーブル取得
@bilder_app.route('/tables_disp', methods=['GET'])
def tables_by_schema():

    try:
        message = ''
        return_json = None
        err_flg = 0

        try:
            # パラメータ取得
            schema = request.args.get('schema' , type=str)
            host = request.args.get('host' , type=str)
            port = request.args.get('port' , type=int)
            db = request.args.get('db' , type=str)
            user = request.args.get('user' , type=str)
            password = request.args.get('password' , type=str)
        except Exception as ex:
            logger.error(f'パラメータ取得中にエラーが発生しました。{ex}')
            message = 'パラメータ取得中にエラーが発生しました。'
        else:
            # スキーマ取得
            table_result , err_flg , message = pg_dao.get_table_list(items , schema , host ,  port , db , user , password)

        if err_flg == 0:  
            return_json = { "table": table_result }
            print(return_json)
        else:
            return_json = { "message": message }    
        
    except Exception as ex:
        logger.error('想定外のエラーが発生しました。')
        return_json = { "message": "想定外のエラーが発生しました。" }
    finally:
        return jsonify(json.dumps(return_json))



# 表示カラム入れ替え（追加テーブルのセレクトボックス選択）
@bilder_app.route('/columns_disp', methods=['GET'])
def columns_by_table():

    try:
        message = ''
        return_json = None
        err_flg = 0

        try:
            # パラメータ取得
            tables = request.args.getlist('tables')
            table = request.args.get('table' , type=str)
            host = request.args.get('host' , type=str)
            port = request.args.get('port' , type=int)
            db = request.args.get('db' , type=str)
            user = request.args.get('user' , type=str)
            password = request.args.get('password' , type=str)

        except Exception as ex:
            logger.error(f'パラメータ取得中にエラーが発生しました。{ex}')
        else:
            column_result_list = []
            error_list = []
            message_list = []
            
            # カラム取得
            if table != None:
                column_result , err_flg , message = pg_dao.get_column_list(items , table , host ,  port , db , user , password)

                if err_flg == 0:
                    return_json = { "column": column_result }
                else:
                    return_json = { "message": message }
            else:
                # 複数テーブルのカラムを取得する場合
                for table in tables:
                    column_result , err_flg , message = pg_dao.get_column_list(items , table , host ,  port , db , user , password)
                    column_result_list.append(column_result)
                    error_list.append(err_flg)
                    message_list.append(message)

                if 0 in error_list:
                    return_json = { "column": column_result_list }
                else:
                    return_json = { "message": message_list }
            print(return_json)
    except Exception as ex:
        logger.error('想定外のエラーが発生しました。')
        return_json = { "message": "想定外のエラーが発生しました。" }
    finally:
        return jsonify(json.dumps(return_json))


# 曖昧検索SQL関数
def check_like_pattern(like , compair , value):
    
    # LIKE演算子の場合
    if compair == 'LIKE':
        # 曖昧検索の方式が取得されているかチェック
        if like != None:
            # 一致方式を確認
            if like == 'forward':
                value = value + '%'
            elif like == 'backward':
                value = '%' + value
            elif like == 'partof':
                value = '%' + value + '%'
            else:
                print('error')
    # 加工した値を返却する                
    return value



# SQL文の生成
@bilder_app.route('/query_generate', methods=['GET'])
def output_query():

    try:
        message = ''
        return_json = None
        err_flg = 0

        try:
            
            # パラメータ取得
            schema = request.args.get('schema' , type=str)
            tables = request.args.getlist('tables')
            columns = request.args.getlist('columns')
            where_items = request.args.getlist('where_items')
            where_logis = request.args.getlist('where_logis')
            where_compairs = request.args.getlist('where_compairs')
            where_likes = request.args.getlist('where_likes')
            where_values = request.args.getlist('where_values')
            sortitem = request.args.get('sortitem')
            sortmethod = request.args.get('sortmethod')
            limit = request.args.get('limit')
            offset = request.args.get('offset')
            cats = request.args.getlist('cats')
            cat_col1 = request.args.getlist('col1s')
            cat_col2 = request.args.getlist('col2s')
            cat_compairs = request.args.getlist('cat_compairs')
            aster_flag = request.args.get('aster_flag')

            # print(columns)
            print(where_items)
            # print(where_logis)
            # print(where_compairs)
            print(where_values)

            # print(limit)
            # print(cat_compairs)            
            # print(where_likes)

        except Exception as ex:
            err_flg = 1
            message = 'パラメータ取得中にエラーが発生しました。'
            logger.error(f'パラメータ取得中にエラーが発生しました。{ex}') 
        else:

            ### スキーマチェック ###
            if schema == None or schema == 'null':
                message = 'スキーマが取得出来ませんでした。'
                err_flg = 1

            ### テーブルチェック（＋結合）###
            table_text = ''
            join_format = '{1} {2} {3} on {4} = {5}'
            if tables != None and 'null' not in tables and len(tables) != 0:
                # 結合方式が存在しているか
                if cats != None and 'null' not in cats and len(cats) != 0:
                    # 結合比較演算子が存在しているか
                    if cat_compairs != None and 'null' not in cat_compairs and len(cat_compairs) != 0:
                        # 結合項目が存在しているか
                        if cat_col1 != None and 'null' not in cat_col1 and cat_col2 != None and 'null' not in cat_col2:
                            # テーブルと結合方式、比較演算子、項目の数が一致しているかチェック
                            if len(tables)/2 == len(cats) == len(cat_compairs) == len(cat_col1) == len(cat_col2):
                                # 先頭のテーブル名を削除
                                base_table = tables.pop(0)
                                join_format = base_table + ' {0} {1} ON {2} {3} {4}'

                                for cat , table , col1 , compair , col2 in zip(cats , tables , cat_col1 , cat_compairs , cat_col2):
                                    
                                    if cat == '完全結合':
                                        cat = 'FULL OUTER JOIN'
                                    elif cat == '内部結合':
                                        cat = 'INNER JOIN'
                                    elif cat == '左結合':
                                        cat = 'LEFT OUTER JOIN'
                                    elif cat == '右結合':                              
                                        cat = 'RIGHT OUTER JOIN'
                                    else:
                                        print('error')

                                    table_text = table_text + join_format.format(cat , table , col1 , compair , col2)

                            else:
                                print('結合するテーブル、カラム、結合方式の数が一致しません。')   
                                message = '結合するテーブル、カラム、結合方式または項目の数が一致しません。'
                                err_flg = 1
                        else:
                            print('左辺または右辺の項目が存在しません。')        
                            message = '左辺または右辺の項目が存在しません。'
                            err_flg = 1
                    else:
                        print('左辺と右辺の比較方法が存在しません。')        
                        message = '左辺と右辺の比較方法が存在しません。'
                        err_flg = 1
                
                elif cats != None and not 'null' in cats and len(cats) != 0:
                    print('結合方式が正常に選択されていない為、結合できません。')        
                    message = '結合方式が正常に選択されていない為、結合できません。'
                    err_flg = 1 
                else:
                    # 単一テーブル名を取得
                    table_text = tables[0]
            else:
                print('テーブルが取得出来ませんでした。')
                message = 'テーブルが取得出来ませんでした。'
                err_flg = 1                

            
            ### 項目名チェック ###
            # if columns != None and len(columns) != 0:
            if columns != None:
                # アスタリスク選択チェック
                if aster_flag != None and aster_flag == 'ON':
                    # アスタリスクで表示
                    columns = '*'
                else:
                    # 項目名リスト作成
                    columns = ', '.join(map(str, columns))
            else:
                message = 'カラムがNone'
                err_flg = 1
            

            ### WHERE句チェック ###
            import itertools
            cnd_list = list()
            where_text = ''
            # Noneまたはリストにnullが混在していないかチェックする
            if None not in (where_items , where_compairs , where_values) and 'null' not in where_items and 'null' not in where_compairs and 'null' not in where_values:
                # 同じ要素数の場合
                if len(where_items) == len(where_compairs) == len(where_values):
                    
                    # 条件が論理演算子によって追加される
                    if where_logis != None and len(where_logis) != 0:
                        
                        for item , compair , value , logic , like in itertools.zip_longest(where_items , where_compairs , where_values , where_logis , where_likes , fillvalue=''):

                            # LIKE演算子チェック処理
                            value = check_like_pattern(like , compair , value)

                            cnd_list.append('{0} {1} \'{2}\' {3}'.format(item , compair , value , logic))

                    else:
                        #where_likes.append(100)
                        # 論理演算子が存在しないので、一度だけ取り出す
                        for item, compair, value , like in itertools.zip_longest(where_items , where_compairs , where_values , where_likes , fillvalue=''):

                            # LIKE演算子チェック処理
                            value =  check_like_pattern(like , compair , value)
                            
                            cnd_list.append('{0} {1} \'{2}\''.format(item , compair , value))

                    where_text = ' WHERE {}'.format( ' '.join(cnd_list))
                else:
                    print('error(比較する項目と値の数が等しくない)')
            else:
                print('WHERE句なし')
            

            ### ソートチェック ###
            sort_text = ''
            if None or 'null' not in (sortitem , sortmethod):
                if sortmethod == '昇順':
                    sort_text = ' ORDER BY {}'.format(sortitem)
                elif sortmethod == '降順':
                    sort_text = ' ORDER BY {} DESC'.format(sortitem)
                else:
                    print('error')
                    message = '存在しないソート方法です。'
                    err_flg = 1 
                    
            
            ### <LIMIT>上限チェック ###
            limit_text = ''
            if limit:
                limit_text = ' LIMIT {}'.format(limit)

            ### <OFFSET>取得開始位置チェック ###
            offset_text = ''
            if offset:
                offset_text = ' OFFSET {}'.format(offset)
            
        ### HTMLに返却するSQLの最終準備 ###
        if err_flg == 0:
            
            sql = 'SELECT {0} FROM {1}.{2}{3}{4}{5}{6};'.format(columns , schema , table_text , where_text , sort_text , limit_text , offset_text)            
            
            return_json = { "sql": sql }
        else:
            return_json = { "message": message }

        print(sql)
    except Exception as ex:
        logger.error('想定外のエラーが発生しました。')
        return_json = { "message": "想定外のエラーが発生しました。" }
    finally:
        return jsonify(json.dumps(return_json))
    

# SQL文の実行
@bilder_app.route('/query_action', methods=['GET'])
def output_record():

    try:
        message = ''
        return_json = None
        err_flg = 0

        try:
            
            # パラメータ取得
            sql = request.args.get('sql' , type=str)
            host = request.args.get('host' , type=str)
            port = request.args.get('port' , type=int)
            db = request.args.get('db' , type=str)
            user = request.args.get('user' , type=str)
            password = request.args.get('password' , type=str)

        except Exception as ex:
            err_flg = 1
            message = 'パラメータ取得中にエラーが発生しました。'
            logger.error(f'パラメータ取得中にエラーが発生しました。{ex}')    
        else:
            print(sql)
            # スキーマ取得
            record_result , err_flg , message = pg_dao.get_record_data(items , sql , host ,  port , db , user , password)
        
        if err_flg == 0:  
            return_json = { "record": record_result }
        else:
            return_json = { "message": message }    

    except Exception as ex:
        logger.error('想定外のエラーが発生しました。')
        return_json = { "message": "想定外のエラーが発生しました。" }
    finally:
        return jsonify(json.dumps(return_json))

