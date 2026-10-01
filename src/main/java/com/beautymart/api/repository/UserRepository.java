package com.beautymart.api.repository;

import com.beautymart.api.entity.AppUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByGoogleId(String googleId);

    Optional<AppUser> findByEmailIgnoreCase(String email);
}
