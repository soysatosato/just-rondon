import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLyrics, fetchArtists } from "@/utils/actions/lyrics";

export default async function CreateLyricsPage() {
  const artists = await fetchArtists();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Lyrics 新規登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createLyrics} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">曲名</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label>Artist</Label>
              <Select name="artistId" required>
                <SelectTrigger>
                  <SelectValue placeholder="アーティストを選択" />
                </SelectTrigger>
                <SelectContent>
                  {artists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lyrics">歌詞</Label>
              <Textarea id="lyrics" name="lyrics" rows={8} required />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scene">Scene</Label>
                <Input id="scene" name="scene" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="album">Album</Label>
                <Input id="album" name="album" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input id="month" name="month" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="albumOrder">Album Order</Label>
                <Input id="albumOrder" name="albumOrder" type="number" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input id="genre" name="genre" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeId">YouTube ID</Label>
              <Input id="youtubeId" name="youtubeId" />
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
