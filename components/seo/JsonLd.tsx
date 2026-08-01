/**
 * 構造化データを <script type="application/ld+json"> として出力する。
 *
 * metadata の `other` に入れてはいけない。Next は other を
 * <meta name="..." content="..."> として描画するため、Google は一切読まない。
 * (実際に観光地ページ約145件がこの誤りで構造化データを失っていた)
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
