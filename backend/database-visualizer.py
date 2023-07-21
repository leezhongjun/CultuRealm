import sqlite3
import pandas as pd

MAX_ROWS = None 
MAX_COLUMNS = None

conn = sqlite3.connect('database.db')

# Users table
df = pd.read_sql_query("SELECT * FROM Users", conn)
pd.set_option('display.max_rows', MAX_ROWS)  
pd.set_option('display.max_columns', MAX_COLUMNS)
print(df, end='\n\n')

# Stories table
df = pd.read_sql_query("SELECT * FROM Stories", conn)
pd.set_option('display.max_rows', MAX_ROWS)  
pd.set_option('display.max_columns', MAX_COLUMNS)
print(df, end='\n\n')

# Users table
df = pd.read_sql_query("SELECT * FROM MainLeaderboard", conn)
pd.set_option('display.max_rows', MAX_ROWS)  
pd.set_option('display.max_columns', MAX_COLUMNS)
print(df, end='\n\n')


conn.close()