
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
//http kütüphanesinden server olusturduk ama bunu app kullanarak yani express kullanarak olusturudk
const server = http.createServer(app);

//serverimizi sockete bağladık . yani her io kullanışımızda socketteki genel sunucumuzla ilgili 
//işlem yapıyoruz demektir
const io = socketio(server);
const formatMessage = require('./utils/messages')
const {userJoin,getCurrentUser,userLeaves,getRoomUsers} = require('./utils/users');


//expresin kullanacağı dosyayı ayarladık.
app.use(express.static(path.join(__dirname, 'public')));

const botName = "Admin";

//Client bağlandığı zaman
io.on('connection',socket => {
    console.log('New WS Connection...');

    //Client herhangi bir odaya katıldıgı zaman olusacak olaylar.
    socket.on('joinRoom',({username,room}) => {

        const user = userJoin(socket.id,username,room);
        socket.join(user.room);

        socket.emit('message',formatMessage(botName,"Welcome"));

        //bu fonksiyon giren kullanıcı dışında herkese mesaj gönderir.
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));
        

        //Kullanıcıları ve oda bilgilerini gösterme
        io.to(user.room).emit('roomUsers',{
            room : user.room,
            users : getRoomUsers(user.room)
        });

        //client bağlantısını kopardığı zaman
        socket.on('disconnect' , () => {
            const user = userLeaves(socket.id);

            if(user){
                io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`)); 
                 }

            //Kullanıcıları ve oda bilgilerini gösterme
               io.to(user.room).emit('roomUsers',{
                   room : user.room,
                   users : getRoomUsers(user.room)
               });
           
        })
    })

    //client tarafında gönderdiğimiz chat message kısmını burda yakalıyoruz
    socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id);
        //mesaj gönderildiği zaman bu mesajın herkese gösterilebilmesi için
        //ioemiti kullanıyoruz
        io.to(user.room).emit('message',formatMessage(`${user.username}`,msg));
    });

})

//3000.port veya çevre değişkeninin portu olsun
const PORT = 3000 ||process.env.PORT;

//'npm run dev' dersek dev kısmında nodemon oldugu için onu çalıştırıcak
//ve konsoldan serveri canlı olarak izleyebileceğiz.
server.listen(PORT , () => console.log(`Server running on port : ${PORT}`));
