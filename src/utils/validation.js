import Joi from "joi";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const schemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(passwordPattern).required().messages({
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase, one lowercase, and one number",
    }),
    roles: Joi.array()
      .items(Joi.string().valid("Buyer", "Seller", "Driver"))
      .min(1)
      .required(),
  }),

  login: Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string().required(),
  }),

  activeRole: Joi.object({
    activeRole: Joi.string()
      .valid("Buyer", "Seller", "Driver", "Admin")
      .required(),
  }),

  review: Joi.object({
    reviewerName: Joi.string().min(1).max(100).required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(1).max(1000).required(),
  }),

  store: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).allow("", null),
    phone: Joi.string().max(20).allow("", null),
    email: Joi.string().email().max(100).allow("", null),
    city: Joi.string().max(100).allow("", null),
    addressLine: Joi.string().max(500).allow("", null),
    logoUrl: Joi.string().uri().allow("", null),
  }),

  product: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(5000).allow("", null),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required(),
    imageUrl: Joi.string().uri().allow("", null),
    images: Joi.alternatives().try(
      Joi.array().items(Joi.string().uri()),
      Joi.string()
    ).allow("", null),
  }),

  productUpdate: Joi.object({
    name: Joi.string().min(1).max(200),
    description: Joi.string().max(5000).allow("", null),
    price: Joi.number().positive(),
    stock: Joi.number().integer().min(0),
    imageUrl: Joi.string().uri().allow("", null),
    images: Joi.alternatives().try(
      Joi.array().items(Joi.string().uri()),
      Joi.string()
    ).allow("", null),
  }).min(1),

  topUp: Joi.object({
    amount: Joi.number().positive().required(),
  }),

  address: Joi.object({
    label: Joi.string().min(1).max(50).required(),
    recipient: Joi.string().min(1).max(100).required(),
    phone: Joi.string().min(6).max(20).required(),
    addressLine: Joi.string().min(1).max(500).required(),
    city: Joi.string().min(1).max(100).required(),
    postalCode: Joi.string().min(1).max(20).required(),
    isPrimary: Joi.boolean(),
  }),

  addressUpdate: Joi.object({
    label: Joi.string().min(1).max(50),
    recipient: Joi.string().min(1).max(100),
    phone: Joi.string().min(6).max(20),
    addressLine: Joi.string().min(1).max(500),
    city: Joi.string().min(1).max(100),
    postalCode: Joi.string().min(1).max(20),
    isPrimary: Joi.boolean(),
  }).min(1),

  cartItem: Joi.object({
    productId: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).required(),
  }),

  cartItemUpdate: Joi.object({
    quantity: Joi.number().integer().min(1).required(),
  }),

  checkout: Joi.object({
    addressId: Joi.number().integer().positive().required(),
    deliveryMethod: Joi.string()
      .valid("Instant", "NextDay", "Regular")
      .required(),
    discountCode: Joi.string().max(50).allow("", null),
  }),

  discount: Joi.object({
    code: Joi.string().min(1).max(50).required(),
    discountType: Joi.string().valid("Percentage", "Fixed", "percentage", "fixed").required(),
    discountValue: Joi.number().positive().required(),
    minOrder: Joi.number().min(0).allow(null),
    expiryDate: Joi.date().iso().required(),
    usageLimit: Joi.number().integer().min(1),
    applicableToDeals: Joi.boolean(),
  }),

  discountUpdate: Joi.object({
    code: Joi.string().min(1).max(50),
    discountType: Joi.string().valid("Percentage", "Fixed", "percentage", "fixed"),
    discountValue: Joi.number().positive(),
    minOrder: Joi.number().min(0).allow(null),
    expiryDate: Joi.date().iso(),
    usageLimit: Joi.number().integer().min(1),
    applicableToDeals: Joi.boolean(),
  }).min(1),

  promo: Joi.object({
    code: Joi.string().min(1).max(50).required(),
    discountType: Joi.string().valid("Percentage", "Fixed", "percentage", "fixed").required(),
    discountValue: Joi.number().positive().required(),
    minOrder: Joi.number().min(0).allow(null),
    expiryDate: Joi.date().iso().required(),
  }),

  promoUpdate: Joi.object({
    code: Joi.string().min(1).max(50),
    discountType: Joi.string().valid("Percentage", "Fixed", "percentage", "fixed"),
    discountValue: Joi.number().positive(),
    minOrder: Joi.number().min(0).allow(null),
    expiryDate: Joi.date().iso(),
  }).min(1),
};
