export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  hours: string;
}

let contactData: ContactInfo = {
  email: "info@leafly.pk",
  phone: "+92 300 123 4567",
  address: "123 Garden Street, Model Town, Lahore, Pakistan",
  hours: "Mon–Sat, 9am–6pm PKT",
};

export function getContact(): ContactInfo {
  return { ...contactData };
}

export function setContact(updates: Partial<ContactInfo>): ContactInfo {
  contactData = { ...contactData, ...updates };
  return { ...contactData };
}
