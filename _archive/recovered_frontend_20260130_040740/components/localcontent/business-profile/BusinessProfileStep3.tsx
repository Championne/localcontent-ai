"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState } from "react";

interface BusinessProfileStep3Props {
  onNext: () => void;
  onBack: () => void;
}

export function BusinessProfileStep3({ onNext, onBack }: BusinessProfileStep3Props) {
  const [brandVoice, setBrandVoice] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Brand Voice & Goals</h2>
      <p className="text-muted-foreground">
        Define your brand's personality and what you aim to achieve with your
        content.
      </p>

      <form className="space-y-4">
        <div>
          <Label htmlFor="brandVoice">Brand Voice</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              type="button"
              variant={brandVoice === "professional" ? "default" : "outline"}
              onClick={() => setBrandVoice("professional")}
            >
              Professional
            </Button>
            <Button
              type="button"
              variant={brandVoice === "friendly" ? "default" : "outline"}
              onClick={() => setBrandVoice("friendly")}
            >
              Friendly
            </Button>
            <Button
              type="button"
              variant={brandVoice === "authoritative" ? "default" : "outline"}
              onClick={() => setBrandVoice("authoritative")}
            >
              Authoritative
            </Button>
            <Button
              type="button"
              variant={brandVoice === "creative" ? "default" : "outline"}
              onClick={() => setBrandVoice("creative")}
            >
              Creative
            </Button>
            <Button
              type="button"
              variant={brandVoice === "playful" ? "default" : "outline"}
              onClick={() => setBrandVoice("playful")}
            >
              Playful
            </Button>
            <Button
              type="button"
              variant={brandVoice === "informative" ? "default" : "outline"}
              onClick={() => setBrandVoice("informative")}
            >
              Informative
            </Button>
            <Button
              type="button"
              variant={brandVoice === "other" ? "default" : "outline"}
              onClick={() => setBrandVoice("other")}
            >
              Other
            </Button>
          </div>
          {brandVoice === "other" && (
            <Textarea
              id="otherBrandVoice"
              placeholder="Please describe your brand voice."
              rows={2}
              className="mt-2"
            />
          )}
        </div>

        <div>
          <Label htmlFor="keyMessaging">Key Messaging (Optional)</Label>
          <Textarea
            id="keyMessaging"
            placeholder="Provide examples of key messages or taglines."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="primaryGoal">Primary Goal</Label>
          <Select>
            <SelectTrigger id="primaryGoal">
              <SelectValue placeholder="Select a primary goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brand_awareness">Increase Brand Awareness</SelectItem>
              <SelectItem value="sales_leads">Drive Sales/Leads</SelectItem>
              <SelectItem value="educate_audience">Educate Audience</SelectItem>
              <SelectItem value="customer_engagement">Improve Customer Engagement</SelectItem>
              <SelectItem value="seo_traffic">SEO & Organic Traffic</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Secondary Goals (Optional) - Placeholder for now, would typically use CheckboxGroup */}
        <div className="space-y-2">
          <Label>Secondary Goals (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            (Would implement with CheckboxGroup, selecting multiple options)
          </p>
          {/* Example checkboxes - replace with actual shadcn/ui Checkbox component if available and appropriate */}
          <div>
            <input type="checkbox" id="secondaryGoal1" className="mr-2" />
            <label htmlFor="secondaryGoal1">Increase Social Media Following</label>
          </div>
          <div>
            <input type="checkbox" id="secondaryGoal2" className="mr-2" />
            <label htmlFor="secondaryGoal2">Content Syndication</label>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={onNext}>
            Finish
          </Button>
        </div>
      </form>
    </div>
  );
}
