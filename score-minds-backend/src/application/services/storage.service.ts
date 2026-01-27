import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Controller, Logger } from '@nestjs/common';

@Injectable()
export class StorageService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  private logger = new Logger(StorageService.name);
  private bucket = process.env.SUPABASE_BUCKET || "scoremindsavatar";
  
  async uploadUserAvatar(id: string | string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file');
    this.logger.log(`Pokušaj uploada za korisnika ${id} u kantu: ${this.bucket}`);
    const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
    const key = `users/${id}/avatar_${Date.now()}.${ext}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(key, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw new BadRequestException(error.message);

    return {path: key, url: this.getPublicUrl(key)};
  }

  async uploadGroupCover(groupId: number | string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file');

    const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
    const key = `groups/${groupId}/cover_${Date.now()}.${ext}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(key, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw new BadRequestException(error.message);

    return {path: key, url: this.getPublicUrl(key)};
  }

  getPublicUrl(path: string) {
    return `${process.env.SUPABASE_URL}/storage/v1/object/public/${this.bucket}/${encodeURI(path)}`;
  }

}