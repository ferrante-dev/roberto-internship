import axios from "axios";

const API = {
  hot: "https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections",
  new: "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems",
  details:
    "https://us-central1-nft-cloud-functions.cloudfunctions.net/itemDetails",
  authors: "https://us-central1-nft-cloud-functions.cloudfunctions.net/authors",
};

const pick = (...values) =>
  values.find(
    (value) => value !== null && value !== undefined && value !== "",
  ) ?? null;

const asObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

function readImage(value) {
  if (typeof value === "string") return value;

  const image = asObject(value);

  return pick(image.url, image.src, image.imageUrl);
}

function parseDeadline(item) {
  const absolute = pick(
    item.expiryDate,
    item.endTime,
    item.endDate,
    item.endAt,
    item.auctionEnd,
    item.auctionEndTime,
    item.expiresAt,
    item.expirationDate,
  );

  if (absolute != null) {
    const number = Number(absolute);

    if (Number.isFinite(number) && number > 1e9) {
      return number > 1e12 ? number : number * 1000;
    }

    const parsed = Date.parse(String(absolute));

    if (Number.isFinite(parsed)) return parsed;
  }

  const countdown = pick(
    item.countdown,
    item.countDown,
    item.timeLeft,
    item.auctionCountdown,
    item.auctionEndsIn,
  );

  if (countdown == null) return null;

  if (typeof countdown === "number") {
    return Date.now() + countdown * 1000;
  }

  if (typeof countdown === "object") {
    const value = asObject(countdown);

    const seconds =
      Number(value.days || 0) * 86400 +
      Number(value.hours || 0) * 3600 +
      Number(value.minutes || 0) * 60 +
      Number(value.seconds || 0);

    return seconds > 0 ? Date.now() + seconds * 1000 : null;
  }

  const text = String(countdown).trim();

  if (/^\d+:\d{2}:\d{2}$/.test(text)) {
    const [hours, minutes, seconds] = text.split(":").map(Number);

    return Date.now() + (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  const matches = [...text.matchAll(/(\d+)\s*([dhms])/gi)];

  if (matches.length > 0) {
    const units = {
      d: 86400,
      h: 3600,
      m: 60,
      s: 1,
    };

    const seconds = matches.reduce(
      (total, match) =>
        total + Number(match[1]) * units[match[2].toLowerCase()],
      0,
    );

    return Date.now() + seconds * 1000;
  }

  const parsed = Date.parse(text);

  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeNft(raw, source = "new") {
  const owner = asObject(raw.owner);
  const creator = asObject(raw.creator || raw.author);

  return {
    id: pick(raw.nftId, raw.nftID, raw.nft_id, raw.id),
    source,
    title: pick(raw.title, raw.name, raw.nftName, "Untitled NFT"),
    number: pick(raw.tag, raw.nftNumber, raw.tokenNumber, raw.tokenId),
    image: readImage(
      pick(raw.nftImage, raw.image, raw.imageUrl, raw.nft_image),
    ),
    description: pick(raw.description, raw.nftDescription),
    price: pick(raw.price, raw.priceEth, raw.nftPrice, raw.ethPrice),
    likes: pick(raw.likes, raw.likeCount, raw.numberOfLikes),
    views: pick(raw.views, raw.viewCount, raw.numberOfViews),
    code: pick(raw.code, raw.collectionCode),
    deadline: parseDeadline(raw),
    owner: {
      id: pick(raw.ownerId, raw.ownerID, owner.id, owner.userId),
      name: pick(raw.ownerName, owner.name, owner.fullName),
      image: readImage(
        pick(raw.ownerImage, raw.ownerAvatar, owner.image, owner.avatar),
      ),
      username: pick(raw.ownerUsername, owner.username),
      wallet: pick(raw.ownerWallet, owner.wallet, owner.walletAddress),
      followers: pick(raw.ownerFollowers, owner.followers),
    },
    creator: {
      id: pick(
        raw.creatorId,
        raw.creatorID,
        raw.authorId,
        raw.authorID,
        creator.id,
      ),
      name: pick(
        raw.creatorName,
        raw.authorName,
        creator.name,
        creator.fullName,
      ),
      image: readImage(
        pick(raw.creatorImage, raw.authorImage, creator.image, creator.avatar),
      ),
      username: pick(raw.creatorUsername, raw.authorUsername, creator.username),
      wallet: pick(raw.creatorWallet, creator.wallet),
      followers: pick(raw.creatorFollowers, creator.followers),
    },
  };
}

export async function fetchNfts(source = "new") {
  const { data } = await axios.get(API[source] || API.new);

  const items = Array.isArray(data)
    ? data
    : (data?.items ??
      data?.newItems ??
      data?.hotCollections ??
      data?.results ??
      data?.data?.items ??
      data?.data);

  if (!Array.isArray(items)) {
    throw new Error("Unexpected NFT API response");
  }

  return items.map((item) => normalizeNft(item, source));
}

export async function fetchNftDetails(nftId) {
  const { data } = await axios.get(API.details, {
    params: { nftId },
  });

  const item = data?.data ?? data;

  if (!item || Array.isArray(item) || typeof item !== "object") {
    throw new Error("Unexpected NFT details response");
  }

  return normalizeNft(item);
}

export async function fetchAuthorDetails(authorId) {
  const { data } = await axios.get(API.authors, {
    params: { author: authorId },
  });

  const author = data?.data ?? data;

  if (!author || Array.isArray(author) || typeof author !== "object") {
    throw new Error("Unexpected author details response");
  }

  return {
    id: pick(author.authorId, author.id),
    name: pick(author.authorName, author.name),
    username: pick(author.tag, author.username),
    wallet: pick(author.address, author.wallet),
    image: readImage(pick(author.authorImage, author.image)),
    followers: pick(author.followers, author.followerCount),
    items: Array.isArray(author.nftCollection)
      ? author.nftCollection.map((item) => normalizeNft(item, "hot"))
      : [],
  };
}

export function formatEth(price) {
  if (price == null) return "Price unavailable";

  const value =
    typeof price === "object"
      ? pick(price.eth, price.value, price.amount)
      : price;

  if (value == null) return "Price unavailable";

  const text = String(value).trim();

  return /ETH$/i.test(text) ? text : `${text} ETH`;
}

export function formatCountdown(deadline, now) {
  if (deadline == null) return null;

  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));

  if (remaining === 0) return "Ended";

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return [
    days > 0 ? `${days}d` : null,
    `${hours}h`,
    `${minutes}m`,
    `${seconds}s`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getNftPath(item) {
  if (item?.id == null) return null;

  const id = encodeURIComponent(String(item.id));

  return item.source === "new"
    ? `/item-details/new/${id}`
    : `/item-details/${id}`;
}

export function getAuthorPath(person) {
  if (person?.id == null) return null;

  return `/author/${encodeURIComponent(String(person.id))}`;
}

export function matchesAuthor(person, authorId) {
  if (!person || !authorId) return false;

  return person.id != null && String(person.id) === String(authorId);
}
