import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientGrpcProxy } from '@nestjs/microservices';
import { UserDTO } from 'src/dto/user.dto';

@Injectable()
export class RabbitMqUserClientProvider {

  constructor(
    @Inject('USER_CLIEN') private readonly client : ClientGrpcProxy,
  ){}


  /*
   * kirim data user atau supervisor jika sudahh jadi supervoisor 
   * Note : 
   * - 
   */ 
  async sendUserData(user : UserDTO , isSupervosir  = false ) : Promise<void> {

    try {
      this.client.send("user",{ 
        username : user.username ,
        role  : user.role, 
        akun : isSupervosir ? "user" : "supervisor",

        discord_id : user.discordId ,
        telegram_id : user.telegramId, 

      })
      
    }catch (err){
      console.error("erro di send user ke RabbitMqUserClientProvid : ",err);

      throw new InternalServerErrorException(
      "Gagal mengirim data ke queue user : " + err,
      )
    }

  }
}
