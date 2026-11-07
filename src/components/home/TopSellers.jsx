import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import Skeleton from "../UI/Skeleton";
import { formatEth, getAuthorPath } from "../UI/nftApi";
import "./TopSellers.css";

const TOP_SELLERS_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/topSellers";

const pick = (...values) =>
  values.find(
    (value) => value !== null && value !== undefined && value !== "",
  ) ?? null;

const normalizeSeller = (seller) => {
  const author = seller.author || {};
  const profile = seller.profile || {};

  return {
    id: pick(
      seller.authorId,
      seller.authorID,
      seller.sellerId,
      seller.userId,
      seller.profileId,
      author.authorId,
      author.id,
      profile.authorId,
      profile.id,
    ),
    name: pick(
      seller.authorName,
      seller.sellerName,
      seller.name,
      seller.fullName,
      author.name,
      profile.name,
      "Unknown seller",
    ),
    image: pick(
      seller.authorImage,
      seller.sellerImage,
      seller.profileImage,
      seller.avatar,
      seller.image,
      author.image,
      author.authorImage,
      profile.image,
    ),
    eth: pick(
      seller.eth,
      seller.ethAmount,
      seller.totalEth,
      seller.ethVolume,
      seller.totalVolume,
      seller.volume,
      seller.amount,
      seller.price,
      seller.earnings,
      seller.totalEarnings,
    ),
  };
};

const SellerSkeleton = ({ rank }) => {
  return (
    <li className="top-sellers__entry" aria-hidden="true">
      <span className="top-sellers__rank">{rank}.</span>
      <div className="top-sellers__seller">
        <Skeleton width="44px" height="44px" borderRadius="50%" />
        <div className="top-sellers__skeleton-info">
          <Skeleton width="110px" height="15px" borderRadius="4px" />
          <Skeleton width="65px" height="13px" borderRadius="4px" />
        </div>
      </div>
    </li>
  );
};

const TopSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function getTopSellers() {
      try {
        const { data } = await axios.get(TOP_SELLERS_URL);

        const results = Array.isArray(data)
          ? data
          : (data?.topSellers ??
            data?.sellers ??
            data?.results ??
            data?.data?.topSellers ??
            data?.data?.sellers ??
            data?.data);

        if (!Array.isArray(results)) {
          throw new Error("Unexpected Top Sellers API response");
        }

        if (active) {
          setSellers(results.slice(0, 12).map(normalizeSeller));
        }
      } catch (err) {
        console.error("Failed to load Top Sellers:", err);

        if (active) {
          setError("Unable to load Top Sellers.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    getTopSellers();

    return () => {
      active = false;
    };
  }, []);
  return (
    <section id="section-top-sellers" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Top Sellers</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>
          <div className="col-lg-12">
            {error ? (
              <p className="text-center" role="alert">
                {error}
              </p>
            ) : !loading && sellers.length === 0 ? (
              <p className="text-center">No sellers found.</p>
            ) : (
              <ol
                className={`top-sellers__grid ${
                  loading ? "top-sellers__loading" : ""
                }`}
                aria-label="Top Sellers rankings"
                aria-busy={loading}
              >
                {loading
                  ? Array.from({ length: 12 }).map((_, index) => (
                      <SellerSkeleton key={index} rank={index + 1} />
                    ))
                  : sellers.map((seller, index) => {
                      const authorPath = getAuthorPath({
                        id: seller.id,
                      });
                      const avatar = (
                        <div className="top-sellers__avatar">
                          {seller.image ? (
                            <img src={seller.image} alt="" loading="lazy" />
                          ) : (
                            <span>{seller.name.charAt(0)}</span>
                          )}
                          <span
                            className="top-sellers__verified"
                            aria-hidden="true"
                          >
                            <FaCheck />
                          </span>
                        </div>
                      );
                      return (
                        <li
                          className="top-sellers__entry"
                          key={seller.id ?? index}
                        >
                          <span className="top-sellers__rank">
                            {index + 1}.
                          </span>
                          <div className="top-sellers__seller">
                            {authorPath ? (
                              <Link
                                to={authorPath}
                                className="top-sellers__avatar-link"
                                aria-label={`View ${seller.name}'s profile`}
                              >
                                {avatar}
                              </Link>
                            ) : (
                              avatar
                            )}
                            <div className="top-sellers__info">
                              {authorPath ? (
                                <Link
                                  to={authorPath}
                                  className="top-sellers__name-link"
                                >
                                  <span className="top-sellers__name">
                                    {seller.name}
                                  </span>
                                </Link>
                              ) : (
                                <span className="top-sellers__name">
                                  {seller.name}
                                </span>
                              )}
                              <span className="top-sellers__eth">
                                {seller.eth != null
                                  ? formatEth(seller.eth)
                                  : "ETH unavailable"}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSellers;
