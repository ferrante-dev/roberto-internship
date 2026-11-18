import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import FollowButton from "../components/author/FollowButton";
import Skeleton from "../components/UI/Skeleton";
import { fetchAuthorDetails, getAuthorPath } from "../components/UI/nftApi";
import "../components/author/Author.css";

const DEFAULT_AUTHOR_ID = "73855012";

const Author = () => {
  const { authorId } = useParams();
  const requestedAuthorId = authorId || DEFAULT_AUTHOR_ID;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    window.scrollTo(0, 0);

    setLoading(true);
    setProfile(null);
    setError("");
    setCopyStatus("");

    async function getAuthor() {
      try {
        const data = await fetchAuthorDetails(requestedAuthorId);

        if (active) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load author:", err);

        if (active) {
          setError("Unable to load this author.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    getAuthor();

    return () => {
      active = false;
    };
  }, [requestedAuthorId, retryCount]);

  const handleCopy = async () => {
    if (!profile?.wallet) return;

    try {
      await navigator.clipboard.writeText(profile.wallet);
      setCopyStatus("Copied!");
    } catch (err) {
      console.error("Unable to copy wallet address:", err);
      setCopyStatus("Copy failed");
    }
  };

  const username = profile?.username
    ? String(profile.username).startsWith("@")
      ? String(profile.username)
      : `@${profile.username}`
    : null;

  const profilePath = profile ? getAuthorPath(profile) : null;

  return (
    <div id="wrapper" className="author-page">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section
          id="profile_banner"
          aria-label="Author banner"
          className="text-light"
          style={{
            background: `url(${AuthorBanner}) top center / cover`,
          }}
        ></section>

        <section className="author-page__section" aria-label="Author profile">
          <div className="container">
            {loading ? (
              <div
                className="author-page__loading"
                role="status"
                aria-label="Loading author profile and NFTs"
                aria-busy="true"
              >
                <div className="author-page__header">
                  <div className="author-page__identity">
                    <div className="author-page__skeleton-avatar">
                      <Skeleton width="100%" height="100%" borderRadius="50%" />

                      <span className="author-page__skeleton-verified">
                        <Skeleton
                          width="100%"
                          height="100%"
                          borderRadius="50%"
                        />
                      </span>
                    </div>

                    <div className="author-page__details">
                      <Skeleton
                        width="160px"
                        height="27px"
                        borderRadius="4px"
                      />

                      <Skeleton
                        width="110px"
                        height="18px"
                        borderRadius="4px"
                      />

                      <div className="author-page__skeleton-wallet-row">
                        <Skeleton
                          width="180px"
                          height="17px"
                          borderRadius="4px"
                        />

                        <Skeleton
                          width="52px"
                          height="28px"
                          borderRadius="4px"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="author-page__follow">
                    <Skeleton width="115px" height="20px" borderRadius="4px" />

                    <Skeleton width="155px" height="46px" borderRadius="5px" />
                  </div>
                </div>

                <AuthorItems loading />
              </div>
            ) : error ? (
              <div className="author-page__error text-center" role="alert">
                <p>{error}</p>

                <button
                  type="button"
                  className="btn-main"
                  onClick={() => setRetryCount((previous) => previous + 1)}
                >
                  Try Again
                </button>
              </div>
            ) : profile ? (
              <>
                <div className="author-page__header">
                  <div className="author-page__identity">
                    {profilePath ? (
                      <Link
                        to={profilePath}
                        className="author-page__avatar-link"
                        aria-label={`View ${profile.name}'s profile`}
                      >
                        <div className="author-page__avatar">
                          {profile.image ? (
                            <img
                              src={profile.image}
                              alt={profile.name || "Author"}
                            />
                          ) : (
                            <span>{profile.name?.charAt(0) || "?"}</span>
                          )}

                          <span
                            className="author-page__verified"
                            aria-hidden="true"
                          >
                            <FaCheck />
                          </span>
                        </div>
                      </Link>
                    ) : (
                      <div className="author-page__avatar">
                        {profile.image ? (
                          <img
                            src={profile.image}
                            alt={profile.name || "Author"}
                          />
                        ) : (
                          <span>{profile.name?.charAt(0) || "?"}</span>
                        )}
                      </div>
                    )}

                    <div className="author-page__details">
                      <h1 className="author-page__name">
                        {profile.name || "Unknown Author"}
                      </h1>

                      {username && (
                        <span className="author-page__username">
                          {username}
                        </span>
                      )}

                      {profile.wallet && (
                        <div className="author-page__wallet-row">
                          <span
                            className="author-page__wallet"
                            title={profile.wallet}
                          >
                            {profile.wallet}
                          </span>

                          <button
                            type="button"
                            className="author-page__copy"
                            onClick={handleCopy}
                            title="Copy wallet address"
                          >
                            Copy
                          </button>

                          <span
                            className="author-page__copy-status"
                            aria-live="polite"
                          >
                            {copyStatus}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <FollowButton
                    key={profile.id}
                    authorId={profile.id}
                    followers={profile.followers}
                  />
                </div>

                <AuthorItems profile={profile} items={profile.items} />
              </>
            ) : (
              <div className="author-page__error text-center">
                <p>Author not found.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;
