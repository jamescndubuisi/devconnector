const isEmpty = require("./is_empty");
const Validator = require("validator");
module.exports = function validateProfileInput(data) {
    let errors = {};

    data.handle = !isEmpty(data.handle) ? data.handle : "";
    data.status = !isEmpty(data.status) ? data.status : "";
    data.skills = !isEmpty(data.skills) ? data.skills : "";

    if (!Validator.isLength(data.handle, { min: 2, max: 40 })) {
        errors.handle = "Handle needs to be between 2 and 40 characters";
    }
    if (Validator.isEmpty(data.handle)) {
        errors.handle = "Handle required";
    }
    if (Validator.isEmpty(data.status)) {
        errors.status = "status required";
    }
    if (Validator.isEmpty(data.skills)) {
        errors.skills = "skills required";
    }
    if (!isEmpty(data.website)) {
        if (!Validator.isUrl(data.website)) {
            errors.website = "Not a valid url";
        }
    }
    if (!isEmpty(data.linkedin)) {
        if (!Validator.isUrl(data.linkedin)) {
            errors.linkedin = "Not a valid url";
        }
    }
    if (!isEmpty(data.twitter)) {
        if (!Validator.isUrl(data.twitter)) {
            errors.twitter = "Not a valid url";
        }
    }
    if (!isEmpty(data.instagram)) {
        if (!Validator.isUrl(data.instagram)) {
            errors.instagram = "Not a valid url";
        }
    }
    if (!isEmpty(data.facebook)) {
        if (!Validator.isUrl(data.facebook)) {
            errors.facebook = "Not a valid url";
        }
    }
    if (!isEmpty(data.youtube)) {
        if (!Validator.isUrl(data.youtube)) {
            errors.youtube = "Not a valid url";
        }
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};