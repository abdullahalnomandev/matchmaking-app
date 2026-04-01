# Matchmaking App API Documentation

This document provides a comprehensive overview of the Matchmaking App API endpoints, including examples for each.

## Base URL

`http://localhost:5000/api/v1`

## Authentication

All endpoints require a Bearer token in the `Authorization` header for access, unless otherwise specified.

---

## User Module

- **POST /user**
  - Creates a new user.
  - **Example Body**:
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "password123"
    }
    ```

- **GET /user**
  - Retrieves a list of all users.

- **GET /user/profile**
  - Retrieves the profile of the currently authenticated user.

- **PATCH /user/profile**
  - Updates the profile of the currently authenticated user.
  - **Example Body**:
    ```json
    {
      "name": "Johnathan Doe",
      "location": "New York, USA"
    }
    ```

- **DELETE /user/delete**
  - Deletes the account of the currently authenticated user.

- **POST /user/psychological-scores**
  - Updates the psychological scores of the currently authenticated user.
  - **Example Body**:
    ```json
    {
      "accountability": 85,
      "emotional_stability": 90
    }
    ```

- **POST /user/personality-result**
  - Updates the personality test results of the currently authenticated user.
  - **Example Body**:
    ```json
    {
      "mbti_type": "INTJ",
      "big_five": {
        "openness": 80,
        "conscientiousness": 90
      }
    }
    ```

- **GET /user/profile/user/:id**
  - Retrieves the profile of a specific user by their ID.

- **GET /user/profile/activity/:id**
  - Retrieves the activity feed of a specific user by their ID.

- **POST /user/unfollow/:id**
  - Unfollows a specific user by their ID.

- **POST /user/status/toggle-profile-status/:id**
  - Toggles the profile status of a specific user by their ID.

- **GET /user/statistics**
  - Retrieves overall user statistics.

- **GET /user/user-statistics**
  - Retrieves statistics for the currently authenticated user.

- **DELETE /user/delete-account**
  - Deletes the account of the currently authenticated user.

- **GET /user/blocks**
  - Retrieves the list of blocked users for the currently authenticated user.

- **POST /user/blocks/toggle/:id**
  - Blocks or unblocks a specific user by their ID.

---

## Company Module

- **POST /company/create**
  - Creates a new company.
  - **Example Body**:
    ```json
    {
      "legal_name": "Innovate Inc.",
      "vat_number": "123456789"
    }
    ```

- **GET /company**
  - Retrieves a list of all companies.

- **GET /company/:id**
  - Retrieves a specific company by its ID.

- **PATCH /company/:id**
  - Updates a specific company by its ID.
  - **Example Body**:
    ```json
    {
      "company_website": "https://innovate.com"
    }
    ```

- **DELETE /company/:id**
  - Deletes a specific company by its ID.

---

## Matching Module

- **GET /matching/top-matches**
  - Retrieves the top 10 potential business matches for the currently authenticated user.

---

## Support Module

- **POST /support/request**
  - Creates a new support request.
  - **Example Body**:
    ```json
    {
      "subject": "Issue with login",
      "description": "I am unable to log in to my account."
    }
    ```

- **GET /support**
  - Retrieves a list of all support requests.

- **GET /support/:id**
  - Retrieves a specific support request by its ID.

- **PATCH /support/:id**
  - Updates the status of a specific support request by its ID.

- **POST /support/:id/accept**
  - Accepts a specific support request by its ID.

---

## Authentication Module

- **POST /auth/login**
  - Logs in a user and returns an access token.
  - **Example Body**:
    ```json
    {
      "email": "john.doe@example.com",
      "password": "password123"
    }
    ```

- **POST /auth/resend-otp**
  - Resends the one-time password (OTP) for email verification.

- **POST /auth/forget-password**
  - Initiates the password reset process for a user.

- **POST /auth/verify-email**
  - Verifies a user's email address using the provided OTP.

- **POST /auth/reset-password**
  - Resets a user's password using the provided OTP and new password.

- **POST /auth/verify-otp**
  - Verifies the provided OTP.

- **POST /auth/change-password**
  - Changes the password of the currently authenticated user.

---

## Preference Module

- **POST /preference**
  - Creates a new preference.
  - **Example Body**:
    ```json
    {
      "name": "Fintech",
      "type": "Industry"
    }
    ```

- **GET /preference**
  - Retrieves a list of all preferences.

- **GET /preference/:id**
  - Retrieves a specific preference by its ID.

- **PATCH /preference/:id**
  - Updates a specific preference by its ID.

- **DELETE /preference/:id**
  - Deletes a specific preference by its ID.

---

## Network Connection Module

- **POST /network-connection**
  - Sends a connection request to another user.
  - **Example Body**:
    ```json
    {
      "requestTo": "user_id_2"
    }
    ```

- **GET /network-connection**
  - Retrieves the network connections of the currently authenticated user.

- **POST /network-connection/cancel**
  - Cancels a pending connection request.

- **GET /network-connection/user/:userId**
  - Retrieves the network connections of a specific user by their ID.

- **PATCH /network-connection/disconnect/:id**
  - Disconnects from a specific user by the connection ID.

- **GET /network-connection/:id**
  - Retrieves a specific network connection by its ID.

- **PATCH /network-connection/:id**
  - Updates the status of a specific network connection by its ID (e.g., accept, reject).

- **DELETE /network-connection/:id**
  - Deletes a specific network connection by its ID.

---

## Post Module

- **POST /post**
  - Creates a new post.
  - **Example Body**:
    ```json
    {
      "content": "This is a new post."
    }
    ```

- **GET /post**
  - Retrieves a list of all posts.

- **GET /post/user-liked**
  - Retrieves the posts liked by the currently authenticated user.

- **GET /post/drafts**
  - Retrieves the drafts of the currently authenticated user.

- **POST /post/view/:videoId**
  - Records a view for a specific video post.

- **PATCH /post/:id**
  - Updates a specific post by its ID.

- **DELETE /post/:id**
  - Deletes a specific post by its ID.

- **GET /post/:id**
  - Retrieves a specific post by its ID.

- **POST /post/:postId/likes/toggle/:postId**
  - Toggles the like status of a specific post.

- **GET /post/:postId/likes/:postId**
  - Retrieves the likes for a specific post.

- **GET /post/:postId/likes/:postId/status**
  - Retrieves the like status of a specific post for the currently authenticated user.

- **POST /post/:postId/saves/toggle/:postId**
  - Toggles the save status of a specific post.

- **GET /post/:postId/saves/:postId**
  - Retrieves the saves for a specific post.

- **GET /post/:postId/saves/:postId/status**
  - Retrieves the save status of a specific post for the currently authenticated user.

- **POST /post/reports/:postId**
  - Reports a specific post.

---

## Comment Module

- **POST /post/comment**
  - Creates a new comment on a post.
  - **Example Body**:
    ```json
    {
      "postId": "post_id_1",
      "content": "This is a comment."
    }
    ```

- **GET /post/comment**
  - Retrieves all comments for a specific post.

- **PATCH /post/comment/:id**
  - Updates a specific comment by its ID.

- **DELETE /post/comment/:id**
  - Deletes a specific comment by its ID.

- **GET /post/comment/:id**
  - Retrieves a specific comment by its ID.

- **POST /post/comment/reply/:id**
  - Replies to a specific comment.

- **GET /post/comment/reply/:id**
  - Retrieves all replies for a specific comment.

- **DELETE /post/comment/reply/:id**
  - Deletes a specific reply by its ID.

- **POST /post/comment/like/toggle/:commentId**
  - Toggles the like status of a specific comment.

---

## Notification Module

- **GET /notification**
  - Retrieves the notifications for the currently authenticated user.

- **PATCH /notification/:id**
  - Marks a specific notification as read.

- **GET /notification/count**
  - Retrieves the number of unread notifications for the currently authenticated user.

- **GET /notification/update**
  - Marks all notifications as read for the currently authenticated user.

---

## Conversation Module

- **POST /conversation**
  - Creates a new conversation with another user.
  - **Example Body**:
    ```json
    {
      "participant": "user_id_2"
    }
    ```

- **GET /conversation**
  - Retrieves the conversations of the currently authenticated user.

- **DELETE /conversation/:id**
  - Deletes a specific conversation by its ID.

---

## Message Module

- **POST /message**
  - Sends a new message in a conversation.
  - **Example Body**:
    ```json
    {
      "conversationId": "conversation_id_1",
      "text": "Hello!"
    }
    ```

- **GET /message/:id**
  - Retrieves all messages in a specific conversation by its ID.
