import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

// In-memory cache shared within the process execution
// key -> { value, expiresAt, staleValue }
const memoryCache = new Map();
const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds TTL

// Files mapping in data/ directory for resilient offline / quota-proof fallbacks
const FILE_MIRRORS = {
  home_content: 'home.json',
  builder_pages: 'builder_pages.json',
  builder_saved_blocks: 'builder_saved_blocks.json',
  global_content: 'global_content.json',
  essentiel_content: 'essentiel.json',
  professionnel_content: 'professionnel.json',
  usages_content: 'usages.json',
  transparence_content: 'transparence.json',
  recrutement_content: 'recrutement.json',
  livraison_content: 'livraison.json',
  privacy_content: 'privacy.json',
  cgv_content: 'cgv.json',
  vitrine_config: 'vitrine_config.json',
  category_overrides: 'category_overrides.json',
  product_overrides: 'product_overrides.json',
  product_categories: 'product_categories.json',
  products_page_config: 'products_page_config.json',
  loyalty_settings_v1: 'loyalty_settings.json',
  partners_locations: 'partners.json',
  hidden_products: 'hidden_products.json',
  product_order: 'product_order.json',
  admin_auth_logs: 'auth_logs.json',
  admin_active_sessions: 'active_sessions.json',
  admin_audit_trail: 'audit_trail.json',
};

function getMirrorPath(key) {
  let filename = FILE_MIRRORS[key];
  if (!filename && key.startsWith('builder_history:')) {
    const slug = key.replace('builder_history:', '').replace(/[^a-z0-9_-]/g, '_');
    filename = path.join('history', `${slug}.json`);
  }
  if (!filename) return null;
  return path.join(process.cwd(), 'data', filename);
}

function readMirror(key) {
  try {
    const fullPath = getMirrorPath(key);
    if (fullPath && fs.existsSync(fullPath)) {
      const raw = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    // Non-blocking read fallback
  }
  return null;
}

function writeMirror(key, data) {
  if (!data) return;
  try {
    const fullPath = getMirrorPath(key);
    if (!fullPath) return;
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    // Non-blocking write fallback (e.g. read-only serverless environment)
  }
}

/**
 * Cached & Resilient KV Get
 * 1. Checks memory cache first (0 network calls when fresh)
 * 2. If expired/missing, queries Vercel KV
 * 3. On KV success, updates memory cache + local mirror file
 * 4. On KV error (quota limit, network timeout), returns stale cached value,
 *    or local mirror file, or fallback.
 */
export async function safeKvGet(key, fallback = null, ttlMs = DEFAULT_TTL_MS) {
  const now = Date.now();
  const cached = memoryCache.get(key);

  // Return fresh in-memory cache if within TTL
  if (cached && now < cached.expiresAt && cached.value !== null && cached.value !== undefined) {
    return cached.value;
  }

  // If no credentials configured, read mirror file or fallback
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    const mirror = readMirror(key);
    return mirror !== null ? mirror : fallback;
  }

  try {
    const res = await kv.get(key);
    const finalValue = res !== null && res !== undefined ? res : fallback;

    // Cache the fresh result
    memoryCache.set(key, {
      value: finalValue,
      expiresAt: now + ttlMs,
      staleValue: finalValue,
    });

    // Write mirror backup if valid object
    if (res && typeof res === 'object') {
      writeMirror(key, res);
    }

    return finalValue;
  } catch (error) {
    console.error(`[Vercel KV] Error reading key "${key}":`, error.message);

    // Stale-While-Error: If we have an existing cached value, use it!
    if (cached && cached.staleValue !== undefined && cached.staleValue !== null) {
      return cached.staleValue;
    }

    // Try reading local mirror file
    const mirror = readMirror(key);
    if (mirror !== null) {
      return mirror;
    }

    return fallback;
  }
}

/**
 * Cached & Safe KV Set
 * 1. Immediately updates in-memory cache
 * 2. Immediately updates mirror file on disk
 * 3. Attempts to write to Vercel KV without throwing fatal errors if quota is exceeded
 */
export async function safeKvSet(key, value, ttlMs = DEFAULT_TTL_MS) {
  // Update memory cache
  setKvCache(key, value, ttlMs);

  // Write to KV if credentials exist
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await kv.set(key, value);
    } catch (error) {
      console.warn(`[Vercel KV] Warning writing key "${key}" to KV:`, error.message);
      // Non-blocking so the app continues functioning via local cache
    }
  }
}

/**
 * Manually update in-memory cache and mirror file
 */
export function setKvCache(key, value, ttlMs = DEFAULT_TTL_MS) {
  const now = Date.now();
  memoryCache.set(key, {
    value,
    expiresAt: now + ttlMs,
    staleValue: value,
  });

  if (value && typeof value === 'object') {
    writeMirror(key, value);
  }
}

/**
 * Invalidate cache
 */
export function invalidateKvCache(key = null) {
  if (key) {
    memoryCache.delete(key);
  } else {
    memoryCache.clear();
  }
}
