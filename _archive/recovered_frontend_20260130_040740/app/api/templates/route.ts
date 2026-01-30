import { NextResponse } from 'next/server';
import templatesData from '@/data/templates.json';
import type { Template } from '@/types/template.d.ts';

export async function GET() {
  return NextResponse.json(templatesData as Template[]);
}
