// Phone number validation utilities for different countries

export interface CountryPhoneConfig {
  code: string;
  name: string;
  pattern: RegExp;
  maxLength: number;
  minLength: number;
  example: string;
  format: string;
}

export const COUNTRY_PHONE_CONFIGS: Record<string, CountryPhoneConfig> = {
  // North America
  'US': {
    code: 'US',
    name: 'United States',
    pattern: /^\+1\d{10}$/,
    maxLength: 11,
    minLength: 11,
    example: '+1 (555) 123-4567',
    format: '+1 (XXX) XXX-XXXX'
  },
  'CA': {
    code: 'CA',
    name: 'Canada',
    pattern: /^\+1\d{10}$/,
    maxLength: 11,
    minLength: 11,
    example: '+1 (416) 123-4567',
    format: '+1 (XXX) XXX-XXXX'
  },
  
  // Europe
  'GB': {
    code: 'GB',
    name: 'United Kingdom',
    pattern: /^\+44\d{10}$/,
    maxLength: 12,
    minLength: 12,
    example: '+44 20 7123 4567',
    format: '+44 XX XXXX XXXX'
  },
  'DE': {
    code: 'DE',
    name: 'Germany',
    pattern: /^\+49\d{10,11}$/,
    maxLength: 12,
    minLength: 11,
    example: '+49 30 1234567',
    format: '+49 XXX XXXXXXX'
  },
  'FR': {
    code: 'FR',
    name: 'France',
    pattern: /^\+33\d{9}$/,
    maxLength: 11,
    minLength: 11,
    example: '+33 1 23 45 67 89',
    format: '+33 X XX XX XX XX'
  },
  'IT': {
    code: 'IT',
    name: 'Italy',
    pattern: /^\+39\d{9,10}$/,
    maxLength: 11,
    minLength: 11,
    example: '+39 02 1234 5678',
    format: '+39 XX XXXX XXXX'
  },
  'ES': {
    code: 'ES',
    name: 'Spain',
    pattern: /^\+34\d{9}$/,
    maxLength: 11,
    minLength: 11,
    example: '+34 91 123 45 67',
    format: '+34 XXX XXX XX XX'
  },
  'NL': {
    code: 'NL',
    name: 'Netherlands',
    pattern: /^\+31\d{9}$/,
    maxLength: 11,
    minLength: 11,
    example: '+31 20 123 4567',
    format: '+31 XX XXX XXXX'
  },
  
  // Asia Pacific
  'AU': {
    code: 'AU',
    name: 'Australia',
    pattern: /^\+61\d{9}$/,
    maxLength: 11,
    minLength: 11,
    example: '+61 2 1234 5678',
    format: '+61 X XXXX XXXX'
  },
  'NZ': {
    format: '+64 X XXX XXXX',
    code: 'NZ',
    name: 'New Zealand',
    pattern: /^\+64\d{8,9}$/,
    maxLength: 11,
    minLength: 10,
    example: '+64 9 123 4567',
  },
  'SG': {
    code: 'SG',
    name: 'Singapore',
    pattern: /^\+65\d{8}$/,
    maxLength: 10,
    minLength: 10,
    example: '+65 1234 5678',
    format: '+65 XXXX XXXX'
  },
  'IN': {
    code: 'IN',
    name: 'India',
    pattern: /^\+91\d{10}$/,
    maxLength: 12,
    minLength: 12,
    example: '+91 98765 43210',
    format: '+91 XXXXX XXXXX'
  },
  'JP': {
    code: 'JP',
    name: 'Japan',
    pattern: /^\+81\d{9,10}$/,
    maxLength: 11,
    minLength: 11,
    example: '+81 3 1234 5678',
    format: '+81 X XXXX XXXX'
  },
  'CN': {
    code: 'CN',
    name: 'China',
    pattern: /^\+86\d{11}$/,
    maxLength: 12,
    minLength: 12,
    example: '+86 138 1234 5678',
    format: '+86 XXX XXXX XXXX'
  },
  
  // Middle East
  'AE': {
    code: 'AE',
    name: 'United Arab Emirates',
    pattern: /^\+971\d{8,9}$/,
    maxLength: 11,
    minLength: 11,
    example: '+971 50 123 4567',
    format: '+971 XX XXX XXXX'
  },
  'SA': {
    code: 'SA',
    name: 'Saudi Arabia',
    pattern: /^\+966\d{9}$/,
    maxLength: 11,
    minLength: 11,
    example: '+966 50 123 4567',
    format: '+966 XX XXX XXXX'
  },
  
  // South America
  'BR': {
    code: 'BR',
    name: 'Brazil',
    pattern: /^\+55\d{10,11}$/,
    maxLength: 12,
    minLength: 11,
    example: '+55 11 1234 5678',
    format: '+55 XX XXXX XXXX'
  },
  'AR': {
    code: 'AR',
    name: 'Argentina',
    pattern: /^\+54\d{10}$/,
    maxLength: 11,
    minLength: 11,
    example: '+54 11 1234 5678',
    format: '+54 XX XXXX XXXX'
  },
  
  // Africa
  'ZA': {
    code: 'ZA',
    name: 'South Africa',
    pattern: /^\+27\d{9}$/,
    maxLength: 11,
    minLength: 11,
    example: '+27 11 123 4567',
    format: '+27 XX XXX XXXX'
  }
};

export function validatePhoneNumber(phone: string, countryCode?: string): {
  isValid: boolean;
  error?: string;
  config?: CountryPhoneConfig;
} {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  // If country code is provided, use country-specific validation
  if (countryCode && COUNTRY_PHONE_CONFIGS[countryCode]) {
    const config = COUNTRY_PHONE_CONFIGS[countryCode];
    
    if (!config.pattern.test(phone)) {
      return {
        isValid: false,
        error: `Invalid ${config.name} phone number format. Expected format: ${config.format}`,
        config
      };
    }
    
    if (cleanPhone.length < config.minLength || cleanPhone.length > config.maxLength) {
      return {
        isValid: false,
        error: `Phone number must be between ${config.minLength} and ${config.maxLength} digits for ${config.name}`,
        config
      };
    }
    
    return { isValid: true, config };
  }

  // General international validation if no specific country
  const internationalPattern = /^\+\d{7,15}$/;
  if (!internationalPattern.test(phone)) {
    return {
      isValid: false,
      error: 'Invalid international phone number format. Must start with + and contain 7-15 digits'
    };
  }

  if (cleanPhone.length < 8 || cleanPhone.length > 16) {
    return {
      isValid: false,
      error: 'Phone number must be between 8 and 15 digits'
    };
  }

  return { isValid: true };
}

export function getCountryPhoneConfig(countryCode: string): CountryPhoneConfig | null {
  return COUNTRY_PHONE_CONFIGS[countryCode] || null;
}

export function getSupportedCountries(): CountryPhoneConfig[] {
  return Object.values(COUNTRY_PHONE_CONFIGS);
}

export function formatPhoneNumber(phone: string, countryCode?: string): string {
  if (!countryCode || !COUNTRY_PHONE_CONFIGS[countryCode]) {
    return phone;
  }

  const config = COUNTRY_PHONE_CONFIGS[countryCode];
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Basic formatting - you can enhance this based on country
  if (countryCode === 'US' || countryCode === 'CA') {
    // Format: +1 (XXX) XXX-XXXX
    if (cleanPhone.length === 11) {
      return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
    }
  }
  
  return phone;
}
