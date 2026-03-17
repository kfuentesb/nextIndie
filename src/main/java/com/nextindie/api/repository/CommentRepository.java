// repository/CommentRepository.java
package com.nextindie.api.repository;

import com.nextindie.api.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByGameIdOrderByCreatedAtDesc(Long gameId);
}