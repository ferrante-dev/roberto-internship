import React from "react";
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { formatEth, getNftPath } from "../../components/UI/nftApi";

const AuthorItems = ({ items = [], profile = {} }) => {
  if (items.length === 0) {
    return <p>No NFTs found for this author.</p>;
  }

  return (
    <div className="author-items__grid">
      {items.map((item, index) => {
        const nftPath = getNftPath(item);

        return (
          <div className="author-items__card" key={item.id ?? index}>
            <div className="author-items__card-top">
              <div className="author-items__avatar">
                {profile.image ? (
                  <img src={profile.image} alt={profile.name || "Author"} />
                ) : (
                  <span>{(profile.name || "?").charAt(0)}</span>
                )}
              </div>
            </div>
            {nftPath ? (
              <Link to={nftPath} className="author-items__image-link">
                {item.image && (
                  <img src={item.image} alt={item.title} loading="lazy" />
                )}
              </Link>
            ) : (
              <div className="author-items__image-link">
                {item.image && <img src={item.image} alt={item.title} />}
              </div>
            )}
            <div className="author-items__card-info">
              {nftPath ? (
                <Link to={nftPath}>
                  <h4>{item.title}</h4>
                </Link>
              ) : (
                <h4>{item.title}</h4>
              )}
              <div className="new-items__card-meta">
                <span>{formatEth(item.price)}</span>
                <span className="new-items__likes">
                  <FaHeart aria-hidden="true" />
                  {item.likes ?? "—"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AuthorItems;
