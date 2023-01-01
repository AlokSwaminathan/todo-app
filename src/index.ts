import express, { Express, Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { sqlFunctions } from "./modules/sqlite";
import cookieParser from "cookie-parser";
import moment from "moment";
import { resolveTypeReferenceDirective } from "typescript";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../src/views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


function renderGroupEdit(req: Request, res: Response){
  sqlFunctions.getGroups(
    req.cookies["currentUser"].id,
    function (response: any) {
      //console.log(response);
      res.render("pages/groupEdit", { groups: response });
    }
  );

}



app.get("/", (req: Request, res: Response) => {
  if (req.cookies["currentUser"]) {
    res.redirect('/todos');
  } else {
    res.render("pages/index");
  }
});

app.get("/todos", (req: Request, res: Response) => {
  sqlFunctions.getTodosAndGroups(req.cookies['currentUser'].id, function(todosDB:any, groupsDB: any){
    let groupAssociations: {[key: string]: string} = {};
    //console.log("todos:",todosDB,'groups:',groupsDB)

    for (let i in todosDB){
      todosDB[i].dueDate = moment(new Date(todosDB[i].dueDate).toUTCString()).local(true).format("HH:mm MM-DD-YYYY ");
      if (todosDB[i].workStartTime){
      todosDB[i].workStartTime = moment(new Date(todosDB[i].workStartTime).toUTCString()).local(true).format("HH:mm MM-DD-YYYY ");
      }
      if (todosDB[i].workEndTime){
      todosDB[i].workEndTime = moment(new Date(todosDB[i].workEndTime).toUTCString()).local(true).format("HH:mm MM-DD-YYYY");
      }
    }

    for (let group of groupsDB){
      let color: string = group.color;
      let groupName: string = group.groupName;
      groupAssociations[groupName]=color;
        }
    //console.log(groupAssociations);

    res.render("pages/todo",{todos: todosDB, groupColor: groupAssociations})
  });
});

app.post('/deleteTodo', (req: Request, res: Response) =>{
  //console.log(req.body);
  sqlFunctions.deleteSpecificTodo(req.cookies['currentUser'].id,req.body.relativeID, function(){
    res.redirect('/todos');
  }
  );
});


app.get("/login", (req: Request, res: Response) => {
  res.render("pages/mainForm", {
    account: "login",
    failed: false,
    message: undefined,
  });
});

app.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("currentUser");
  res.redirect("/");
});

app.post("/login", (req: Request, res: Response) => {
  if (req.body.username.length !== 0 && req.body.password.length !== 0) {
    sqlFunctions.loginUser(
      req.body.password,
      req.body.username,
      function (canUserLogin: boolean) {
        if (canUserLogin) {
          sqlFunctions.getID(
            req.body.username,
            function (username1: string, id1: number) {
              res.cookie(
                "currentUser",
                { username: username1, id: id1 },
                { httpOnly: true }
              );
              res.redirect("/");
            }
          );
        } else {
          res.render("pages/mainForm", {
            account: "login",
            failed: true,
            message: "Account does not exist",
          });
        }
      }
    );
  } else {
    res.render("pages/mainForm", {
      account: "login",
      failed: true,
      message: "Fill out all fields",
    });
  }
});

app.get("/signUp", (req: Request, res: Response) => {
  res.render("pages/mainForm", {
    account: "signUp",
    failed: false,
    message: undefined,
  });
});

app.post("/signUp", (req: Request, res: Response) => {
  //console.log(req.body);
  //console.log(req.body.fname.length);
  var problems: Array<string> = [];
  //console.log(problems.concat("test").concat("\ntest"));
  if (
    req.body.fname.length === 0 ||
    req.body.lname.length === 0 ||
    req.body.password.length === 0 ||
    req.body.passwordConf.length === 0 ||
    req.body.username.length === 0
  ) {
    problems.push("Fill out all fields");
  }
  if (req.body.username.length < 3 && req.body.username.length > 0) {
    problems.push("Username must be over 2 characters");
  }
  if (
    req.body.password !== req.body.passwordConf &&
    req.body.password.length > 0
  ) {
    problems.push("Passwords don't match");
  }
  if (req.body.password.length < 6 && req.body.password.length > 0) {
    problems.push("Password must be at least 6 characters");
  }
  if (problems.length === 0) {
    sqlFunctions.signUpUser(req.body, function (accountCreatable: boolean) {
      if (accountCreatable) {
        sqlFunctions.getID(
          req.body.username,
          function (username1: string, id1: number) {
            res.cookie("currentUser", { username: username1, id: id1 });
            res.redirect("/");
          }
        );
      } else {
        problems.push("Username is already taken");
        res.render("pages/mainForm", {
          account: "signUp",
          failed: true,
          message: problems,
        });
      }
    });
  } else {
    console.log(problems);
    res.render("pages/mainForm", {
      account: "signUp",
      failed: true,
      message: problems,
    });
  }
});

app.get("/addTask", (req: Request, res: Response) => {
  sqlFunctions.getGroups(
    req.cookies["currentUser"].id,
    function (response: any) {
      //console.log(groups);
      res.render("pages/addTask", { groups: response });
    }
  );
});

app.post("/addTask", (req: Request, res: Response) => {
  let creationDate = new Date();
  let form = req.body;
  //console.log("request body: ", req.body);
  /*function isEmpty(string: String): boolean{if (string.length===0){return true;} return false;}
  if (isEmpty(form.todo) || isEmpty(form.dueDate) || isEmpty(form.group)){
  let groups: Array<string> = [];
  sqlFunctions.getGroups(req.cookies['currentUser'].id,function(response:any){
    for (let part of response){
      //console.log(part,part.groupName);
      groups.push(part.groupName);
    }
    //console.log(groups);
    res.render('pages/addTask',{groups: groups, message: "Fill out all required fields"})
  });
  } else{*/
  form.workStartUnix = Date.parse(form.workStartDateTime);
  form.dueDateUnix = Date.parse(form.dueDate);
  form.workEndUnix = Date.parse(form.workEndDateTime);
  form.creationDateUnix = creationDate.getTime();
  sqlFunctions.addTask(form, req.cookies["currentUser"].id, function () {
    res.redirect("/todos");
  });
});

app.get("/groupEdit", (req: Request, res: Response) => {
  renderGroupEdit(req, res);
});

app.post("/addGroup", (req: Request, res: Response) => {
  //console.log(req);
  sqlFunctions.addGroup(
    req.body.groupName,
    req.body.groupColor,
    req.cookies["currentUser"].id,
    function () {
      res.redirect('/groupEdit');
    }
  );
});

app.post("/editGroup", (req: Request, res: Response) => {
  //console.log("request body:",req.body)
  //console.log("rel ID:",req.body.relativeID);
  sqlFunctions.editGroup(req.body.groupName,req.body.groupColor,parseInt(req.body.relativeID),req.cookies['currentUser'].id, function(){
      res.redirect('/groupEdit');
  });
});

app.post("/deleteGroup", (req: Request, res: Response) => {
  //console.log("request body:",req.body)
  if (req.body.deleteTodos===true){
    sqlFunctions.deleteGroupWithTodos(req.body.groupName,parseInt(req.body.relativeID),req.cookies['currentUser'].id,function(){
      res.redirect('/groupEdit');
    });
  } else{
    sqlFunctions.deleteGroup(parseInt(req.body.relativeID),req.cookies['currentUser'].id,req.body.groupName, function(){
      res.redirect('/groupEdit');
    });
  }
});

app.post('/reverseCompletion',(req:Request, res:Response) => {
  //console.log(req);
  //console.log("request body: ", req.body);
  sqlFunctions.reverseCompletion(req.cookies['currentUser'].id,req.body.relativeID);
  res.end();
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
