-- CreateEnum
CREATE TYPE "RankingType" AS ENUM ('HOT_SONGS', 'HOT_ARTISTS', 'HOT_ALBUM');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profileImage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Museum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "category" TEXT DEFAULT 'museum',
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tourPrice" DOUBLE PRECISION NOT NULL,
    "highlights" TEXT[],
    "recommendLevel" INTEGER DEFAULT 0,
    "engName" TEXT,
    "isForChildren" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "blurb" TEXT,

    CONSTRAINT "Museum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artwork" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "year" TEXT,
    "location" TEXT,
    "description" TEXT,
    "isOnDisplay" BOOLEAN NOT NULL DEFAULT true,
    "museumId" TEXT NOT NULL DEFAULT '6cc90107-59e4-45a8-b901-abb9748ebeea',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "image" TEXT,
    "room" TEXT,
    "mustSee" BOOLEAN NOT NULL,
    "recommendLevel" INTEGER NOT NULL DEFAULT 0,
    "highlights" TEXT[],
    "engTitle" TEXT,

    CONSTRAINT "Artwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hasVisited" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileId" TEXT NOT NULL,
    "museumId" TEXT NOT NULL,

    CONSTRAINT "hasVisited_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "tourDate" TIMESTAMP(3) NOT NULL,
    "numGuests" INTEGER NOT NULL,
    "paymentStatus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileId" TEXT NOT NULL,
    "museumId" TEXT NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningHours" (
    "id" TEXT NOT NULL,
    "museumId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,

    CONSTRAINT "OpeningHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exhibition" (
    "id" TEXT NOT NULL,
    "museumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "admission" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Exhibition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trivia" (
    "id" TEXT NOT NULL,
    "museumId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Trivia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuseumInfo" (
    "id" TEXT NOT NULL,
    "museumId" TEXT NOT NULL,
    "photographyAllowed" TEXT,
    "reservationRequired" BOOLEAN,
    "cloakroomInfo" TEXT,
    "nearestStation" TEXT,
    "stationWalkingMinutes" INTEGER,
    "nearestBusStop" TEXT,
    "busStopWalkingMinutes" INTEGER,
    "guidedTourAvailable" BOOLEAN,
    "guidedTourLanguages" TEXT,
    "cafeteriaAvailable" BOOLEAN,
    "shopAvailable" BOOLEAN,
    "wifiAvailable" BOOLEAN,
    "website" TEXT,
    "admissionFeeAdult" DOUBLE PRECISION,
    "admissionFeeStudent" DOUBLE PRECISION,
    "admissionFeeChild" DOUBLE PRECISION,
    "recommendedDuration" INTEGER,
    "guidedTourFee" DOUBLE PRECISION,

    CONSTRAINT "MuseumInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL DEFAULT '/news-bg.JPG',
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Musical" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "engName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "blurb" TEXT,
    "highlights" TEXT[],
    "theatreName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "isOnShow" BOOLEAN NOT NULL,
    "recommendLevel" INTEGER NOT NULL DEFAULT 0,
    "mustSee" BOOLEAN NOT NULL,
    "original" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Musical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "lyrics" TEXT NOT NULL,
    "scene" TEXT NOT NULL,
    "musicalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "index" INTEGER NOT NULL,
    "youtubeId" TEXT,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'none',
    "author" TEXT NOT NULL,
    "deletePsswrd" TEXT NOT NULL DEFAULT '0000',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ip" TEXT,
    "sessionId" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ip" TEXT,
    "sessionId" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attraction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "engName" TEXT,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "summary" TEXT,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "website" TEXT,
    "recommendLevel" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "mustSee" BOOLEAN NOT NULL DEFAULT false,
    "isForKids" BOOLEAN NOT NULL DEFAULT false,
    "isFree" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Attraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttractionSection" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "attractionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttractionSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "mainText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL DEFAULT '',
    "image" TEXT,
    "website" TEXT,
    "engTitle" TEXT,
    "route" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSection" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "contentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image" TEXT,

    CONSTRAINT "ContentSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lyrics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "lyrics" TEXT NOT NULL,
    "album" TEXT,
    "youtubeId" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "genre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scene" TEXT,
    "year" INTEGER NOT NULL DEFAULT 0,
    "month" INTEGER NOT NULL DEFAULT 0,
    "albumOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Lyrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "engName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isHot" BOOLEAN,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ranking" (
    "id" TEXT NOT NULL,
    "type" "RankingType" NOT NULL,
    "rank" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "lyricsId" TEXT,
    "artistId" TEXT,
    "album" TEXT,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LyricsRequest" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LyricsRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCharge" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeAddress" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "borough" TEXT,
    "postcode" TEXT,
    "serviceChargeCollected" BOOLEAN NOT NULL,
    "distributionType" TEXT,
    "amountPeriod" TEXT,
    "amountValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ethnicityRatio" TEXT,
    "generalComment" TEXT,
    "managementPresence" TEXT,
    "mealCountPerDay" TEXT,
    "mealDrink" TEXT,
    "mealRestrictions" TEXT[],
    "serviceChargeComment" TEXT,
    "shiftSchedule" TEXT,
    "visaSupport" TEXT,
    "workAtmosphere" TEXT,
    "mealComment" TEXT,

    CONSTRAINT "ServiceCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedditPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleJa" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redditId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "RedditPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reddit" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT,
    "title" TEXT NOT NULL,
    "titleJa" TEXT NOT NULL,
    "authorId" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "bodyJa" TEXT NOT NULL,

    CONSTRAINT "Reddit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_clerkId_key" ON "Profile"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Museum_name_key" ON "Museum"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Museum_slug_key" ON "Museum"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningHours_museumId_dayOfWeek_key" ON "OpeningHours"("museumId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "MuseumInfo_museumId_key" ON "MuseumInfo"("museumId");

-- CreateIndex
CREATE UNIQUE INDEX "Musical_slug_key" ON "Musical"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_token_key" ON "Contact"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Attraction_name_key" ON "Attraction"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Attraction_slug_key" ON "Attraction"("slug");

-- CreateIndex
CREATE INDEX "Ranking_type_periodEnd_idx" ON "Ranking"("type", "periodEnd");

-- CreateIndex
CREATE INDEX "ServiceCharge_placeId_idx" ON "ServiceCharge"("placeId");

-- CreateIndex
CREATE INDEX "ServiceCharge_serviceChargeCollected_idx" ON "ServiceCharge"("serviceChargeCollected");

-- CreateIndex
CREATE INDEX "RedditPost_redditId_idx" ON "RedditPost"("redditId");

-- CreateIndex
CREATE UNIQUE INDEX "Reddit_title_key" ON "Reddit"("title");

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_museumId_fkey" FOREIGN KEY ("museumId") REFERENCES "Museum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasVisited" ADD CONSTRAINT "hasVisited_museumId_fkey" FOREIGN KEY ("museumId") REFERENCES "Museum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasVisited" ADD CONSTRAINT "hasVisited_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_museumId_fkey" FOREIGN KEY ("museumId") REFERENCES "Museum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningHours" ADD CONSTRAINT "OpeningHours_museumId_fkey" FOREIGN KEY ("museumId") REFERENCES "Museum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exhibition" ADD CONSTRAINT "Exhibition_museumId_fkey" FOREIGN KEY ("museumId") REFERENCES "Museum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trivia" ADD CONSTRAINT "Trivia_museumId_fkey" FOREIGN KEY ("museumId") REFERENCES "Museum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuseumInfo" ADD CONSTRAINT "MuseumInfo_museumId_fkey" FOREIGN KEY ("museumId") REFERENCES "Museum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_musicalId_fkey" FOREIGN KEY ("musicalId") REFERENCES "Musical"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttractionSection" ADD CONSTRAINT "AttractionSection_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentSection" ADD CONSTRAINT "ContentSection_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lyrics" ADD CONSTRAINT "Lyrics_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_lyricsId_fkey" FOREIGN KEY ("lyricsId") REFERENCES "Lyrics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedditPost" ADD CONSTRAINT "RedditPost_redditId_fkey" FOREIGN KEY ("redditId") REFERENCES "Reddit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

