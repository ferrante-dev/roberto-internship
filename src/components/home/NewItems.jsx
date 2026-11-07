import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaCheck,
} from "react-icons/fa";
import { useKeenSlider } from "keen-slider/react";
import Skeleton from "../UI/Skeleton";
import {
  fetchNfts,
  formatEth,
  formatCountdown,
  getNftPath,
  getAuthorPath,
} from "../UI/nftApi";
import "keen-slider/keen-slider.min.css";
import "./NewItems.css";

const NewItemSkeleton = () => {
  return (
    <div className="new-items__skeleton-card" aria-hidden="true">
      <div className="new-items__skeleton-avatar">
        <Skeleton width="44px" height="44px" borderRadius="50%" />
      </div>
      <div className="new-items__skeleton-timer">
        <Skeleton width="85px" height="24px" borderRadius="20px" />
      </div>
      <div className="new-items__skeleton-image">
        <Skeleton width="100%" height="100%" borderRadius="6px" />
      </div>
      <div className="new-items__skeleton-info">
        <Skeleton width="70%" height="17px" borderRadius="4px" />
        <Skeleton width="40%" height="14px" borderRadius="4px" />
      </div>
    </div>
  );
};

const NewItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    mode: "snap",
    slides: {
      perView: 1,
      spacing: 12,
    },
    breakpoints: {
      "(min-width: 600px)": {
        slides: { perView: 2, spacing: 14 },
      },
      "(min-width: 992px)": {
        slides: { perView: 4, spacing: 12 },
      },
    },
    dragStarted: () => setDragging(true),
    dragEnded: () => setDragging(false),
  });

  useEffect(() => {
    let active = true;

    async function getItems() {
      try {
        const data = await fetchNfts("new");
        if (active) setItems(data);
      } catch (err) {
        console.error("Failed to load New Items:", err);
        if (active) setError("Unable to load New Items.");
      } finally {
        if (active) setLoading(false);
      }
    }

    getItems();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && items.length > 0) {
      instanceRef.current?.update();
    }
  }, [loading, items, instanceRef]);

  useEffect(() => {
    if (!items.some((item) => item.deadline != null)) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [items]);

  useEffect(() => {
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (
      loading ||
      items.length < 2 ||
      hovered ||
      focused ||
      dragging ||
      reducedMotion
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      instanceRef.current?.next();
    }, 4000);

    return () => window.clearInterval(interval);
  }, [loading, items.length, hovered, focused, dragging, instanceRef]);

  const canNavigate = !loading && !error && items.length > 1;

  return (
    <section id="section-items" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>New Items</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>
          {error ? (
            <div className="col-12 text-center" role="alert">
              {error}
            </div>
          ) : !loading && items.length === 0 ? (
            <div className="col-12 text-center">No NFTs found.</div>
          ) : (
            <div className="col-12">
              <div
                className="new-items__carousel"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onFocusCapture={() => setFocused(true)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setFocused(false);
                  }
                }}
              >
                {loading ? (
                  <div
                    className="new-items__loading"
                    role="status"
                    aria-label="Loading New Items"
                  >
                    {Array.from({ length: 4 }).map((_, index) => (
                      <NewItemSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <div
                    ref={sliderRef}
                    className="keen-slider"
                    role="region"
                    aria-roledescription="carousel"
                    aria-label="New Items"
                    aria-live="off"
                  >
                    {items.map((item, index) => {
                      const nftPath = getNftPath(item);
                      const authorPath = getAuthorPath(item.creator);
                      const countdown = formatCountdown(item.deadline, now);
                      return (
                        <div
                          className="keen-slider__slide new-items__slide"
                          key={item.id ?? index}
                        >
                          <div className="new-items__card">
                            <div className="new-items__card-top">
                              {authorPath ? (
                                <Link
                                  to={authorPath}
                                  className="new-items__avatar"
                                  aria-label="View author profile"
                                >
                                  {item.creator.image ? (
                                    <img
                                      src={item.creator.image}
                                      alt={item.creator.name || "NFT author"}
                                    />
                                  ) : (
                                    <span>?</span>
                                  )}
                                  <span className="new-items__verified">
                                    <FaCheck />
                                  </span>
                                </Link>
                              ) : (
                                <div className="new-items__avatar">
                                  {item.creator.image ? (
                                    <img
                                      src={item.creator.image}
                                      alt={item.creator.name || "NFT author"}
                                    />
                                  ) : (
                                    <span>?</span>
                                  )}
                                </div>
                              )}

                              {countdown && (
                                <span className="new-items__countdown">
                                  {countdown}
                                </span>
                              )}
                            </div>

                            {nftPath ? (
                              <Link
                                to={nftPath}
                                className="new-items__image-link"
                              >
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    loading="lazy"
                                  />
                                )}
                              </Link>
                            ) : (
                              <div className="new-items__image-link">
                                {item.image && (
                                  <img src={item.image} alt={item.title} />
                                )}
                              </div>
                            )}

                            <div className="new-items__card-info">
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
                        </div>
                      );
                    })}
                  </div>
                )}

                {(loading || canNavigate) && (
                  <>
                    <button
                      type="button"
                      className="new-items__arrow new-items__arrow--left"
                      aria-label="Previous NFT"
                      disabled={!canNavigate}
                      onClick={() => instanceRef.current?.prev()}
                    >
                      <FaChevronLeft aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      className="new-items__arrow new-items__arrow--right"
                      aria-label="Next NFT"
                      disabled={!canNavigate}
                      onClick={() => instanceRef.current?.next()}
                    >
                      <FaChevronRight aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewItems;
