var express = require('express');
var bodyParser = require('body-parser')
var mongoose = require('mongoose');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//Declare MongoDB Schemas


var dbUrl = "mongodb+srv://fatih:admin@gbc-learning.v1sqe.mongodb.net/User"

mongoose.connect(dbUrl , { useUnifiedTopology: true, useNewUrlParser: true }, (err) => {
  if (err) {
      console.log('mongodb connected',err);
  }else{
      console.log('Successfully mongodb connected');
  }
});

var Message = mongoose.model('Message',{
  name : String,
  message : String,
});

app.get('/room', (req, res) => {
  res.sendFile('room.html', { root: __dirname });
});
app.post('/', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} }
  res.redirect(req.body.room)
  // Send message that new room was created
  io.emit('room-created', req.body.room)
})

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})

app.post('/messages', (req, res) => {
  var message = new Message(req.body);
  message.save((err) =>{ 
    if(err)
    {
      //sendStatus(500);
      console.log(err)
    }

    //Send Message to all users
    io.emit('message', req.body);
    res.sendStatus(200);
  })
})

io.on("connection", socket => {
  console.log("user connected");


  socket.on("disconnect", function() {
    console.log("user disconnected");
  });

  //Someone is typing
  socket.on("typing", data => {
    socket.broadcast.emit("notifyTyping", {
      user: data.user,
      message: data.message
    });
  });

  //when soemone stops typing
  socket.on("stopTyping", () => {
    socket.broadcast.emit("notifyStopTyping");
  });

  socket.on("chat message", function(msg) {
    console.log("message: " + msg);

    //broadcast message to everyone in port:5000 except yourself.
    socket.broadcast.emit("received", { message: msg });

    //save chat to the database
    connect.then(db => {
      console.log("connected correctly to the server");
      let chatMessage = new Chat({ message: msg, sender: "Anonymous" });

      chatMessage.save();
    });
  });
});



var server = http.listen(3001, () => {
  console.log('http://localhost:3001', server.address().port);
});