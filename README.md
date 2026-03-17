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

| DTO                   | Uso Principal                    | Características                                   |
| --------------------- | -------------------------------- | ------------------------------------------------- |
| **GameDTO**           | Feed, listados, cards            | Datos esenciales + estados de usuario             |
| **GameDetailDTO**     | Página de detalle del juego      | Info completa + juegos relacionados + comentarios |
| **GameFeedDTO**       | Feed vertical TikTok-style       | Ultra-ligero + estados de UI                      |
| **GameCalendarDTO**   | Vista calendario                 | Formato de fecha especial + prioridades           |
| **CreateGameRequest** | Formulario de registro de juegos | Validaciones + todos los campos editables         |

