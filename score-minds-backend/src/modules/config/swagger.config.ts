import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Score Minds API')
    .setDescription('API za predvidjanje sportskih rezultata')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Endpoints za autentifikaciju korisnika')
    .addTag('Users', 'Endpoints za upravljanje korisnicima')
    .addTag('Groups', 'Endpoints za upravljanje grupama')
    .addTag('Group Members', 'Endpoints za upravljanje članovima grupa')
    .addTag('Personal Predictions', 'Endpoints za upravljanje predikcijama')
    .addTag('Matches', 'Endpoints za upravljanje mecevima')
    .addTag('Players', 'Endpoints za upravljanje igracima')
    .addTag('Sync Data', 'Endpoints za punjnje tabela preko API')
    .addTag('Storage', 'Endpoints za upravljanje fajlovima')
    .addTag('Predictions Audit', 'Endpoints za praćenje promena predikcija')
    .addServer('http://localhost:3000', 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Score Minds API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6; }
      .swagger-ui .scheme-container { background: #1f2937; padding: 10px; border-radius: 4px; }
    `,
  });
}