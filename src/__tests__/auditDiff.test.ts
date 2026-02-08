import { computeDiff, sanitizeValue } from '../../modules/auditTrail/auditDiff';
import { AUDITABLE_ENTITIES } from '@/shared/contracts';

describe('Audit Diff', () => {
  describe('sanitizeValue', () => {
    it('should redact configured fields', () => {
      const result = sanitizeValue('secret-password', 'credentials', AUDITABLE_ENTITIES.USER);
      expect(result).toBe('[REDACTED]');
    });

    it('should not redact non-configured fields', () => {
      const result = sanitizeValue('John Doe', 'name', AUDITABLE_ENTITIES.USER);
      expect(result).toBe('John Doe');
    });

    it('should handle nested objects', () => {
      const input = {
        name: 'John',
        credentials: 'password123',
      };
      const result = sanitizeValue(input, 'user', AUDITABLE_ENTITIES.USER);
      expect(result.name).toBe('John');
      expect(result.credentials).toBe('[REDACTED]');
    });
  });

  describe('computeDiff', () => {
    it('should exclude configured fields', () => {
      const before = {
        title: 'Old Title',
        updatedAt: new Date('2024-01-01'),
      };
      const after = {
        title: 'New Title',
        updatedAt: new Date('2024-01-02'),
      };

      const diff = computeDiff(before, after, AUDITABLE_ENTITIES.BOOK);
      
      // updatedAt should be excluded from diff
      expect(diff).toHaveLength(1);
      expect(diff[0].path).toBe('/title');
      expect(diff[0].before).toBe('Old Title');
      expect(diff[0].after).toBe('New Title');
    });

    it('should detect field additions', () => {
      const before = { title: 'Book' };
      const after = { title: 'Book', authors: ['Author'] };

      const diff = computeDiff(before, after, AUDITABLE_ENTITIES.BOOK);
      
      const addOp = diff.find(op => op.path === '/authors');
      expect(addOp).toBeDefined();
      expect(addOp?.op).toBe('add');
      expect(addOp?.after).toEqual(['Author']);
    });

    it('should detect field removals', () => {
      const before = { title: 'Book', subtitle: 'Subtitle' };
      const after = { title: 'Book' };

      const diff = computeDiff(before, after, AUDITABLE_ENTITIES.BOOK);
      
      const removeOp = diff.find(op => op.path === '/subtitle');
      expect(removeOp).toBeDefined();
      expect(removeOp?.op).toBe('remove');
      expect(removeOp?.before).toBe('Subtitle');
    });

    it('should detect field replacements', () => {
      const before = { title: 'Old' };
      const after = { title: 'New' };

      const diff = computeDiff(before, after, AUDITABLE_ENTITIES.BOOK);
      
      expect(diff).toHaveLength(1);
      expect(diff[0].op).toBe('replace');
      expect(diff[0].path).toBe('/title');
      expect(diff[0].before).toBe('Old');
      expect(diff[0].after).toBe('New');
    });
  });
});
