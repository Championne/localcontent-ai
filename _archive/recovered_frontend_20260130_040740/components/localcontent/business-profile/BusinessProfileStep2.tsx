"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

interface BusinessProfileStep2Props {
  onNext: () => void;
  onBack: () => void;
}

export function BusinessProfileStep2({ onNext, onBack }: BusinessProfileStep2Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">About Your Business</h2>
      <p className="text-muted-foreground">
        Tell us a bit about your business to help us tailor communications.
      </p>

      <form className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business Name</Label>
          <Input id="businessName" placeholder="e.g., LocalContent.ai" />
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select>
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select an industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="food_beverage">Food & Beverage</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="businessDescription">Business Description</Label>
          <Textarea
            id="businessDescription"
            placeholder="Describe your business in a few sentences."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Textarea
            id="targetAudience"
            placeholder="Who are you trying to reach with your content?"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Social Media Links (Optional)</Label>
          <Input id="instagram" placeholder="Instagram URL" />
          <Input id="facebook" placeholder="Facebook URL" />
          <Input id="linkedin" placeholder="LinkedIn URL" />
          <Input id="twitter" placeholder="Twitter (X) URL" />
          <Input id="otherSocial" placeholder="Other Social Media URL" />
        </div>
        
        <div>
          <Label htmlFor="website">Website (Optional)</Label>
          <Input id="website" type="url" placeholder="https://www.yourbusiness.com" />
        </div>

        <div>
          <Label htmlFor="logoUpload">Logo Upload</Label>
          <Input id="logoUpload" type="file" accept="image/*" />
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={onNext}>
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}
