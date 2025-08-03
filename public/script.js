class SocialMediaApp {
  constructor() {
    this.API_BASE = "http://localhost:3000/api";
    this.currentUserId = null;
    this.currentPostId = null;

    this.initializeElements();
    this.initializeEventListeners();
    this.loadUsers();
    this.loadPosts();
  }

  initializeElements() {
    // Navigation
    this.homeBtn = document.getElementById("homeBtn");
    this.profileBtn = document.getElementById("profileBtn");
    this.usersBtn = document.getElementById("usersBtn");

    // Sections
    this.homeSection = document.getElementById("homeSection");
    this.profileSection = document.getElementById("profileSection");
    this.usersSection = document.getElementById("usersSection");

    // User selection
    this.currentUserSelect = document.getElementById("currentUser");
    this.createUserBtn = document.getElementById("createUserBtn");

    // Create user modal
    this.createUserModal = document.getElementById("createUserModal");
    this.createUserForm = document.getElementById("createUserForm");

    // Create post
    this.createPostDiv = document.getElementById("createPost");
    this.postContentTextarea = document.getElementById("postContent");
    this.mediaUrlInput = document.getElementById("mediaUrl");
    this.mediaTypeSelect = document.getElementById("mediaType");
    this.charCountSpan = document.getElementById("charCount");
    this.submitPostBtn = document.getElementById("submitPost");

    // Posts and comments
    this.postsContainer = document.getElementById("postsContainer");
    this.commentModal = document.getElementById("commentModal");
    this.commentsContainer = document.getElementById("commentsContainer");
    this.addCommentDiv = document.getElementById("addComment");
    this.commentContentTextarea = document.getElementById("commentContent");
    this.submitCommentBtn = document.getElementById("submitComment");

    // Users
    this.usersContainer = document.getElementById("usersContainer");
    this.profileContent = document.getElementById("profileContent");

    // Edit Profile Modal
    this.editProfileModal = document.getElementById("editProfileModal");
    this.editProfileForm = document.getElementById("editProfileForm");
    this.editUsernameInput = document.getElementById("editUsername");
    this.editEmailInput = document.getElementById("editEmail");
    this.editBioTextarea = document.getElementById("editBio");
    this.editProfileImageInput = document.getElementById("editProfileImage");

    // New: Followers/Following Modals
    this.followersModal = document.getElementById("followersModal");
    this.followersContainer = document.getElementById("followersContainer");
    this.closeFollowersModalBtn = document.getElementById(
      "closeFollowersModal"
    );

    this.followingModal = document.getElementById("followingModal");
    this.followingContainer = document.getElementById("followingContainer");
    this.closeFollowingModalBtn = document.getElementById(
      "closeFollowingModal"
    );
  }

  initializeEventListeners() {
    // Navigation
    this.homeBtn.addEventListener("click", () => this.showSection("home"));
    this.profileBtn.addEventListener("click", () =>
      this.showSection("profile")
    );
    this.usersBtn.addEventListener("click", () => this.showSection("users"));

    // User selection
    this.currentUserSelect.addEventListener("change", (e) => {
      this.currentUserId = e.target.value ? parseInt(e.target.value) : null;
      this.toggleCreatePost();
      this.updateProfile();
      this.loadPosts();
    });

    // Create user
    this.createUserBtn.addEventListener("click", () => {
      this.createUserModal.style.display = "block";
    });

    this.createUserForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.createUser();
    });

    // Edit Profile
    this.editProfileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveProfileChanges();
    });

    // Modal close buttons
    document.querySelectorAll(".modal .close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", (e) => {
        e.target.closest(".modal").style.display = "none";
      });
    });

    // Post creation
    this.postContentTextarea.addEventListener("input", () => {
      this.updateCharCount();
    });

    this.submitPostBtn.addEventListener("click", () => {
      this.createPost();
    });

    // Comment submission
    this.submitCommentBtn.addEventListener("click", () => {
      this.addComment();
    });

    // New: Close followers/following modals
    this.closeFollowersModalBtn.addEventListener("click", () => {
      this.followersModal.style.display = "none";
    });

    this.closeFollowingModalBtn.addEventListener("click", () => {
      this.followingModal.style.display = "none";
    });

    // Click outside modal to close
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });
  }

  async makeRequest(endpoint, method = "GET", data = null) {
    try {
      const config = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.API_BASE}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      this.showError("Network error. Please try again.");
      throw error;
    }
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error";
    errorDiv.textContent = message;

    const container = document.querySelector(".container");
    container.insertBefore(errorDiv, container.firstChild);

    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  showSuccess(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "success";
    successDiv.textContent = message;

    const container = document.querySelector(".container");
    container.insertBefore(successDiv, container.firstChild);

    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
  }

  showSection(section) {
    // Hide all sections
    this.homeSection.style.display = "none";
    this.profileSection.style.display = "none";
    this.usersSection.style.display = "none";

    // Remove active class from all nav buttons
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Show selected section and activate button
    switch (section) {
      case "home":
        this.homeSection.style.display = "block";
        this.homeBtn.classList.add("active");
        this.loadPosts();
        break;
      case "profile":
        this.profileSection.style.display = "block";
        this.profileBtn.classList.add("active");
        this.updateProfile();
        break;
      case "users":
        this.usersSection.style.display = "block";
        this.usersBtn.classList.add("active");
        this.loadUsers();
        break;
    }
  }

  async loadUsers() {
    try {
      const users = await this.makeRequest("/users");
      this.populateUserSelect(users);
      this.displayUsers(users);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }

  populateUserSelect(users) {
    this.currentUserSelect.innerHTML =
      '<option value="">Select a user...</option>';
    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.username;
      this.currentUserSelect.appendChild(option);
    });
    if (this.currentUserId) {
      this.currentUserSelect.value = this.currentUserId;
    }
  }

  displayUsers(users) {
    this.usersContainer.innerHTML = "";

    if (users.length === 0) {
      this.usersContainer.innerHTML = '<p class="loading">No users found.</p>';
      return;
    }

    users.forEach((user) => {
      const userCard = this.createUserCard(user);
      this.usersContainer.appendChild(userCard);
    });
  }

  createUserCard(user) {
    const card = document.createElement("div");
    card.className = "user-card";

    const isCurrentUser = this.currentUserId === user.id;

    const avatar = document.createElement("div");
    avatar.className = "user-avatar";
    if (user.profileImageUrl) {
      avatar.innerHTML = `<img src="${user.profileImageUrl}" alt="${user.username} profile">`;
    } else {
      avatar.textContent = user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }

    const userInfo = document.createElement("div");
    userInfo.className = "user-info";
    userInfo.innerHTML = `
      <div class="user-details">
          <h4>${user.username}</h4>
          <p class="user-bio">${user.bio || "No bio available"}</p>
          <p class="user-stats">
              ${user.followersCount} followers • ${user.followingCount} following
          </p>
      </div>
  `;

    card.appendChild(avatar);
    card.appendChild(userInfo);

    if (!isCurrentUser && this.currentUserId) {
      const userActions = document.createElement("div");
      userActions.className = "user-actions";
      userActions.innerHTML = `
          <button class="btn btn-small follow-btn" data-user-id="${user.id}">
              Follow
          </button>
      `;
      card.appendChild(userActions);

      const followBtn = userActions.querySelector(".follow-btn");
      if (followBtn) {
        followBtn.addEventListener("click", () => {
          this.toggleFollow(user.id, followBtn);
        });
      }
    }

    return card;
  }

  async createUser() {
    const username = document.getElementById("newUsername").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const bio = document.getElementById("newBio").value.trim();
    const profileImageUrl = document
      .getElementById("newProfileImage")
      .value.trim();

    if (!username || !email) {
      this.showError("Username and email are required.");
      return;
    }

    try {
      const newUser = await this.makeRequest("/users", "POST", {
        username,
        email,
        bio,
        profileImageUrl,
      });

      this.showSuccess("User created successfully!");
      this.createUserModal.style.display = "none";
      this.createUserForm.reset();

      const option = document.createElement("option");
      option.value = newUser.id;
      option.textContent = newUser.username;
      this.currentUserSelect.appendChild(option);

      this.currentUserSelect.value = newUser.id;
      this.currentUserId = newUser.id;
      this.toggleCreatePost();

      this.loadUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  }

  toggleCreatePost() {
    if (this.currentUserId) {
      this.createPostDiv.style.display = "block";
    } else {
      this.createPostDiv.style.display = "none";
    }
  }

  updateCharCount() {
    const content = this.postContentTextarea.value;
    const count = content.length;
    this.charCountSpan.textContent = count;

    const charCountDiv = this.charCountSpan.parentElement;
    charCountDiv.className = "char-count";

    if (count > 250) {
      charCountDiv.classList.add("warning");
    }
    if (count > 280) {
      charCountDiv.classList.add("danger");
    }

    this.submitPostBtn.disabled =
      (count === 0 && this.mediaUrlInput.value.trim() === "") || count > 280;
  }

  async createPost() {
    const content = this.postContentTextarea.value.trim();
    const mediaUrl = this.mediaUrlInput.value.trim();
    const mediaType = this.mediaTypeSelect.value;

    if (!content && !mediaUrl) {
      this.showError("Post must have content or a media URL.");
      return;
    }

    if (content.length > 280) {
      this.showError("Post content must be 280 characters or less.");
      return;
    }

    try {
      const newPost = await this.makeRequest("/posts", "POST", {
        userId: this.currentUserId,
        content,
        mediaUrl: mediaUrl || null,
        mediaType: mediaUrl ? mediaType : null,
      });

      this.showSuccess("Post created successfully!");
      this.postContentTextarea.value = "";
      this.mediaUrlInput.value = "";
      this.mediaTypeSelect.value = "";
      this.updateCharCount();

      this.loadPosts();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  }

  async loadPosts() {
    try {
      const posts = await this.makeRequest("/posts");
      this.displayPosts(posts);
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  }

  displayPosts(posts) {
    this.postsContainer.innerHTML = "";

    if (posts.length === 0) {
      this.postsContainer.innerHTML =
        '<p class="loading">No posts found. Create the first post!</p>';
      return;
    }

    posts.forEach((post) => {
      const postElement = this.createPostElement(post);
      this.postsContainer.appendChild(postElement);
    });
  }

  createPostElement(post) {
    const postDiv = document.createElement("div");
    postDiv.className = "post-card";

    const postHeader = document.createElement("div");
    postHeader.className = "post-header";

    const postInfo = document.createElement("div");
    postInfo.className = "post-info";

    const userAvatar = document.createElement("div");
    userAvatar.className = "user-avatar";
    if (post.user.profileImageUrl) {
      userAvatar.innerHTML = `<img src="${post.user.profileImageUrl}" alt="${post.user.username} profile">`;
    } else {
      userAvatar.textContent = post.user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }

    const postAuthor = document.createElement("span");
    postAuthor.className = "post-author";
    postAuthor.textContent = post.user.username;

    postInfo.appendChild(userAvatar);
    postInfo.appendChild(postAuthor);

    const postTime = document.createElement("span");
    postTime.className = "post-time";
    postTime.textContent = this.formatTime(post.timestamp);

    postHeader.appendChild(postInfo);
    postHeader.appendChild(postTime);

    const content = document.createElement("div");
    content.className = "post-content";

    if (post.mediaUrl) {
      const mediaElement = document.createElement("div");
      mediaElement.className = "post-media";
      if (post.mediaType === "image") {
        mediaElement.innerHTML = `<img src="${post.mediaUrl}" alt="Post image" class="clickable-image">`;
      } else if (post.mediaType === "video") {
        mediaElement.innerHTML = `<video src="${post.mediaUrl}" controls></video>`;
      }
      content.appendChild(mediaElement);
    }

    if (post.content) {
      const textContent = document.createElement("p");
      textContent.textContent = post.content;
      content.appendChild(textContent);
    }

    const actions = document.createElement("div");
    actions.className = "post-actions";

    const likeBtn = document.createElement("button");
    likeBtn.className = "btn-like";
    likeBtn.innerHTML = `<i class="fas fa-heart"></i> ${post.likes.length}`;
    if (post.likes.includes(this.currentUserId)) {
      likeBtn.classList.add("liked");
    }
    likeBtn.addEventListener("click", () => this.toggleLike(post.id, likeBtn));

    const commentLink = document.createElement("a");
    commentLink.className = "comment-link";
    commentLink.href = "#";
    commentLink.innerHTML = `<i class="fas fa-comment"></i> ${post.commentsCount}`;
    commentLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.showComments(post.id);
    });

    actions.appendChild(likeBtn);
    actions.appendChild(commentLink);

    postDiv.appendChild(postHeader);
    postDiv.appendChild(content);
    postDiv.appendChild(actions);

    const postImage = postDiv.querySelector(".clickable-image");
    if (postImage) {
      postImage.addEventListener("click", () => this.openImageModal(postImage.src));
    }

    return postDiv;
  }

  async toggleLike(postId, likeBtn) {
    if (!this.currentUserId) return;

    try {
      const result = await this.makeRequest(`/posts/${postId}/like`, "POST", {
        userId: this.currentUserId,
      });

      const isLiked = result.likes.includes(this.currentUserId);

      likeBtn.innerHTML = `<i class="fas fa-heart"></i> ${result.likes.length}`;
      likeBtn.classList.toggle("liked", isLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  }

  async showComments(postId) {
    this.currentPostId = postId;

    try {
      const comments = await this.makeRequest(`/posts/${postId}/comments`);
      this.displayComments(comments);

      if (this.currentUserId) {
        this.addCommentDiv.style.display = "block";
        this.commentContentTextarea.value = "";
      } else {
        this.addCommentDiv.style.display = "none";
      }

      this.commentModal.style.display = "block";
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  }

  displayComments(comments) {
    this.commentsContainer.innerHTML = "";

    if (comments.length === 0) {
      this.commentsContainer.innerHTML =
        '<p class="loading">No comments yet. Be the first to comment!</p>';
      return;
    }

    comments.forEach((comment) => {
      const commentDiv = this.createCommentElement(comment);
      this.commentsContainer.appendChild(commentDiv);
    });
  }

  createCommentElement(comment) {
    const commentDiv = document.createElement("div");
    commentDiv.className = "comment";

    const commentHeader = document.createElement("div");
    commentHeader.className = "comment-header";

    const userAvatar = document.createElement("div");
    userAvatar.className = "user-avatar";
    if (comment.user.profileImageUrl) {
      userAvatar.innerHTML = `<img src="${comment.user.profileImageUrl}" alt="${comment.user.username} profile">`;
    } else {
      userAvatar.textContent = comment.user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }

    const commentUser = document.createElement("span");
    commentUser.className = "comment-user";
    commentUser.textContent = comment.user.username;

    const commentTime = document.createElement("span");
    commentTime.className = "comment-time";
    commentTime.textContent = this.formatTime(comment.timestamp);

    commentHeader.appendChild(userAvatar);
    commentHeader.appendChild(commentUser);
    commentHeader.appendChild(commentTime);

    const content = document.createElement("div");
    content.className = "comment-content";
    content.textContent = comment.content;

    commentDiv.appendChild(commentHeader);
    commentDiv.appendChild(content);

    return commentDiv;
  }

  async addComment() {
    const content = this.commentContentTextarea.value.trim();

    if (!content) {
      this.showError("Comment cannot be empty.");
      return;
    }

    try {
      const newComment = await this.makeRequest(
        `/posts/${this.currentPostId}/comments`,
        "POST", {
          userId: this.currentUserId,
          content,
        }
      );

      const commentElement = this.createCommentElement(newComment);
      this.commentsContainer.appendChild(commentElement);

      this.commentContentTextarea.value = "";
      this.showSuccess("Comment added successfully!");

      this.loadPosts();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  }

  async toggleFollow(userId, followBtn) {
    if (!this.currentUserId) return;

    try {
      const result = await this.makeRequest(`/users/${userId}/follow`, "POST", {
        userId: this.currentUserId,
      });

      followBtn.textContent = result.isFollowing ? "Unfollow" : "Follow";
      followBtn.classList.toggle("btn-danger", result.isFollowing);

      const userCard = followBtn.closest(".user-card");
      const statsElement = userCard.querySelector(".user-stats");
      statsElement.textContent = `${result.followersCount} followers • ${result.followingCount} following`;
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  }

  async updateProfile() {
    if (!this.currentUserId) {
      this.profileContent.innerHTML =
        '<p class="loading">Please select a user to view profile.</p>';
      return;
    }

    try {
      const user = await this.makeRequest(`/users/${this.currentUserId}`);

      const profileAvatarHtml = user.profileImageUrl ?
        `<img src="${user.profileImageUrl}" alt="${user.username} profile">` :
        user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      this.profileContent.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                ${profileAvatarHtml}
            </div>
            <div class="profile-info">
                <h3>${user.username}</h3>
                <p class="profile-bio">${user.bio || "No bio available"}</p>
                <div class="profile-stats">
                    <div class="stat clickable" id="followersCount">
                        <div class="stat-number">${
                          user.followersCount
                        }</div>
                        <div class="stat-label">Followers</div>
                    </div>
                    <div class="stat clickable" id="followingCount">
                        <div class="stat-number">${
                          user.followingCount
                        }</div>
                        <div class="stat-label">Following</div>
                    </div>
                </div>
                <button id="editProfileBtn" class="btn btn-secondary mt-2">Edit Profile</button>
            </div>
        </div>
    `;

      document.getElementById("editProfileBtn").addEventListener("click", () => {
        this.openEditProfileModal(user);
      });

      document.getElementById("followersCount").addEventListener("click", () => {
        this.showFollowers(user.id);
      });

      document.getElementById("followingCount").addEventListener("click", () => {
        this.showFollowing(user.id);
      });

    } catch (error) {
      console.error("Failed to load profile:", error);
      this.profileContent.innerHTML =
        '<p class="error">Failed to load profile.</p>';
    }
  }

  openEditProfileModal(user) {
    this.editUsernameInput.value = user.username;
    this.editEmailInput.value = user.email;
    this.editBioTextarea.value = user.bio || "";
    this.editProfileImageInput.value = user.profileImageUrl || "";
    this.editProfileModal.style.display = "block";
  }

  async saveProfileChanges() {
    const updatedUser = {
      username: this.editUsernameInput.value.trim(),
      email: this.editEmailInput.value.trim(),
      bio: this.editBioTextarea.value.trim(),
      profileImageUrl: this.editProfileImageInput.value.trim(),
    };

    if (!updatedUser.username || !updatedUser.email) {
      this.showError("Username and email are required.");
      return;
    }

    try {
      const result = await this.makeRequest(
        `/users/${this.currentUserId}`,
        "PUT",
        updatedUser
      );

      this.showSuccess("Profile updated successfully!");
      this.editProfileModal.style.display = "none";
      this.updateProfile();
      this.loadUsers();
    } catch (error) {
      console.error("Failed to update profile:", error);
      this.showError("Failed to update profile. Please try again.");
    }
  }

  // New: Show Followers Modal
  async showFollowers(userId) {
    try {
      const followers = await this.makeRequest(`/users/${userId}/followers`);
      this.displayFollowList(this.followersContainer, followers);
      this.followersModal.style.display = "block";
    } catch (error) {
      console.error("Failed to load followers:", error);
    }
  }

  // New: Show Following Modal
  async showFollowing(userId) {
    try {
      const following = await this.makeRequest(`/users/${userId}/following`);
      this.displayFollowList(this.followingContainer, following);
      this.followingModal.style.display = "block";
    } catch (error) {
      console.error("Failed to load following:", error);
    }
  }

  // New: Reusable function to display a list of users
  displayFollowList(container, users) {
    container.innerHTML = "";
    if (users.length === 0) {
      container.innerHTML = '<p class="loading">No users found.</p>';
      return;
    }
    users.forEach((user) => {
      const userCard = this.createUserCard(user);
      container.appendChild(userCard);
    });
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SocialMediaApp();
});