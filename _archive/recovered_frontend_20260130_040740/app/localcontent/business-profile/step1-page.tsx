'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BusinessProfileStep1() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    industry: '',
    websiteLink: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data (Step 1):', formData);
    // In a real application, you would navigate to the next step or save this data
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Business Profile Setup - Step 1:</CardTitle>
          <CardDescription className="text-lg font-semibold">Basic Info</CardDescription>
          <CardDescription>Let's start with some foundational details about your business.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                type="text"
                id="business-name"
                placeholder="e.g., Localize Marketing Agency"
                required
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="business-type">Business Type</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) => handleSelectChange('businessType', value)}
              >
                <SelectTrigger id="business-type">
                  <SelectValue placeholder="Select a business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local_business">Local Business</SelectItem>
                  <SelectItem value="service_provider">Service Provider</SelectItem>
                  <SelectItem value="e_commerce">E-commerce</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleSelectChange('industry', value)}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                  <SelectItem value="professional_services">Professional Services</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="website-link">Website or Social Media Link</Label>
              <Input
                type="url"
                id="website-link"
                placeholder="e.g., https://www.yourbusiness.com or https://facebook.com/yourbusiness"
                value={formData.websiteLink}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="w-full mt-6">
              Next: Business Location
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
