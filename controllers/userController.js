const Post = require("../models/Post");
const { json } = require("express");
const User = require("../models/User");
// const { post, use } = require("../routers/postsRouter");
const { mapPostOutput } = require("../utils/Utils");
const { error, success } = require("../utils/responseWrapper");
const cloudinary = require("cloudinary").v2;

const followOrUnfollowUserController = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const curUserId = req._id;

    const userToFollow = await User.findById(userIdToFollow);
    const curUser = await User.findById(curUserId);

    if (curUserId === userIdToFollow) {
      return res.send(error(409, "User Cannot follow themselves"));
    }

    if (!userToFollow) {
      return res.send(error(404, "User to follow not found"));
    }

    if (curUser.following.includes(userIdToFollow)) {
      // already followed
      const followingIndex = curUser.following.indexOf(userIdToFollow);
      curUser.following.splice(followingIndex, 1);

      const followerIndex = userToFollow.followers.indexOf(curUser);
      userToFollow.followers.splice(followerIndex, 1);

      //   await curUser.save();
      //   await userToFollow.save();

      //   return res.send(success(200, "User Unfollowed"));
    } else {
      userToFollow.followers.push(curUserId);
      curUser.following.push(userIdToFollow);

      // await curUser.save();
      // await userToFollow.save();

      // return res.send(success(200, "User Followed"));
    }

    await userToFollow.save();
    await curUser.save();

    return res.send(success(200, { user: userToFollow }));
  } catch (e) {
    console.log("error", e);
    return res.send(error(500, e.message));
  }
};

const getPostsOfFollowing = async (req, res) => {
  try {
    const curUserId = req._id;

    const curUser = await User.findById(curUserId).populate("following");

    const fullPosts = await Post.find({
      owner: {
        $in: curUser.following,
      },
    }).populate("owner");

    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();

    const followingIds = curUser.following.map((item) => item._id);
    followingIds.push(req._id);

    const suggestions = await User.find({
      _id: {
        $nin: followingIds,
      },
    });

    return res.send(success(200, { ...curUser._doc, suggestions, posts }));
  } catch (error) {
    console.log("error", e);
    return res.send(error(500, e.message));
  }
};

const getMyPosts = async (req, res) => {
  try {
    const curUserId = req._id;
    const allUserPosts = await Post.find({
      owner: curUserId,
    }).populate("likes");

    return res.send(success(200, { allUserPosts }));
  } catch (error) {
    console.log("error", e);
    return res.send(error(500, e.message));
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.send(error(400, "userId is required"));
    }

    const allUserPosts = await Post.find({
      owner: userId,
    }).populate("likes");

    return res.send(success(200, { allUserPosts }));
  } catch (error) {
    console.log("error", e);
    return res.send(error(500, e.message));
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);

    // deleting all posts

    await Post.deleteMany({
      owner: curUserId,
    });

    // removed myself from followers following
    curUser.followers.forEach(async (followerId) => {
      const follower = await User.findById(followerId);
      const index = follower.following.indexOf(curUserId);

      follower.following.splice(index, 1);
      await follower.save();
    });

    // remove myself from followings'followers
    curUser.following.forEach(async (followingId) => {
      const following = await User.findById(followingId);
      const index = following.followers.indexOf(curUserId);

      following.followers.splice(index, 1);
      await following.save();
    });

    // removing myself from all likes
    const allPosts = await Post.find();
    allPosts.forEach(async (post) => {
      const index = post.likes.indexOf(curUserId);
      post.likes.splice(index, 1);
      await post.save();
    });

    // delete User
    await curUser.deleteOne();

    // clearing the cookie of user which is getting deleted

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.send(success(200, "User deleted Successfully"));
  } catch (e) {
    console.log("error", e);
    return res.send(error(500, e.message));
  }
};

const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req._id);
    return res.send(success(200, { user }));
  } catch (e) {
    console.log("error in getMyInfo", e);
    return res.send(error(500, e.message));
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;

    const user = await User.findById(req._id);

    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }
    if (userImg) {
      const cloudImg = await cloudinary.uploader.upload(userImg, {
        folder: "profileImg",
      });
      user.avatar = {
        url: cloudImg.secure_url,
        publicID: cloudImg.public_id,
      };
    }
    await user.save();

    return res.send(success(200, { user }));
  } catch (e) {
    console.log("put e", e);
    return res.send(error(500, e.message));
  }
};

const getUserProfile = async (req, res) => {
  try {
    // const userId = req.body.userId;
    const userId = req._id;
    console.log("UserId", userId);
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: {
        path: "owner",
      },
    });

    // const fullPosts = [];
    const fullPosts = user.posts;

    const Posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();

    return res.send(success(200, { ...user._doc, Posts }));
  } catch (e) {
    console.log("error put", e);
    return res.send(error(500, e.message));
  }
};

module.exports = {
  followOrUnfollowUserController,
  getPostsOfFollowing,
  getMyPosts,
  getUserPosts,
  deleteMyProfile,
  getMyInfo,
  updateUserProfile,
  getUserProfile,
};
