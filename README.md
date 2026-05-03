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
   -(tiene que estar up el docker)
   docker compose up -d
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
- **Comentar, guardar y descubrir juegos**
- Interactuar con contenido visual (trailers)
- Priorizar juegos relevantes

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
  - Likes (_pendiente_)
  - Guardados
  - Compartir

---

## 🗃️ Modelo de Datos (ERD)

### Entidades principales

- **User**
- **Game**
- **Comment**
- **SavedGames**

#### Relaciones clave

- Un usuario puede comentar y guardar múltiples juegos
- Un juego puede tener múltiples comentarios y ser guardado por múltiples usuarios

---

### 📊 Diagrama ER Base - NextIndie

<img width="409" height="998" alt="next_indie_db_entrega3" src="https://github.com/user-attachments/assets/4da99f9b-223b-407e-a81b-a0a02480a83a" />


---

## 🛠️ Futuras Mejoras

- 👍 **Tabla `gameLike`**: likes en juegos
- ❤️ **Tabla `commentLike`**: likes en comentarios
- 🔎 Búsqueda avanzada
- 📅 Calendario completo

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
# PostgreSQL Configuration (Docker)
spring.datasource.url=jdbc:postgresql://localhost:5432/nextindie_db
spring.datasource.username=admin
spring.datasource.password=pass123
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# JWT
jwt.secret=Kv6tQBl8c4gnu04ng4lmpQpn9vEroCL4eTzT5J3udXYp6vZjJwM17E+QaXoFsZT98Untrxyc8C8pbFh7hMOwRg==
jwt.expiration=86400000

# Server
server.port=8080
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

        <!-- Angular build -->
        <plugin>
            <groupId>com.github.eirslett</groupId>
            <artifactId>frontend-maven-plugin</artifactId>
            <version>1.15.0</version>
            <configuration>
                <workingDirectory>nextIndie-web</workingDirectory>
            </configuration>
            <executions>
                <execution>
                    <id>install-node-and-npm</id>
                    <goals>
                        <goal>install-node-and-npm</goal>
                    </goals>
                    <configuration>
                        <nodeVersion>v20.11.1</nodeVersion>
                        <npmVersion>10.2.4</npmVersion>
                    </configuration>
                </execution>
                <execution>
                    <id>npm-install</id>
                    <goals>
                        <goal>npm</goal>
                    </goals>
                    <configuration>
                        <arguments>install</arguments>
                    </configuration>
                </execution>
                <execution>
                    <id>npm-build</id>
                    <phase>compile</phase>
                    <goals>
                        <goal>npm</goal>
                    </goals>
                    <configuration>
                        <arguments>run build</arguments>
                    </configuration>
                </execution>
            </executions>
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

> Detalles para despliegue pendiente de añadir...

---
