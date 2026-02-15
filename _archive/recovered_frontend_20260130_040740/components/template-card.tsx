
import React from 'react';
import { Template } from '@/types/template';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags.map(tag => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Industry:</strong> {template.category.industry}</p>
          <p><strong>Content Type:</strong> {template.category.contentType}</p>
          <p><strong>Platform:</strong> {template.category.platform}</p>
          <p><strong>Purpose:</strong> {template.category.purpose}</p>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 dark:text-gray-400">
        Version: {template.version}
      </CardFooter>
    </Card>
  );
}
