'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ParsedLead {
  business_name?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  city?: string
  state?: string
  website?: string
  industry?: string
  [key: string]: string | undefined
}

export default function ImportLeadsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload')
  const [parsedData, setParsedData] = useState<ParsedLead[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [importResult, setImportResult] = useState<{
    imported: number
    skipped: number
    failed: number
    errors: string[]
  } | null>(null)
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [error, setError] = useState('')

  const targetFields = [
    { key: 'business_name', label: 'Business Name', required: true },
    { key: 'contact_name', label: 'Contact Name', required: false },
    { key: 'contact_email', label: 'Email', required: false },
    { key: 'contact_phone', label: 'Phone', required: false },
    { key: 'contact_title', label: 'Title/Role', required: false },
    { key: 'website', label: 'Website', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'state', label: 'State', required: false },
    { key: 'industry', label: 'Industry', required: false },
    { key: 'google_rating', label: 'Google Rating', required: false },
    { key: 'google_reviews', label: 'Google Reviews Count', required: false },
    { key: 'notes', label: 'Notes', required: false },
  ]

  function parseCSV(text: string): ParsedLead[] {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    setAvailableColumns(headers)

    // Auto-detect column mapping
    const autoMapping: Record<string, string> = {}
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase().replace(/[_\s-]/g, '')
      
      if (lowerHeader.includes('businessname') || lowerHeader.includes('companyname') || lowerHeader === 'name' || lowerHeader === 'company') {
        autoMapping[header] = 'business_name'
      } else if (lowerHeader.includes('contactname') || lowerHeader.includes('fullname') || lowerHeader === 'contact') {
        autoMapping[header] = 'contact_name'
      } else if (lowerHeader.includes('firstname')) {
        autoMapping[header] = 'first_name'
      } else if (lowerHeader.includes('lastname')) {
        autoMapping[header] = 'last_name'
      } else if (lowerHeader.includes('email')) {
        autoMapping[header] = 'contact_email'
      } else if (lowerHeader.includes('phone') || lowerHeader.includes('tel')) {
        autoMapping[header] = 'contact_phone'
      } else if (lowerHeader.includes('title') || lowerHeader.includes('role') || lowerHeader.includes('position')) {
        autoMapping[header] = 'contact_title'
      } else if (lowerHeader.includes('website') || lowerHeader.includes('url')) {
        autoMapping[header] = 'website'
      } else if (lowerHeader === 'city') {
        autoMapping[header] = 'city'
      } else if (lowerHeader === 'state' || lowerHeader === 'region') {
        autoMapping[header] = 'state'
      } else if (lowerHeader.includes('industry') || lowerHeader.includes('category')) {
        autoMapping[header] = 'industry'
      } else if (lowerHeader.includes('rating')) {
        autoMapping[header] = 'google_rating'
      } else if (lowerHeader.includes('review')) {
        autoMapping[header] = 'google_reviews'
      }
    })
    setColumnMapping(autoMapping)

    // Parse data rows
    const data: ParsedLead[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      if (values.length === headers.length) {
        const row: ParsedLead = {}
        headers.forEach((header, index) => {
          row[header] = values[index]
        })
        data.push(row)
      }
    }

    return data
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())

    return result
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const data = parseCSV(text)
      
      if (data.length === 0) {
        setError('Could not parse CSV file. Make sure it has a header row and data.')
        return
      }

      setParsedData(data)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  function getMappedData(): ParsedLead[] {
    return parsedData.map(row => {
      const mapped: ParsedLead = {}
      
      // Apply column mapping
      Object.entries(columnMapping).forEach(([sourceCol, targetField]) => {
        if (row[sourceCol]) {
          mapped[targetField] = row[sourceCol]
        }
      })

      // Handle first_name + last_name → contact_name
      if (mapped.first_name || mapped.last_name) {
        mapped.contact_name = [mapped.first_name, mapped.last_name].filter(Boolean).join(' ')
        delete mapped.first_name
        delete mapped.last_name
      }

      return mapped
    })
  }

  async function handleImport() {
    setStep('importing')
    
    try {
      const mappedData = getMappedData()
      
      const response = await fetch('/api/outreach/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: mappedData,
          source: 'csv_import',
          skip_duplicates: skipDuplicates
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      setImportResult(result)
      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setStep('preview')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/outreach" className="text-teal-600 hover:text-teal-700 text-sm mb-2 inline-block">
          ← Back to Outreach
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Import Leads</h1>
        <p className="text-gray-600">Upload a CSV file to import leads into your CRM</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {['upload', 'preview', 'complete'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s || (step === 'importing' && s === 'preview') || 
              (['preview', 'importing', 'complete'].includes(step) && s === 'upload') ||
              (step === 'complete' && s === 'preview')
                ? 'bg-teal-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {i + 1}
            </div>
            <span className="ml-2 text-sm text-gray-600 capitalize">{s}</span>
            {i < 2 && <div className="w-12 h-0.5 bg-gray-200 mx-4" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors"
          >
            <div className="text-4xl mb-4">📄</div>
            <p className="text-lg font-medium text-gray-900 mb-2">Drop your CSV file here</p>
            <p className="text-gray-500 mb-4">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              Select File
            </button>
          </div>

          <div className="mt-8">
            <h3 className="font-medium text-gray-900 mb-3">Supported CSV formats:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Apollo.io</strong> - Export from Apollo search results</li>
              <li>• <strong>Outscraper</strong> - Google Maps scraper export</li>
              <li>• <strong>Hunter.io</strong> - Domain search export</li>
              <li>• <strong>Custom CSV</strong> - Any CSV with business/contact info</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              Required column: Business Name (or Company Name)<br />
              Recommended: Email, Phone, City, State
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Map */}
      {(step === 'preview' || step === 'importing') && (
        <div className="space-y-6">
          {/* Column Mapping */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Map Columns</h2>
            <p className="text-sm text-gray-600 mb-4">
              Match your CSV columns to our fields. We've auto-detected some mappings.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {targetFields.map(field => (
                <div key={field.key} className="flex items-center gap-3">
                  <label className="w-32 text-sm text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={Object.entries(columnMapping).find(([, v]) => v === field.key)?.[0] || ''}
                    onChange={(e) => {
                      const newMapping = { ...columnMapping }
                      // Remove old mapping for this target field
                      Object.keys(newMapping).forEach(k => {
                        if (newMapping[k] === field.key) delete newMapping[k]
                      })
                      // Add new mapping
                      if (e.target.value) {
                        newMapping[e.target.value] = field.key
                      }
                      setColumnMapping(newMapping)
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    disabled={step === 'importing'}
                  >
                    <option value="">-- Not mapped --</option>
                    {availableColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Preview ({parsedData.length} rows)</h2>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  disabled={step === 'importing'}
                  className="rounded border-gray-300"
                />
                Skip duplicate emails
              </label>
            </div>
            
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.values(columnMapping).filter(Boolean).map(field => (
                      <th key={field} className="px-4 py-2 text-left font-medium text-gray-600">
                        {targetFields.find(f => f.key === field)?.label || field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getMappedData().slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {Object.values(columnMapping).filter(Boolean).map(field => (
                        <td key={field} className="px-4 py-2 text-gray-900">
                          {String(row[field] || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 5 && (
                <p className="p-4 text-center text-gray-500 text-sm">
                  ... and {parsedData.length - 5} more rows
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setStep('upload')
                setParsedData([])
                setColumnMapping({})
              }}
              disabled={step === 'importing'}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Start Over
            </button>
            <button
              onClick={handleImport}
              disabled={step === 'importing' || !columnMapping[Object.keys(columnMapping).find(k => columnMapping[k] === 'business_name') || '']}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 'importing' ? 'Importing...' : `Import ${parsedData.length} Leads`}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 'complete' && importResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h2>
          
          <div className="flex justify-center gap-8 my-6">
            <div>
              <p className="text-3xl font-bold text-green-600">{importResult.imported}</p>
              <p className="text-sm text-gray-500">Imported</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-600">{importResult.skipped}</p>
              <p className="text-sm text-gray-500">Skipped (duplicates)</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">{importResult.failed}</p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
              <p className="font-medium text-red-700 mb-2">Errors:</p>
              <ul className="text-sm text-red-600">
                {importResult.errors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setStep('upload')
                setParsedData([])
                setColumnMapping({})
                setImportResult(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Import More
            </button>
            <Link
              href="/dashboard/outreach"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              View Leads →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
