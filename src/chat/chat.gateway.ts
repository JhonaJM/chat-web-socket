import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io'


import { ChatService } from './chat.service';



@WebSocketGateway()
export class ChatGateway implements OnModuleInit {

  @WebSocketServer()
  public server: Server;


  constructor(private readonly chatService: ChatService) { }


  onModuleInit() {

    this.server.on('connection', (socket: Socket) => {

      const { name, token } = socket.handshake.auth;
      console.log({ name, token });
      if (!name) {
        socket.disconnect();
        return;
      }

      //Agregar cliente al listado
      this.chatService.onClientConnedted({ id: socket.id, name: name });

      // Mnesaje de bienvenida
      //socket.emit('welcome-message','Bienvenido al servidor'); // mensaje solo para el usuario que se conecta

      //listado de clients conectados
      this.server.emit('on-clients-changed', this.chatService.getClients()); //mensaje para todos los usuarios conectados

      socket.on('disconnect', () => {
        this.chatService.onClientDisconnedted(socket.id);
        this.server.emit('on-clients-changed', this.chatService.getClients()); //mensaje para todos los usuarios conectados
      });


    });

  }


  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket
  ) {

    const { name, token } = client.handshake.auth;

    console.log({name,message});
    if (!message) {
      return;
    }

    this.server.emit('on-message', {
      userId: client.id,
      message: message,
      name: name
    })
  }
}
