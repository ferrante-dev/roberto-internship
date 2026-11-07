import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaEye, FaHeart } from "react-icons/fa";
import Skeleton from "../components/UI/Skeleton";
import EthImage from "../images/ethereum.svg";
import {
  fetchNftDetails,
  formatEth,
  getAuthorPath,
} from "../components/UI/nftApi";
import "../components/home/NewItems.css";

const ProfileInfo = ({ person, label }) => {
  const profilePath = getAuthorPath(person);

  const name =
    person.name ||
    (person.id != null ? `${label} ID: ${person.id}` : `${label} unavailable`);

  const content = (
    <>
      <div className="nft-details__person-avatar">
        {person.image ? (
          <img src={person.image} alt={name} />
        ) : (
          <span>{name.charAt(0)}</span>
        )}
      </div>

      <strong>{name}</strong>
    </>
  );

  return (
    <div className="nft-details__person">
      <h6>{label}</h6>

      {profilePath ? (
        <Link to={profilePath} className="nft-details__person-link">
          {content}
        </Link>
      ) : (
        <div className="nft-details__person-link">{content}</div>
      )}
    </div>
  );
};

const ItemDetailsSkeleton = ({ source }) => {
  return (
    <div
      className="row nft-details__loading"
      role="status"
      aria-label="Loading NFT details"
    >
      <div className="col-md-6 text-center">
        <div
          className={`nft-details__skeleton-image nft-details__skeleton-image--${source}`}
        >
          <Skeleton width="100%" height="100%" borderRadius="8px" />
        </div>
      </div>
      <div className="col-md-6">
        <div className="nft-details__skeleton-content">
          <Skeleton width="75%" height="35px" borderRadius="5px" />
          <div className="nft-details__skeleton-row">
            <Skeleton width="65px" height="25px" borderRadius="4px" />
            <Skeleton width="65px" height="25px" borderRadius="4px" />
          </div>
          <div className="nft-details__skeleton-lines">
            <Skeleton width="100%" height="14px" borderRadius="4px" />
            <Skeleton width="95%" height="14px" borderRadius="4px" />
            <Skeleton width="85%" height="14px" borderRadius="4px" />
          </div>
          {Array.from({ length: 2 }).map((_, index) => (
            <div className="nft-details__skeleton-person" key={index}>
              <Skeleton width="65px" height="16px" borderRadius="4px" />
              <div className="nft-details__skeleton-row">
                <Skeleton width="45px" height="45px" borderRadius="50%" />
                <Skeleton width="125px" height="16px" borderRadius="4px" />
              </div>
            </div>
          ))}
          <Skeleton width="55px" height="16px" borderRadius="4px" />
          <Skeleton width="110px" height="28px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
};

const ItemDetails = () => {
  const { nftId, source } = useParams();
  const apiSource = source === "new" ? "new" : "hot";

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    window.scrollTo(0, 0);
    setItem(null);
    setLoading(true);
    setError("");

    if (!nftId) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    async function getItemDetails() {
      try {
        const data = await fetchNftDetails(nftId);

        if (active) {
          setItem(data);
        }
      } catch (err) {
        console.error("Failed to load NFT details:", err);

        if (active) {
          setError("Unable to load NFT details.");
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
  }, [nftId]);

  const title = item
    ? item.number != null
      ? `${item.title} #${item.number}`
      : item.title
    : "";

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>
        <section className="mt90 sm-mt-0" aria-label="NFT details">
          <div className="container">
            {!nftId ? (
              <p>Select an NFT to view its details.</p>
            ) : loading ? (
              <ItemDetailsSkeleton source={apiSource} />
            ) : error ? (
              <p role="alert">{error}</p>
            ) : !item ? (
              <p>NFT not found.</p>
            ) : (
              <div className="row">
                <div className="col-md-6 text-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      className="img-fluid img-rounded mb-sm-30 nft-image"
                      alt={title}
                    />
                  ) : (
                    <p>Image unavailable.</p>
                  )}
                </div>
                <div className="col-md-6">
                  <div className="item_info">
                    <h2>{title}</h2>
                    <div className="item_info_counts">
                      <div className="item_info_views">
                        <FaEye aria-hidden="true" />
                        <span>{item.views ?? "—"}</span>
                      </div>
                      <div className="item_info_like">
                        <FaHeart aria-hidden="true" />
                        <span>{item.likes ?? "—"}</span>
                      </div>
                    </div>
                    <p>{item.description || "Description unavailable."}</p>
                    <ProfileInfo person={item.owner} label="Owner" />
                    <ProfileInfo person={item.creator} label="Creator" />
                    <div className="nft-details__price">
                      <h6>Price</h6>
                      {item.price != null ? (
                        <div className="nft-item-price">
                          <img src={EthImage} alt="Ethereum" />
                          <span>
                            {formatEth(item.price).replace(/\s*ETH$/i, "")}
                          </span>
                        </div>
                      ) : (
                        <p>Price unavailable.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ItemDetails;
