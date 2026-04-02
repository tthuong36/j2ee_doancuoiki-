package com.rental.backend.controller;

import com.rental.backend.dto.auth.ChangePasswordRequest;
import com.rental.backend.dto.auth.LoginRequest;
import com.rental.backend.dto.auth.RegisterRequest;
import com.rental.backend.dto.auth.TokenResponse;
import com.rental.backend.entity.User;
import com.rental.backend.entity.enums.UserRole;
import com.rental.backend.exception.ApiException;
import com.rental.backend.repository.UserRepository;
import com.rental.backend.security.JwtService;
import com.rental.backend.service.ApiMapper;
import com.rental.backend.service.CurrentUserService;
import com.rental.backend.service.FileStorageService;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;
    private final ApiMapper apiMapper;
    private final FileStorageService fileStorageService;

    @PostMapping("/register")
    public TokenResponse register(@Valid @RequestBody RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase(Locale.ROOT).trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        UserRole role = parseRegisterRole(request.getRole());

        User user = new User();
        user.setName(request.getName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        userRepository.save(user);

        String token = jwtService.generateToken(user.getId());
        return new TokenResponse(token);
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase(Locale.ROOT).trim())
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid credentials");
        }
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Account is inactive");
        }

        String token = jwtService.generateToken(user.getId());
        return new TokenResponse(token);
    }

    @GetMapping("/me")
    public Map<String, Object> me() {
        return apiMapper.user(currentUserService.getCurrentUser());
    }

    @PutMapping(value = "/me", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> updateMeJson(@RequestBody Map<String, Object> body) {
        if (body.containsKey("email")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email update is not supported in this endpoint");
        }

        User user = currentUserService.getCurrentUser();
        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("phone")) user.setPhone((String) body.get("phone"));
        if (body.containsKey("address")) user.setAddress((String) body.get("address"));
        userRepository.save(user);

        return apiMapper.user(user);
    }

    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> updateMeMultipart(
        @RequestParam(value = "name", required = false) String name,
        @RequestParam(value = "phone", required = false) String phone,
        @RequestParam(value = "address", required = false) String address,
        @RequestParam(value = "avatar", required = false) MultipartFile avatar,
        @RequestParam(value = "email", required = false) String email,
        jakarta.servlet.http.HttpServletRequest request
    ) {
        if (email != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email update is not supported in this endpoint");
        }

        User user = currentUserService.getCurrentUser();
        if (name != null) user.setName(name);
        if (phone != null) user.setPhone(phone);
        if (address != null) user.setAddress(address);

        if (avatar != null && !avatar.isEmpty()) {
            String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + "/api";
            user.setAvatar(fileStorageService.storeAvatar(avatar, baseUrl));
        }

        userRepository.save(user);
        return apiMapper.user(user);
    }

    @PatchMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        if (request.getNewPassword().length() < 6) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "newPassword must be at least 6 characters");
        }

        User user = currentUserService.getCurrentUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "Password updated successfully");
        return ResponseEntity.ok(body);
    }

    private UserRole parseRegisterRole(String role) {
        if (role == null) {
            return UserRole.USER;
        }
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        if ("OWNER".equals(normalized)) {
            return UserRole.OWNER;
        }
        return UserRole.USER;
    }
}
