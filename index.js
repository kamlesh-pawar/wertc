
var os = require('os');
const { createServer } = require("http");
var socketIO = require('socket.io');
var express = require('express');
 
const app = express();
app.use(express.json({ extended: false }));
app.use(express.static('public'))
const port = process.env.PORT || 5000;
const server = createServer(app);
server.listen(port, () => console.info(`Server running on port: ${port}`));
var io = socketIO.listen(server,{  cors: {
   origin: "https://wertc.vercel.app",
   methods: ["GET", "POST"]
 }});
 

//all connected to the server users 
var users = {};
let activeSockets = [];
//when a user connects to our sever 
// io.on('connection', function(connection) {
  
//    console.log("User connected");
	
//    //when server gets a message from a connected user 
//    connection.on('message', function(message) { 
      
//       var data; 
//       console.log("Input JSON",message);
//       //accepting only JSON messages 
//       try { 
//          data = JSON.parse(message); 
//       } catch (e) { 
//          console.log("Invalid JSON"); 
//          data = {}; 
//       }
		
//       //switching type of the user message 
//       switch (data.type) { 
//          //when a user tries to login
//          case "login": 
//             console.log("User logged", data.name); 
				
//             //if anyone is logged in with this username then refuse 
//             if(users[data.name]) { 
//                sendTo(connection, { 
//                   type: "login", 
//                   success: false 
//                }); 
//             } else { 
//                //save user connection on the server 
//                users[data.name] = connection; 
//                connection.name = data.name; 
					
//                sendTo(connection, { 
//                   type: "login", 
//                   success: true 
//                }); 
//             } 
				
//             break;
				
//          case "offer": 
//             //for ex. UserA wants to call UserB 
//             console.log("Sending offer to: ", data.name);
				
//             //if UserB exists then send him offer details 
//             var conn = users[data.name]; 
				
//             if(conn != null) { 
//                //setting that UserA connected with UserB 
//                connection.otherName = data.name; 
					
//                sendTo(conn, { 
//                   type: "offer", 
//                   offer: data.offer, 
//                   name: connection.name 
//                }); 
//             }
				
//             break;
				
//          case "answer": 
//             console.log("Sending answer to: ", data.name); 
//             //for ex. UserB answers UserA 
//             var conn = users[data.name]; 
				
//             if(conn != null) { 
//                connection.otherName = data.name; 
//                sendTo(conn, { 
//                   type: "answer", 
//                   answer: data.answer 
//                }); 
//             } 
				
//             break; 
				
//          case "candidate": 
//             console.log("Sending candidate to:",data.name); 
//             var conn = users[data.name];
				
//             if(conn != null) { 
//                sendTo(conn, { 
//                   type: "candidate", 
//                   candidate: data.candidate 
//                }); 
//             } 
				
//             break;
				
//          case "leave": 
//             console.log("Disconnecting from", data.name); 
//             var conn = users[data.name]; 
//             conn.otherName = null; 
				
//             //notify the other user so he can disconnect his peer connection 
//             if(conn != null) {
//                sendTo(conn, { 
//                   type: "leave" 
//               }); 
//             }
				
//             break;
				
//          default: 
//             sendTo(connection, { 
//                type: "error", 
//                message: "Command not found: " + data.type 
//             }); 
				
//             break; 
//       }
		
//    }); 
	
//    //when user exits, for example closes a browser window 
//    //this may help if we are still in "offer","answer" or "candidate" state 
//    connection.on("close", function() { 
	
//       if(connection.name) { 
//          delete users[connection.name]; 
			
//          if(connection.otherName) { 
//             console.log("Disconnecting from ", connection.otherName); 
//             var conn = users[connection.otherName]; 
//             conn.otherName = null;
				
//             if(conn != null) { 
//                sendTo(conn, { 
//                   type: "leave" 
//                }); 
//             }
//          } 
//       }
		
//    });  
	
//    connection.send("Hello world");  
// });

io.on("connection", (socket) => {
   socket.on("disconnect", () => {
     activeSockets = activeSockets.filter(
       (existingSocket) => existingSocket !== socket.id
     );
     socket.broadcast.emit("remove-user", {
       socketId: socket.id,
     });
   });

   socket.on("call-user", (data) => {
     socket.to(data.to).emit("call-made", {
       offer: data.offer,
       socket: socket.id,
     });
   });

   socket.on("make-answer", (data) => {
     socket.to(data.to).emit("answer-made", {
       socket: socket.id,
       answer: data.answer,
     });
   });

   const existingSocket = activeSockets.find(
     (existingSocket) => existingSocket === socket.id
   );

   if (!existingSocket) {
     activeSockets.push(socket.id);

     socket.emit("update-user-list", {
       users: activeSockets.filter(
         (existingSocket) => existingSocket !== socket.id
       ),
     });

     socket.broadcast.emit("update-user-list", {
       users: [socket.id],
     });
   }
 });
  
function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}