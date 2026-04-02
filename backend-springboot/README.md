# Huong dan chay Backend Spring Boot (Windows)

## 1) Yeu cau moi truong

- Java 17
- MySQL 8+
- Maven 3.9+

Kiem tra nhanh:

```powershell
java -version
mvn -version
```

Neu may bao khong tim thay `mvn`, can cai Maven va them vao `PATH`.

## 2) Tao database

Mo MySQL va tao database:

```sql
CREATE DATABASE car_rental;
```

## 3) Cau hinh bien moi truong

Project doc cac bien:

- DB_URL
- DB_USERNAME
- DB_PASSWORD
- JWT_SECRET
- JWT_EXPIRATION_MS
- UPLOAD_DIR

Ban co the set tam thoi trong PowerShell:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/car_rental?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="root"
$env:JWT_SECRET="replace-with-your-own-long-secret-1234567890"
$env:JWT_EXPIRATION_MS="604800000"
$env:UPLOAD_DIR="uploads"
```

## 4) Chay project

Trong thu muc backend-springboot:

```powershell
mvn spring-boot:run
```

Hoac build truoc:

```powershell
mvn clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## 5) Test nhanh API

Base URL:

- http://localhost:5000/api

Dang ky:

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyen A",
  "email": "a@example.com",
  "password": "secret123",
  "role": "owner"
}
```

Dang nhap:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "a@example.com",
  "password": "secret123"
}
```

Sau khi co token, gui header:

```text
Authorization: Bearer <token>
```

## 6) Loi thuong gap

- `mvn is not recognized`: chua cai Maven hoac chua them PATH.
- Loi ket noi MySQL: kiem tra `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
- 401 Unauthorized: thieu header Bearer token.
- Loi JWT secret qua ngan: doi chuoi JWT_SECRET dai hon (nen >= 32 ky tu).
