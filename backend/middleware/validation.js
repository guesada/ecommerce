const Joi = require('joi');

// Validation schemas
const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).default(0),
  category: Joi.string().max(50).optional(),
  image_url: Joi.string().uri().optional()
});

const cartItemSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).default(1)
});

const orderSchema = Joi.object({
  shipping_address: Joi.string().min(10).max(200).required(),
  items: Joi.array().items(cartItemSchema).min(1).required()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({ 
        error: 'Validation error', 
        details: errorMessage 
      });
    }
    
    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

// Specific validation middlewares
const validateUser = validate(userSchema);
const validateLogin = validate(loginSchema);
const validateProduct = validate(productSchema);
const validateCartItem = validate(cartItemSchema);
const validateOrder = validate(orderSchema);

module.exports = {
  validate,
  validateUser,
  validateLogin,
  validateProduct,
  validateCartItem,
  validateOrder
}; 