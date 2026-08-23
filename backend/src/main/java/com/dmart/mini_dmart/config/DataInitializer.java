package com.dmart.mini_dmart.config;

import com.dmart.mini_dmart.entity.Role;
import com.dmart.mini_dmart.entity.User;
import com.dmart.mini_dmart.repository.RoleRepository;
import com.dmart.mini_dmart.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeData(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // Create roles
            Role customerRole =
                    createRoleIfNotExists(
                            roleRepository,
                            "CUSTOMER"
                    );

            Role staffRole =
                    createRoleIfNotExists(
                            roleRepository,
                            "STAFF"
                    );

            Role managerRole =
                    createRoleIfNotExists(
                            roleRepository,
                            "MANAGER"
                    );

            Role adminRole =
                    createRoleIfNotExists(
                            roleRepository,
                            "ADMIN"
                    );

            // Create initial admin
            createAdminIfNotExists(
                    userRepository,
                    adminRole,
                    passwordEncoder
            );
        };
    }

    private Role createRoleIfNotExists(
            RoleRepository roleRepository,
            String roleName) {

        return roleRepository
                .findByName(roleName)
                .orElseGet(() -> {

                    Role role = new Role();
                    role.setName(roleName);

                    return roleRepository.save(role);
                });
    }

    private void createAdminIfNotExists(
            UserRepository userRepository,
            Role adminRole,
            PasswordEncoder passwordEncoder) {

        String adminEmail = "admin@dmart.com";

        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = new User();

        admin.setFullName("System Admin");
        admin.setEmail(adminEmail);

        admin.setPassword(
                passwordEncoder.encode("Admin@123")
        );

        admin.setPhone("9999999999");
        admin.setAddress("Pune");
        admin.setEnabled(true);

        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);

        admin.setRoles(roles);

        userRepository.save(admin);
    }
}