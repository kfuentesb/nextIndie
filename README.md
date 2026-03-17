# NextIndie

Requiere Maven Docker npm Java
```diff
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop bucket add java
scoop install java/openjdk
scoop install main/maven
mvn -v
-(reinicia)
```

Para probar el proyecto en local, ejecutamos el docker-compose.yml en backend e iniciamos SpringBoot
```diff
cd backend
-(tiene que estar up el docker)
docker compose up -d
-(esto crea las tablas automáticamente)
mvn spring-boot:run
-(Abre nuevocmd, inserta lo de init.sql en el terminal)
docker exec -it nextindie_db psql -U admin -d nextindie_db
```

Iniciar Angular front
```
cd ../nextIndie-web
ng serve --open
- http://localhost:4200/
```

| Archivo                   | Descripción                                       |
| ------------------------- | ------------------------------------------------- |
| `Genre.java`              | Entidad para géneros de juegos                    |
| `GameLike.java`           | Entidad para likes de usuarios a juegos           |
| `GameSave.java`           | Entidad para juegos guardados por usuarios        |
| `User.java`               | Entidad de usuario (requerida por las relaciones) |
| `Game.java`               | Entidad Game actualizada con relaciones           |
| `GenreRepository.java`    | Repositorio para géneros                          |
| `GameLikeRepository.java` | Repositorio para likes con queries útiles         |
| `GameSaveRepository.java` | Repositorio para guardados con notificaciones     |
| `GameCalendarDTO.java`    | DTO para vista de calendario                      |
| `GameDTO.java`            | DTO para listados de juegos                       |
| `GameDetailDTO.java`      | DTO para detalle de juego                         |

# Comandos para crear los archivos de ANGULAR
```
# 1. Crear el proyecto nuevo con Angular 21.2
ng new nextindie-frontend --style=scss --routing=true --skip-tests=true

# 2. Entrar al directorio
cd nextindie-frontend

# 3. Generar módulos y componentes (ejecutar en este orden)
ng generate module features/feed --routing=true
ng generate module features/auth --routing=true
ng generate module shared

ng generate component core/components/navbar
ng generate component shared/components/game-card

ng generate component features/feed/pages/feed-page
ng generate component features/feed/components/video-feed
ng generate component features/feed/components/comments-section

ng generate component features/auth/pages/login-page

ng generate service core/services/auth
ng generate service core/services/game
ng generate service core/services/comment

ng generate guard core/guards/auth
ng generate interceptor core/interceptors/jwt

ng generate class shared/models/game --type=model
ng generate class shared/models/user --type=model
ng generate class shared/models/comment --type=model

# 4. Instalar dependencias adicionales
npm install @angular/cdk
```

