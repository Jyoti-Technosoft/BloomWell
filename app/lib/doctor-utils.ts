export function getDoctorSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
}

export function getDoctorNameFromSlug(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace('Dr ', 'Dr. ');
}