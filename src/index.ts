import { WebSocket, WebSocketServer } from 'ws';

interface JoinPayload {
    type: "join";
    payload: {
      roomId: string;
      name: string;
    };
}
    
interface ChatPayload {
    type: "chat";
    payload: {
      message: string;
    };
}
  
type WebSocketMessage = JoinPayload | ChatPayload;


// ------------------- Further Enhancements - 1(A): START (Making a heartbeat function) --------------------------
// function heartbeat() {
//     this.isAlive = true;
// }
// ------------------- Further Enhancements - 1(A): END (Making a heartbeat function) -----------------------------


// WebSocket server listening on port 8080
const wss = new WebSocketServer({ port: 8080 });

// Log when the server is running
console.log('WebSocket server is running on ws://localhost:8080');


interface User{
    socket: WebSocket;
    roomId: string;
    name: string;
};


// let userCount:number = 0;

let allWebSocket: User[] = [];

wss.on("connection", (socket) => {

    // --------------------- Further Enhancements - 1(B): START ---------------------
    // socket.isAlive = true;
    // socket.on("pong", heartbeat);

    // --------------------- Further Enhancements - 1(B): END -----------------------


    // -------------------------Trial Coad : Start ---------------------------------
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
    //     }
    // })

    // -------------------------Trial Coad : End ---------------------------------

    socket.on("message", (message) => {
        let parsedMsg;

    try {
        const messageString = message.toString();
        parsedMsg = JSON.parse(messageString) as WebSocketMessage;
    } catch (error) {
        socket.send(JSON.stringify({ error: "Invalid JSON format" }));
        return;
    }

    // Validate the parsed message structure
    if (!parsedMsg || !parsedMsg.type || !parsedMsg.payload) {
        socket.send(JSON.stringify({ error: "Invalid message format" }));
        return;
    }

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

            // for(let i=0; i<allWebSocket.length; i++){
            //     //@ts-ignore
            //     if(allWebSocket[i].roomId==currentUserRoom){
            //         // allWebSocket[i].socket.send(currentUserName + ": " + parsedMsg.payload.message)
                    
            //         // ------ somthing i thought of and at backend it does json.parse() ------

            //         allWebSocket[i].socket.send(JSON.stringify({
            //             name: currentUserName,
            //             message: parsedMsg.payload.message
            //         }))

            //         // -----------------------------------------------------------------------
            //     }
            // }

            for (const user of allWebSocket) {
                if (user.roomId === currentUserRoom) {
                    try {
                        user.socket.send(JSON.stringify({
                            type: "chat",
                            payload: {
                                name: currentUserName,
                                message: parsedMsg.payload.message,
                            }
                        }));
                    } catch (error) {
                        console.error("Error sending message:", error);
                    }
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
                try{
                    user.socket.send(JSON.stringify({
                        type: "system",
                        payload: {
                            name: disconnectedUser.name,
                            message: `${disconnectedUser.name} has left the room.`,
                        }
                    }));
                }catch (error) {
                    console.error("Error sending message:", error);
                }
            }
          });
        }
    });
})

// ------------------- Further Enhancements - 1(C): START (Checking if socket is alive) --------------------------

// setInterval(() => {
//     wss.clients.forEach((socket) => {
//       if (!socket.isAlive) return socket.terminate();
  
//       socket.isAlive = false;
//       socket.ping();
//     });
// }, 30 * 1000);

// ------------------ Further Enhancements - 1(C): END (Checking if socket is alive) ----------------------------