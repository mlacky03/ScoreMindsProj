import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserRepository } from 'src/infrastucture/persistence/repositories/user.repository';
import { User } from 'src/domain/models/user.model';

@Controller()
export class UserWorker {
    constructor(
        private readonly userRepo: UserRepository
    ) {}

    @EventPattern('create_user')
    async handleCreateUser(@Payload() data: any) {       
        const newUser = new User(
            null, 
            data.username,
            data.email,
            data.passwordHash,
            new Date(), 
            data.profileImageUrl || null
        );

        await this.userRepo.save(newUser);
    }

    @EventPattern('update_user')
    async handleUpdateUser(@Payload() data: any) {

        const user = await this.userRepo.findById(data.id);
        
        if (user) {
            
            user.updateUser(data.username, data.email, data.profileImageUrl);
           
            await this.userRepo.save(user);           
        }
    }

    
    @EventPattern('update_user_avatar')
    async handleUpdateAvatar(@Payload() data: any) {

        const user = await this.userRepo.findById(data.id);

        if (user) {
            user.updateProfileImage(data.url);
            
            await this.userRepo.save(user);
            
        }
    }
}