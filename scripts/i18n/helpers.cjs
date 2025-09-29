// Function to flatten nested JSON object
function flattenObject(obj, prefix = '') {
  const result = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

// Function to unflatten a flat object back to nested structure
function unflattenObject(flatObj) {
  const result = {};

  for (const flatKey in flatObj) {
    const keys = flatKey.split('.');
    let current = result;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (i === keys.length - 1) {
        // Last key - set the value
        current[key] = flatObj[flatKey];
      } else {
        // Intermediate key - create object if it doesn't exist
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }
    }
  }

  return result;
}

// Function to sort object keys alphabetically (recursive)
function sortObjectKeys(obj) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj;
  }

  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    sorted[key] = sortObjectKeys(obj[key]);
  }

  return sorted;
}

module.exports = {
  flattenObject,
  unflattenObject,
  sortObjectKeys,
};
