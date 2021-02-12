
   var socket = io();
   socket.on("connect", () => {
        console.log(socket.id); 
    });

    
    socket.on("disconnect", () => {
        console.log("User disconnected"); 
    });
    

    $(() => {
        $("#send").click(()=>{
            sendMessage({name: $("#name").val(), message: $("#message").val()});
        })

        getMessages()
    })

    socket.on('message', addMessages)

    function addMessages(message){
        $("#messages").append(`<h4> ${message.name} </h4> <p> ${message.message} </p>`)
    }
  
    

    function getMessages(){
      $.get('http://localhost:3001/messages', (data) => {
        data.forEach(addMessages);
      })
    }

    function sendMessage(message){
      $.post('http://localhost:3001/messages', message)
    }


let messageInput = document.getElementById("message");
let typing = document.getElementById("typing");

//isTyping event
messageInput.addEventListener("keypress", () => {
  socket.emit("typing", { user: "Someone", message: "is typing..." });
});

socket.on("notifyTyping", data => {
  typing.innerText = data.user + " " + data.message;
  console.log(data.user + data.message);
});

//stop typing
messageInput.addEventListener("keyup", () => {
  socket.emit("stopTyping", "");
});

socket.on("notifyStopTyping", () => {
  typing.innerText = "";
});

socket.on('left the room',()=>{  
  try{
    console.log('[socket]','leave room :', socked.id);
    socket.leave(room);
    socket.to(room).emit('user left', socket.id);
  }catch(e){
    console.log('[error]','leave room :', e);
    socket.emit('error','couldnt perform requested action');
  }
})