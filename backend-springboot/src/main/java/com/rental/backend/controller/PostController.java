package com.rental.backend.controller;

import com.rental.backend.dto.post.CreatePostRequest;
import com.rental.backend.dto.post.ReviewPostRequest;
import com.rental.backend.entity.Car;
import com.rental.backend.entity.Post;
import com.rental.backend.entity.User;
import com.rental.backend.entity.enums.PostStatus;
import com.rental.backend.entity.enums.PostType;
import com.rental.backend.entity.enums.UserRole;
import com.rental.backend.exception.ApiException;
import com.rental.backend.repository.CarRepository;
import com.rental.backend.repository.PostRepository;
import com.rental.backend.service.ApiMapper;
import com.rental.backend.service.CurrentUserService;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostRepository postRepository;
    private final CarRepository carRepository;
    private final CurrentUserService currentUserService;
    private final ApiMapper apiMapper;

    @GetMapping
    @Transactional
    public List<Map<String, Object>> listPublicPosts(
        @RequestParam(value = "postType", required = false) String postType,
        @RequestParam(value = "location", required = false) String location
    ) {
        List<Post> posts;
        if (postType != null) {
            posts = postRepository.findByActiveTrueAndStatusAndPostTypeOrderByCreatedAtDesc(PostStatus.APPROVED, parsePostType(postType));
        } else {
            posts = postRepository.findByActiveTrueAndStatusOrderByCreatedAtDesc(PostStatus.APPROVED);
        }

        return posts.stream()
            .filter(post -> location == null || containsIgnoreCase(post.getLocation(), location))
            .map(apiMapper::post)
            .toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','OWNER','ADMIN')")
    @Transactional
    public Map<String, Object> createPost(@RequestBody CreatePostRequest request) {
        if (request.getPostType() == null || request.getTitle() == null || request.getContent() == null || request.getLocation() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "postType, title, content, location are required");
        }

        User currentUser = currentUserService.getCurrentUser();
        Post post = new Post();
        post.setAuthor(currentUser);
        post.setPostType(parsePostType(request.getPostType()));
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setLocation(request.getLocation());
        post.setContactPhone(request.getContactPhone());
        post.setBudgetPerDay(request.getBudgetPerDay());
        post.setStatus(PostStatus.PENDING);
        post.setActive(true);

        if (request.getCar() != null) {
            Car car = carRepository.findById(request.getCar())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Car not found"));
            post.setCar(car);
        }

        postRepository.save(post);
        return apiMapper.post(post);
    }

    @GetMapping("/me/list")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public List<Map<String, Object>> myPosts() {
        User currentUser = currentUserService.getCurrentUser();
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(currentUser.getId())
            .stream()
            .map(apiMapper::post)
            .toList();
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public Map<String, Object> updatePost(@PathVariable Long id, @RequestBody CreatePostRequest request) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));

        User currentUser = currentUserService.getCurrentUser();
        validatePostOwnership(post, currentUser);

        if (request.getPostType() != null) post.setPostType(parsePostType(request.getPostType()));
        if (request.getTitle() != null) post.setTitle(request.getTitle());
        if (request.getContent() != null) post.setContent(request.getContent());
        if (request.getLocation() != null) post.setLocation(request.getLocation());
        if (request.getContactPhone() != null) post.setContactPhone(request.getContactPhone());
        if (request.getBudgetPerDay() != null) post.setBudgetPerDay(request.getBudgetPerDay());

        if (request.getCar() != null) {
            Car car = carRepository.findById(request.getCar())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Car not found"));
            post.setCar(car);
        }

        if (currentUser.getRole() != UserRole.ADMIN) {
            post.setStatus(PostStatus.PENDING);
            post.setReviewedBy(null);
            post.setReviewedAt(null);
            post.setReviewNote(null);
        }

        postRepository.save(post);
        return apiMapper.post(post);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> deletePost(@PathVariable Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));

        validatePostOwnership(post, currentUserService.getCurrentUser());
        postRepository.delete(post);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Post deleted successfully");
        return response;
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public List<Map<String, Object>> adminPendingPosts() {
        return postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.PENDING)
            .stream()
            .map(apiMapper::post)
            .toList();
    }

    @PatchMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public Map<String, Object> approvePost(@PathVariable Long id, @RequestBody(required = false) ReviewPostRequest request) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));

        User currentUser = currentUserService.getCurrentUser();
        post.setStatus(PostStatus.APPROVED);
        post.setReviewedBy(currentUser);
        post.setReviewedAt(LocalDateTime.now());
        post.setReviewNote(request == null ? null : request.getReviewNote());
        post.setActive(true);

        postRepository.save(post);
        return apiMapper.post(post);
    }

    @PatchMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public Map<String, Object> rejectPost(@PathVariable Long id, @RequestBody(required = false) ReviewPostRequest request) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found"));

        User currentUser = currentUserService.getCurrentUser();
        post.setStatus(PostStatus.REJECTED);
        post.setReviewedBy(currentUser);
        post.setReviewedAt(LocalDateTime.now());
        post.setReviewNote(request == null ? null : request.getReviewNote());

        postRepository.save(post);
        return apiMapper.post(post);
    }

    private PostType parsePostType(String value) {
        try {
            return PostType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid postType");
        }
    }

    private void validatePostOwnership(Post post, User user) {
        if (user.getRole() == UserRole.ADMIN) {
            return;
        }
        if (post.getAuthor() == null || !post.getAuthor().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage your own posts");
        }
    }

    private boolean containsIgnoreCase(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query.toLowerCase(Locale.ROOT));
    }
}
