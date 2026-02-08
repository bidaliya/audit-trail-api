import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  res.status(statusCode).json(data);
}

export function sendCreated<T>(res: Response, data: T): void {
  res.status(201).json(data);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}
