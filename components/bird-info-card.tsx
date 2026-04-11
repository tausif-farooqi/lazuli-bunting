import { Info } from "lucide-react";
import Image from "next/image";

export function BirdInfoCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Bird Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src="/images/lazuli-bunting.jpg"
          alt="Lazuli Bunting - A songbird with bright turquoise-blue head and back, orange-rust breast"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <span className="inline-flex items-center rounded-full bg-sky-500/90 px-3 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
            Passerina amoena
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground">
          About the Lazuli Bunting
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          The Lazuli Bunting is a North American songbird known for its striking
          bright blue plumage. Males display vibrant turquoise-blue heads and
          backs with an orange-rust breast. They breed across western North
          America from southern Canada to northern Baja California, preferring
          brushy hillsides, open woodlands, and riparian areas.
        </p>

        {/* Quick Facts */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-sky-500/10 p-3">
            <p className="text-xs font-medium text-sky-600">Peak Season</p>
            <p className="text-sm font-semibold text-foreground">May - July</p>
          </div>
          <div className="rounded-lg bg-amber-500/10 p-3">
            <p className="text-xs font-medium text-amber-600">Habitat</p>
            <p className="text-sm font-semibold text-foreground">Brushy Areas</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-700">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>Best spotted during early morning hours when males are singing</span>
        </div>
      </div>
    </div>
  );
}
