import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { EntityMap, JsonEntity } from './types';

const SOURCE_DATA_DIR = path.join(process.cwd(), 'data');
const RUNTIME_DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'echo-sante-data') : SOURCE_DATA_DIR;

function sourceFileFor(entity: JsonEntity) {
  return path.join(SOURCE_DATA_DIR, `${entity}.json`);
}

function runtimeFileFor(entity: JsonEntity) {
  return path.join(RUNTIME_DATA_DIR, `${entity}.json`);
}

async function ensureRuntimeFile(entity: JsonEntity) {
  const runtimeFile = runtimeFileFor(entity);
  try {
    await fs.access(runtimeFile);
    return runtimeFile;
  } catch {
    await fs.mkdir(RUNTIME_DATA_DIR, { recursive: true });
    const seed = await fs.readFile(sourceFileFor(entity), 'utf8');
    await fs.writeFile(runtimeFile, seed, 'utf8');
    return runtimeFile;
  }
}

function timestamp() {
  return new Date().toISOString();
}

function idFor(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function readCollection<K extends JsonEntity>(entity: K): Promise<EntityMap[K][]> {
  const file = process.env.VERCEL ? await ensureRuntimeFile(entity) : runtimeFileFor(entity);
  const content = await fs.readFile(file, 'utf8');
  return JSON.parse(content) as EntityMap[K][];
}

export async function writeCollection<K extends JsonEntity>(entity: K, rows: EntityMap[K][]) {
  const file = process.env.VERCEL ? await ensureRuntimeFile(entity) : runtimeFileFor(entity);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
}

export async function listRecords<K extends JsonEntity>(
  entity: K,
  predicate?: (row: EntityMap[K]) => boolean,
  sorter: (a: EntityMap[K], b: EntityMap[K]) => number = sortByOrderThenUpdated,
) {
  const rows = await readCollection(entity);
  return clone((predicate ? rows.filter(predicate) : rows).sort(sorter));
}

export async function getRecord<K extends JsonEntity>(entity: K, id: string) {
  const rows = await readCollection(entity);
  return clone(rows.find((row) => row.id === id) ?? null);
}

export async function findRecord<K extends JsonEntity>(entity: K, predicate: (row: EntityMap[K]) => boolean) {
  const rows = await readCollection(entity);
  return clone(rows.find(predicate) ?? null);
}

export async function createRecord<K extends JsonEntity>(
  entity: K,
  data: Partial<EntityMap[K]>,
  prefix: string = entity,
) {
  const rows = await readCollection(entity);
  const now = timestamp();
  const record = {
    ...data,
    id: data.id ?? idFor(prefix),
    created_at: (data as any).created_at ?? now,
    updated_at: now,
  } as EntityMap[K];
  rows.push(record);
  await writeCollection(entity, rows);
  return clone(record);
}

export async function updateRecord<K extends JsonEntity>(entity: K, id: string, data: Partial<EntityMap[K]>) {
  const rows = await readCollection(entity);
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) throw new Error(`${entity} record not found: ${id}`);
  rows[index] = { ...rows[index], ...data, id, updated_at: timestamp() };
  await writeCollection(entity, rows);
  return clone(rows[index]);
}

export async function upsertRecord<K extends JsonEntity>(
  entity: K,
  data: Partial<EntityMap[K]>,
  prefix: string = entity,
  match?: (row: EntityMap[K]) => boolean,
) {
  const rows = await readCollection(entity);
  const index = rows.findIndex((row) => (data.id ? row.id === data.id : false) || Boolean(match?.(row)));
  if (index < 0) return createRecord(entity, data, prefix);
  rows[index] = {
    ...rows[index],
    ...data,
    id: rows[index].id,
    created_at: (rows[index] as any).created_at,
    updated_at: timestamp(),
  };
  await writeCollection(entity, rows);
  return clone(rows[index]);
}

export async function deleteRecord<K extends JsonEntity>(entity: K, id: string) {
  const rows = await readCollection(entity);
  const next = rows.filter((row) => row.id !== id);
  if (next.length === rows.length) throw new Error(`${entity} record not found: ${id}`);
  await writeCollection(entity, next);
}

export function sortByOrderThenUpdated<T extends { order?: number; updated_at?: string; created_at?: string }>(a: T, b: T) {
  const orderDelta = (a.order ?? 0) - (b.order ?? 0);
  if (orderDelta !== 0) return orderDelta;
  return String(b.updated_at ?? b.created_at ?? '').localeCompare(String(a.updated_at ?? a.created_at ?? ''));
}

export function sortNewest<T extends { published_at?: string | null; created_at?: string; updated_at?: string }>(a: T, b: T) {
  return String(b.published_at ?? b.created_at ?? b.updated_at ?? '').localeCompare(
    String(a.published_at ?? a.created_at ?? a.updated_at ?? ''),
  );
}
