import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "../UI/Skeleton";
import {
  fetchNfts,
  formatEth,
  formatCountdown,
  getNftPath,
  getAuthorPath,
} from "../UI/nftApi";
import "./ExploreItems.css";

const INITIAL_ITEMS = 8;
const LOAD_MORE_COUNT = 4;

const ExploreSkeleton = () => {
  return (
    <div
      className="d-item col-lg-3 col-md-6 col-sm-6 col-12 explore-items__column"
      aria-hidden="true"
    >
      <div className="nft__item explore-items__skeleton-card">
        <div className="explore-items__skeleton-avatar">
          <Skeleton width="44px" height="44px" borderRadius="50%" />
        </div>
        <div className="explore-items__skeleton-timer">
          <Skeleton width="90px" height="24px" borderRadius="20px" />
        </div>
        <div className="explore-items__skeleton-image">
          <Skeleton width="100%" height="100%" borderRadius="6px" />
        </div>
        <div className="explore-items__skeleton-info">
          <Skeleton width="75%" height="18px" borderRadius="4px" />
          <Skeleton width="45%" height="15px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
};

const ExploreItems = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setItems([]);
    setVisibleCount(INITIAL_ITEMS);

    async function getExploreItems() {
      try {
        const data = await fetchNfts("explore", filter);

        if (active) {
          setItems(data);
          setNow(Date.now());
        }
      } catch (err) {
        console.error("Failed to load Explore NFTs:", err);

        if (active) {
          setError("Unable to load NFTs. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    getExploreItems();

    return () => {
      active = false;
    };
  }, [filter, retryCount]);

  useEffect(() => {
    if (!items.some((item) => item.deadline != null)) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [items]);

  function handleFilterChange(event) {
    setVisibleCount(INITIAL_ITEMS);
    setFilter(event.target.value);
  }

  function handleLoadMore() {
    setVisibleCount((previous) =>
      Math.min(previous + LOAD_MORE_COUNT, items.length),
    );
  }

  const visibleItems = items.slice(0, visibleCount);
  const hasMoreItems = visibleCount < items.length;

  return (
    <>
      <div
        className="col-12 explore-items__filter-row"
        data-aos="fade-up"
        data-aos-offset="0"
      >
        <label htmlFor="filter-items" className="explore-items__filter-label">
          Sort by
        </label>
        <select
          id="filter-items"
          className="explore-items__select"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="">Default</option>
          <option value="price_low_to_high">Price, Low to High</option>
          <option value="price_high_to_low">Price, High to Low</option>
          <option value="likes_high_to_low">Most Liked</option>
        </select>
      </div>

      {loading ? (
        <div className="col-12" role="status" aria-label="Loading Explore NFTs">
          <div className="row explore-items__loading">
            {Array.from({ length: INITIAL_ITEMS }).map((_, index) => (
              <ExploreSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="col-12 text-center explore-items__message" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="btn-main"
            onClick={() => setRetryCount((previous) => previous + 1)}
          >
            Try Again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="col-12 text-center explore-items__message">
          <p>No NFTs found.</p>
        </div>
      ) : (
        <>
          {visibleItems.map((item, index) => {
            const nftPath = getNftPath(item);

            const author =
              item.creator?.id != null || item.creator?.image
                ? item.creator
                : item.owner;

            const authorPath = getAuthorPath(author);
            const countdown = formatCountdown(item.deadline, now);

            return (
              <div
                key={item.id ?? index}
                className="d-item col-lg-3 col-md-6 col-sm-6 col-12 explore-items__column"
                data-aos="fade-up"
                data-aos-delay={(index % 4) * 100}
              >
                <div className="nft__item explore-items__card">
                  {author?.image && (
                    <div className="author_list_pp">
                      {authorPath ? (
                        <Link
                          to={authorPath}
                          aria-label={`View ${author.name || "author"} profile`}
                        >
                          <img
                            className="lazy"
                            src={author.image}
                            alt={author.name || "NFT author"}
                            loading="lazy"
                          />
                          <i className="fa fa-check" aria-hidden="true"></i>
                        </Link>
                      ) : (
                        <img
                          className="lazy"
                          src={author.image}
                          alt={author.name || "NFT author"}
                          loading="lazy"
                        />
                      )}
                    </div>
                  )}
                  {countdown && <div className="de_countdown">{countdown}</div>}
                  <div className="nft__item_wrap explore-items__artwork">
                    {nftPath ? (
                      <Link to={nftPath} className="explore-items__image-link">
                        {item.image ? (
                          <img
                            src={item.image}
                            className="lazy nft__item_preview explore-items__image"
                            alt={item.title}
                            loading="lazy"
                          />
                        ) : (
                          <span>Image unavailable</span>
                        )}
                      </Link>
                    ) : (
                      <div className="explore-items__image-link">
                        {item.image ? (
                          <img
                            src={item.image}
                            className="lazy nft__item_preview explore-items__image"
                            alt={item.title}
                          />
                        ) : (
                          <span>Image unavailable</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="nft__item_info">
                    {nftPath ? (
                      <Link to={nftPath}>
                        <h4>{item.title}</h4>
                      </Link>
                    ) : (
                      <h4>{item.title}</h4>
                    )}
                    <div className="nft__item_price">
                      {formatEth(item.price)}
                    </div>
                    <div className="nft__item_like">
                      <i className="fa fa-heart" aria-hidden="true"></i>
                      <span>{item.likes ?? "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {hasMoreItems && (
            <div
              className="col-md-12 text-center explore-items__loadmore"
              data-aos="fade-up"
              data-aos-offset="0"
            >
              <button
                type="button"
                id="loadmore"
                className="btn-main lead"
                onClick={handleLoadMore}
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ExploreItems;
