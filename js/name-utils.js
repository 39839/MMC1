// Name Utilities - Consistent display names derived from email addresses
// Shared between UI and Firebase modules

const EMAIL_NAME_MAPPINGS = {
  // Core family & community
  'yair': 'Yair Ben-Dor',
  'yairben-dor': 'Yair Ben-Dor',
  'yair bend or': 'Yair Ben-Dor',
  'naama': 'Naama Ben-Dor',
  'naama ben dor': 'Naama Ben-Dor',
  'naama bendor': 'Naama Ben-Dor',
  'naama bendor1': 'Naama Ben-Dor',

  // Parents & siblings
  'bendoryair': 'Yair Ben-Dor',
  'bendor': 'Ben-Dor Family',
  'bendorfamily': 'Ben-Dor Family',

  // Friends
  'loripreci': 'Lori Preci',
  'lorip': 'Lori Preci',
  'lorraine': 'Lori Preci',

  'stone': 'Daniel Stone',
  'daniel': 'Daniel Stone',
  'danielstone': 'Daniel Stone',
  'stoneda4': 'Daniel Stone',
  'stoneda': 'Daniel Stone',

  'erezroy8': 'Erez Yarden',
  'erez yarden': 'Erez Yarden',
  'erezroy': 'Erez Yarden',

  'ava': 'Ava Uditsky',
  'avauditsky': 'Ava Uditsky',

  'sas562': 'Stephanie Solomon'
};

function capitalizeWord(word) {
  if (!word) {
    return '';
  }

  if (word.includes('-')) {
    return word
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('-');
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Attempt to intelligently split concatenated names (e.g., "loripreci")
function splitConcatenatedName(localPart) {
  if (!localPart || localPart.length < 6) {
    return null;
  }

  for (let splitPos = 3; splitPos < localPart.length - 1; splitPos++) {
    const firstName = localPart.substring(0, splitPos);
    const lastName = localPart.substring(splitPos);

    if (firstName.length <= 2 || lastName.length <= 1 || lastName.length > 5) {
      continue;
    }

    if (lastName.length >= 2 && lastName.length <= 4) {
      return `${capitalizeWord(firstName)} ${capitalizeWord(lastName)}`;
    }
  }

  return null;
}

export function getDisplayNameFromEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Anonymous';
  }

  let localPart = email.split('@')[0].toLowerCase();

  // Remove trailing numbers (e.g., naama1 -> naama)
  localPart = localPart.replace(/\d+$/, '').trim();

  if (!localPart) {
    return 'Anonymous';
  }

  if (EMAIL_NAME_MAPPINGS[localPart]) {
    return EMAIL_NAME_MAPPINGS[localPart];
  }

  if (localPart.includes('.')) {
    const parts = localPart
      .split('.')
      .map((part) => capitalizeWord(part))
      .filter((part) => part.length > 0);

    if (parts.length > 0) {
      return parts.join(' ');
    }
  }

  if (localPart.includes('_')) {
    const parts = localPart
      .split('_')
      .map((part) => capitalizeWord(part))
      .filter((part) => part.length > 0);

    if (parts.length > 0) {
      return parts.join(' ');
    }
  }

  if (localPart.includes('-')) {
    const parts = localPart
      .split('-')
      .map((part) => capitalizeWord(part))
      .filter((part) => part.length > 0);

    if (parts.length > 0) {
      return parts.join('-');
    }
  }

  const splitResult = splitConcatenatedName(localPart);
  if (splitResult) {
    return splitResult;
  }

  return capitalizeWord(localPart);
}

