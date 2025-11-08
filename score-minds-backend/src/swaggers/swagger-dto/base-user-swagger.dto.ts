import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseUserSwaggerDto {
    @ApiProperty({
        description: 'Jedinstveni identifikator korisnika',
        example: 1,
        type: 'integer'
    })
    id: number;

    @ApiProperty({
        description: 'Ime korisnika u aplikaciji',
        example: 'Mlacky',
        maxLength: 100
    })
    username: string;

    @ApiProperty({
        description: 'Email adresa korisnika',
        example: 'marko.petrovic@example.com',
        format: 'email'
    })
    email: string;

    @ApiPropertyOptional({
        description: 'Putanja do slike profila korisnika',
        example: 'https://example.com/avatars/user123.jpg'
    })
    profileImageUrl?: string;
}