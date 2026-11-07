import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Skeleton from "../components/UI/Skeleton";
import { fetchAuthorDetails } from "../components/UI/nftApi";
import AuthorItems from "../components/author/AuthorItems";
import "../components/home/NewItems.css";

const AuthorSkeleton = () => {
  return (
    <div
      className="author-profile__loading"
      role="status"
      aria-label="Loading author profile"
    >
      <div className="author-profile__skeleton-header">
        <Skeleton width="110px" height="110px" borderRadius="50%" />

        <div className="author-profile__skeleton-text">
          <Skeleton width="180px" height="25px" borderRadius="4px" />
          <Skeleton width="120px" height="15px" borderRadius="4px" />
          <Skeleton width="230px" height="15px" borderRadius="4px" />
        </div>
      </div>

      <div className="author-items__grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="author-items__skeleton-card" key={index}>
            <Skeleton width="100%" height="210px" borderRadius="6px" />
            <Skeleton width="70%" height="16px" borderRadius="4px" />
            <Skeleton width="45%" height="14px" borderRadius="4px" />
          </div>
        ))}
      </div>
    </div>
  );
};

const Author = () => {
  const { authorId } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    window.scrollTo(0, 0);
    setProfile(null);
    setLoading(true);
    setError("");
    setCopied(false);

    if (!authorId) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    async function getAuthor() {
      try {
        const data = await fetchAuthorDetails(authorId);

        if (active) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load author:", err);

        if (active) {
          setError("Unable to load this author profile.");
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
  }, [authorId]);

  async function copyWallet() {
    if (!profile?.wallet) return;

    try {
      await navigator.clipboard.writeText(String(profile.wallet));
      setCopied(true);
    } catch (err) {
      console.error("Unable to copy wallet:", err);
    }
  }

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>
        <section className="mt90 sm-mt-0" aria-label="Author profile">
          <div className="container">
            {!authorId ? (
              <p>Select an author to view their profile.</p>
            ) : loading ? (
              <AuthorSkeleton />
            ) : error ? (
              <p role="alert">{error}</p>
            ) : !profile ? (
              <p>Author not found.</p>
            ) : (
              <>
                <div className="author-profile__header">
                  <div className="author-profile__identity">
                    <div className="author-profile__avatar">
                      {profile.image ? (
                        <img
                          src={profile.image}
                          alt={profile.name || "Author"}
                        />
                      ) : (
                        <span>{(profile.name || "?").charAt(0)}</span>
                      )}
                    </div>
                    <div className="author-profile__info">
                      <h2>{profile.name || "Unknown author"}</h2>
                      {profile.username && (
                        <span className="author-profile__username">
                          @{String(profile.username).replace(/^@/, "")}
                        </span>
                      )}
                      {profile.wallet && (
                        <div className="author-profile__wallet">
                          <span title={String(profile.wallet)}>
                            {profile.wallet}
                          </span>
                          <button type="button" onClick={copyWallet}>
                            {copied ? "Copied" : "Copy"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="author-profile__actions">
                    <strong>
                      {profile.followers != null
                        ? `${profile.followers} followers`
                        : "Followers unavailable"}
                    </strong>
                    <button
                      type="button"
                      className="btn-main"
                      onClick={() =>
                        window.alert("Following profiles is not available yet.")
                      }
                    >
                      Follow
                    </button>
                  </div>
                </div>
                <AuthorItems items={profile.items} profile={profile} />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;
