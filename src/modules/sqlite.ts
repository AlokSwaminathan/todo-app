import { group } from "console";
import sqlite3 from "sqlite3";
import { callbackify } from "util";

sqlite3.verbose();

var db = new sqlite3.Database("database.db");

export const sqlFunctions = {
  loginUser: function (
    password: string,
    username: string,
    callback: any = function () {}
  ){
    db.get(
      "SELECT * FROM users WHERE password=? AND username=? ",
      [password, username],
      function (err: any, res: any) {
        //console.log("password, username, response: ",password, username,res);
        let canUserLogin: boolean = false;
        if (res !== undefined){ canUserLogin = true;}
        callback(canUserLogin);
      }
    );
  },

  signUpUser: function (body: any, callback: any = function () {}) {
    /*let overlap: any;
        db.get("SELECT * FROM users WHERE username=? ",[body.username], function(err:any, res:any){
            console.log("response: ",res);
            if (res === undefined){
               overlap = false; 
               console.log("undefined what");
            } else {
                overlap = true;
                console.log("exists");
            }
            console.log("test")
        });
        console.log("overlap: ",overlap);

        if (overlap === true){
            return false;
        }*/
    db.run(
      "INSERT INTO users (firstName, lastName, password, username, date_created) VALUES (?,?,?,?,?)",
      [body.fname, body.lname, body.password, body.username, new Date()],
      function (err: any, res: any) {
        //console.log(err);
        if (err) {
          if (err.errno === 19) {
            callback(false);
          }
        } else {
          callback(true);
        }
      }
    );
  },
  getID: function (username: string, callback: any = function (){
    
  }) {
    //console.log((db.all("SELECT * FROM users WHERE username=?",[username])),"username: ", username);
    db.all("SELECT * FROM users WHERE username=?",[username],function(err: any, res: any) {
      callback(username, res[0].id);
      //console.log("id, response: ",res[0].id,res);
    });
  },

  getGroups: function (userID: number,callback: any){
    db.all("SELECT * FROM groups WHERE userID=?",[userID], function(err: any, res: any){
      callback(res);
    });
  },
  
  addTask: function (form: any,userID: number, callback: any){
    //console.log("userID: ", userID);
    db.get("SELECT userRelatedID FROM todos WHERE userID=? ORDER BY userRelatedID DESC",[userID], function(err: any, response1: any){
      //console.log("userrelid:",res);
      let nextID = 1;
      if (response1) {
        nextID = response1.userRelatedID+1;
      }
      //console.log("nextid: ",nextID);
      db.run("INSERT INTO todos(userRelatedID, userID, todo, groupName, creationDate, dueDate, workStartTime, workEndTime, description, completed) VALUES (?,?,?,?,?,?,?,?,?,?)",[nextID, userID, form.todo,form.group, form.creationDateUnix, form.dueDateUnix, form.workStartUnix, form.workEndUnix, form.description, false], function (err:any, response:any){
        callback();
      });
    });
  },

  addGroup: function(name: string, color: string, userID: number, callback: any){
    db.get("SELECT relativeID FROM groups WHERE userID=? ORDER BY relativeID DESC",[userID], function(err: any, row: any){
      let nextID = 1;
      if (row){
        nextID = row.relativeID + 1;
      }
      db.all("SELECT * FROM groups WHERE userID=? AND groupName=?",[userID, name], function(error: any, matches: any){
        if (matches.length > 0){
          callback()
        } else {

            db.run("INSERT INTO groups VALUES (?,?,?,?)",[userID, name, color, nextID], function( err:any, runResponse: any){
            callback();
        });
        }
      })
    });
  },

  editGroup: function(name: string, color: string, relativeID: number,userID: number,callback: any){
    db.run("UPDATE groups SET groupName=?, color=? WHERE userID=? AND relativeID=?",[name,color,userID,relativeID], function(err: any, response: any){
      callback();
    });
  },

  deleteGroup: function(relativeID: number, userID: number, name: string, callback: any){
    //console.log("userID: ",userID);
    db.run("DELETE FROM groups WHERE userID=? AND relativeID=? AND groupName=?",[userID,relativeID,name], function(err: any, response: any){
      //console.log("error:",err);
      callback();
    });
  },

  deleteGroupWithTodos: function(name: string, relativeID: number, userID: number, callback:any) {
    db.run("DELETE FROM groups WHERE userID=? AND relativeID=? AND groupName=?",[userID,relativeID,name], function(err: any, response: any){
      db.run("DELETE FROM todos WHERE userID=? AND groupName=?",[userID,name],function(error: any, response: any){
        callback();
      });
    });
  },

  getTodosAndGroups: function(userID: number, callback:any){
    db.all("SELECT * FROM todos WHERE userID=?",[userID], function(err: any, response: any){
      db.all("SELECT * FROM groups WHERE userID=?",[userID],function(error: any, response2: any){
        callback(response, response2);
      });
    });
  },

  reverseCompletion: function(userID: number, relativeID: number, callback: any = function(){}) {
    db.get("SELECT completed FROM todos WHERE userID=? AND userRelatedID=?",[userID,relativeID], function(error: any, response: any){
      //console.log("error lvl 1:",error,"response: ",response);
      let completed = true;
      if (response.completed === 1){
        completed = false;
      }
      db.get("UPDATE todos SET completed=? WHERE userID=? AND userRelatedID=?",[completed,userID,relativeID],function(err: any, response2: any){
        //console.log("error lv 2: ", err)
        callback();
        
      });
    });
  },
  deleteSpecificTodo: function (userID: number, relativeID: number, callback: any){
    db.get("DELETE FROM todos WHERE userID=? AND userRelatedID=?",[userID,relativeID], function(err: any, response: any){
      callback();
    });
  }
};
