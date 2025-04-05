const validate = require('../../../src/middleware/validate');

describe('Validation Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });
  
  it('should call next() if validation passes', () => {
    // Setup
    const schema = {
      validate: jest.fn().mockReturnValue({ error: null })
    };
    
    req.body = { name: 'Test' };
    
    const middleware = validate(schema);
    
    // Execute
    middleware(req, res, next);
    
    // Assert
    expect(schema.validate).toHaveBeenCalledWith(req.body);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  
  it('should return 400 if validation fails', () => {
    // Setup
    const schema = {
      validate: jest.fn().mockReturnValue({
        error: {
          details: [{ message: 'Name is required' }]
        }
      })
    };
    
    req.body = {};
    
    const middleware = validate(schema);
    
    // Execute
    middleware(req, res, next);
    
    // Assert
    expect(schema.validate).toHaveBeenCalledWith(req.body);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Name is required' });
  });
  
  it('should validate params if property is "params"', () => {
    // Setup
    const schema = {
      validate: jest.fn().mockReturnValue({ error: null })
    };
    
    req.params = { id: '123' };
    
    const middleware = validate(schema, 'params');
    
    // Execute
    middleware(req, res, next);
    
    // Assert
    expect(schema.validate).toHaveBeenCalledWith(req.params);
    expect(next).toHaveBeenCalled();
  });
  
  it('should validate query if property is "query"', () => {
    // Setup
    const schema = {
      validate: jest.fn().mockReturnValue({ error: null })
    };
    
    req.query = { page: '1' };
    
    const middleware = validate(schema, 'query');
    
    // Execute
    middleware(req, res, next);
    
    // Assert
    expect(schema.validate).toHaveBeenCalledWith(req.query);
    expect(next).toHaveBeenCalled();
  });
  
  it('should join multiple error messages', () => {
    // Setup
    const schema = {
      validate: jest.fn().mockReturnValue({
        error: {
          details: [
            { message: 'Name is required' },
            { message: 'Email is invalid' }
          ]
        }
      })
    };
    
    req.body = {};
    
    const middleware = validate(schema);
    
    // Execute
    middleware(req, res, next);
    
    // Assert
    expect(schema.validate).toHaveBeenCalledWith(req.body);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Name is required, Email is invalid' });
  });
});
