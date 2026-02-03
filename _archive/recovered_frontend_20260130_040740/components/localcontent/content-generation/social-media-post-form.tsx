"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function SocialMediaPostForm() {
  const [topic, setTopic] = useState("")
  const [keywords, setKeywords] = useState("")
  const [platform, setPlatform] = useState("")
  const [objective, setObjective] = useState("")
  const [tone, setTone] = useState("")
  const [callToAction, setCallToAction] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, you'd send this data to an API
    console.log({ topic, keywords, platform, objective, tone, callToAction })
    setGeneratedContent("Generated social media post content will appear here...")
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate Social Media Post</CardTitle>
        <CardDescription>Fill in the details to generate a social media post.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="topic">Topic</Label>
            <Input id="topic" placeholder="e.g., New product launch, seasonal sale" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Textarea id="keywords" placeholder="e.g., #newproduct, #sale, #limitedtime" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="platform">Social Media Platform</Label>
            <Select onValueChange={setPlatform} value={platform}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="objective">Objective</Label>
            <Select onValueChange={setObjective} value={objective}>
              <SelectTrigger id="objective">
                <SelectValue placeholder="Select an objective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                <SelectItem value="lead_generation">Lead Generation</SelectItem>
                <SelectItem value="website_traffic">Website Traffic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="tone">Tone of Voice</Label>
            <Input id="tone" placeholder="e.g., Enthusiastic, professional, witty" value={tone} onChange={(e) => setTone(e.target.value)} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="callToAction">Call to Action</Label>
            <Textarea id="callToAction" placeholder="e.g., Shop now! Link in bio." value={callToAction} onChange={(e) => setCallToAction(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">Generate Social Media Post</Button>
        </form>

        {generatedContent && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Generated Content Preview</h3>
            <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {generatedContent}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
