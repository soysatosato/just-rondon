import MuseumBreadCrumbs from "@/components/museums/BreadCrumbs";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import MuseumBanksy from "@/components/museums/MuseumBanksy";
import { museumsHubBreadcrumbJsonLd } from "@/components/museums/jsonld";
import { BANKSY_ARTWORKS, VIEWABLE_ARTWORKS } from "@/lib/banksy";

const PAGE_PATH = "/museums/banksy-artworks";
const PAGE_TITLE = "ロンドンのバンクシー作品 現存マップ | 場所と現況";
const PAGE_DESCRIPTION = `ロンドンに残るバンクシー作品${BANKSY_ARTWORKS.length}点を、現存しているかどうかまで明記して地図付きで掲載。撤去済みの作品や保護板の有無もわかるので、行っても見られない場所へ足を運ばずに済みます。`;

export const metadata = buildPageMetadata({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "ロンドン バンクシー",
    "バンクシー 場所",
    "バンクシー ロンドン 地図",
    "バンクシー 現存",
    "ロンドン ストリートアート",
  ],
});

export default function BanksyLondonPage() {
  return (
    <>
      <JsonLd
        data={museumsHubBreadcrumbJsonLd({
          name: "バンクシー作品",
          path: PAGE_PATH,
        })}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${SITE_URL}${PAGE_PATH}`,
          url: `${SITE_URL}${PAGE_PATH}`,
          name: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: VIEWABLE_ARTWORKS.length,
            // 現地で見られる作品だけを並べる。失われた作品を
            // 訪問先として構造化データに出す意味は無い。
            itemListElement: VIEWABLE_ARTWORKS.map((art, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "VisualArtwork",
                name: art.engName,
                alternateName: art.name,
                creator: { "@type": "Person", name: "Banksy" },
                dateCreated: art.year,
                artform: "Street art",
                contentLocation: {
                  "@type": "Place",
                  name: art.area,
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: art.address,
                    addressLocality: "London",
                    addressCountry: "GB",
                  },
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: art.lat,
                    longitude: art.lng,
                  },
                },
              },
            })),
          },
        }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-8 md:pt-10">
        <MuseumBreadCrumbs name="美術館ナビ" link2="" name2="バンクシー作品" />
      </div>

      <MuseumBanksy />
    </>
  );
}
