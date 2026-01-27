'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchTemplates, fetchTemplateById } from '../../../mock_api/supabase_templates';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

interface TemplateVariable {
  name: string;
  type: 'text' | 'textarea' | 'date' | 'boolean';
  label: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  variables: TemplateVariable[];
  templateContent: string;
}

export default function TemplatePreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTemplateId = searchParams.get('templateId');

  const [templates, setTemplates] = useState<
    Array<{ id: string; name: string; description: string }>
  >([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);
  const [loadingTemplateDetails, setLoadingTemplateDetails] = useState<boolean>(false);
  const [loadingGeneration, setLoadingGeneration] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getTemplates() {
      try {
        const fetchedTemplates = await fetchTemplates();
        setTemplates(fetchedTemplates as Array<{ id: string; name: string; description: string }>);
      } catch (err) {
        setError('Failed to fetch templates.');
        console.error(err);
      } finally {
        setLoadingTemplates(false);
      }
    }
    getTemplates();
  }, []);

  useEffect(() => {
    async function getTemplateDetails() {
      if (selectedTemplateId) {
        setLoadingTemplateDetails(true);
        setError(null);
        try {
          const template = await fetchTemplateById(selectedTemplateId);
          setSelectedTemplate(template as Template);
          // Initialize variable values
          const initialValues: Record<string, any> = {};
          (template as Template).variables.forEach((variable) => {
            if (variable.type === 'boolean') {
              initialValues[variable.name] = false;
            } else {
              initialValues[variable.name] = '';
            }
          });
          setVariableValues(initialValues);
        } catch (err) {
          setError('Failed to fetch template details.');
          console.error(err);
          setSelectedTemplate(null);
        } finally {
          setLoadingTemplateDetails(false);
        }
      } else {
        setSelectedTemplate(null);
        setVariableValues({});
        setGeneratedContent('');
      }
    }
    getTemplateDetails();
  }, [selectedTemplateId]);

  const handleTemplateSelect = (templateId: string) => {
    router.push(`/template-preview?templateId=${templateId}`);
  };

  const handleVariableChange = (name: string, value: any) => {
    setVariableValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setLoadingGeneration(true);
    setError(null);
    setGeneratedContent('');

    try {
      const response = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateContent: selectedTemplate.templateContent,
          variables: variableValues,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedContent(data.generatedContent);
    } catch (err) {
      setError('Failed to generate content.');
      console.error(err);
    } finally {
      setLoadingGeneration(false);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-6'>Template Preview</h1>

      {loadingTemplates ? (
        <p>Loading templates...</p>
      ) : error ? (
        <p className='text-red-500'>{error}</p>
      ) : (
        <div className='mb-6'>
          <Label htmlFor='template-select' className='block text-lg font-medium mb-2'>
            Select a Template:
          </Label>
          <Select value={selectedTemplateId || ''} onValueChange={handleTemplateSelect}>
            <SelectTrigger id='template-select' className='w-full md:w-1/2'>
              <SelectValue placeholder='Choose a template' />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedTemplateId && loadingTemplateDetails && <p>Loading template details...</p>}

      {selectedTemplate && (
        <div className='bg-card p-6 rounded-lg shadow-md'>
          <h2 className='text-2xl font-semibold mb-4'>{selectedTemplate.name}</h2>
          <p className='text-muted-foreground mb-6'>{selectedTemplate.description}</p>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {selectedTemplate.variables.map((variable) => (
              <div key={variable.name} className='space-y-2'>
                <Label htmlFor={variable.name}>{variable.label}</Label>
                {variable.type === 'text' && (
                  <Input
                    id={variable.name}
                    type='text'
                    value={variableValues[variable.name] || ''}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    className='w-full'
                  />
                )}
                {variable.type === 'textarea' && (
                  <Textarea
                    id={variable.name}
                    value={variableValues[variable.name] || ''}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    className='w-full'
                    rows={4}
                  />
                )}
                {variable.type === 'date' && (
                  <Input
                    id={variable.name}
                    type='date'
                    value={variableValues[variable.name] || ''}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    className='w-full'
                  />
                )}
                {variable.type === 'boolean' && (
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id={variable.name}
                      checked={variableValues[variable.name] || false}
                      onCheckedChange={(checked) => handleVariableChange(variable.name, checked)}
                    />
                  </div>
                )}
              </div>
            ))}

            <Button type='submit' className='w-full' disabled={loadingGeneration}>
              {loadingGeneration ? 'Generating...' : 'Generate Content'}
            </Button>
          </form>

          {generatedContent && (
            <div className='mt-8 p-4 bg-muted rounded-md'>
              <h3 className='text-xl font-semibold mb-2'>Generated Content:</h3>
              <p className='whitespace-pre-wrap'>{generatedContent}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}