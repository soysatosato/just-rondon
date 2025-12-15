import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createArtist } from "@/utils/actions/lyrics";

export default function CreateArtistPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Artist 新規登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createArtist} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engName">English Name</Label>
              <Input id="engName" name="engName" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" name="imageUrl" placeholder="https://..." />
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-4">
              <Checkbox id="isHot" name="isHot" />
              <Label htmlFor="isHot">Hot Artist として登録</Label>
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
