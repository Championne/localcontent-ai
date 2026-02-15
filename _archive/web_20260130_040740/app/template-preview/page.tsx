'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Preserving mock API imports for template fetching, as the task focuses on LLM integration for *generation*,
// not on replacing the template fetching mechanism itself.
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

// Spinner component (simple text-based for now)
const Spinner = ({ message = 'Loading...' }) => (
  <div className='flex items-center space-x-2 text-muted-foreground'>
    <svg className='animate-spin h-5 w-5 text-current' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
    </svg>
    <span>{message}</span>
  </div>
);

// Skeleton for Select component
const SelectSkeleton = () => (
  <div className="mb-6 space-y-2">
    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
  </div>
);

// Skeleton for Template Details
const TemplateDetailsSkeleton = () => (
  <div className="bg-card p-6 rounded-lg shadow-md animate-pulse">
    <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
    <div className="h-4 w-5/6 bg-gray-200 rounded mb-6"></div>
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => ( // Simulate 3 variable inputs
        <div key={i} className="space-y-2">
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
          <div className="h-10 w-full bg-gray-200 rounded"></div>
        </div>
      ))}
      <div className="h-12 w-full bg-gray-200 rounded"></div>
    </div>
  </div>
);

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

  const handleSubmit = async (e?: FormEvent) => { // Make event optional for regenerate button
    e?.preventDefault(); // Only prevent default if event is present
    if (!selectedTemplate) return;

    setLoadingGeneration(true);
    setError(null);
    setGeneratedContent('');

    try {
      // NOTE: The backend API route /api/generate-preview requires
      // OPENAI_API_KEY (or ANTHROPIC_API_KEY for Anthropic models)
      // and LLM_PROVIDER environment variables to be set.
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
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedContent(data.generatedContent);
    } catch (err: any) {
      setError(`Failed to generate content: ${err.message || err.toString()}`);
      console.error(err);
    } finally {
      setLoadingGeneration(false);
    }
  };

  return (
    <div className='container mx-auto p-4 md:p-8 lg:p-12 max-w-screen-xl'>
      <h1 className='text-3xl font-bold mb-6 text-center md:text-left'>Template Preview</h1>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6' role='alert'>
          <strong className='font-bold'>Error:</strong>
          <span className='block sm:inline'> {error}</span>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Template Selection / Input Area */}
        <div className='md:col-span-1'>
          {loadingTemplates ? (
            <SelectSkeleton />
          ) : (
            <div className='mb-6'>
              <Label htmlFor='template-select' className='block text-lg font-medium mb-2'>
                Select a Template:
              </Label>
              <Select value={selectedTemplateId || ''} onValueChange={handleTemplateSelect}>
                <SelectTrigger id='template-select' className='w-full'>
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

          {selectedTemplateId && loadingTemplateDetails ? (
            <TemplateDetailsSkeleton />
          ) : (
            selectedTemplate && (
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

                  <div className='flex space-x-4'> {/* Added a div for button spacing */}
                    <Button type='submit' className='flex-1' disabled={loadingGeneration}>
                      {loadingGeneration && !generatedContent ? <Spinner message='Generating...' /> : 'Generate Content'}
                    </Button>
                    {/* Regenerate Button */}
                    {generatedContent && ( // Show regenerate only if content has been generated
                      <Button
                        type='button' // Important: type="button" to prevent it from submitting the form
                        onClick={handleSubmit}
                        className='flex-1'
                        variant='outline'
                        disabled={loadingGeneration}
                      >
                        {loadingGeneration ? <Spinner message='Regenerating...' /> : 'Regenerate'}
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            )
          )}
        </div>

        {/* Generated Content Preview Area */}
        <div className='md:col-span-1'>
          <h3 className='text-2xl font-semibold mb-4'>Preview</h3>
          <div className='bg-muted p-6 rounded-lg shadow-inner min-h-[200px] flex items-center justify-center'>
            {loadingGeneration ? (
              <Spinner message='Generating content, please wait...' />
            ) : generatedContent ? (
              <p className='whitespace-pre-wrap text-left w-full'>{generatedContent}</p> {/* Added text-left and w-full for better markdown rendering */}
            ) : selectedTemplate ? (
              <p className='text-muted-foreground text-center'>Fill in the variables and click "Generate Content" to see the preview.</p>
            ) : (
              <p className='text-muted-foreground text-center'>Select a template to begin.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
