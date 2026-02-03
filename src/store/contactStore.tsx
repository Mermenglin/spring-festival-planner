import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Contact, ContactFormData } from '@/types';
import { storage, storageKeys } from '@/utils/storage';

interface ContactContextType {
  contacts: Contact[];
  addContact: (data: ContactFormData) => Contact;
  updateContact: (id: string, data: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getContactById: (id: string) => Contact | undefined;
  searchContacts: (keyword: string) => Contact[];
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const ContactProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    return storage.get<Contact[]>(storageKeys.CONTACTS, []);
  });

  const addContact = useCallback((data: ContactFormData): Contact => {
    const newContact: Contact = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updated = [...contacts, newContact];
    setContacts(updated);
    storage.set(storageKeys.CONTACTS, updated);
    return newContact;
  }, [contacts]);

  const updateContact = useCallback((id: string, data: Partial<Contact>) => {
    const updated = contacts.map(contact => 
      contact.id === id 
        ? { ...contact, ...data, updatedAt: new Date() } 
        : contact
    );
    setContacts(updated);
    storage.set(storageKeys.CONTACTS, updated);
  }, [contacts]);

  const deleteContact = useCallback((id: string) => {
    const updated = contacts.filter(contact => contact.id !== id);
    setContacts(updated);
    storage.set(storageKeys.CONTACTS, updated);
  }, [contacts]);

  const getContactById = useCallback((id: string) => {
    return contacts.find(contact => contact.id === id);
  }, [contacts]);

  const searchContacts = useCallback((keyword: string) => {
    if (!keyword) return contacts;
    const lowerKeyword = keyword.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowerKeyword) ||
      contact.relationship.toLowerCase().includes(lowerKeyword) ||
      (contact.phone && contact.phone.includes(keyword)) ||
      (contact.address && contact.address.toLowerCase().includes(lowerKeyword))
    );
  }, [contacts]);

  return (
    <ContactContext.Provider 
      value={{
        contacts,
        addContact,
        updateContact,
        deleteContact,
        getContactById,
        searchContacts,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContact = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within ContactProvider');
  }
  return context;
};