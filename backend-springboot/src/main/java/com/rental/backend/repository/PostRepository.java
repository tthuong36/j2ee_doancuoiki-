package com.rental.backend.repository;

import com.rental.backend.entity.Post;
import com.rental.backend.entity.enums.PostStatus;
import com.rental.backend.entity.enums.PostType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByActiveTrueAndStatusOrderByCreatedAtDesc(PostStatus status);

    List<Post> findByActiveTrueAndStatusAndPostTypeOrderByCreatedAtDesc(PostStatus status, PostType postType);

    List<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    List<Post> findByStatusOrderByCreatedAtDesc(PostStatus status);
}
