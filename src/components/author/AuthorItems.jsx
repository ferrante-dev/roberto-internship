import React from "react";
import { Link } from "react-router-dom";
import { FaCheck, FaHeart } from "react-icons/fa";
import Skeleton from "../UI/Skeleton";
import { formatEth, getAuthorPath, getNftPath } from "../UI/nftApi";

const AuthorCardSkeleton = () => {
  return (
    <div
      className="author-nft-card author-nft-card--skeleton"
      aria-hidden="true"
    >
      <div className="author-nft-card__top">
        <div className="author-nft-card__skeleton-avatar">
          <Skeleton width="46px" height="46px" borderRadius="50%" />

          <span className="author-nft-card__skeleton-verified">
            <Skeleton width="17px" height="17px" borderRadius="50%" />
          </span>
        </div>
      </div>

      <div className="author-nft-card__artwork author-nft-card__skeleton-artwork">
        <Skeleton width="100%" height="100%" borderRadius="9px" />
      </div>

      <div className="author-nft-card__info">
        <Skeleton width="75%" height="17px" borderRadius="4px" />

        <div className="author-nft-card__bottom">
          <Skeleton width="65px" height="15px" borderRadius="4px" />

          <Skeleton width="40px" height="14px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
};

const AuthorItems = ({ items = [], profile, loading = false }) => {
  const authorPath = profile ? getAuthorPath(profile) : null;

  if (loading) {
    return (
      <div className="author-collection__grid" aria-label="Loading author NFTs">
        {Array.from({ length: 8 }).map((_, index) => (
          <AuthorCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="author-collection__empty">
        <p>No NFTs found for this author.</p>
      </div>
    );
  }

  return (
    <div
      className="author-collection__grid"
      aria-label={`${profile?.name || "Author"} NFT collection`}
    >
      {items.map((item, index) => {
        const nftPath = getNftPath(item);

        const avatar = (
          <div className="author-nft-card__avatar">
            {profile?.image ? (
              <img src={profile.image} alt="" loading="lazy" />
            ) : (
              <span>{profile?.name?.charAt(0) || "?"}</span>
            )}

            <span className="author-nft-card__verified" aria-hidden="true">
              <FaCheck />
            </span>
          </div>
        );

        return (
          <article className="author-nft-card" key={item.id ?? index}>
            <div className="author-nft-card__top">
              {authorPath ? (
                <Link
                  to={authorPath}
                  className="author-nft-card__avatar-link"
                  aria-label={`View ${profile?.name || "author"} profile`}
                >
                  {avatar}
                </Link>
              ) : (
                avatar
              )}
            </div>

            <div className="author-nft-card__artwork">
              {nftPath ? (
                <Link
                  to={nftPath}
                  className="author-nft-card__image-link"
                  aria-label={`View ${item.title}`}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.title} loading="lazy" />
                  ) : (
                    <span>Image unavailable</span>
                  )}
                </Link>
              ) : (
                <div className="author-nft-card__image-link">
                  {item.image ? (
                    <img src={item.image} alt={item.title} loading="lazy" />
                  ) : (
                    <span>Image unavailable</span>
                  )}
                </div>
              )}
            </div>

            <div className="author-nft-card__info">
              {nftPath ? (
                <Link to={nftPath} className="author-nft-card__title-link">
                  <h3>{item.title}</h3>
                </Link>
              ) : (
                <h3>{item.title}</h3>
              )}

              <div className="author-nft-card__bottom">
                <span className="author-nft-card__price">
                  {formatEth(item.price)}
                </span>

                <span
                  className="author-nft-card__likes"
                  aria-label={`${item.likes ?? 0} likes`}
                >
                  <FaHeart aria-hidden="true" />
                  {item.likes ?? 0}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default AuthorItems;
