import React, { useEffect, useState } from "react";

const getStorageKey = (authorId) => `ultraverse:following:${authorId}`;

const getSavedFollowState = (authorId) => {
  if (!authorId) return false;

  try {
    return window.localStorage.getItem(getStorageKey(authorId)) === "1";
  } catch {
    return false;
  }
};

const FollowButton = ({ authorId, followers = 0 }) => {
  const [following, setFollowing] = useState(() =>
    getSavedFollowState(authorId),
  );

  useEffect(() => {
    setFollowing(getSavedFollowState(authorId));

    const handleStorage = (event) => {
      if (event.key === getStorageKey(authorId)) {
        setFollowing(event.newValue === "1");
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [authorId]);

  const handleFollow = () => {
    const nextFollowing = !following;

    setFollowing(nextFollowing);

    try {
      if (nextFollowing) {
        window.localStorage.setItem(getStorageKey(authorId), "1");
      } else {
        window.localStorage.removeItem(getStorageKey(authorId));
      }
    } catch (error) {
      console.error("Unable to save follow preference:", error);
    }
  };

  const baseFollowers = Math.max(0, Number(followers) || 0);
  const followerCount = baseFollowers + (following ? 1 : 0);

  return (
    <div className="author-page__follow">
      <span className="author-page__followers" aria-live="polite">
        {followerCount.toLocaleString()}{" "}
        {followerCount === 1 ? "follower" : "followers"}
      </span>

      <button
        type="button"
        className={`btn-main author-page__follow-button ${
          following ? "author-page__follow-button--active" : ""
        }`}
        onClick={handleFollow}
        aria-pressed={following}
        disabled={!authorId}
      >
        {following ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
};

export default FollowButton;
