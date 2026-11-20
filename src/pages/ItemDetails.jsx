import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaEye, FaHeart, FaCheck } from "react-icons/fa";
import Skeleton from "../components/UI/Skeleton";
import EthImage from "../images/ethereum.svg";
import {
  fetchNftDetails,
  formatEth,
  getAuthorPath,
} from "../components/UI/nftApi";
import "./ItemDetails.css";

const ProfileInfo = ({ person, label }) => {
  const profilePath = getAuthorPath(person);

  const name =
    person?.name ||
    (person?.id != null ? `${label} ID: ${person.id}` : `${label} unavailable`);

  const avatar = (
    <div className="nft-details__person-avatar">
      {person?.image ? (
        <img src={person.image} alt={name} />
      ) : (
        <span>{name.charAt(0)}</span>
      )}

      {person?.id != null && (
        <span className="nft-details__verified">
          <FaCheck aria-hidden="true" />
        </span>
      )}
    </div>
  );

  return (
    <div className="nft-details__person">
      <h6>{label}</h6>

      <div className="nft-details__person-info">
        {profilePath ? (
          <>
            <Link to={profilePath} aria-label={`View ${name}'s profile`}>
              {avatar}
            </Link>

            <Link to={profilePath} className="nft-details__person-name">
              {name}
            </Link>
          </>
        ) : (
          <>
            {avatar}

            <span className="nft-details__person-name">{name}</span>
          </>
        )}
      </div>
    </div>
  );
};

const ArtworkSkeleton = () => {
  return (
    <div className="nft-details__image-placeholder">
      <div className="nft-details__skeleton-fill">
        <Skeleton width="100%" height="100%" borderRadius="8px" />
      </div>
    </div>
  );
};

const ItemArtwork = ({ image, title }) => {
  const [status, setStatus] = useState("loading");

  if (!image || status === "error") {
    return (
      <div className="nft-details__image-unavailable">Image unavailable.</div>
    );
  }

  return (
    <div className="nft-details__artwork">
      {status === "loading" && (
        <div role="status" aria-label="Loading NFT artwork">
          <ArtworkSkeleton />
        </div>
      )}

      <img
        src={image}
        alt={title}
        className={`nft-details__image ${
          status === "loading" ? "nft-details__image--loading" : ""
        }`}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        decoding="async"
      />
    </div>
  );
};

const ItemDetailsSkeleton = () => {
  return (
    <div
      className="nft-details__layout nft-details__loading"
      role="status"
      aria-label="Loading NFT details"
    >
      <ArtworkSkeleton />

      <div className="nft-details__skeleton-content">
        <Skeleton width="70%" height="36px" borderRadius="5px" />

        <div className="nft-details__skeleton-row">
          <Skeleton width="72px" height="28px" borderRadius="4px" />
          <Skeleton width="72px" height="28px" borderRadius="4px" />
        </div>

        <div className="nft-details__skeleton-lines">
          <Skeleton width="100%" height="15px" borderRadius="4px" />
          <Skeleton width="95%" height="15px" borderRadius="4px" />
          <Skeleton width="80%" height="15px" borderRadius="4px" />
        </div>

        {Array.from({ length: 2 }).map((_, index) => (
          <div className="nft-details__skeleton-person" key={index}>
            <Skeleton width="65px" height="15px" borderRadius="4px" />

            <div className="nft-details__skeleton-row">
              <Skeleton width="45px" height="45px" borderRadius="50%" />

              <Skeleton width="125px" height="16px" borderRadius="4px" />
            </div>
          </div>
        ))}

        <div className="nft-details__skeleton-price">
          <Skeleton width="45px" height="15px" borderRadius="4px" />
          <Skeleton width="100px" height="30px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
};

const ItemDetailsContent = ({ nftId }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setItem(null);
    setError("");

    async function getItemDetails() {
      try {
        const data = await fetchNftDetails(nftId);

        if (active) {
          setItem(data);
        }
      } catch (err) {
        console.error("Failed to load NFT details:", err);

        if (active) {
          setError(
            err.response?.status === 404
              ? "This NFT could not be found."
              : "Unable to load NFT details. Please try again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    getItemDetails();

    return () => {
      active = false;
    };
  }, [nftId, retryCount]);

  if (loading) {
    return <ItemDetailsSkeleton />;
  }

  if (error || !item) {
    return (
      <div className="nft-details__message" role="alert">
        <p>{error || "NFT not found."}</p>

        <button
          type="button"
          className="btn-main"
          onClick={() => {
            setLoading(true);
            setRetryCount((previous) => previous + 1);
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const title =
    item.number != null ? `${item.title} #${item.number}` : item.title;

  const formattedPrice = formatEth(item.price);

  return (
    <div className="nft-details__layout">
      <ItemArtwork key={item.image} image={item.image} title={title} />

      <div className="nft-details__info">
        <h2 className="nft-details__title">{title}</h2>

        <div className="nft-details__stats">
          <div
            className="nft-details__stat"
            title="Views"
            aria-label={`${item.views ?? "Unknown"} views`}
          >
            <FaEye aria-hidden="true" />
            <span>{item.views ?? "—"}</span>
          </div>

          <div
            className="nft-details__stat"
            title="Likes"
            aria-label={`${item.likes ?? "Unknown"} likes`}
          >
            <FaHeart aria-hidden="true" />
            <span>{item.likes ?? "—"}</span>
          </div>
        </div>

        <p className="nft-details__description">
          {item.description || "Description unavailable."}
        </p>

        <ProfileInfo person={item.owner} label="Owner" />

        <ProfileInfo person={item.creator} label="Creator" />

        <div className="nft-details__price">
          <h6>Price</h6>

          {formattedPrice !== "Price unavailable" ? (
            <div
              className="nft-details__price-value"
              aria-label={formattedPrice}
            >
              <img src={EthImage} alt="Ethereum" />

              <span>{formattedPrice.replace(/\s*ETH$/i, "")}</span>
            </div>
          ) : (
            <p>Price unavailable.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ItemDetails = () => {
  const { nftId, source } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [nftId]);

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section
          className={`nft-details mt90 sm-mt-0 ${
            source === "new" ? "nft-details--square" : ""
          }`}
          aria-label="NFT details"
        >
          <div className="container">
            {nftId ? (
              <ItemDetailsContent key={nftId} nftId={nftId} />
            ) : (
              <div className="nft-details__message">
                <p>Select an NFT to view its details.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ItemDetails;
