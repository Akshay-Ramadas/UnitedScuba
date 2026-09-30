export function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
      return res.status(400).json({ error: 'Invalid request', issues });
    }
    req.body = parsed.data;
    next();
  };
}

export function sanitizeString(value, max = 5000) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}
