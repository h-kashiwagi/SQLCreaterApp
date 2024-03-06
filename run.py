import items
import configparser
import traceback
from pathlib import Path


if __name__ == "__main__":
    try:
        # reading config
        config_ini = configparser.ConfigParser()
        config_ini.read(Path() / 'setting.ini', encoding='utf-8')

        # db
        items.host = config_ini['postgresql_info']['host']
        items.port = config_ini['postgresql_info']['port']
        items.db = config_ini['postgresql_info']['db']
        items.user = config_ini['postgresql_info']['user']
        items.password = config_ini['postgresql_info']['password']
        items.connect_timeout = config_ini['postgresql_info']['connect_timeout']
        items.s_query_timeout = config_ini['postgresql_info']['s_query_timeout']
        items.i_query_timeout = config_ini['postgresql_info']['i_query_timeout']
        items.u_query_timeout = config_ini['postgresql_info']['u_query_timeout']
        # SQL
        items.schema_sql = config_ini['sql_info']['schema_sql']
        items.schema_discript_sql = config_ini['sql_info']['schema_discript_sql']
        items.table_sql = config_ini['sql_info']['table_sql'] 
        items.table_discript_sql = config_ini['sql_info']['table_discript_sql'] 
        items.column_sql = config_ini['sql_info']['column_sql']
        items.column_discript_sql = config_ini['sql_info']['column_discript_sql']
        # file
        items.log_path = config_ini['log_info']['log_path']
    except Exception as ex:
        print(f"設定ファイルの読込に失敗しました。{ex}")
        print(traceback.format_exc())
        exit()

    # controllerロード 
    from controller import bilder_app
    # アプリ起動
    bilder_app.run(host='localhost', debug = True)

