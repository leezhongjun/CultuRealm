import sqlite3

class Updater():
    def __init__(self, DEBUG=False):
        self.conn = sqlite3.connect('database.db')  
        self.c = self.conn.cursor()
        self.DEBUG = DEBUG

        if self.DEBUG: print("Database Connection established")

    # Insert into Users table
    def updateUser(self,Username,Password,Preferences,CreatedDate='2020-01-01'):
        self.c.execute("""INSERT INTO Users (Username, Password, Preferences, CreatedDate) VALUES (?, ?, ?, ?)""",
                (Username, Password, Preferences, CreatedDate))

        UserID = self.c.lastrowid
        self.conn.commit()
        
        if self.DEBUG: print(f"Successfully inserted User({UserID},{Username},{Password},{Preferences},{Preferences})")

    # Insert into Stories table 
    def updateStories(self,UserID,StoryTitle,Description,CreatedDate='2020-01-01'):
        self.c.execute("""INSERT INTO Stories(UserID, StoryTitle, Description, CreatedDate) VALUES (?, ?, ?, ?)""",
            (UserID, StoryTitle, Description, CreatedDate))
        
        StoryID = self.c.lastrowid
        self.conn.commit()
        
        if self.DEBUG: print(f"Successfully inserted Story({StoryID}{UserID},{StoryTitle},{Description},{CreatedDate})")

    # Insert into MainLeaderboard table
    def updateMainLeaderboard(self,UserID,HighScore,CompletedDate='2020-01-01'):
        self.c.execute("""INSERT INTO MainLeaderboard (UserID, HighScore, CompletedDate) VALUES (?, ?, ?)""",
                (UserID, HighScore, CompletedDate))  

        self.conn.commit()   

        if self.DEBUG: print(f"Successfully inserted Leaderboard Score({UserID},{HighScore},{CompletedDate})")

    def close(self):
        self.conn.close() 

        if self.DEBUG: print(f"Database Connection Closed")

if __name__ == "__main__":
    # updater = Updater(DEBUG=True)
    updater = Updater()
    for i in range(10):
        j = i+3252351111112312321
        updater.updateUser(f'john{j}','pw','pref')
        updater.updateStories(i,f'john story{j}','pw','pref')
        updater.updateMainLeaderboard(j,10000)
    updater.close()