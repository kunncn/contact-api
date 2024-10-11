const { body } = require("express-validator");

const userValidationRules = () => [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("password_confirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
];

const loginValidationRules = () => [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const editAccountValidationRules = () => [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("password_confirmation")
    .optional()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
];

const contactValidationRules = () => [
  body("name").notEmpty().withMessage("Name is required"),
  body("phone").isNumeric().withMessage("Phone must be a number"),
];

module.exports = {
  userValidationRules,
  loginValidationRules,
  editAccountValidationRules,
  contactValidationRules,
};
