package com.legalcms.repository;

import com.legalcms.entity.Advocate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdvocateRepository extends JpaRepository<Advocate, Long> {
    Optional<Advocate> findByUserId(Long userId);
    Optional<Advocate> findByRegistrationRef(String registrationRef);
}
