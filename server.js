// server.js

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// In-memory database (replace with real database in production)
let users = [{
    id: 1,
    username: "Aish",
    email: "aish229@example.com",
    bio: "AI Engineer",
    profileImageUrl: "https://i.postimg.cc/853wwdYp/image.jpg",
    followers: [900],
    following: [90],
  },
  {
    id: 2,
    username: "Riya",
    email: "Riya_raj@example.com",
    bio: "Web Developer",
    profileImageUrl: "https://i.postimg.cc/WbDmXJmz/girl.jpg",
    followers: [100],
    following: [40],
  },
   {
    id: 3,
    username: "Gopal",
    email: "dharmaraj@example.com",
    bio: "Full Stack Developer",
    profileImageUrl: "https://i.postimg.cc/J4xNJhwn/boy.webp",
    followers: [1000],
    following: [40],
  },
];

let posts = [{
    id: 1,
    userId: 1,
    content: "Hello world! Excited To work First Day In office.",
    mediaUrl: "https://i.postimg.cc/MGMQ50bp/pexels-goumbik-669619.jpg",
    mediaType: "image",
    likes: [1000],
    comments: [],
    timestamp: new Date(),
  },
  {
    id: 2,
    userId: 2,
    content: "Today I Saw A Beautiful Sunset.",
    mediaUrl: "https://i.postimg.cc/YqrtMpP6/sunset.jpg",
    mediaType: "image",
    likes: [1],
    comments: [],
    timestamp: new Date(),
  },
   {
    id: 3,
    userId: 3,
    content: "Meet My Crime Partner",
    mediaUrl: "https://files.catbox.moe/r25eh3.mp4",
    mediaType: "video",
    likes: [100],
    comments: [],
    timestamp: new Date(),
  },
];

let comments = [];

// Helper functions
const findUserById = (id) => users.find((user) => user.id === parseInt(id));
const findPostById = (id) => posts.find((post) => post.id === parseInt(id));

// User Endpoints
app.get("/api/users", (req, res) => {
  const usersWithStats = users.map((user) => {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImageUrl: user.profileImageUrl,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    };
  });
  res.json(usersWithStats);
});

app.get("/api/users/:id", (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  const userWithStats = {
    id: user.id,
    username: user.username,
    email: user.email,
    bio: user.bio,
    profileImageUrl: user.profileImageUrl,
    followersCount: user.followers.length,
    followingCount: user.following.length,
  };

  res.json(userWithStats);
});

// New Endpoint: Get a user's followers
app.get("/api/users/:id/followers", (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  const followers = user.followers
    .map((followerId) => findUserById(followerId))
    .filter(Boolean)
    .map((follower) => ({
      id: follower.id,
      username: follower.username,
      profileImageUrl: follower.profileImageUrl,
    }));

  res.json(followers);
});

// New Endpoint: Get a user's following
app.get("/api/users/:id/following", (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  const following = user.following
    .map((followingId) => findUserById(followingId))
    .filter(Boolean)
    .map((followedUser) => ({
      id: followedUser.id,
      username: followedUser.username,
      profileImageUrl: followedUser.profileImageUrl,
    }));

  res.json(following);
});

app.post("/api/users", (req, res) => {
  const {
    username,
    email,
    bio,
    profileImageUrl
  } = req.body;
  if (!username || !email) {
    return res.status(400).json({
      error: "Username and email are required."
    });
  }

  const newUser = {
    id: Math.max(...users.map((u) => u.id)) + 1 || 1,
    username,
    email,
    bio,
    profileImageUrl,
    followers: [],
    following: [],
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  const {
    username,
    email,
    bio,
    profileImageUrl
  } = req.body;
  if (!username || !email) {
    return res.status(400).json({
      error: "Username and email are required."
    });
  }

  users[userIndex] = {
    ...users[userIndex],
    username,
    email,
    bio,
    profileImageUrl,
  };

  res.json(users[userIndex]);
});

// Follow/Unfollow user
app.post("/api/users/:id/follow", (req, res) => {
  const {
    userId
  } = req.body;
  const targetUser = findUserById(req.params.id);
  const currentUser = findUserById(userId);

  if (!targetUser || !currentUser) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  if (targetUser.id === currentUser.id) {
    return res.status(400).json({
      error: "Cannot follow yourself"
    });
  }

  const userIdInt = parseInt(userId);
  const targetUserIdInt = parseInt(req.params.id);

  const isFollowing = currentUser.following.includes(targetUserIdInt);

  if (isFollowing) {
    // Unfollow
    currentUser.following = currentUser.following.filter(
      (id) => id !== targetUserIdInt
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id !== userIdInt
    );
  } else {
    // Follow
    currentUser.following.push(targetUserIdInt);
    targetUser.followers.push(userIdInt);
  }

  res.json({
    isFollowing: !isFollowing,
    followersCount: targetUser.followers.length,
    followingCount: currentUser.following.length,
  });
});

// Post Endpoints
app.get("/api/posts", (req, res) => {
  const allPosts = posts.map((post) => {
    const user = findUserById(post.userId);
    const postComments = comments.filter((c) => c.postId === post.id);
    return {
      ...post,
      user: {
        id: user.id,
        username: user.username,
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
      },
      commentsCount: postComments.length,
    };
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(allPosts);
});


app.post("/api/posts", (req, res) => {
  const {
    userId,
    content,
    mediaUrl,
    mediaType
  } = req.body;
  if (!userId || (!content && !mediaUrl)) {
    return res.status(400).json({
      error: "User ID and content or media URL are required."
    });
  }

  const newPost = {
    id: Math.max(...posts.map((p) => p.id)) + 1 || 1,
    userId: parseInt(userId),
    content,
    mediaUrl: mediaUrl || null,
    mediaType: mediaUrl ? mediaType : null,
    likes: [],
    comments: [],
    timestamp: new Date(),
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

app.post("/api/posts/:id/like", (req, res) => {
  const post = findPostById(req.params.id);
  const {
    userId
  } = req.body;

  if (!post) {
    return res.status(404).json({
      error: "Post not found"
    });
  }

  const userIdInt = parseInt(userId);
  const userHasLiked = post.likes.includes(userIdInt);

  if (userHasLiked) {
    post.likes = post.likes.filter((id) => id !== userIdInt);
  } else {
    post.likes.push(userIdInt);
  }

  res.json({
    likes: post.likes
  });
});

// Comment Endpoints
app.get("/api/posts/:id/comments", (req, res) => {
  const postId = parseInt(req.params.id);
  const postComments = comments
    .filter((comment) => comment.postId === postId)
    .map((comment) => {
      const user = findUserById(comment.userId);
      return {
        ...comment,
        user: {
          id: user.id,
          username: user.username,
          profileImageUrl: user.profileImageUrl,
        },
      };
    })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  res.json(postComments);
});

app.post("/api/posts/:id/comments", (req, res) => {
  const postId = parseInt(req.params.id);
  const {
    userId,
    content
  } = req.body;

  if (!userId || !content) {
    return res.status(400).json({
      error: "User ID and content are required."
    });
  }

  const post = findPostById(postId);
  const user = findUserById(userId);

  if (!post || !user) {
    return res.status(404).json({
      error: "Post or user not found."
    });
  }

  const newComment = {
    id: comments.length > 0 ? Math.max(...comments.map((c) => c.id)) + 1 : 1,
    postId: postId,
    userId: userId,
    content: content,
    timestamp: new Date(),
  };

  comments.push(newComment);
  res.status(201).json(newComment);
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});