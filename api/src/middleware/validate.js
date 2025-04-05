/**
 * Validation middleware factory
 * Creates middleware functions that validate request data against a schema
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    
    if (!error) {
      next();
    } else {
      const { details } = error;
      const message = details.map(i => i.message).join(', ');
      
      res.status(400).json({ message });
    }
  };
};

module.exports = validate;
