"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function BlogPostForm() {
  const [topic, setTopic] = useState("")
  const [keywords, setKeywords] = useState("")
  const [audience, setAudience] = useState("")
  const [tone, setTone] = useState("")
  const [callToAction, setCallToAction] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, you'd send this data to an API
    console.log({ topic, keywords, audience, tone, callToAction })
    setGeneratedContent("Generated blog post content will appear here...")
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate Blog Post</CardTitle>
        <CardDescription>Fill in the details to generate a blog post.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="topic">Topic</Label>
            <Input id="topic" placeholder="e.g., Benefits of AI in content creation" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Textarea id="keywords" placeholder="e.g., AI, content marketing, automation" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="audience">Target Audience</Label>
            <Input id="audience" placeholder="e.g., Small business owners, digital marketers" value={audience} onChange={(e) => setAudience(e.target.value)} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="tone">Tone of Voice</Label>
            <Input id="tone" placeholder="e.g., Informative, casual, professional" value={tone} onChange={(e) => setTone(e.target.value)} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="callToAction">Call to Action</Label>
            <Textarea id="callToAction" placeholder="e.g., Visit our website for more AI tools!" value={callToAction} onChange={(e) => setCallToAction(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">Generate Blog Post</Button>
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
