"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Navigation, Calendar, Clock } from "lucide-react";

interface PredictionFormProps {
  onSubmit: (data: {
    years: number;
    month: number;
    latitude: number;
    longitude: number;
  }) => void;
  isLoading: boolean;
}

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function PredictionForm({ onSubmit, isLoading }: PredictionFormProps) {
  const currentMonth = new Date().getMonth() + 1;
  const [years, setYears] = useState(5);
  const [month, setMonth] = useState(currentMonth.toString());
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(4));
        setLongitude(position.coords.longitude.toFixed(4));
        setGeoLoading(false);
      },
      (error) => {
        setGeoError("Unable to retrieve your location");
        setGeoLoading(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      setGeoError("Please enter valid coordinates");
      return;
    }

    if (lat < 14 || lat > 72 || lon < -170 || lon > -50) {
      setGeoError("Coordinates must be within North America");
      return;
    }

    onSubmit({
      years,
      month: parseInt(month),
      latitude: lat,
      longitude: lon,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Years Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            Historical Data Range
          </Label>
          <span className="text-sm font-medium text-primary">
            {years} {years === 1 ? "year" : "years"}
          </span>
        </div>
        <Slider
          value={[years]}
          onValueChange={(value) => setYears(value[0])}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          More years provides larger sample size but may include outdated patterns
        </p>
      </div>

      {/* Month Select */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-foreground">
          <Calendar className="h-4 w-4 text-primary" />
          Target Month
        </Label>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-full bg-input border-border">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Peak sighting season is May through July during breeding
        </p>
      </div>

      {/* Coordinates */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          Your Location
        </Label>

        <Button
          type="button"
          variant="outline"
          onClick={handleGetLocation}
          disabled={geoLoading}
          className="w-full border-border hover:bg-secondary"
        >
          <Navigation className="mr-2 h-4 w-4" />
          {geoLoading ? "Getting location..." : "Use My Location"}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="latitude" className="text-xs text-muted-foreground">
              Latitude
            </Label>
            <Input
              id="latitude"
              type="number"
              step="0.0001"
              placeholder="e.g. 40.7128"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="bg-input border-border"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="longitude" className="text-xs text-muted-foreground">
              Longitude
            </Label>
            <Input
              id="longitude"
              type="number"
              step="0.0001"
              placeholder="e.g. -111.8910"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="bg-input border-border"
            />
          </div>
        </div>

        {geoError && (
          <p className="text-xs text-destructive">{geoError}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !latitude || !longitude}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isLoading ? "Analyzing Sightings..." : "Find Lazuli Bunting Hotspots"}
      </Button>
    </form>
  );
}
