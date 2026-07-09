const fs = require('fs');
const files = [
  'app/api/admin/subjects/[id]/route.ts',
  'app/api/admin/conversations/route.ts',
  'app/api/admin/conversations/[id]/route.ts',
  'app/api/admin/settings/route.ts'
];
const authImport = "import { verifyAdminApi } from '@/lib/auth'\n";
const authCheck = "  if (!(await verifyAdminApi())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })\n\n";

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('verifyAdminApi')) {
    content = content.replace(/import { NextResponse } from 'next\/server'\n/, "import { NextResponse } from 'next/server'\n" + authImport);
    content = content.replace(/export async function GET\([^)]*\)\s*{/g, match => match + '\n' + authCheck);
    content = content.replace(/export async function POST\([^)]*\)\s*{/g, match => match + '\n' + authCheck);
    content = content.replace(/export async function PUT\([^)]*\)\s*{/g, match => match + '\n' + authCheck);
    content = content.replace(/export async function DELETE\([^)]*\)\s*{/g, match => match + '\n' + authCheck);
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
