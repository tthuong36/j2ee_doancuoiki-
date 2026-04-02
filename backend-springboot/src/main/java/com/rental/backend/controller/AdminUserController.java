package com.rental.backend.controller;

import com.rental.backend.entity.User;
import com.rental.backend.entity.enums.UserRole;
import com.rental.backend.exception.ApiException;
import com.rental.backend.repository.UserRepository;
import com.rental.backend.service.ApiMapper;
import com.rental.backend.service.CurrentUserService;
import jakarta.transaction.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final ApiMapper apiMapper;

    @GetMapping
    public Map<String, Object> listUsers(
        @RequestParam(value = "q", required = false) String q,
        @RequestParam(value = "role", required = false) String role,
        @RequestParam(value = "isActive", required = false) Boolean isActive,
        @RequestParam(value = "page", defaultValue = "1") int page,
        @RequestParam(value = "limit", defaultValue = "10") int limit
    ) {
        int safePage = Math.max(1, page);
        int safeLimit = Math.max(1, limit);

        List<User> filtered = userRepository.findAll().stream()
            .filter(user -> q == null || matchesQuery(user, q))
            .filter(user -> role == null || user.getRole().name().equalsIgnoreCase(role))
            .filter(user -> isActive == null || Boolean.TRUE.equals(user.getIsActive()) == isActive)
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .toList();

        int total = filtered.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / safeLimit);
        int from = Math.min((safePage - 1) * safeLimit, total);
        int to = Math.min(from + safeLimit, total);

        List<Map<String, Object>> items = filtered.subList(from, to).stream()
            .map(apiMapper::user)
            .toList();

        Map<String, Object> pagination = new HashMap<>();
        pagination.put("page", safePage);
        pagination.put("limit", safeLimit);
        pagination.put("total", total);
        pagination.put("totalPages", totalPages);

        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("pagination", pagination);
        return response;
    }

    @GetMapping("/{id}")
    @Transactional
    public Map<String, Object> getUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return apiMapper.user(user);
    }

    @PatchMapping("/{id}/profile")
    @Transactional
    public Map<String, Object> updateProfile(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("phone")) user.setPhone((String) body.get("phone"));
        if (body.containsKey("address")) user.setAddress((String) body.get("address"));
        if (body.containsKey("avatar")) user.setAvatar((String) body.get("avatar"));

        if (body.containsKey("email")) {
            String email = ((String) body.get("email")).toLowerCase(Locale.ROOT).trim();
            if (userRepository.existsByEmailAndIdNot(email, id)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Email already exists");
            }
            user.setEmail(email);
        }

        userRepository.save(user);
        return apiMapper.user(user);
    }

    @PatchMapping("/{id}/role")
    @Transactional
    public Map<String, Object> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User current = currentUserService.getCurrentUser();
        if (current.getId().equals(id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Admin cannot change own role");
        }

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        String role = body.get("role");
        if (role == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "role is required");
        }

        user.setRole(parseRole(role));
        userRepository.save(user);
        return apiMapper.user(user);
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public Map<String, Object> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User current = currentUserService.getCurrentUser();
        if (current.getId().equals(id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Admin cannot change own status");
        }

        if (!body.containsKey("isActive")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "isActive is required");
        }

        Object isActiveRaw = body.get("isActive");
        if (!(isActiveRaw instanceof Boolean isActive)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "isActive must be true or false");
        }

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        user.setIsActive(isActive);
        userRepository.save(user);
        return apiMapper.user(user);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteUser(@PathVariable Long id) {
        User current = currentUserService.getCurrentUser();
        if (current.getId().equals(id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Admin cannot delete own account");
        }

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        userRepository.delete(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return response;
    }

    private boolean matchesQuery(User user, String q) {
        String query = q.toLowerCase(Locale.ROOT).trim();
        return containsIgnoreCase(user.getName(), query)
            || containsIgnoreCase(user.getEmail(), query)
            || containsIgnoreCase(user.getPhone(), query);
    }

    private boolean containsIgnoreCase(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private UserRole parseRole(String role) {
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        try {
            return UserRole.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid role");
        }
    }
}
