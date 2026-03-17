package com.nextindie.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        return ResponseEntity.ok(userService.getProfileByUsername(username, true));
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<UserProfileDTO> getUserProfile(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean isOwnProfile = userDetails != null && userDetails.getUsername().equals(username);
        return ResponseEntity.ok(userService.getProfileByUsername(username, isOwnProfile));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(
            @RequestBody UserProfileDTO profileDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        return ResponseEntity.ok(userService.updateProfile(username, profileDTO));
    }
}