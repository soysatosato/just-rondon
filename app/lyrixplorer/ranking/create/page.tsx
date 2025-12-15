import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createRanking,
  fetchArtists,
  fetchLyrics,
} from "@/utils/actions/lyrics";

export default async function CreateRankingPage() {
  const artists = await fetchArtists();
  const lyrics = await fetchLyrics();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Ranking 新規登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createRanking} className="space-y-6">
            <div className="space-y-2">
              <Label>Ranking Type</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOT_SONGS">HOT SONGS</SelectItem>
                  <SelectItem value="HOT_ALBUM">HOT ALBUM</SelectItem>
                  <SelectItem value="HOT_ARTISTS">HOT ARTISTS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rank">Rank</Label>
              <Input id="rank" name="rank" type="number" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album">Album（任意）</Label>
              <Input id="album" name="album" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="periodStart">Period Start</Label>
                <Input
                  id="periodStart"
                  name="periodStart"
                  type="date"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodEnd">Period End</Label>
                <Input id="periodEnd" name="periodEnd" type="date" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lyrics（曲ランキング用）</Label>
              <Select name="lyricsId">
                <SelectTrigger>
                  <SelectValue placeholder="曲を選択" />
                </SelectTrigger>
                <SelectContent>
                  {lyrics.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Artist（アーティストランキング用）</Label>
              <Select name="artistId">
                <SelectTrigger>
                  <SelectValue placeholder="アーティストを選択" />
                </SelectTrigger>
                <SelectContent>
                  {artists.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              登録
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
