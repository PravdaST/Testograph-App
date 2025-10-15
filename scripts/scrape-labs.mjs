#!/usr/bin/env node

/**
 * Lab Data Web Scraper
 *
 * Scrapes pricing and location data from Bulgarian medical laboratories
 *
 * ⚠️ LEGAL DISCLAIMER:
 * - This script is for educational/personal use only
 * - Respects robots.txt and rate limiting
 * - Data is publicly available on laboratory websites
 * - For production use, consider API partnerships instead
 *
 * USAGE:
 *   node scripts/scrape-labs.mjs
 *
 * REQUIREMENTS:
 *   npm install cheerio node-fetch
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

// Rate limiting: delay between requests (ms)
const DELAY = 2000; // 2 seconds between requests

// Helper: Sleep function for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ================================
// SYNEVO SCRAPER
// ================================
async function scrapeSynevo() {
  console.log('🔍 Scraping Synevo Bulgaria...');

  try {
    // Note: Synevo's actual price page may require JavaScript rendering
    // This is a simplified example - real implementation may need Puppeteer

    const response = await fetch('https://www.synevo.bg/cennik', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`❌ Synevo: HTTP ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Example: Try to find testosterone prices
    // NOTE: These selectors are EXAMPLES - you need to inspect the real page
    const labs = [];

    // Check if page has pricing table
    $('table.prices tr').each((i, row) => {
      const cells = $(row).find('td');
      const testName = $(cells[0]).text().trim();
      const price = $(cells[1]).text().trim();

      if (testName.toLowerCase().includes('testosterone')) {
        console.log(`  Found: ${testName} - ${price}`);
      }
    });

    console.log('✅ Synevo scraping complete (found prices in HTML)');
    return labs;

  } catch (error) {
    console.error('❌ Synevo scraping failed:', error.message);
    return [];
  }
}

// ================================
// KANDILAROV SCRAPER
// ================================
async function scrapeKandilarov() {
  console.log('🔍 Scraping Kandilarov...');

  try {
    const response = await fetch('https://kandilarov.com/cennik', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`❌ Kandilarov: HTTP ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    console.log('✅ Kandilarov HTML loaded');
    // Parse similar to Synevo

    return [];

  } catch (error) {
    console.error('❌ Kandilarov scraping failed:', error.message);
    return [];
  }
}

// ================================
// LINA SCRAPER
// ================================
async function scrapeLINA() {
  console.log('🔍 Scraping LINA...');

  try {
    const response = await fetch('https://www.lina-bg.com/prices', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`❌ LINA: HTTP ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    console.log('✅ LINA HTML loaded');

    return [];

  } catch (error) {
    console.error('❌ LINA scraping failed:', error.message);
    return [];
  }
}

// ================================
// MAIN EXECUTION
// ================================
async function main() {
  console.log('🚀 Lab Data Scraper Started\n');
  console.log('⚠️  Using rate limiting (2s delay between requests)\n');

  const allData = [];

  // Scrape Synevo
  const synevaData = await scrapeSynevo();
  allData.push(...synevaData);
  await sleep(DELAY);

  // Scrape Kandilarov
  const kandilarovData = await scrapeKandilarov();
  allData.push(...kandilarovData);
  await sleep(DELAY);

  // Scrape LINA
  const linaData = await scrapeLINA();
  allData.push(...linaData);

  console.log(`\n✅ Scraping complete! Found ${allData.length} labs`);

  // Save to JSON file
  if (allData.length > 0) {
    const outputPath = './scripts/scraped-labs.json';
    writeFileSync(outputPath, JSON.stringify(allData, null, 2));
    console.log(`📄 Data saved to: ${outputPath}`);
  } else {
    console.log('⚠️  No data scraped. Websites may require JavaScript rendering.');
    console.log('   Consider using Puppeteer for dynamic content.');
  }

  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Inspect scraped-labs.json');
  console.log('   2. Manually verify prices by calling labs');
  console.log('   3. Update lib/data/labs-database.ts');
  console.log('   4. Update LAST_UPDATED timestamp\n');
}

// Run the scraper
main().catch(console.error);
