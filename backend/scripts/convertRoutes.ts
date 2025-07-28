import * as fs from 'fs';
import * as path from 'path';

const API_ROUTES_DIR = path.join(__dirname, '../api-routes');

// Common Next.js imports to Express imports mapping
const importMappings = {
  "import { NextResponse } from 'next/server';": "import express, { Request, Response } from 'express';",
  "import { NextRequest, NextResponse } from 'next/server';": "import express, { Request, Response } from 'express';",
  "import { cookies } from 'next/headers';": "// Cookies are accessed via req.cookies in Express",
  "@/lib/": "../../lib/",
  "@/types": "../../types",
  "import.meta.env.VITE_": "process.env.",
};

// Function to convert Next.js route to Express route
function convertNextToExpress(content: string, filePath: string): string {
  let converted = content;

  // Replace imports
  Object.entries(importMappings).forEach(([from, to]) => {
    converted = converted.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
  });

  // Add Express router import if not present
  if (!converted.includes('express.Router')) {
    converted = converted.replace(
      /import express.*?from 'express';/,
      "import express, { Request, Response, Router } from 'express';\nimport { jsonResponse, errorResponse, asyncHandler } from '../../utils/routeMigrationHelper';"
    );
  }

  // Replace NextResponse.json with Express response
  converted = converted.replace(/NextResponse\.json\((.*?)\)/g, 'jsonResponse(res, $1)');
  converted = converted.replace(/NextResponse\.json\((.*?),\s*{\s*status:\s*(\d+)\s*}\)/g, 'jsonResponse(res, $1, $2)');

  // Replace new Response with Express response
  converted = converted.replace(/new Response\(JSON\.stringify\((.*?)\),\s*{\s*status:\s*(\d+).*?\}\)/gs, 'jsonResponse(res, $1, $2)');
  converted = converted.replace(/new Response\(JSON\.stringify\((.*?)\).*?\)/gs, 'jsonResponse(res, $1)');

  // Convert export functions to router methods
  converted = converted.replace(/export async function GET\(request: Request\)/g, 'router.get("/", asyncHandler(async (req: Request, res: Response)');
  converted = converted.replace(/export async function POST\(request: Request\)/g, 'router.post("/", asyncHandler(async (req: Request, res: Response)');
  converted = converted.replace(/export async function PUT\(request: Request\)/g, 'router.put("/", asyncHandler(async (req: Request, res: Response)');
  converted = converted.replace(/export async function DELETE\(request: Request\)/g, 'router.delete("/", asyncHandler(async (req: Request, res: Response)');
  
  // Replace await request.json() with req.body
  converted = converted.replace(/await request\.json\(\)/g, 'req.body');

  // Replace URL parsing
  converted = converted.replace(/const { searchParams } = new URL\(request\.url\);/g, 'const searchParams = new URLSearchParams(req.query as any);');
  converted = converted.replace(/new URL\(request\.url\)/g, 'new URL(req.url, `http://${req.headers.host}`)');

  // Replace cookies access
  converted = converted.replace(/cookies\(\)\.get\('(.*?)'\)\?\.value/g, "req.cookies?.$1");
  converted = converted.replace(/cookies\(\)\.set\('(.*?)',\s*(.*?),\s*(.*?)\)/g, "res.cookie('$1', $2, $3)");
  converted = converted.replace(/cookies\(\)\.delete\('(.*?)'\)/g, "res.clearCookie('$1')");

  // Add router creation and export
  if (!converted.includes('const router =')) {
    const routerInit = '\nconst router = express.Router();\n\n';
    converted = converted.replace(/(import.*\n)+/, '$&' + routerInit);
  }

  // Close router handlers and add export
  converted = converted.replace(/}\s*$/g, '}));\n\nexport default router;');

  return converted;
}

// Recursively find and convert all route.ts files
function processDirectory(dir: string) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file === 'route.ts') {
      console.log(`Converting: ${filePath}`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const converted = convertNextToExpress(content, filePath);
        
        // Backup original file
        fs.writeFileSync(filePath + '.backup', content);
        
        // Write converted file
        fs.writeFileSync(filePath, converted);
        
        console.log(`✓ Converted: ${filePath}`);
      } catch (error) {
        console.error(`✗ Error converting ${filePath}:`, error);
      }
    }
  });
}

// Start conversion
console.log('Starting Next.js to Express route conversion...');
processDirectory(API_ROUTES_DIR);
console.log('Conversion complete!');

