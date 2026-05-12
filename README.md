# 🎮 NextIndie

> Plataforma para descubrir, comentar y guardar videojuegos  
> _Frontend: React + Vite | Backend: Spring Boot | PostgreSQL en Docker_

---

## 📑 Índice

- [🔧 Requisitos y Instalación](#-requisitos-y-instalación)
- [🚀 Cómo ejecutar el proyecto](#-cómo-ejecutar-el-proyecto)
- [⚛️ Comandos de React](#️-comandos-de-react)
- [🧠 Descripción General](#-descripción-general)
- [👤 Sistema de Usuarios](#-sistema-de-usuarios)
- [🎮 Gestión de Juegos](#-gestión-de-juegos)
- [🗃️ Modelo de Datos (ERD)](#️-modelo-de-datos-erd)
- [🗂️ Estructura de Carpetas](#️-estructura-de-carpetas)
- [⚙️ application.properties](#️-applicationproperties)
- [📦 POM (Maven)](#-pom-maven)
- [🛠️ Tecnologías](#️-tecnologías)
- [🚢 Despliegue](#-despliegue)

---

## 🔧 Requisitos y Instalación

> **Necesario:** Maven, Docker, npm, Java

```diff
# Instala Java, Maven y Scoop (en Windows)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop bucket add java
scoop install java/openjdk
scoop install main/maven
mvn -v
-(reinicia)
```

---

## 🚀 Cómo ejecutar el proyecto

1. Ejecuta Docker:
   ```diff
   - En raiz:
   docker compose up --build -d
   ```
   _(Esto crea las tablas automáticamente)_
2. Inicia Spring Boot:
   ```diff
   mvn spring-boot:run
   ```
3. Abre una nueva terminal y accede a la base de datos:
   ```diff
   docker exec -it nextindie_db psql -U admin -d nextindie_db
   ```

---

## ⚛️ Comandos de React

```shell
# Opción A: Crear React con Vite (más rápido y ligero)
npm create vite@latest . -- --template react-ts

# Instalar dependencias
npm install

# En caso de proyecto clonado, proceder desde aquí
npm install react-router-dom axios

# Iniciar servidor de desarrollo, dentro de frontend
npm run dev
```

---

## 🧠 Descripción General

Plataforma centrada en videojuegos donde usuarios podrán:
- **Descubrir nuevos juegos indies**
- Ver un feed vertical de trailers de juegos
- Consultar mediante un calendario nuevos lanzamientos
- Ver los juegos más queridos por la comunidad

**Vistas principales**:
- 📺 *VideoFeed* (centrada en trailers)
- 📅 *Vista calendario* (_pendiente_)
- ⭐ *Vista ranking* (_pendiente_)

---

## 👤 Sistema de Usuarios

- Iniciar sesión
- Comentar juegos ilimitadamente
- Guardar juegos en una lista personal
- Consultar y personalizar perfil

> ⚠️ Los usuarios NO pueden modificar juegos, solo interactuar.

---

## 🎮 Gestión de Juegos

Cada juego:
- 🎥 **Trailer obligatorio**
- 📅 **Fecha de lanzamiento**
- 📝 **Comentarios**
- ❤️ **Interacciones sociales**
  - Likes
  - Guardados
  - Compartir

---

## 🗃️ Modelo de Datos (ERD)

### Entidades principales

- **User**
- **Game**
- **Comment**
- **Genre**
- **Platform**

#### Relaciones clave

- Un usuario auténticado puede comentar y guardar múltiples juegos
- Un juego puede tener múltiples comentarios y ser guardado por múltiples usuarios

---

### 📊 Diagrama ER Base - NextIndie
<img width="890" height="738" alt="nextindie_db_diagram" src="https://github.com/user-attachments/assets/880d3ae5-be8a-4c74-a4a1-d937acd8261d" />

---

## 🗂️ Estructura de Carpetas

```shell
nextindie/
├── backend/            # Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/nextindie.api/
│   │   │   │       ├── NextindieApplication.java
│   │   │   │       ├── config/
│   │   │   │       ├── controller/
│   │   │   │       ├── service/
│   │   │   │       ├── repository/
│   │   │   │       ├── model/
│   │   │   │       ├── security/
│   │   │   │       └── exception/
│   │   │   └── resources/
│   │   └── test/
│   ├── target/
│   ├── .mvn/
│   ├── mvnw
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/           # React + Vite + TS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── dist/
│   ├── node_modules/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
└── deploy.sh           # Script opcional
```

---

## ⚙️ application.properties

```properties
spring.application.name=NextIndie

# Render PostgreSQL.
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION_MS:86400000}

# Server
server.port=${PORT:8080}

# CORS
app.cors.allowed-origins=${APP_CORS_ALLOWED_ORIGINS}

# IGDB
igdb.api.base-url=https://api.igdb.com/v4
igdb.api.token-url=https://id.twitch.tv/oauth2/token
igdb.api.client-id=${IGDB_CLIENT_ID}
igdb.api.client-secret=${IGDB_CLIENT_SECRET}
```

---

## 📦 POM (Maven)

### Dependencias

<details>
<summary><b>Mostrar dependencias</b></summary>

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <scope>runtime</scope>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc-test</artifactId>
        <scope>test</scope>
    </dependency>
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.6</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>
    <!-- Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
    <!-- PostgreSQL -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <!-- Validación -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <!-- Seguridad -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
</dependencies>
```
</details>

---

### Plugins

<details>
<summary><b>Mostrar plugins</b></summary>

```xml
<build>
    <plugins>
        <!-- Compilador -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <annotationProcessorPaths>
                    <path>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                    </path>
                </annotationProcessorPaths>
            </configuration>
        </plugin>

        <!-- Spring Boot -->
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <excludes>
                    <exclude>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                    </exclude>
                </excludes>
            </configuration>
        </plugin>
    </plugins>
</build>
```
</details>

---

## 🛠️ Tecnologías

- **Frontend:**  
  - React + Vite (2026)
  - TypeScript
  - Principales librerías:
    - `"axios": "^1.13.6"`
    - `"react": "^19.2.4"`
    - `"react-dom": "^19.2.4"`
    - `"react-router-dom": "^7.13.1"`

- **Backend:**  
  - Spring Boot Java 4.0.1

- **Base de datos:**  
  - PostgreSQL (en Docker)

---

## 🚢 Despliegue

Configurar variables de entorno para el host actual
- URL: https://nextindie-frontend.onrender.com/

---
