import sqlite3

conn = sqlite3.connect('database.db')
c = conn.cursor()

# Users table
c.execute("""CREATE TABLE Users (  
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            Username TEXT,
            Password TEXT,
            Preferences TEXT,     
            CreatedDate DATE           
            )""")

# Stories table        
c.execute("""CREATE TABLE Stories (
            StoryID INTEGER PRIMARY KEY AUTOINCREMENT, 
            UserID INTEGER,
            StoryTitle TEXT,
            Description TEXT, 
            CreatedDate DATE,
            FOREIGN KEY (UserID) REFERENCES Users(UserID)
            )""")

# MainLeaderboard table             
c.execute("""CREATE TABLE MainLeaderboard (
            UserID INTEGER PRIMARY KEY,       
            HighScore INTEGER,
            CompletedDate DATE,
            FOREIGN KEY (UserID) REFERENCES Users(UserID)         
            )""")

conn.commit()         
conn.close()