package com.rental.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    public String generateToken(Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
            .subject(String.valueOf(userId))
            .issuedAt(now)
            .expiration(expiry)
            .signWith(getSigningKey())
            .compact();
    }

    public Long extractUserId(String token) {
        Claims claims = Jwts.parser().verifyWith((javax.crypto.SecretKey) getSigningKey()).build()
            .parseSignedClaims(token)
            .getPayload();
        return Long.valueOf(claims.getSubject());
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith((javax.crypto.SecretKey) getSigningKey()).build()
                .parseSignedClaims(token)
                .getPayload();
            return claims.getExpiration().after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }

    private Key getSigningKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (Exception ex) {
            keyBytes = jwtSecret.getBytes();
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
