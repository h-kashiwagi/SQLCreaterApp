import psycopg2
from psycopg2 import OperationalError
from psycopg2.extensions import QueryCanceledError
from psycopg2.extras import DictCursor
import pandas as pd

def get_connection(host, port, db , user, password, connect_timeout):
    
    err_flg = 0    
    err_msg = ""
    connection  = None
    try:
        connection =psycopg2.connect(
            host=host,
            port=port,
            database=db,
            user=user,
            password=password,
            connect_timeout = connect_timeout
        )
        connection .set_client_encoding('utf-8')
    except OperationalError as ex:
        err_flg = 1
        err_msg = "データベース接続時にエラーが発生しました。再度実行 または、管理者に問い合わせてください。host:{0} , dbname:{1} , port:{2} , user:{3} , password:{4}".format(host , db , port , user , password)
    except Exception as ex:
        err_flg = 1
        err_msg = "データベース接続時に想定外のエラーが発生しました。再度実行 または、管理者に問い合わせてください。host:{0} , dbname:{1} , port:{2} , user:{3} , password:{4}".format(host , db , port , user , password)
    finally:
        return connection , err_flg , err_msg




# DB接続時にスキーマを表示する
def get_schema_list(items , host , port , db , user , password):
    
    err_flg = 0    
    err_msg = ""
    ret_result = []

     # コネクション取得
    connection , err_flg , err_msg = get_connection(host , port , db , user , password , items.connect_timeout)

    # コネクションチェック
    if connection == None:
        return ret_result , err_flg , err_msg
    
    # 通常スキーマ名取得用SQL
    # query = items.schema_sql
    
    # スキーマ名 + 論理コメント取得用SQL
    query = items.schema_discript_sql

    # timeout_sql = 'SET statement_timeout TO ' + items.query_timeout
    # stop_sql_test = "SELECT pg_sleep(10)"
    
    try:
        with connection.cursor(cursor_factory=DictCursor) as cursor:
            # cursor.execute(timeout_sql)
            # ポスグレスリープ実行
            # cursor.execute(stop_sql_test)
            cursor.execute(query)
            results = cursor.fetchall()
            for row in results:
                ret_result.append(dict(row))  
    except QueryCanceledError as ex:
        err_flg = 0    
        err_msg = "クエリ実行時にタイムアウトエラーが発生しました。再度実行 または、管理者に問い合わせてください。"
    except Exception as ex:
        err_flg = 0    
        err_msg = "クエリ実行時にエラーが発生しました。再度実行 または、管理者に問い合わせてください。"
    finally:
        # connection.close()
        return ret_result , err_flg, err_msg
    



# スキーマ選択時にテーブルを取得する
def get_table_list(items , schema , host , port , db , user , password):

    err_flg = 0    
    err_msg = ""
    ret_result = []

     # コネクション取得
    connection , err_flg , err_msg = get_connection(host , port , db , user , password , items.connect_timeout)

    # コネクションチェック
    if connection == None:
        return ret_result , err_flg , err_msg
    
    # 通常テーブル名取得用SQL
    # query = items.table_sql.format(schema)
    
    # テーブル名 + 論理コメント取得用SQL
    query = items.table_discript_sql.format(schema)
    
    # timeout_sql = 'SET statement_timeout TO ' + items.query_timeout
    # stop_sql_test = "SELECT pg_sleep(10)"
    try:
        with connection.cursor(cursor_factory=DictCursor) as cursor:

            # cursor.execute(timeout_sql)
            # ポスグレスリープ実行
            # cursor.execute(stop_sql_test)
            cursor.execute(query)
            results = cursor.fetchall()

            for row in results:
                ret_result.append(dict(row))

    except QueryCanceledError as ex:
        err_flg = 0    
        err_msg = "クエリ実行時にタイムアウトエラーが発生しました。再度実行 または、管理者に問い合わせてください。"
    except Exception as ex:
        err_flg = 0    
        err_msg = "クエリ実行時にエラーが発生しました。再度実行 または、管理者に問い合わせてください。"
    finally:
        return ret_result , err_flg, err_msg
    



# テーブル選択時にカラムとデータ型を取得する
def get_column_list(items , table , host , port , db , user , password):

    err_flg = 0    
    err_msg = ""
    ret_result = []

     # コネクション取得
    connection , err_flg , err_msg = get_connection(host , port , db , user , password , items.connect_timeout)

    # コネクションチェック
    if connection == None:
        return ret_result , err_flg , err_msg

    query = items.column_discript_sql.format(table)
    # timeout_sql = 'SET statement_timeout TO ' + items.query_timeout
    # stop_sql_test = "SELECT pg_sleep(10)"
    try:
        with connection.cursor(cursor_factory=DictCursor) as cursor:
            # cursor.execute(timeout_sql)
            # ポスグレスリープ実行
            # cursor.execute(stop_sql_test)
            cursor.execute(query)
            results = cursor.fetchall()

            for row in results:
                ret_result.append(dict(row)) 
        
        print(ret_result)
    except QueryCanceledError as ex:
        err_flg = 0    
        err_msg = "クエリ実行時にタイムアウトエラーが発生しました。再度実行 または、管理者に問い合わせてください。"
    except Exception as ex:
        err_flg = 0    
        err_msg = "クエリ実行時にエラーが発生しました。再度実行 または、管理者に問い合わせてください。"
    finally:
        return ret_result , err_flg, err_msg
    
    
# SQLを実行して検索結果を取得する
def get_record_data(items , query , host , port , db , user , password):

    err_flg = 0    
    err_msg = ""
    ret_result = None

     # コネクション取得
    connection , err_flg , err_msg = get_connection(host , port , db , user , password , items.connect_timeout)

    # コネクションチェック
    if connection == None:
        return ret_result , err_flg , err_msg

    # timeout_sql = 'SET statement_timeout TO ' + items.query_timeout
    # stop_sql_test = "SELECT pg_sleep(10)"

    try:
        with connection.cursor() as cursor:
            print(query)
            # cursor.execute(timeout_sql)
            cursor.execute(query)
            # ポスグレスリープ実行
            # cursor.execute(stop_sql_test)

            # 項目目のリストを作成
            column_list = [d.name for d in cursor.description]
            
            df = pd.DataFrame(cursor.fetchall(), columns=column_list)

            dtype_dict = {}
            
            for d in cursor.description:
                # decimal, numericの場合
                if d.type_code==1700: 
                    dtype_dict[d.name] = 'float64'
                # dateの場合
                if d.type_code==1082: 
                    dtype_dict[d.name] = 'datetime64'

            if len(dtype_dict)> 0: 
                df = df.astype(dtype_dict)

            ret_result = df.to_html()

    except QueryCanceledError as ex:
        err_flg = 1    
        err_msg = "クエリ実行時にタイムアウトエラーが発生しました。再度実行 または、管理者に問い合わせてください。"
    except Exception as ex:
        err_flg = 1    
        err_msg = "クエリ実行時にエラーが発生しました。再度実行 または、管理者に問い合わせてください。"
    finally:
        return ret_result , err_flg, err_msg