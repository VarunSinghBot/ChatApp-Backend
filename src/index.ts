import { WebSocket, WebSocketServer } from 'ws';

// WebSocket server listening on port 8080
const wss = new WebSocketServer({ port: 8080 });

// wss.on('connection', function connection(ws) {
//     console.log("WS-Connected");

//     // Handle errors on the WebSocket connection
//     ws.on('error', console.error);

//     // Send a welcome message to the newly connected client
//     ws.send('Hello Sockets');

//     // let num:number = 1; 
//     // ws.send(`The Number is: ${num}`);
//     // setInterval(()=>{
//     //     num+=1;
//     //     ws.send(`The Number updated (after 05 sec): ${num}`);
//     // },500)

//     // Listen for incoming messages from clients
//     ws.on('message', function message(data) {
//         console.log('received: %s', data);

//         if(data.toString() === "ping"){
//             ws.send(`Pong`)
//         } else {
//             ws.send(`${data}`);
//         };
//     });
// });

// Log when the server is running
console.log('WebSocket server is running on ws://localhost:8080');



interface User{
    socket: WebSocket;
    roomId: string;
    name: string;
};


let userCount:number = 0;
// let allWebSocket: WebSocket[] = [];

let allWebSocket: User[] = [];

// [{socket:123, roomId:red, name:varun},{socket:124, roomId:red, name:ravi}]

// {
//     type: "chat",
//     payload: {
//         "message": "abcdefg"
//     }
// }

wss.on("connection", (socket) => {

    // allWebSocket.push(socket);

    // console.log("User Connected!")
    // userCount+=1;
    // console.log("Total User Connected:", userCount);

    // socket.on("message", (ev)=> {
    //     console.log("msg: "+ ev.toString());
        // for (let i = 0; i < allWebSocket.length; i++){
        //     const s = allWebSocket[i];
        //     s.send("Msg from the server: " + ev.toString());
        // }

    //     allWebSocket.forEach(s => {
    //         s.send("Msg from the server: " + ev.toString());
    //     })
    //     socket.on("disconnect", ()=>{
    //         allWebSocket.filter( o => o != socket )
    //     });
    // })

    socket.on("message", message => {
        //@ts-ignore
        const parsedMsg = JSON.parse(message);
        if(parsedMsg.type == "join"){
            allWebSocket.push({
                socket,
                roomId: parsedMsg.payload.roomId,
                name: parsedMsg.payload.name,
            })
            console.log("User Connected!")
        }

        if(parsedMsg.type == "chat"){
            //@ts-ignore
            // const currentUserRoom = allWebSocket.find( x => x.socket === socket).roomId;

            let currentUserRoom = null;
            let currentUserName = null;
            for(let i=0; i<allWebSocket.length; i++){
                if(allWebSocket[i].socket == socket){
                    currentUserRoom = allWebSocket[i].roomId;
                    currentUserName = allWebSocket[i].name;
                    // console.log(allWebSocket);
                    // console.log();
                    // console.log(currentUserName + "__" + currentUserRoom);
                }
            }

            for(let i=0; i<allWebSocket.length; i++){
                //@ts-ignore
                if(allWebSocket[i].roomId==currentUserRoom){
                    allWebSocket[i].socket.send(currentUserName + ": " + parsedMsg.payload.message)
                }
            }
        }
    })
    
    socket.on("close", () => {
        const disconnectedUserIndex = allWebSocket.findIndex((user) => user.socket === socket);
        if (disconnectedUserIndex !== -1) {
          const disconnectedUser = allWebSocket[disconnectedUserIndex];
          allWebSocket.splice(disconnectedUserIndex, 1);
          console.log(`${disconnectedUser.name} disconnected from room ${disconnectedUser.roomId}`);
    
          // Notify other users in the same room
          allWebSocket.forEach((user) => {
            if (user.roomId === disconnectedUser.roomId) {
              user.socket.send(`${disconnectedUser.name} has left the room.`);
            }
          });
        }
      });

    socket.on("disconnect", socket => {
        allWebSocket.filter(x => x.socket != socket)
    })
})


