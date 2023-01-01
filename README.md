# TODO-APP
#### Video Demo:  <URL HERE>
#### Description: 
This project uses **Node.js**, which was used because it is the standard for backend web development, and I chose it over flask to gain experience in it
and Typescript, which was used because it would help deal with many of the typing issues of Javascript and help me avoid runtime errors and catch them in compilation instead, and the following NPM Libraries:
  **SQLITE 3**: For storing Users, Todos, and Groups locally, without having to establish a connection to any sort of server.
  **Express**: To simplify the process of routing, and also made it easier to set cookeis
  **dotenv**: To store away environment variables in secret, although it was only used for the PORT
  **EJS**: In order to be able to use javascript to automate the formation of HTML components so that pages could actively respond to server side updates.
  **moment**: Used to easily be able to convert time between timezones, as in the database all time was in UTC
  **body-parser**: Used so that Request data could be parsed more easily
  **cookie-parser**: Used so that cookies could be read more easily
  **nodemon**: Used so that when the web app was running, as I saved files the app would reload and update with the files
  **ts-node**: Allowed nodemon to work with typescript and actively compile the files to Javascript and then run them
  
  ![](/images/homeNoLogin.png)
  This is the home screen before you log in, very barebones and just leads you to logging in or signing up
  
   ![](/images/SignUp.png)
   This is the sign up screen, where you go to make an account, when you submit it makes sure all fields are filled, and if they are, it checks if your username is over 2 characters, if your password is over 5 characters, and if your password and password confirmation match using in page javascript. If all of those conditions are satisfied your username will be cross checked with the users database to see if it exists, and if it does and error will be given so a unique username can be entered.
  
  ![](/images/login.png)
  This is the login screen, which prompts you for username and password, and then cross checks them with the sqlite3 users database and returns an error mesasge if it doesn't match, and sends you to the logged in home page if it does.
  
   ![](/images/home.png)
   Now that you are logged in, this is the home page, which loads up all of your todos. It shows the different bits of information about your todo, and parses the time into your timezone and a readable format. You also have the option to delete each todo, or mark it as completed. The show completed button at the top will decide whether you see the completed todos or not. It also has a new header than you can use to return to it, or to log out of your account, this header is in all the pages you see once you are logged in. You can also choose to add a new todo, or edit the groups that you can put your todos in. 
   
   ![](/images/addTask.png)
   This is where you add a task, and only 3 of the 6 given fields are required. Todos do not need to be unique, and to get added all that is needed it a valid date in the Due Date, selection of some group or none at all, and some form of todo. If you want to add groups you can go home using the home button and choose the edit groups option.
   
    ![](/images/addGroup.png)
    In this page you can see all of your groups, along with the colors that you have chosen for them, if you want, you can add a new group entirely and name it whatever you like, as long at it doesn't overlap, and give it any color that isn't completely white. If either of those two conditions aren't met, the group will be rejected by client side javascript. Once it gets through to the server, the todo is added and the page is refreshed to hold the new todo. You can also choose to click on a todo so you can edit its name and color, or choose to delete it, prompting a confirmation. When confirming the deletion of a todo, you can make the option to remove all of the tasks corresponding to it as well.
    
