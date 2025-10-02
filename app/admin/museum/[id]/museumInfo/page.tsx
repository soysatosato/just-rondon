import {
  fetchMuseumInfo,
  handleMuseumInfoAction,
} from "@/utils/actions/museums";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import { SubmitButton } from "@/components/form/Buttons";
import CheckboxInput from "@/components/form/CheckboxInput";
import PriceInput from "@/components/form/PriceInput";

export default async function EditMuseumInfoPage({
  params,
}: {
  params: { id: string };
}) {
  const museumInfo = await fetchMuseumInfo(params.id);
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8">Edit Museum Info</h1>
      <div className="border p-8 rounded-md">
        <FormContainer action={handleMuseumInfoAction}>
          <input type="hidden" name="id" value={museumInfo?.id} />
          <input type="hidden" name="museumId" value={params.id} />

          <div className="grid gap-4">
            <PriceInput
              name="admissionFeeAdult"
              label="入場料（大人）"
              defaultValue={museumInfo?.admissionFeeAdult ?? 0}
            />
            <PriceInput
              name="admissionFeeStudent"
              label="入場料（学生）"
              defaultValue={museumInfo?.admissionFeeStudent ?? 0}
            />
            <PriceInput
              name="admissionFeeChild"
              label="入場料（子ども）"
              defaultValue={museumInfo?.admissionFeeChild ?? 0}
            />
            <FormInput
              name="photographyAllowed"
              label="写真撮影の条件"
              defaultValue={museumInfo?.photographyAllowed ?? "撮影自由"}
            />
            <PriceInput
              name="recommendedDuration"
              label="所要時間の目安"
              defaultValue={museumInfo?.recommendedDuration ?? 2}
            />
            <CheckboxInput
              name="reservationRequired"
              label="予約必須"
              defaultChecked={museumInfo?.reservationRequired ?? false}
            />
            <FormInput
              name="cloakroomInfo"
              label="クローク情報"
              defaultValue={museumInfo?.cloakroomInfo ?? ""}
            />
            <FormInput
              name="nearestStation"
              label="最寄駅"
              defaultValue={museumInfo?.nearestStation ?? ""}
            />
            <PriceInput
              name="stationWalkingMinutes"
              label="駅から徒歩（分）"
              defaultValue={museumInfo?.stationWalkingMinutes ?? 0}
            />
            <FormInput
              name="nearestBusStop"
              label="最寄バス停"
              defaultValue={museumInfo?.nearestBusStop ?? ""}
            />
            <PriceInput
              name="busStopWalkingMinutes"
              label="バス停から徒歩（分）"
              defaultValue={museumInfo?.busStopWalkingMinutes ?? 0}
            />
            <CheckboxInput
              name="guidedTourAvailable"
              label="ガイドツアーあり"
              defaultChecked={museumInfo?.guidedTourAvailable ?? false}
            />
            <PriceInput
              name="guidedTourFee"
              label="ガイドツアー料金"
              defaultValue={museumInfo?.guidedTourFee ?? 0}
            />
            <FormInput
              name="guidedTourLanguages"
              label="対応言語"
              defaultValue={museumInfo?.guidedTourLanguages ?? ""}
            />
            <CheckboxInput
              name="cafeteriaAvailable"
              label="カフェあり"
              defaultChecked={museumInfo?.cafeteriaAvailable ?? false}
            />
            <CheckboxInput
              name="shopAvailable"
              label="ショップあり"
              defaultChecked={museumInfo?.shopAvailable ?? false}
            />
            <CheckboxInput
              name="wifiAvailable"
              label="Wi-Fiあり"
              defaultChecked={museumInfo?.wifiAvailable ?? false}
            />
            <FormInput
              name="website"
              label="公式サイトURL"
              type="url"
              defaultValue={museumInfo?.website ?? ""}
            />
          </div>

          <SubmitButton text="保存" className="mt-8" />
        </FormContainer>
      </div>
    </section>
  );
}
