export interface CursorData {
  timestamp?: Date;
  createdAt?: Date;
  _id: string;
}

export function encodeCursor(data: CursorData): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

export function decodeCursor(cursor: string): CursorData {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    throw new Error('Invalid cursor format');
  }
}

export interface PaginationResult<T> {
  items: T[];
  nextCursor?: string;
}

export function buildPaginationResponse<T extends { _id: { toString: () => string }; createdAt?: Date; timestamp?: Date }>(
  items: T[],
  limit: number,
  sortField: 'createdAt' | 'timestamp' = 'createdAt'
): PaginationResult<T> {
  const hasMore = items.length === limit;
  
  if (!hasMore || items.length === 0) {
    return { items };
  }

  const lastItem = items[items.length - 1];
  const cursorData: CursorData = {
    _id: lastItem._id.toString(),
  };

  if (sortField === 'createdAt' && lastItem.createdAt) {
    cursorData.createdAt = lastItem.createdAt;
  } else if (sortField === 'timestamp' && lastItem.timestamp) {
    cursorData.timestamp = lastItem.timestamp;
  }

  return {
    items,
    nextCursor: encodeCursor(cursorData),
  };
}
