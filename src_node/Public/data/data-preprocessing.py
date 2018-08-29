import csv

records=[];
games_max=0;

error10=0;
error111=0;

# read data
def readData():
    with open('bwf-ss-gamedata-2015-2017-new.csv', newline='') as f:
        reader = csv.reader(f)
        next(reader);
        for row in reader:
            record=[];
            for i in range(6):
                record.append(row[i]);
            records.append(record);

# check if the two game belong to the same match
def checkGames(game1, game2):
    for i in range(5):
        if(game1[i]!=game2[i]):
            return False;
    return True;
            
def basicStatistic():    
    
    # handle a match of games
    def handleMatch(match):
        games_match=len(match);
        global games_max;
        games_max=max(games_max,games_match);
        count[games_match-1]+=1;
        #if(games_match==6):
        #    print(match);
    
    
    temp=[];
    count=[0,0,0,0,0,0,0];
    for i in range(games):
        scores=records[i][5].split(';');
        if(scores[0]!=scores[1]):
            print(scores[0],scores[1]);
        if(len(temp)==0 or checkGames(temp[0],records[i])):
            temp.append(records[i]);
        else:
            handleMatch(temp);
            temp=[records[i]];
    handleMatch(temp);
    
    print("count matches by different number of games")
    for i in range(games_max):
        print(i+1,": ",count[i]);
        
    total=0;
    for i in range(games_max):
        total+=(i+1)*count[i];
    print(total);
    
    
    

# 1.read data to records            
readData();        
games=len(records);
print("total games: ",games);

# 2.basic Statistic
basicStatistic();

# store the processed games
processed_games=[];

# current sequence of match
match_seq=0;


# check if the score is valid, return score arrays or []
def checkScore(str):
    scores=str.split(';');
    results=[];
    score_last=0;
    for i in range(len(scores)):
        score=scores[i].split('-');
        score = list(map(int, score))
        if(len(results)==0 and score[0]==0 and score[1]==0):
            results.append(score);
        else:
            if(score[0]+score[1]==score_last+1):
                results.append(score);
                score_last=score[0]+score[1];
            else:
                if((score[0]+score[1]>score_last+1)):
                    print("score gap");
                    return [];                
    return results;

# score to string
def score2str(score):
    arrString=[]
    for i in range(len(score)):
        arrString.append(str(score[i][0])+"-"+str(score[i][1]));
    return ";".join(arrString);

def bool2int(b):
    if (b):
        return 1;
    else:
        return 0;
    
# process the match
def processMatch(match):
    def addGame(length,reverse,final_type):
        global match_seq;
        for i in range(length):
            # sequence and reverse
            newGame=[match_seq,reverse,final_type];
            # 1-5 fields
            for j in range(5):
                newGame.append(match[i][j]);
            # scores
            newGame.append(score2str(scores[i]));
            processed_games.append(newGame);    
        match_seq+=1;   
        
    games_match=len(match);
    if(games_match==2):
        scores=[checkScore(match[0][5]),checkScore(match[1][5])];
        lens=[len(scores[0]),len(scores[1])];
        if(lens[0]>0 and lens[1]>0):            
            reverse0=scores[0][lens[0]-1][0]<scores[0][lens[0]-1][1];
            reverse1=scores[1][lens[1]-1][0]<scores[1][lens[1]-1][1];
            if(reverse1==reverse0):                
                addGame(2,bool2int(reverse1),2);  
            else:
                global error10;
                error10+=1;
                #print("10 error");
        else:
            print("score error in two games matches");
        return;
    if(games_match==3):
        scores=[checkScore(match[0][5]),checkScore(match[1][5]),checkScore(match[2][5])];
        lens=[len(scores[0]),len(scores[1]),len(scores[2])];
        if(lens[0]>0 and lens[1]>0 and lens[2]>0):            
            reverse0=scores[0][lens[0]-1][0]<scores[0][lens[0]-1][1];
            reverse1=scores[1][lens[1]-1][0]<scores[1][lens[1]-1][1];
            reverse2=scores[2][lens[2]-1][0]<scores[2][lens[2]-1][1];
            if(reverse0!=reverse1): 
                final_type=4;   #101
                if(reverse1==reverse2):
                    final_type=5;
                addGame(3,bool2int(reverse2),final_type);
            else:
                global error111
                error111+=1;
                #print("111 error")
        else:
            print("score error in three games matches");
        return;
    
    
temp=[];
for i in range(games):
    scores=records[i][5].split(';');
    if(scores[0]!=scores[1]):
        print(scores[0],scores[1]);
    if(len(temp)==0 or checkGames(temp[0],records[i])):
        temp.append(records[i]);
    else:
        processMatch(temp);
        temp=[records[i]];
processMatch(temp);

print("processed games: ",len(processed_games));
print("error111: ", error111);
print("error10: ",error10);

            
    



        
        
# write processed data
with open('processeddata.csv', 'w') as out:
    out.write("Seq,Reverse,Pattern,Year,Tournament,Round,Match,Type,Scores\n");
    for i in range(len(processed_games)):
        if (processed_games[i][1]==1):
            print("heeh"+str(i))
        for j in range(9):
            out.write(str(processed_games[i][j]));
            if(j==8):
                out.write("\n");
            else:
                out.write(",");
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            